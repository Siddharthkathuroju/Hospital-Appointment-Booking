import { redirect } from "next/navigation"
import { getSession } from "@/lib/auth/session"
import { ManageDoctors } from "@/components/admin/manage-doctors"

export default async function ManageDoctorsPage() {
  const session = await getSession()

  if (!session || session.role !== "admin") {
    redirect("/login")
  }

  return <ManageDoctors />
}
