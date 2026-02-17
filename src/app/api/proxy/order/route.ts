import { NextRequest, NextResponse } from "next/server";
import { ApiResponse } from "@/types/api";
import { getWithSignature, postWithSignature } from "@/utils/api";


export async function GET(
  req: NextRequest,
) {
  try {

    const url = `${process.env.API_URL}/payment/payment-method`;
    const result = await getWithSignature<ApiResponse>(
      req,
      url,
      {},
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

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const url = `${process.env.API_URL}/payment/order`;
    const result = await postWithSignature<ApiResponse>(req,url, body);
    console.log("res : ",result)
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
