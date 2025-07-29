"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useToast } from "@/hooks/use-toast"

export default function SetupDatabase() {
  const [loading, setLoading] = useState(false)
  const { toast } = useToast()

  const setupDatabase = async () => {
    setLoading(true)
    try {
      const response = await fetch("/api/setup-db", {
        method: "POST",
      })

      if (response.ok) {
        toast({
          title: "Success",
          description: "Database initialized successfully!",
        })
      } else {
        throw new Error("Failed to setup database")
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to initialize database",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Database Setup</CardTitle>
          <CardDescription>Initialize the database for Eneskench Summit</CardDescription>
        </CardHeader>
        <CardContent>
          <Button onClick={setupDatabase} disabled={loading} className="w-full">
            {loading ? "Setting up..." : "Initialize Database"}
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
