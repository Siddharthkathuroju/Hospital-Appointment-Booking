import { NextResponse } from "next/server"
import { getSession } from "@/lib/auth/session"
import { connectDB } from "@/lib/db/mongodb"
import { Appointment } from "@/lib/db/models/appointment"

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getSession()
    if (!session || session.role !== "patient") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id } = await params
    const body = await request.json()
    const { status } = body

    await connectDB()

    const appointment = await Appointment.findOne({
      _id: id,
      patientId: session.userId,
    })

    if (!appointment) {
      return NextResponse.json({ error: "Appointment not found" }, { status: 404 })
    }

    appointment.status = status
    await appointment.save()

    return NextResponse.json({ appointment })
  } catch (error: any) {
    console.error("[v0] Appointment update error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
