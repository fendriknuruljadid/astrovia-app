import { NextRequest, NextResponse } from "next/server";
import type { ApiResponse } from "@/types/api";
import { getWithSignature,  postWithSignature } from "@/utils/api";

export async function GET(
  req: NextRequest,
) {
  try {

    const url = `${process.env.API_URL}/agents`;
    const result = await getWithSignature<ApiResponse>(
      url,
      {},
      "web-proxy"
    );

    return NextResponse.json(result, {
        status: Number(result.code) || 200,
    });
  } catch (error: unknown) {
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

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const url = `${process.env.API_URL}/payments`;
    const result = await postWithSignature<ApiResponse>(url, body, "web-proxy");

    return NextResponse.json(result, {
      status: result?.code || 200,
    });
  } catch (error: unknown) {
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
