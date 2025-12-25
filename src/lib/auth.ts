import { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
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
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      authorization: {
        params: {
          prompt: "select_account",
          access_type: "offline",
          response_type: "code",
        },
      },
    }),
  ],

  callbacks: {
    async signIn({ user, account }) {
      if (account?.provider === "google" && account.access_token && user.email) {
        try {
          const result = await postWithSignature<ApiResponse<LoginData>>(
            `${process.env.API_URL}/generate-token`,
            {
              email: user.email,
              provider: account.provider,
              oauthToken: account.access_token,
            }
          );

          if (!result?.data?.access_token) return false;
          user.appToken = result.data.access_token;
          return true;
        } catch {
          return false;
        }
      }
      return true;
    },

    async jwt({ token, user }) {
      if (user?.appToken) token.appToken = user.appToken;
      return token;
    },

    async session({ session, token }) {
      if (token.appToken) session.appToken = token.appToken;
      return session;
    },
  },
};
