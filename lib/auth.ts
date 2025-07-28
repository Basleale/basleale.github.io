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

// Simple token generation without JWT to avoid the error
export function generateToken(user: AuthUser): string {
  const tokenData = {
    id: user.id,
    username: user.username,
    display_name: user.display_name,
    timestamp: Date.now(),
  }
  return btoa(JSON.stringify(tokenData))
}

export function verifyToken(token: string): AuthUser | null {
  try {
    const decoded = JSON.parse(atob(token))
    return {
      id: decoded.id,
      username: decoded.username,
      display_name: decoded.display_name,
      avatar_url: null,
    }
  } catch {
    return null
  }
}

// Store credentials as JSON for better structure
export async function storeUserCredentials(username: string, password: string): Promise<boolean> {
  try {
    const credentials = JSON.stringify({ username, password })

    await put(`users/${username}/auth.json`, credentials, {
      access: "public",
      token: process.env.BLOB_READ_WRITE_TOKEN,
    })

    return true
  } catch (error) {
    console.error("Error storing credentials:", error)
    return false
  }
}

export async function checkUserCredentials(username: string, password: string): Promise<boolean> {
  try {
    const response = await fetch(`https://blob.vercel-storage.com/users/${username}/auth.json`, {
      headers: {
        Authorization: `Bearer ${process.env.BLOB_READ_WRITE_TOKEN}`,
      },
    })

    if (!response.ok) {
      console.error("User file not found or failed to fetch for:", username)
      return false
    }

    const data = await response.json()
    console.log("Stored credentials:", data)
    console.log("Checking password:", password)
    console.log("Match:", data.password === password)

    return data.username === username && data.password === password
  } catch (error) {
    console.error("Error checking credentials:", error)
    return false
  }
}

export async function userExists(username: string): Promise<boolean> {
  try {
    await head(`users/${username}/auth.json`, {
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
