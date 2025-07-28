import jwt from "jsonwebtoken"
import { put, head } from "@vercel/blob"

export interface User {
  id: string
  username: string
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

export async function getUserCredentials(username: string): Promise<{ username: string; password: string } | null> {
  try {
    const response = await fetch(`https://blob.vercel-storage.com/users/${username}/credentials.txt`, {
      headers: {
        Authorization: `Bearer ${process.env.BLOB_READ_WRITE_TOKEN}`,
      },
    })

    if (!response.ok) {
      return null
    }

    const credentialsText = await response.text()
    const lines = credentialsText.split("\n")
    const storedUsername = lines[0]?.replace("username:", "").trim()
    const storedPassword = lines[1]?.replace("password:", "").trim()

    if (storedUsername && storedPassword) {
      return { username: storedUsername, password: storedPassword }
    }

    return null
  } catch (error) {
    console.error("Error fetching user credentials:", error)
    return null
  }
}

export async function getUserProfile(username: string): Promise<User | null> {
  try {
    const response = await fetch(`https://blob.vercel-storage.com/users/${username}/profile.txt`, {
      headers: {
        Authorization: `Bearer ${process.env.BLOB_READ_WRITE_TOKEN}`,
      },
    })

    if (!response.ok) {
      // Create default profile if it doesn't exist
      const defaultProfile: User = {
        id: `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        username,
        display_name: username,
        avatar_url: null,
        created_at: new Date().toISOString(),
        last_active: new Date().toISOString(),
      }

      await createUserProfile(username, defaultProfile)
      return defaultProfile
    }

    const profileText = await response.text()
    const lines = profileText.split("\n")

    const profile: User = {
      id: lines[0]?.replace("id:", "").trim() || `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      username: lines[1]?.replace("username:", "").trim() || username,
      display_name: lines[2]?.replace("display_name:", "").trim() || username,
      avatar_url: lines[3]?.replace("avatar_url:", "").trim() || null,
      created_at: lines[4]?.replace("created_at:", "").trim() || new Date().toISOString(),
      last_active: lines[5]?.replace("last_active:", "").trim() || new Date().toISOString(),
    }

    return profile
  } catch (error) {
    console.error("Error fetching user profile:", error)
    return null
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

  // Store profile information
  const user: User = {
    id: userId,
    username,
    display_name: username,
    avatar_url: null,
    created_at: new Date().toISOString(),
    last_active: new Date().toISOString(),
  }

  await createUserProfile(username, user)
  return user
}

export async function createUserProfile(username: string, user: User): Promise<void> {
  const profileContent = `id:${user.id}\nusername:${user.username}\ndisplay_name:${user.display_name}\navatar_url:${user.avatar_url || ""}\ncreated_at:${user.created_at}\nlast_active:${user.last_active}`

  await put(`users/${username}/profile.txt`, profileContent, {
    access: "public",
    token: process.env.BLOB_READ_WRITE_TOKEN,
  })
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

export async function updateUserProfile(username: string, updates: Partial<User>): Promise<User | null> {
  try {
    const existingUser = await getUserProfile(username)
    if (!existingUser) return null

    const updatedUser = { ...existingUser, ...updates, last_active: new Date().toISOString() }
    await createUserProfile(username, updatedUser)
    return updatedUser
  } catch (error) {
    console.error("Error updating user profile:", error)
    return null
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
