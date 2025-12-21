import { redirect } from "next/navigation"
import { getSession } from "@/lib/auth/session"
import { ManageUsers } from "@/components/admin/manage-users"

export default async function ManageUsersPage() {
  const session = await getSession()

  if (!session || session.role !== "admin") {
    redirect("/login")
  }

  return <ManageUsers />
}
