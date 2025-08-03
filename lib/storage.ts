import {
  GetObjectCommand,
  PutObjectCommand,
  DeleteObjectCommand,
  ListObjectsV2Command,
} from "@aws-sdk/client-s3";
import { R2, R2_BUCKET_NAME, streamToString } from "./r2-client";

// --- Generic Read/Write Helpers with Better Logging ---
async function getObject<T>(key: string, defaultValue: T): Promise<T> {
  try {
    const command = new GetObjectCommand({ Bucket: R2_BUCKET_NAME, Key: key });
    const response = await R2.send(command);
    const content = await streamToString(response.Body);
    // Handle case where file is empty but exists
    if (content === "") {
        return defaultValue;
    }
    return JSON.parse(content) as T;
  } catch (error: any) {
    if (error.name === "NoSuchKey") {
      // File doesn't exist, so we create it with the default value.
      console.log(`Object with key "${key}" not found. Creating it with default value.`);
      await saveObject(key, defaultValue);
      return defaultValue;
    }
    // For any other error, log it in detail and re-throw
    console.error(`Error getting object with key "${key}":`, error);
    throw new Error(`Failed to read from storage: ${error.message}`);
  }
}

async function saveObject(key: string, data: any): Promise<void> {
    try {
        const command = new PutObjectCommand({
            Bucket: R2_BUCKET_NAME,
            Key: key,
            Body: JSON.stringify(data, null, 2),
            ContentType: "application/json",
        });
        await R2.send(command);
    } catch (error: any) {
        console.error(`Error saving object with key "${key}":`, error);
        throw new Error(`Failed to write to storage: ${error.message}`);
    }
}


// --- File Keys ---
const USERS_KEY = "data/users.json";
const MEDIA_METADATA_KEY = "data/media.json";
const PUBLIC_MESSAGES_KEY = "data/public-chat.json";

// --- User Management ---
export async function getUsers() {
  return getObject<any[]>(USERS_KEY, []);
}
export async function saveUsers(users: any[]) {
  await saveObject(USERS_KEY, users);
}

// --- Media Management ---
export async function getMedia() {
    const media = await getObject<any[]>(MEDIA_METADATA_KEY, []);
    return media.sort((a, b) => new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime());
}
export async function saveMedia(media: any[]) {
  await saveObject(MEDIA_METADATA_KEY, media);
}

// --- Public Chat ---
export async function getPublicMessages() {
  return getObject<any[]>(PUBLIC_MESSAGES_KEY, []);
}
export async function savePublicMessages(messages: any[]) {
  await saveObject(PUBLIC_MESSAGES_KEY, messages);
}

// --- Private Chat (One file per conversation) ---
function getPrivateChatKey(user1Id: string, user2Id: string) {
  const sortedIds = [user1Id, user2Id].sort();
  return `data/private-chat/${sortedIds[0]}-${sortedIds[1]}.json`;
}
export async function getPrivateMessages(user1Id: string, user2Id: string) {
  const key = getPrivateChatKey(user1Id, user2Id);
  return getObject<any[]>(key, []);
}
export async function savePrivateMessages(user1Id: string, user2Id: string, messages: any[]) {
  const key = getPrivateChatKey(user1Id, user2Id);
  await saveObject(key, messages);
}

// --- Comments (One file per media item) ---
export async function getComments(mediaId: string) {
    const key = `data/comments/${mediaId}.json`;
    return getObject<any[]>(key, []);
}
export async function saveComments(mediaId: string, comments: any[]) {
    const key = `data/comments/${mediaId}.json`;
    await saveObject(key, comments);
}