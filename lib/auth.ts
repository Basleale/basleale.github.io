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

export async function validateUserCredentials(username: string, password: string): Promise<boolean> {
  try {
    const response = await fetch(`https://blob.vercel-storage.com/users/${username}/credentials.txt`, {
      headers: {
        Authorization: `Bearer ${process.env.BLOB_READ_WRITE_TOKEN}`,
      },
    })

    if (!response.ok) {
      return false
    }

    const credentialsText = await response.text()
    const lines = credentialsText.split("\n")
    const storedUsername = lines[0]?.replace("username:", "").trim()
    const storedPassword = lines[1]?.replace("password:", "").trim()

    return storedUsername === username && storedPassword === password
  } catch (error) {
    console.error("Error validating credentials:", error)
    return false
  }
}

export async function createUser(username: string, password: string): Promise<User> {
  const userId = `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`

  // Store credentials in simple txt format
  const credentialsContent = `username:${username}\npassword:${password}`

  await put(`users/${username}/credentials.txt`, credentialsContent, {
    access: "public",
    token: process.env.BLOB_READ_WRITE_TOKEN,
  })

  // Return user object for token generation
  return {
    id: userId,
    username,
    display_name: username,
    avatar_url: null,
  }
}

export async function userExists(username: string): Promise<boolean> {
  try {
    await head(`users/${username}/credentials.txt`, {
      token: process.env.BLOB_READ_WRITE_TOKEN,
    })
    return true
  } catch {
    return false
  }
}

export async function updateUserPassword(username: string, newPassword: string): Promise<boolean> {
  try {
    const credentialsContent = `username:${username}\npassword:${newPassword}`

    await put(`users/${username}/credentials.txt`, credentialsContent, {
      access: "public",
      token: process.env.BLOB_READ_WRITE_TOKEN,
    })

    return true
  } catch (error) {
    console.error("Error updating user password:", error)
    return false
  }
}
