import { Search, Menu, Bell, User, BarChart3, Clock, Settings, Users } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

export default function Component() {
  return (
    <div className="min-h-screen bg-slate-900 text-white">
      {/* Header */}
      <header className="flex items-center justify-between px-4 py-3 border-b border-slate-700">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" className="text-white hover:bg-slate-800">
            <Menu className="h-5 w-5" />
          </Button>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-white rounded flex items-center justify-center">
              <div className="w-6 h-6 bg-slate-900 rounded-sm flex items-center justify-center">
                <div className="w-4 h-1 bg-white rounded"></div>
              </div>
            </div>
            <span className="text-xl font-semibold">Eneskench Summit</span>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <span className="text-sm text-slate-300">Albbuch</span>
          <div className="relative">
            <Button variant="ghost" size="icon" className="text-white hover:bg-slate-800">
              <Bell className="h-5 w-5" />
            </Button>
            <Badge className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-red-500 text-xs p-0 flex items-center justify-center">
              1
            </Badge>
          </div>
          <Avatar className="h-8 w-8">
            <AvatarImage src="/placeholder.svg?height=32&width=32" />
            <AvatarFallback>U</AvatarFallback>
          </Avatar>
        </div>
      </header>

      <div className="flex">
        {/* Sidebar */}
        <aside className="w-16 bg-slate-900 border-r border-slate-700 flex flex-col items-center py-4 gap-4">
          <div className="relative">
            <Button variant="ghost" size="icon" className="text-white hover:bg-slate-800">
              <Users className="h-5 w-5" />
            </Button>
            <Badge className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-red-500 text-xs p-0 flex items-center justify-center">
              1
            </Badge>
          </div>
          <Button variant="ghost" size="icon" className="text-white hover:bg-slate-800">
            <BarChart3 className="h-5 w-5" />
          </Button>
          <Button variant="ghost" size="icon" className="text-white hover:bg-slate-800">
            <Menu className="h-5 w-5" />
          </Button>
          <Button variant="ghost" size="icon" className="text-white hover:bg-slate-800">
            <Clock className="h-5 w-5" />
          </Button>
          <Button variant="ghost" size="icon" className="text-white hover:bg-slate-800">
            <Settings className="h-5 w-5" />
          </Button>
          <Button variant="ghost" size="icon" className="text-white hover:bg-slate-800">
            <User className="h-5 w-5" />
          </Button>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-6">
          {/* Search Bar */}
          <div className="flex gap-2 mb-8">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 h-4 w-4" />
              <Input
                placeholder="Search by Name"
                className="pl-10 bg-slate-800 border-slate-700 text-white placeholder:text-slate-400"
              />
            </div>
            <Button className="bg-purple-600 hover:bg-purple-700 px-6">
              <Search className="h-4 w-4" />
            </Button>
          </div>

          {/* Uptently uploads section */}
          <section className="mb-12">
            <h2 className="text-2xl font-semibold mb-6">Uptently uploads</h2>
            <div className="flex gap-4 mb-4">
              <div className="flex-shrink-0">
                <div className="w-48 h-64 bg-slate-800 rounded-lg overflow-hidden">
                  <img
                    src="/placeholder.svg?height=256&width=192"
                    alt="Person in white shirt"
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="mt-3">
                  <h3 className="font-medium">Image Tagging AI</h3>
                  <p className="text-sm text-slate-400">with oral suggestions</p>
                </div>
              </div>

              <div className="flex-shrink-0">
                <div className="w-48 h-64 bg-slate-800 rounded-lg overflow-hidden">
                  <img
                    src="/placeholder.svg?height=256&width=192"
                    alt="Person with curly hair and sunglasses"
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="mt-3">
                  <h3 className="font-medium">Usth Uploads</h3>
                  <p className="text-sm text-slate-400">ANlbties</p>
                </div>
              </div>

              <div className="flex-shrink-0">
                <div className="w-48 h-64 bg-slate-800 rounded-lg overflow-hidden">
                  <img
                    src="/placeholder.svg?height=256&width=192"
                    alt="Neon cyberpunk scene"
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>

              <div className="flex-shrink-0">
                <div className="w-48 h-64 bg-slate-800 rounded-lg overflow-hidden">
                  <img
                    src="/placeholder.svg?height=256&width=192"
                    alt="Person in yellow shirt with hat"
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>
            </div>

            {/* Pagination dots */}
            <div className="flex justify-center gap-2">
              <div className="w-2 h-2 rounded-full bg-slate-600"></div>
              <div className="w-2 h-2 rounded-full bg-slate-600"></div>
              <div className="w-2 h-2 rounded-full bg-slate-400"></div>
              <div className="w-2 h-2 rounded-full bg-slate-600"></div>
            </div>
          </section>

          {/* Photo Stream section */}
          <section>
            <h2 className="text-2xl font-semibold mb-6">Photo Stream</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <div className="w-full h-64 bg-slate-800 rounded-lg overflow-hidden">
                  <img
                    src="/placeholder.svg?height=256&width=300"
                    alt="Woman at sunset"
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="mt-3">
                  <h3 className="font-medium">Dynamic Sploe of</h3>
                  <p className="text-sm text-slate-400">4K Video</p>
                </div>
              </div>

              <div>
                <div className="w-full h-64 bg-slate-800 rounded-lg overflow-hidden">
                  <img
                    src="/placeholder.svg?height=256&width=300"
                    alt="Woman portrait indoor"
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="mt-3">
                  <h3 className="font-medium">Buttery Smooth</h3>
                  <p className="text-sm text-slate-400">4K Video</p>
                </div>
              </div>

              <div>
                <div className="w-full h-64 bg-slate-800 rounded-lg overflow-hidden">
                  <img
                    src="/placeholder.svg?height=256&width=300"
                    alt="Person in black jacket against sky"
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="mt-3">
                  <h3 className="font-medium">Buttery Smooth</h3>
                  <p className="text-sm text-slate-400">4K Video</p>
                </div>
              </div>
            </div>
          </section>
        </main>
      </div>
    </div>
  )
}
