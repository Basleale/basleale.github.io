import {
  PutObjectCommand,
  ListObjectsV2Command,
  DeleteObjectCommand,
  GetObjectCommand
} from "@aws-sdk/client-s3";
import { R2, R2_BUCKET_NAME, streamToString, R2_PUBLIC_URL } from "./r2-client";

// ... (Interfaces remain the same) ...
export interface MediaItem {
    id: string
    name: string
    original_name: string
    type: "image" | "video"
    extension: string
    blob_url: string
    file_size: number
    uploaded_at: string
    uploaded_by: string
    tags: string[]
    created_at: string
    updated_at: string
    url?: string
  }
  
  export interface User {
    id: string
    name: string
    email: string
    password_hash: string
    created_at: string
    updated_at: string
    profilePicture?: string
  }

async function listAndFetchDb(prefix: string) {
    const listCommand = new ListObjectsV2Command({ Bucket: R2_BUCKET_NAME, Prefix: prefix });
    const { Contents } = await R2.send(listCommand);
    if (!Contents) return [];

    const objects = await Promise.all(Contents.map(async (item) => {
        try {
            const getCommand = new GetObjectCommand({ Bucket: R2_BUCKET_NAME, Key: item.Key });
            const response = await R2.send(getCommand);
            const content = await streamToString(response.Body);
            return JSON.parse(content);
        } catch (e) {
            return null;
        }
    }));
    return objects.filter(Boolean);
}

export class MediaDatabase {
  static async getAllMedia(): Promise<MediaItem[]> {
    const items = await listAndFetchDb("media-items/");
    return items
        .map((item: MediaItem) => ({ ...item, url: item.blob_url }))
        .sort((a, b) => new Date(b.uploaded_at).getTime() - new Date(a.uploaded_at).getTime());
  }

  static async insertMedia(mediaItems: Omit<MediaItem, "id" | "created_at" | "updated_at">[]): Promise<MediaItem[]> {
    const insertedItems: MediaItem[] = [];
    for (const item of mediaItems) {
      const id = `media_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      const fullItem: MediaItem = {
        ...item,
        id,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        url: item.blob_url,
      };

      const command = new PutObjectCommand({
        Bucket: R2_BUCKET_NAME,
        Key: `media-items/${id}.json`,
        Body: JSON.stringify(fullItem),
        ContentType: "application/json",
      });
      await R2.send(command);
      insertedItems.push(fullItem);
    }
    return insertedItems;
  }
}