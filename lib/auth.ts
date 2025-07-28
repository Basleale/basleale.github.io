import { put, list } from "@vercel/blob"

export interface User {
  id: string
  username: string
  password: string
  display_name: string
  avatar_url?: string
  created_at: string
  updated_at: string
}

export class AuthService {
  private static readonly USERS_FILE = "users.json"

  // Get all users from JSON file
  static async getAllUsers(): Promise<User[]> {
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
  static async saveUsers(users: User[]): Promise<void> {
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
  static async findUserByUsername(username: string): Promise<User | null> {
    const users = await this.getAllUsers()
    return users.find((user) => user.username === username) || null
  }

  // Find user by ID
  static async findUserById(id: string): Promise<User | null> {
    const users = await this.getAllUsers()
    return users.find((user) => user.id === id) || null
  }

  // Register new user
  static async register(username: string, password: string): Promise<{ user: User; token: string }> {
    const users = await this.getAllUsers()

    // Check if username already exists
    if (users.some((user) => user.username === username)) {
      throw new Error("Username already exists")
    }

    const newUser: User = {
      id: Date.now().toString(),
      username,
      password, // In production, hash this password
      display_name: username,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }

    users.push(newUser)
    await this.saveUsers(users)

    const token = this.generateToken(newUser)
    return { user: newUser, token }
  }

  // Login user
  static async login(username: string, password: string): Promise<{ user: User; token: string }> {
    const user = await this.findUserByUsername(username)

    if (!user || user.password !== password) {
      throw new Error("Invalid credentials")
    }

    const token = this.generateToken(user)
    return { user, token }
  }

  // Generate simple token
  static generateToken(user: User): string {
    const payload = {
      id: user.id,
      username: user.username,
      exp: Date.now() + 24 * 60 * 60 * 1000, // 24 hours
    }
    return btoa(JSON.stringify(payload))
  }

  // Verify token
  static async verifyToken(token: string): Promise<User | null> {
    try {
      const payload = JSON.parse(atob(token))

      if (payload.exp < Date.now()) {
        return null // Token expired
      }

      return await this.findUserById(payload.id)
    } catch (error) {
      return null
    }
  }

  // Update user profile
  static async updateProfile(userId: string, updates: Partial<User>): Promise<User> {
    const users = await this.getAllUsers()
    const userIndex = users.findIndex((user) => user.id === userId)

    if (userIndex === -1) {
      throw new Error("User not found")
    }

    users[userIndex] = {
      ...users[userIndex],
      ...updates,
      updated_at: new Date().toISOString(),
    }

    await this.saveUsers(users)
    return users[userIndex]
  }
}
