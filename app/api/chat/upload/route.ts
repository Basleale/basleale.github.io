import { type NextRequest, NextResponse } from "next/server";
import { PutObjectCommand } from "@aws-sdk/client-s3";
import { R2, R2_BUCKET_NAME, R2_PUBLIC_URL } from "@/lib/r2-client";

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    const Body = (await file.arrayBuffer()) as Buffer;
    const key = `chat-media/${Date.now()}-${file.name}`;

    const command = new PutObjectCommand({
      Bucket: R2_BUCKET_NAME,
      Key: key,
      Body,
      ContentType: file.type,
    });

    await R2.send(command);

    const fileUrl = `${R2_PUBLIC_URL}/${key}`;

    return NextResponse.json({ success: true, url: fileUrl });
  } catch (error) {
    console.error("Chat upload error:", error);
    return NextResponse.json({ error: "Failed to upload file" }, { status: 500 });
  }
}