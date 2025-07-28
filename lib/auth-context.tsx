"use client"

import type React from "react"

import { createContext, useContext, useEffect, useState } from "react"
import { type AuthUser, verifyToken } from "./auth"

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
    if (token) {
      const userData = verifyToken(token)
      if (userData) {
        setUser(userData)
      } else {
        localStorage.removeItem("auth_token")
      }
    }
    setIsLoading(false)
  }, [])

  const login = (userData: AuthUser, token: string) => {
    setUser(userData)
    localStorage.setItem("auth_token", token)
  }

  const logout = () => {
    setUser(null)
    localStorage.removeItem("auth_token")
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
