import { NextAuthOptions, getServerSession } from "next-auth";
import { getToken } from "next-auth/jwt";
import CredentialsProvider from "next-auth/providers/credentials";
import { getUserByUsername } from "@/services/user";
import { compare } from "bcryptjs";

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      id: "user-credentials",
      name: "Credentials",
      credentials: {
        username: { label: "Username", type: "text", placeholder: "Định danh đăng nhập" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.username || !credentials?.password) {
          return null;
        }

        const user = await getUserByUsername(credentials.username);
        
        if (!user) {
          return null;
        }

        const isValidPassword = await compare(credentials.password, user.pwdHash);

        if (isValidPassword) {
          return {
            id: user.id,
            name: user.username,
            email: user.email,
            type: user.type as "student" | "employee" | "tech" | "dev",
          };
        }

        return null;
      },
    }),
  ],
  pages: {
    signIn: "/login",
  },
  session: {
    strategy: "jwt",
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.type = user.type;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id;
        session.user.type = token.type;
      }
      return session;
    },
  },
};

export const getAuthSession = async (req?: Request) => {
  if (req) {
    const token = await getToken({ 
      req: req as Parameters<typeof getToken>[0]["req"], 
      secret: process.env.NEXTAUTH_SECRET 
    });
    
    if (token) {
      return {
        user: {
          id: token.id,
          name: token.name,
          email: token.email,
          type: token.type,
        }
      };
    }
  }

  return getServerSession(authOptions);
};