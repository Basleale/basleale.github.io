"use client"

import type React from "react"
import { useState, useEffect, useRef } from "react"
import { useAuth } from "@/lib/auth-context"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { ArrowLeft, Send, Paperclip, Users, MessageCircle, MicIcon, Square } from "lucide-react"
import ProtectedRoute from "@/components/protected-route"
import { toast } from "sonner"

interface Message {
  id: string
  conversation_id: string
  content: string
  author_id: string
  author_username: string
  type: "text" | "voice" | "file"
  file_url?: string
  file_name?: string
  timestamp: string
}

interface Conversation {
  id: string
  participants: any[]
  type: "private" | "general"
  created_at: string
  updated_at: string
  last_message?: {
    content: string
    author: string
    timestamp: string
  }
}

interface User {
  id: string
  username: string
  display_name: string
}

export default function ChatPage() {
  const { user, token } = useAuth()
  const router = useRouter()
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [activeConversation, setActiveConversation] = useState<string | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [newMessage, setNewMessage] = useState("")
  const [users, setUsers] = useState<User[]>([])
  const [isRecording, setIsRecording] = useState(false)
  const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // General chat conversation ID
  const GENERAL_CHAT_ID = "general"

  useEffect(() => {
    loadConversations()
    loadUsers()
    // Set general chat as default
    setActiveConversation(GENERAL_CHAT_ID)
  }, [])

  useEffect(() => {
    if (activeConversation) {
      loadMessages()
    }
  }, [activeConversation])

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  const loadConversations = async () => {
    try {
      const response = await fetch("/api/chat/conversations", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (response.ok) {
        const data = await response.json()

        // Add general chat if it doesn't exist
        const hasGeneral = data.conversations.some((conv: Conversation) => conv.id === GENERAL_CHAT_ID)
        if (!hasGeneral) {
          const generalChat: Conversation = {
            id: GENERAL_CHAT_ID,
            participants: [],
            type: "general",
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          }
          data.conversations.unshift(generalChat)
        }

        setConversations(data.conversations)
      }
    } catch (error) {
      console.error("Error loading conversations:", error)
    }
  }

  const loadUsers = async () => {
    try {
      const response = await fetch("/api/chat/users", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (response.ok) {
        const data = await response.json()
        setUsers(data.users)
      }
    } catch (error) {
      console.error("Error loading users:", error)
    }
  }

  const loadMessages = async () => {
    if (!activeConversation) return

    try {
      const response = await fetch(`/api/chat/messages?conversation_id=${activeConversation}`, {
        headers: {
          Authorization: `Bearer ${token}`,
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
    if (!newMessage.trim() || !activeConversation) return

    try {
      const response = await fetch("/api/chat/messages", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          conversation_id: activeConversation,
          content: newMessage,
          type: "text",
        }),
      })

      if (response.ok) {
        setNewMessage("")
        loadMessages()
      }
    } catch (error) {
      console.error("Error sending message:", error)
      toast.error("Failed to send message")
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
          participantId: userId,
          type: "private",
        }),
      })

      if (response.ok) {
        const data = await response.json()
        setActiveConversation(data.conversation.id)
        loadConversations()
      }
    } catch (error) {
      console.error("Error starting private chat:", error)
      toast.error("Failed to start private chat")
    }
  }

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      const recorder = new MediaRecorder(stream)
      const chunks: BlobPart[] = []

      recorder.ondataavailable = (e) => {
        chunks.push(e.data)
      }

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
    if (mediaRecorder && isRecording) {
      mediaRecorder.stop()
      setIsRecording(false)
      setMediaRecorder(null)
    }
  }

  const uploadVoiceMessage = async (audioBlob: Blob) => {
    try {
      const formData = new FormData()
      formData.append("audio", audioBlob)

      const uploadResponse = await fetch("/api/upload-voice", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      })

      if (uploadResponse.ok) {
        const { url, filename } = await uploadResponse.json()

        // Send voice message
        await fetch("/api/chat/messages", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            conversation_id: activeConversation,
            content: "Voice message",
            type: "voice",
            file_url: url,
            file_name: filename,
          }),
        })

        loadMessages()
        toast.success("Voice message sent!")
      }
    } catch (error) {
      console.error("Error uploading voice message:", error)
      toast.error("Failed to send voice message")
    }
  }

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file || !activeConversation) return

    try {
      const formData = new FormData()
      formData.append("file", file)

      const uploadResponse = await fetch("/api/upload", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      })

      if (uploadResponse.ok) {
        const { media } = await uploadResponse.json()

        // Send file message
        await fetch("/api/chat/messages", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            conversation_id: activeConversation,
            content: `Shared file: ${file.name}`,
            type: "file",
            file_url: media.url,
            file_name: file.name,
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

  const formatTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
  }

  const getConversationName = (conversation: Conversation) => {
    if (conversation.type === "general") {
      return "General Chat"
    }

    const otherParticipant = conversation.participants.find((p) => p.id !== user?.id)
    return otherParticipant ? otherParticipant.display_name : "Private Chat"
  }

  const activeConv = conversations.find((conv) => conv.id === activeConversation)

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
            {/* Conversations Sidebar */}
            <div className="lg:col-span-1">
              <Card className="bg-slate-800 border-slate-700 h-full">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-white flex items-center">
                      <MessageCircle className="w-5 h-5 mr-2" />
                      Chats
                    </CardTitle>
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button variant="ghost" size="icon" className="text-slate-300 hover:text-white">
                          <Users className="w-4 h-4" />
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="bg-slate-800 border-slate-700">
                        <DialogHeader>
                          <DialogTitle className="text-white">Start Private Chat</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-2">
                          {users.map((user) => (
                            <Button
                              key={user.id}
                              variant="ghost"
                              className="w-full justify-start text-slate-300 hover:text-white"
                              onClick={() => startPrivateChat(user.id)}
                            >
                              <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white text-sm font-medium mr-3">
                                {user.username.charAt(0).toUpperCase()}
                              </div>
                              {user.display_name}
                            </Button>
                          ))}
                        </div>
                      </DialogContent>
                    </Dialog>
                  </div>
                </CardHeader>
                <CardContent className="p-0">
                  <div className="space-y-1">
                    {conversations.map((conversation) => (
                      <button
                        key={conversation.id}
                        onClick={() => setActiveConversation(conversation.id)}
                        className={`w-full text-left p-3 rounded-lg transition-colors ${
                          activeConversation === conversation.id
                            ? "bg-blue-600 text-white"
                            : "text-slate-300 hover:bg-slate-700 hover:text-white"
                        }`}
                      >
                        <div className="flex items-center space-x-3">
                          <div className="w-8 h-8 bg-slate-600 rounded-full flex items-center justify-center">
                            {conversation.type === "general" ? (
                              <Users className="w-4 h-4" />
                            ) : (
                              <MessageCircle className="w-4 h-4" />
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="font-medium truncate">{getConversationName(conversation)}</div>
                            {conversation.last_message && (
                              <div className="text-sm opacity-75 truncate">{conversation.last_message.content}</div>
                            )}
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Chat Area */}
            <div className="lg:col-span-3">
              {activeConv ? (
                <Card className="bg-slate-800 border-slate-700 h-full flex flex-col">
                  <CardHeader className="border-b border-slate-700">
                    <CardTitle className="text-white">{getConversationName(activeConv)}</CardTitle>
                    {activeConv.type === "general" && (
                      <p className="text-slate-400 text-sm">Community-wide discussion</p>
                    )}
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
                                  {message.author_username.charAt(0).toUpperCase()}
                                </div>
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center space-x-2">
                                  <span className="text-white font-medium">{message.author_username}</span>
                                  <span className="text-slate-400 text-xs">{formatTime(message.timestamp)}</span>
                                </div>
                                {message.type === "voice" ? (
                                  <div className="mt-1">
                                    <audio controls className="max-w-xs">
                                      <source src={message.file_url} type="audio/webm" />
                                      Your browser does not support the audio element.
                                    </audio>
                                  </div>
                                ) : message.type === "file" ? (
                                  <div className="mt-1">
                                    <a
                                      href={message.file_url}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="text-blue-400 hover:text-blue-300 underline"
                                    >
                                      📎 {message.file_name}
                                    </a>
                                  </div>
                                ) : (
                                  <p className="text-slate-300 mt-1">{message.content}</p>
                                )}
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
                          placeholder={`Message ${getConversationName(activeConv)}`}
                          className="bg-slate-700 border-slate-600 text-white pr-24"
                        />
                        <div className="absolute right-2 top-1/2 transform -translate-y-1/2 flex space-x-1">
                          <input type="file" ref={fileInputRef} onChange={handleFileUpload} className="hidden" />
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => fileInputRef.current?.click()}
                          >
                            <Paperclip className="w-4 h-4 text-slate-400" />
                          </Button>
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className={`h-8 w-8 ${isRecording ? "text-red-400" : "text-slate-400"}`}
                            onClick={isRecording ? stopRecording : startRecording}
                          >
                            {isRecording ? <Square className="w-4 h-4" /> : <MicIcon className="w-4 h-4" />}
                          </Button>
                        </div>
                      </div>
                      <Button type="submit" className="bg-blue-600 hover:bg-blue-700">
                        <Send className="w-4 h-4" />
                      </Button>
                    </form>
                  </div>
                </Card>
              ) : (
                <Card className="bg-slate-800 border-slate-700 h-full flex items-center justify-center">
                  <div className="text-center text-slate-400">
                    <MessageCircle className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p>Select a conversation to start chatting</p>
                  </div>
                </Card>
              )}
            </div>
          </div>
        </main>
      </div>
    </ProtectedRoute>
  )
}
</merged_code>
