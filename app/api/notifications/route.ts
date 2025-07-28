import { type NextRequest, NextResponse } from "next/server"
import { verifyToken } from "@/lib/auth"

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get("authorization")
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json({ error: "No token provided" }, { status: 401 })
    }

    const token = authHeader.substring(7)
    const user = verifyToken(token)

    if (!user) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 })
    }

    // Mock notifications - replace with your actual notification system
    const notifications = [
      {
        id: "1",
        message: "New media uploaded by user123",
        type: "upload",
        timestamp: new Date().toISOString(),
      },
      {
        id: "2",
        message: "Someone liked your post",
        type: "like",
        timestamp: new Date().toISOString(),
      },
    ]

    return NextResponse.json({ notifications })
  } catch (error) {
    console.error("Notifications error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
