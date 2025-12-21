import { NextResponse } from "next/server"
import { getSession } from "@/lib/auth/session"
import { connectDB } from "@/lib/db/mongodb"
import { User } from "@/lib/db/models/user"
import { DoctorProfile } from "@/lib/db/models/doctor-profile"

export async function GET() {
  try {
    const session = await getSession()
    if (!session || session.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    await connectDB()

    const doctors = await User.find({ role: "doctor" }).select("-password").sort({ createdAt: -1 })

    const doctorsWithProfiles = await Promise.all(
      doctors.map(async (doctor) => {
        const profile = await DoctorProfile.findOne({ userId: doctor._id })
        return {
          _id: doctor._id,
          name: doctor.name,
          email: doctor.email,
          isApproved: doctor.isApproved,
          isBlocked: doctor.isBlocked,
          profile: profile
            ? {
                specialization: profile.specialization,
                experience: profile.experience,
                qualifications: profile.qualifications,
              }
            : undefined,
        }
      }),
    )

    return NextResponse.json({ doctors: doctorsWithProfiles })
  } catch (error: any) {
    console.error("[v0] Admin doctors fetch error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
