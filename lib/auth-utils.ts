import { put, list } from "@vercel/blob"

export interface User {
  id: string
  username: string
  email: string
  displayName: string
  password: string
  createdAt: string
}

export async function getUsers(): Promise<User[]> {
  try {
    const { blobs } = await list({ prefix: "users.json" })
    if (blobs.length === 0) {
      return []
    }

    const response = await fetch(blobs[0].url)
    const users = await response.json()
    return users || []
  } catch (error) {
    console.error("Error getting users:", error)
    return []
  }
}

export async function saveUsers(users: User[]): Promise<void> {
  try {
    await put("users.json", JSON.stringify(users, null, 2), {
      access: "public",
    })
  } catch (error) {
    console.error("Error saving users:", error)
    throw error
  }
}

export async function findUserByUsername(username: string): Promise<User | null> {
  const users = await getUsers()
  return users.find((user) => user.username === username) || null
}

export async function findUserById(id: string): Promise<User | null> {
  const users = await getUsers()
  return users.find((user) => user.id === id) || null
}

export function generateToken(): string {
  return Math.random().toString(36).substring(2) + Date.now().toString(36)
}

export function hashPassword(password: string): string {
  // Simple hash for demo - use proper hashing in production
  return Buffer.from(password).toString("base64")
}

export function verifyPassword(password: string, hash: string): boolean {
  return hashPassword(password) === hash
}
