import { type NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get("authorization")
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json({ error: "No token provided" }, { status: 401 })
    }

    const token = authHeader.substring(7)

    // In a real app, you'd verify the JWT token here
    // For now, we'll just check if token exists and return a mock user
    if (!token) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 })
    }

    // Mock verification - in production, decode and verify JWT
    return NextResponse.json({
      id: "mock-user-id",
      username: "mockuser",
      displayName: "Mock User",
      email: "mock@example.com",
    })
  } catch (error) {
    console.error("Token verification error:", error)
    return NextResponse.json({ error: "Token verification failed" }, { status: 500 })
  }
}
