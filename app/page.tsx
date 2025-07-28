"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/lib/auth-context"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Search, Menu, Bell, Users, BarChart3, Clock, Settings, MessageCircle, Heart, Upload, LogOut } from 'lucide-react'
import ProtectedRoute from "@/components/protected-route"

interface MediaItem {
  id: string
  title: string
  description: string
  imageUrl: string
  uploader: string
  uploaderId: string
  likes: number
  comments: number
  isLiked: boolean
  createdAt: string
}

export default function HomePage() {
  const { user, logout } = useAuth()
  const [searchQuery, setSearchQuery] = useState("")
  const [mediaItems, setMediaItems] = useState<MediaItem[]>([])
  const [loading, setLoading] = useState(true)

  // Mock data for now - replace with actual API calls
  useEffect(() => {
    const mockData: MediaItem[] = [
      {
        id: "1",
        title: "Image Tagging AI",
        description: "with oral suggestions",
        imageUrl: "/placeholder.svg?height=300&width=400&text=Portrait+1",
        uploader: "john_doe",
        uploaderId: "user1",
        likes: 24,
        comments: 8,
        isLiked: false,
        createdAt: "2024-01-15T10:30:00Z"
      },
      {
        id: "2",
        title: "Usth Uploads",
        description: "ANlbties",
        imageUrl: "/placeholder.svg?height=300&width=400&text=Portrait+2",
        uploader: "jane_smith",
        uploaderId: "user2",
        likes: 18,
        comments: 5,
        isLiked: true,
        createdAt: "2024-01-14T15:45:00Z"
      },
      {
        id: "3",
        title: "Dynamic Sploe of",
        description: "4K Video",
        imageUrl: "/placeholder.svg?height=300&width=400&text=Landscape+1",
        uploader: "alex_wilson",
        uploaderId: "user3",
        likes: 32,
        comments: 12,
        isLiked: false,
        createdAt: "2024-01-13T09:20:00Z"
      },
      {
        id: "4",
        title: "Buttery Smooth",
        description: "4K Video",
        imageUrl: "/placeholder.svg?height=300&width=400&text=Portrait+3",
        uploader: "sarah_jones",
        uploaderId: "user4",
        likes: 45,
        comments: 20,
        isLiked: true,
        createdAt: "2024-01-12T14:10:00Z"
      }
    ]
    
    setTimeout(() => {
      setMediaItems(mockData)
      setLoading(false)
    }, 1000)
  }, [])

  const handleLike = async (mediaId: string) => {
    setMediaItems(prev => prev.map(item => 
      item.id === mediaId 
        ? { 
            ...item, 
            isLiked: !item.isLiked,
            likes: item.isLiked ? item.likes - 1 : item.likes + 1
          }
        : item
    ))
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    // Implement search functionality
    console.log("Searching for:", searchQuery)
  }

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-slate-900 text-white">
        {/* Header */}
        <header className="bg-slate-800 border-b border-slate-700 px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button variant="ghost" size="sm" className="text-white hover:bg-slate-700">
                <Menu className="h-5 w-5" />
              </Button>
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center">
                  <div className="w-6 h-6 bg-slate-900 rounded transform rotate-45"></div>
                </div>
                <h1 className="text-xl font-bold">Eneskench Summit</h1>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <span className="text-slate-300">Albbuch</span>
              <div className="relative">
                <Bell className="h-5 w-5 text-slate-300" />
                <Badge className="absolute -top-2 -right-2 h-5 w-5 rounded-full bg-red-500 text-xs flex items-center justify-center p-0">
                  1
                </Badge>
              </div>
              <Avatar className="h-8 w-8">
                <AvatarImage src="/placeholder-user.jpg" />
                <AvatarFallback className="bg-purple-600">
                  {user?.username?.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={logout}
                className="text-slate-300 hover:bg-slate-700"
              >
                <LogOut className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </header>

        <div className="flex">
          {/* Sidebar */}
          <aside className="w-16 bg-slate-800 border-r border-slate-700 py-4">
            <nav className="flex flex-col items-center space-y-4">
              <div className="relative">
                <Button variant="ghost" size="sm" className="text-slate-300 hover:bg-slate-700">
                  <Users className="h-5 w-5" />
                </Button>
                <Badge className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-red-500 text-xs flex items-center justify-center p-0">
                  1
                </Badge>
              </div>
              <Button variant="ghost" size="sm" className="text-slate-300 hover:bg-slate-700">
                <BarChart3 className="h-5 w-5" />
              </Button>
              <Button variant="ghost" size="sm" className="text-slate-300 hover:bg-slate-700">
                <Menu className="h-5 w-5" />
              </Button>
              <Button variant="ghost" size="sm" className="text-slate-300 hover:bg-slate-700">
                <Clock className="h-5 w-5" />
              </Button>
              <Button variant="ghost" size="sm" className="text-slate-300 hover:bg-slate-700">
                <Settings className="h-5 w-5" />
              </Button>
              <Button variant="ghost" size="sm" className="text-slate-300 hover:bg-slate-700">
                <MessageCircle className="h-5 w-5" />
              </Button>
            </nav>
          </aside>

          {/* Main Content */}
          <main className="flex-1 p-6">
            {/* Search Bar */}
            <form onSubmit={handleSearch} className="mb-8">
              <div className="flex max-w-2xl">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 h-4 w-4" />
                  <Input
                    type="text"
                    placeholder="Search by Name"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 bg-slate-800 border-slate-700 text-white placeholder:text-slate-400"
                  />
                </div>
                <Button type="submit" className="ml-2 bg-purple-600 hover:bg-purple-700">
                  <Search className="h-4 w-4" />
                </Button>
              </div>
            </form>

            {/* Upload Button */}
            <div className="mb-6">
              <Button className="bg-purple-600 hover:bg-purple-700">
                <Upload className="h-4 w-4 mr-2" />
                Upload Media
              </Button>
            </div>

            {/* Recently Uploaded Section */}
            <section className="mb-8">
              <h2 className="text-2xl font-bold mb-6">Uptently uploads</h2>
              
              {loading ? (
                <div className="flex space-x-4">
                  {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="w-64 h-80 bg-slate-800 rounded-lg animate-pulse" />
                  ))}
                </div>
              ) : (
                <div className="flex space-x-4 overflow-x-auto pb-4">
                  {mediaItems.slice(0, 4).map((item) => (
                    <Card key={item.id} className="flex-shrink-0 w-64 bg-slate-800 border-slate-700">
                      <CardContent className="p-0">
                        <div className="relative">
                          <img
                            src={item.imageUrl || "/placeholder.svg"}
                            alt={item.title}
                            className="w-full h-48 object-cover rounded-t-lg"
                          />
                          <div className="absolute bottom-2 left-2 bg-black/50 rounded px-2 py-1">
                            <p className="text-white text-sm font-medium">{item.title}</p>
                            <p className="text-slate-300 text-xs">{item.description}</p>
                          </div>
                        </div>
                        <div className="p-4">
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center space-x-2">
                              <Avatar className="h-6 w-6">
                                <AvatarFallback className="bg-purple-600 text-xs">
                                  {item.uploader.charAt(0).toUpperCase()}
                                </AvatarFallback>
                              </Avatar>
                              <span className="text-slate-300 text-sm">@{item.uploader}</span>
                            </div>
                          </div>
                          <div className="flex items-center space-x-4">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleLike(item.id)}
                              className={`text-slate-300 hover:bg-slate-700 ${
                                item.isLiked ? 'text-red-500' : ''
                              }`}
                            >
                              <Heart className={`h-4 w-4 mr-1 ${item.isLiked ? 'fill-current' : ''}`} />
                              {item.likes}
                            </Button>
                            <Button variant="ghost" size="sm" className="text-slate-300 hover:bg-slate-700">
                              <MessageCircle className="h-4 w-4 mr-1" />
                              {item.comments}
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}

              {/* Pagination dots */}
              <div className="flex justify-center mt-4 space-x-2">
                {[0, 1, 2, 3].map((dot) => (
                  <div
                    key={dot}
                    className={`w-2 h-2 rounded-full ${
                      dot === 0 ? 'bg-purple-600' : 'bg-slate-600'
                    }`}
                  />
                ))}
              </div>
            </section>

            {/* Photo Stream Section */}
            <section>
              <h2 className="text-2xl font-bold mb-6">Photo Stream</h2>
              
              {loading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="h-80 bg-slate-800 rounded-lg animate-pulse" />
                  ))}
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {mediaItems.slice(0, 3).map((item) => (
                    <Card key={item.id} className="bg-slate-800 border-slate-700">
                      <CardContent className="p-0">
                        <div className="relative">
                          <img
                            src={item.imageUrl || "/placeholder.svg"}
                            alt={item.title}
                            className="w-full h-64 object-cover rounded-t-lg"
                          />
                          <div className="absolute bottom-2 left-2 bg-black/50 rounded px-2 py-1">
                            <p className="text-white font-medium">{item.title}</p>
                            <p className="text-slate-300 text-sm">{item.description}</p>
                          </div>
                        </div>
                        <div className="p-4">
                          <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center space-x-2">
                              <Avatar className="h-8 w-8">
                                <AvatarFallback className="bg-purple-600">
                                  {item.uploader.charAt(0).toUpperCase()}
                                </AvatarFallback>
                              </Avatar>
                              <div>
                                <p className="text-white text-sm font-medium">@{item.uploader}</p>
                                <p className="text-slate-400 text-xs">
                                  {new Date(item.createdAt).toLocaleDateString()}
                                </p>
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center space-x-4">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleLike(item.id)}
                              className={`text-slate-300 hover:bg-slate-700 ${
                                item.isLiked ? 'text-red-500' : ''
                              }`}
                            >
                              <Heart className={`h-4 w-4 mr-1 ${item.isLiked ? 'fill-current' : ''}`} />
                              {item.likes}
                            </Button>
                            <Button variant="ghost" size="sm" className="text-slate-300 hover:bg-slate-700">
                              <MessageCircle className="h-4 w-4 mr-1" />
                              {item.comments}
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </section>
          </main>
        </div>
      </div>
    </ProtectedRoute>
  )
}
