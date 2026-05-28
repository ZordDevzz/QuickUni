"use server";

import { db } from "@/db";
import { request, notification, notificationRecipient } from "@/db/schemas/communication";
import { courseClass, enrollment } from "@/db/schemas/course";
import { account } from "@/db/schemas/auth";
import { profile, student } from "@/db/schemas/user";
import { schedule, attendanceStatus, room } from "@/db/schemas/schedule";
import { subject } from "@/db/schemas/academic";
import { enumRequestType, enumWorkflowStatus } from "@/db/schemas/enums";
import { eq, or, and, isNull, sql } from "drizzle-orm";
import { getServerSession } from "next-auth";
import { authOptions } from "@/services/auth";
import { randomUUID } from "crypto";
import { revalidatePath } from "next/cache";

type RequestType = (typeof enumRequestType.enumValues)[number];
type WorkflowStatus = (typeof enumWorkflowStatus.enumValues)[number];

/**
 * Submits a new request to the system.
 * Handles targetId lookup for specific request types.
 */
export async function submitRequest(type: RequestType, data: unknown) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) throw new Error("Unauthorized");

  let targetId: string | null = null;
  
  // Logic to find targetId for student_absence
  if (type === 'student_absence') {
    const reqData = data as { classId?: string };
    if (!reqData.classId) throw new Error("Missing classId for student_absence");
    
    // Find the teacherId for the given course class
    const classInfo = await db.query.courseClass.findFirst({
      where: eq(courseClass.id, reqData.classId)
    });
    
    if (classInfo) {
      targetId = classInfo.teacherId;
    } else {
      throw new Error("Course class not found");
    }
  }

  // Insert the new request into the database
  const [result] = await db.insert(request).values({
    id: randomUUID(),
    senderId: session.user.id,
    type: type,
    targetId: targetId,
    data: data as Record<string, unknown>,
    status: 'pending'
  }).returning();

  // Create notification for targetId (the reviewer)
  if (targetId) {
    const notificationId = randomUUID();
    await db.insert(notification).values({
      id: notificationId,
      actorId: session.user.id,
      title: type === 'student_absence' ? "New Student Absence Request" : "New Workflow Request",
      body: `You have a new ${type.replace('_', ' ')} to review.`,
      data: { requestId: result.id }
    });

    await db.insert(notificationRecipient).values({
      notificationId: notificationId,
      recipientId: targetId,
      channel: 'in_app',
      createAt: new Date().toISOString()
    });
  }

  // Revalidate paths to update UI
  revalidatePath("/[locale]/student/requests", "page");
  revalidatePath("/[locale]/teacher/requests", "page");
  revalidatePath("/[locale]/academic/requests", "page");
  
  return result;
}

/**
 * Fetches requests submitted by the current user.
 */
export async function getStudentRequests() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) throw new Error("Unauthorized");

  const userId = session.user.id;

  const results = await db.select({
    id: request.id,
    type: request.type,
    status: request.status,
    data: request.data,
    comment: request.comment,
    createAt: request.createAt,
    updateAt: request.updateAt,
    processedAt: request.processedAt,
    processedBy: request.processedBy,
    classCode: courseClass.code,
    subjectName: subject.name
  })
  .from(request)
  .leftJoin(courseClass, eq(courseClass.id, sql`(${request.data}->>'classId')::uuid`))
  .leftJoin(subject, eq(subject.id, courseClass.subjectId))
  .where(eq(request.senderId, userId))
  .orderBy(request.createAt);

  return results;
}

/**
 * Fetches requests that the current user is responsible for reviewing.
 */
export async function getRequestsForReviewer() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) throw new Error("Unauthorized");

  const userId = session.user.id;
  const userRoles = (session.user as any).roles || [];

  // Reviewers can see requests directly targeted to them
  const conditions = [eq(request.targetId, userId)];
  
  // Academic/PĐT (Academic Office role 4) can also see general requests (targetId is NULL)
  if (userRoles.includes(4)) {
     conditions.push(isNull(request.targetId));
  }

  const results = await db.select({
    id: request.id,
    type: request.type,
    status: request.status,
    data: request.data,
    comment: request.comment,
    createAt: request.createAt,
    targetId: request.targetId,
    sender: {
      id: account.id,
      username: account.username,
      fullname: profile.fullname
    },
    classCode: courseClass.code,
    subjectName: subject.name
  })
  .from(request)
  .innerJoin(account, eq(request.senderId, account.id))
  .innerJoin(profile, eq(account.id, profile.accountId))
  .leftJoin(courseClass, eq(courseClass.id, sql`(${request.data}->>'classId')::uuid`))
  .leftJoin(subject, eq(subject.id, courseClass.subjectId))
  .where(or(...conditions))
  .orderBy(request.createAt);

  return results;
}

