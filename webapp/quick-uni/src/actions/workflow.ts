"use server";

import { db } from "@/db";
import { request } from "@/db/schemas/communication";
import { courseClass } from "@/db/schemas/course";
import { account } from "@/db/schemas/auth";
import { profile } from "@/db/schemas/user";
import { eq, or, and, isNull } from "drizzle-orm";
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

  // Trigger placeholder logic for side effects
  if (status === 'approved') {
    if (result.type === 'student_absence') {
       // Placeholder: Recording absence in logs
       console.log(`[Workflow] Approved student_absence for request ${requestId}. Recording in attendance logs...`);
       // In a real implementation, this would insert into an attendance table or trigger a notification.
    } else if (result.type === 'class_cancellation') {
       console.log(`[Workflow] Approved class_cancellation for request ${requestId}. Notifying students...`);
    }
  }

  // Revalidate relevant paths
  revalidatePath("/[locale]/academic/requests", "page");
  revalidatePath("/[locale]/teacher/requests", "page");
  revalidatePath("/[locale]/student/requests", "page");
  
  return result;
}
