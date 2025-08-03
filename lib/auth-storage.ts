import bcrypt from "bcryptjs";
import {
  ListObjectsV2Command,
  PutObjectCommand,
  GetObjectCommand,
} from "@aws-sdk/client-s3";
import { R2, R2_BUCKET_NAME, streamToString } from "./r2-client";

interface User {
  id: string;
  name: string;
  email: string;
  passwordHash: string;
  profilePicture?: string;
  createdAt: string;
}

const USERS_FILE = "authentication/users.json";

export class AuthStorage {
  static async getUsers(): Promise<User[]> {
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
        // File doesn't exist, create demo user
        const demoUser: User = {
          id: "demo",
          name: "Demo User",
          email: "demo@example.com",
          passwordHash: await bcrypt.hash("password", 12),
          createdAt: new Date().toISOString(),
        };
        await this.saveUsers([demoUser]);
        return [demoUser];
      }
      console.error("Error getting users:", error);
      return [];
    }
  }

  static async saveUsers(users: User[]): Promise<void> {
    try {
      const command = new PutObjectCommand({
        Bucket: R2_BUCKET_NAME,
        Key: USERS_FILE,
        Body: JSON.stringify(users, null, 2),
        ContentType: "application/json",
      });
      await R2.send(command);
      console.log("Users saved to:", USERS_FILE);
    } catch (error) {
      console.error("Error saving users:", error);
      throw error;
    }
  }

  static async createUser(name: string, email: string, password: string): Promise<User> {
    const users = await this.getUsers();
    const existingUser = users.find((user) => user.email === email);
    if (existingUser) {
      throw new Error("An account with this email already exists");
    }

    const passwordHash = await bcrypt.hash(password, 12);
    const newUser: User = {
      id: Date.now().toString(),
      name,
      email,
      passwordHash,
      createdAt: new Date().toISOString(),
    };

    users.push(newUser);
    await this.saveUsers(users);
    return newUser;
  }

  static async validateUser(email: string, password: string): Promise<User> {
    const users = await this.getUsers();
    const user = users.find((u) => u.email === email);

    if (!user) {
      throw new Error("No account found with this email address");
    }

    const isValidPassword = await bcrypt.compare(password, user.passwordHash);
    if (!isValidPassword) {
      throw new Error("Incorrect password");
    }
    return user;
  }
}