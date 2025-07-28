"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Bell, MessageCircle, Upload, Settings, LogOut, Heart, MessageSquare, Share2 } from "lucide-react"
import { useAuth } from "@/lib/auth-context"
import { useRouter } from "next/navigation"
import ProtectedRoute from "@/components/protected-route"

interface MediaItem {
  id: string
  title: string
  description: string
  type: "image" | "video" | "audio"
  url: string
  thumbnail?: string
  author: string
  createdAt: string
  likes: number
  comments: number
  tags: string[]
}

export default function HomePage() {
  const { user, logout } = useAuth()
  const router = useRouter()
  const [mediaItems, setMediaItems] = useState<MediaItem[]>([])
  const [notifications, setNotifications] = useState<any[]>([])

  useEffect(() => {
    // Load media items from your existing functionality
    // This connects to your existing media upload system
    loadMediaItems()
    loadNotifications()
  }, [])

  const loadMediaItems = async () => {
    try {
      const response = await fetch("/api/media")
      if (response.ok) {
        const data = await response.json()
        setMediaItems(data.media || [])
      }
    } catch (error) {
      console.error("Error loading media:", error)
    }
  }

  const loadNotifications = async () => {
    try {
      const response = await fetch("/api/notifications", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("auth_token")}`,
        },
      })
      if (response.ok) {
        const data = await response.json()
        setNotifications(data.notifications || [])
      }
    } catch (error) {
      console.error("Error loading notifications:", error)
    }
  }

  const handleLogout = () => {
    logout()
    router.push("/auth")
  }

  const handleLike = async (mediaId: string) => {
    try {
      const response = await fetch(`/api/media/${mediaId}/like`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("auth_token")}`,
        },
      })
      if (response.ok) {
        loadMediaItems() // Refresh the media items
      }
    } catch (error) {
      console.error("Error liking media:", error)
    }
  }

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-slate-900">
        {/* Header */}
        <header className="bg-slate-800 border-b border-slate-700 p-4">
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <h1 className="text-2xl font-bold text-white">Eneskench Summit</h1>
            </div>

            <div className="flex items-center space-x-4">
              {/* Notifications */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="relative text-slate-300 hover:text-white">
                    <Bell className="h-5 w-5" />
                    {notifications.length > 0 && (
                      <Badge className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-red-500 text-xs">
                        {notifications.length}
                      </Badge>
                    )}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-80 bg-slate-800 border-slate-700">
                  {notifications.length === 0 ? (
                    <div className="p-4 text-slate-400 text-center">No notifications yet</div>
                  ) : (
                    notifications.map((notification, index) => (
                      <DropdownMenuItem key={index} className="text-slate-300 hover:bg-slate-700">
                        {notification.message}
                      </DropdownMenuItem>
                    ))
                  )}
                </DropdownMenuContent>
              </DropdownMenu>

              {/* Chat Button */}
              <Button
                variant="ghost"
                size="sm"
                className="text-slate-300 hover:text-white"
                onClick={() => router.push("/chat")}
              >
                <MessageCircle className="h-5 w-5" />
              </Button>

              {/* Upload Button */}
              <Button
                variant="ghost"
                size="sm"
                className="text-slate-300 hover:text-white"
                onClick={() => router.push("/upload")}
              >
                <Upload className="h-5 w-5" />
              </Button>

              {/* Profile Dropdown */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={user?.avatar_url || ""} alt={user?.display_name || ""} />
                      <AvatarFallback className="bg-slate-600 text-white">
                        {user?.display_name?.charAt(0).toUpperCase() || "U"}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56 bg-slate-800 border-slate-700" align="end">
                  <DropdownMenuItem
                    className="text-slate-300 hover:bg-slate-700"
                    onClick={() => router.push("/settings")}
                  >
                    <Settings className="mr-2 h-4 w-4" />
                    Settings
                  </DropdownMenuItem>
                  <DropdownMenuItem className="text-slate-300 hover:bg-slate-700" onClick={handleLogout}>
                    <LogOut className="mr-2 h-4 w-4" />
                    Log out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="max-w-7xl mx-auto p-6">
          <div className="grid gap-6">
            {mediaItems.length === 0 ? (
              <div className="text-center py-12">
                <div className="text-slate-400 text-lg">No interactions yet</div>
                <p className="text-slate-500 mt-2">Upload some media to get started!</p>
                <Button className="mt-4 bg-blue-600 hover:bg-blue-700" onClick={() => router.push("/upload")}>
                  <Upload className="mr-2 h-4 w-4" />
                  Upload Media
                </Button>
              </div>
            ) : (
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {mediaItems.map((item) => (
                  <Card key={item.id} className="bg-slate-800 border-slate-700">
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <Avatar className="h-8 w-8">
                            <AvatarFallback className="bg-slate-600 text-white">
                              {item.author.charAt(0).toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <CardTitle className="text-white text-sm">{item.author}</CardTitle>
                            <CardDescription className="text-slate-400 text-xs">
                              {new Date(item.createdAt).toLocaleDateString()}
                            </CardDescription>
                          </div>
                        </div>
                        <Badge variant="secondary" className="bg-slate-700 text-slate-300">
                          {item.type}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {item.type === "image" && (
                          <img
                            src={item.thumbnail || item.url}
                            alt={item.title}
                            className="w-full h-48 object-cover rounded-md"
                          />
                        )}
                        {item.type === "video" && (
                          <video src={item.url} poster={item.thumbnail} controls className="w-full h-48 rounded-md" />
                        )}
                        {item.type === "audio" && <audio src={item.url} controls className="w-full" />}

                        <div>
                          <h3 className="text-white font-medium">{item.title}</h3>
                          <p className="text-slate-400 text-sm mt-1">{item.description}</p>
                        </div>

                        <div className="flex flex-wrap gap-1">
                          {item.tags.map((tag) => (
                            <Badge key={tag} variant="outline" className="text-xs border-slate-600 text-slate-400">
                              #{tag}
                            </Badge>
                          ))}
                        </div>

                        <div className="flex items-center justify-between pt-2">
                          <div className="flex items-center space-x-4">
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-slate-400 hover:text-red-400"
                              onClick={() => handleLike(item.id)}
                            >
                              <Heart className="h-4 w-4 mr-1" />
                              {item.likes}
                            </Button>
                            <Button variant="ghost" size="sm" className="text-slate-400 hover:text-blue-400">
                              <MessageSquare className="h-4 w-4 mr-1" />
                              {item.comments}
                            </Button>
                          </div>
                          <Button variant="ghost" size="sm" className="text-slate-400 hover:text-green-400">
                            <Share2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </main>
      </div>
    </ProtectedRoute>
  )
}
