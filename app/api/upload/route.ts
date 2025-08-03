import { type NextRequest, NextResponse } from "next/server";
import { PutObjectCommand } from "@aws-sdk/client-s3";
import { R2, R2_BUCKET_NAME, R2_PUBLIC_URL } from "@/lib/r2-client";
import { insertMedia } from "@/lib/db";
import { randomUUID } from 'crypto';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const files = formData.getAll("files") as File[];
    const userName = formData.get("userName") as string; // You should pass userId instead
    const userId = formData.get("userId") as string;

    if (!files || files.length === 0) {
      return NextResponse.json({ error: "No files provided" }, { status: 400 });
    }

    const uploadPromises = files.map(async (file) => {
      const fileId = randomUUID();
      const extension = file.name.split(".").pop()?.toLowerCase() || "";
      const key = `media/${fileId}.${extension}`;
      const Body = (await file.arrayBuffer()) as Buffer;
      
      const command = new PutObjectCommand({
        Bucket: R2_BUCKET_NAME,
        Key: key,
        Body,
        ContentType: file.type,
      });

      await R2.send(command);

      const fileUrl = `${R2_PUBLIC_URL}/${key}`;
      const videoExtensions = ["mp4", "mov", "avi", "mkv", "webm"];
      const type = videoExtensions.includes(extension) ? "video" : "image";
      
      const mediaItem = {
          id: fileId,
          name: file.name,
          original_name: file.name,
          type,
          extension,
          url: fileUrl,
          file_size: file.size,
          uploaded_by: userId || 'unknown',
      };

      await insertMedia(mediaItem);
      return { ...mediaItem, uploadedAt: new Date().toISOString() };
    });

    const uploadedFiles = await Promise.all(uploadPromises);

    return NextResponse.json({ success: true, files: uploadedFiles });
  } catch (error) {
    console.error("Upload error:", error);
    return NextResponse.json({ error: "Failed to upload files" }, { status: 500 });
  }
}