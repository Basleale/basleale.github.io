"use client"

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";

export default function HomePage() {
  const router = useRouter();

  useEffect(() => {
    router.push("/dashboard");
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 via-slate-800 to-red-950">
      <div className="flex items-center text-white text-xl">
        <Loader2 className="mr-2 h-5 w-5 animate-spin" />
        Redirecting to Dashboard...
      </div>
    </div>
  );
}