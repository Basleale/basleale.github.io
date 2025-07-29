import { type NextRequest, NextResponse } from "next/server"
import { getUsers, saveUsers, hashPassword, generateToken } from "@/lib/auth-utils"

export async function POST(request: NextRequest) {
  try {
    const { username, email, password, displayName } = await request.json()

    if (!username || !email || !password || !displayName) {
      return NextResponse.json({ error: "All fields are required" }, { status: 400 })
    }

    const users = await getUsers()

    // Check if user already exists
    if (users.find((user) => user.username === username)) {
      return NextResponse.json({ error: "Username already exists" }, { status: 400 })
    }

    if (users.find((user) => user.email === email)) {
      return NextResponse.json({ error: "Email already exists" }, { status: 400 })
    }

    // Create new user
    const newUser = {
      id: generateToken(),
      username,
      email,
      displayName,
      password: hashPassword(password),
      createdAt: new Date().toISOString(),
    }

    users.push(newUser)
    await saveUsers(users)

    // Generate auth token
    const token = generateToken()

    // Return user data without password
    const { password: _, ...userWithoutPassword } = newUser

    return NextResponse.json({
      success: true,
      token,
      user: userWithoutPassword,
    })
  } catch (error) {
    console.error("Registration error:", error)
    return NextResponse.json({ error: "Registration failed" }, { status: 500 })
  }
}
