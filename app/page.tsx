"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/lib/auth"
import ProtectedRoute from "@/components/ProtectedRoute"
import { showToast } from "@/lib/utils"

interface MediaItem {
  id: string
  title: string
  description: string
  username: string
  fileUrl?: string
  fileType?: string
  likes: number
  createdAt: string
}

export default function HomePage() {
  const { user, logout } = useAuth()
  const router = useRouter()
  const [media, setMedia] = useState<MediaItem[]>([])
  const [loading, setLoading] = useState(true)
  const [uploadForm, setUploadForm] = useState({
    title: "",
    description: "",
  })

  useEffect(() => {
    fetchMedia()
  }, [])

  const fetchMedia = async () => {
    try {
      const response = await fetch("/api/media")
      const data = await response.json()
      setMedia(data)
    } catch (error) {
      console.error("Failed to fetch media:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!uploadForm.title.trim()) {
      showToast("Please enter a title", "error")
      return
    }

    try {
      const response = await fetch("/api/media", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: uploadForm.title,
          description: uploadForm.description,
          userId: user?.id,
          username: user?.displayName || user?.username,
          fileUrl: "/placeholder.svg?height=200&width=300",
          fileType: "image",
        }),
      })

      if (response.ok) {
        showToast("Media uploaded successfully!", "success")
        setUploadForm({ title: "", description: "" })
        fetchMedia()
      } else {
        showToast("Failed to upload media", "error")
      }
    } catch (error) {
      showToast("Failed to upload media", "error")
    }
  }

  const handleLogout = () => {
    logout()
    router.push("/auth")
  }

  return (
    <ProtectedRoute>
      <div className="min-h-screen" style={{ backgroundColor: "hsl(var(--background))" }}>
        {/* Header */}
        <header className="border-b" style={{ borderColor: "hsl(var(--border))" }}>
          <div className="max-w-4xl mx-auto px-4 py-4 flex justify-between items-center">
            <h1 className="text-2xl font-bold">Eneskench Summit</h1>
            <div className="flex items-center gap-4">
              <span>Welcome, {user?.displayName || user?.username}!</span>
              <button onClick={() => router.push("/settings")} className="button-outline">
                Settings
              </button>
              <button onClick={() => router.push("/chat")} className="button-outline">
                Chat
              </button>
              <button onClick={handleLogout} className="button">
                Logout
              </button>
            </div>
          </div>
        </header>

        <div className="max-w-4xl mx-auto px-4 py-8">
          {/* Upload Form */}
          <div className="card mb-8">
            <h2 className="text-xl font-bold mb-4">Share Something</h2>
            <form onSubmit={handleUpload}>
              <div className="form-group">
                <label className="label">Title</label>
                <input
                  className="input"
                  type="text"
                  value={uploadForm.title}
                  onChange={(e) => setUploadForm({ ...uploadForm, title: e.target.value })}
                  placeholder="What's this about?"
                  required
                />
              </div>
              <div className="form-group">
                <label className="label">Description</label>
                <textarea
                  className="input"
                  value={uploadForm.description}
                  onChange={(e) => setUploadForm({ ...uploadForm, description: e.target.value })}
                  placeholder="Tell us more..."
                  rows={3}
                  style={{ height: "auto", minHeight: "80px" }}
                />
              </div>
              <button type="submit" className="button">
                Share
              </button>
            </form>
          </div>

          {/* Media Feed */}
          <div>
            <h2 className="text-xl font-bold mb-4">Recent Posts</h2>
            {loading ? (
              <div className="text-center py-8">Loading...</div>
            ) : media.length === 0 ? (
              <div className="card text-center py-8">
                <p className="text-muted-foreground">No posts yet. Be the first to share something!</p>
              </div>
            ) : (
              <div className="space-y-6">
                {media.map((item) => (
                  <div key={item.id} className="card">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h3 className="font-bold text-lg">{item.title}</h3>
                        <p className="text-muted-foreground text-sm">
                          by {item.username} • {new Date(item.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="text-sm text-muted-foreground">❤️ {item.likes}</div>
                    </div>
                    {item.description && <p className="mb-4">{item.description}</p>}
                    {item.fileUrl && (
                      <img
                        src={item.fileUrl || "/placeholder.svg"}
                        alt={item.title}
                        className="w-full rounded"
                        style={{ maxHeight: "400px", objectFit: "cover" }}
                      />
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </ProtectedRoute>
  )
}
