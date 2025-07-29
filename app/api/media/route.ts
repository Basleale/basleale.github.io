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

    // Get media
    const { blobs } = await list({ prefix: "media.json" })

    if (blobs.length === 0) {
      return NextResponse.json([])
    }

    const response = await fetch(blobs[0].url)
    const media = await response.json()

    return NextResponse.json(media || [])
  } catch (error) {
    console.error("Get media error:", error)
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

    const formData = await request.formData()
    const file = formData.get("file") as File
    const title = formData.get("title") as string
    const description = formData.get("description") as string

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 })
    }

    // Upload file to blob storage
    const filename = `media/${user.userId}/${Date.now()}-${file.name}`
    const blob = await put(filename, file, {
      access: "public",
    })

    // Get existing media
    let media: any[] = []
    try {
      const { blobs } = await list({ prefix: "media.json" })
      if (blobs.length > 0) {
        const response = await fetch(blobs[0].url)
        media = await response.json()
      }
    } catch (error) {
      console.log("No existing media, creating new file")
    }

    // Create new media item
    const newMedia = {
      id: Date.now().toString(),
      url: blob.url,
      title: title || file.name,
      description: description || "",
      user: {
        id: user.userId,
        username: user.username,
        display_name: user.display_name,
      },
      likes_count: 0,
      comments_count: 0,
      is_liked: false,
      created_at: new Date().toISOString(),
    }

    media.push(newMedia)

    // Save media
    await put("media.json", JSON.stringify(media, null, 2), {
      access: "public",
      contentType: "application/json",
    })

    return NextResponse.json({ media: newMedia })
  } catch (error) {
    console.error("Upload media error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
