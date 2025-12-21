import { redirect } from "next/navigation"
import { getSession } from "@/lib/auth/session"
import { PatientDashboard } from "@/components/patient/patient-dashboard"

export default async function PatientPage() {
  const session = await getSession()

  if (!session || session.role !== "patient") {
    redirect("/login")
  }

  return <PatientDashboard />
}
