import { type NextRequest, NextResponse } from "next/server"
import { storeUserCredentials, userExists, generateToken } from "@/lib/auth"

export async function POST(request: NextRequest) {
  try {
    const { username, password } = await request.json()

    if (!username || !password) {
      return NextResponse.json({ error: "Username and password are required" }, { status: 400 })
    }

    if (username.length < 3) {
      return NextResponse.json({ error: "Username must be at least 3 characters long" }, { status: 400 })
    }

    if (password.length < 6) {
      return NextResponse.json({ error: "Password must be at least 6 characters long" }, { status: 400 })
    }

    // Check if user already exists
    const exists = await userExists(username)
    if (exists) {
      return NextResponse.json({ error: "Username already exists" }, { status: 409 })
    }

    // Store user credentials
    const success = await storeUserCredentials(username, password)
    if (!success) {
      return NextResponse.json({ error: "Failed to create user" }, { status: 500 })
    }

    // Create user object for token
    const authUser = {
      id: `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      username: username,
      display_name: username,
      avatar_url: null,
    }

    const token = generateToken(authUser)

    return NextResponse.json({
      user: authUser,
      token,
    })
  } catch (error) {
    console.error("Registration error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
