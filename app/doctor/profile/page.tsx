import { redirect } from "next/navigation"
import { getSession } from "@/lib/auth/session"
import { DoctorProfileForm } from "@/components/doctor/doctor-profile-form"

export default async function DoctorProfilePage() {
  const session = await getSession()

  if (!session || session.role !== "doctor") {
    redirect("/login")
  }

  return (
    <div className="container max-w-4xl mx-auto py-8 px-4">
      <h1 className="text-3xl font-bold mb-6">My Profile</h1>
      <DoctorProfileForm />
    </div>
  )
}
