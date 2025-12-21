import { redirect } from "next/navigation"
import { getSession } from "@/lib/auth/session"
import { PatientProfileForm } from "@/components/patient/patient-profile-form"

export default async function PatientProfilePage() {
  const session = await getSession()

  if (!session || session.role !== "patient") {
    redirect("/login")
  }

  return (
    <div className="container max-w-4xl mx-auto py-8 px-4">
      <h1 className="text-3xl font-bold mb-6">My Profile</h1>
      <PatientProfileForm />
    </div>
  )
}
