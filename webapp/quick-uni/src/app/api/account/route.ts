import { getAuthSession } from "@/services/auth";
import { getUserById, updateAccountWorkflow } from "@/services/user";
import { updateAccountSchema } from "@/lib/validators/account";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
  const session = await getAuthSession(req);
  const accountId = session?.user?.id;
  if (!accountId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const data = await getUserById(accountId);
  if (!data) return NextResponse.json({ error: "Account not found" }, { status: 404 });

  // Exclude password hash from the response
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { pwdHash, ...safeData } = data;
  return NextResponse.json(safeData);
}

export async function PATCH(req: Request) {
  const session = await getAuthSession(req);
  const accountId = session?.user?.id;
  if (!accountId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const validatedData = updateAccountSchema.parse(body);
    const ipAddress = req.headers.get("x-forwarded-for")?.split(",")[0] || null;

    const updated = await updateAccountWorkflow(accountId, validatedData, {
      performedBy: accountId,
      userAgent: req.headers.get("user-agent"),
      ipAddress,
    });

    if (!updated) {
       return NextResponse.json({ error: "Failed to update account" }, { status: 500 });
    }
    
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { pwdHash, ...safeData } = updated;
    return NextResponse.json(safeData);
  } catch (error) {
    if (error instanceof Error) {
      if (error.message === "Account not found") {
        return NextResponse.json({ error: error.message }, { status: 404 });
      }
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
