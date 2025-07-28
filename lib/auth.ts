import bcrypt from "bcryptjs"
import jwt from "jsonwebtoken"
import { put, head } from "@vercel/blob"

export interface User {
  id: string
  username: string
  password: string
  createdAt: string
}

export interface AuthUser {
  id: string
  username: string
}

const JWT_SECRET = process.env.JWT_SECRET || "fallback-secret"

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 12)
}

export async function verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
  return bcrypt.compare(password, hashedPassword)
}

export function generateToken(user: AuthUser): string {
  return jwt.sign({ id: user.id, username: user.username }, JWT_SECRET, { expiresIn: "7d" })
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
  } catch {
    return null
  }
}

export async function createUser(username: string, password: string): Promise<User> {
  const hashedPassword = await hashPassword(password)
  const user: User = {
    id: Date.now().toString(),
    username,
    password: hashedPassword,
    createdAt: new Date().toISOString(),
  }

  await put(`users/${username}.json`, JSON.stringify(user), {
    access: "public",
  })

  return user
}

export async function userExists(username: string): Promise<boolean> {
  try {
    await head(`users/${username}.json`)
    return true
  } catch {
    return false
  }
}
