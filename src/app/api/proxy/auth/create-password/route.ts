import { NextRequest, NextResponse } from "next/server";
import type { ApiResponse } from "@/types/api";
import { postPublic } from "@/utils/api-public";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const url = `${process.env.API_URL}/users/create-password`;
    const result = await postPublic<ApiResponse>(url, body);
    console.log(result);
    return NextResponse.json(result, {
      status: result?.code || 200,
    });
  } catch (error: unknown) {
    // console.log(error);
    const message =
      error instanceof Error ? error.message : "Proxy error";
    const code =
      typeof (error as { code?: number }).code === "number"
        ? (error as { code?: number }).code
        : 400;
  
    return NextResponse.json(
      { success: false, message },
      { status: code }
    );
  }
}
