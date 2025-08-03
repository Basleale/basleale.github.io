"use client"

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import useSWR from "swr";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubTrigger,
  DropdownMenuSubContent,
  DropdownMenuPortal,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { useMedia } from "@/hooks/use-media";
import { UploadProgress } from "@/components/upload-progress";
import { ProfileModal } from "@/components/profile-modal";
import { ChatModal } from "@/components/chat-modal";
import { PublicChatModal } from "@/components/public-chat-modal";
import { CommentsModal } from "@/components/comments-modal";
import {
  Search,
  Upload,
  Download,
  X,
  Camera,
  Video,
  Loader2,
  LogOut,
  Settings,
  Heart,
  MessageCircle,
  Compass,
  Globe,
  Eye,
  User,
} from "lucide-react";

interface MediaUser {
  id: string;
  name: string;
  email: string;
  profilePicture?: string;
}

// Create a mock user for testing purposes
const mockUser: MediaUser = {
    id: "user_test_01",
    name: "Test User",
    email: "test@example.com",
    profilePicture: ""
};


const fetcher = (url: string) => fetch(url).then((res) => res.json());

export default function DashboardPage() {
  const [user, setUser] = useState<MediaUser | null>(mockUser); // Use the mock user
  const [searchQuery, setSearchQuery] = useState("");
  const [expandedMedia, setExpandedMedia] = useState<any>(null);
  const [uploadProgress, setUploadProgress] = useState<{ name: string; progress: number }[]>([]);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [isChatModalOpen, setIsChatModalOpen] = useState(false);
  const [isPublicChatOpen, setIsPublicChatOpen] = useState(false);
  const [isCommentsModalOpen, setIsCommentsModalOpen] = useState(false);
  const [selectedChatUser, setSelectedChatUser] = useState<any>(null);
  const [selectedMediaForComments, setSelectedMediaForComments] = useState<any>(null);
  const [likedMedia, setLikedMedia] = useState<Set<string>>(new Set());
  const [mediaLikes, setMediaLikes] = useState<{ [key: string]: number }>({});
  const [mediaComments, setMediaComments] = useState<{ [key: string]: number }>({});
  const [activeTab, setActiveTab] = useState("explore");

  const { media, loading, mutate } = useMedia();
  const { toast } = useToast();
  const router = useRouter();

  const { data: conversationsData, error: conversationsError } = useSWR(
    user ? `/api/chat/conversations?userId=${user.id}` : null,
    fetcher,
    { refreshInterval: 5000 }
  );
  
  // NOTE: Authentication check has been removed for testing.
  // useEffect(() => {
  //   const currentUser = localStorage.getItem("currentUser");
  //   if (currentUser) {
  //     const userData = JSON.parse(currentUser);
  //     setUser(userData);
  //   } else {
  //     router.push("/");
  //   }
  // }, [router]);

  useEffect(() => {
    const interval = setInterval(() => {
      updateMediaStats();
    }, 5000);

    return () => clearInterval(interval);
  }, [media, user]);

  useEffect(() => {
    if (media.length > 0) {
      updateMediaStats();
    }
  }, [media]);

  const updateMediaStats = async () => {
    if (!user || media.length === 0) return;

    const likesPromises = media.map(async (item: any) => {
      try {
        const response = await fetch(`/api/media/likes?mediaId=${encodeURIComponent(item.id)}&userId=${encodeURIComponent(user.id)}`);
        if (response.ok) {
          const data = await response.json();
          return { id: item.id, count: data.count, userLiked: data.userLiked };
        }
      } catch (error) { console.error("Error fetching likes:", error); }
      return { id: item.id, count: 0, userLiked: false };
    });

    const commentsPromises = media.map(async (item: any) => {
      try {
        const response = await fetch(`/api/media/comments?mediaId=${encodeURIComponent(item.id)}`);
        if (response.ok) {
          const data = await response.json();
          return { id: item.id, count: data.comments?.length || 0 };
        }
      } catch (error) { console.error("Error fetching comments:", error); }
      return { id: item.id, count: 0 };
    });

    const [likesResults, commentsResults] = await Promise.all([Promise.all(likesPromises), Promise.all(commentsPromises)]);

    const newLikes: { [key: string]: number } = {};
    const newLikedSet = new Set<string>();
    const newComments: { [key: string]: number } = {};

    likesResults.forEach(({ id, count, userLiked }) => {
      newLikes[id] = count;
      if (userLiked) newLikedSet.add(id);
    });
    commentsResults.forEach(({ id, count }) => { newComments[id] = count; });

    setMediaLikes(newLikes);
    setLikedMedia(newLikedSet);
    setMediaComments(newComments);
  };

  const handleLogout = () => {
    // This will redirect to the home page, which now redirects back here.
    // For testing, this button won't do much.
    router.push("/");
  };

  const handleUpload = () => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "image/*,video/*";
    input.multiple = true;
    input.onchange = async (e) => {
      if (!user) return;
      const files = Array.from((e.target as HTMLInputElement).files || []);
      if (files.length === 0) return;

      const formData = new FormData();
      files.forEach((file) => formData.append("files", file));
      formData.append("userId", user.id); // Pass userId for tracking

      setUploadProgress(files.map((file) => ({ name: file.name, progress: 0 })));

      try {
        const response = await fetch("/api/upload", { method: "POST", body: formData });
        if (!response.ok) throw new Error("Upload failed");
        
        mutate();
        toast({ title: "Upload successful", description: `${files.length} file${files.length > 1 ? "s" : ""} uploaded.` });
      } catch (error) {
        toast({ title: "Upload failed", description: "There was an error uploading your files.", variant: "destructive" });
      } finally {
        setUploadProgress([]);
      }
    };
    input.click();
  };
  
    const handleDownload = async (mediaItem: any) => {
    try {
      const response = await fetch(mediaItem.url)
      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = mediaItem.name
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
    } catch (error) {
      toast({
        title: "Download failed",
        description: "There was an error downloading the file",
        variant: "destructive",
      })
    }
  }


  const handleMediaClick = (mediaItem: any) => setExpandedMedia(mediaItem);
  const handleLike = async (mediaId: string) => {
    if (!user) return;
    const isLiked = likedMedia.has(mediaId);
    const action = isLiked ? "unlike" : "like";

    setLikedMedia(prev => {
      const newSet = new Set(prev);
      if (isLiked) newSet.delete(mediaId); else newSet.add(mediaId);
      return newSet;
    });
    setMediaLikes(prev => ({ ...prev, [mediaId]: (prev[mediaId] || 0) + (isLiked ? -1 : 1) }));

    try {
      await fetch("/api/media/likes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mediaId, userId: user.id, action }),
      });
    } catch (error) {
      toast({ title: "Error", description: "Failed to update like", variant: "destructive" });
      // Revert optimistic update on failure
      setLikedMedia(prev => { const newSet = new Set(prev); if (isLiked) newSet.add(mediaId); else newSet.delete(mediaId); return newSet; });
      setMediaLikes(prev => ({ ...prev, [mediaId]: (prev[mediaId] || 0) + (isLiked ? 1 : -1) }));
    }
  };

  const handleChatUser = (chatUser: any) => {
    setSelectedChatUser(chatUser);
    setIsChatModalOpen(true);
  };
  const handleViewComments = (mediaItem: any) => {
    setSelectedMediaForComments(mediaItem);
    setIsCommentsModalOpen(true);
  };
  const handleProfileUpdate = (updatedUser: MediaUser) => {
    setUser(updatedUser);
    toast({ title: "Profile updated", description: "Your profile has been updated successfully." });
  };

  const filteredMedia = media.filter((item: any) => item.name.toLowerCase().includes(searchQuery.toLowerCase()));

  if (!user) return <div className="min-h-screen bg-gradient-to-br from-gray-900 via-slate-800 to-red-950 flex items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-white" /></div>;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-slate-800 to-red-950">
      <header className="flex items-center justify-between p-4">
        <div className="flex items-center gap-2">
          <Button onClick={() => setActiveTab("explore")} variant={activeTab === "explore" ? "default" : "ghost"} size="icon" className={activeTab === "explore" ? "bg-purple-600 hover:bg-purple-700" : "text-gray-400 hover:text-white hover:bg-gray-800"}>
            <Compass className="h-5 w-5" />
          </Button>
          <Button onClick={() => setActiveTab("chat")} variant={activeTab === "chat" ? "default" : "ghost"} size="icon" className={activeTab === "chat" ? "bg-purple-600 hover:bg-purple-700" : "text-gray-400 hover:text-white hover:bg-gray-800"}>
            <MessageCircle className="h-5 w-5" />
          </Button>
        </div>
        <h1 className="text-2xl font-bold text-white">Eneskench Summit</h1>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="relative h-10 w-10 rounded-full">
              <Avatar className="h-10 w-10"><AvatarImage src={user.profilePicture || "/placeholder-user.jpg"} alt={user.name} /><AvatarFallback className="bg-gradient-to-r from-gray-700 via-slate-600 to-red-800 text-white">{user.name?.charAt(0)?.toUpperCase() || "U"}</AvatarFallback></Avatar>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-56 bg-gray-800 border-gray-700" align="end" forceMount>
          <div className="p-2"><p className="font-medium text-white">{user.name}</p><p className="truncate text-sm text-gray-400">{user.email}</p></div>
            <DropdownMenuSeparator className="bg-gray-700" />
            <DropdownMenuSub>
                <DropdownMenuSubTrigger className="text-gray-300 hover:bg-gray-700 hover:text-white cursor-pointer">
                    <Settings className="mr-2 h-4 w-4" />
                    <span>Settings</span>
                </DropdownMenuSubTrigger>
                <DropdownMenuPortal>
                    <DropdownMenuSubContent className="bg-gray-800 border-gray-700 text-white">
                        <DropdownMenuItem className="hover:bg-gray-700 cursor-pointer" onClick={() => setIsProfileModalOpen(