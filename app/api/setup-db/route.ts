import { type NextRequest, NextResponse } from "next/server"
import { put } from "@vercel/blob"

export async function POST(request: NextRequest) {
  try {
    // Initialize empty data files
    const users: any[] = []
    const media: any[] = []
    const messages: any[] = []
    const conversations: any[] = []

    // Create all database files
    await Promise.all([
      put("users.json", JSON.stringify(users, null, 2), { access: "public" }),
      put("media.json", JSON.stringify(media, null, 2), { access: "public" }),
      put("messages.json", JSON.stringify(messages, null, 2), { access: "public" }),
      put("conversations.json", JSON.stringify(conversations, null, 2), { access: "public" }),
    ])

    return NextResponse.json({ success: true, message: "Database initialized successfully" })
  } catch (error) {
    console.error("Database initialization error:", error)
    return NextResponse.json({ error: "Failed to initialize database" }, { status: 500 })
  }
}
