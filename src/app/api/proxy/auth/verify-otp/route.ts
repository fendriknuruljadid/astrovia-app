import { NextRequest, NextResponse } from "next/server";
import type { ApiResponse } from "@/types/api";
import { postPublic } from "@/utils/api-public";
import axios from "axios";


export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const url = `${process.env.API_URL}/users/verify-verification`;
    const result = await postPublic<ApiResponse>(url, body);
    // console.log(br);
    return NextResponse.json(result, {
      status: result?.code || 200,
    });
  } catch (error: unknown) {
    if (axios.isAxiosError(error)) {
      return NextResponse.json(
        error.response?.data || {
          status: false,
          message: "API error",
        },
        {
          status: error.response?.status || 500,
        }
      );
    }
  
    return NextResponse.json(
      {
        status: false,
        message: "Unexpected proxy error",
      },
      { status: 500 }
    );
  }
}

