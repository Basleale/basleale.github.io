import { type NextRequest, NextResponse } from "next/server"
import { createUser, userExists, generateToken } from "@/lib/auth"

export async function POST(request: NextRequest) {
  try {
    const { username, password } = await request.json()

    if (!username || !password) {
      return NextResponse.json({ error: "Username and password are required" }, { status: 400 })
    }

    if (username.length < 3) {
      return NextResponse.json({ error: "Username must be at least 3 characters long" }, { status: 400 })
    }

    if (password.length < 6) {
      return NextResponse.json({ error: "Password must be at least 6 characters long" }, { status: 400 })
    }

    const exists = await userExists(username)
    if (exists) {
      return NextResponse.json({ error: "Username already exists" }, { status: 400 })
    }

    const user = await createUser(username, password)
    const token = generateToken({ id: user.id, username: user.username })

    return NextResponse.json({
      user: { id: user.id, username: user.username },
      token,
    })
  } catch (error) {
    console.error("Registration error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
