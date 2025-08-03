import { type NextRequest, NextResponse } from "next/server";
import { PutObjectCommand } from "@aws-sdk/client-s3";
import { R2, R2_BUCKET_NAME, R2_PUBLIC_URL } from "@/lib/r2-client";
import { getMedia, saveMedia } from "@/lib/storage";
import { randomUUID } from 'crypto';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const files = formData.getAll("files") as File[];
    const userId = formData.get("userId") as string;

    if (!files || files.length === 0) {
      return NextResponse.json({ error: "No files provided" }, { status: 400 });
    }
    
    if (!userId) {
        // In a real app, you'd get this from the session, but we'll use a fallback for now
        console.warn("No userId provided for upload");
    }

    const allMedia = await getMedia();

    const uploadPromises = files.map(async (file) => {
      const fileId = randomUUID();
      const extension = file.name.split(".").pop()?.toLowerCase() || "";
      const key = `media/${fileId}.${extension}`;
      const Body = (await file.arrayBuffer()) as Buffer;
      
      const s3Command = new PutObjectCommand({
        Bucket: R2_BUCKET_NAME,
        Key: key,
        Body,
        ContentType: file.type,
      });

      await R2.send(s3Command);

      const fileUrl = `${R2_PUBLIC_URL}/${key}`;
      const videoExtensions = ["mp4", "mov", "avi", "mkv", "webm"];
      const type = videoExtensions.includes(extension) ? "video" : "image";
      
      const newMediaItem = {
          id: fileId,
          name: file.name,
          type,
          url: fileUrl,
          size: file.size,
          uploadedBy: userId || 'unknown-user',
          uploadedAt: new Date().toISOString(),
          tags: [],
          likes: [],
      };

      allMedia.push(newMediaItem);
      return newMediaItem;
    });

    const uploadedFiles = await Promise.all(uploadPromises);
    await saveMedia(allMedia); // Save the updated list of all media metadata

    return NextResponse.json({ success: true, files: uploadedFiles });
  } catch (error) {
    console.error("Upload error:", error);
    return NextResponse.json({ error: "Failed to upload files" }, { status: 500 });
  }
}