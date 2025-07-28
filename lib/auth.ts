import jwt from "jsonwebtoken"
import { put, head } from "@vercel/blob"

export interface User {
  id: string
  username: string
  display_name: string
  avatar_url?: string
}

export interface AuthUser {
  id: string
  username: string
  display_name: string
  avatar_url?: string
}

const JWT_SECRET = process.env.JWT_SECRET || "fallback-secret"

export function generateToken(user: AuthUser): string {
  return jwt.sign(
    {
      id: user.id,
      username: user.username,
      display_name: user.display_name,
    },
    JWT_SECRET,
    { expiresIn: "7d" },
  )
}

export function verifyToken(token: string): AuthUser | null {
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as AuthUser
    return decoded
  } catch {
    return null
  }
}

// Creative approach: Store credentials as a simple string "username|password"
export async function storeUserCredentials(username: string, password: string): Promise<boolean> {
  try {
    const credentials = JSON.stringify({ username, password });

    await put(`users/${username}/auth.json`, credentials, {
      access: "public",
      token: process.env.BLOB_READ_WRITE_TOKEN,
    });

    return true;
  } catch (error) {
    console.error("Error storing credentials:", error);
    return false;
  }
}
}

export async function checkUserCredentials(username: string, password: string): Promise<boolean> {
  try {
    const response = await fetch(`https://blob.vercel-storage.com/users/${username}/auth.json`, {
      headers: {
        Authorization: `Bearer ${process.env.BLOB_READ_WRITE_TOKEN}`,
      },
    });

    if (!response.ok) {
      console.error("User file not found or failed to fetch.");
      return false;
    }

    const data = await response.json();
    return data.password === password;
  } catch (error) {
    console.error("Error checking credentials:", error);
    return false;
  }
}
}

export async function userExists(username: string): Promise<boolean> {
  try {
    await head(`users/${username}/auth.txt`, {
      token: process.env.BLOB_READ_WRITE_TOKEN,
    })
    return true
  } catch {
    return false
  }
}

export async function updateUserPassword(username: string, newPassword: string): Promise<boolean> {
  return await storeUserCredentials(username, newPassword)
}
