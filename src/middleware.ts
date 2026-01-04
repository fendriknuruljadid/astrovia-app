import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { getToken } from 'next-auth/jwt'
// import { randomUUID } from 'crypto'

export async function middleware(req: NextRequest) {
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET })
  const { pathname } = req.nextUrl
  const url = req.nextUrl
  const deviceId = req.cookies.get('device_id')?.value

  if (!deviceId) {
    const res = NextResponse.next()

    res.cookies.set('device_id', crypto.randomUUID(), {
      httpOnly: true,
      secure: true,
      sameSite: 'lax',
      path: '/',
    })

    return res
  }

  // Aturan redirect dalam bentuk array
  const redirects = [
    {
      condition: () => ['/', 
        '/log-in',
      ].includes(pathname) && token,
      target: '/dashboard',
    },
    {
      condition: () => pathname.startsWith('/dashboard') && !token,
      target: '/',
    },
    {
      condition: () => pathname.startsWith('/astro-zenith') && !token,
      target: '/',
    },
  ]

  // Jalankan aturan redirect pertama yang cocok
  const match = redirects.find(rule => rule.condition())
  if (match) {
    return NextResponse.redirect(new URL(match.target, req.url))
  }

  // Rewriting path singkat
  // const rewrites: Record<string, string> = {
  //   '/c': '/chat',
  // }

  // if (rewrites[pathname]) {
  //   url.pathname = rewrites[pathname]
  //   return NextResponse.rewrite(url)
  // }

  return NextResponse.next()
}

export const config = {
  matcher: [
    '/', 
    '/log-in',
    '/astro-nova/:path*', 
    '/astro-zenith/:path*', 
    '/dashboard/:path*'
  ],
}
