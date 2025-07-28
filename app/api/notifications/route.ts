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

    // Mock notifications for now
    const notifications = [
      {
        id: "1",
        title: "New Upload",
        message: "Someone uploaded new content to the platform",
        timestamp: new Date().toISOString(),
        read: false,
      },
      {
        id: "2",
        title: "Like Received",
        message: "Your content received a new like",
        timestamp: new Date(Date.now() - 3600000).toISOString(),
        read: false,
      },
    ]

    return NextResponse.json({ notifications })
  } catch (error) {
    console.error("Notifications error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
