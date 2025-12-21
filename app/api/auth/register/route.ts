import { NextResponse } from "next/server"
import { connectDB } from "@/lib/db/mongodb"
import { User } from "@/lib/db/models/user"
import { PatientProfile } from "@/lib/db/models/patient-profile"
import { hashPassword } from "@/lib/auth/bcrypt"
import { validateInput, registerSchema } from "@/lib/validation/schemas"

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { name, email, password, role } = body

    // Validate input
    const validation = validateInput({ name, email, password }, registerSchema)
    if (!validation.isValid) {
      return NextResponse.json({ error: Object.values(validation.errors)[0] }, { status: 400 })
    }

    await connectDB()

    // Check if user exists
    const existingUser = await User.findOne({ email: email.toLowerCase() })
    if (existingUser) {
      return NextResponse.json({ error: "User already exists" }, { status: 400 })
    }

    // Hash password
    const hashedPassword = await hashPassword(password)

    // Create user
    const user = await User.create({
      name,
      email: email.toLowerCase(),
      password: hashedPassword,
      role: role || "patient",
    })

    // Create profile based on role
    if (role === "patient") {
      await PatientProfile.create({
        userId: user._id,
      })
    }

    return NextResponse.json(
      {
        message: "User registered successfully",
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
        },
      },
      { status: 201 },
    )
  } catch (error: any) {
    console.error("[v0] Registration error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
