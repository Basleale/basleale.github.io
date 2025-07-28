"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { ArrowLeft, Send, Mic, ImageIcon } from "lucide-react"
import { useAuth } from "@/lib/auth-context"
import { useRouter } from "next/navigation"
import ProtectedRoute from "@/components/protected-route"

interface Message {
  id: string
  username: string
  content: string
  timestamp: string
  room: string
}

export default function ChatPage() {
  const [messages, setMessages] = useState<Message[]>([])
  const [newMessage, setNewMessage] = useState("")
  const [activeRoom, setActiveRoom] = useState("general")
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const { user } = useAuth()
  const router = useRouter()

  const rooms = [
    { id: "general", name: "General", description: "Main chat room" },
    { id: "media", name: "Media", description: "Discuss uploads" },
    { id: "random", name: "Random", description: "Off-topic chat" },
  ]

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault()
    if (!newMessage.trim() || !user) return

    const message: Message = {
      id: Date.now().toString(),
      username: user.username,
      content: newMessage.trim(),
      timestamp: new Date().toLocaleTimeString(),
      room: activeRoom,
    }

    setMessages((prev) => [...prev, message])
    setNewMessage("")
  }

  const filteredMessages = messages.filter((msg) => msg.room === activeRoom)

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-slate-900">
        {/* Header */}
        <header className="bg-slate-800 border-b border-slate-700 px-4 py-3">
          <div className="max-w-7xl mx-auto flex items-center space-x-4">
            <Button variant="ghost" size="sm" className="text-slate-300 hover:text-white" onClick={() => router.back()}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
            <h1 className="text-2xl font-bold text-white">Chat</h1>
          </div>
        </header>

        {/* Main Content */}
        <main className="max-w-6xl mx-auto px-4 py-8">
          <Card className="bg-slate-800 border-slate-700 h-[600px] flex flex-col">
            <CardHeader>
              <Tabs value={activeRoom} onValueChange={setActiveRoom}>
                <TabsList className="grid w-full grid-cols-3 bg-slate-700">
                  {rooms.map((room) => (
                    <TabsTrigger
                      key={room.id}
                      value={room.id}
                      className="text-slate-300 data-[state=active]:bg-slate-600 data-[state=active]:text-white"
                    >
                      {room.name}
                    </TabsTrigger>
                  ))}
                </TabsList>
              </Tabs>
            </CardHeader>

            <CardContent className="flex-1 flex flex-col">
              {/* Messages */}
              <div className="flex-1 overflow-y-auto space-y-4 mb-4">
                {filteredMessages.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-slate-400">No messages yet in this room</p>
                    <p className="text-slate-500 text-sm">Be the first to start the conversation!</p>
                  </div>
                ) : (
                  filteredMessages.map((message) => (
                    <div key={message.id} className="flex items-start space-x-3">
                      <Avatar className="h-8 w-8">
                        <AvatarFallback className="bg-slate-700 text-white text-sm">
                          {message.username.charAt(0).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <div className="flex items-center space-x-2">
                          <span className="text-white font-medium text-sm">{message.username}</span>
                          <span className="text-slate-400 text-xs">{message.timestamp}</span>
                        </div>
                        <p className="text-slate-300 text-sm mt-1">{message.content}</p>
                      </div>
                    </div>
                  ))
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Message Input */}
              <form onSubmit={handleSendMessage} className="flex items-center space-x-2">
                <Button type="button" variant="ghost" size="sm" className="text-slate-400 hover:text-white">
                  <ImageIcon className="h-4 w-4" />
                </Button>
                <Button type="button" variant="ghost" size="sm" className="text-slate-400 hover:text-white">
                  <Mic className="h-4 w-4" />
                </Button>
                <Input
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder={`Message #${rooms.find((r) => r.id === activeRoom)?.name.toLowerCase()}`}
                  className="flex-1 bg-slate-700 border-slate-600 text-white placeholder:text-slate-400"
                />
                <Button type="submit" size="sm" className="bg-blue-600 hover:bg-blue-700" disabled={!newMessage.trim()}>
                  <Send className="h-4 w-4" />
                </Button>
              </form>
            </CardContent>
          </Card>
        </main>
      </div>
    </ProtectedRoute>
  )
}
