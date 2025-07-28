import { type NextRequest, NextResponse } from "next/server"
import { sql } from "@vercel/postgres"
import { AuthService } from "@/lib/auth"

export async function GET(request: NextRequest) {
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

    // Fetch media with user information and like status
    const result = await sql`
      SELECT 
        m.id,
        m.url,
        m.title,
        m.description,
        m.created_at,
        u.id as user_id,
        u.username,
        u.display_name,
        u.avatar_url,
        COALESCE(like_counts.count, 0) as likes_count,
        COALESCE(comment_counts.count, 0) as comments_count,
        CASE WHEN user_likes.user_id IS NOT NULL THEN true ELSE false END as is_liked
      FROM media m
      LEFT JOIN users u ON m.user_id = u.id
      LEFT JOIN (
        SELECT media_id, COUNT(*) as count
        FROM likes
        GROUP BY media_id
      ) like_counts ON m.id = like_counts.media_id
      LEFT JOIN (
        SELECT media_id, COUNT(*) as count
        FROM comments
        GROUP BY media_id
      ) comment_counts ON m.id = comment_counts.media_id
      LEFT JOIN likes user_likes ON m.id = user_likes.media_id AND user_likes.user_id = ${user.id}
      ORDER BY m.created_at DESC
    `

    const media = result.rows.map((row) => ({
      id: row.id,
      url: row.url,
      title: row.title || "Untitled",
      description: row.description || "",
      user: {
        id: row.user_id,
        username: row.username,
        display_name: row.display_name,
        avatar_url: row.avatar_url,
      },
      likes_count: Number.parseInt(row.likes_count),
      comments_count: Number.parseInt(row.comments_count),
      is_liked: row.is_liked,
      created_at: row.created_at,
    }))

    return NextResponse.json({ media })
  } catch (error) {
    console.error("Media fetch error:", error)
    return NextResponse.json({ error: "Failed to fetch media" }, { status: 500 })
  }
}
