"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Bell, MessageCircle, Upload, Settings, LogOut, Heart, MessageSquare, Share2 } from "lucide-react"
import { useAuth } from "@/lib/auth-context"
import { ProtectedRoute } from "@/components/protected-route"
import { useRouter } from "next/navigation"

interface MediaItem {
  id: string
  title: string
  description: string
  thumbnail: string
  author: string
  likes: number
  comments: number
  timestamp: string
}

export default function HomePage() {
  const { user, logout } = useAuth()
  const router = useRouter()
  const [mediaItems, setMediaItems] = useState<MediaItem[]>([])
  const [notifications, setNotifications] = useState<string[]>([])

  useEffect(() => {
    // Load media items - for now showing empty state
    setMediaItems([])
    setNotifications([])
  }, [])

  const handleLogout = () => {
    logout()
    router.push("/auth")
  }

  const handleSettings = () => {
    router.push("/settings")
  }

  const handleChat = () => {
    router.push("/chat")
  }

  const handleUpload = () => {
    router.push("/upload")
  }

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-slate-900">
        {/* Header */}
        <header className="bg-slate-800 border-b border-slate-700 px-4 py-3">
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <h1 className="text-2xl font-bold text-white">Eneskench Summit</h1>
            </div>

            <div className="flex items-center space-x-4">
              {/* Upload Button */}
              <Button onClick={handleUpload} className="bg-purple-600 hover:bg-purple-700">
                <Upload className="w-4 h-4 mr-2" />
                Upload
              </Button>

              {/* Chat Button */}
              <Button
                onClick={handleChat}
                variant="outline"
                className="border-slate-600 text-slate-300 hover:bg-slate-700 bg-transparent"
              >
                <MessageCircle className="w-4 h-4" />
              </Button>

              {/* Notifications */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="outline"
                    size="icon"
                    className="border-slate-600 text-slate-300 hover:bg-slate-700 relative bg-transparent"
                  >
                    <Bell className="w-4 h-4" />
                    {notifications.length > 0 && (
                      <Badge className="absolute -top-2 -right-2 bg-red-500 text-white text-xs px-1 py-0 min-w-[1.25rem] h-5">
                        {notifications.length}
                      </Badge>
                    )}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="bg-slate-800 border-slate-700 text-white">
                  {notifications.length === 0 ? (
                    <DropdownMenuItem className="text-slate-400">No notifications</DropdownMenuItem>
                  ) : (
                    notifications.map((notification, index) => (
                      <DropdownMenuItem key={index} className="hover:bg-slate-700">
                        {notification}
                      </DropdownMenuItem>
                    ))
                  )}
                </DropdownMenuContent>
              </DropdownMenu>

              {/* Profile Dropdown */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={user?.avatar_url || ""} alt={user?.display_name || ""} />
                      <AvatarFallback className="bg-purple-600 text-white">
                        {user?.display_name?.charAt(0).toUpperCase() || "U"}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="bg-slate-800 border-slate-700 text-white">
                  <DropdownMenuItem onClick={handleSettings} className="hover:bg-slate-700">
                    <Settings className="w-4 h-4 mr-2" />
                    Settings
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={handleLogout} className="hover:bg-slate-700">
                    <LogOut className="w-4 h-4 mr-2" />
                    Logout
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="max-w-7xl mx-auto px-4 py-8">
          {mediaItems.length === 0 ? (
            <div className="text-center py-16">
              <div className="text-slate-400 text-lg mb-4">No interactions yet</div>
              <p className="text-slate-500 mb-8">Be the first to share something amazing!</p>
              <Button onClick={handleUpload} className="bg-purple-600 hover:bg-purple-700">
                <Upload className="w-4 h-4 mr-2" />
                Upload Media
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {mediaItems.map((item) => (
                <Card key={item.id} className="bg-slate-800 border-slate-700">
                  <CardHeader className="p-0">
                    <img
                      src={item.thumbnail || "/placeholder.svg"}
                      alt={item.title}
                      className="w-full h-48 object-cover rounded-t-lg"
                    />
                  </CardHeader>
                  <CardContent className="p-4">
                    <CardTitle className="text-white text-lg mb-2">{item.title}</CardTitle>
                    <CardDescription className="text-slate-400 mb-3">{item.description}</CardDescription>
                    <div className="flex items-center justify-between text-sm text-slate-500">
                      <span>by {item.author}</span>
                      <span>{item.timestamp}</span>
                    </div>
                    <div className="flex items-center justify-between mt-4">
                      <div className="flex items-center space-x-4">
                        <Button variant="ghost" size="sm" className="text-slate-400 hover:text-red-400">
                          <Heart className="w-4 h-4 mr-1" />
                          {item.likes}
                        </Button>
                        <Button variant="ghost" size="sm" className="text-slate-400 hover:text-blue-400">
                          <MessageSquare className="w-4 h-4 mr-1" />
                          {item.comments}
                        </Button>
                      </div>
                      <Button variant="ghost" size="sm" className="text-slate-400 hover:text-green-400">
                        <Share2 className="w-4 h-4" />
                      </Button>
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
