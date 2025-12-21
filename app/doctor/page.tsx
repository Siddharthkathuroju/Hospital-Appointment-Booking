import { redirect } from "next/navigation"
import { getSession } from "@/lib/auth/session"
import { DoctorDashboard } from "@/components/doctor/doctor-dashboard"

export default async function DoctorPage() {
  const session = await getSession()

  if (!session || session.role !== "doctor") {
    redirect("/login")
  }

  return <DoctorDashboard />
}
