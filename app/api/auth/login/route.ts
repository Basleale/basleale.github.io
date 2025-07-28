import { type NextRequest, NextResponse } from "next/server"
import { getUserCredentials, generateToken } from "@/lib/auth"

export async function POST(request: NextRequest) {
  try {
    const { username, password } = await request.json()

    if (!username || !password) {
      return NextResponse.json({ error: "Username and password are required" }, { status: 400 })
    }

    // Get stored credentials
    const credentials = await getUserCredentials(username)
    if (!credentials) {
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 })
    }

    // Simple direct comparison
    if (credentials.username !== username || credentials.password !== password) {
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 })
    }

    // Create user object for token
    const authUser = {
      id: `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      username: credentials.username,
      display_name: credentials.username,
      avatar_url: null,
    }

    const token = generateToken(authUser)

    return NextResponse.json({
      user: authUser,
      token,
    })
  } catch (error) {
    console.error("Login error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
