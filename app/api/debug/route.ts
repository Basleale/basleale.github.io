import { NextResponse } from "next/server";
import { getMedia } from "@/lib/storage"; // Updated import

export async function GET() {
  try {
    // Check if we can read the media metadata from R2
    const mediaMetadata = await getMedia();

    return NextResponse.json({
      message: "Successfully connected to R2 and fetched media metadata.",
      media_count: mediaMetadata.length,
      sample_item: mediaMetadata.length > 0 ? mediaMetadata[0] : "No media found."
    });
  } catch (error) {
    console.error("Debug error:", error);
    return NextResponse.json({ error: (error as Error).message }, { status: 500 });
  }
}