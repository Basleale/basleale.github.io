import { NextResponse } from "next/server"
import { put } from "@vercel/blob"

export async function POST() {
  try {
    // Initialize empty data files
    const initialUsers = []
    const initialMedia = []
    const initialMessages = []
    const initialConversations = []

    // Create users.json
    await put("users.json", JSON.stringify(initialUsers, null, 2), {
      access: "public",
      contentType: "application/json",
    })

    // Create media.json
    await put("media.json", JSON.stringify(initialMedia, null, 2), {
      access: "public",
      contentType: "application/json",
    })

    // Create messages.json
    await put("messages.json", JSON.stringify(initialMessages, null, 2), {
      access: "public",
      contentType: "application/json",
    })

    // Create conversations.json
    await put("conversations.json", JSON.stringify(initialConversations, null, 2), {
      access: "public",
      contentType: "application/json",
    })

    return NextResponse.json({
      success: true,
      message: "Database initialized successfully",
    })
  } catch (error) {
    console.error("Database setup error:", error)
    return NextResponse.json(
      {
        error: "Failed to initialize database",
      },
      { status: 500 },
    )
  }
}
