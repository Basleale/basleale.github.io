import { type NextRequest, NextResponse } from "next/server";
import { getUsers } from "@/lib/storage"; // Corrected import

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");

    if (!userId) {
      return NextResponse.json({ error: "User ID is required" }, { status: 400 });
    }

    // In a full implementation, we would check which users have existing
    // private message files. For now, we will return all other users
    // as potential conversation partners.
    let users = await getUsers();
    
    // Filter out the current user and remove sensitive data
    const conversations = users
      .filter(user => user.id !== userId)
      .map(({ passwordHash, ...safeUser }) => safeUser);

    return NextResponse.json({ conversations });
  } catch (error) {
    console.error("Error fetching conversations:", error);
    return NextResponse.json({ error: "Failed to fetch conversations" }, { status: 500 });
  }
}