import { redirect } from "next/navigation"
import { getSession } from "@/lib/auth/session"
import { DoctorAppointments } from "@/components/doctor/doctor-appointments"

export default async function DoctorAppointmentsPage() {
  const session = await getSession()

  if (!session || session.role !== "doctor") {
    redirect("/login")
  }

  return <DoctorAppointments />
}
