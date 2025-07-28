"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/lib/auth-context"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import {
  Bell,
  MessageCircle,
  Upload,
  Users,
  Settings,
  LogOut,
  Heart,
  MessageSquare,
  Share2,
  MoreHorizontal,
} from "lucide-react"
import { useRouter } from "next/navigation"
import ProtectedRoute from "@/components/protected-route"

interface MediaItem {
  id: string
  title: string
  description: string
  url: string
  thumbnail: string
  author: string
  likes: number
  comments: number
  timestamp: string
  tags: string[]
}

export default function HomePage() {
  const { user, logout } = useAuth()
  const router = useRouter()
  const [mediaItems, setMediaItems] = useState<MediaItem[]>([])
  const [notifications, setNotifications] = useState<any[]>([])

  useEffect(() => {
    // Load media items from your existing functionality
    // This would connect to your existing media upload system
    setMediaItems([])
  }, [])

  const handleProfileClick = () => {
    router.push("/settings")
  }

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-slate-900">
        {/* Header */}
        <header className="bg-slate-800 border-b border-slate-700 px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <h1 className="text-2xl font-bold text-white">Eneskench Summit</h1>
            </div>

            <div className="flex items-center space-x-4">
              {/* Notifications */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="text-white hover:bg-slate-700 relative">
                    <Bell className="h-5 w-5" />
                    {notifications.length > 0 && (
                      <Badge className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 text-xs bg-red-600">
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
                      <DropdownMenuItem key={index} className="text-white hover:bg-slate-700">
                        {notification.message}
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
                      <AvatarImage src={user?.avatar_url || ""} alt={user?.username} />
                      <AvatarFallback className="bg-purple-600 text-white">
                        {user?.username?.charAt(0).toUpperCase()}
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
                  <DropdownMenuItem onClick={handleProfileClick} className="text-white hover:bg-slate-700">
                    <Settings className="mr-2 h-4 w-4" />
                    Settings
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={logout} className="text-white hover:bg-slate-700">
                    <LogOut className="mr-2 h-4 w-4" />
                    Sign out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </header>

        <div className="flex">
          {/* Sidebar */}
          <aside className="w-64 bg-slate-800 border-r border-slate-700 min-h-screen">
            <nav className="p-4 space-y-2">
              <Button
                variant="ghost"
                className="w-full justify-start text-white hover:bg-slate-700"
                onClick={() => router.push("/upload")}
              >
                <Upload className="mr-2 h-4 w-4" />
                Upload Media
              </Button>
              <Button
                variant="ghost"
                className="w-full justify-start text-white hover:bg-slate-700"
                onClick={() => router.push("/chat")}
              >
                <MessageCircle className="mr-2 h-4 w-4" />
                Chat
              </Button>
              <Button
                variant="ghost"
                className="w-full justify-start text-white hover:bg-slate-700"
                onClick={() => router.push("/all-media")}
              >
                <Users className="mr-2 h-4 w-4" />
                All Media
              </Button>
            </nav>
          </aside>

          {/* Main Content */}
          <main className="flex-1 p-6">
            <div className="max-w-4xl mx-auto">
              <div className="mb-8">
                <h2 className="text-3xl font-bold text-white mb-2">Welcome back, {user?.display_name}!</h2>
                <p className="text-slate-400">Discover and share amazing content with the community.</p>
              </div>

              {/* Media Feed */}
              <div className="space-y-6">
                {mediaItems.length === 0 ? (
                  <Card className="bg-slate-800 border-slate-700">
                    <CardContent className="p-8 text-center">
                      <div className="text-slate-400 mb-4">
                        <Upload className="h-12 w-12 mx-auto mb-4" />
                        <h3 className="text-lg font-medium text-white mb-2">No interactions yet</h3>
                        <p>Be the first to upload and share content with the community!</p>
                      </div>
                      <Button onClick={() => router.push("/upload")} className="bg-purple-600 hover:bg-purple-700">
                        Upload Your First Media
                      </Button>
                    </CardContent>
                  </Card>
                ) : (
                  mediaItems.map((item) => (
                    <Card key={item.id} className="bg-slate-800 border-slate-700">
                      <CardContent className="p-6">
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex items-center space-x-3">
                            <Avatar className="h-10 w-10">
                              <AvatarFallback className="bg-purple-600 text-white">
                                {item.author.charAt(0).toUpperCase()}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="font-medium text-white">{item.author}</p>
                              <p className="text-sm text-slate-400">{item.timestamp}</p>
                            </div>
                          </div>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm" className="text-slate-400 hover:bg-slate-700">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent className="bg-slate-800 border-slate-700">
                              <DropdownMenuItem className="text-white hover:bg-slate-700">
                                <Share2 className="mr-2 h-4 w-4" />
                                Share
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>

                        <h3 className="text-xl font-bold text-white mb-2">{item.title}</h3>
                        <p className="text-slate-300 mb-4">{item.description}</p>

                        <div className="flex flex-wrap gap-2 mb-4">
                          {item.tags.map((tag) => (
                            <Badge key={tag} variant="secondary" className="bg-slate-700 text-slate-300">
                              #{tag}
                            </Badge>
                          ))}
                        </div>

                        <div className="flex items-center space-x-6 text-slate-400">
                          <Button variant="ghost" size="sm" className="text-slate-400 hover:text-red-400">
                            <Heart className="mr-1 h-4 w-4" />
                            {item.likes}
                          </Button>
                          <Button variant="ghost" size="sm" className="text-slate-400 hover:text-blue-400">
                            <MessageSquare className="mr-1 h-4 w-4" />
                            {item.comments}
                          </Button>
                          <Button variant="ghost" size="sm" className="text-slate-400 hover:text-green-400">
                            <Share2 className="mr-1 h-4 w-4" />
                            Share
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                )}
              </div>
            </div>
          </main>
        </div>
      </div>
    </ProtectedRoute>
  )
}
