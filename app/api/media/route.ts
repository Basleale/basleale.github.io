import { type NextRequest, NextResponse } from "next/server"
import { list } from "@vercel/blob"
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

    // Get media from blob storage
    let media: any[] = []
    try {
      const { blobs } = await list({ prefix: "media.json" })
      if (blobs.length > 0) {
        const response = await fetch(blobs[0].url)
        media = await response.json()
      }
    } catch (error) {
      console.log("No media found")
    }

    return NextResponse.json({ media })
  } catch (error) {
    console.error("Get media error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
