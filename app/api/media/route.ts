import { NextResponse } from "next/server";
import { getMedia, saveMedia } from "@/lib/storage";
import { DeleteObjectCommand } from "@aws-sdk/client-s3";
import { R2, R2_BUCKET_NAME, R2_PUBLIC_URL } from "@/lib/r2-client";

export async function GET() {
  try {
    const media = await getMedia();
    return NextResponse.json({ media });
  } catch (error) {
    console.error("Error fetching media:", error);
    return NextResponse.json({ error: "Failed to fetch media" }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
    try {
      const { ids } = await request.json(); // These are the media item IDs
      if (!ids || !Array.isArray(ids)) {
        return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
      }

      let allMedia = await getMedia();
      
      const itemsToDelete = allMedia.filter(item => ids.includes(item.id));
      const urlsToDelete = itemsToDelete.map(item => item.url);

      // Delete from R2
      const deletePromises = urlsToDelete.map(async (url: string) => {
        const key = url.replace(`${R2_PUBLIC_URL}/`, "");
        const command = new DeleteObjectCommand({ Bucket: R2_BUCKET_NAME, Key: key });
        await R2.send(command);
      });
      await Promise.all(deletePromises);
      
      // Filter out deleted items from metadata and save
      const updatedMedia = allMedia.filter(item => !ids.includes(item.id));
      await saveMedia(updatedMedia);
  
      return NextResponse.json({ success: true, message: "Media deleted successfully." });
    } catch (error) {
      console.error("Error deleting media:", error);
      return NextResponse.json({ error: "Failed to delete media" }, { status: 500 });
    }
}