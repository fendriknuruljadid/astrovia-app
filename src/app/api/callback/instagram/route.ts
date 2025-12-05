import { NextResponse } from "next/server";

interface InstagramTokenResponse {
  access_token: string;
  token_type?: string;
  expires_in?: number;
  [key: string]: unknown;
}

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const code = searchParams.get("code");
    const state = searchParams.get("state");

    if (!code) {
      return NextResponse.json({ error: "Missing authorization code" }, { status: 400 });
    }

    console.log("📥 Received code:", code);
    console.log("📥 State:", state);

    const params = new URLSearchParams({
      client_id: process.env.INSTAGRAM_CLIENT_ID!,
      client_secret: process.env.INSTAGRAM_CLIENT_SECRET!,
      redirect_uri: process.env.INSTAGRAM_REDIRECT_URI!,
      code,
    });

    const tokenRes = await fetch(`https://graph.facebook.com/v23.0/oauth/access_token`, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: params.toString(),
    });

    const rawText = await tokenRes.text();
    console.log("🔵 Token response raw:", rawText);

    let tokenData: InstagramTokenResponse;
    try {
      tokenData = JSON.parse(rawText) as InstagramTokenResponse;
    } catch {
      return NextResponse.json({ error: "Failed to parse token response", rawText }, { status: 500 });
    }

    if (!tokenRes.ok) {
      return NextResponse.json(
        { error: "Failed to fetch access token", details: tokenData },
        { status: tokenRes.status }
      );
    }

    const { access_token } = tokenData;

    console.log("✅ Access Token:", access_token);

    const redirectUrl = new URL("/integrations?status=success", process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000");
    return NextResponse.redirect(redirectUrl);

  } catch (error: unknown) {
    if (error instanceof Error) {
      console.error("❌ Instagram callback error:", error.message);
      return NextResponse.json({ error: error.message }, { status: 500 });
    } else {
      console.error("❌ Instagram callback unknown error:", error);
      return NextResponse.json({ error: "Unknown error" }, { status: 500 });
    }
  }
}
