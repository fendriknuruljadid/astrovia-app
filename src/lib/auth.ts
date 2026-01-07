import { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import { postWithSignature } from "@/utils/api";
import type { ApiResponse } from "@/types/api";
import { postPublic } from "@/utils/api-public";

interface LoginData {
  success: boolean;
  token_type: string;
  expires_in: number;
  access_token: {
    AccessToken: string,
    RefreshToken: string,
    ExpiresIn: number
  };
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
    async signIn() {
      return true;
    },
    async jwt({ token, user, account }) {
      // FIRST LOGIN
      if (account && user && account.provider === "google") {
        const result = await postPublic<ApiResponse<LoginData>>(
          `${process.env.API_URL}/auth/generate-token`,
          {
            email: user.email,
            provider: account.provider,
            oauthToken: account.access_token,
           
          }
        );
    
        if (!result?.data?.access_token) {
          token.error = "LoginFailed";
          return token;
        }
    
        token.appToken = result.data.access_token.AccessToken;
        token.refreshToken = result.data.access_token.RefreshToken;
        token.expired = Date.now() + result.data.access_token.ExpiresIn * 1000;
      }
      return token;
    },
    
    async session({ session }) {
      return session;
    },
  },
  events: {
    async signOut({ token }) {
      if (!token?.refreshToken) return;
  
      try {
        await postPublic(
          `${process.env.API_URL}/auth/logout`,
          {
            refresh_token: token.refreshToken,
          }
        );
      } catch {
        // ga masalah kalau gagal
      }
    },
  },
};
