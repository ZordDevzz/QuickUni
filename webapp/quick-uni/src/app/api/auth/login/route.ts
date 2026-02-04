import { encode } from "next-auth/jwt";
import { getUserByUsername } from "@/services/user";
import { compare } from "bcryptjs";
import { NextResponse } from "next/server";
import { loginFormSchema } from "@/lib/validators/auth/form.schema";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const validatedData = loginFormSchema.safeParse(body);

    if (!validatedData.success) {
      return NextResponse.json({ error: "Invalid input" }, { status: 400 });
    }

    const { username, password } = validatedData.data;

    const user = await getUserByUsername(username);
    if (!user) {
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
    }

    const isValidPassword = await compare(password, user.pwdHash);
    if (!isValidPassword) {
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
    }

    // Generate JWT token that NextAuth can recognize
    const token = await encode({
      token: {
        id: user.id,
        name: user.username,
        email: user.email,
        sub: user.id, // 'sub' is standard for 'subject' (user id)
      },
      secret: process.env.NEXTAUTH_SECRET!,
      maxAge: 30 * 24 * 60 * 60, // 30 days
    });

    return NextResponse.json({ 
        token,
        user: {
            id: user.id,
            username: user.username,
            email: user.email,
        }
    });
  } catch (error) {
    console.error("Login error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
