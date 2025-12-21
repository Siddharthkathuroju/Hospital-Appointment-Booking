import { cookies } from "next/headers"
import { verifyAccessToken, type JWTPayload } from "./jwt"

export async function getSession(): Promise<JWTPayload | null> {
  const cookieStore = await cookies()
  const token = cookieStore.get("access_token")?.value

  if (!token) {
    return null
  }

  return verifyAccessToken(token)
}

export async function requireAuth() {
  const session = await getSession()

  if (!session) {
    throw new Error("Unauthorized")
  }

  return session
}

export async function requireRole(allowedRoles: string[]) {
  const session = await requireAuth()

  if (!allowedRoles.includes(session.role)) {
    throw new Error("Forbidden")
  }

  return session
}
