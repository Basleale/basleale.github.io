import { type NextRequest, NextResponse } from "next/server";
import { getPrivateMessages, savePrivateMessages } from "@/lib/storage";
import { randomUUID } from 'crypto';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const user1Id = searchParams.get("user1Id");
    const user2Id = searchParams.get("user2Id");

    if (!user1Id || !user2Id) {
      return NextResponse.json({ error: "Valid User IDs required" }, { status: 400 });
    }

    const messages = await getPrivateMessages(user1Id, user2Id);
    return NextResponse.json({ messages });
  } catch (error) {
    console.error("Error fetching private messages:", error);
    return NextResponse.json({ error: "Failed to fetch messages" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const { content, senderId, senderName, senderProfilePicture, receiverId, receiverName, type = "text", mediaUrl, mediaType } = await request.json();

    if (!senderId || !receiverId) {
      return NextResponse.json({ error: "Sender and receiver IDs are required" }, { status: 400 });
    }

    const messages = await getPrivateMessages(senderId, receiverId);

    const newMessage = {
      id: randomUUID(),
      content,
      senderId,
      senderName,
      senderProfilePicture,
      receiverId,
      receiverName,
      type,
      mediaUrl,
      mediaType,
      createdAt: new Date().toISOString(),
    };

    messages.push(newMessage);
    await savePrivateMessages(senderId, receiverId, messages);

    return NextResponse.json({ message: newMessage });
  } catch (error) {
    console.error("Error creating private message:", error);
    return NextResponse.json({ error: "Failed to create message" }, { status: 500 });
  }
}