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
  
  useEffect(() => {
    const interval = setInterval(() => {
      updateMediaStats();
    }, 5000);

    return () => clearInterval(interval);
  }, [media, user]);

  useEffect(() => {
    if (media.length > 0 && user) {
      updateMediaStats();
    }
  }, [media, user]);

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
      formData.append("userId", user.id);

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
      const response = await fetch(mediaItem.url);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = mediaItem.name;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      toast({
        title: "Download failed",
        description: "There was an error downloading the file",
        variant: "destructive",
      });
    }
  };

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
      await mutate(); // Re-fetch media data to get updated stats
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
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-slate-800 to-red-950 text-white">
      <header className="flex items-center justify-between p-4">
        <div className="flex items-center gap-2">
          <Button onClick={() => setActiveTab("explore")} variant={activeTab === "explore" ? "secondary" : "ghost"} size="icon" className={activeTab === "explore" ? "bg-purple-600 text-white hover:bg-purple-700" : "text-gray-400 hover:text-white hover:bg-gray-800"}>
            <Compass className="h-5 w-5" />
          </Button>
          <Button onClick={() => setActiveTab("chat")} variant={activeTab === "chat" ? "secondary" : "ghost"} size="icon" className={activeTab === "chat" ? "bg-purple-600 text-white hover:bg-purple-700" : "text-gray-400 hover:text-white hover:bg-gray-800"}>
            <MessageCircle className="h-5 w-5" />
          </Button>
        </div>
        <h1 className="text-2xl font-bold">Eneskench Summit</h1>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="relative h-10 w-10 rounded-full">
              <Avatar className="h-10 w-10">
                <AvatarImage src={user.profilePicture || "/placeholder-user.jpg"} alt={user.name} />
                <AvatarFallback className="bg-gradient-to-r from-gray-700 via-slate-600 to-red-800">{user.name?.charAt(0)?.toUpperCase() || "U"}</AvatarFallback>
              </Avatar>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-56 bg-gray-800 border-gray-700 text-white" align="end" forceMount>
            <div className="p-2">
              <p className="font-medium">{user.name}</p>
              <p className="truncate text-sm text-gray-400">{user.email}</p>
            </div>
            <DropdownMenuSeparator className="bg-gray-700" />
            <DropdownMenuItem className="hover:bg-gray-700 cursor-pointer" onClick={() => setIsProfileModalOpen(true)}>
              <User className="mr-2 h-4 w-4" />
              <span>Edit Profile</span>
            </DropdownMenuItem>
            <DropdownMenuSeparator className="bg-gray-700" />
            <DropdownMenuItem className="text-red-400 hover:bg-gray-700 hover:text-red-300 cursor-pointer" onClick={handleLogout}>
              <LogOut className="mr-2 h-4 w-4" />
              <span>Sign out</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </header>

      <main className="px-4 pb-8">
        {activeTab === 'explore' && (
           <div className="max-w-6xl mx-auto">
            <div className="flex flex-col items-center mb-8 space-y-4">
              <Button onClick={handleUpload} className="bg-purple-600 hover:bg-purple-700 px-6 py-3" disabled={uploadProgress.length > 0}>
                {uploadProgress.length > 0 ? <Loader2 className="h-5 w-5 mr-2 animate-spin" /> : <Upload className="h-5 w-5 mr-2" />}
                Upload Media
              </Button>
              <div className="relative max-w-md w-full">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input type="text" placeholder="Search media..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="pl-10 bg-gray-800/50 border-gray-600 placeholder-gray-400" />
              </div>
            </div>
            {loading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {[...Array(8)].map((_, i) => (
                  <div key={i} className="bg-gray-800/50 rounded-lg overflow-hidden border border-gray-700 animate-pulse">
                    <div className="aspect-square bg-gray-700"></div>
                    <div className="p-3"><div className="h-4 bg-gray-700 rounded mb-2"></div><div className="h-3 bg-gray-700 rounded w-2/3"></div></div>
                  </div>
                ))}
              </div>
            ) : filteredMedia.length === 0 ? (
              <div className="text-center py-16">
                <div className="mb-4"><Upload className="h-16 w-16 text-gray-400 mx-auto mb-4" /><h3 className="text-xl font-medium mb-2">No media files yet</h3><p className="text-gray-400 mb-6">Upload some images or videos to get started</p></div>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {filteredMedia.map((mediaItem) => (
                  <Card key={mediaItem.id} className="bg-gray-800/50 border-gray-700 hover:border-purple-500 transition-colors">
                    <div className="relative aspect-square cursor-pointer" onClick={() => handleMediaClick(mediaItem)}>
                      {mediaItem.type === "image" ? <img src={mediaItem.url} alt={mediaItem.name} className="w-full h-full object-cover rounded-t-lg" /> : <video src={mediaItem.url} className="w-full h-full object-cover rounded-t-lg" />}
                    </div>
                    <CardContent className="p-3">
                      <div className="flex items-center justify-between">
                        <Button onClick={(e) => { e.stopPropagation(); handleDownload(mediaItem); }} size="sm" variant="ghost" className="text-gray-400 hover:text-white p-2"><Download className="h-4 w-4" /></Button>
                        <div className="flex items-center gap-2">
                          <Button onClick={(e) => { e.stopPropagation(); handleLike(mediaItem.id); }} size="sm" variant="ghost" className={`p-2 ${likedMedia.has(mediaItem.id) ? "text-red-500" : "text-gray-400 hover:text-red-500"}`}>
                            <Heart className={`h-4 w-4 ${likedMedia.has(mediaItem.id) ? "fill-current" : ""}`} />
                            <span className="ml-1 text-xs">{mediaLikes[mediaItem.id] || 0}</span>
                          </Button>
                          <Button onClick={(e) => { e.stopPropagation(); handleViewComments(mediaItem); }} size="sm" variant="ghost" className="text-gray-400 hover:text-white p-2">
                            <MessageCircle className="h-4 w-4" />
                            <span className="ml-1 text-xs">{mediaComments[mediaItem.id] || 0}</span>
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
           </div>
        )}
      </main>

      <UploadProgress files={uploadProgress} />

      {expandedMedia && (
        <div className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4">
          <div className="relative max-w-4xl max-h-full">
            <Button onClick={() => setExpandedMedia(null)} size="icon" variant="ghost" className="absolute top-4 right-4 z-10 bg-black/50 hover:bg-black/70 text-white"><X className="h-4 w-4" /></Button>
            {expandedMedia.type === "image" ? <img src={expandedMedia.url} alt={expandedMedia.name} className="max-w-full max-h-[80vh] object-contain rounded-lg" /> : <video src={expandedMedia.url} controls autoPlay className="max-w-full max-h-[80vh] object-contain rounded-lg" />}
            <div className="mt-4 text-center"><h3 className="text-white text-xl font-medium">{expandedMedia.name}</h3></div>
          </div>
        </div>
      )}

      {user && <ProfileModal isOpen={isProfileModalOpen} onClose={() => setIsProfileModalOpen(false)} user={user} onUpdate={handleProfileUpdate} />}
      {user && <ChatModal isOpen={isChatModalOpen} onClose={() => { setIsChatModalOpen(false); setSelectedChatUser(null); }} user={selectedChatUser} currentUser={user} />}
      {user && <PublicChatModal isOpen={isPublicChatOpen} onClose={() => setIsPublicChatOpen(false)} currentUser={user} />}
      {user && <CommentsModal isOpen={isCommentsModalOpen} onClose={() => { setIsCommentsModalOpen(false); setSelectedMediaForComments(null); }} mediaItem={selectedMediaForComments} currentUser={user} onCommentAdded={updateMediaStats} />}
    </div>
  );
}