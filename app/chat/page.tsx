"use client"

import { useState, useEffect, useRef } from "react"
import { useAuth } from "@/lib/auth-context"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import { Send, Mic, Square, Paperclip, MessageCircle, ArrowLeft, Play, Pause } from "lucide-react"
import { toast } from "sonner"
import ProtectedRoute from "@/components/protected-route"

interface Message {
  id: string
  conversation_id: string
  user_id: string
  username: string
  display_name: string
  content: string
  type: "text" | "voice" | "file"
  file_url?: string
  voice_url?: string
  created_at: string
}

interface User {
  id: string
  username: string
  display_name: string
  avatar_url?: string
}

interface Conversation {
  id: string
  type: "private" | "general"
  participants: string[]
  other_user?: User
}

export default function ChatPage() {
  const { user, token } = useAuth()
  const [activeTab, setActiveTab] = useState("general")
  const [message, setMessage] = useState("")
  const [messages, setMessages] = useState<Message[]>([])
  const [users, setUsers] = useState<User[]>([])
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [selectedConversation, setSelectedConversation] = useState<string | null>(null)
  const [isRecording, setIsRecording] = useState(false)
  const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(null)
  const [playingAudio, setPlayingAudio] = useState<string | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    loadUsers()
    loadConversations()
    loadMessages()

    // Poll for new messages every 3 seconds
    const interval = setInterval(loadMessages, 3000)
    return () => clearInterval(interval)
  }, [activeTab, selectedConversation])

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  const loadUsers = async () => {
    try {
      const response = await fetch("/api/chat/users", {
        headers: { Authorization: `Bearer ${token}` },
      })
      if (response.ok) {
        const data = await response.json()
        setUsers(data.users || [])
      }
    } catch (error) {
      console.error("Error loading users:", error)
    }
  }

  const loadConversations = async () => {
    try {
      const response = await fetch("/api/chat/conversations", {
        headers: { Authorization: `Bearer ${token}` },
      })
      if (response.ok) {
        const data = await response.json()
        const conversationsWithUsers = data.conversations.map((conv: any) => {
          if (conv.type === "private") {
            const otherUserId = conv.participants.find((id: string) => id !== user?.id)
            const otherUser = users.find((u) => u.id === otherUserId)
            return { ...conv, other_user: otherUser }
          }
          return conv
        })
        setConversations(conversationsWithUsers)
      }
    } catch (error) {
      console.error("Error loading conversations:", error)
    }
  }

  const loadMessages = async () => {
    try {
      let url = "/api/chat/messages?"
      if (activeTab === "general") {
        url += "type=general"
      } else if (selectedConversation) {
        url += `conversation_id=${selectedConversation}`
      }

      const response = await fetch(url, {
        headers: { Authorization: `Bearer ${token}` },
      })
      if (response.ok) {
        const data = await response.json()
        setMessages(data.messages || [])
      }
    } catch (error) {
      console.error("Error loading messages:", error)
    }
  }

  const sendMessage = async () => {
    if (!message.trim()) return

    try {
      const response = await fetch("/api/chat/messages", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          content: message,
          conversation_id: activeTab === "general" ? "general" : selectedConversation,
          type: "text",
        }),
      })

      if (response.ok) {
        setMessage("")
        loadMessages()
      }
    } catch (error) {
      console.error("Error sending message:", error)
      toast.error("Failed to send message")
    }
  }

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      const recorder = new MediaRecorder(stream)
      const chunks: BlobPart[] = []

      recorder.ondataavailable = (e) => chunks.push(e.data)
      recorder.onstop = async () => {
        const blob = new Blob(chunks, { type: "audio/webm" })
        await uploadVoiceMessage(blob)
        stream.getTracks().forEach((track) => track.stop())
      }

      recorder.start()
      setMediaRecorder(recorder)
      setIsRecording(true)
    } catch (error) {
      console.error("Error starting recording:", error)
      toast.error("Failed to access microphone")
    }
  }

  const stopRecording = () => {
    if (mediaRecorder) {
      mediaRecorder.stop()
      setIsRecording(false)
      setMediaRecorder(null)
    }
  }

  const uploadVoiceMessage = async (blob: Blob) => {
    try {
      const formData = new FormData()
      formData.append("voice", blob)

      const uploadResponse = await fetch("/api/upload-voice", {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      })

      if (uploadResponse.ok) {
        const { url } = await uploadResponse.json()

        // Send voice message
        await fetch("/api/chat/messages", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            content: "Voice message",
            conversation_id: activeTab === "general" ? "general" : selectedConversation,
            type: "voice",
            voice_url: url,
          }),
        })

        loadMessages()
        toast.success("Voice message sent!")
      }
    } catch (error) {
      console.error("Error uploading voice:", error)
      toast.error("Failed to send voice message")
    }
  }

  const uploadFile = async (file: File) => {
    try {
      const formData = new FormData()
      formData.append("file", file)

      const uploadResponse = await fetch("/api/upload", {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      })

      if (uploadResponse.ok) {
        const { url, filename } = await uploadResponse.json()

        // Send file message
        await fetch("/api/chat/messages", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            content: `Shared file: ${filename}`,
            conversation_id: activeTab === "general" ? "general" : selectedConversation,
            type: "file",
            file_url: url,
          }),
        })

        loadMessages()
        toast.success("File shared!")
      }
    } catch (error) {
      console.error("Error uploading file:", error)
      toast.error("Failed to share file")
    }
  }

  const startPrivateChat = async (userId: string) => {
    try {
      const response = await fetch("/api/chat/conversations", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          participant_id: userId,
          type: "private",
        }),
      })

      if (response.ok) {
        const { conversation } = await response.json()
        setSelectedConversation(conversation.id)
        setActiveTab("private")
        loadConversations()
      }
    } catch (error) {
      console.error("Error starting private chat:", error)
      toast.error("Failed to start private chat")
    }
  }

  const playAudio = (url: string) => {
    if (playingAudio === url) {
      setPlayingAudio(null)
      return
    }

    const audio = new Audio(url)
    audio.play()
    setPlayingAudio(url)

    audio.onended = () => setPlayingAudio(null)
    audio.onerror = () => {
      setPlayingAudio(null)
      toast.error("Failed to play audio")
    }
  }

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-slate-900">
        <div className="max-w-7xl mx-auto p-4">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 h-[calc(100vh-2rem)]">
            {/* Sidebar */}
            <div className="lg:col-span-1">
              <Card className="bg-slate-800 border-slate-700 h-full">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <MessageCircle className="w-5 h-5" />
                    Chat
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                    <TabsList className="grid w-full grid-cols-2 bg-slate-700">
                      <TabsTrigger value="general" className="text-slate-300 data-[state=active]:text-white">
                        General
                      </TabsTrigger>
                      <TabsTrigger value="private" className="text-slate-300 data-[state=active]:text-white">
                        Private
                      </TabsTrigger>
                    </TabsList>

                    <TabsContent value="general" className="mt-4">
                      <div className="text-slate-300 text-sm">Community chat - everyone can see messages here</div>
                    </TabsContent>

                    <TabsContent value="private" className="mt-4 space-y-4">
                      <div className="space-y-2">
                        <h3 className="text-white font-medium">Active Chats</h3>
                        {conversations
                          .filter((c) => c.type === "private")
                          .map((conv) => (
                            <Button
                              key={conv.id}
                              variant={selectedConversation === conv.id ? "secondary" : "ghost"}
                              className="w-full justify-start text-slate-300 hover:text-white"
                              onClick={() => setSelectedConversation(conv.id)}
                            >
                              <Avatar className="w-6 h-6 mr-2">
                                <AvatarFallback className="bg-blue-600 text-white text-xs">
                                  {conv.other_user?.display_name?.charAt(0).toUpperCase()}
                                </AvatarFallback>
                              </Avatar>
                              {conv.other_user?.display_name}
                            </Button>
                          ))}
                      </div>

                      <Separator className="bg-slate-600" />

                      <div className="space-y-2">
                        <h3 className="text-white font-medium">Start New Chat</h3>
                        <ScrollArea className="h-48">
                          {users.map((chatUser) => (
                            <Button
                              key={chatUser.id}
                              variant="ghost"
                              className="w-full justify-start text-slate-300 hover:text-white mb-1"
                              onClick={() => startPrivateChat(chatUser.id)}
                            >
                              <Avatar className="w-6 h-6 mr-2">
                                <AvatarFallback className="bg-green-600 text-white text-xs">
                                  {chatUser.display_name.charAt(0).toUpperCase()}
                                </AvatarFallback>
                              </Avatar>
                              {chatUser.display_name}
                            </Button>
                          ))}
                        </ScrollArea>
                      </div>
                    </TabsContent>
                  </Tabs>
                </CardContent>
              </Card>
            </div>

            {/* Chat Area */}
            <div className="lg:col-span-3">
              <Card className="bg-slate-800 border-slate-700 h-full flex flex-col">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-white">
                      {activeTab === "general" ? (
                        "General Chat"
                      ) : selectedConversation ? (
                        <div className="flex items-center gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setSelectedConversation(null)}
                            className="text-slate-400 hover:text-white p-1"
                          >
                            <ArrowLeft className="w-4 h-4" />
                          </Button>
                          Private Chat
                        </div>
                      ) : (
                        "Select a conversation"
                      )}
                    </CardTitle>
                    <Badge variant="secondary" className="bg-slate-700 text-slate-300">
                      {messages.length} messages
                    </Badge>
                  </div>
                </CardHeader>

                <CardContent className="flex-1 flex flex-col p-0">
                  {/* Messages */}
                  <ScrollArea className="flex-1 px-4">
                    <div className="space-y-4 py-4">
                      {messages.map((msg) => (
                        <div
                          key={msg.id}
                          className={`flex gap-3 ${msg.user_id === user?.id ? "justify-end" : "justify-start"}`}
                        >
                          {msg.user_id !== user?.id && (
                            <Avatar className="w-8 h-8">
                              <AvatarFallback className="bg-blue-600 text-white text-sm">
                                {msg.display_name.charAt(0).toUpperCase()}
                              </AvatarFallback>
                            </Avatar>
                          )}

                          <div className={`max-w-xs lg:max-w-md ${msg.user_id === user?.id ? "order-first" : ""}`}>
                            {msg.user_id !== user?.id && (
                              <div className="text-slate-400 text-xs mb-1">{msg.display_name}</div>
                            )}

                            <div
                              className={`rounded-lg p-3 ${
                                msg.user_id === user?.id ? "bg-blue-600 text-white" : "bg-slate-700 text-slate-100"
                              }`}
                            >
                              {msg.type === "text" && <p className="text-sm">{msg.content}</p>}

                              {msg.type === "voice" && msg.voice_url && (
                                <div className="flex items-center gap-2">
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    onClick={() => playAudio(msg.voice_url!)}
                                    className="p-1 h-8 w-8"
                                  >
                                    {playingAudio === msg.voice_url ? (
                                      <Pause className="w-4 h-4" />
                                    ) : (
                                      <Play className="w-4 h-4" />
                                    )}
                                  </Button>
                                  <span className="text-xs">Voice message</span>
                                </div>
                              )}

                              {msg.type === "file" && msg.file_url && (
                                <div className="space-y-2">
                                  <p className="text-sm">{msg.content}</p>
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => window.open(msg.file_url, "_blank")}
                                    className="text-xs"
                                  >
                                    Download File
                                  </Button>
                                </div>
                              )}
                            </div>

                            <div className="text-slate-500 text-xs mt-1">
                              {new Date(msg.created_at).toLocaleTimeString()}
                            </div>
                          </div>

                          {msg.user_id === user?.id && (
                            <Avatar className="w-8 h-8">
                              <AvatarFallback className="bg-green-600 text-white text-sm">
                                {user.display_name?.charAt(0).toUpperCase()}
                              </AvatarFallback>
                            </Avatar>
                          )}
                        </div>
                      ))}
                      <div ref={messagesEndRef} />
                    </div>
                  </ScrollArea>

                  {/* Message Input */}
                  {(activeTab === "general" || selectedConversation) && (
                    <div className="border-t border-slate-700 p-4">
                      <div className="flex gap-2">
                        <Input
                          value={message}
                          onChange={(e) => setMessage(e.target.value)}
                          placeholder="Type a message..."
                          className="flex-1 bg-slate-700 border-slate-600 text-white"
                          onKeyPress={(e) => e.key === "Enter" && sendMessage()}
                        />

                        <input
                          type="file"
                          ref={fileInputRef}
                          onChange={(e) => e.target.files?.[0] && uploadFile(e.target.files[0])}
                          className="hidden"
                        />

                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => fileInputRef.current?.click()}
                          className="border-slate-600 text-slate-300 hover:text-white"
                        >
                          <Paperclip className="w-4 h-4" />
                        </Button>

                        <Button
                          variant="outline"
                          size="icon"
                          onClick={isRecording ? stopRecording : startRecording}
                          className={`border-slate-600 ${
                            isRecording ? "text-red-400 hover:text-red-300" : "text-slate-300 hover:text-white"
                          }`}
                        >
                          {isRecording ? <Square className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
                        </Button>

                        <Button onClick={sendMessage} className="bg-blue-600 hover:bg-blue-700">
                          <Send className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  )
}
