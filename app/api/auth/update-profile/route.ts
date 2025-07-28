import { type NextRequest, NextResponse } from "next/server"
import { verifyToken, updateUserPassword } from "@/lib/auth"

export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get("authorization")
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json({ error: "No token provided" }, { status: 401 })
    }

    const token = authHeader.substring(7)
    const user = verifyToken(token)

    if (!user) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 })
    }

    const { new_password } = await request.json()

    // Update password if new_password is provided
    if (new_password) {
      if (new_password.length < 6) {
        return NextResponse.json({ error: "Password must be at least 6 characters long" }, { status: 400 })
      }

      const passwordUpdated = await updateUserPassword(user.username, new_password)
      if (!passwordUpdated) {
        return NextResponse.json({ error: "Failed to update password" }, { status: 500 })
      }
    }

    return NextResponse.json({ message: "Profile updated successfully" })
  } catch (error) {
    console.error("Profile update error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
