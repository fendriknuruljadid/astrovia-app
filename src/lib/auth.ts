import { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";
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

    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: {},
        password: {},
      },
      async authorize(credentials) {
        const {cfToken } = credentials as any;
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        const verifyRes = await fetch(
          "https://challenges.cloudflare.com/turnstile/v0/siteverify",
          {
            method: "POST",
            headers: { "Content-Type": "application/x-www-form-urlencoded" },
            body: new URLSearchParams({
              secret: process.env.TURNSTILE_SECRET_KEY!,
              response: cfToken,
            }),
          }
        );
    
        const verifyData = await verifyRes.json();
    
        if (!verifyData.success) {
          throw new Error("Captcha verification failed");
        }

        try {
          const result = await postPublic<ApiResponse<LoginData>>(
            `${process.env.API_URL}/auth/generate-token`,
            {
              email: credentials.email,
              password: credentials.password,
              provider: "local"
            }
          );
          console.log(result)

          if (!result?.data?.access_token) return null;

          return {
            id: credentials.email,
            email: credentials.email,
            appToken: result.data.access_token.AccessToken,
            refreshToken: result.data.access_token.RefreshToken,
            expired:
              Date.now() +
              result.data.access_token.ExpiresIn * 1000,
          };
        } catch {
          return null;
        }
      },
    }),
  ],

  callbacks: {
    async signIn() {
      return true;
    },
    async jwt({ token, user, account }) {
      // FIRST LOGIN
      if (account?.provider === "credentials" && user) {
        token.appToken = (user as any).appToken;
        token.refreshToken = (user as any).refreshToken;
        token.expired = (user as any).expired;
      }
      
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
        // token.expired = Date.now() + 10_000;
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
      console.log("SIGN OUT TOKEN : "+token.refreshToken);
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
