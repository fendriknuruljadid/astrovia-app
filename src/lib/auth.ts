import { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import { postWithSignature } from "@/utils/api";
import type { ApiResponse } from "@/types/api";

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
    // async signIn({ user, account }) {
    //   if (account?.provider === "google" && account.access_token && user.email) {
    //     try {
    //       const result = await postWithSignature<ApiResponse<LoginData>>(
    //         `${process.env.API_URL}/auth/generate-token`,
    //         {
    //           email: user.email,
    //           provider: account.provider,
    //           oauthToken: account.access_token,
    //         }
    //       );

    //       if (!result?.data?.access_token) return false;
    //       user.appToken = result.data.access_token.AccessToken;
    //       user.refreshToken = result.data.access_token.RefreshToken;
    //       user.expired = Date.now() + result.data.access_token.ExpiresIn * 1000;
    //       return true;
    //     } catch {
    //       return false;
    //     }
    //   }
    //   return true;
    // },
    async signIn() {
      return true;
    },
    
    // async jwt({ token, user }) {
    //   // if (user?.appToken) token.appToken = user.appToken;

    //   if (user) {
    //     token.appToken = user.appToken;
    //     token.refreshToken = user.refreshToken;
    //     token.expired = user.expired;
    //     return token;
    //   }
    
    //   if (!token.expired) {
    //     return token;
    //   }
    
    //   // 2. Jika token masih jauh dari expired → pakai
    //   if (Date.now() < token.expired - 60_000) {
    //     return token;
    //   }
    
    //   const result = await postWithSignature<ApiResponse<LoginData>>(
    //     `${process.env.API_URL}/auth/refresh-token`,
    //     {
    //       refresh_token: token.refreshToken,
    //     }
    //   );
    //   if (!result?.data?.access_token) {
    //     token.error = "RefreshAccessTokenError";
    //     return token;
    //   }
      
    //   const newToken = result.data.access_token;
    
    //   token.appToken = newToken.AccessToken;
    //   token.refreshToken = newToken.RefreshToken;
    //   token.expired= Date.now() + newToken.ExpiresIn * 1000;
    
    //   return token;
    // },

    async jwt({ token, user, account }) {
      // FIRST LOGIN
      if (account && user && account.provider === "google") {
        token.name = user.name;
        token.email = user.email;
        token.picture = user.image;
        const result = await postWithSignature<ApiResponse<LoginData>>(
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
    
        return token;
      }
    
      // NO TOKEN
      if (!token.expired) return token;
    
      // STILL VALID
      if (Date.now() < token.expired - 60_000) return token;
    
      // REFRESH
      try {
        const result = await postWithSignature<ApiResponse<LoginData>>(
          `${process.env.API_URL}/auth/refresh-token`,
          {
            refresh_token: token.refreshToken,
          }
        );
    
        if (!result?.data?.access_token) throw new Error();
    
        token.appToken = result.data.access_token.AccessToken;
        token.refreshToken = result.data.access_token.RefreshToken;
        token.expired =
          Date.now() + result.data.access_token.ExpiresIn * 1000;
    
        return token;
      } catch {
        token.error = "RefreshAccessTokenError";
        return token;
      }
    },
    
    async session({ session, token }) {
      if (token.error === "RefreshAccessTokenError") {
        session.error = "LOGOUT";
      }
      if (token.appToken) {
        session.appToken = token.appToken;
      }
      return session;
    },
  },
  events: {
    async signOut({ token }) {
      if (!token?.refreshToken) return;
  
      try {
        await postWithSignature(
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
