"use client"

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle, AlertCircle, Loader2 } from "lucide-react";

export default function SetupDatabasePage() {
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [message, setMessage] = useState("");

  const setupDatabase = async () => {
    setStatus("loading");
    setMessage("");

    try {
      const response = await fetch("/api/setup-db", {
        method: "POST",
      });

      const data = await response.json();

      if (response.ok) {
        setStatus("success");
        setMessage(data.message || "Database setup completed successfully!");
      } else {
        setStatus("error");
        setMessage(data.error || "Failed to set up database");
      }
    } catch (error) {
      setStatus("error");
      setMessage("A network error occurred.");
      console.error("Setup error:", error);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-900 text-white p-4">
      <Card className="w-full max-w-md bg-gray-800 border-gray-700">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">Database Setup</CardTitle>
          <CardDescription className="text-gray-400">
            Click the button to initialize your database tables. This only needs to be done once.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button onClick={setupDatabase} disabled={status === "loading"} className="w-full bg-purple-600 hover:bg-purple-700">
            {status === "loading" && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {status === "loading" ? "Setting up..." : "Initialize Database"}
          </Button>

          {status === "success" && (
            <div className="flex items-center space-x-2 text-green-400 bg-green-900/50 p-3 rounded-md">
              <CheckCircle className="h-5 w-5" />
              <span className="text-sm">{message}</span>
            </div>
          )}

          {status === "error" && (
            <div className="flex items-center space-x-2 text-red-400 bg-red-900/50 p-3 rounded-md">
              <AlertCircle className="h-5 w-5" />
              <span className="text-sm">{message}</span>
            </div>
          )}

          {status === "success" && (
            <div className="text-center">
              <Button variant="outline" onClick={() => (window.location.href = "/")} className="w-full border-gray-600 hover:bg-gray-700">
                Go to Login Page
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}