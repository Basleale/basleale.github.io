import { NextResponse } from "next/server"
import { put } from "@vercel/blob"

export async function POST() {
  try {
    // Initialize empty text files
    const emptyContent = ""

    await Promise.all([
      put("users.txt", emptyContent, { access: "public" }),
      put("media.txt", emptyContent, { access: "public" }),
      put("messages.txt", emptyContent, { access: "public" }),
      put("conversations.txt", emptyContent, { access: "public" }),
    ])

    return NextResponse.json({ success: true, message: "Database initialized successfully" })
  } catch (error) {
    console.error("Database initialization failed:", error)
    return NextResponse.json({ success: false, message: "Failed to initialize database" }, { status: 500 })
  }
}