/**
 * Processes a request by updating its status and comment.
 * Triggers side effects for approved requests.
 */
export async function processRequest(requestId: string, status: WorkflowStatus, comment?: string) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) throw new Error("Unauthorized");

  const [result] = await db.update(request)
    .set({
      status: status,
      comment: comment,
      processedBy: session.user.id,
      processedAt: new Date().toISOString(),
      updateAt: new Date().toISOString()
    })
    .where(eq(request.id, requestId))
    .returning();

  // Create notification for senderId (the original requester) informing them of the outcome
  const notifId = randomUUID();
  await db.insert(notification).values({
    id: notifId,
    actorId: session.user.id,
    title: "Request Update",
    body: `Your request for ${result.type.replace('_', ' ')} has been ${status}.`,
    data: { requestId: result.id, status }
  });

  await db.insert(notificationRecipient).values({
    notificationId: notifId,
    recipientId: result.senderId,
    channel: 'in_app',
    createAt: new Date().toISOString()
  });

  // Trigger side effects for approved requests
  if (status === 'approved') {
    if (result.type === 'student_absence') {
      const reqData = result.data as { classId?: string; date?: string; scheduleId?: string | number; reason?: string };
      let scheduleId = reqData.scheduleId ? (typeof reqData.scheduleId === 'string' ? parseInt(reqData.scheduleId) : reqData.scheduleId) : null;
      
      if (!scheduleId && reqData.classId && reqData.date) {
        const slot = await db.query.schedule.findFirst({
          where: and(
            eq(schedule.courseClassId, reqData.classId),
            eq(schedule.schDate, reqData.date),
            isNull(schedule.deletedAt)
          )
        });
        if (slot) {
          scheduleId = slot.id;
        }
      }

      if (scheduleId && reqData.classId) {
        // Find studentId linked to the sender's account
        const studentRec = await db.select({ id: student.id })
          .from(student)
          .innerJoin(profile, eq(student.profileId, profile.id))
          .where(eq(profile.accountId, result.senderId))
          .limit(1);

        if (studentRec.length > 0) {
          const studentId = studentRec[0].id;

          // Find enrollment record
          const enrollRec = await db.query.enrollment.findFirst({
            where: and(
              eq(enrollment.studentId, studentId),
              eq(enrollment.courseClassId, reqData.classId),
              isNull(enrollment.deletedAt)
            )
          });

          if (enrollRec) {
            const enrollId = enrollRec.id;

            // Check if attendance status already exists
            const existingAttendance = await db.query.attendanceStatus.findFirst({
              where: and(
                eq(attendanceStatus.enrollId, enrollId),
                eq(attendanceStatus.scheduleId, scheduleId)
              )
            });

            const reasonNote = comment || reqData.reason || "Nghỉ học có phép (Đã duyệt)";

            if (existingAttendance) {
              await db.update(attendanceStatus)
                .set({
                  state: 'excused',
                  note: reasonNote,
                  updateAt: new Date().toISOString()
                })
                .where(and(
                  eq(attendanceStatus.enrollId, enrollId),
                  eq(attendanceStatus.scheduleId, scheduleId)
                ));
            } else {
              await db.insert(attendanceStatus).values({
                enrollId: enrollId,
                scheduleId: scheduleId,
                state: 'excused',
                note: reasonNote,
                createAt: new Date().toISOString(),
                updateAt: new Date().toISOString()
              });
            }
            console.log(`[Workflow] Set attendance to excused for enrollment ${enrollId}, schedule slot ${scheduleId}`);
          }
        }
      }
    } else if (result.type === 'class_cancellation') {
       // Side Effect: Soft-delete enrollment and decrement currentSlot in course_class (Student withdrawing)
       const reqData = result.data as { classId?: string };
       if (reqData && reqData.classId) {
         const classId = reqData.classId;
         
         // Find studentId linked to the sender's account
         const studentRec = await db.select({ id: student.id })
           .from(student)
           .innerJoin(profile, eq(student.profileId, profile.id))
           .where(eq(profile.accountId, result.senderId))
           .limit(1);
           
         if (studentRec.length > 0) {
           const studentId = studentRec[0].id;
           
           // Soft-delete enrollment record
           await db.update(enrollment)
             .set({ deletedAt: new Date().toISOString() })
             .where(and(
               eq(enrollment.studentId, studentId),
               eq(enrollment.courseClassId, classId),
               isNull(enrollment.deletedAt)
             ));
             
           // Decrement current student count in the class
           await db.update(courseClass)
             .set({ currentSlot: sql`${courseClass.currentSlot} - 1` })
             .where(eq(courseClass.id, classId));
             
           console.log(`[Workflow] Processed class withdrawal side effects for student ${studentId} in class ${classId}`);
         }
       }
    } else if (result.type === 'teacher_schedule_change') {
       // Side Effect: Update schedule table with the new date, periods, and room
       const reqData = result.data as {
         scheduleId?: string | number;
         newDate?: string;
         newStartPeriod?: string | number;
         newEndPeriod?: string | number;
         newRoomId?: string | number;
       };

       const scheduleId = reqData.scheduleId ? (typeof reqData.scheduleId === 'string' ? parseInt(reqData.scheduleId) : reqData.scheduleId) : null;
       const startPeriod = reqData.newStartPeriod ? (typeof reqData.newStartPeriod === 'string' ? parseInt(reqData.newStartPeriod) : reqData.newStartPeriod) : null;
       const endPeriod = reqData.newEndPeriod ? (typeof reqData.newEndPeriod === 'string' ? parseInt(reqData.newEndPeriod) : reqData.newEndPeriod) : null;
       const roomId = reqData.newRoomId ? (typeof reqData.newRoomId === 'string' ? parseInt(reqData.newRoomId) : reqData.newRoomId) : null;

       if (scheduleId && reqData.newDate && startPeriod && endPeriod) {
         await db.update(schedule)
           .set({
             schDate: reqData.newDate,
             period: startPeriod,
             endPeriod: endPeriod,
             roomId: roomId || null,
             updateAt: new Date().toISOString()
           })
           .where(eq(schedule.id, scheduleId));
           
         console.log(`[Workflow] Updated schedule slot ${scheduleId} to new Date ${reqData.newDate}, period ${startPeriod}-${endPeriod}`);
       }
    }
  }

  // Revalidate relevant paths
  revalidatePath("/[locale]/academic/requests", "page");
  revalidatePath("/[locale]/teacher/requests", "page");
  revalidatePath("/[locale]/student/requests", "page");
  
  return result;
}

