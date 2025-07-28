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

    // Get conversations from blob storage
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
    const userConversations = conversations.filter((conv) => conv.participants.includes(user.userId))

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

    const { participant_id, type = "private" } = await request.json()

    // Get conversations from blob storage
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
      (conv) =>
        conv.type === type && conv.participants.includes(user.userId) && conv.participants.includes(participant_id),
    )

    if (existingConversation) {
      return NextResponse.json({ conversation: existingConversation })
    }

    // Create new conversation
    const newConversation = {
      id: Date.now().toString(),
      type,
      participants: type === "general" ? ["general"] : [user.userId, participant_id],
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
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
