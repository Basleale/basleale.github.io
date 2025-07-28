"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, Send, Mic, ImageIcon, Users, MessageCircle } from "lucide-react"
import { useAuth } from "@/lib/auth-context"
import { ProtectedRoute } from "@/components/protected-route"
import { useRouter } from "next/navigation"
import { useToast } from "@/hooks/use-toast"

interface Message {
  id: string
  content: string
  sender_id: string
  sender_username: string
  created_at: string
  type: "text" | "image" | "voice"
  media_url?: string
}

interface ChatRoom {
  id: string
  name: string
  type: "public" | "private"
  participants: string[]
  last_message?: Message
}

export default function ChatPage() {
  const { user } = useAuth()
  const router = useRouter()
  const { toast } = useToast()
  const [messages, setMessages] = useState<Message[]>([])
  const [newMessage, setNewMessage] = useState("")
  const [chatRooms, setChatRooms] = useState<ChatRoom[]>([])
  const [activeRoom, setActiveRoom] = useState<string>("general")
  const [isLoading, setIsLoading] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    fetchChatRooms()
    fetchMessages(activeRoom)
  }, [activeRoom])

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  const fetchChatRooms = async () => {
    try {
      const response = await fetch("/api/chat/rooms", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("auth_token")}`,
        },
      })
      if (response.ok) {
        const data = await response.json()
        setChatRooms(data.rooms || [])
      }
    } catch (error) {
      console.error("Error fetching chat rooms:", error)
    }
  }

  const fetchMessages = async (roomId: string) => {
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
      console.error("Error fetching messages:", error)
    }
  }

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newMessage.trim()) return

    setIsLoading(true)
    try {
      const response = await fetch("/api/chat/messages", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("auth_token")}`,
        },
        body: JSON.stringify({
          content: newMessage,
          room_id: activeRoom,
          type: "text",
        }),
      })

      if (response.ok) {
        setNewMessage("")
        fetchMessages(activeRoom) // Refresh messages
      } else {
        toast({
          title: "Error",
          description: "Failed to send message",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error sending message:", error)
      toast({
        title: "Error",
        description: "Failed to send message",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const formatTime = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
  }

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50">
        <div className="max-w-6xl mx-auto px-4 py-8">
          <div className="mb-6">
            <Button variant="ghost" onClick={() => router.back()} className="mb-4 flex items-center space-x-2">
              <ArrowLeft className="h-4 w-4" />
              <span>Back</span>
            </Button>
            <h1 className="text-3xl font-bold text-gray-900">Chat</h1>
            <p className="text-gray-600">Connect with the community</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 h-[600px]">
            {/* Chat Rooms Sidebar */}
            <Card className="lg:col-span-1">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Users className="h-5 w-5" />
                  <span>Rooms</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button
                  variant={activeRoom === "general" ? "default" : "ghost"}
                  className="w-full justify-start"
                  onClick={() => setActiveRoom("general")}
                >
                  <MessageCircle className="mr-2 h-4 w-4" />
                  General Chat
                  <Badge variant="secondary" className="ml-auto">
                    Public
                  </Badge>
                </Button>
                <Button
                  variant={activeRoom === "creative" ? "default" : "ghost"}
                  className="w-full justify-start"
                  onClick={() => setActiveRoom("creative")}
                >
                  <MessageCircle className="mr-2 h-4 w-4" />
                  Creative Corner
                  <Badge variant="secondary" className="ml-auto">
                    Public
                  </Badge>
                </Button>
                <Button
                  variant={activeRoom === "tech" ? "default" : "ghost"}
                  className="w-full justify-start"
                  onClick={() => setActiveRoom("tech")}
                >
                  <MessageCircle className="mr-2 h-4 w-4" />
                  Tech Talk
                  <Badge variant="secondary" className="ml-auto">
                    Public
                  </Badge>
                </Button>
              </CardContent>
            </Card>

            {/* Chat Area */}
            <Card className="lg:col-span-3 flex flex-col">
              <CardHeader>
                <CardTitle className="capitalize">
                  {activeRoom === "general" && "General Chat"}
                  {activeRoom === "creative" && "Creative Corner"}
                  {activeRoom === "tech" && "Tech Talk"}
                </CardTitle>
              </CardHeader>
              <CardContent className="flex-1 flex flex-col">
                {/* Messages */}
                <div className="flex-1 overflow-y-auto space-y-4 mb-4 max-h-96">
                  {messages.length === 0 ? (
                    <div className="text-center text-gray-500 py-8">
                      <MessageCircle className="mx-auto h-12 w-12 text-gray-300 mb-4" />
                      <p>No messages yet. Start the conversation!</p>
                    </div>
                  ) : (
                    messages.map((message) => (
                      <div
                        key={message.id}
                        className={`flex items-start space-x-3 ${
                          message.sender_id === user?.id ? "flex-row-reverse space-x-reverse" : ""
                        }`}
                      >
                        <Avatar className="h-8 w-8">
                          <AvatarFallback>{message.sender_username.charAt(0).toUpperCase()}</AvatarFallback>
                        </Avatar>
                        <div
                          className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                            message.sender_id === user?.id ? "bg-purple-600 text-white" : "bg-gray-100 text-gray-900"
                          }`}
                        >
                          <div className="flex items-center space-x-2 mb-1">
                            <span className="text-xs font-medium">
                              {message.sender_id === user?.id ? "You" : message.sender_username}
                            </span>
                            <span className="text-xs opacity-70">{formatTime(message.created_at)}</span>
                          </div>
                          <p className="text-sm">{message.content}</p>
                        </div>
                      </div>
                    ))
                  )}
                  <div ref={messagesEndRef} />
                </div>

                {/* Message Input */}
                <form onSubmit={sendMessage} className="flex items-center space-x-2">
                  <Input
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder="Type your message..."
                    className="flex-1"
                    disabled={isLoading}
                  />
                  <Button type="button" variant="ghost" size="sm">
                    <ImageIcon className="h-4 w-4" />
                  </Button>
                  <Button type="button" variant="ghost" size="sm">
                    <Mic className="h-4 w-4" />
                  </Button>
                  <Button type="submit" disabled={isLoading || !newMessage.trim()}>
                    <Send className="h-4 w-4" />
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  )
}
