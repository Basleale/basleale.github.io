import bcrypt from "bcryptjs"
import jwt from "jsonwebtoken"
import { put, head } from "@vercel/blob"

export interface User {
  id: string
  username: string
  password_hash: string
  display_name: string
  avatar_url?: string
  created_at: string
  last_active: string
}

export interface AuthUser {
  id: string
  username: string
  display_name: string
  avatar_url?: string
}

const JWT_SECRET = process.env.JWT_SECRET || "fallback-secret"

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 12)
}

export async function verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
  return bcrypt.compare(password, hashedPassword)
}

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

export async function getUserByUsername(username: string): Promise<User | null> {
  try {
    const response = await fetch(`https://blob.vercel-storage.com/users/${username}.json`, {
      headers: {
        Authorization: `Bearer ${process.env.BLOB_READ_WRITE_TOKEN}`,
      },
    })

    if (!response.ok) {
      return null
    }

    return await response.json()
  } catch (error) {
    console.error("Error fetching user:", error)
    return null
  }
}

export async function createUser(username: string, password: string): Promise<User> {
  const hashedPassword = await hashPassword(password)
  const user: User = {
    id: `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    username,
    password_hash: hashedPassword, // This is the key fix - storing the hashed password
    display_name: username,
    avatar_url: null,
    created_at: new Date().toISOString(),
    last_active: new Date().toISOString(),
  }

  await put(`users/${username}.json`, JSON.stringify(user), {
    access: "public",
    token: process.env.BLOB_READ_WRITE_TOKEN,
  })

  return user
}

export async function userExists(username: string): Promise<boolean> {
  try {
    await head(`users/${username}.json`, {
      token: process.env.BLOB_READ_WRITE_TOKEN,
    })
    return true
  } catch {
    return false
  }
}

export async function updateUser(username: string, updates: Partial<User>): Promise<User | null> {
  try {
    const existingUser = await getUserByUsername(username)
    if (!existingUser) return null

    const updatedUser = { ...existingUser, ...updates, last_active: new Date().toISOString() }

    await put(`users/${username}.json`, JSON.stringify(updatedUser), {
      access: "public",
      token: process.env.BLOB_READ_WRITE_TOKEN,
    })

    return updatedUser
  } catch (error) {
    console.error("Error updating user:", error)
    return null
  }
}
