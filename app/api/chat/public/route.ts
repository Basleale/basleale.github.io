import { type NextRequest, NextResponse } from "next/server";
import { getPublicMessages, addPublicMessage } from "@/lib/db";

export async function GET() {
    const messages = await getPublicMessages();
    return NextResponse.json({ messages });
}

export async function POST(request: NextRequest) {
    const body = await request.json();
    const message = await addPublicMessage(body);
    return NextResponse.json({ message });
}