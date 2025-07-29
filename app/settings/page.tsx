"use client"

import type React from "react"
import { useState } from "react"
import { useAuth } from "@/lib/auth-context"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { Eye, EyeOff, ArrowLeft, Save, Loader2 } from "lucide-react"
import { toast } from "sonner"
import ProtectedRoute from "@/components/protected-route"

export default function SettingsPage() {
  const { user, token, logout } = useAuth()
  const router = useRouter()

  const [displayName, setDisplayName] = useState(user?.display_name || "")
  const [currentPassword, setCurrentPassword] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [showCurrentPassword, setShowCurrentPassword] = useState(false)
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isSaving, setIsSaving] = useState(false)

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault()

    if (newPassword && newPassword !== confirmPassword) {
      toast.error("New passwords do not match")
      return
    }

    if (newPassword && newPassword.length < 6) {
      toast.error("New password must be at least 6 characters")
      return
    }

    setIsSaving(true)

    try {
      const updateData: any = {}

      if (displayName !== user?.display_name) {
        updateData.display_name = displayName
      }

      if (newPassword) {
        if (!currentPassword) {
          toast.error("Current password is required to change password")
          setIsSaving(false)
          return
        }
        updateData.current_password = currentPassword
        updateData.new_password = newPassword
      }

      if (Object.keys(updateData).length === 0) {
        toast.info("No changes to save")
        setIsSaving(false)
        return
      }

      const response = await fetch("/api/auth/update-profile", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(updateData),
      })

      const data = await response.json()

      if (response.ok) {
        toast.success("Profile updated successfully!")
        setCurrentPassword("")
        setNewPassword("")
        setConfirmPassword("")

        // Update local user data if display name changed
        if (updateData.display_name) {
          const updatedUser = { ...user!, display_name: displayName }
          localStorage.setItem("auth_user", JSON.stringify(updatedUser))
        }
      } else {
        toast.error(data.error || "Failed to update profile")
      }
    } catch (error) {
      console.error("Profile update error:", error)
      toast.error("Failed to update profile")
    } finally {
      setIsSaving(false)
    }
  }

  const handleLogout = () => {
    logout()
    router.push("/auth")
  }

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-slate-900">
        <div className="max-w-4xl mx-auto p-4">
          <div className="mb-6">
            <Button variant="ghost" onClick={() => router.push("/")} className="text-slate-400 hover:text-white mb-4">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Home
            </Button>
            <h1 className="text-3xl font-bold text-white">Settings</h1>
            <p className="text-slate-400 mt-2">Manage your account settings and preferences</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Profile Settings */}
            <Card className="bg-slate-800 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white">Profile Information</CardTitle>
                <CardDescription className="text-slate-400">Update your profile details</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleUpdateProfile} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="username" className="text-slate-300">
                      Username
                    </Label>
                    <Input
                      id="username"
                      type="text"
                      value={user?.username || ""}
                      className="bg-slate-700 border-slate-600 text-slate-400"
                      disabled
                    />
                    <p className="text-xs text-slate-500">Username cannot be changed</p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-slate-300">
                      Email
                    </Label>
                    <Input
                      id="email"
                      type="email"
                      value={user?.email || ""}
                      className="bg-slate-700 border-slate-600 text-slate-400"
                      disabled
                    />
                    <p className="text-xs text-slate-500">Email cannot be changed</p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="display-name" className="text-slate-300">
                      Display Name
                    </Label>
                    <Input
                      id="display-name"
                      type="text"
                      value={displayName}
                      onChange={(e) => setDisplayName(e.target.value)}
                      className="bg-slate-700 border-slate-600 text-white"
                      required
                    />
                  </div>

                  <Separator className="bg-slate-600" />

                  <div className="space-y-4">
                    <h3 className="text-white font-medium">Change Password</h3>

                    <div className="space-y-2">
                      <Label htmlFor="current-password" className="text-slate-300">
                        Current Password
                      </Label>
                      <div className="relative">
                        <Input
                          id="current-password"
                          type={showCurrentPassword ? "text" : "password"}
                          value={currentPassword}
                          onChange={(e) => setCurrentPassword(e.target.value)}
                          className="bg-slate-700 border-slate-600 text-white pr-10"
                          placeholder="Enter current password"
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="absolute right-0 top-0 h-full px-3 text-slate-400 hover:text-white"
                          onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                        >
                          {showCurrentPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </Button>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="new-password" className="text-slate-300">
                        New Password
                      </Label>
                      <div className="relative">
                        <Input
                          id="new-password"
                          type={showNewPassword ? "text" : "password"}
                          value={newPassword}
                          onChange={(e) => setNewPassword(e.target.value)}
                          className="bg-slate-700 border-slate-600 text-white pr-10"
                          placeholder="Enter new password"
                          minLength={6}
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="absolute right-0 top-0 h-full px-3 text-slate-400 hover:text-white"
                          onClick={() => setShowNewPassword(!showNewPassword)}
                        >
                          {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </Button>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="confirm-password" className="text-slate-300">
                        Confirm New Password
                      </Label>
                      <div className="relative">
                        <Input
                          id="confirm-password"
                          type={showConfirmPassword ? "text" : "password"}
                          value={confirmPassword}
                          onChange={(e) => setConfirmPassword(e.target.value)}
                          className="bg-slate-700 border-slate-600 text-white pr-10"
                          placeholder="Confirm new password"
                          minLength={6}
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="absolute right-0 top-0 h-full px-3 text-slate-400 hover:text-white"
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        >
                          {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </Button>
                      </div>
                    </div>
                  </div>

                  <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700" disabled={isSaving}>
                    {isSaving ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      <>
                        <Save className="w-4 h-4 mr-2" />
                        Save Changes
                      </>
                    )}
                  </Button>
                </form>
              </CardContent>
            </Card>

            {/* Account Actions */}
            <Card className="bg-slate-800 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white">Account Actions</CardTitle>
                <CardDescription className="text-slate-400">Manage your account</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <h3 className="text-white font-medium">Account Information</h3>
                  <div className="text-sm text-slate-400">
                    <p>Member since: {user?.created_at ? new Date(user.created_at).toLocaleDateString() : "Unknown"}</p>
                    <p>User ID: {user?.id}</p>
                  </div>
                </div>

                <Separator className="bg-slate-600" />

                <div className="space-y-4">
                  <h3 className="text-white font-medium">Danger Zone</h3>
                  <Button variant="destructive" onClick={handleLogout} className="w-full">
                    Sign Out
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  )
}
