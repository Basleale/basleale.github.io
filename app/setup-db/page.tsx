"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { CheckCircle, Database, Loader2 } from "lucide-react"

export default function SetupDbPage() {
  const [isInitializing, setIsInitializing] = useState(false)
  const [isInitialized, setIsInitialized] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const initializeDatabase = async () => {
    setIsInitializing(true)
    setError(null)

    try {
      const response = await fetch("/api/setup-db", {
        method: "POST",
      })

      if (response.ok) {
        setIsInitialized(true)
      } else {
        const errorData = await response.json()
        setError(errorData.error || "Failed to initialize database")
      }
    } catch (err) {
      setError("Network error occurred")
    } finally {
      setIsInitializing(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
            <Database className="h-6 w-6 text-primary" />
          </div>
          <CardTitle>Database Setup</CardTitle>
          <CardDescription>Initialize the Eneskench Summit database</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {!isInitialized && !error && (
            <Button onClick={initializeDatabase} disabled={isInitializing} className="w-full">
              {isInitializing ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Initializing...
                </>
              ) : (
                "Initialize Database"
              )}
            </Button>
          )}

          {isInitialized && (
            <div className="text-center space-y-4">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-green-100 dark:bg-green-900">
                <CheckCircle className="h-6 w-6 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <h3 className="font-semibold text-green-600 dark:text-green-400">Database Initialized!</h3>
                <p className="text-sm text-muted-foreground mt-1">
                  Your database has been set up successfully. You can now register and start using the platform.
                </p>
              </div>
              <Button asChild className="w-full">
                <a href="/auth">Go to Login</a>
              </Button>
            </div>
          )}

          {error && (
            <div className="text-center space-y-4">
              <div className="p-4 bg-destructive/10 border border-destructive/20 rounded-lg">
                <p className="text-sm text-destructive">{error}</p>
              </div>
              <Button onClick={initializeDatabase} variant="outline" className="w-full bg-transparent">
                Try Again
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
