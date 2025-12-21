import { NextResponse } from "next/server"
import { getSession } from "@/lib/auth/session"
import { connectDB } from "@/lib/db/mongodb"
import { Appointment } from "@/lib/db/models/appointment"

export async function GET() {
  try {
    const session = await getSession()
    if (!session || session.role !== "doctor") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    await connectDB()

    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const tomorrow = new Date(today)
    tomorrow.setDate(tomorrow.getDate() + 1)

    const todayAppointments = await Appointment.countDocuments({
      doctorId: session.userId,
      status: "confirmed",
      appointmentDate: { $gte: today, $lt: tomorrow },
    })

    const pendingAppointments = await Appointment.countDocuments({
      doctorId: session.userId,
      status: "pending",
    })

    const uniquePatients = await Appointment.distinct("patientId", {
      doctorId: session.userId,
      status: "completed",
    })

    return NextResponse.json({
      todayAppointments,
      pendingAppointments,
      totalPatients: uniquePatients.length,
    })
  } catch (error: any) {
    console.error("[v0] Stats error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
