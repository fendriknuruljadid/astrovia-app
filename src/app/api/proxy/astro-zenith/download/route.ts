import { NextResponse } from "next/server"

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const url = searchParams.get("url")
  const filename = searchParams.get("filename") ?? "file.mp4"

  if (!url) {
    return new NextResponse("Missing url", { status: 400 })
  }

  const res = await fetch(url)
  if (!res.ok) {
    return new NextResponse("Failed to fetch file", { status: 500 })
  }

  const blob = await res.arrayBuffer()

  return new NextResponse(blob, {
    headers: {
      "Content-Type": "video/mp4",
      "Content-Disposition": `attachment; filename="${filename}"`,
      "Cache-Control": "no-store",
    },
  })
}
