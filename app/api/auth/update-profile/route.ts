import { type NextRequest, NextResponse } from "next/server"
import { verifyToken, updateUser, hashPassword, generateToken, userExists } from "@/lib/auth"

export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get("authorization")
    const token = authHeader?.replace("Bearer ", "")

    if (!token) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 })
    }

    const currentUser = verifyToken(token)
    if (!currentUser) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 })
    }

    const { username, password } = await request.json()
    const updates: any = {}

    if (password) {
      updates.password_hash = await hashPassword(password)
    }

    if (username && username !== currentUser.username) {
      // Check if new username already exists
      const exists = await userExists(username)
      if (exists) {
        return NextResponse.json({ error: "Username already exists" }, { status: 400 })
      }
      updates.username = username
      updates.display_name = username
    }

    const updatedUser = await updateUser(currentUser.username, updates)
    if (!updatedUser) {
      return NextResponse.json({ error: "Failed to update profile" }, { status: 500 })
    }

    const authUser = {
      id: updatedUser.id,
      username: updatedUser.username,
      display_name: updatedUser.display_name,
      avatar_url: updatedUser.avatar_url,
    }

    // Generate new token if username changed
    const newToken = username && username !== currentUser.username ? generateToken(authUser) : undefined

    return NextResponse.json({
      user: authUser,
      token: newToken,
    })
  } catch (error) {
    console.error("Profile update error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
