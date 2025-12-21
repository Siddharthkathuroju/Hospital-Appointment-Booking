import { NextResponse } from "next/server"
import { getSession } from "@/lib/auth/session"
import { connectDB } from "@/lib/db/mongodb"
import { User } from "@/lib/db/models/user"
import { Appointment } from "@/lib/db/models/appointment"

export async function GET() {
  try {
    const session = await getSession()
    if (!session || session.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    await connectDB()

    const totalUsers = await User.countDocuments()
    const totalDoctors = await User.countDocuments({ role: "doctor", isApproved: true })
    const totalPatients = await User.countDocuments({ role: "patient" })
    const pendingDoctors = await User.countDocuments({ role: "doctor", isApproved: false })
    const totalAppointments = await Appointment.countDocuments()

    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const tomorrow = new Date(today)
    tomorrow.setDate(tomorrow.getDate() + 1)

    const todayAppointments = await Appointment.countDocuments({
      appointmentDate: { $gte: today, $lt: tomorrow },
    })

    return NextResponse.json({
      totalUsers,
      totalDoctors,
      totalPatients,
      pendingDoctors,
      totalAppointments,
      todayAppointments,
    })
  } catch (error: any) {
    console.error("[v0] Admin stats error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
