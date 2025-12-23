import NextAuth, { NextAuthOptions, User } from "next-auth";
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

  // cookies: {
  //   sessionToken: {
  //     name: "app.session-token",
  //     options: {
  //       httpOnly: true,
  //       sameSite: "lax",
  //       path: "/",
  //       secure: true,
  //       domain: "app.astrovia.id",
  //     },
  //   },
  //   csrfToken: {
  //     name: "app.csrf-token",
  //     options: {
  //       httpOnly: true,
  //       sameSite: "lax",
  //       path: "/",
  //       secure: true,
  //       domain: "app.astrovia.id",
  //     },
  //   },
  //   callbackUrl: {
  //     name: "app.callback-url",
  //     options: {
  //       sameSite: "lax",
  //       path: "/",
  //       secure: true,
  //       domain: "app.astrovia.id",
  //     },
  //   },
  // },
  cookies: {
    sessionToken: {
      name: process.env.NODE_ENV === "production" 
        ? "__Host-next-auth.session-token"
        : "next-auth.session-token",
      options: {
        httpOnly: true,
        sameSite: "lax",
        path: "/",
        secure: process.env.NODE_ENV === "production",
      },
    },
  },

  // callbacks: {
  //   async jwt({ token, user, account }) {
  //     try {
  //       // When logging in for the first time (local login)
  //       if (user && "appToken" in user) {
  //         token.appToken = (user as User & { appToken?: string }).appToken;
  //       }
  //       if (account?.access_token && user?.email) {
  //         const url = `${process.env.API_URL}/generate-token`;
          
  //         console.log(account);
  //         try {
  //           const result = await postWithSignature<ApiResponse<LoginData>>(url, {
  //             email: user.email,
  //             provider: account.provider,
  //             oauthToken: account.access_token,
  //           });
  //           console.log(result);
  //           token.appToken = result.data?.access_token;
  //         } catch (error) {
  //           if (error instanceof Error) {
  //             console.error("Failed to retrieve app token:", error.message);
  //           } else {
  //             console.error("Unknown error in JWT callback:", error);
  //           }
  //         }
  //       }
  //       return token;
  //     } catch (error) {
  //       if (error instanceof Error) {
  //         console.error("JWT callback error:", error.message);
  //       } else {
  //         console.error("Unexpected JWT callback error:", error);
  //       }
  //       return token; // always return the token to prevent session issues
  //     }
  //   },

  //   async session({ session, token }) {
  //     if (token?.appToken) {
  //       session.appToken = token.appToken;
  //     }
  //     return session;
  //   },
  // },
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
  
          if (!result?.data?.access_token) {
            console.error("App token empty");
            return false; // BLOK LOGIN
          }
  
          // inject sementara ke user
          (user as any).appToken = result.data.access_token;
          return true;
        } catch (err) {
          console.error("Generate token failed:", err);
          return false; // BLOK LOGIN
        }
      }
  
      return true;
    },
  
    async jwt({ token, user }) {
      if (user && (user as any).appToken) {
        token.appToken = (user as any).appToken;
      }
      return token;
    },
  
    async session({ session, token }) {
      if (token.appToken) {
        session.appToken = token.appToken;
      }
      return session;
    },
  }
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
