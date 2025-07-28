import { type NextRequest, NextResponse } from "next/server"
import { sql } from "@vercel/postgres"
import { AuthService } from "@/lib/auth"

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const authHeader = request.headers.get("authorization")
    const token = authHeader?.replace("Bearer ", "")

    if (!token) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 })
    }

    const user = await AuthService.verifyToken(token)
    if (!user) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 })
    }

    const mediaId = params.id

    // Check if user already liked this media
    const existingLike = await sql`
      SELECT id FROM likes WHERE user_id = ${user.id} AND media_id = ${mediaId}
    `

    if (existingLike.rows.length > 0) {
      // Unlike - remove the like
      await sql`
        DELETE FROM likes WHERE user_id = ${user.id} AND media_id = ${mediaId}
      `
      return NextResponse.json({ liked: false, message: "Media unliked" })
    } else {
      // Like - add the like
      await sql`
        INSERT INTO likes (user_id, media_id) VALUES (${user.id}, ${mediaId})
      `
      return NextResponse.json({ liked: true, message: "Media liked" })
    }
  } catch (error) {
    console.error("Like error:", error)
    return NextResponse.json({ error: "Failed to process like" }, { status: 500 })
  }
}
