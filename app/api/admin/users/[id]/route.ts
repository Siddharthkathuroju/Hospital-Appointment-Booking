import { NextResponse } from "next/server"
import { getSession } from "@/lib/auth/session"
import { connectDB } from "@/lib/db/mongodb"
import { User } from "@/lib/db/models/user"

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getSession()
    if (!session || session.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id } = await params
    const body = await request.json()
    const { isBlocked } = body

    await connectDB()

    const user = await User.findByIdAndUpdate(id, { isBlocked }, { new: true })

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    return NextResponse.json({ user })
  } catch (error: any) {
    console.error("[v0] Admin user update error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
