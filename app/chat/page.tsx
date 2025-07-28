"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { ArrowLeft, Send, Mic, ImageIcon, Users } from "lucide-react"
import { useAuth } from "@/lib/auth-context"
import { ProtectedRoute } from "@/components/protected-route"
import { useRouter } from "next/navigation"

interface Message {
  id: string
  user: string
  content: string
  timestamp: string
  type: "text" | "image" | "voice"
}

interface ChatRoom {
  id: string
  name: string
  description: string
  memberCount: number
}

export default function ChatPage() {
  const { user } = useAuth()
  const router = useRouter()
  const [messages, setMessages] = useState<Message[]>([])
  const [newMessage, setNewMessage] = useState("")
  const [activeRoom, setActiveRoom] = useState("general")
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const chatRooms: ChatRoom[] = [
    { id: "general", name: "General", description: "General discussion", memberCount: 42 },
    { id: "media", name: "Media Share", description: "Share your latest creations", memberCount: 28 },
    { id: "feedback", name: "Feedback", description: "Get feedback on your work", memberCount: 15 },
    { id: "random", name: "Random", description: "Off-topic conversations", memberCount: 33 },
  ]

  useEffect(() => {
    // Load messages for active room
    setMessages([
      {
        id: "1",
        user: "System",
        content: `Welcome to #${chatRooms.find((r) => r.id === activeRoom)?.name}!`,
        timestamp: new Date().toLocaleTimeString(),
        type: "text",
      },
    ])
  }, [activeRoom])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault()
    if (!newMessage.trim()) return

    const message: Message = {
      id: Date.now().toString(),
      user: user?.display_name || "Anonymous",
      content: newMessage,
      timestamp: new Date().toLocaleTimeString(),
      type: "text",
    }

    setMessages((prev) => [...prev, message])
    setNewMessage("")
  }

  const handleVoiceMessage = () => {
    // Placeholder for voice message functionality
    const message: Message = {
      id: Date.now().toString(),
      user: user?.display_name || "Anonymous",
      content: "🎤 Voice message",
      timestamp: new Date().toLocaleTimeString(),
      type: "voice",
    }
    setMessages((prev) => [...prev, message])
  }

  const handleImageShare = () => {
    // Placeholder for image sharing functionality
    const message: Message = {
      id: Date.now().toString(),
      user: user?.display_name || "Anonymous",
      content: "📷 Shared an image",
      timestamp: new Date().toLocaleTimeString(),
      type: "image",
    }
    setMessages((prev) => [...prev, message])
  }

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-slate-900">
        {/* Header */}
        <header className="bg-slate-800 border-b border-slate-700 px-4 py-3">
          <div className="max-w-7xl mx-auto flex items-center">
            <Button
              onClick={() => router.back()}
              variant="ghost"
              size="sm"
              className="text-slate-300 hover:text-white mr-4"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
            <h1 className="text-2xl font-bold text-white">Chat</h1>
          </div>
        </header>

        {/* Main Content */}
        <main className="max-w-7xl mx-auto px-4 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 h-[calc(100vh-12rem)]">
            {/* Room List */}
            <Card className="bg-slate-800 border-slate-700 lg:col-span-1">
              <CardHeader>
                <CardTitle className="text-white flex items-center">
                  <Users className="w-5 h-5 mr-2" />
                  Rooms
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <div className="space-y-1">
                  {chatRooms.map((room) => (
                    <Button
                      key={room.id}
                      onClick={() => setActiveRoom(room.id)}
                      variant={activeRoom === room.id ? "secondary" : "ghost"}
                      className={`w-full justify-start text-left p-3 h-auto ${
                        activeRoom === room.id
                          ? "bg-slate-700 text-white"
                          : "text-slate-300 hover:bg-slate-700 hover:text-white"
                      }`}
                    >
                      <div>
                        <div className="font-medium">#{room.name}</div>
                        <div className="text-xs text-slate-400">{room.memberCount} members</div>
                      </div>
                    </Button>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Chat Area */}
            <Card className="bg-slate-800 border-slate-700 lg:col-span-3 flex flex-col">
              <CardHeader className="border-b border-slate-700">
                <CardTitle className="text-white">#{chatRooms.find((r) => r.id === activeRoom)?.name}</CardTitle>
                <p className="text-slate-400 text-sm">{chatRooms.find((r) => r.id === activeRoom)?.description}</p>
              </CardHeader>

              {/* Messages */}
              <CardContent className="flex-1 overflow-y-auto p-4 space-y-4">
                {messages.map((message) => (
                  <div key={message.id} className="flex items-start space-x-3">
                    <Avatar className="h-8 w-8">
                      <AvatarFallback className="bg-purple-600 text-white text-xs">
                        {message.user.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-1">
                        <span className="text-white font-medium text-sm">{message.user}</span>
                        <span className="text-slate-400 text-xs">{message.timestamp}</span>
                      </div>
                      <div className="text-slate-300 text-sm">{message.content}</div>
                    </div>
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </CardContent>

              {/* Message Input */}
              <div className="border-t border-slate-700 p-4">
                <form onSubmit={handleSendMessage} className="flex items-center space-x-2">
                  <Button
                    type="button"
                    onClick={handleVoiceMessage}
                    variant="outline"
                    size="icon"
                    className="border-slate-600 text-slate-300 hover:bg-slate-700 bg-transparent"
                  >
                    <Mic className="w-4 h-4" />
                  </Button>
                  <Button
                    type="button"
                    onClick={handleImageShare}
                    variant="outline"
                    size="icon"
                    className="border-slate-600 text-slate-300 hover:bg-slate-700 bg-transparent"
                  >
                    <ImageIcon className="w-4 h-4" />
                  </Button>
                  <Input
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder={`Message #${chatRooms.find((r) => r.id === activeRoom)?.name}`}
                    className="flex-1 bg-slate-700 border-slate-600 text-white placeholder:text-slate-400"
                  />
                  <Button type="submit" className="bg-blue-600 hover:bg-blue-700">
                    <Send className="w-4 h-4" />
                  </Button>
                </form>
              </div>
            </Card>
          </div>
        </main>
      </div>
    </ProtectedRoute>
  )
}
