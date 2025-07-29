"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import { useAuth } from "@/lib/auth-context"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Upload, Heart, MessageCircle, Share2, Settings, LogOut, Bell, Search } from "lucide-react"
import { toast } from "sonner"
import ProtectedRoute from "@/components/protected-route"

interface MediaItem {
  id: string
  url: string
  title: string
  description: string
  user: {
    id: string
    username: string
    display_name: string
    avatar_url?: string
  }
  likes_count: number
  comments_count: number
  is_liked: boolean
  created_at: string
}

export default function HomePage() {
  const { user, logout, token } = useAuth()
  const router = useRouter()
  const [media, setMedia] = useState<MediaItem[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [isUploadOpen, setIsUploadOpen] = useState(false)
  const [uploadData, setUploadData] = useState({
    title: "",
    description: "",
  })
  const [isUploading, setIsUploading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)

  const notifications = [
    { id: "1", message: "Welcome to Eneskench Summit!", time: "2 hours ago" },
    { id: "2", message: "New features available in chat", time: "1 day ago" },
  ]

  useEffect(() => {
    loadMedia()
  }, [])

  const loadMedia = async () => {
    try {
      const response = await fetch("/api/media", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (response.ok) {
        const data = await response.json()
        setMedia(data.media || [])
      }
    } catch (error) {
      console.error("Error loading media:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleLogout = () => {
    logout()
    router.push("/auth")
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setSelectedFile(file)
      setUploadData({ ...uploadData, title: file.name })
    }
  }

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedFile) {
      toast.error("Please select a file")
      return
    }

    setIsUploading(true)

    try {
      const formData = new FormData()
      formData.append("file", selectedFile)
      formData.append("title", uploadData.title)
      formData.append("description", uploadData.description)

      const response = await fetch("/api/media", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      })

      if (response.ok) {
        toast.success("Media uploaded successfully!")
        setIsUploadOpen(false)
        setSelectedFile(null)
        setUploadData({ title: "", description: "" })
        loadMedia()
      } else {
        const data = await response.json()
        toast.error(data.error || "Upload failed")
      }
    } catch (error) {
      console.error("Upload error:", error)
      toast.error("Upload failed")
    } finally {
      setIsUploading(false)
    }
  }

  const filteredMedia = media.filter(
    (item) =>
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.description.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-slate-900">
        {/* Header */}
        <header className="bg-slate-800 border-b border-slate-700 px-4 py-3">
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <h1 className="text-2xl font-bold text-blue-400">Eneskench Summit</h1>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
                <Input
                  placeholder="Search media..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 bg-slate-700 border-slate-600 text-white w-64"
                />
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <Button variant="ghost" onClick={() => router.push("/chat")} className="text-slate-300 hover:text-white">
                <MessageCircle className="w-4 h-4 mr-2" />
                Chat
              </Button>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="text-slate-300 hover:text-white relative">
                    <Bell className="w-4 h-4" />
                    {notifications.length > 0 && (
                      <Badge className="absolute -top-1 -right-1 h-5 w-5 p-0 text-xs bg-red-500">
                        {notifications.length}
                      </Badge>
                    )}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="bg-slate-800 border-slate-700 w-80">
                  <div className="p-2">
                    <h3 className="font-semibold text-white mb-2">Notifications</h3>
                    {notifications.length === 0 ? (
                      <p className="text-slate-400 text-sm">No new notifications</p>
                    ) : (
                      notifications.map((notification) => (
                        <div key={notification.id} className="p-2 hover:bg-slate-700 rounded">
                          <p className="text-white text-sm">{notification.message}</p>
                          <p className="text-slate-400 text-xs">{notification.time}</p>
                        </div>
                      ))
                    )}
                  </div>
                </DropdownMenuContent>
              </DropdownMenu>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="flex items-center space-x-2 text-slate-300 hover:text-white">
                    <Avatar className="h-8 w-8">
                      <AvatarFallback className="bg-blue-600 text-white">
                        {user?.username?.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <span>{user?.display_name}</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="bg-slate-800 border-slate-700">
                  <DropdownMenuItem
                    onClick={() => router.push("/settings")}
                    className="text-slate-300 hover:text-white hover:bg-slate-700"
                  >
                    <Settings className="w-4 h-4 mr-2" />
                    Settings
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={handleLogout}
                    className="text-slate-300 hover:text-white hover:bg-slate-700"
                  >
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
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            {/* Sidebar */}
            <div className="lg:col-span-1">
              <Card className="bg-slate-800 border-slate-700">
                <CardHeader>
                  <CardTitle className="text-white">Quick Actions</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Dialog open={isUploadOpen} onOpenChange={setIsUploadOpen}>
                    <DialogTrigger asChild>
                      <Button className="w-full bg-blue-600 hover:bg-blue-700">
                        <Upload className="w-4 h-4 mr-2" />
                        Upload Media
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="bg-slate-800 border-slate-700">
                      <DialogHeader>
                        <DialogTitle className="text-white">Upload Media</DialogTitle>
                      </DialogHeader>
                      <form onSubmit={handleUpload} className="space-y-4">
                        <div className="space-y-2">
                          <Label htmlFor="file" className="text-slate-300">
                            Select File
                          </Label>
                          <Input
                            id="file"
                            type="file"
                            ref={fileInputRef}
                            onChange={handleFileSelect}
                            className="bg-slate-700 border-slate-600 text-white"
                            accept="image/*,video/*"
                            required
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="title" className="text-slate-300">
                            Title
                          </Label>
                          <Input
                            id="title"
                            type="text"
                            value={uploadData.title}
                            onChange={(e) => setUploadData({ ...uploadData, title: e.target.value })}
                            className="bg-slate-700 border-slate-600 text-white"
                            required
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="description" className="text-slate-300">
                            Description
                          </Label>
                          <Textarea
                            id="description"
                            value={uploadData.description}
                            onChange={(e) => setUploadData({ ...uploadData, description: e.target.value })}
                            className="bg-slate-700 border-slate-600 text-white"
                            rows={3}
                          />
                        </div>

                        <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700" disabled={isUploading}>
                          {isUploading ? "Uploading..." : "Upload"}
                        </Button>
                      </form>
                    </DialogContent>
                  </Dialog>

                  <Button
                    variant="outline"
                    className="w-full border-slate-600 text-slate-300 hover:text-white hover:bg-slate-700 bg-transparent"
                    onClick={() => router.push("/chat")}
                  >
                    <MessageCircle className="w-4 h-4 mr-2" />
                    Join Chat
                  </Button>
                </CardContent>
              </Card>
            </div>

            {/* Media Feed */}
            <div className="lg:col-span-3">
              <Card className="bg-slate-800 border-slate-700">
                <CardHeader>
                  <CardTitle className="text-white">Media Feed</CardTitle>
                </CardHeader>
                <CardContent>
                  {isLoading ? (
                    <div className="text-center py-8">
                      <div className="text-slate-400">Loading media...</div>
                    </div>
                  ) : filteredMedia.length === 0 ? (
                    <div className="text-center py-8">
                      <div className="text-slate-400">
                        {searchQuery ? "No media found matching your search." : "No media uploaded yet"}
                      </div>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {filteredMedia.map((item) => (
                        <Card key={item.id} className="bg-slate-700 border-slate-600">
                          <CardContent className="p-4">
                            <div className="aspect-square bg-slate-600 rounded-lg mb-3 overflow-hidden">
                              <img
                                src={item.url || "/placeholder.svg?height=300&width=300"}
                                alt={item.title}
                                className="w-full h-full object-cover"
                              />
                            </div>
                            <h3 className="text-white font-semibold mb-2">{item.title}</h3>
                            <p className="text-slate-300 text-sm mb-3">{item.description}</p>
                            <div className="flex items-center justify-between">
                              <div className="flex items-center space-x-2">
                                <Avatar className="h-6 w-6">
                                  <AvatarFallback className="bg-blue-600 text-white text-xs">
                                    {item.user.username.charAt(0).toUpperCase()}
                                  </AvatarFallback>
                                </Avatar>
                                <span className="text-slate-400 text-sm">{item.user.display_name}</span>
                              </div>
                              <div className="flex items-center space-x-3">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className={`text-slate-400 hover:text-red-400 ${item.is_liked ? "text-red-400" : ""}`}
                                >
                                  <Heart className="w-4 h-4 mr-1" />
                                  {item.likes_count}
                                </Button>
                                <Button variant="ghost" size="sm" className="text-slate-400 hover:text-blue-400">
                                  <MessageCircle className="w-4 h-4 mr-1" />
                                  {item.comments_count}
                                </Button>
                                <Button variant="ghost" size="sm" className="text-slate-400 hover:text-green-400">
                                  <Share2 className="w-4 h-4" />
                                </Button>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </main>
      </div>
    </ProtectedRoute>
  )
}