/**
 * Fetches requests submitted by the current teacher.
 */
export async function getTeacherSubmittedRequests() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) throw new Error("Unauthorized");

  const results = await db.select({
    id: request.id,
    type: request.type,
    status: request.status,
    data: request.data,
    comment: request.comment,
    createAt: request.createAt,
    updateAt: request.updateAt,
    processedAt: request.processedAt,
    processedBy: request.processedBy,
    classCode: courseClass.code,
    subjectName: subject.name
  })
  .from(request)
  .leftJoin(courseClass, eq(courseClass.id, sql`(${request.data}->>'classId')::uuid`))
  .leftJoin(subject, eq(subject.id, courseClass.subjectId))
  .where(eq(request.senderId, session.user.id))
  .orderBy(request.createAt);

  return results;
}

/**
 * Fetches all active schedule slots for a class, joining with room information.
 */
export async function getClassScheduleSlots(classId: string) {
  try {
    const results = await db.select({
      id: schedule.id,
      schDate: schedule.schDate,
      period: schedule.period,
      endPeriod: schedule.endPeriod,
      roomId: schedule.roomId,
      roomCode: room.code
    })
    .from(schedule)
    .leftJoin(room, eq(schedule.roomId, room.id))
    .where(and(
      eq(schedule.courseClassId, classId),
      isNull(schedule.deletedAt)
    ))
    .orderBy(schedule.schDate);

    return results.map(s => ({
      id: s.id.toString(),
      schDate: s.schDate,
      period: s.period,
      endPeriod: s.endPeriod ?? s.period,
      roomCode: s.roomCode ?? "N/A"
    }));
  } catch (error) {
    console.error("Error in getClassScheduleSlots:", error);
    return [];
  }
}

/**
 * Fetches all available rooms.
 */
export async function getAllRooms() {
  try {
    return await db.select({
      id: room.id,
      code: room.code,
      capacity: room.capacity
    })
    .from(room)
    .where(eq(room.isAvailable, true))
    .orderBy(room.code);
  } catch (error) {
    console.error("Error in getAllRooms:", error);
    return [];
  }
}

