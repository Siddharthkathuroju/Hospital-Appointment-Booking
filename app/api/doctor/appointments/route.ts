import { NextResponse } from "next/server"
import { getSession } from "@/lib/auth/session"
import { connectDB } from "@/lib/db/mongodb"
import { Appointment } from "@/lib/db/models/appointment"
import { User } from "@/lib/db/models/user"

export async function GET() {
  try {
    const session = await getSession()
    if (!session || session.role !== "doctor") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    await connectDB()

    const appointments = await Appointment.find({ doctorId: session.userId }).sort({ appointmentDate: -1 })

    const appointmentsWithPatients = await Promise.all(
      appointments.map(async (appointment) => {
        const patient = await User.findById(appointment.patientId).select("name email")

        return {
          _id: appointment._id,
          appointmentDate: appointment.appointmentDate,
          startTime: appointment.startTime,
          endTime: appointment.endTime,
          status: appointment.status,
          reason: appointment.reason,
          prescription: appointment.prescription,
          diagnosis: appointment.diagnosis,
          patient: {
            name: patient?.name,
            email: patient?.email,
          },
        }
      }),
    )

    return NextResponse.json({ appointments: appointmentsWithPatients })
  } catch (error: any) {
    console.error("[v0] Appointments fetch error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
