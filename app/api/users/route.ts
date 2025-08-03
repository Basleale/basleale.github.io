import { type NextRequest, NextResponse } from "next/server";
import { getAllUsers } from "@/lib/db";

export async function GET(request: NextRequest) {
    const { searchParams } = new URL(request.url);
    const currentUserId = searchParams.get("currentUserId");

    if (!currentUserId) {
        return NextResponse.json({ error: "Current user ID is required" }, { status: 400 });
    }

    const users = await getAllUsers(currentUserId);
    return NextResponse.json({ users });
}