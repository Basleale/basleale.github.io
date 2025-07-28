import { type NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  try {
    // Mock notifications data
    const notifications = [
      {
        id: "1",
        message: "New media uploaded by @user123",
        type: "upload",
        timestamp: new Date().toISOString(),
        read: false,
      },
      {
        id: "2",
        message: "Someone liked your photo",
        type: "like",
        timestamp: new Date(Date.now() - 3600000).toISOString(),
        read: false,
      },
    ]

    return NextResponse.json({ notifications })
  } catch (error) {
    console.error("Notifications error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
