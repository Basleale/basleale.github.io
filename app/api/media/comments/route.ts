import { type NextRequest, NextResponse } from "next/server";
import { getComments, saveComments } from "@/lib/storage";
import { randomUUID } from 'crypto';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const mediaId = searchParams.get("mediaId");

    if (!mediaId) {
      return NextResponse.json({ error: "Media ID required" }, { status: 400 });
    }

    const comments = await getComments(mediaId);
    return NextResponse.json({ comments });
  } catch (error) {
    console.error("Error fetching comments:", error);
    return NextResponse.json({ error: "Failed to fetch comments" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const { mediaId, userId, userName, userProfilePicture, content } = await request.json();

    if (!mediaId || !userId || !userName || !content) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const comments = await getComments(mediaId);

    const newComment = {
      id: randomUUID(),
      mediaId,
      userId,
      userName,
      userProfilePicture,
      content,
      createdAt: new Date().toISOString()
    };

    comments.push(newComment);
    await saveComments(mediaId, comments);

    return NextResponse.json({ comment: newComment });
  } catch (error) {
    console.error("Error creating comment:", error);
    return NextResponse.json({ error: "Failed to create comment" }, { status: 500 });
  }
}