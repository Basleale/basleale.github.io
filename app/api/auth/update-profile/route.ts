import { type NextRequest, NextResponse } from "next/server"
import { put, list } from "@vercel/blob"
import { verifyToken, hashPassword } from "@/lib/auth"

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

    const { display_name, current_password, new_password } = await request.json()

    // Get users from blob storage
    let users: any[] = []
    try {
      const { blobs } = await list({ prefix: "users.json" })
      if (blobs.length > 0) {
        const response = await fetch(blobs[0].url)
        users = await response.json()
      }
    } catch (error) {
      return NextResponse.json({ error: "Users not found" }, { status: 404 })
    }

    // Find and update user
    const userIndex = users.findIndex((u) => u.id === user.userId)
    if (userIndex === -1) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    const existingUser = users[userIndex]

    // Update display name if provided
    if (display_name) {
      existingUser.display_name = display_name
    }

    // Update password if provided
    if (current_password && new_password) {
      const currentHashedPassword = await hashPassword(current_password)
      if (existingUser.password !== currentHashedPassword) {
        return NextResponse.json({ error: "Current password is incorrect" }, { status: 400 })
      }
      existingUser.password = await hashPassword(new_password)
    }

    users[userIndex] = existingUser

    // Save updated users
    await put("users.json", JSON.stringify(users, null, 2), {
      access: "public",
      contentType: "application/json",
    })

    const userResponse = {
      id: existingUser.id,
      username: existingUser.username,
      display_name: existingUser.display_name,
      email: existingUser.email,
      avatar_url: existingUser.avatar_url,
      created_at: existingUser.created_at,
    }

    return NextResponse.json({ user: userResponse })
  } catch (error) {
    console.error("Profile update error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
