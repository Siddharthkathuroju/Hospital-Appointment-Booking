import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { verifyAccessToken, verifyRefreshToken, generateAccessToken } from "./lib/auth/jwt"

export function proxy(request: NextRequest) {
  const accessToken = request.cookies.get("access_token")?.value
  const refreshToken = request.cookies.get("refresh_token")?.value
  const pathname = request.nextUrl.pathname

  // Public routes
  const publicRoutes = ["/", "/login", "/register"]
  if (publicRoutes.includes(pathname)) {
    return NextResponse.next()
  }

  // Check access token
  const session = accessToken ? verifyAccessToken(accessToken) : null

  // If access token expired, try refresh token
  if (!session && refreshToken) {
    const refreshPayload = verifyRefreshToken(refreshToken)
    if (refreshPayload) {
      const newAccessToken = generateAccessToken(refreshPayload)
      const response = NextResponse.next()
      response.cookies.set("access_token", newAccessToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 900, // 15 minutes
      })
      return response
    }
  }

  // Redirect to login if not authenticated
  if (!session) {
    return NextResponse.redirect(new URL("/login", request.url))
  }

  // Role-based access control
  const role = session.role

  if (pathname.startsWith("/patient") && role !== "patient") {
    return NextResponse.redirect(new URL(`/${role}`, request.url))
  }

  if (pathname.startsWith("/doctor") && role !== "doctor") {
    return NextResponse.redirect(new URL(`/${role}`, request.url))
  }

  if (pathname.startsWith("/admin") && role !== "admin") {
    return NextResponse.redirect(new URL(`/${role}`, request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|icon.*|apple-icon.png).*)"],
}
