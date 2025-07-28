import { type NextRequest, NextResponse } from "next/server"
import { verifyToken } from "@/lib/auth"

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get("authorization")
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Authorization token required" }, { status: 401 })
    }

    const token = authHeader.substring(7)
    const user = verifyToken(token)
    if (!user) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 })
    }

    // Mock chat rooms - in a real app, you'd fetch from your database
    const rooms = [
      {
        id: "general",
        name: "General Chat",
        type: "public",
        participants: [],
      },
      {
        id: "creative",
        name: "Creative Corner",
        type: "public",
        participants: [],
      },
      {
        id: "tech",
        name: "Tech Talk",
        type: "public",
        participants: [],
      },
    ]

    return NextResponse.json({ rooms })
  } catch (error) {
    console.error("Chat rooms error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
