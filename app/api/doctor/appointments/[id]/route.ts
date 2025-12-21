import { NextResponse } from "next/server"
import { getSession } from "@/lib/auth/session"
import { connectDB } from "@/lib/db/mongodb"
import { Appointment } from "@/lib/db/models/appointment"

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getSession()
    if (!session || session.role !== "doctor") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id } = await params
    const body = await request.json()
    const { status, prescription, diagnosis } = body

    await connectDB()

    const appointment = await Appointment.findOne({
      _id: id,
      doctorId: session.userId,
    })

    if (!appointment) {
      return NextResponse.json({ error: "Appointment not found" }, { status: 404 })
    }

    if (status) appointment.status = status
    if (prescription) appointment.prescription = prescription
    if (diagnosis) appointment.diagnosis = diagnosis

    await appointment.save()

    return NextResponse.json({ appointment })
  } catch (error: any) {
    console.error(" Appointment update error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
