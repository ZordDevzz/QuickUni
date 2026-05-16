import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { onboardingSession, profileSchemaField } from "@/db/schema";
import { eq } from "drizzle-orm";
import { generateOnboardingTemplate } from "@/services/excel";
import { getAuthSession } from "@/services/auth";
import { isAdmin } from "@/services/user";

export async function GET(
  req: NextRequest,
  { params }: { params: { sessionId: string } }
) {
  try {
    const { sessionId } = await params;
    
    // Check auth
    const session = await getAuthSession();
    if (!session?.user?.id) return new NextResponse("Unauthorized", { status: 401 });
    const admin = await isAdmin(session.user.id);
    if (!admin) return new NextResponse("Forbidden", { status: 403 });

    // Fetch session
    const onboarding = await db.query.onboardingSession.findFirst({
      where: eq(onboardingSession.id, sessionId),
    });

    if (!onboarding) return new NextResponse("Session not found", { status: 404 });

    // Fetch schema fields
    const schemaFields = await db.query.profileSchemaField.findMany({
      where: eq(profileSchemaField.schemaId, onboarding.schemaId),
      with: {
        profileField: true,
      }
    });

    const fields = schemaFields.map(sf => ({
      label: sf.profileField?.label || sf.profileField?.name || "Unknown",
      name: sf.profileField?.name || "unknown",
      isRequired: sf.isRequired,
    }));

    // Generate Excel
    const buffer = await generateOnboardingTemplate(fields);

    return new NextResponse(buffer, {
      status: 200,
      headers: {
        "Content-Disposition": `attachment; filename="onboarding_template_${onboarding.name.replace(/\s+/g, '_')}.xlsx"`,
        "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      },
    });
  } catch (error) {
    console.error("Template download error:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
