"use server";

import { db } from "@/db";
import { request, notification, notificationRecipient } from "@/db/schemas/communication";
import { courseClass, enrollment } from "@/db/schemas/course";
import { account } from "@/db/schemas/auth";
import { profile, student } from "@/db/schemas/user";
import { eq, or, and, isNull, sql } from "drizzle-orm";
import { getServerSession } from "next-auth";
import { authOptions } from "@/services/auth";
import { randomUUID } from "crypto";
import { revalidatePath } from "next/cache";

/**
 * Submits a new request to the system.
 * Handles targetId lookup for specific request types.
 */
export async function submitRequest(type: string, data: any) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) throw new Error("Unauthorized");

  let targetId: string | null = null;
  
  // Logic to find targetId for student_absence
  if (type === 'student_absence') {
    if (!data.classId) throw new Error("Missing classId for student_absence");
    
    // Find the teacherId for the given course class
    const classInfo = await db.query.courseClass.findFirst({
      where: eq(courseClass.id, data.classId)
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
    type: type as any,
    targetId: targetId as any,
    data: data,
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
  
  return result;
}

/**
 * Fetches requests submitted by the current user.
 */
export async function getStudentRequests() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) throw new Error("Unauthorized");

  const userId = session.user.id;

  const results = await db.select()
    .from(request)
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
  const userType = (session.user as any).type;

  // Reviewers can see requests directly targeted to them
  const conditions = [eq(request.targetId, userId)];
  
  // Academic/PĐT (employees) can also see general requests (targetId is NULL)
  if (userType === 'employee') {
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
    }
  })
  .from(request)
  .innerJoin(account, eq(request.senderId, account.id))
  .innerJoin(profile, eq(account.id, profile.accountId))
  .where(or(...conditions))
  .orderBy(request.createAt);

  return results;
}

/**
 * Processes a request by updating its status and comment.
 * Triggers placeholder logic for side effects.
 */
export async function processRequest(requestId: string, status: string, comment?: string) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) throw new Error("Unauthorized");

  const [result] = await db.update(request)
    .set({
      status: status as any,
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
       // Placeholder: Recording absence in logs
       console.log(`[Workflow] Approved student_absence for request ${requestId}. Recording in attendance logs...`);
    } else if (result.type === 'class_cancellation') {
       // Side Effect: Soft-delete enrollment and decrement currentSlot in course_class
       if (result.data && (result.data as any).classId) {
         const classId = (result.data as any).classId;
         
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
             
           console.log(`[Workflow] Processed class_cancellation side effects for student ${studentId} in class ${classId}`);
         }
       }
    } else if (result.type === 'teacher_schedule_change') {
       // Placeholder: Timetable update logic would reside here or in a dedicated service
       // that updates the 'schedule' table based on the approved change details.
       console.log(`[Workflow] Approved teacher_schedule_change for request ${requestId}. Timetable updates would happen here.`);
    }
  }

  // Revalidate relevant paths
  revalidatePath("/[locale]/academic/requests", "page");
  revalidatePath("/[locale]/teacher/requests", "page");
  revalidatePath("/[locale]/student/requests", "page");
  
  return result;
}
