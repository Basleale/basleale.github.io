"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { ArrowLeft, Send, Mic, ImageIcon, Users } from "lucide-react"
import { useAuth } from "@/lib/auth-context"
import { useRouter } from "next/navigation"
import ProtectedRoute from "@/components/protected-route"
import { toast } from "@/hooks/use-toast"

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
  isPrivate: boolean
}

export default function ChatPage() {
  const { user } = useAuth()
  const router = useRouter()
  const [messages, setMessages] = useState<Message[]>([])
  const [newMessage, setNewMessage] = useState("")
  const [chatRooms, setChatRooms] = useState<ChatRoom[]>([])
  const [activeRoom, setActiveRoom] = useState<string>("general")
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    // Load chat rooms
    fetchChatRooms()
    // Load messages for active room
    fetchMessages(activeRoom)
  }, [activeRoom])

  useEffect(() => {
    // Scroll to bottom when new messages arrive
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  const fetchChatRooms = async () => {
    try {
      const token = localStorage.getItem("auth_token")
      const response = await fetch("/api/chat/rooms", {
        headers: {
          Authorization: `Bearer ${token}`,
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
      const token = localStorage.getItem("auth_token")
      const response = await fetch(`/api/chat/messages?room=${roomId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
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

  const sendMessage = async () => {
    if (!newMessage.trim()) return

    try {
      const token = localStorage.getItem("auth_token")
      const response = await fetch("/api/chat/messages", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          content: newMessage,
          roomId: activeRoom,
          type: "text",
        }),
      })

      if (response.ok) {
        setNewMessage("")
        fetchMessages(activeRoom) // Refresh messages
      } else {
        toast({
          title: "Failed to send message",
          description: "Please try again.",
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to send message.",
        variant: "destructive",
      })
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  const defaultRooms: ChatRoom[] = [
    { id: "general", name: "General", description: "General discussion", memberCount: 42, isPrivate: false },
    { id: "creative", name: "Creative", description: "Share your creative work", memberCount: 28, isPrivate: false },
    { id: "tech", name: "Tech Talk", description: "Technology discussions", memberCount: 35, isPrivate: false },
    { id: "random", name: "Random", description: "Random conversations", memberCount: 19, isPrivate: false },
  ]

  const allRooms = chatRooms.length > 0 ? chatRooms : defaultRooms

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-slate-900">
        {/* Header */}
        <header className="bg-slate-800 border-b border-slate-700 px-4 py-3">
          <div className="max-w-7xl mx-auto flex items-center">
            <Button variant="ghost" onClick={() => router.back()} className="mr-4 text-slate-300 hover:text-white">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
            <h1 className="text-xl font-bold text-white">Chat</h1>
          </div>
        </header>

        <div className="max-w-7xl mx-auto flex h-[calc(100vh-73px)]">
          {/* Sidebar - Chat Rooms */}
          <aside className="w-80 bg-slate-800 border-r border-slate-700 p-4">
            <h2 className="text-lg font-semibold text-white mb-4">Chat Rooms</h2>
            <div className="space-y-2">
              {allRooms.map((room) => (
                <Button
                  key={room.id}
                  variant={activeRoom === room.id ? "secondary" : "ghost"}
                  className={`w-full justify-start text-left p-3 h-auto ${
                    activeRoom === room.id
                      ? "bg-slate-700 text-white"
                      : "text-slate-300 hover:text-white hover:bg-slate-700"
                  }`}
                  onClick={() => setActiveRoom(room.id)}
                >
                  <div className="flex items-center justify-between w-full">
                    <div>
                      <div className="flex items-center">
                        <span className="font-medium">{room.name}</span>
                        {room.isPrivate && (
                          <Badge variant="outline" className="ml-2 text-xs">
                            Private
                          </Badge>
                        )}
                      </div>
                      <p className="text-xs text-slate-400 mt-1">{room.description}</p>
                    </div>
                    <div className="flex items-center text-xs text-slate-400">
                      <Users className="h-3 w-3 mr-1" />
                      {room.memberCount}
                    </div>
                  </div>
                </Button>
              ))}
            </div>
          </aside>

          {/* Main Chat Area */}
          <main className="flex-1 flex flex-col">
            {/* Chat Header */}
            <div className="bg-slate-800 border-b border-slate-700 p-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-white">
                    {allRooms.find((room) => room.id === activeRoom)?.name || "General"}
                  </h3>
                  <p className="text-sm text-slate-400">
                    {allRooms.find((room) => room.id === activeRoom)?.description || "General discussion"}
                  </p>
                </div>
                <Badge variant="outline" className="text-slate-300">
                  <Users className="h-3 w-3 mr-1" />
                  {allRooms.find((room) => room.id === activeRoom)?.memberCount || 0} members
                </Badge>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-slate-400">No messages yet</p>
                  <p className="text-slate-500 text-sm mt-1">Be the first to start the conversation!</p>
                </div>
              ) : (
                messages.map((message) => (
                  <div key={message.id} className="flex items-start space-x-3">
                    <Avatar className="h-8 w-8">
                      <AvatarFallback className="bg-slate-700 text-slate-300">
                        {message.author.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-1">
                        <span className="font-medium text-white">{message.author}</span>
                        <span className="text-xs text-slate-400">
                          {new Date(message.timestamp).toLocaleTimeString()}
                        </span>
                      </div>
                      <div className="bg-slate-700 rounded-lg p-3 text-slate-200">{message.content}</div>
                    </div>
                  </div>
                ))
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Message Input */}
            <div className="bg-slate-800 border-t border-slate-700 p-4">
              <div className="flex items-center space-x-2">
                <div className="flex-1 relative">
                  <Input
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder={`Message #${allRooms.find((room) => room.id === activeRoom)?.name || "general"}`}
                    className="bg-slate-700 border-slate-600 text-white placeholder:text-slate-400 pr-20"
                  />
                  <div className="absolute right-2 top-1/2 transform -translate-y-1/2 flex space-x-1">
                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-slate-400 hover:text-slate-300">
                      <ImageIcon className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-slate-400 hover:text-slate-300">
                      <Mic className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                <Button
                  onClick={sendMessage}
                  disabled={!newMessage.trim()}
                  className="bg-blue-600 hover:bg-blue-700 text-white"
                >
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </main>
        </div>
      </div>
    </ProtectedRoute>
  )
}
