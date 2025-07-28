import { put, list } from "@vercel/blob"
import { createToken } from "./tokenUtils" // Import createToken from tokenUtils
import { hashPassword } from "./hashUtils" // Import hashPassword from hashUtils

export interface AuthUser {
  id: string
  username: string
  display_name: string
  email: string
  avatar_url?: string
  created_at: string
}

export class AuthService {
  private static readonly USERS_FILE = "users.json"

  // Get all users from JSON file
  static async getAllUsers(): Promise<AuthUser[]> {
    try {
      const { blobs } = await list({ prefix: this.USERS_FILE })
      if (blobs.length === 0) {
        return []
      }

      const response = await fetch(blobs[0].url)
      const users = await response.json()
      return users || []
    } catch (error) {
      console.error("Error fetching users:", error)
      return []
    }
  }

  // Save users to JSON file
  static async saveUsers(users: AuthUser[]): Promise<void> {
    try {
      const blob = new Blob([JSON.stringify(users, null, 2)], {
        type: "application/json",
      })
      await put(this.USERS_FILE, blob, { access: "public" })
    } catch (error) {
      console.error("Error saving users:", error)
      throw error
    }
  }

  // Find user by username
  static async findUserByUsername(username: string): Promise<AuthUser | null> {
    const users = await this.getAllUsers()
    return users.find((user) => user.username === username) || null
  }

  // Find user by ID
  static async findUserById(id: string): Promise<AuthUser | null> {
    const users = await this.getAllUsers()
    return users.find((user) => user.id === id) || null
  }

  // Register new user
  static async register(username: string, password: string, email: string): Promise<{ user: AuthUser; token: string }> {
    const users = await this.getAllUsers()

    // Check if username already exists
    if (users.some((user) => user.username === username)) {
      throw new Error("Username already exists")
    }

    const hashedPassword = await hashPassword(password)
    const newUser: AuthUser = {
      id: Date.now().toString(),
      username,
      display_name: username,
      email,
      created_at: new Date().toISOString(),
    }

    users.push(newUser)
    await this.saveUsers(users)

    const token = createToken(newUser)
    return { user: newUser, token }
  }

  // Login user
  static async login(username: string, password: string): Promise<{ user: AuthUser; token: string }> {
    const user = await this.findUserByUsername(username)

    if (!user || user.password !== (await hashPassword(password))) {
      throw new Error("Invalid credentials")
    }

    const token = createToken(user)
    return { user, token }
  }

  // Verify token
  static verifyToken(token: string): AuthUser | null {
    try {
      const payload = JSON.parse(atob(token))
      if (payload.exp < Date.now()) {
        return null
      }
      return payload
    } catch {
      return null
    }
  }

  // Update user profile
  static async updateProfile(userId: string, updates: Partial<AuthUser>): Promise<AuthUser> {
    const users = await this.getAllUsers()
    const userIndex = users.findIndex((user) => user.id === userId)

    if (userIndex === -1) {
      throw new Error("User not found")
    }

    users[userIndex] = {
      ...users[userIndex],
      ...updates,
    }

    await this.saveUsers(users)
    return users[userIndex]
  }
}
