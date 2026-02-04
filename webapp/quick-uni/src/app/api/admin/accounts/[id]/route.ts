import { getAuthSession } from "@/services/auth";
import { isAdmin, getUserById, updateAccount, deleteAccount } from "@/services/user";
import { updateAccountAdminSchema } from "@/lib/validators/account";
import { NextResponse } from "next/server";
import { hash } from "bcryptjs";

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

    const { password, ...otherData } = validatedData;
    const dataToUpdate: Record<string, unknown> = { ...otherData };
    
    if (password) {
      dataToUpdate.pwdHash = await hash(password, 10);
    }

    const updated = await updateAccount(id, dataToUpdate);
    if (!updated) {
      return NextResponse.json({ error: "Account not found" }, { status: 404 });
    }

    const { pwdHash, ...safeAccount } = updated;
    return NextResponse.json(safeAccount);
  } catch (error) {
    if (error instanceof Error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
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
  const deleted = await deleteAccount(id);
  
  if (!deleted) {
    return NextResponse.json({ error: "Account not found" }, { status: 404 });
  }

  return NextResponse.json({ message: "Account deleted successfully" });
}
