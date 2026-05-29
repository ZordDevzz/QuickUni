"use server";

import { db } from "@/db";
import { onboardingSession, systemAuditLog, profileSchemaField, mainClass } from "@/db/schema";
import { getAuthSession } from "@/services/auth";
import { parseAndValidateOnboardingExcel } from "@/services/excel";
import { 
  createProfileWorkflow, 
  linkProfileToEntity, 
  issueAccountWorkflow 
} from "@/services/onboarding";
import { isAdmin } from "@/services/user";
import { randomUUID } from "crypto";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import { OnboardingSummary } from "@/types/onboarding";

/**
 * Result type for onboarding actions
 */
export type ActionResponse = {
  success: boolean;
  error?: string;
  sessionId?: string;
  summary?: OnboardingSummary;
};

async function checkAdmin() {
  const session = await getAuthSession();
  if (!session?.user?.id) throw new Error("Unauthorized");
  
  const admin = await isAdmin(session.user.id);
  if (!admin) throw new Error("Forbidden: Admin access required");
  
  return session.user.id;
}

export async function createOnboardingSession(data: { 
  name: string, 
  entityType: 'student' | 'employee', 
  schemaId: number 
}): Promise<ActionResponse> {
  try {
    const userId = await checkAdmin();

    const sessionId = randomUUID();
    await db.insert(onboardingSession).values({
      id: sessionId,
      name: data.name,
      entityType: data.entityType,
      schemaId: data.schemaId,
      status: 'draft',
      createBy: userId,
    });

    await db.insert(systemAuditLog).values({
      actorId: userId,
      action: "create_onboarding_session",
      targetResource: "onboarding_session",
      targetId: sessionId,
      payload: data,
    });

    revalidatePath("/admin/onboarding");
    return { success: true, sessionId };
  } catch (error: unknown) {
    return { 
      success: false, 
      error: error instanceof Error ? (error as Error).message : "Failed to create onboarding session" 
    };
  }
}

export async function validateOnboardingExcel(sessionId: string, formData: FormData): Promise<ActionResponse> {
  try {
    const userId = await checkAdmin();

    const file = formData.get("file") as File;
    if (!file) throw new Error("No file uploaded");

    const buffer = Buffer.from(await file.arrayBuffer());

    const session = await db.query.onboardingSession.findFirst({
      where: eq(onboardingSession.id, sessionId),
    });
    if (!session) throw new Error("Session not found");

    const schemaFields = await db.query.profileSchemaField.findMany({
      where: eq(profileSchemaField.schemaId, session.schemaId),
      with: {
        profileField: true,
      }
    });

    const fields = schemaFields.map(sf => ({
      label: sf.profileField?.label || sf.profileField?.name || "Unknown",
      name: sf.profileField?.name || "unknown",
      isRequired: sf.isRequired,
    }));

    const validationResults = await parseAndValidateOnboardingExcel(buffer, fields);

    const total = validationResults.length;
    const validCount = validationResults.filter(r => r.isValid).length;
    const errorCount = total - validCount;

    const summary = {
      total,
      valid: validCount,
      error: errorCount,
      results: validationResults,
    };

    await db.update(onboardingSession)
      .set({
        summary,
        status: validCount > 0 ? "ready" : "validating",
        updateBy: userId,
        updateAt: new Date().toISOString(),
      })
      .where(eq(onboardingSession.id, sessionId));

    revalidatePath(`/admin/onboarding/${sessionId}`);
    return { success: true, summary };
  } catch (error: unknown) {
    return { 
      success: false, 
      error: error instanceof Error ? (error as Error).message : "Failed to validate onboarding excel" 
    };
  }
}

