import { type NextRequest, NextResponse } from "next/server"
import { getUserCredentials, getUserProfile, generateToken, updateUserProfile } from "@/lib/auth"

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

    // Simple direct comparison - no hashing needed
    if (credentials.username !== username || credentials.password !== password) {
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 })
    }

    // Get user profile
    const userProfile = await getUserProfile(username)
    if (!userProfile) {
      return NextResponse.json({ error: "User profile not found" }, { status: 404 })
    }

    // Update last active
    await updateUserProfile(username, { last_active: new Date().toISOString() })

    const authUser = {
      id: userProfile.id,
      username: userProfile.username,
      display_name: userProfile.display_name,
      avatar_url: userProfile.avatar_url,
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
