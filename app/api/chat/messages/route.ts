import { type NextRequest, NextResponse } from "next/server"

// Mock messages storage (in production, use a real database)
const messagesStore: { [room: string]: any[] } = {
  general: [
    {
      id: "1",
      content: "Welcome to Eneskench Summit!",
      author: "System",
      timestamp: new Date(Date.now() - 86400000).toISOString(),
      type: "text",
    },
    {
      id: "2",
      content: "Hey everyone! Excited to be here 🎉",
      author: "user123",
      timestamp: new Date(Date.now() - 3600000).toISOString(),
      type: "text",
    },
  ],
  media: [],
  feedback: [],
  random: [],
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const room = searchParams.get("room") || "general"

    const messages = messagesStore[room] || []

    return NextResponse.json({ messages })
  } catch (error) {
    console.error("Chat messages GET error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const { room, message } = await request.json()

    if (!room || !message) {
      return NextResponse.json({ error: "Room and message are required" }, { status: 400 })
    }

    // Initialize room if it doesn't exist
    if (!messagesStore[room]) {
      messagesStore[room] = []
    }

    // Add message to store
    messagesStore[room].push(message)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Chat messages POST error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
