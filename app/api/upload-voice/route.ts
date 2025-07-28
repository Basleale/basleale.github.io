import { put } from "@vercel/blob"
import { type NextRequest, NextResponse } from "next/server"
import { AuthService } from "@/lib/auth"

export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get("authorization")
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Authorization token required" }, { status: 401 })
    }

    const token = authHeader.substring(7)
    const user = await AuthService.verifyToken(token)

    if (!user) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 })
    }

    const formData = await request.formData()
    const audioFile = formData.get("audio") as File

    if (!audioFile) {
      return NextResponse.json({ error: "No audio file provided" }, { status: 400 })
    }

    // Upload voice message to Vercel Blob
    const filename = `voice_${user.id}_${Date.now()}.webm`
    const blob = await put(filename, audioFile, {
      access: "public",
    })

    return NextResponse.json({
      url: blob.url,
      filename: filename,
    })
  } catch (error) {
    console.error("Voice upload error:", error)
    return NextResponse.json({ error: "Upload failed" }, { status: 500 })
  }
}
