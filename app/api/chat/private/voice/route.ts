import { type NextRequest, NextResponse } from "next/server";
import { PutObjectCommand } from "@aws-sdk/client-s3";
import { getPrivateMessages, savePrivateMessages } from "@/lib/storage";
import { R2, R2_BUCKET_NAME, R2_PUBLIC_URL } from "@/lib/r2-client";
import { randomUUID } from 'crypto';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const audioFile = formData.get("audio") as File;
    const senderId = formData.get("senderId") as string;
    const senderName = formData.get("senderName") as string;
    const receiverId = formData.get("receiverId") as string;
    const receiverName = formData.get("receiverName") as string;

    if (!audioFile || !senderId || !receiverId) {
      return NextResponse.json({ error: "Missing required form data" }, { status: 400 });
    }

    const Body = (await audioFile.arrayBuffer()) as Buffer;
    const key = `voice-messages/private/voice-${Date.now()}.webm`;

    const command = new PutObjectCommand({
      Bucket: R2_BUCKET_NAME,
      Key: key,
      Body,
      ContentType: audioFile.type,
    });
    
    await R2.send(command);
    
    const voiceUrl = `${R2_PUBLIC_URL}/${key}`;

    const messages = await getPrivateMessages(senderId, receiverId);
    const newMessage = {
      id: randomUUID(),
      voiceUrl: voiceUrl,
      senderId,
      senderName,
      receiverId,
      receiverName,
      type: "voice",
      createdAt: new Date().toISOString()
    };
    messages.push(newMessage);
    await savePrivateMessages(senderId, receiverId, messages);

    return NextResponse.json({ message: newMessage });
  } catch (error) {
    console.error("Error creating voice message:", error);
    return NextResponse.json({ error: "Failed to create voice message" }, { status: 500 });
  }
}