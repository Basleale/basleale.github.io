"use client"

import { useAuth } from "@/lib/auth-context"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Bell, MessageCircle, Upload, Users, Settings, LogOut, Heart, MessageSquare, Share2 } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

export default function HomePage() {
  const { user, logout, loading } = useAuth()
  const router = useRouter()
  const [notifications, setNotifications] = useState([])
  const [mediaItems, setMediaItems] = useState([])

  useEffect(() => {
    if (!loading && !user) {
      router.push("/auth")
    }
  }, [user, loading, router])

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="text-white">Loading...</div>
      </div>
    )
  }

  if (!user) {
    return null
  }

  return (
    <div className="min-h-screen bg-slate-900">
      {/* Header */}
      <header className="bg-slate-800 border-b border-slate-700 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="w-8 h-8 bg-purple-600 rounded-lg flex items-center justify-center">
              <div className="w-6 h-6 bg-white rounded transform rotate-45"></div>
            </div>
            <h1 className="text-xl font-bold text-white">Eneskench Summit</h1>
          </div>

          <div className="flex items-center space-x-4">
            {/* Notifications */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="text-white hover:bg-slate-700">
                  <Bell className="h-5 w-5" />
                  {notifications.length > 0 && (
                    <Badge className="ml-1 bg-red-500 text-white text-xs">{notifications.length}</Badge>
                  )}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-80 bg-slate-800 border-slate-700">
                <div className="p-2">
                  <h3 className="font-semibold text-white mb-2">Notifications</h3>
                  {notifications.length === 0 ? (
                    <p className="text-slate-400 text-sm">No notifications yet</p>
                  ) : (
                    notifications.map((notification: any, index) => (
                      <div key={index} className="p-2 hover:bg-slate-700 rounded text-sm text-white">
                        {notification.message}
                      </div>
                    ))
                  )}
                </div>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Profile Menu */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={user.avatar_url || ""} alt={user.display_name} />
                    <AvatarFallback className="bg-purple-600 text-white">
                      {user.display_name.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56 bg-slate-800 border-slate-700" align="end">
                <div className="flex items-center justify-start gap-2 p-2">
                  <div className="flex flex-col space-y-1 leading-none">
                    <p className="font-medium text-white">{user.display_name}</p>
                    <p className="w-[200px] truncate text-sm text-slate-400">@{user.username}</p>
                  </div>
                </div>
                <DropdownMenuSeparator className="bg-slate-700" />
                <DropdownMenuItem
                  className="text-white hover:bg-slate-700 cursor-pointer"
                  onClick={() => router.push("/settings")}
                >
                  <Settings className="mr-2 h-4 w-4" />
                  Settings
                </DropdownMenuItem>
                <DropdownMenuSeparator className="bg-slate-700" />
                <DropdownMenuItem className="text-red-400 hover:bg-slate-700 cursor-pointer" onClick={logout}>
                  <LogOut className="mr-2 h-4 w-4" />
                  Log out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Sidebar */}
        <aside className="w-64 bg-slate-800 border-r border-slate-700 min-h-screen p-4">
          <nav className="space-y-2">
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
              <h2 className="text-2xl font-bold text-white mb-2">Welcome back, {user.display_name}!</h2>
              <p className="text-slate-400">What would you like to share today?</p>
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
              <Card
                className="bg-slate-800 border-slate-700 hover:bg-slate-750 transition-colors cursor-pointer"
                onClick={() => router.push("/upload")}
              >
                <CardHeader className="pb-3">
                  <CardTitle className="text-white flex items-center">
                    <Upload className="mr-2 h-5 w-5 text-purple-400" />
                    Upload Media
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-slate-400 text-sm">Share your photos, videos, and more</p>
                </CardContent>
              </Card>

              <Card
                className="bg-slate-800 border-slate-700 hover:bg-slate-750 transition-colors cursor-pointer"
                onClick={() => router.push("/chat")}
              >
                <CardHeader className="pb-3">
                  <CardTitle className="text-white flex items-center">
                    <MessageCircle className="mr-2 h-5 w-5 text-blue-400" />
                    Join Chat
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-slate-400 text-sm">Connect with the community</p>
                </CardContent>
              </Card>

              <Card
                className="bg-slate-800 border-slate-700 hover:bg-slate-750 transition-colors cursor-pointer"
                onClick={() => router.push("/all-media")}
              >
                <CardHeader className="pb-3">
                  <CardTitle className="text-white flex items-center">
                    <Users className="mr-2 h-5 w-5 text-green-400" />
                    Explore
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-slate-400 text-sm">Discover what others are sharing</p>
                </CardContent>
              </Card>
            </div>

            {/* Recent Activity */}
            <Card className="bg-slate-800 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white">Recent Activity</CardTitle>
              </CardHeader>
              <CardContent>
                {mediaItems.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-slate-400">No interactions yet</p>
                    <p className="text-slate-500 text-sm mt-2">Start by uploading some media or joining the chat!</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {mediaItems.map((item: any, index) => (
                      <div key={index} className="flex items-center space-x-4 p-4 bg-slate-700 rounded-lg">
                        <Avatar>
                          <AvatarFallback className="bg-purple-600 text-white">
                            {item.username?.charAt(0).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <p className="text-white font-medium">{item.username}</p>
                          <p className="text-slate-400 text-sm">{item.description}</p>
                        </div>
                        <div className="flex space-x-2">
                          <Button variant="ghost" size="sm" className="text-slate-400 hover:text-red-400">
                            <Heart className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="sm" className="text-slate-400 hover:text-blue-400">
                            <MessageSquare className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="sm" className="text-slate-400 hover:text-green-400">
                            <Share2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    </div>
  )
}
