import { type NextRequest, NextResponse } from "next/server"
import { verifyToken, getUserByUsername, updateUser, userExists, hashPassword, generateToken } from "@/lib/auth"

export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get("authorization")
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Authorization token required" }, { status: 401 })
    }

    const token = authHeader.substring(7)
    const authUser = verifyToken(token)
    if (!authUser) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 })
    }

    const { username: newUsername, password: newPassword } = await request.json()

    const currentUser = await getUserByUsername(authUser.username)
    if (!currentUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    const updates: any = {}

    // Handle username change
    if (newUsername && newUsername !== authUser.username) {
      if (newUsername.length < 3) {
        return NextResponse.json({ error: "Username must be at least 3 characters long" }, { status: 400 })
      }

      const usernameExists = await userExists(newUsername)
      if (usernameExists) {
        return NextResponse.json({ error: "Username already exists" }, { status: 409 })
      }

      updates.username = newUsername
      updates.display_name = newUsername
    }

    // Handle password change
    if (newPassword) {
      if (newPassword.length < 6) {
        return NextResponse.json({ error: "Password must be at least 6 characters long" }, { status: 400 })
      }

      updates.password_hash = await hashPassword(newPassword)
    }

    const updatedUser = await updateUser(authUser.username, updates)
    if (!updatedUser) {
      return NextResponse.json({ error: "Failed to update user" }, { status: 500 })
    }

    const newAuthUser = {
      id: updatedUser.id,
      username: updatedUser.username,
      display_name: updatedUser.display_name,
      avatar_url: updatedUser.avatar_url,
    }

    const newToken = generateToken(newAuthUser)

    return NextResponse.json({
      user: newAuthUser,
      token: newToken,
    })
  } catch (error) {
    console.error("Profile update error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
