import { DefaultSession } from "next-auth"
import { JWT as NextAuthJWT } from "next-auth/jwt"

declare module "next-auth" {
  /**
   * Returned by `useSession`, `getSession` and received as a prop on the `SessionProvider` React Context
   */
  interface Session {
    user: {
      /** The user's unique identifier. */
      id: string
      type?: "student" | "employee" | "tech" | "dev" | null
    } & DefaultSession["user"]
  }

  interface User {
      id: string
      username?: string | null
      email?: string | null
      type?: "student" | "employee" | "tech" | "dev" | null
  }
}

declare module "next-auth/jwt" {
  interface JWT extends NextAuthJWT {
    id: string
    type?: "student" | "employee" | "tech" | "dev" | null
  }
}