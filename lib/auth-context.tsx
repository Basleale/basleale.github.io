"use client"

import type React from "react"

import { createContext, useContext, useEffect, useState } from "react"
import type { AuthUser } from "./auth"

interface AuthContextType {
  user: AuthUser | null
  login: (user: AuthUser, token: string) => void
  logout: () => void
  isLoading: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const token = localStorage.getItem("auth_token")
    const userData = localStorage.getItem("user_data")

    if (token && userData) {
      try {
        const parsedUser = JSON.parse(userData)
        setUser(parsedUser)
      } catch (error) {
        console.error("Error parsing user data:", error)
        localStorage.removeItem("auth_token")
        localStorage.removeItem("user_data")
      }
    }
    setIsLoading(false)
  }, [])

  const login = (user: AuthUser, token: string) => {
    localStorage.setItem("auth_token", token)
    localStorage.setItem("user_data", JSON.stringify(user))
    setUser(user)
  }

  const logout = () => {
    localStorage.removeItem("auth_token")
    localStorage.removeItem("user_data")
    setUser(null)
  }

  return <AuthContext.Provider value={{ user, login, logout, isLoading }}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
