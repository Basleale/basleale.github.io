import { type NextRequest, NextResponse } from "next/server"
import { put, list } from "@vercel/blob"
import { hashPassword, createToken } from "@/lib/auth-utils"

export async function POST(request: NextRequest) {
  try {
    const { username, email, display_name, password } = await request.json()

    if (!username || !email || !display_name || !password) {
      return NextResponse.json({ error: "All fields are required" }, { status: 400 })
    }

    if (password.length < 6) {
      return NextResponse.json({ error: "Password must be at least 6 characters" }, { status: 400 })
    }

    // Get existing users
    let users: any[] = []
    try {
      const { blobs } = await list({ prefix: "users.json" })
      if (blobs.length > 0) {
        const response = await fetch(blobs[0].url)
        users = await response.json()
      }
    } catch (error) {
      console.log("No existing users file")
    }

    // Check if user already exists
    const existingUser = users.find((u) => u.username === username || u.email === email)
    if (existingUser) {
      return NextResponse.json({ error: "User already exists" }, { status: 400 })
    }

    // Create new user
    const hashedPassword = hashPassword(password)
    const newUser = {
      id: Date.now().toString(),
      username,
      email,
      display_name,
      password: hashedPassword,
      avatar_url: null,
      created_at: new Date().toISOString(),
    }

    users.push(newUser)

    // Save users
    await put("users.json", JSON.stringify(users, null, 2), {
      access: "public",
      contentType: "application/json",
    })

    // Create token
    const token = createToken(newUser)

    const userResponse = {
      id: newUser.id,
      username: newUser.username,
      email: newUser.email,
      display_name: newUser.display_name,
      avatar_url: newUser.avatar_url,
      created_at: newUser.created_at,
    }

    return NextResponse.json({ user: userResponse, token })
  } catch (error) {
    console.error("Registration error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
