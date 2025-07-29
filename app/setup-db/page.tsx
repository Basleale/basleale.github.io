"use client"

import { useState } from "react"
import { showToast } from "@/lib/utils"

export default function SetupDbPage() {
  const [loading, setLoading] = useState(false)

  const initializeDatabase = async () => {
    setLoading(true)
    try {
      const response = await fetch("/api/setup-db", {
        method: "POST",
      })

      if (response.ok) {
        showToast("Database initialized successfully!", "success")
      } else {
        showToast("Failed to initialize database", "error")
      }
    } catch (error) {
      showToast("Failed to initialize database", "error")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="card max-w-md w-full text-center">
        <h1 className="text-2xl font-bold mb-6">Setup Database</h1>
        <p className="text-muted-foreground mb-6">Initialize the text file database for Eneskench Summit</p>
        <button onClick={initializeDatabase} disabled={loading} className="button w-full">
          {loading ? "Initializing..." : "Initialize Database"}
        </button>
      </div>
    </div>
  )
}
