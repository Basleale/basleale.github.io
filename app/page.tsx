"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Bell, MessageCircle, Upload, Settings, LogOut, Heart, MessageSquare, Share2 } from "lucide-react"
import { useAuth } from "@/lib/auth-context"
import { useRouter } from "next/navigation"
import ProtectedRoute from "@/components/protected-route"

export default function HomePage() {
  const { user, logout } = useAuth()
  const router = useRouter()
  const [notifications, setNotifications] = useState([])
  const [mediaItems, setMediaItems] = useState([])

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
              <h1 className="text-2xl font-bold text-white">Eneskench Summit</h1>
            </div>

            <div className="flex items-center space-x-4">
              {/* Notifications */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="text-slate-300 hover:text-white relative">
                    <Bell className="h-5 w-5" />
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
                      <p className="text-slate-400 text-sm">No notifications yet</p>
                    ) : (
                      notifications.map((notification, index) => (
                        <div key={index} className="py-2 border-b border-slate-700 last:border-0">
                          <p className="text-sm text-slate-300">{notification}</p>
                        </div>
                      ))
                    )}
                  </div>
                </DropdownMenuContent>
              </DropdownMenu>

              {/* Chat */}
              <Button
                variant="ghost"
                size="sm"
                className="text-slate-300 hover:text-white"
                onClick={() => router.push("/chat")}
              >
                <MessageCircle className="h-5 w-5" />
              </Button>

              {/* Upload */}
              <Button
                variant="ghost"
                size="sm"
                className="text-slate-300 hover:text-white"
                onClick={() => router.push("/upload")}
              >
                <Upload className="h-5 w-5" />
              </Button>

              {/* Profile */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={user?.avatar_url || ""} alt={user?.username || ""} />
                      <AvatarFallback className="bg-slate-700 text-white">
                        {user?.username?.charAt(0).toUpperCase() || "U"}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="bg-slate-800 border-slate-700">
                  <DropdownMenuItem
                    className="text-slate-300 hover:text-white hover:bg-slate-700"
                    onClick={() => router.push("/settings")}
                  >
                    <Settings className="mr-2 h-4 w-4" />
                    Settings
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    className="text-slate-300 hover:text-white hover:bg-slate-700"
                    onClick={handleLogout}
                  >
                    <LogOut className="mr-2 h-4 w-4" />
                    Logout
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
                <p className="text-slate-400 text-lg">No interactions yet</p>
                <p className="text-slate-500 text-sm mt-2">Upload some media to get started!</p>
                <Button className="mt-4 bg-blue-600 hover:bg-blue-700" onClick={() => router.push("/upload")}>
                  <Upload className="mr-2 h-4 w-4" />
                  Upload Media
                </Button>
              </div>
            ) : (
              mediaItems.map((item, index) => (
                <Card key={index} className="bg-slate-800 border-slate-700">
                  <CardHeader>
                    <div className="flex items-center space-x-3">
                      <Avatar className="h-8 w-8">
                        <AvatarFallback className="bg-slate-700 text-white">
                          {item.username?.charAt(0).toUpperCase() || "U"}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <CardTitle className="text-white text-sm">{item.username}</CardTitle>
                        <CardDescription className="text-slate-400 text-xs">{item.timestamp}</CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="aspect-square bg-slate-700 rounded-lg mb-4 flex items-center justify-center">
                      <p className="text-slate-400">Media Preview</p>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <Button variant="ghost" size="sm" className="text-slate-400 hover:text-red-400">
                          <Heart className="h-4 w-4 mr-1" />
                          {item.likes || 0}
                        </Button>
                        <Button variant="ghost" size="sm" className="text-slate-400 hover:text-blue-400">
                          <MessageSquare className="h-4 w-4 mr-1" />
                          {item.comments || 0}
                        </Button>
                      </div>
                      <Button variant="ghost" size="sm" className="text-slate-400 hover:text-green-400">
                        <Share2 className="h-4 w-4" />
                      </Button>
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
