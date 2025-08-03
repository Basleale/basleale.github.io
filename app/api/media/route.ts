import { NextResponse } from "next/server";
import { getAllMedia, deleteMediaItems } from "@/lib/db";
import { DeleteObjectCommand } from "@aws-sdk/client-s3";
import { R2, R2_BUCKET_NAME, R2_PUBLIC_URL } from "@/lib/r2-client";

export async function GET() {
  try {
    const media = await getAllMedia();
    return NextResponse.json({ media });
  } catch (error) {
    console.error("Error fetching media:", error);
    return NextResponse.json({ error: "Failed to fetch media" }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
    try {
      const { ids, urls } = await request.json(); // ids from db, urls from R2
  
      // Delete from R2
      const deletePromises = urls.map(async (url: string) => {
        const key = url.replace(`${R2_PUBLIC_URL}/`, "");
        const command = new DeleteObjectCommand({ Bucket: R2_BUCKET_NAME, Key: key });
        await R2.send(command);
      });
      
      await Promise.all(deletePromises);
      
      // Delete from Database
      await deleteMediaItems(ids);
  
      return NextResponse.json({ success: true, message: "Media deleted successfully." });
    } catch (error) {
      console.error("Error deleting media:", error);
      return NextResponse.json({ error: "Failed to delete media" }, { status: 500 });
    }
}