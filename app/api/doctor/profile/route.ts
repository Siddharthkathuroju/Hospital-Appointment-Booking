import { NextResponse } from "next/server"
import { getSession } from "@/lib/auth/session"
import { connectDB } from "@/lib/db/mongodb"
import { User } from "@/lib/db/models/user"
import { DoctorProfile } from "@/lib/db/models/doctor-profile"

export async function GET() {
  try {
    const session = await getSession()
    if (!session || session.role !== "doctor") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    await connectDB()

    const user = await User.findById(session.userId).select("-password")
    const profile = await DoctorProfile.findOne({ userId: session.userId })

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
    if (!session || session.role !== "doctor") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const {
      name,
      specialization,
      experience,
      consultationFee,
      qualifications,
      bio,
      phoneNumber,
      address,
      availableSlots,
    } = body

    await connectDB()

    // Update user name
    if (name) {
      await User.findByIdAndUpdate(session.userId, { name })
    }

    // Update doctor profile
    await DoctorProfile.findOneAndUpdate(
      { userId: session.userId },
      {
        specialization,
        experience,
        consultationFee,
        qualifications,
        bio,
        phoneNumber,
        address,
        availableSlots,
      },
      { upsert: true },
    )

    return NextResponse.json({ message: "Profile updated successfully" })
  } catch (error: any) {
    console.error("[v0] Profile update error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
