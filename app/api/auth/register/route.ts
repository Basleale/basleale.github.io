import { type NextRequest, NextResponse } from "next/server"
import { put, list } from "@vercel/blob"
import { hashPassword } from "@/lib/utils"

export async function POST(request: NextRequest) {
  try {
    const { username, email, displayName, password } = await request.json()

    // Get existing users
    const { blobs } = await list({ prefix: "users.txt" })
    let users: any[] = []

    if (blobs.length > 0) {
      const response = await fetch(blobs[0].url)
      const content = await response.text()
      if (content.trim()) {
        users = content.split("\n").map((line) => JSON.parse(line))
      }
    }

    // Check if username already exists
    if (users.some((user) => user.username === username)) {
      return NextResponse.json({ error: "Username already exists" }, { status: 400 })
    }

    // Create new user
    const newUser = {
      id: Date.now().toString(),
      username,
      email,
      displayName,
      password: hashPassword(password),
      createdAt: new Date().toISOString(),
    }

    // Add to users array
    users.push(newUser)

    // Save back to file
    const content = users.map((user) => JSON.stringify(user)).join("\n")
    await put("users.txt", content, { access: "public" })

    // Return user without password
    const { password: _, ...userWithoutPassword } = newUser
    return NextResponse.json(userWithoutPassword)
  } catch (error) {
    console.error("Registration failed:", error)
    return NextResponse.json({ error: "Registration failed" }, { status: 500 })
  }
}
