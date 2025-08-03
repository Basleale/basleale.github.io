import { type NextRequest, NextResponse } from "next/server";
import { getComments, addComment } from "@/lib/db";

export async function GET(request: NextRequest) {
    const { searchParams } = new URL(request.url);
    const mediaId = searchParams.get("mediaId");
    if (!mediaId) return NextResponse.json({ error: "Media ID is required" }, { status: 400 });

    const comments = await getComments(mediaId);
    return NextResponse.json({ comments });
}

export async function POST(request: NextRequest) {
    const { mediaId, userId, userName, userProfilePicture, content } = await request.json();
    if (!mediaId || !userId || !userName || !content) {
        return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const comment = await addComment(mediaId, userId, userName, userProfilePicture, content);
    return NextResponse.json({ comment });
}