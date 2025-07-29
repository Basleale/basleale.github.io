"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/lib/auth"
import ProtectedRoute from "@/components/ProtectedRoute"
import { showToast } from "@/lib/utils"

export default function SettingsPage() {
  const { user, updateProfile, logout } = useAuth()
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [showCurrentPassword, setShowCurrentPassword] = useState(false)
  const [showNewPassword, setShowNewPassword] = useState(false)

  const [profileForm, setProfileForm] = useState({
    displayName: user?.displayName || "",
  })

  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  })

  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const success = await updateProfile(profileForm.displayName)
      if (success) {
        showToast("Profile updated successfully!", "success")
      } else {
        showToast("Failed to update profile", "error")
      }
    } catch (error) {
      showToast("Failed to update profile", "error")
    } finally {
      setLoading(false)
    }
  }

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault()

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      showToast("New passwords do not match", "error")
      return
    }

    setLoading(true)

    try {
      const success = await updateProfile(
        user?.displayName || "",
        passwordForm.currentPassword,
        passwordForm.newPassword,
      )

      if (success) {
        showToast("Password changed successfully!", "success")
        setPasswordForm({ currentPassword: "", newPassword: "", confirmPassword: "" })
      } else {
        showToast("Failed to change password", "error")
      }
    } catch (error) {
      showToast("Failed to change password", "error")
    } finally {
      setLoading(false)
    }
  }

  return (
    <ProtectedRoute>
      <div className="min-h-screen" style={{ backgroundColor: "hsl(var(--background))" }}>
        {/* Header */}
        <header className="border-b" style={{ borderColor: "hsl(var(--border))" }}>
          <div className="max-w-4xl mx-auto px-4 py-4 flex justify-between items-center">
            <h1 className="text-2xl font-bold">Settings</h1>
            <div className="flex items-center gap-4">
              <button onClick={() => router.push("/")} className="button-outline">
                Back to Home
              </button>
              <button
                onClick={() => {
                  logout()
                  router.push("/auth")
                }}
                className="button"
              >
                Logout
              </button>
            </div>
          </div>
        </header>

        <div className="max-w-2xl mx-auto px-4 py-8">
          {/* Profile Settings */}
          <div className="card mb-8">
            <h2 className="text-xl font-bold mb-4">Profile Settings</h2>
            <form onSubmit={handleProfileUpdate}>
              <div className="form-group">
                <label className="label">Display Name</label>
                <input
                  className="input"
                  type="text"
                  value={profileForm.displayName}
                  onChange={(e) => setProfileForm({ ...profileForm, displayName: e.target.value })}
                  placeholder="Your display name"
                  required
                />
              </div>
              <div className="form-group">
                <label className="label">Username</label>
                <input className="input" type="text" value={user?.username || ""} disabled style={{ opacity: 0.6 }} />
                <p className="text-sm text-muted-foreground mt-1">Username cannot be changed</p>
              </div>
              <div className="form-group">
                <label className="label">Email</label>
                <input className="input" type="email" value={user?.email || ""} disabled style={{ opacity: 0.6 }} />
                <p className="text-sm text-muted-foreground mt-1">Email cannot be changed</p>
              </div>
              <button type="submit" className="button" disabled={loading}>
                {loading ? "Updating..." : "Update Profile"}
              </button>
            </form>
          </div>

          {/* Password Change */}
          <div className="card">
            <h2 className="text-xl font-bold mb-4">Change Password</h2>
            <form onSubmit={handlePasswordChange}>
              <div className="form-group">
                <label className="label">Current Password</label>
                <div className="relative">
                  <input
                    className="input"
                    type={showCurrentPassword ? "text" : "password"}
                    value={passwordForm.currentPassword}
                    onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
                    placeholder="Enter current password"
                    required
                  />
                  <button
                    type="button"
                    className="absolute right-0 top-0 h-full px-4"
                    onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                    style={{ border: "none", background: "none" }}
                  >
                    {showCurrentPassword ? "👁️" : "👁️‍🗨️"}
                  </button>
                </div>
              </div>

              <div className="form-group">
                <label className="label">New Password</label>
                <div className="relative">
                  <input
                    className="input"
                    type={showNewPassword ? "text" : "password"}
                    value={passwordForm.newPassword}
                    onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                    placeholder="Enter new password"
                    required
                  />
                  <button
                    type="button"
                    className="absolute right-0 top-0 h-full px-4"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    style={{ border: "none", background: "none" }}
                  >
                    {showNewPassword ? "👁️" : "👁️‍🗨️"}
                  </button>
                </div>
              </div>

              <div className="form-group">
                <label className="label">Confirm New Password</label>
                <input
                  className="input"
                  type="password"
                  value={passwordForm.confirmPassword}
                  onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                  placeholder="Confirm new password"
                  required
                />
              </div>

              <button type="submit" className="button" disabled={loading}>
                {loading ? "Changing..." : "Change Password"}
              </button>
            </form>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  )
}
