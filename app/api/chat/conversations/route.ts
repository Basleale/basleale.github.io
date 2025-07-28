import { type NextRequest, NextResponse } from "next/server"
import { put, list } from "@vercel/blob"
import { AuthService } from "@/lib/auth"

interface Conversation {
  id: string
  participants: string[]
  type: "private" | "general"
  created_at: string
  updated_at: string
  last_message?: {
    content: string
    author: string
    timestamp: string
  }
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

    // Get all conversations
    const { blobs } = await list({ prefix: "conversations.json" })
    let conversations: Conversation[] = []

    if (blobs.length > 0) {
      const response = await fetch(blobs[0].url)
      conversations = await response.json()
    }

    // Filter conversations for this user
    const userConversations = conversations.filter(
      (conv) => conv.type === "general" || conv.participants.includes(user.id),
    )

    // Get user details for participants
    const allUsers = await AuthService.getAllUsers()
    const conversationsWithUsers = await Promise.all(
      userConversations.map(async (conv) => {
        const participantUsers = conv.participants
          .map((id) => allUsers.find((u) => u.id === id))
          .filter(Boolean)
          .map(({ password, ...user }) => user) // Remove password

        return {
          ...conv,
          participants: participantUsers,
        }
      }),
    )

    return NextResponse.json({ conversations: conversationsWithUsers })
  } catch (error) {
    console.error("Conversations fetch error:", error)
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

    const { participantId, type } = await request.json()

    if (type === "private" && !participantId) {
      return NextResponse.json({ error: "Participant ID required for private chat" }, { status: 400 })
    }

    // Get existing conversations
    const { blobs } = await list({ prefix: "conversations.json" })
    let conversations: Conversation[] = []

    if (blobs.length > 0) {
      const response = await fetch(blobs[0].url)
      conversations = await response.json()
    }

    // Check if conversation already exists
    if (type === "private") {
      const existingConv = conversations.find(
        (conv) =>
          conv.type === "private" && conv.participants.includes(user.id) && conv.participants.includes(participantId),
      )

      if (existingConv) {
        return NextResponse.json({ conversation: existingConv })
      }
    }

    // Create new conversation
    const newConversation: Conversation = {
      id: Date.now().toString(),
      participants: type === "private" ? [user.id, participantId] : [],
      type,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }

    conversations.push(newConversation)

    // Save conversations
    const blob = new Blob([JSON.stringify(conversations, null, 2)], {
      type: "application/json",
    })
    await put("conversations.json", blob, { access: "public" })

    return NextResponse.json({ conversation: newConversation })
  } catch (error) {
    console.error("Conversation creation error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
