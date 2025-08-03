import { type NextRequest, NextResponse } from "next/server";
import { getPrivateMessages, addPrivateMessage } from "@/lib/db";

export async function GET(request: NextRequest) {
    const { searchParams } = new URL(request.url);
    const user1Id = searchParams.get("user1Id");
    const user2Id = searchParams.get("user2Id");
    if (!user1Id || !user2Id) return NextResponse.json({ error: "User IDs are required" }, { status: 400 });

    const messages = await getPrivateMessages(user1Id, user2Id);
    return NextResponse.json({ messages });
}

export async function POST(request: NextRequest) {
    const body = await request.json();
    const message = await addPrivateMessage(body);
    return NextResponse.json({ message });
}