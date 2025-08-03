import { type NextRequest, NextResponse } from "next/server";
import { getPublicMessages, savePublicMessages } from "@/lib/storage";
import { randomUUID } from 'crypto';

export async function GET() {
  try {
    const messages = await getPublicMessages();
    return NextResponse.json({ messages });
  } catch (error) {
    console.error("Error fetching public messages:", error);
    return NextResponse.json({ error: "Failed to fetch messages" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const { content, senderId, senderName, senderProfilePicture, type = "text", mediaUrl, mediaType } = await request.json();

    if (!senderId || !senderName) {
      return NextResponse.json({ error: "Sender information is required" }, { status: 400 });
    }

    const messages = await getPublicMessages();
    
    const newMessage = {
      id: randomUUID(),
      content,
      senderId,
      senderName,
      senderProfilePicture,
      type,
      mediaUrl,
      mediaType,
      createdAt: new Date().toISOString(),
    };

    messages.push(newMessage);
    await savePublicMessages(messages);

    return NextResponse.json({ message: newMessage });
  } catch (error) {
    console.error("Error creating public message:", error);
    return NextResponse.json({ error: "Failed to create message" }, { status: 500 });
  }
}