export async function executeOnboardingSession(sessionId: string): Promise<ActionResponse> {
  try {
    const userId = await checkAdmin();

    const headerList = await headers();
    const ipAddress = headerList.get("x-forwarded-for")?.split(",")[0] || null;
    const userAgent = headerList.get("user-agent");

    const session = await db.query.onboardingSession.findFirst({
      where: eq(onboardingSession.id, sessionId),
    });
    if (!session) throw new Error("Session not found");
    if (session.status !== "ready" && session.status !== "failed") {
       throw new Error(`Session is not ready for execution (current status: ${session.status})`);
    }

    const summary = session.summary as unknown as OnboardingSummary;
    if (!summary || !summary.results) throw new Error("No validated data found");

    await db.update(onboardingSession)
      .set({ status: "processing" })
      .where(eq(onboardingSession.id, sessionId));

    let successCount = 0;
    let failCount = 0;
    const finalResults = [];

    const totalValid = summary.valid;
    let processedCount = 0;

    for (const row of summary.results) {
      if (!row.isValid) {
          finalResults.push({ ...row, processed: false, error: "Skipped (invalid)" });
          continue;
      }

      try {
        const rowData = row.data;
        
        // Handle Gender enum mapping supporting both VN and EN
        let genderValue: "male" | "female" | "others" = "others";
        const rawGender = (rowData["Giới tính"] || rowData["Gender"])?.toString().toLowerCase();
        if (rawGender === "male" || rawGender === "nam") genderValue = "male";
        else if (rawGender === "female" || rawGender === "nữ") genderValue = "female";

        // Handle DOB format
        let dobValue = rowData["Ngày sinh"] || rowData["DOB"];
        if (dobValue instanceof Date) {
          dobValue = dobValue.toISOString().split('T')[0];
        } else if (typeof dobValue === "string") {
          const cleanDob = dobValue.trim();
          // Match DD-MM-YYYY or DD/MM/YYYY (allowing 1 or 2 digit day/month, and 4 digit year)
          const dmyMatch = cleanDob.match(/^(\d{1,2})[-/](\d{1,2})[-/](\d{4})$/);
          if (dmyMatch) {
            const [_, d, m, y] = dmyMatch;
            dobValue = `${y}-${m.padStart(2, '0')}-${d.padStart(2, '0')}`;
          } else {
            try {
              dobValue = new Date(cleanDob).toISOString().split('T')[0];
            } catch (err) {
              throw new Error(`Định dạng ngày sinh không hợp lệ: "${cleanDob}". Vui lòng dùng DD-MM-YYYY hoặc YYYY-MM-DD.`);
            }
          }
        }

        // 1. Create Profile
        const profile = await createProfileWorkflow({
          id: randomUUID(),
          fullname: (rowData["Họ và tên"] || rowData["Full Name"]) as string,
          gender: genderValue,
          dob: dobValue as string,
          nationalId: (rowData["Số CCCD/Hộ chiếu"] || rowData["National ID"])?.toString() || "",
          address: (rowData["Địa chỉ"] || rowData["Address"]) as string,
          ethnic: (rowData["Dân tộc"] || rowData["Ethnic"]) as string,
          religious: (rowData["Tôn giáo"] || rowData["Religious"]) as string,
          schemaId: session.schemaId,
          dynamicData: rowData,
          sessionId: session.id,
        });

        // 2. Link Profile to Entity
        let classId = null;
        const rawClassCode = rowData["Mã lớp hành chính"] || rowData["Class Code"];
        if (session.entityType === "student" && rawClassCode) {
          const cCode = rawClassCode.toString().trim();
          const foundClass = await db.query.mainClass.findFirst({
            where: eq(mainClass.code, cCode),
          });
          if (foundClass) {
            classId = foundClass.id;
          } else {
            throw new Error(`Class Code "${cCode}" not found in system.`);
          }
        }

        const rawEntityCode = rowData["Mã định danh"] || rowData["Entity Code"];
        await linkProfileToEntity(profile.id, session.entityType as "student" | "employee", {
          code: rawEntityCode?.toString() || "",
          classId,
        });

        // 3. Issue Account
        const username = rawEntityCode?.toString() || "";
        const rawNationalId = rowData["Số CCCD/Hộ chiếu"] || rowData["National ID"];
        const password = rawNationalId?.toString() || rawEntityCode?.toString() || "";
        await issueAccountWorkflow(
          {
            username,
            password,
            type: session.entityType as "student" | "employee",
            status: "active",
          },
          profile.id,
          {
            performedBy: userId,
            ipAddress,
            userAgent,
          }
        );

        successCount++;
        finalResults.push({ ...row, processed: true });
      } catch (e: unknown) {
        failCount++;
        const errorMessage = e instanceof Error ? e.message : "Processing failed";
        finalResults.push({ ...row, processed: false, error: errorMessage });
      }

      processedCount++;
      // Update DB every 5 rows or at the end of valid rows to show progress
      if (processedCount % 5 === 0 || processedCount === totalValid) {
        await db.update(onboardingSession)
          .set({
            summary: {
              ...summary,
              success: successCount,
              failed: failCount,
              currentProcessed: processedCount,
            }
          })
          .where(eq(onboardingSession.id, sessionId));
      }
    }

    const finalSummary = {
      ...summary,
      success: successCount,
      failed: failCount,
      executionResults: finalResults,
    };

    await db.update(onboardingSession)
      .set({
        status: failCount === 0 ? "completed" : "failed",
        summary: finalSummary,
        updateBy: userId,
        updateAt: new Date().toISOString(),
      })
      .where(eq(onboardingSession.id, sessionId));

    await db.insert(systemAuditLog).values({
      actorId: userId,
      action: "execute_onboarding_session",
      targetResource: "onboarding_session",
      targetId: sessionId,
      payload: { successCount, failCount },
    });

    revalidatePath(`/admin/onboarding/${sessionId}`);
    return { success: true, summary: finalSummary };
  } catch (error: unknown) {
    return { 
      success: false, 
      error: error instanceof Error ? (error as Error).message : "Failed to execute onboarding session" 
    };
  }
}

export async function getSessionAction(sessionId: string): Promise<ActionResponse & { data?: typeof onboardingSession.$inferSelect }> {
  try {
    await checkAdmin();

    const session = await db.query.onboardingSession.findFirst({
      where: eq(onboardingSession.id, sessionId),
    });

    if (!session) throw new Error("Session not found");

    return { success: true, data: session };
  } catch (error: unknown) {
    return { 
      success: false, 
      error: error instanceof Error ? (error as Error).message : "Failed to fetch session" 
    };
  }
}

export async function getSessionsAction(): Promise<ActionResponse & { data?: unknown[] }> {
  try {
    await checkAdmin();

    const sessions = await db.query.onboardingSession.findMany({
      orderBy: (sessions, { desc }) => [desc(sessions.createAt)],
    });

    return { success: true, data: sessions };
  } catch (error: unknown) {
    return { 
      success: false, 
      error: error instanceof Error ? (error as Error).message : "Failed to fetch sessions" 
    };
  }
}

export async function deleteOnboardingSessionAction(sessionId: string): Promise<ActionResponse> {
  try {
    await checkAdmin();

    await db.delete(onboardingSession).where(eq(onboardingSession.id, sessionId));

    revalidatePath("/admin/onboarding");
    return { success: true };
  } catch (error: unknown) {
    return { 
      success: false, 
      error: error instanceof Error ? (error as Error).message : "Failed to delete session" 
    };
  }
}
