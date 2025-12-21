import { redirect } from "next/navigation"
import { getSession } from "@/lib/auth/session"
import { SearchDoctors } from "@/components/patient/search-doctors"

export default async function SearchDoctorsPage() {
  const session = await getSession()

  if (!session || session.role !== "patient") {
    redirect("/login")
  }

  return <SearchDoctors />
}
