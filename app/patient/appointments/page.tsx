import { redirect } from "next/navigation"
import { getSession } from "@/lib/auth/session"
import { PatientAppointments } from "@/components/patient/patient-appointments"

export default async function PatientAppointmentsPage() {
  const session = await getSession()

  if (!session || session.role !== "patient") {
    redirect("/login")
  }

  return <PatientAppointments />
}
