import { type NextRequest, NextResponse } from "next/server";
import { PutObjectCommand } from "@aws-sdk/client-s3";
import { getPublicMessages, savePublicMessages } from "@/lib/storage";
import { R2, R2_BUCKET_NAME, R2_PUBLIC_URL } from "@/lib/r2-client";
import { randomUUID } from 'crypto';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const audioFile = formData.get("audio") as File;
    const senderId = formData.get("senderId") as string;
    const senderName = formData.get("senderName") as string;
    const senderProfilePicture = formData.get("senderProfilePicture") as string;


    if (!audioFile || !senderId || !senderName) {
      return NextResponse.json({ error: "Missing required form data" }, { status: 400 });
    }

    const Body = (await audioFile.arrayBuffer()) as Buffer;
    const key = `voice-messages/public/voice-${Date.now()}.webm`;
    
    const command = new PutObjectCommand({
      Bucket: R2_BUCKET_NAME,
      Key: key,
      Body,
      ContentType: audioFile.type,
    });
    
    await R2.send(command);

    const voiceUrl = `${R2_PUBLIC_URL}/${key}`;

    const messages = await getPublicMessages();
    const newMessage = {
        id: randomUUID(),
        senderId,
        senderName,
        senderProfilePicture,
        type: "voice",
        voiceUrl: voiceUrl,
        createdAt: new Date().toISOString()
    };
    messages.push(newMessage);
    await savePublicMessages(messages);

    return NextResponse.json({ message: newMessage });
  } catch (error) {
    console.error("Error creating voice message:", error);
    return NextResponse.json({ error: "Failed to create voice message" }, { status: 500 });
  }
}