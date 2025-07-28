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

    const { searchParams } = new URL(request.url)
    const roomId = searchParams.get("room") || "general"

    // Mock messages for now
    const messages = [
      {
        id: "1",
        content: "Welcome to the chat room!",
        author: "System",
        timestamp: new Date(Date.now() - 7200000).toISOString(),
        type: "text",
      },
      {
        id: "2",
        content: "Hello everyone! Great to be here.",
        author: "User123",
        timestamp: new Date(Date.now() - 3600000).toISOString(),
        type: "text",
      },
    ]

    return NextResponse.json({ messages })
  } catch (error) {
    console.error("Messages error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
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

    const { content, roomId, type } = await request.json()

    if (!content || !roomId) {
      return NextResponse.json({ error: "Content and room ID are required" }, { status: 400 })
    }

    // Mock message creation
    const message = {
      id: Date.now().toString(),
      content,
      author: user.username,
      timestamp: new Date().toISOString(),
      type: type || "text",
    }

    return NextResponse.json({ message })
  } catch (error) {
    console.error("Send message error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
