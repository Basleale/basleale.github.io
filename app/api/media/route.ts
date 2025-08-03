import { NextResponse } from "next/server";
import { ListObjectsV2Command, DeleteObjectCommand } from "@aws-sdk/client-s3";
import { R2, R2_BUCKET_NAME, R2_PUBLIC_URL } from "@/lib/r2-client";

export async function GET() {
  try {
    const command = new ListObjectsV2Command({
      Bucket: R2_BUCKET_NAME,
      Prefix: "media/",
    });
    const { Contents } = await R2.send(command);
    if (!Contents) {
        return NextResponse.json({ media: [] });
    }

    const media = Contents.map((item) => {
        const url = `${R2_PUBLIC_URL}/${item.Key}`;
        const name = item.Key!.split("/").pop()!;
        const extension = name.split(".").pop()?.toLowerCase() || "";

        const videoExtensions = ["mp4", "mov", "avi", "mkv", "webm"];
        const type: "image" | "video" = videoExtensions.includes(extension) ? "video" : "image";

        return {
            id: url,
            name: name,
            originalName: name,
            type,
            extension,
            url: url,
            blobUrl: url,
            size: item.Size,
            uploadedAt: item.LastModified,
            uploadedBy: "User",
            tags: [],
        };
    });

    const sortedMedia = media.sort((a, b) => new Date(b.uploadedAt!).getTime() - new Date(a.uploadedAt!).getTime());
    return NextResponse.json({ media: sortedMedia });
  } catch (error) {
    console.error("Error fetching media from R2:", error);
    return NextResponse.json({ media: [] });
  }
}

export async function DELETE(request: Request) {
    try {
      const { ids } = await request.json(); // ids are the full URLs
  
      const deletePromises = ids.map(async (url: string) => {
        try {
          const key = url.replace(`${R2_PUBLIC_URL}/`, "");
          const command = new DeleteObjectCommand({ Bucket: R2_BUCKET_NAME, Key: key });
          await R2.send(command);
          return { id: url, success: true };
        } catch (error) {
          console.error(`Failed to delete blob ${url}:`, error);
          return { id: url, success: false, error: (error as Error).message };
        }
      });
  
      const deleteResults = await Promise.all(deletePromises);
  
      return NextResponse.json({
        success: true,
        deletedCount: deleteResults.filter(r => r.success).length,
        blobDeletionResults: deleteResults,
      });
    } catch (error) {
      console.error("Error in DELETE /api/media:", error);
      return NextResponse.json({ error: "Failed to delete media" }, { status: 500 });
    }
}