import { type NextRequest, NextResponse } from "next/server"
import { put, list } from "@vercel/blob"

export async function GET() {
  try {
    const { blobs } = await list({ prefix: "media.txt" })
    if (blobs.length === 0) {
      return NextResponse.json([])
    }

    const response = await fetch(blobs[0].url)
    const content = await response.text()

    if (!content.trim()) {
      return NextResponse.json([])
    }

    const media = content.split("\n").map((line) => JSON.parse(line))
    return NextResponse.json(media.reverse()) // Most recent first
  } catch (error) {
    console.error("Failed to fetch media:", error)
    return NextResponse.json([])
  }
}

export async function POST(request: NextRequest) {
  try {
    const { title, description, userId, username, fileUrl, fileType } = await request.json()

    // Get existing media
    const { blobs } = await list({ prefix: "media.txt" })
    let media: any[] = []

    if (blobs.length > 0) {
      const response = await fetch(blobs[0].url)
      const content = await response.text()
      if (content.trim()) {
        media = content.split("\n").map((line) => JSON.parse(line))
      }
    }

    // Create new media entry
    const newMedia = {
      id: Date.now().toString(),
      title,
      description,
      userId,
      username,
      fileUrl,
      fileType,
      likes: 0,
      createdAt: new Date().toISOString(),
    }

    // Add to media array
    media.push(newMedia)

    // Save back to file
    const content = media.map((m) => JSON.stringify(m)).join("\n")
    await put("media.txt", content, { access: "public" })

    return NextResponse.json(newMedia)
  } catch (error) {
    console.error("Failed to create media:", error)
    return NextResponse.json({ error: "Failed to create media" }, { status: 500 })
  }
}
