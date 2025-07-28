import { put } from "@vercel/blob"
import { type NextRequest, NextResponse } from "next/server"
import { sql } from "@vercel/postgres"
import { AuthService } from "@/lib/auth"

export async function POST(request: NextRequest) {
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

    const formData = await request.formData()
    const file = formData.get("file") as File

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 })
    }

    // Upload to Vercel Blob
    const blob = await put(file.name, file, {
      access: "public",
    })

    // Save to database with user association
    const result = await sql`
      INSERT INTO media (user_id, filename, original_name, file_size, mime_type, url, title)
      VALUES (${user.id}, ${blob.pathname}, ${file.name}, ${file.size}, ${file.type}, ${blob.url}, ${file.name})
      RETURNING id, url, title, created_at
    `

    return NextResponse.json({
      success: true,
      media: result.rows[0],
    })
  } catch (error) {
    console.error("Upload error:", error)
    return NextResponse.json({ error: "Upload failed" }, { status: 500 })
  }
}
