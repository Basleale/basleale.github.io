import { type NextRequest, NextResponse } from "next/server";
import { getConversations } from "@/lib/db";

export async function GET(request: NextRequest) {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");
    if (!userId) return NextResponse.json({ error: "User ID is required" }, { status: 400 });
    
    const conversations = await getConversations(userId);
    return NextResponse.json({ conversations });
}