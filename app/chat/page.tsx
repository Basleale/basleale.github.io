"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import { useAuth } from "@/lib/auth-context"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ArrowLeft, Send, Mic, ImageIcon, Users } from "lucide-react"
import { useRouter } from "next/navigation"
import ProtectedRoute from "@/components/protected-route"

interface Message {
  id: string
  content: string
  sender: string
  senderId: string
  timestamp: string
  type: "text" | "voice" | "image"
}

interface ChatUser {
  id: string
  username: string
  display_name: string
  online: boolean
}

export default function ChatPage() {
  const { user } = useAuth()
  const router = useRouter()
  const [activeTab, setActiveTab] = useState("site-wide")
  const [message, setMessage] = useState("")
  const [messages, setMessages] = useState<Message[]>([])
  const [users, setUsers] = useState<ChatUser[]>([])
  const [selectedUser, setSelectedUser] = useState<string | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  // Mock data for now
  useEffect(() => {
    const mockUsers: ChatUser[] = [
      { id: "1", username: "alice", display_name: "Alice", online: true },
      { id: "2", username: "bob", display_name: "Bob", online: false },
      { id: "3", username: "charlie", display_name: "Charlie", online: true },
    ]
    setUsers(mockUsers)

    const mockMessages: Message[] = [
      {
        id: "1",
        content: "Hey everyone! How's the project going?",
        sender: "Alice",
        senderId: "1",
        timestamp: new Date(Date.now() - 3600000).toISOString(),
        type: "text",
      },
      {
        id: "2",
        content: "Going great! Just uploaded some new designs.",
        sender: "Bob",
        senderId: "2",
        timestamp: new Date(Date.now() - 1800000).toISOString(),
        type: "text",
      },
    ]
    setMessages(mockMessages)
  }, [])

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!message.trim()) return

    const newMessage: Message = {
      id: Date.now().toString(),
      content: message,
      sender: user?.display_name || user?.username || "You",
      senderId: user?.id || "current",
      timestamp: new Date().toISOString(),
      type: "text",
    }

    setMessages((prev) => [...prev, newMessage])
    setMessage("")

    // TODO: Send to API
  }

  const handleVoiceMessage = () => {
    // TODO: Implement voice message recording
    console.log("Voice message recording...")
  }

  const handleImageUpload = () => {
    // TODO: Implement image upload
    console.log("Image upload...")
  }

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-slate-900 text-white">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center mb-6">
            <Button variant="ghost" onClick={() => router.back()} className="text-white hover:bg-slate-800">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
            <h1 className="text-2xl font-bold ml-4">Chat</h1>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 h-[calc(100vh-200px)]">
            {/* Chat Tabs */}
            <div className="lg:col-span-3">
              <Tabs value={activeTab} onValueChange={setActiveTab} className="h-full">
                <TabsList className="grid w-full grid-cols-2 bg-slate-800">
                  <TabsTrigger value="site-wide" className="text-white">
                    <Users className="h-4 w-4 mr-2" />
                    Site-wide Chat
                  </TabsTrigger>
                  <TabsTrigger value="private" className="text-white">
                    Private Chats
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="site-wide" className="h-full mt-4">
                  <Card className="bg-slate-800 border-slate-700 h-full flex flex-col">
                    <CardHeader>
                      <CardTitle className="text-white">Community Chat</CardTitle>
                    </CardHeader>
                    <CardContent className="flex-1 flex flex-col">
                      {/* Messages */}
                      <div className="flex-1 overflow-y-auto mb-4 space-y-4">
                        {messages.map((msg) => (
                          <div
                            key={msg.id}
                            className={`flex ${msg.senderId === user?.id ? "justify-end" : "justify-start"}`}
                          >
                            <div
                              className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                                msg.senderId === user?.id ? "bg-purple-600 text-white" : "bg-slate-700 text-white"
                              }`}
                            >
                              {msg.senderId !== user?.id && <p className="text-xs text-slate-300 mb-1">{msg.sender}</p>}
                              <p>{msg.content}</p>
                              <p className="text-xs text-slate-400 mt-1">
                                {new Date(msg.timestamp).toLocaleTimeString()}
                              </p>
                            </div>
                          </div>
                        ))}
                        <div ref={messagesEndRef} />
                      </div>

                      {/* Message Input */}
                      <form onSubmit={handleSendMessage} className="flex space-x-2">
                        <Input
                          value={message}
                          onChange={(e) => setMessage(e.target.value)}
                          placeholder="Type a message..."
                          className="flex-1 bg-slate-700 border-slate-600 text-white"
                        />
                        <Button
                          type="button"
                          variant="outline"
                          size="icon"
                          onClick={handleVoiceMessage}
                          className="border-slate-600 text-slate-300 hover:bg-slate-700 bg-transparent"
                        >
                          <Mic className="h-4 w-4" />
                        </Button>
                        <Button
                          type="button"
                          variant="outline"
                          size="icon"
                          onClick={handleImageUpload}
                          className="border-slate-600 text-slate-300 hover:bg-slate-700 bg-transparent"
                        >
                          <ImageIcon className="h-4 w-4" />
                        </Button>
                        <Button type="submit" className="bg-purple-600 hover:bg-purple-700">
                          <Send className="h-4 w-4" />
                        </Button>
                      </form>
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="private" className="h-full mt-4">
                  <Card className="bg-slate-800 border-slate-700 h-full">
                    <CardHeader>
                      <CardTitle className="text-white">Private Messages</CardTitle>
                    </CardHeader>
                    <CardContent>
                      {selectedUser ? (
                        <div className="text-center py-8">
                          <p className="text-slate-400">Private chat with selected user</p>
                          <p className="text-sm text-slate-500 mt-2">Feature coming soon!</p>
                        </div>
                      ) : (
                        <div className="text-center py-8">
                          <p className="text-slate-400">Select a user to start chatting</p>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
            </div>

            {/* Users List */}
            <div className="lg:col-span-1">
              <Card className="bg-slate-800 border-slate-700 h-full">
                <CardHeader>
                  <CardTitle className="text-white">Online Users</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {users.map((chatUser) => (
                      <div
                        key={chatUser.id}
                        className={`flex items-center space-x-3 p-2 rounded cursor-pointer hover:bg-slate-700 ${
                          selectedUser === chatUser.id ? "bg-slate-700" : ""
                        }`}
                        onClick={() => setSelectedUser(chatUser.id)}
                      >
                        <div className="relative">
                          <Avatar className="h-8 w-8">
                            <AvatarFallback className="bg-purple-600">
                              {chatUser.display_name.charAt(0).toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          {chatUser.online && (
                            <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-slate-800"></div>
                          )}
                        </div>
                        <div className="flex-1">
                          <p className="text-white text-sm font-medium">{chatUser.display_name}</p>
                          <p className="text-slate-400 text-xs">@{chatUser.username}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  )
}
