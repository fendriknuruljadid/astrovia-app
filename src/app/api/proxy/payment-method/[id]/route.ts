import { NextRequest, NextResponse } from "next/server";
import { ApiResponse } from "@/types/api";
import { getWithSignature } from "@/utils/api";
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params; 
    const url = `${process.env.API_URL}/payment/payment-method/${id}`;
    const result = await getWithSignature<ApiResponse>(
      req,
      url,
      {}
    );
    // console.log(result);
    return NextResponse.json(result, {
        status: Number(result.code) || 200,
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
