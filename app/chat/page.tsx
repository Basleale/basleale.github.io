"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import { useAuth } from "@/lib/auth-context"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { ArrowLeft, Send, Mic, ImageIcon, Users } from "lucide-react"
import ProtectedRoute from "@/components/protected-route"

interface Message {
  id: string
  content: string
  author: string
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
  const [chatRooms] = useState<ChatRoom[]>([
    { id: "general", name: "General", description: "General discussion", memberCount: 42 },
    { id: "media", name: "Media Share", description: "Share your latest creations", memberCount: 28 },
    { id: "feedback", name: "Feedback", description: "Get feedback on your work", memberCount: 15 },
    { id: "random", name: "Random", description: "Off-topic conversations", memberCount: 33 },
  ])
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    loadMessages()
  }, [activeRoom])

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  const loadMessages = async () => {
    try {
      const response = await fetch(`/api/chat/messages?room=${activeRoom}`)
      if (response.ok) {
        const data = await response.json()
        setMessages(data.messages || [])
      }
    } catch (error) {
      console.error("Error loading messages:", error)
    }
  }

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newMessage.trim()) return

    const message: Message = {
      id: Date.now().toString(),
      content: newMessage,
      author: user?.username || "Anonymous",
      timestamp: new Date().toISOString(),
      type: "text",
    }

    setMessages((prev) => [...prev, message])
    setNewMessage("")

    try {
      await fetch("/api/chat/messages", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          room: activeRoom,
          message: message,
        }),
      })
    } catch (error) {
      console.error("Error sending message:", error)
    }
  }

  const formatTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
  }

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-slate-900">
        {/* Header */}
        <header className="bg-slate-800 border-b border-slate-700 px-4 py-3">
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button variant="ghost" onClick={() => router.push("/")} className="text-slate-300 hover:text-white">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back
              </Button>
              <h1 className="text-2xl font-bold text-white">Chat</h1>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="max-w-7xl mx-auto px-4 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 h-[calc(100vh-200px)]">
            {/* Chat Rooms Sidebar */}
            <div className="lg:col-span-1">
              <Card className="bg-slate-800 border-slate-700 h-full">
                <CardHeader>
                  <CardTitle className="text-white flex items-center">
                    <Users className="w-5 h-5 mr-2" />
                    Chat Rooms
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                  <div className="space-y-1">
                    {chatRooms.map((room) => (
                      <button
                        key={room.id}
                        onClick={() => setActiveRoom(room.id)}
                        className={`w-full text-left p-3 rounded-lg transition-colors ${
                          activeRoom === room.id
                            ? "bg-blue-600 text-white"
                            : "text-slate-300 hover:bg-slate-700 hover:text-white"
                        }`}
                      >
                        <div className="font-medium">{room.name}</div>
                        <div className="text-sm opacity-75">{room.memberCount} members</div>
                      </button>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Chat Area */}
            <div className="lg:col-span-3">
              <Card className="bg-slate-800 border-slate-700 h-full flex flex-col">
                <CardHeader className="border-b border-slate-700">
                  <CardTitle className="text-white">
                    #{chatRooms.find((room) => room.id === activeRoom)?.name || "General"}
                  </CardTitle>
                  <p className="text-slate-400 text-sm">
                    {chatRooms.find((room) => room.id === activeRoom)?.description}
                  </p>
                </CardHeader>

                {/* Messages */}
                <CardContent className="flex-1 p-0">
                  <ScrollArea className="h-full p-4">
                    <div className="space-y-4">
                      {messages.length === 0 ? (
                        <div className="text-center text-slate-400 py-8">
                          <p>No messages yet. Start the conversation!</p>
                        </div>
                      ) : (
                        messages.map((message) => (
                          <div key={message.id} className="flex space-x-3">
                            <div className="flex-shrink-0">
                              <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white text-sm font-medium">
                                {message.author.charAt(0).toUpperCase()}
                              </div>
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center space-x-2">
                                <span className="text-white font-medium">{message.author}</span>
                                <span className="text-slate-400 text-xs">{formatTime(message.timestamp)}</span>
                              </div>
                              <p className="text-slate-300 mt-1">{message.content}</p>
                            </div>
                          </div>
                        ))
                      )}
                      <div ref={messagesEndRef} />
                    </div>
                  </ScrollArea>
                </CardContent>

                {/* Message Input */}
                <div className="border-t border-slate-700 p-4">
                  <form onSubmit={sendMessage} className="flex space-x-2">
                    <div className="flex-1 relative">
                      <Input
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        placeholder={`Message #${chatRooms.find((room) => room.id === activeRoom)?.name || "general"}`}
                        className="bg-slate-700 border-slate-600 text-white pr-20"
                      />
                      <div className="absolute right-2 top-1/2 transform -translate-y-1/2 flex space-x-1">
                        <Button type="button" variant="ghost" size="icon" className="h-8 w-8">
                          <ImageIcon className="w-4 h-4 text-slate-400" />
                        </Button>
                        <Button type="button" variant="ghost" size="icon" className="h-8 w-8">
                          <Mic className="w-4 h-4 text-slate-400" />
                        </Button>
                      </div>
                    </div>
                    <Button type="submit" className="bg-blue-600 hover:bg-blue-700">
                      <Send className="w-4 h-4" />
                    </Button>
                  </form>
                </div>
              </Card>
            </div>
          </div>
        </main>
      </div>
    </ProtectedRoute>
  )
}
