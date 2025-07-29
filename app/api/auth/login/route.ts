import { type NextRequest, NextResponse } from "next/server"
import { list } from "@vercel/blob"
import { hashPassword } from "@/lib/utils"

export async function POST(request: NextRequest) {
  try {
    const { username, password } = await request.json()

    // Get existing users
    const { blobs } = await list({ prefix: "users.txt" })
    if (blobs.length === 0) {
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 })
    }

    const response = await fetch(blobs[0].url)
    const content = await response.text()

    if (!content.trim()) {
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 })
    }

    const users = content.split("\n").map((line) => JSON.parse(line))
    const user = users.find((u) => u.username === username && u.password === hashPassword(password))

    if (!user) {
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 })
    }

    // Return user without password
    const { password: _, ...userWithoutPassword } = user
    return NextResponse.json(userWithoutPassword)
  } catch (error) {
    console.error("Login failed:", error)
    return NextResponse.json({ error: "Login failed" }, { status: 500 })
  }
}
