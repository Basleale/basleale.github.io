import { type NextRequest, NextResponse } from "next/server"
import { getUsers, saveUsers, verifyPassword, hashPassword } from "@/lib/auth-utils"

export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get("authorization")
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json({ error: "No token provided" }, { status: 401 })
    }

    const { displayName, currentPassword, newPassword } = await request.json()

    if (!displayName) {
      return NextResponse.json({ error: "Display name is required" }, { status: 400 })
    }

    const users = await getUsers()

    // In a real app, you'd decode the JWT to get user ID
    // For now, we'll find the first user as a mock
    const userIndex = users.findIndex((user) => user.id)

    if (userIndex === -1) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    const user = users[userIndex]

    // If changing password, verify current password
    if (newPassword) {
      if (!currentPassword || !verifyPassword(currentPassword, user.password)) {
        return NextResponse.json({ error: "Current password is incorrect" }, { status: 400 })
      }
      user.password = hashPassword(newPassword)
    }

    user.displayName = displayName
    users[userIndex] = user

    await saveUsers(users)

    // Return user data without password
    const { password: _, ...userWithoutPassword } = user

    return NextResponse.json({
      success: true,
      user: userWithoutPassword,
    })
  } catch (error) {
    console.error("Profile update error:", error)
    return NextResponse.json({ error: "Profile update failed" }, { status: 500 })
  }
}
