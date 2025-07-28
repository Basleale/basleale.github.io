import { type NextRequest, NextResponse } from "next/server"
import { verifyToken } from "@/lib/auth"

// Mock messages storage - in a real app, you'd use a database
const messages: any[] = [
  {
    id: "1",
    content: "Welcome to Eneskench Summit! 🎉",
    sender_id: "system",
    sender_username: "System",
    created_at: new Date().toISOString(),
    type: "text",
    room_id: "general",
  },
]

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

    const { searchParams } = new URL(request.url)
    const roomId = searchParams.get("room") || "general"

    const roomMessages = messages.filter((msg) => msg.room_id === roomId)

    return NextResponse.json({ messages: roomMessages })
  } catch (error) {
    console.error("Messages fetch error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
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

    const { content, room_id, type = "text", media_url } = await request.json()

    if (!content || !room_id) {
      return NextResponse.json({ error: "Content and room_id are required" }, { status: 400 })
    }

    const newMessage = {
      id: `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      content,
      sender_id: user.id,
      sender_username: user.username,
      created_at: new Date().toISOString(),
      type,
      room_id,
      media_url,
    }

    messages.push(newMessage)

    return NextResponse.json({ message: newMessage })
  } catch (error) {
    console.error("Message send error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
