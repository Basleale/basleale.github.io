"use client"

import type React from "react"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/lib/auth"
import { showToast } from "@/lib/utils"

export default function AuthPage() {
  const [isLogin, setIsLogin] = useState(true)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const { login, register } = useAuth()
  const router = useRouter()

  const [loginForm, setLoginForm] = useState({
    username: "",
    password: "",
  })

  const [registerForm, setRegisterForm] = useState({
    username: "",
    email: "",
    displayName: "",
    password: "",
    confirmPassword: "",
  })

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const success = await login(loginForm.username, loginForm.password)
      if (success) {
        showToast("Login successful!", "success")
        router.push("/")
      } else {
        showToast("Invalid credentials", "error")
      }
    } catch (error) {
      showToast("Login failed", "error")
    } finally {
      setLoading(false)
    }
  }

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()

    if (registerForm.password !== registerForm.confirmPassword) {
      showToast("Passwords do not match", "error")
      return
    }

    setLoading(true)

    try {
      const success = await register(
        registerForm.username,
        registerForm.email,
        registerForm.displayName,
        registerForm.password,
      )

      if (success) {
        showToast("Registration successful!", "success")
        router.push("/")
      } else {
        showToast("Registration failed", "error")
      }
    } catch (error) {
      showToast("Registration failed", "error")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="card max-w-md w-full">
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold mb-2">Eneskench Summit</h1>
          <p className="text-muted-foreground">Sign in to your account or create a new one</p>
        </div>

        <div className="tabs">
          <div className="tab-list">
            <button className={`tab-trigger ${isLogin ? "active" : ""}`} onClick={() => setIsLogin(true)}>
              Login
            </button>
            <button className={`tab-trigger ${!isLogin ? "active" : ""}`} onClick={() => setIsLogin(false)}>
              Register
            </button>
          </div>

          {isLogin ? (
            <div className="tab-content">
              <form onSubmit={handleLogin}>
                <div className="form-group">
                  <label className="label">Username</label>
                  <input
                    className="input"
                    type="text"
                    value={loginForm.username}
                    onChange={(e) => setLoginForm({ ...loginForm, username: e.target.value })}
                    placeholder="Enter your username"
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="label">Password</label>
                  <div className="relative">
                    <input
                      className="input"
                      type={showPassword ? "text" : "password"}
                      value={loginForm.password}
                      onChange={(e) => setLoginForm({ ...loginForm, password: e.target.value })}
                      placeholder="Enter your password"
                      required
                    />
                    <button
                      type="button"
                      className="absolute right-0 top-0 h-full px-4 button-outline"
                      onClick={() => setShowPassword(!showPassword)}
                      style={{ border: "none", background: "none" }}
                    >
                      {showPassword ? "👁️" : "👁️‍🗨️"}
                    </button>
                  </div>
                </div>

                <button type="submit" className="button w-full" disabled={loading}>
                  {loading ? "Signing in..." : "Sign In"}
                </button>
              </form>
            </div>
          ) : (
            <div className="tab-content">
              <form onSubmit={handleRegister}>
                <div className="form-group">
                  <label className="label">Username</label>
                  <input
                    className="input"
                    type="text"
                    value={registerForm.username}
                    onChange={(e) => setRegisterForm({ ...registerForm, username: e.target.value })}
                    placeholder="Choose a username"
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="label">Email</label>
                  <input
                    className="input"
                    type="email"
                    value={registerForm.email}
                    onChange={(e) => setRegisterForm({ ...registerForm, email: e.target.value })}
                    placeholder="Enter your email"
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="label">Display Name</label>
                  <input
                    className="input"
                    type="text"
                    value={registerForm.displayName}
                    onChange={(e) => setRegisterForm({ ...registerForm, displayName: e.target.value })}
                    placeholder="Your display name"
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="label">Password</label>
                  <div className="relative">
                    <input
                      className="input"
                      type={showPassword ? "text" : "password"}
                      value={registerForm.password}
                      onChange={(e) => setRegisterForm({ ...registerForm, password: e.target.value })}
                      placeholder="Create a password"
                      required
                    />
                    <button
                      type="button"
                      className="absolute right-0 top-0 h-full px-4"
                      onClick={() => setShowPassword(!showPassword)}
                      style={{ border: "none", background: "none" }}
                    >
                      {showPassword ? "👁️" : "👁️‍🗨️"}
                    </button>
                  </div>
                </div>

                <div className="form-group">
                  <label className="label">Confirm Password</label>
                  <div className="relative">
                    <input
                      className="input"
                      type={showConfirmPassword ? "text" : "password"}
                      value={registerForm.confirmPassword}
                      onChange={(e) => setRegisterForm({ ...registerForm, confirmPassword: e.target.value })}
                      placeholder="Confirm your password"
                      required
                    />
                    <button
                      type="button"
                      className="absolute right-0 top-0 h-full px-4"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      style={{ border: "none", background: "none" }}
                    >
                      {showConfirmPassword ? "👁️" : "👁️‍🗨️"}
                    </button>
                  </div>
                </div>

                <button type="submit" className="button w-full" disabled={loading}>
                  {loading ? "Creating account..." : "Create Account"}
                </button>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
