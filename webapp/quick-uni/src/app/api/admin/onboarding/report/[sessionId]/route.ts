import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { onboardingSession } from "@/db/schema";
import { generateOnboardingReport } from "@/services/excel";
import { eq } from "drizzle-orm";
import { isAdmin } from "@/services/user";
import { getAuthSession } from "@/services/auth";
import { OnboardingSummary } from "@/types/onboarding";

export async function GET(
  _request: NextRequest,
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

    const sessionData = await db.query.onboardingSession.findFirst({
      where: eq(onboardingSession.id, sessionId),
    });

    if (!sessionData) {
      return new NextResponse("Session not found", { status: 404 });
    }

    const summary = sessionData.summary as unknown as OnboardingSummary;
    if (!summary || !summary.executionResults) {
      return new NextResponse("No execution results found", { status: 400 });
    }

    const buffer = await generateOnboardingReport(summary.executionResults);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return new NextResponse(buffer as any, {
      status: 200,
      headers: {
        "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "Content-Disposition": `attachment; filename="onboarding_report_${sessionData.name.replace(/\s+/g, '_')}.xlsx"`,
      },
    });
  } catch (error) {
    console.error("Report generation error:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
