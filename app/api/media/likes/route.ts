import { type NextRequest, NextResponse } from "next/server";
import { getLikes, addLike, removeLike } from "@/lib/db";

export async function GET(request: NextRequest) {
    const { searchParams } = new URL(request.url);
    const mediaId = searchParams.get("mediaId");
    const userId = searchParams.get("userId");

    if (!mediaId) return NextResponse.json({ error: "Media ID required" }, { status: 400 });
    
    const likes = await getLikes(mediaId);
    const userLiked = userId ? likes.some(like => like.user_id === userId) : false;
    
    return NextResponse.json({ count: likes.length, userLiked });
}

export async function POST(request: NextRequest) {
    const { mediaId, userId, action } = await request.json();
    if (!mediaId || !userId || !action) {
        return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }
    
    if (action === "like") await addLike(mediaId, userId);
    else if (action === "unlike") await removeLike(mediaId, userId);
    
    return NextResponse.json({ success: true });
}