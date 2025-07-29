import { type NextRequest, NextResponse } from "next/server"
import { put } from "@vercel/blob"
import { verifyToken } from "@/lib/auth-utils"

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
    const audioBlob = formData.get("audio") as File

    if (!audioBlob) {
      return NextResponse.json({ error: "No audio provided" }, { status: 400 })
    }

    // Upload audio to blob storage
    const filename = `voice/${user.userId}/${Date.now()}.webm`
    const blob = await put(filename, audioBlob, {
      access: "public",
    })

    return NextResponse.json({
      url: blob.url,
      filename: `voice-${Date.now()}.webm`,
    })
  } catch (error) {
    console.error("Voice upload error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
