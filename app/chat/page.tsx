"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import { useAuth } from "@/lib/auth-context"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { ArrowLeft, Send, Mic, ImageIcon, Users } from "lucide-react"
import { useRouter } from "next/navigation"
import ProtectedRoute from "@/components/protected-route"

interface Message {
  id: string
  username: string
  content: string
  timestamp: string
  type: "text" | "voice" | "image"
}

export default function ChatPage() {
  const { user } = useAuth()
  const router = useRouter()
  const [messages, setMessages] = useState<Message[]>([])
  const [newMessage, setNewMessage] = useState("")
  const [activeRoom, setActiveRoom] = useState("general")
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault()
    if (!newMessage.trim()) return

    const message: Message = {
      id: Date.now().toString(),
      username: user?.username || "Anonymous",
      content: newMessage,
      timestamp: new Date().toLocaleTimeString(),
      type: "text",
    }

    setMessages((prev) => [...prev, message])
    setNewMessage("")
  }

  const rooms = [
    { id: "general", name: "General", icon: Users },
    { id: "media", name: "Media Discussion", icon: ImageIcon },
    { id: "voice", name: "Voice Chat", icon: Mic },
  ]

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-slate-900">
        {/* Header */}
        <header className="bg-slate-800 border-b border-slate-700 px-6 py-4">
          <div className="flex items-center space-x-4">
            <Button variant="ghost" size="sm" onClick={() => router.back()} className="text-white hover:bg-slate-700">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
            <h1 className="text-xl font-bold text-white">Chat</h1>
          </div>
        </header>

        <div className="flex h-[calc(100vh-73px)]">
          {/* Sidebar */}
          <aside className="w-64 bg-slate-800 border-r border-slate-700">
            <div className="p-4">
              <h2 className="text-lg font-semibold text-white mb-4">Chat Rooms</h2>
              <div className="space-y-2">
                {rooms.map((room) => {
                  const Icon = room.icon
                  return (
                    <Button
                      key={room.id}
                      variant={activeRoom === room.id ? "secondary" : "ghost"}
                      className={`w-full justify-start ${
                        activeRoom === room.id
                          ? "bg-purple-600 text-white"
                          : "text-slate-300 hover:bg-slate-700 hover:text-white"
                      }`}
                      onClick={() => setActiveRoom(room.id)}
                    >
                      <Icon className="mr-2 h-4 w-4" />
                      {room.name}
                    </Button>
                  )
                })}
              </div>
            </div>
          </aside>

          {/* Main Chat Area */}
          <main className="flex-1 flex flex-col">
            <div className="flex-1 overflow-y-auto p-4">
              <div className="max-w-4xl mx-auto">
                <Card className="bg-slate-800 border-slate-700 h-full">
                  <CardHeader>
                    <CardTitle className="text-white">
                      {rooms.find((r) => r.id === activeRoom)?.name || "General"}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="flex flex-col h-[calc(100vh-200px)]">
                    {/* Messages */}
                    <div className="flex-1 overflow-y-auto space-y-4 mb-4">
                      {messages.length === 0 ? (
                        <div className="text-center text-slate-400 py-8">
                          <Users className="h-12 w-12 mx-auto mb-4" />
                          <p>No messages yet. Start the conversation!</p>
                        </div>
                      ) : (
                        messages.map((message) => (
                          <div key={message.id} className="flex items-start space-x-3">
                            <Avatar className="h-8 w-8">
                              <AvatarFallback className="bg-purple-600 text-white text-sm">
                                {message.username.charAt(0).toUpperCase()}
                              </AvatarFallback>
                            </Avatar>
                            <div className="flex-1">
                              <div className="flex items-center space-x-2 mb-1">
                                <span className="font-medium text-white">{message.username}</span>
                                <span className="text-xs text-slate-400">{message.timestamp}</span>
                              </div>
                              <p className="text-slate-300">{message.content}</p>
                            </div>
                          </div>
                        ))
                      )}
                      <div ref={messagesEndRef} />
                    </div>

                    {/* Message Input */}
                    <form onSubmit={handleSendMessage} className="flex items-center space-x-2">
                      <Input
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        placeholder="Type your message..."
                        className="flex-1 bg-slate-700 border-slate-600 text-white placeholder:text-slate-400"
                      />
                      <Button type="button" variant="ghost" size="sm" className="text-slate-400 hover:bg-slate-700">
                        <Mic className="h-4 w-4" />
                      </Button>
                      <Button type="button" variant="ghost" size="sm" className="text-slate-400 hover:bg-slate-700">
                        <ImageIcon className="h-4 w-4" />
                      </Button>
                      <Button type="submit" size="sm" className="bg-purple-600 hover:bg-purple-700">
                        <Send className="h-4 w-4" />
                      </Button>
                    </form>
                  </CardContent>
                </Card>
              </div>
            </div>
          </main>
        </div>
      </div>
    </ProtectedRoute>
  )
}
