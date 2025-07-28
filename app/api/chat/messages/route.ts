import { type NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const room = searchParams.get("room") || "general"

    // Placeholder for chat messages - in a real app, this would fetch from database
    const messages = [
      {
        id: "1",
        user: "System",
        content: `Welcome to #${room}!`,
        timestamp: new Date().toISOString(),
        type: "text",
      },
    ]

    return NextResponse.json({ messages })
  } catch (error) {
    console.error("Chat messages error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const { room, message, user } = await request.json()

    // Placeholder for sending messages - in a real app, this would save to database
    const newMessage = {
      id: Date.now().toString(),
      user,
      content: message,
      timestamp: new Date().toISOString(),
      type: "text",
    }

    return NextResponse.json({ message: newMessage })
  } catch (error) {
    console.error("Send message error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
