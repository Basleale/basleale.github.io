import { type NextRequest, NextResponse } from "next/server";
import { PutObjectCommand } from "@aws-sdk/client-s3";
import { R2, R2_BUCKET_NAME, R2_PUBLIC_URL } from "@/lib/r2-client";

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const files = formData.getAll("files") as File[];
    const userName = formData.get("userName") as string;

    if (!files || files.length === 0) {
      return NextResponse.json({ error: "No files provided" }, { status: 400 });
    }

    const uploadPromises = files.map(async (file) => {
      const Body = (await file.arrayBuffer()) as Buffer;
      const key = `media/${Date.now()}-${file.name}`;
      
      const command = new PutObjectCommand({
        Bucket: R2_BUCKET_NAME,
        Key: key,
        Body,
        ContentType: file.type,
      });

      await R2.send(command);

      const fileUrl = `${R2_PUBLIC_URL}/${key}`;

      const imageExtensions = ["jpg", "jpeg", "png", "gif", "webp", "svg"];
      const videoExtensions = ["mp4", "mov", "avi", "mkv", "webm"];
      const extension = file.name.split(".").pop()?.toLowerCase() || "";
      let type: "image" | "video" = "image";
      if (videoExtensions.includes(extension)) {
        type = "video";
      }

      return {
        name: key, // Use the key as the unique name
        originalName: file.name,
        type,
        extension,
        url: fileUrl,
        size: file.size,
        uploadedAt: new Date().toISOString(),
        uploadedBy: userName || "User",
        tags: [],
      };
    });

    const uploadedFiles = await Promise.all(uploadPromises);

    return NextResponse.json({
      success: true,
      files: uploadedFiles,
    });
  } catch (error) {
    console.error("Upload error:", error);
    return NextResponse.json({ error: "Failed to upload files" }, { status: 500 });
  }
}