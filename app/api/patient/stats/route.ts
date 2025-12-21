import { NextResponse } from "next/server"
import { getSession } from "@/lib/auth/session"
import { connectDB } from "@/lib/db/mongodb"
import { Appointment } from "@/lib/db/models/appointment"

export async function GET() {
  try {
    const session = await getSession()
    if (!session || session.role !== "patient") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    await connectDB()

    const now = new Date()

    const upcomingAppointments = await Appointment.countDocuments({
      patientId: session.userId,
      status: "confirmed",
      appointmentDate: { $gte: now },
    })

    const pendingAppointments = await Appointment.countDocuments({
      patientId: session.userId,
      status: "pending",
    })

    const totalAppointments = await Appointment.countDocuments({
      patientId: session.userId,
    })

    return NextResponse.json({
      upcomingAppointments,
      pendingAppointments,
      totalAppointments,
    })
  } catch (error: any) {
    console.error("[v0] Stats error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
