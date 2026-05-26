import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { onboardingSession } from "@/db/schema";
import { generateOnboardingTemplate } from "@/services/excel";
import { eq } from "drizzle-orm";
import { isAdmin } from "@/services/user";
import { getAuthSession } from "@/services/auth";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ sessionId: string }> }
) {
  try {
    const { sessionId } = await params;

    // Auth & Admin check
    const sessionAuth = await getAuthSession();
    if (!sessionAuth?.user?.id) {
      return new NextResponse("Unauthorized", { status: 401 });
    }
    const admin = await isAdmin(sessionAuth.user.id);
    if (!admin) {
      return new NextResponse("Forbidden", { status: 403 });
    }

    const session = await db.query.onboardingSession.findFirst({
      where: eq(onboardingSession.id, sessionId),
      with: {
        profileSchema: {
          with: {
            profileSchemaFields: {
              with: {
                profileField: true,
              },
            },
          },
        },
      },
    });

    if (!session) {
      return new NextResponse("Session not found", { status: 404 });
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const fields = (session as any).profileSchema?.profileSchemaFields.map((sf: any) => ({
      label: sf.profileField?.label || sf.profileField?.name || "Unknown",
      name: sf.profileField?.name || "unknown",
      isRequired: sf.isRequired,
    })) || [];

    const buffer = await generateOnboardingTemplate(fields);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return new NextResponse(buffer as any, {
      status: 200,
      headers: {
        "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "Content-Disposition": `attachment; filename="onboarding_template_${session.name.replace(/\s+/g, '_')}.xlsx"`,
      },
    });
  } catch (error) {
    console.error("Template generation error:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
