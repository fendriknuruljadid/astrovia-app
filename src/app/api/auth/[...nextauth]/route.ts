import NextAuth, { NextAuthOptions, User } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { postWithSignature } from "@/utils/api";
import type { ApiResponse } from "@/types/api";

interface LoginData {
  success: boolean;
  token_type: string;
  expires_in: number;
  access_token: string;
}

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "Local Login",
      credentials: {
        email: { label: "Email", type: "text", placeholder: "you@example.com" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        try {
          const url = `${process.env.API_URL}/auth/generate-token-cms`;
          const data = await postWithSignature<ApiResponse<LoginData>>(url, {
            email: credentials?.email,
            password: credentials?.password,
            provider: "local",
            oauthToken: "",
          });

          if (!data?.success) {
            throw new Error(data?.message || "Login failed");
          }

          return {
            name: credentials?.email?.split("@")[0],
            email: credentials?.email,
            appToken: data?.data?.access_token,
          } as unknown as User;
        } catch (err) {
          if (err instanceof Error) {
            console.error("Local login error:", err.message);
            throw new Error(err.message || "An error occurred during login");
          } else {
            console.error("Unexpected error:", err);
            throw new Error("An unknown error occurred");
          }
        }
      },
    }),

    
  ],

  cookies: {
    sessionToken: {
      name: "cms.session-token",
      options: {
        httpOnly: true,
        sameSite: "lax",
        path: "/",
        secure: true,
        domain: "cms.plutonia.ai",
      },
    },
    csrfToken: {
      name: "cms.csrf-token",
      options: {
        httpOnly: true,
        sameSite: "lax",
        path: "/",
        secure: true,
        domain: "cms.plutonia.ai",
      },
    },
    callbackUrl: {
      name: "cms.callback-url",
      options: {
        sameSite: "lax",
        path: "/",
        secure: true,
        domain: "cms.plutonia.ai",
      },
    },
  },

  callbacks: {
    async jwt({ token, user }) {
      try {
        // When logging in for the first time (local login)
        if (user && "appToken" in user) {
          token.appToken = (user as User & { appToken?: string }).appToken;
        }
        return token;
      } catch (error) {
        if (error instanceof Error) {
          console.error("JWT callback error:", error.message);
        } else {
          console.error("Unexpected JWT callback error:", error);
        }
        return token; // always return the token to prevent session issues
      }
    },

    async session({ session, token }) {
      if (token?.appToken) {
        session.appToken = token.appToken;
      }
      return session;
    },
  },
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
