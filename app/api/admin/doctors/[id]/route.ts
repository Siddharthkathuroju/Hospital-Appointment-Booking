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
    const { isApproved, isBlocked } = body

    await connectDB()

    const updateData: any = {}
    if (typeof isApproved === "boolean") updateData.isApproved = isApproved
    if (typeof isBlocked === "boolean") updateData.isBlocked = isBlocked

    const user = await User.findByIdAndUpdate(id, updateData, { new: true })

    if (!user) {
      return NextResponse.json({ error: "Doctor not found" }, { status: 404 })
    }

    return NextResponse.json({ user })
  } catch (error: any) {
    console.error("[v0] Admin doctor update error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
