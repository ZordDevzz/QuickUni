import { getAuthSession } from "@/services/auth";
import {
  isAdmin,
  getUserById,
  updateAccountWorkflow,
  deleteAccountWorkflow,
} from "@/services/user";
import { updateAccountAdminSchema } from "@/lib/validators/account";
import { NextResponse } from "next/server";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getAuthSession(req);
  if (!session?.user?.id || !(await isAdmin(session.user.id))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  const { id } = await params;
  const account = await getUserById(id);
  if (!account || account.deletedAt) {
    return NextResponse.json({ error: "Account not found" }, { status: 404 });
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { pwdHash, ...safeAccount } = account;
  return NextResponse.json(safeAccount);
}

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getAuthSession(req);
  if (!session?.user?.id || !(await isAdmin(session.user.id))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  const { id } = await params;

  try {
    const body = await req.json();
    const validatedData = updateAccountAdminSchema.parse(body);
    const ipAddress = req.headers.get("x-forwarded-for")?.split(",")[0] || null;

    const updated = await updateAccountWorkflow(id, validatedData, {
      performedBy: session.user.id,
      userAgent: req.headers.get("user-agent"),
      ipAddress,
    });

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { pwdHash, ...safeAccount } = updated;
    return NextResponse.json(safeAccount);
  } catch (error) {
    if (error instanceof Error) {
      if (error.message === "Account not found") {
        return NextResponse.json({ error: error.message }, { status: 404 });
      }
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getAuthSession(req);
  if (!session?.user?.id || !(await isAdmin(session.user.id))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  const { id } = await params;
  const ipAddress = req.headers.get("x-forwarded-for")?.split(",")[0] || null;

  try {
    await deleteAccountWorkflow(id, {
      performedBy: session.user.id,
      userAgent: req.headers.get("user-agent"),
      ipAddress,
    });

    return NextResponse.json({ message: "Account deleted successfully" });
  } catch (error) {
    if (error instanceof Error) {
      if (error.message === "Account not found") {
        return NextResponse.json({ error: error.message }, { status: 404 });
      }
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
