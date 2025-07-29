import { type NextRequest, NextResponse } from "next/server"
import { put, list } from "@vercel/blob"

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get("file") as File
    const title = formData.get("title") as string
    const description = formData.get("description") as string

    if (!file || !title) {
      return NextResponse.json({ error: "File and title are required" }, { status: 400 })
    }

    // Upload file to Vercel Blob
    const blob = await put(file.name, file, {
      access: "public",
    })

    // Get current media data
    const { blobs } = await list({ prefix: "media.json" })
    let media = []

    if (blobs.length > 0) {
      const response = await fetch(blobs[0].url)
      media = await response.json()
    }

    // Create new media item
    const newMedia = {
      id: Date.now().toString(),
      title,
      description,
      url: blob.url,
      type: file.type,
      userId: "user1", // In production, get from auth token
      username: "user1",
      displayName: "User One",
      createdAt: new Date().toISOString(),
      likes: 0,
      likedBy: [],
    }

    media.unshift(newMedia)

    // Save updated media data
    await put("media.json", JSON.stringify(media, null, 2), {
      access: "public",
    })

    return NextResponse.json({ success: true, media: newMedia })
  } catch (error) {
    console.error("Upload error:", error)
    return NextResponse.json({ error: "Upload failed" }, { status: 500 })
  }
}
