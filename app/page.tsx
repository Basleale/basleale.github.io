"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Bell, MessageCircle, Upload, Settings, LogOut, Home, Search } from "lucide-react"
import { useAuth } from "@/lib/auth-context"
import { useRouter } from "next/navigation"
import ProtectedRoute from "@/components/protected-route"
import { toast } from "@/hooks/use-toast"

interface MediaItem {
  id: string
  title: string
  type: "image" | "video" | "audio"
  url: string
  thumbnail?: string
  author: string
  likes: number
  comments: number
  createdAt: string
}

export default function HomePage() {
  const { user, logout } = useAuth()
  const router = useRouter()
  const [mediaItems, setMediaItems] = useState<MediaItem[]>([])
  const [notifications, setNotifications] = useState<any[]>([])

  useEffect(() => {
    // Load media items
    fetchMediaItems()
    // Load notifications
    fetchNotifications()
  }, [])

  const fetchMediaItems = async () => {
    try {
      const response = await fetch("/api/media")
      if (response.ok) {
        const data = await response.json()
        setMediaItems(data.media || [])
      }
    } catch (error) {
      console.error("Error fetching media:", error)
    }
  }

  const fetchNotifications = async () => {
    try {
      const token = localStorage.getItem("auth_token")
      const response = await fetch("/api/notifications", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      if (response.ok) {
        const data = await response.json()
        setNotifications(data.notifications || [])
      }
    } catch (error) {
      console.error("Error fetching notifications:", error)
    }
  }

  const handleLogout = () => {
    logout()
    toast({
      title: "Logged out",
      description: "You have been logged out successfully.",
    })
    router.push("/auth")
  }

  const handleLike = async (mediaId: string) => {
    try {
      const token = localStorage.getItem("auth_token")
      const response = await fetch(`/api/media/${mediaId}/like`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      if (response.ok) {
        fetchMediaItems() // Refresh media items
        toast({
          title: "Liked!",
          description: "You liked this media.",
        })
      }
    } catch (error) {
      console.error("Error liking media:", error)
    }
  }

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-slate-900">
        {/* Header */}
        <header className="bg-slate-800 border-b border-slate-700 px-4 py-3">
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <h1 className="text-xl font-bold text-white">Eneskench Summit</h1>
            </div>

            <div className="flex items-center space-x-4">
              {/* Notifications */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="relative text-slate-300 hover:text-white">
                    <Bell className="h-5 w-5" />
                    {notifications.length > 0 && (
                      <Badge className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 text-xs bg-red-500">
                        {notifications.length}
                      </Badge>
                    )}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-80 bg-slate-800 border-slate-700">
                  {notifications.length === 0 ? (
                    <div className="p-4 text-center text-slate-400">No notifications yet</div>
                  ) : (
                    notifications.map((notification, index) => (
                      <DropdownMenuItem key={index} className="p-4 text-slate-300 hover:bg-slate-700">
                        <div>
                          <p className="font-medium">{notification.title}</p>
                          <p className="text-sm text-slate-400">{notification.message}</p>
                        </div>
                      </DropdownMenuItem>
                    ))
                  )}
                </DropdownMenuContent>
              </DropdownMenu>

              {/* Profile */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={user?.avatar_url || ""} alt={user?.display_name} />
                      <AvatarFallback className="bg-slate-700 text-slate-300">
                        {user?.display_name?.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="bg-slate-800 border-slate-700">
                  <DropdownMenuItem
                    onClick={() => router.push("/settings")}
                    className="text-slate-300 hover:bg-slate-700"
                  >
                    <Settings className="mr-2 h-4 w-4" />
                    Settings
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={handleLogout} className="text-slate-300 hover:bg-slate-700">
                    <LogOut className="mr-2 h-4 w-4" />
                    Logout
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </header>

        <div className="max-w-7xl mx-auto flex">
          {/* Sidebar */}
          <aside className="w-64 bg-slate-800 min-h-screen p-4">
            <nav className="space-y-2">
              <Button
                variant="ghost"
                className="w-full justify-start text-slate-300 hover:text-white hover:bg-slate-700"
                onClick={() => router.push("/")}
              >
                <Home className="mr-2 h-4 w-4" />
                Home
              </Button>
              <Button
                variant="ghost"
                className="w-full justify-start text-slate-300 hover:text-white hover:bg-slate-700"
                onClick={() => router.push("/all-media")}
              >
                <Search className="mr-2 h-4 w-4" />
                Explore
              </Button>
              <Button
                variant="ghost"
                className="w-full justify-start text-slate-300 hover:text-white hover:bg-slate-700"
                onClick={() => router.push("/chat")}
              >
                <MessageCircle className="mr-2 h-4 w-4" />
                Chat
              </Button>
              <Button
                variant="ghost"
                className="w-full justify-start text-slate-300 hover:text-white hover:bg-slate-700"
                onClick={() => router.push("/upload")}
              >
                <Upload className="mr-2 h-4 w-4" />
                Upload
              </Button>
            </nav>
          </aside>

          {/* Main Content */}
          <main className="flex-1 p-6">
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-white mb-2">Welcome back, {user?.display_name}!</h2>
              <p className="text-slate-400">Discover and share amazing content with the community.</p>
            </div>

            {/* Media Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {mediaItems.length === 0 ? (
                <div className="col-span-full text-center py-12">
                  <p className="text-slate-400 text-lg">No interactions yet</p>
                  <p className="text-slate-500 mt-2">Be the first to upload some content!</p>
                  <Button className="mt-4 bg-blue-600 hover:bg-blue-700" onClick={() => router.push("/upload")}>
                    <Upload className="mr-2 h-4 w-4" />
                    Upload Content
                  </Button>
                </div>
              ) : (
                mediaItems.map((item) => (
                  <Card
                    key={item.id}
                    className="bg-slate-800 border-slate-700 hover:border-slate-600 transition-colors"
                  >
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-white text-lg">{item.title}</CardTitle>
                        <Badge variant="secondary" className="bg-slate-700 text-slate-300">
                          {item.type}
                        </Badge>
                      </div>
                      <p className="text-slate-400 text-sm">by {item.author}</p>
                    </CardHeader>
                    <CardContent>
                      <div className="aspect-video bg-slate-700 rounded-lg mb-4 flex items-center justify-center">
                        {item.thumbnail ? (
                          <img
                            src={item.thumbnail || "/placeholder.svg"}
                            alt={item.title}
                            className="w-full h-full object-cover rounded-lg"
                          />
                        ) : (
                          <div className="text-slate-500">
                            {item.type === "image" && "🖼️"}
                            {item.type === "video" && "🎥"}
                            {item.type === "audio" && "🎵"}
                          </div>
                        )}
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4 text-slate-400">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleLike(item.id)}
                            className="text-slate-400 hover:text-red-400"
                          >
                            ❤️ {item.likes}
                          </Button>
                          <span className="text-sm">💬 {item.comments}</span>
                        </div>
                        <span className="text-xs text-slate-500">{new Date(item.createdAt).toLocaleDateString()}</span>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </main>
        </div>
      </div>
    </ProtectedRoute>
  )
}
