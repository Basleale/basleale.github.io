"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Bell, MessageCircle, Upload, Settings, LogOut, User } from "lucide-react"
import { useAuth } from "@/lib/auth-context"
import { ProtectedRoute } from "@/components/protected-route"
import { useRouter } from "next/navigation"
import { useToast } from "@/hooks/use-toast"

interface MediaItem {
  id: string
  title: string
  description: string
  media_url: string
  media_type: string
  thumbnail_url?: string
  user_id: string
  username: string
  created_at: string
  likes_count: number
  tags: string[]
}

interface Notification {
  id: string
  type: "upload" | "like" | "comment"
  message: string
  created_at: string
  read: boolean
}

export default function HomePage() {
  const { user, logout } = useAuth()
  const router = useRouter()
  const { toast } = useToast()
  const [mediaItems, setMediaItems] = useState<MediaItem[]>([])
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchMediaItems()
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
    } finally {
      setLoading(false)
    }
  }

  const fetchNotifications = async () => {
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
      console.error("Error fetching notifications:", error)
    }
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
        fetchMediaItems() // Refresh to show updated like count
        toast({
          title: "Success",
          description: "Media liked!",
        })
      }
    } catch (error) {
      console.error("Error liking media:", error)
    }
  }

  const handleLogout = () => {
    logout()
    router.push("/auth")
  }

  const unreadNotifications = notifications.filter((n) => !n.read).length

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50">
        {/* Header */}
        <header className="bg-white shadow-sm border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              <div className="flex items-center space-x-4">
                <h1 className="text-2xl font-bold text-purple-600">Eneskench Summit</h1>
              </div>

              <div className="flex items-center space-x-4">
                {/* Notifications */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm" className="relative">
                      <Bell className="h-5 w-5" />
                      {unreadNotifications > 0 && (
                        <Badge className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 text-xs">
                          {unreadNotifications}
                        </Badge>
                      )}
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-80">
                    {notifications.length === 0 ? (
                      <div className="p-4 text-center text-gray-500">No notifications yet</div>
                    ) : (
                      notifications.slice(0, 5).map((notification) => (
                        <DropdownMenuItem key={notification.id} className="p-3">
                          <div className="flex flex-col space-y-1">
                            <p className="text-sm">{notification.message}</p>
                            <p className="text-xs text-gray-500">
                              {new Date(notification.created_at).toLocaleDateString()}
                            </p>
                          </div>
                        </DropdownMenuItem>
                      ))
                    )}
                  </DropdownMenuContent>
                </DropdownMenu>

                {/* Chat Button */}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => router.push("/chat")}
                  className="flex items-center space-x-2"
                >
                  <MessageCircle className="h-5 w-5" />
                  <span>Chat</span>
                </Button>

                {/* Upload Button */}
                <Button onClick={() => router.push("/upload")} className="flex items-center space-x-2">
                  <Upload className="h-5 w-5" />
                  <span>Upload</span>
                </Button>

                {/* Profile Menu */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={user?.avatar_url || "/placeholder.svg"} alt={user?.display_name} />
                        <AvatarFallback>{user?.display_name?.charAt(0).toUpperCase() || "U"}</AvatarFallback>
                      </Avatar>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => router.push("/settings")}>
                      <Settings className="mr-2 h-4 w-4" />
                      Settings
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => router.push(`/user/${user?.id}`)}>
                      <User className="mr-2 h-4 w-4" />
                      Profile
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={handleLogout}>
                      <LogOut className="mr-2 h-4 w-4" />
                      Logout
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="mb-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-2">Welcome back, {user?.display_name}!</h2>
            <p className="text-gray-600">Discover and share amazing content with the community.</p>
          </div>

          {loading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-purple-600"></div>
            </div>
          ) : mediaItems.length === 0 ? (
            <div className="text-center py-16">
              <div className="max-w-md mx-auto">
                <Upload className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No interactions yet</h3>
                <p className="text-gray-500 mb-6">Be the first to share something amazing with the community!</p>
                <Button onClick={() => router.push("/upload")} className="flex items-center space-x-2">
                  <Upload className="h-4 w-4" />
                  <span>Upload Media</span>
                </Button>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {mediaItems.map((item) => (
                <Card key={item.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                  <div className="aspect-video bg-gray-100 relative">
                    {item.media_type.startsWith("image/") ? (
                      <img
                        src={item.thumbnail_url || item.media_url}
                        alt={item.title}
                        className="w-full h-full object-cover"
                      />
                    ) : item.media_type.startsWith("video/") ? (
                      <video src={item.media_url} className="w-full h-full object-cover" controls />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Upload className="h-12 w-12 text-gray-400" />
                      </div>
                    )}
                  </div>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg">{item.title}</CardTitle>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleLike(item.id)}
                        className="text-red-500 hover:text-red-600"
                      >
                        ❤️ {item.likes_count}
                      </Button>
                    </div>
                    <CardDescription>by @{item.username}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-600 mb-3">{item.description}</p>
                    <div className="flex flex-wrap gap-1">
                      {item.tags.map((tag, index) => (
                        <Badge key={index} variant="secondary" className="text-xs">
                          #{tag}
                        </Badge>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </main>
      </div>
    </ProtectedRoute>
  )
}
