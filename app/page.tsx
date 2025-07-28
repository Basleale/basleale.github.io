"use client"

import { useAuth } from "@/lib/auth-context"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Bell, MessageCircle, Settings, LogOut, Upload, Users, ImageIcon } from "lucide-react"
import ProtectedRoute from "@/components/protected-route"

interface MediaItem {
  id: string
  title: string
  type: "image" | "video"
  url: string
  thumbnail: string
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
    // Load media items and notifications
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
      const response = await fetch("/api/notifications")
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

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-slate-900">
        {/* Header */}
        <header className="bg-slate-800 border-b border-slate-700 px-4 py-3">
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <h1 className="text-2xl font-bold text-blue-400">Eneskench Summit</h1>
              <nav className="hidden md:flex space-x-6">
                <Button variant="ghost" className="text-slate-300 hover:text-white">
                  <ImageIcon className="w-4 h-4 mr-2" />
                  All Media
                </Button>
                <Button
                  variant="ghost"
                  className="text-slate-300 hover:text-white"
                  onClick={() => router.push("/chat")}
                >
                  <MessageCircle className="w-4 h-4 mr-2" />
                  Chat
                </Button>
                <Button variant="ghost" className="text-slate-300 hover:text-white">
                  <Users className="w-4 h-4 mr-2" />
                  Community
                </Button>
              </nav>
            </div>

            <div className="flex items-center space-x-4">
              <Button variant="outline" className="bg-blue-600 hover:bg-blue-700 text-white border-blue-600">
                <Upload className="w-4 h-4 mr-2" />
                Upload
              </Button>

              {/* Notifications */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="relative">
                    <Bell className="w-5 h-5 text-slate-300" />
                    {notifications.length > 0 && (
                      <Badge className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 text-xs bg-red-500">
                        {notifications.length}
                      </Badge>
                    )}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-80 bg-slate-800 border-slate-700">
                  <div className="p-4">
                    <h3 className="font-semibold text-white mb-2">Notifications</h3>
                    {notifications.length === 0 ? (
                      <p className="text-slate-400 text-sm">No new notifications</p>
                    ) : (
                      <div className="space-y-2">
                        {notifications.map((notification, index) => (
                          <div key={index} className="p-2 bg-slate-700 rounded text-sm text-white">
                            {notification.message}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </DropdownMenuContent>
              </DropdownMenu>

              {/* Profile Menu */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={user?.avatar_url || ""} alt={user?.display_name || ""} />
                      <AvatarFallback className="bg-blue-600 text-white">
                        {user?.display_name?.charAt(0).toUpperCase() || "U"}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56 bg-slate-800 border-slate-700" align="end" forceMount>
                  <div className="flex items-center justify-start gap-2 p-2">
                    <div className="flex flex-col space-y-1 leading-none">
                      <p className="font-medium text-white">{user?.display_name}</p>
                      <p className="w-[200px] truncate text-sm text-slate-400">@{user?.username}</p>
                    </div>
                  </div>
                  <DropdownMenuItem
                    onClick={() => router.push("/settings")}
                    className="text-slate-300 hover:text-white hover:bg-slate-700"
                  >
                    <Settings className="mr-2 h-4 w-4" />
                    Settings
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={handleLogout}
                    className="text-slate-300 hover:text-white hover:bg-slate-700"
                  >
                    <LogOut className="mr-2 h-4 w-4" />
                    Log out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="max-w-7xl mx-auto px-4 py-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {mediaItems.length === 0 ? (
              <div className="col-span-full text-center py-12">
                <div className="text-slate-400 text-lg mb-4">No interactions yet</div>
                <p className="text-slate-500 mb-6">Be the first to share something amazing!</p>
                <Button className="bg-blue-600 hover:bg-blue-700">
                  <Upload className="w-4 h-4 mr-2" />
                  Upload Media
                </Button>
              </div>
            ) : (
              mediaItems.map((item) => (
                <Card key={item.id} className="bg-slate-800 border-slate-700 overflow-hidden">
                  <div className="aspect-video bg-slate-700 relative">
                    <img
                      src={item.thumbnail || "/placeholder.svg"}
                      alt={item.title}
                      className="w-full h-full object-cover"
                    />
                    {item.type === "video" && (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="bg-black bg-opacity-50 rounded-full p-3">
                          <div className="w-0 h-0 border-l-[12px] border-l-white border-y-[8px] border-y-transparent ml-1"></div>
                        </div>
                      </div>
                    )}
                  </div>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-white text-lg">{item.title}</CardTitle>
                    <CardDescription className="text-slate-400">
                      by {item.author} • {new Date(item.createdAt).toLocaleDateString()}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <div className="flex items-center justify-between text-sm text-slate-400">
                      <span>{item.likes} likes</span>
                      <span>{item.comments} comments</span>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </main>
      </div>
    </ProtectedRoute>
  )
}
