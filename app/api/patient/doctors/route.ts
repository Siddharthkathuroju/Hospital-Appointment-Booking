import { NextResponse } from "next/server"
import { getSession } from "@/lib/auth/session"
import { connectDB } from "@/lib/db/mongodb"
import { User } from "@/lib/db/models/user"
import { DoctorProfile } from "@/lib/db/models/doctor-profile"

export async function GET() {
  try {
    const session = await getSession()
    if (!session || session.role !== "patient") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    await connectDB()

    // Get all approved doctors with their profiles
    const doctors = await User.find({
      role: "doctor",
      isApproved: true,
      isBlocked: false,
    }).select("name email")

    const doctorsWithProfiles = await Promise.all(
      doctors.map(async (doctor) => {
        const profile = await DoctorProfile.findOne({ userId: doctor._id })
        return {
          _id: doctor._id,
          name: doctor.name,
          email: doctor.email,
          profile: profile || {},
        }
      }),
    )

    return NextResponse.json({ doctors: doctorsWithProfiles.filter((d) => d.profile && d.profile.specialization) })
  } catch (error: any) {
    console.error("[v0] Doctors fetch error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
