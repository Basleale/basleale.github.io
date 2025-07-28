import { type NextRequest, NextResponse } from "next/server"
import { verifyToken } from "@/lib/auth"

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get("authorization")
    const token = authHeader?.replace("Bearer ", "")

    if (!token) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 })
    }

    const user = verifyToken(token)
    if (!user) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 })
    }

    // For now, return mock notifications
    // TODO: Implement actual notification storage in blob
    const notifications = [
      {
        id: "1",
        type: "upload",
        message: "Alice uploaded a new image",
        user: "Alice",
        timestamp: new Date(Date.now() - 3600000).toISOString(),
        read: false,
      },
      {
        id: "2",
        type: "like",
        message: "Bob liked your photo",
        user: "Bob",
        timestamp: new Date(Date.now() - 7200000).toISOString(),
        read: true,
      },
    ]

    return NextResponse.json({ notifications })
  } catch (error) {
    console.error("Notifications fetch error:", error)
    return NextResponse.json({ error: "Failed to fetch notifications" }, { status: 500 })
  }
}
