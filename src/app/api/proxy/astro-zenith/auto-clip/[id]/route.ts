import { NextRequest, NextResponse } from "next/server";
import type { ApiResponse } from "@/types/api";
import { getWithSignature,  postWithSignature } from "@/utils/api";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params; 
    const url = `${process.env.API_URL}/astro-zenith/auto-clip/${id}`;
    // console.log(url);
    const result = await getWithSignature<ApiResponse>(
      req,
      url,
      {},
      "web-proxy"
    );
    console.log(result);
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
