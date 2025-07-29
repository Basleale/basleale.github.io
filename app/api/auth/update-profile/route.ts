import { type NextRequest, NextResponse } from "next/server"
import { put, list } from "@vercel/blob"
import { hashPassword } from "@/lib/utils"

export async function POST(request: NextRequest) {
  try {
    const { userId, displayName, currentPassword, newPassword } = await request.json()

    // Get existing users
    const { blobs } = await list({ prefix: "users.txt" })
    if (blobs.length === 0) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    const response = await fetch(blobs[0].url)
    const content = await response.text()
    const users = content.split("\n").map((line) => JSON.parse(line))

    const userIndex = users.findIndex((u) => u.id === userId)
    if (userIndex === -1) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    const user = users[userIndex]

    // If changing password, verify current password
    if (newPassword && currentPassword) {
      if (user.password !== hashPassword(currentPassword)) {
        return NextResponse.json({ error: "Current password is incorrect" }, { status: 400 })
      }
      user.password = hashPassword(newPassword)
    }

    // Update display name
    if (displayName) {
      user.displayName = displayName
    }

    users[userIndex] = user

    // Save back to file
    const newContent = users.map((u) => JSON.stringify(u)).join("\n")
    await put("users.txt", newContent, { access: "public" })

    // Return user without password
    const { password: _, ...userWithoutPassword } = user
    return NextResponse.json(userWithoutPassword)
  } catch (error) {
    console.error("Profile update failed:", error)
    return NextResponse.json({ error: "Profile update failed" }, { status: 500 })
  }
}
