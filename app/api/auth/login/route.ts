import { type NextRequest, NextResponse } from "next/server"
import { list } from "@vercel/blob"
import { hashPassword, createToken } from "@/lib/auth"

export async function POST(request: NextRequest) {
  try {
    const { username, password } = await request.json()

    if (!username || !password) {
      return NextResponse.json({ error: "Username and password are required" }, { status: 400 })
    }

    // Get users from blob storage
    let users: any[] = []
    try {
      const { blobs } = await list({ prefix: "users.json" })
      if (blobs.length > 0) {
        const response = await fetch(blobs[0].url)
        users = await response.json()
      }
    } catch (error) {
      return NextResponse.json({ error: "No users found" }, { status: 404 })
    }

    // Find user
    const user = users.find((u) => u.username === username || u.email === username)
    if (!user) {
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 })
    }

    // Verify password
    const hashedPassword = await hashPassword(password)
    if (user.password !== hashedPassword) {
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 })
    }

    // Create token
    const token = createToken({
      id: user.id,
      username: user.username,
      display_name: user.display_name,
      email: user.email,
      created_at: user.created_at,
    })

    const userResponse = {
      id: user.id,
      username: user.username,
      display_name: user.display_name,
      email: user.email,
      avatar_url: user.avatar_url,
      created_at: user.created_at,
    }

    return NextResponse.json({ user: userResponse, token })
  } catch (error) {
    console.error("Login error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
