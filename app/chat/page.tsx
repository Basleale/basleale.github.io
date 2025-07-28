"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { ArrowLeft, Send, Mic, ImageIcon, Users } from "lucide-react"
import { useAuth } from "@/lib/auth-context"
import { useRouter } from "next/navigation"
import ProtectedRoute from "@/components/protected-route"

interface Message {
  id: string
  content: string
  author: string
  timestamp: string
  type: "text" | "voice" | "image"
}

interface ChatRoom {
  id: string
  name: string
  type: "public" | "private"
  participants?: string[]
}

export default function ChatPage() {
  const { user } = useAuth()
  const router = useRouter()
  const [messages, setMessages] = useState<Message[]>([])
  const [newMessage, setNewMessage] = useState("")
  const [activeRoom, setActiveRoom] = useState("general")
  const [chatRooms] = useState<ChatRoom[]>([
    { id: "general", name: "General", type: "public" },
    { id: "media", name: "Media Discussion", type: "public" },
    { id: "announcements", name: "Announcements", type: "public" },
  ])
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    loadMessages(activeRoom)
  }, [activeRoom])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  const loadMessages = async (roomId: string) => {
    try {
      const response = await fetch(`/api/chat/messages?room=${roomId}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("auth_token")}`,
        },
      })
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

    try {
      const response = await fetch("/api/chat/messages", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("auth_token")}`,
        },
        body: JSON.stringify({
          room: activeRoom,
          content: newMessage,
          type: "text",
        }),
      })

      if (response.ok) {
        setMessages((prev) => [...prev, message])
        setNewMessage("")
      }
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
        <div className="flex flex-col h-screen">
          {/* Header */}
          <header className="bg-slate-800 border-b border-slate-700 p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-slate-300 hover:text-white"
                  onClick={() => router.back()}
                >
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back
                </Button>
                <h1 className="text-xl font-bold text-white">Chat</h1>
              </div>
            </div>
          </header>

          <div className="flex flex-1 overflow-hidden">
            {/* Sidebar */}
            <div className="w-64 bg-slate-800 border-r border-slate-700 p-4">
              <Tabs defaultValue="public" className="w-full">
                <TabsList className="grid w-full grid-cols-2 bg-slate-700">
                  <TabsTrigger
                    value="public"
                    className="text-slate-300 data-[state=active]:bg-slate-600 data-[state=active]:text-white"
                  >
                    Public
                  </TabsTrigger>
                  <TabsTrigger
                    value="private"
                    className="text-slate-300 data-[state=active]:bg-slate-600 data-[state=active]:text-white"
                  >
                    Private
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="public" className="mt-4">
                  <div className="space-y-2">
                    {chatRooms
                      .filter((room) => room.type === "public")
                      .map((room) => (
                        <Button
                          key={room.id}
                          variant={activeRoom === room.id ? "secondary" : "ghost"}
                          className="w-full justify-start text-slate-300 hover:text-white"
                          onClick={() => setActiveRoom(room.id)}
                        >
                          <Users className="h-4 w-4 mr-2" />
                          {room.name}
                        </Button>
                      ))}
                  </div>
                </TabsContent>

                <TabsContent value="private" className="mt-4">
                  <div className="text-slate-400 text-sm text-center py-8">Private chats coming soon</div>
                </TabsContent>
              </Tabs>
            </div>

            {/* Chat Area */}
            <div className="flex-1 flex flex-col">
              {/* Chat Header */}
              <div className="bg-slate-800 border-b border-slate-700 p-4">
                <h2 className="text-white font-medium">
                  {chatRooms.find((room) => room.id === activeRoom)?.name || "Chat"}
                </h2>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {messages.length === 0 ? (
                  <div className="text-center text-slate-400 py-8">No messages yet. Start the conversation!</div>
                ) : (
                  messages.map((message) => (
                    <div key={message.id} className="flex items-start space-x-3">
                      <Avatar className="h-8 w-8">
                        <AvatarFallback className="bg-slate-600 text-white text-sm">
                          {message.author.charAt(0).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <div className="flex items-center space-x-2">
                          <span className="text-white font-medium text-sm">{message.author}</span>
                          <span className="text-slate-400 text-xs">{formatTime(message.timestamp)}</span>
                        </div>
                        <div className="text-slate-300 mt-1">{message.content}</div>
                      </div>
                    </div>
                  ))
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Message Input */}
              <div className="bg-slate-800 border-t border-slate-700 p-4">
                <form onSubmit={sendMessage} className="flex items-center space-x-2">
                  <Button type="button" variant="ghost" size="sm" className="text-slate-400 hover:text-white">
                    <ImageIcon className="h-4 w-4" />
                  </Button>
                  <Button type="button" variant="ghost" size="sm" className="text-slate-400 hover:text-white">
                    <Mic className="h-4 w-4" />
                  </Button>
                  <Input
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder="Type a message..."
                    className="flex-1 bg-slate-700 border-slate-600 text-white placeholder:text-slate-400"
                  />
                  <Button type="submit" size="sm" className="bg-blue-600 hover:bg-blue-700">
                    <Send className="h-4 w-4" />
                  </Button>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  )
}
