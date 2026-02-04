import { getAuthSession } from "@/services/auth";
import { getProfileByAccountId, updateProfile } from "@/services/profile";
import { updateProfileSchema } from "@/lib/validators/profile";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
  const session = await getAuthSession(req);
  const accountId = session?.user?.id;
  if (!accountId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const data = await getProfileByAccountId(accountId);
  if (!data) return NextResponse.json({ error: "Profile not found" }, { status: 404 });

  return NextResponse.json(data);
}

export async function PATCH(req: Request) {
  const session = await getAuthSession(req);
  const accountId = session?.user?.id;
  if (!accountId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const validatedData = updateProfileSchema.parse(body);

    const existingProfile = await getProfileByAccountId(accountId);
    if (!existingProfile) {
      return NextResponse.json({ error: "Profile not found" }, { status: 404 });
    }

    const updated = await updateProfile(existingProfile.id, validatedData);
    return NextResponse.json(updated);
  } catch (error) {
    if (error instanceof Error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}