import { type NextRequest, NextResponse } from "next/server"
import { put, list } from "@vercel/blob"
import { AuthService } from "@/lib/auth"

interface Message {
  id: string
  conversation_id: string
  content: string
  author_id: string
  author_username: string
  type: "text" | "voice" | "file"
  file_url?: string
  file_name?: string
  timestamp: string
}

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get("authorization")
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Authorization token required" }, { status: 401 })
    }

    const token = authHeader.substring(7)
    const user = await AuthService.verifyToken(token)

    if (!user) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const conversationId = searchParams.get("conversation_id")

    if (!conversationId) {
      return NextResponse.json({ error: "Conversation ID required" }, { status: 400 })
    }

    // Get messages for this conversation
    const { blobs } = await list({ prefix: `messages_${conversationId}.json` })
    let messages: Message[] = []

    if (blobs.length > 0) {
      const response = await fetch(blobs[0].url)
      messages = await response.json()
    }

    return NextResponse.json({ messages })
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
    const user = await AuthService.verifyToken(token)

    if (!user) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 })
    }

    const { conversation_id, content, type, file_url, file_name } = await request.json()

    if (!conversation_id || !content) {
      return NextResponse.json({ error: "Conversation ID and content required" }, { status: 400 })
    }

    // Get existing messages
    const { blobs } = await list({ prefix: `messages_${conversation_id}.json` })
    let messages: Message[] = []

    if (blobs.length > 0) {
      const response = await fetch(blobs[0].url)
      messages = await response.json()
    }

    // Create new message
    const newMessage: Message = {
      id: Date.now().toString(),
      conversation_id,
      content,
      author_id: user.id,
      author_username: user.username,
      type: type || "text",
      file_url,
      file_name,
      timestamp: new Date().toISOString(),
    }

    messages.push(newMessage)

    // Save messages
    const blob = new Blob([JSON.stringify(messages, null, 2)], {
      type: "application/json",
    })
    await put(`messages_${conversation_id}.json`, blob, { access: "public" })

    return NextResponse.json({ message: newMessage })
  } catch (error) {
    console.error("Message send error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
