import { type NextRequest, NextResponse } from "next/server";
import { getMedia, saveMedia } from "@/lib/storage";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const mediaId = searchParams.get("mediaId");
    const userId = searchParams.get("userId");

    if (!mediaId) {
      return NextResponse.json({ error: "Media ID required" }, { status: 400 });
    }

    const allMedia = await getMedia();
    const mediaItem = allMedia.find(m => m.id === mediaId);
    
    if (!mediaItem) {
        return NextResponse.json({ count: 0, userLiked: false });
    }

    const likes = mediaItem.likes || [];
    const userLiked = userId ? likes.includes(userId) : false;

    return NextResponse.json({ count: likes.length, userLiked });
  } catch (error) {
    console.error("Error fetching likes:", error);
    return NextResponse.json({ error: "Failed to fetch likes" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const { mediaId, userId, action } = await request.json();
    if (!mediaId || !userId || !action) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const allMedia = await getMedia();
    const mediaIndex = allMedia.findIndex(m => m.id === mediaId);

    if (mediaIndex === -1) {
        return NextResponse.json({ error: "Media not found" }, { status: 404 });
    }

    // Ensure the likes array exists
    if (!allMedia[mediaIndex].likes) {
        allMedia[mediaIndex].likes = [];
    }

    if (action === "like") {
        if (!allMedia[mediaIndex].likes.includes(userId)) {
            allMedia[mediaIndex].likes.push(userId);
        }
    } else if (action === "unlike") {
        allMedia[mediaIndex].likes = allMedia[mediaIndex].likes.filter((id: string) => id !== userId);
    }

    await saveMedia(allMedia);

    return NextResponse.json({ success: true, count: allMedia[mediaIndex].likes.length });
  } catch (error) {
    console.error("Error updating like:", error);
    return NextResponse.json({ error: "Failed to update like" }, { status: 500 });
  }
}