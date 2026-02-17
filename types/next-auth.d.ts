// types/next-auth.d.ts

import NextAuth, { DefaultSession, DefaultUser } from "next-auth"
import { JWT as DefaultJWT } from "next-auth/jwt"

declare module "next-auth" {
  interface Session {
    accessToken?: string;
    appToken?: string;
    error?:string,
    user?: {
      name?: string | null;
      email?: string | null;
      firstName?: string | null;
      lastName?: string | null;
      phone?: string | null;
      image?: string | null;
    } & DefaultSession["user"];
  }

  interface User extends DefaultUser {
    accessToken?: string,
    appToken?: string;
    refreshToken?: string;
    expired?: number;
  }
}

declare module "next-auth/jwt" {
  interface JWT extends DefaultJWT {
    accessToken?: string;
    appToken?: string;
    refreshToken?: string;
    expired?: number;
    firstName?: string;
    lastName?: string;
    phone?: string;
  }
}

