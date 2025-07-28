import { type NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  try {
    // Placeholder for notifications - in a real app, this would fetch from database
    const notifications = [
      "New media uploaded by user123",
      "Your post received 5 likes",
      "Someone commented on your video",
    ]

    return NextResponse.json({ notifications })
  } catch (error) {
    console.error("Notifications error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
