import { getAuthSession } from "@/services/auth";
import { isAdmin, getAccounts, createAccountWorkflow } from "@/services/user";
import { createAccountSchema } from "@/lib/validators/account";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
  const session = await getAuthSession(req);
  if (!session?.user?.id || !(await isAdmin(session.user.id))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  const accounts = await getAccounts();
  // Exclude password hashes
  const safeAccounts = accounts.map(({ pwdHash, ...rest }) => rest);
  return NextResponse.json(safeAccounts);
}

export async function POST(req: Request) {
  const session = await getAuthSession(req);
  if (!session?.user?.id || !(await isAdmin(session.user.id))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  try {
    const body = await req.json();
    const validatedData = createAccountSchema.parse(body);
    const ipAddress = req.headers.get("x-forwarded-for")?.split(",")[0] || null;

    const newAccount = await createAccountWorkflow(validatedData, {
      performedBy: session.user.id,
      userAgent: req.headers.get("user-agent"),
      ipAddress,
    });

    const { pwdHash, ...safeAccount } = newAccount;
    return NextResponse.json(safeAccount, { status: 201 });
  } catch (error) {
    if (error instanceof Error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
