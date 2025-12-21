import { NextResponse } from "next/server"
import { getSession } from "@/lib/auth/session"
import { connectDB } from "@/lib/db/mongodb"
import { User } from "@/lib/db/models/user"
import { PatientProfile } from "@/lib/db/models/patient-profile"

export async function GET() {
  try {
    const session = await getSession()
    if (!session || session.role !== "patient") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    await connectDB()

    const user = await User.findById(session.userId).select("-password")
    const profile = await PatientProfile.findOne({ userId: session.userId })

    return NextResponse.json({
      user,
      profile: profile || {},
    })
  } catch (error: any) {
    console.error("[v0] Profile fetch error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function PUT(request: Request) {
  try {
    const session = await getSession()
    if (!session || session.role !== "patient") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const { name, phoneNumber, address, dateOfBirth, gender, bloodGroup, allergies, emergencyContact } = body

    await connectDB()

    // Update user name
    if (name) {
      await User.findByIdAndUpdate(session.userId, { name })
    }

    // Update patient profile
    await PatientProfile.findOneAndUpdate(
      { userId: session.userId },
      {
        phoneNumber,
        address,
        dateOfBirth: dateOfBirth ? new Date(dateOfBirth) : undefined,
        gender,
        bloodGroup,
        allergies,
        emergencyContact,
      },
      { upsert: true },
    )

    return NextResponse.json({ message: "Profile updated successfully" })
  } catch (error: any) {
    console.error("[v0] Profile update error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
