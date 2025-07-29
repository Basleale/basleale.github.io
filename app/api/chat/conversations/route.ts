import { type NextRequest, NextResponse } from "next/server"
import { put, list } from "@vercel/blob"
import { verifyToken } from "@/lib/auth-utils"

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

    // Get conversations
    let conversations: any[] = []
    try {
      const { blobs } = await list({ prefix: "conversations.json" })
      if (blobs.length > 0) {
        const response = await fetch(blobs[0].url)
        conversations = await response.json()
      }
    } catch (error) {
      console.log("No conversations found")
    }

    // Filter conversations for current user
    const userConversations = conversations.filter((c) => c.participants.includes(user.userId))

    return NextResponse.json({ conversations: userConversations })
  } catch (error) {
    console.error("Get conversations error:", error)
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

    const { participant_id } = await request.json()

    if (!participant_id) {
      return NextResponse.json({ error: "Participant ID required" }, { status: 400 })
    }

    // Get existing conversations
    let conversations: any[] = []
    try {
      const { blobs } = await list({ prefix: "conversations.json" })
      if (blobs.length > 0) {
        const response = await fetch(blobs[0].url)
        conversations = await response.json()
      }
    } catch (error) {
      console.log("No existing conversations, creating new file")
    }

    // Check if conversation already exists
    const existingConversation = conversations.find(
      (c) => c.participants.includes(user.userId) && c.participants.includes(participant_id),
    )

    if (existingConversation) {
      return NextResponse.json({ conversation: existingConversation })
    }

    // Create new conversation
    const newConversation = {
      id: Date.now().toString(),
      participants: [user.userId, participant_id],
      created_at: new Date().toISOString(),
    }

    conversations.push(newConversation)

    // Save conversations
    await put("conversations.json", JSON.stringify(conversations, null, 2), {
      access: "public",
      contentType: "application/json",
    })

    return NextResponse.json({ conversation: newConversation })
  } catch (error) {
    console.error("Create conversation error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
