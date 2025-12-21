import { NextResponse } from "next/server"
import { getSession } from "@/lib/auth/session"
import { connectDB } from "@/lib/db/mongodb"
import { Appointment } from "@/lib/db/models/appointment"
import { User } from "@/lib/db/models/user"
import { DoctorProfile } from "@/lib/db/models/doctor-profile"

export async function GET() {
  try {
    const session = await getSession()
    if (!session || session.role !== "patient") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    await connectDB()

    const appointments = await Appointment.find({ patientId: session.userId }).sort({ appointmentDate: -1 })

    const appointmentsWithDoctors = await Promise.all(
      appointments.map(async (appointment) => {
        const doctor = await User.findById(appointment.doctorId).select("name email")
        const profile = await DoctorProfile.findOne({ userId: appointment.doctorId })

        return {
          _id: appointment._id,
          appointmentDate: appointment.appointmentDate,
          startTime: appointment.startTime,
          endTime: appointment.endTime,
          status: appointment.status,
          reason: appointment.reason,
          prescription: appointment.prescription,
          diagnosis: appointment.diagnosis,
          doctor: {
            name: doctor?.name,
            profile: {
              specialization: profile?.specialization,
            },
          },
        }
      }),
    )

    return NextResponse.json({ appointments: appointmentsWithDoctors })
  } catch (error: any) {
    console.error("[v0] Appointments fetch error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const session = await getSession()
    if (!session || session.role !== "patient") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const { doctorId, appointmentDate, startTime, endTime, reason } = body

    if (!doctorId || !appointmentDate || !startTime || !endTime || !reason) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    await connectDB()

    const appointment = await Appointment.create({
      patientId: session.userId,
      doctorId,
      appointmentDate: new Date(appointmentDate),
      startTime,
      endTime,
      reason,
      status: "pending",
    })

    return NextResponse.json({ appointment }, { status: 201 })
  } catch (error: any) {
    console.error("[v0] Appointment creation error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
