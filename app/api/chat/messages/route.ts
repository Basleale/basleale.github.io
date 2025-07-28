import { type NextRequest, NextResponse } from "next/server"
import { put, list } from "@vercel/blob"
import { verifyToken } from "@/lib/auth"

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get("authorization")
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const token = authHeader.substring(7)
    const user = verifyToken(token)
    if (!user) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const conversationId = searchParams.get("conversation_id")
    const type = searchParams.get("type") || "private"

    // Get messages from blob storage
    let messages: any[] = []
    try {
      const { blobs } = await list({ prefix: "messages.json" })
      if (blobs.length > 0) {
        const response = await fetch(blobs[0].url)
        messages = await response.json()
      }
    } catch (error) {
      console.log("No messages found")
    }

    // Filter messages
    let filteredMessages = []
    if (type === "general") {
      filteredMessages = messages.filter((msg) => msg.type === "general")
    } else if (conversationId) {
      filteredMessages = messages.filter((msg) => msg.conversation_id === conversationId)
    }

    return NextResponse.json({ messages: filteredMessages })
  } catch (error) {
    console.error("Get messages error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get("authorization")
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const token = authHeader.substring(7)
    const user = verifyToken(token)
    if (!user) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 })
    }

    const { content, conversation_id, type = "text", file_url, voice_url } = await request.json()

    // Get messages from blob storage
    let messages: any[] = []
    try {
      const { blobs } = await list({ prefix: "messages.json" })
      if (blobs.length > 0) {
        const response = await fetch(blobs[0].url)
        messages = await response.json()
      }
    } catch (error) {
      console.log("No existing messages, creating new file")
    }

    // Create new message
    const newMessage = {
      id: Date.now().toString(),
      conversation_id: conversation_id || "general",
      user_id: user.userId,
      username: user.username,
      display_name: user.display_name,
      content,
      type,
      file_url,
      voice_url,
      created_at: new Date().toISOString(),
    }

    messages.push(newMessage)

    // Save messages
    await put("messages.json", JSON.stringify(messages, null, 2), {
      access: "public",
      contentType: "application/json",
    })

    return NextResponse.json({ message: newMessage })
  } catch (error) {
    console.error("Send message error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
