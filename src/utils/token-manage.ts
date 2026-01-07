

import { encode } from "next-auth/jwt";
import { getToken } from "next-auth/jwt";
import type { NextRequest } from "next/server";
import type { ApiResponse } from "@/types/api";
import { cookies } from "next/headers";
import { postPublic } from "./api-public";

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

 export async function getAuthToken(req: NextRequest) {
    const token = await getToken({
      req,
      secret: process.env.NEXTAUTH_SECRET,
    });
  
    return token as {
      appToken?: string;
      refreshToken?: string;
      expired?: number;
    } | null;
  }
  
  let refreshing: Promise<string> | null = null;
  
  export async function getValidAppToken(req: NextRequest) {
    const auth = await getAuthToken(req);
  
    if (!auth?.appToken || !auth?.refreshToken || !auth?.expired) {
      throw new Error("Unauthenticated");
    }
  
    // token masih valid
    if (Date.now() < auth.expired - 60_000) {
      console.log("[AUTH] token still valid");
      return auth.appToken;
    }
  
    // single-flight refresh (anti race condition)
    console.log("[AUTH] APP TOKEN "+auth.appToken);
    console.log("[AUTH] Refresh "+refreshing);
    if (!refreshing) {
      console.log("[AUTH] token expired → refreshing");
      console.log("[AUTH] refresh token "+auth.refreshToken);
      refreshing = refreshAppToken(req, auth.refreshToken).finally(
        () => (refreshing = null)
      );
    }
  
    return refreshing;
  }
  
  
  async function refreshAppToken(
    req: NextRequest,
    refreshToken: string
  ): Promise<string> {
    console.log("[AUTH] Result Refresh "+refreshToken);
    const result = await postPublic<ApiResponse<LoginData>>(
      `${process.env.API_URL}/auth/refresh-token`,
      { refresh_token: refreshToken }
    );
    if (!result?.data?.access_token) {
      throw new Error("RefreshFailed");
    }
  
    const newToken = result.data.access_token;
  
    await updateAuthToken(req, {
      appToken: newToken.AccessToken,
      refreshToken: newToken.RefreshToken,
      expired: Date.now() + newToken.ExpiresIn * 1000,
    });
  
    return newToken.AccessToken;
  }
  
  
  export async function updateAuthToken(
    req: NextRequest,
    data: {
      appToken: string;
      refreshToken: string;
      expired: number;
    }
  ) {
    const token = await getAuthToken(req);
    if (!token) return;
  
    Object.assign(token, data);
  
    const newJwt = await encode({
      token,
      secret: process.env.NEXTAUTH_SECRET!,
    });
  
    const cookieStore = await cookies();
  
    cookieStore.set("next-auth.session-token", newJwt, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
    });
  }