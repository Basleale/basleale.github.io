"use client"

import type React from "react"
import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import { useAuth } from "@/lib/auth-context"
import { Send, Mic, Paperclip, MicOff, Users } from "lucide-react"
import { useRouter } from "next/navigation"
import { showToast } from "@/lib/utils"

interface Message {
  id: string
  content: string
  conversation_id: string
  type: "text" | "voice" | "file"
  file_url?: string
  file_name?: string
  user: {
    id: string
    username: string
    display_name: string
  }
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
  participants: string[]
  created_at: string
}

function ChatPage() {
  const { user, logout } = useAuth()
  const router = useRouter()
  const [messages, setMessages] = useState<Message[]>([])
  const [users, setUsers] = useState<User[]>([])
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [currentConversation, setCurrentConversation] = useState<string>("general")
  const [newMessage, setNewMessage] = useState("")
  const [loading, setLoading] = useState(true)
  const [isRecording, setIsRecording] = useState(false)
  const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    fetchUsers()
    fetchConversations()
    fetchMessages()

    // Auto-refresh messages every 3 seconds
    const interval = setInterval(fetchMessages, 3000)
    return () => clearInterval(interval)
  }, [currentConversation])

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  const fetchUsers = async () => {
    try {
      const response = await fetch("/api/chat/users")
      if (response.ok) {
        const data = await response.json()
        setUsers(data.users.filter((u: User) => u.id !== user?.id))
      }
    } catch (error) {
      console.error("Error fetching users:", error)
    }
  }

  const fetchConversations = async () => {
    try {
      const response = await fetch("/api/chat/conversations")
      if (response.ok) {
        const data = await response.json()
        setConversations(data.conversations)
      }
    } catch (error) {
      console.error("Error fetching conversations:", error)
    }
  }

  const fetchMessages = async () => {
    try {
      const url =
        currentConversation === "general"
          ? "/api/chat/messages"
          : `/api/chat/messages?conversationId=${currentConversation}`

      const response = await fetch(url)
      if (response.ok) {
        const data = await response.json()
        setMessages(data.messages)
      }
    } catch (error) {
      console.error("Error fetching messages:", error)
    } finally {
      setLoading(false)
    }
  }

  const sendMessage = async (content: string, type = "text", file_url?: string, file_name?: string) => {
    if (!content.trim() && !file_url) return

    try {
      const response = await fetch("/api/chat/messages", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          content,
          conversation_id: currentConversation,
          type,
          file_url,
          file_name,
        }),
      })

      if (response.ok) {
        setNewMessage("")
        fetchMessages()
        showToast("Message sent!", "success")
      }
    } catch (error) {
      console.error("Failed to send message:", error)
    }
  }

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault()
    sendMessage(newMessage)
  }

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      const recorder = new MediaRecorder(stream)
      const chunks: BlobPart[] = []

      recorder.ondataavailable = (e) => chunks.push(e.data)
      recorder.onstop = async () => {
        const blob = new Blob(chunks, { type: "audio/webm" })
        await uploadVoice(blob)
        stream.getTracks().forEach((track) => track.stop())
      }

      recorder.start()
      setMediaRecorder(recorder)
      setIsRecording(true)
    } catch (error) {
      console.error("Could not access microphone:", error)
    }
  }

  const stopRecording = () => {
    if (mediaRecorder) {
      mediaRecorder.stop()
      setIsRecording(false)
      setMediaRecorder(null)
    }
  }

  const uploadVoice = async (audioBlob: Blob) => {
    try {
      const formData = new FormData()
      formData.append("audio", audioBlob)

      const response = await fetch("/api/upload-voice", {
        method: "POST",
        body: formData,
      })

      if (response.ok) {
        const data = await response.json()
        sendMessage("Voice message", "voice", data.url, data.filename)
      }
    } catch (error) {
      console.error("Failed to upload voice message:", error)
    }
  }

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    try {
      const formData = new FormData()
      formData.append("file", file)

      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      })

      if (response.ok) {
        const data = await response.json()
        sendMessage(`Shared a file: ${data.filename}`, "file", data.url, data.filename)
      }
    } catch (error) {
      console.error("Failed to upload file:", error)
    }
  }

  const startPrivateChat = async (userId: string) => {
    try {
      const response = await fetch("/api/chat/conversations", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ participant_id: userId }),
      })

      if (response.ok) {
        const data = await response.json()
        setCurrentConversation(data.conversation.id)
        fetchConversations()
        fetchMessages()
      }
    } catch (error) {
      console.error("Failed to start private chat:", error)
    }
  }

  const getConversationName = (conversation: Conversation) => {
    const otherParticipant = conversation.participants.find((p) => p !== user?.id)
    const otherUser = users.find((u) => u.id === otherParticipant)
    return otherUser?.display_name || "Unknown User"
  }

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b" style={{ borderColor: "hsl(var(--border))" }}>
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <h1 className="text-2xl font-bold">Chat</h1>
          <div className="flex items-center gap-4">
            <button onClick={() => router.push("/")} className="button button-outline">
              Back to Home
            </button>
            <button
              onClick={() => {
                logout()
                router.push("/auth")
              }}
              className="button"
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Conversations
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button
                  variant={currentConversation === "general" ? "default" : "ghost"}
                  className="w-full justify-start"
                  onClick={() => setCurrentConversation("general")}
                >
                  General Chat
                </Button>

                {conversations.map((conversation) => (
                  <Button
                    key={conversation.id}
                    variant={currentConversation === conversation.id ? "default" : "ghost"}
                    className="w-full justify-start"
                    onClick={() => setCurrentConversation(conversation.id)}
                  >
                    {getConversationName(conversation)}
                  </Button>
                ))}

                <div className="pt-4 border-t">
                  <h4 className="text-sm font-medium mb-2">Start Private Chat</h4>
                  {users.map((chatUser) => (
                    <Button
                      key={chatUser.id}
                      variant="ghost"
                      size="sm"
                      className="w-full justify-start text-xs"
                      onClick={() => startPrivateChat(chatUser.id)}
                    >
                      {chatUser.display_name}
                    </Button>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Chat Area */}
          <div className="lg:col-span-3">
            <Card className="h-[600px] flex flex-col">
              <CardHeader>
                <CardTitle>
                  {currentConversation === "general"
                    ? "General Chat"
                    : `Chat with ${getConversationName(conversations.find((c) => c.id === currentConversation) || ({ participants: [] } as Conversation))}`}
                </CardTitle>
              </CardHeader>

              {/* Messages */}
              <CardContent className="flex-1 flex flex-col">
                <ScrollArea className="flex-1 pr-4">
                  {loading ? (
                    <div className="flex justify-center items-center h-32">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                    </div>
                  ) : messages.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      No messages yet. Start the conversation!
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {messages.map((message) => (
                        <div
                          key={message.id}
                          className={`flex ${message.user.id === user?.id ? "justify-end" : "justify-start"}`}
                        >
                          <div
                            className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                              message.user.id === user?.id ? "bg-primary text-primary-foreground" : "bg-muted"
                            }`}
                          >
                            <div className="text-xs opacity-70 mb-1">
                              {message.user.display_name} • {formatTime(message.created_at)}
                            </div>

                            {message.type === "voice" && message.file_url ? (
                              <audio controls className="w-full">
                                <source src={message.file_url} type="audio/webm" />
                                Your browser does not support audio playback.
                              </audio>
                            ) : message.type === "file" && message.file_url ? (
                              <div>
                                <p className="mb-2">{message.content}</p>
                                <a
                                  href={message.file_url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-blue-500 hover:underline text-sm"
                                >
                                  📎 {message.file_name}
                                </a>
                              </div>
                            ) : (
                              <p>{message.content}</p>
                            )}
                          </div>
                        </div>
                      ))}
                      <div ref={messagesEndRef} />
                    </div>
                  )}
                </ScrollArea>

                {/* Message Input */}
                <div className="border-t pt-4 mt-4">
                  <form onSubmit={handleSendMessage} className="flex gap-2">
                    <Input
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      placeholder="Type a message..."
                      className="flex-1"
                    />
                    <input type="file" ref={fileInputRef} onChange={handleFileUpload} className="hidden" />
                    <Button type="button" variant="outline" size="icon" onClick={() => fileInputRef.current?.click()}>
                      <Paperclip className="h-4 w-4" />
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      onClick={isRecording ? stopRecording : startRecording}
                      className={isRecording ? "bg-red-500 text-white" : ""}
                    >
                      {isRecording ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
                    </Button>
                    <Button type="submit" size="icon" disabled={loading}>
                      <Send className="h-4 w-4" />
                    </Button>
                  </form>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Chat Features */}
          <div className="lg:col-span-1">
            <div className="card mt-6">
              <h3 className="font-semibold mb-4">💡 Chat Features</h3>
              <div
                className="grid grid-cols-1 gap-4"
                style={{ gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))" }}
              >
                <div className="p-4" style={{ backgroundColor: "var(--muted)", borderRadius: "var(--radius)" }}>
                  <h4 className="font-semibold mb-2">🎤 Voice Messages</h4>
                  <p className="text-sm text-muted-foreground">Record and send voice messages</p>
                  <Button className="button button-outline mt-2 w-full">Coming Soon</Button>
                </div>
                <div className="p-4" style={{ backgroundColor: "var(--muted)", borderRadius: "var(--radius)" }}>
                  <h4 className="font-semibold mb-2">📎 File Sharing</h4>
                  <p className="text-sm text-muted-foreground">Share files with other users</p>
                  <Button className="button button-outline mt-2 w-full">Coming Soon</Button>
                </div>
                <div className="p-4" style={{ backgroundColor: "var(--muted)", borderRadius: "var(--radius)" }}>
                  <h4 className="font-semibold mb-2">👥 Private Chat</h4>
                  <p className="text-sm text-muted-foreground">One-on-one conversations</p>
                  <Button className="button button-outline mt-2 w-full">Coming Soon</Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ChatPage
