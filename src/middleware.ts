import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { getToken } from 'next-auth/jwt'

export async function middleware(req: NextRequest) {
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET })
  const { pathname } = req.nextUrl
  const url = req.nextUrl

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
    '/dashboard/:path*'
  ],
}
