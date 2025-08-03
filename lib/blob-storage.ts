// lib/blob-storage.ts
import {
  ListObjectsV2Command,
  PutObjectCommand,
  GetObjectCommand,
} from "@aws-sdk/client-s3";
import { R2, R2_BUCKET_NAME, streamToString } from "./r2-client";

export interface BlobUser {
  id: string;
  name: string;
  email: string;
  passwordHash: string;
  profilePicture?: string;
  createdAt: string;
}

const USERS_FILE = "authentication/users.json";

export class BlobStorage {
  static async getUsers(): Promise<BlobUser[]> {
    try {
      const command = new GetObjectCommand({
        Bucket: R2_BUCKET_NAME,
        Key: USERS_FILE,
      });
      const response = await R2.send(command);
      const content = await streamToString(response.Body);
      return JSON.parse(content);
    } catch (error: any) {
      if (error.name === "NoSuchKey") {
        await this.saveUsers([]);
        return [];
      }
      console.error("Error getting users:", error);
      return [];
    }
  }

  static async saveUsers(users: BlobUser[]): Promise<void> {
    try {
      const command = new PutObjectCommand({
        Bucket: R2_BUCKET_NAME,
        Key: USERS_FILE,
        Body: JSON.stringify(users, null, 2),
        ContentType: "application/json",
      });
      await R2.send(command);
    } catch (error) {
      console.error("Error saving users:", error);
      throw error;
    }
  }

  static async getUserByEmail(email: string): Promise<BlobUser | undefined> {
    const users = await this.getUsers();
    return users.find((user) => user.email === email);
  }
}