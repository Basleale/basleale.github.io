import { type NextRequest, NextResponse } from "next/server"
import { put, list } from "@vercel/blob"

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { blobs } = await list({ prefix: "media.json" })

    if (blobs.length === 0) {
      return NextResponse.json({ error: "No media found" }, { status: 404 })
    }

    const response = await fetch(blobs[0].url)
    const media = await response.json()

    const mediaIndex = media.findIndex((item: any) => item.id === params.id)
    if (mediaIndex === -1) {
      return NextResponse.json({ error: "Media not found" }, { status: 404 })
    }

    const userId = "user1" // In production, get from auth token
    const mediaItem = media[mediaIndex]

    if (!mediaItem.likedBy) {
      mediaItem.likedBy = []
    }

    if (mediaItem.likedBy.includes(userId)) {
      // Unlike
      mediaItem.likedBy = mediaItem.likedBy.filter((id: string) => id !== userId)
      mediaItem.likes = Math.max(0, (mediaItem.likes || 0) - 1)
    } else {
      // Like
      mediaItem.likedBy.push(userId)
      mediaItem.likes = (mediaItem.likes || 0) + 1
    }

    media[mediaIndex] = mediaItem

    // Save updated media data
    await put("media.json", JSON.stringify(media, null, 2), {
      access: "public",
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Like error:", error)
    return NextResponse.json({ error: "Like failed" }, { status: 500 })
  }
}
