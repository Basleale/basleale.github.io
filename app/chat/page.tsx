"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import { useAuth } from "@/lib/auth-context"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, Send, Mic, ImageIcon, Users } from "lucide-react"
import { useRouter } from "next/navigation"
import ProtectedRoute from "@/components/protected-route"

interface Message {
  id: string
  username: string
  display_name: string
  message: string
  timestamp: string
  room: string
}

export default function ChatPage() {
  const { user } = useAuth()
  const router = useRouter()
  const [messages, setMessages] = useState<Message[]>([])
  const [newMessage, setNewMessage] = useState("")
  const [activeRoom, setActiveRoom] = useState("general")
  const [onlineUsers, setOnlineUsers] = useState<string[]>([])
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const rooms = [
    { id: "general", name: "General", description: "Main chat room" },
    { id: "media", name: "Media", description: "Discuss shared content" },
    { id: "random", name: "Random", description: "Off-topic discussions" },
  ]

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newMessage.trim() || !user) return

    const message: Message = {
      id: Date.now().toString(),
      username: user.username,
      display_name: user.display_name,
      message: newMessage.trim(),
      timestamp: new Date().toISOString(),
      room: activeRoom,
    }

    setMessages((prev) => [...prev, message])
    setNewMessage("")

    // Here you would typically send to your backend
    try {
      await fetch("/api/chat/messages", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("auth_token")}`,
        },
        body: JSON.stringify(message),
      })
    } catch (error) {
      console.error("Failed to send message:", error)
    }
  }

  const filteredMessages = messages.filter((msg) => msg.room === activeRoom)

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-slate-900">
        {/* Header */}
        <header className="bg-slate-800 border-b border-slate-700 px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button variant="ghost" size="sm" onClick={() => router.back()} className="text-white hover:bg-slate-700">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back
              </Button>
              <h1 className="text-xl font-bold text-white">Chat</h1>
            </div>
            <div className="flex items-center space-x-2">
              <Users className="h-4 w-4 text-slate-400" />
              <span className="text-slate-400 text-sm">{onlineUsers.length} online</span>
            </div>
          </div>
        </header>

        <div className="flex h-[calc(100vh-73px)]">
          {/* Sidebar - Room List */}
          <aside className="w-64 bg-slate-800 border-r border-slate-700 p-4">
            <h2 className="text-white font-semibold mb-4">Rooms</h2>
            <div className="space-y-2">
              {rooms.map((room) => (
                <Button
                  key={room.id}
                  variant={activeRoom === room.id ? "default" : "ghost"}
                  className={`w-full justify-start ${
                    activeRoom === room.id ? "bg-purple-600 hover:bg-purple-700" : "text-white hover:bg-slate-700"
                  }`}
                  onClick={() => setActiveRoom(room.id)}
                >
                  <div className="text-left">
                    <div className="font-medium">{room.name}</div>
                    <div className="text-xs opacity-70">{room.description}</div>
                  </div>
                </Button>
              ))}
            </div>

            <div className="mt-8">
              <h3 className="text-white font-semibold mb-4">Online Users</h3>
              <div className="space-y-2">
                {onlineUsers.length === 0 ? (
                  <p className="text-slate-400 text-sm">No users online</p>
                ) : (
                  onlineUsers.map((username, index) => (
                    <div key={index} className="flex items-center space-x-2">
                      <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                      <span className="text-white text-sm">{username}</span>
                    </div>
                  ))
                )}
              </div>
            </div>
          </aside>

          {/* Main Chat Area */}
          <main className="flex-1 flex flex-col">
            {/* Room Header */}
            <div className="bg-slate-800 border-b border-slate-700 px-6 py-4">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-white font-semibold">#{rooms.find((r) => r.id === activeRoom)?.name}</h2>
                  <p className="text-slate-400 text-sm">{rooms.find((r) => r.id === activeRoom)?.description}</p>
                </div>
                <Badge variant="secondary" className="bg-slate-700 text-white">
                  {filteredMessages.length} messages
                </Badge>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              {filteredMessages.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-slate-400">No messages yet in this room</p>
                  <p className="text-slate-500 text-sm mt-2">Be the first to start the conversation!</p>
                </div>
              ) : (
                filteredMessages.map((message) => (
                  <div key={message.id} className="flex items-start space-x-3">
                    <Avatar className="w-8 h-8">
                      <AvatarFallback className="bg-purple-600 text-white text-sm">
                        {message.display_name.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-1">
                        <span className="text-white font-medium text-sm">{message.display_name}</span>
                        <span className="text-slate-400 text-xs">
                          {new Date(message.timestamp).toLocaleTimeString()}
                        </span>
                      </div>
                      <p className="text-slate-300 text-sm">{message.message}</p>
                    </div>
                  </div>
                ))
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Message Input */}
            <div className="bg-slate-800 border-t border-slate-700 p-4">
              <form onSubmit={handleSendMessage} className="flex items-center space-x-2">
                <div className="flex space-x-2">
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="text-slate-400 hover:text-white hover:bg-slate-700"
                  >
                    <ImageIcon className="h-4 w-4" />
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="text-slate-400 hover:text-white hover:bg-slate-700"
                  >
                    <Mic className="h-4 w-4" />
                  </Button>
                </div>
                <Input
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder={`Message #${rooms.find((r) => r.id === activeRoom)?.name}`}
                  className="flex-1 bg-slate-700 border-slate-600 text-white placeholder:text-slate-400"
                />
                <Button type="submit" disabled={!newMessage.trim()} className="bg-purple-600 hover:bg-purple-700">
                  <Send className="h-4 w-4" />
                </Button>
              </form>
            </div>
          </main>
        </div>
      </div>
    </ProtectedRoute>
  )
}
