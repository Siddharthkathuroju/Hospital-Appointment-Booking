import { NextResponse } from "next/server"
import { connectDB } from "@/lib/db/mongodb"
import { User } from "@/lib/db/models/user"
import { verifyPassword } from "@/lib/auth/bcrypt"
import { generateAccessToken, generateRefreshToken } from "@/lib/auth/jwt"
import { validateInput, loginSchema } from "@/lib/validation/schemas"

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { email, password } = body

    // Validate input
    const validation = validateInput({ email, password }, loginSchema)
    if (!validation.isValid) {
      return NextResponse.json({ error: Object.values(validation.errors)[0] }, { status: 400 })
    }

    await connectDB()

    // Find user
    const user = await User.findOne({ email: email.toLowerCase() })
    if (!user) {
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 })
    }

    // Check if user is blocked
    if (user.isBlocked) {
      return NextResponse.json({ error: "Your account has been blocked" }, { status: 403 })
    }

    // Check if doctor is approved
    if (user.role === "doctor" && !user.isApproved) {
      return NextResponse.json({ error: "Your account is pending admin approval" }, { status: 403 })
    }

    // Verify password
    const isValidPassword = await verifyPassword(password, user.password)
    if (!isValidPassword) {
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 })
    }

    // Generate tokens
    const payload = {
      userId: user._id.toString(),
      email: user.email,
      role: user.role,
    }

    const accessToken = generateAccessToken(payload)
    const refreshToken = generateRefreshToken(payload)

    // Set cookies
    const response = NextResponse.json({
      message: "Login successful",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    })

    response.cookies.set("access_token", accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 900, // 15 minutes
    })

    response.cookies.set("refresh_token", refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 604800, // 7 days
    })

    return response
  } catch (error: any) {
    console.error(" Login error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
