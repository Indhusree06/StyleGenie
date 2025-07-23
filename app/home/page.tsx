"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { MessageCircle, Shirt, Plus, Users, Sparkles, Cloud, User, LogOut } from "lucide-react"
import { useAuth } from "@/hooks/useAuth"

export default function HomePage() {
  const { user, loading, signOut } = useAuth()
  const router = useRouter()
  const [greeting, setGreeting] = useState("")

  useEffect(() => {
    if (!loading && !user) {
      router.push("/auth")
      return
    }

    // Set greeting based on time of day
    const hour = new Date().getHours()
    if (hour < 12) {
      setGreeting("Good morning")
    } else if (hour < 18) {
      setGreeting("Good afternoon")
    } else {
      setGreeting("Good evening")
    }
  }, [user, loading, router])

  const handleLogout = async () => {
    try {
      await signOut()
      router.push("/landing")
    } catch (error) {
      console.error("Error signing out:", error)
    }
  }

  // Function to create navigation URL with referrer
  const createNavUrl = (path: string) => {
    return `${path}?from=/home`
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-white border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-400">Loading...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return null
  }

  const userName = user.email?.split("@")[0] || "User"
  const userInitial = userName.charAt(0).toUpperCase()

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
      {/* Navigation */}
      <nav className="border-b border-gray-700 bg-gray-800/50 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-8">
              <Link href="/home" className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center">
                  <Sparkles className="w-5 h-5 text-black" />
                </div>
                <span className="text-xl font-bold text-white">Style Genie</span>
              </Link>

              <div className="hidden md:flex items-center space-x-6">
                <Link
                  href={createNavUrl("/wardrobe")}
                  className="text-gray-300 hover:text-white transition-colors flex items-center space-x-2"
                >
                  <Shirt className="w-4 h-4" />
                  <span>My Wardrobe</span>
                </Link>
                <Link
                  href={createNavUrl("/chat")}
                  className="text-gray-300 hover:text-white transition-colors flex items-center space-x-2"
                >
                  <MessageCircle className="w-4 h-4" />
                  <span>AI Outfit Picker</span>
                </Link>
                <Link
                  href={createNavUrl("/wardrobes")}
                  className="text-gray-300 hover:text-white transition-colors flex items-center space-x-2"
                >
                  <Users className="w-4 h-4" />
                  <span>Family Wardrobes</span>
                </Link>
                <Link
                  href={createNavUrl("/weather-essentials")}
                  className="text-gray-300 hover:text-white transition-colors flex items-center space-x-2"
                >
                  <Cloud className="w-4 h-4" />
                  <span>Weather Essentials</span>
                </Link>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-3">
                <Avatar className="w-8 h-8">
                  <AvatarFallback className="bg-gradient-to-r from-cyan-500 to-blue-500 text-white text-sm">
                    {userInitial}
                  </AvatarFallback>
                </Avatar>
                <div className="hidden sm:block">
                  <p className="text-sm font-medium text-white">{userName}</p>
                  <p className="text-xs text-gray-400">{user.email}</p>
                </div>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={handleLogout}
                className="bg-white text-black hover:bg-gray-100"
              >
                <LogOut className="w-4 h-4 mr-2" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Welcome Section */}
        <div className="text-center mb-12">
          <div className="w-24 h-24 bg-gradient-to-r from-gray-600 to-gray-500 rounded-full flex items-center justify-center mx-auto mb-6 relative">
            <User className="w-12 h-12 text-white" />
            <div className="absolute bottom-0 right-0 w-6 h-6 bg-green-500 rounded-full border-2 border-gray-900"></div>
          </div>
          <h1 className="text-4xl font-bold text-white mb-4">
            {greeting}, {userName}!
          </h1>
          <p className="text-xl text-gray-400 max-w-2xl mx-auto">
            Ready to discover your perfect style? Let's explore your wardrobe and get personalized recommendations.
          </p>
        </div>

        {/* Quick Actions Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Style Chat */}
          <Link href={createNavUrl("/chat")}>
            <Card className="bg-gray-800/80 backdrop-blur-xl border-gray-700 hover:border-gray-600 transition-all duration-300 cursor-pointer group">
              <CardContent className="p-6 text-center">
                <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                  <MessageCircle className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-semibold text-white mb-2">Style Chat</h3>
                <p className="text-gray-400 text-sm">Get AI-powered outfit recommendations</p>
              </CardContent>
            </Card>
          </Link>

          {/* My Wardrobe */}
          <Link href={createNavUrl("/wardrobe")}>
            <Card className="bg-gray-800/80 backdrop-blur-xl border-gray-700 hover:border-gray-600 transition-all duration-300 cursor-pointer group">
              <CardContent className="p-6 text-center">
                <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                  <Shirt className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-semibold text-white mb-2">My Wardrobe</h3>
                <p className="text-gray-400 text-sm">Browse and manage your clothes</p>
              </CardContent>
            </Card>
          </Link>

          {/* Add Clothes */}
          <Link href={createNavUrl("/add-clothes")}>
            <Card className="bg-gray-800/80 backdrop-blur-xl border-gray-700 hover:border-gray-600 transition-all duration-300 cursor-pointer group">
              <CardContent className="p-6 text-center">
                <div className="w-16 h-16 bg-gradient-to-r from-green-500 to-teal-500 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                  <Plus className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-semibold text-white mb-2">Add Clothes</h3>
                <p className="text-gray-400 text-sm">Upload new items to your wardrobe</p>
              </CardContent>
            </Card>
          </Link>

          {/* Family Wardrobes */}
          <Link href={createNavUrl("/wardrobes")}>
            <Card className="bg-gray-800/80 backdrop-blur-xl border-gray-700 hover:border-gray-600 transition-all duration-300 cursor-pointer group">
              <CardContent className="p-6 text-center">
                <div className="w-16 h-16 bg-gradient-to-r from-orange-500 to-red-500 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                  <Users className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-semibold text-white mb-2">Family Wardrobes</h3>
                <p className="text-gray-400 text-sm">Manage wardrobes for everyone</p>
              </CardContent>
            </Card>
          </Link>

          {/* Weather Essentials */}
          <Link href={createNavUrl("/weather-essentials")}>
            <Card className="bg-gray-800/80 backdrop-blur-xl border-gray-700 hover:border-gray-600 transition-all duration-300 cursor-pointer group">
              <CardContent className="p-6 text-center">
                <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                  <Cloud className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-semibold text-white mb-2">Weather Essentials</h3>
                <p className="text-gray-400 text-sm">Manage family weather protection items</p>
              </CardContent>
            </Card>
          </Link>
        </div>

        {/* Recent Activity or Tips Section */}
        <div className="mt-12">
          <h2 className="text-2xl font-bold text-white mb-6">Quick Tips</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="bg-gray-800/50 border-gray-700">
              <CardContent className="p-6">
                <h3 className="text-lg font-semibold text-white mb-2">Organize by Season</h3>
                <p className="text-gray-400 text-sm">
                  Keep your wardrobe organized by separating seasonal items for easier outfit planning.
                </p>
              </CardContent>
            </Card>
            <Card className="bg-gray-800/50 border-gray-700">
              <CardContent className="p-6">
                <h3 className="text-lg font-semibold text-white mb-2">Weather Ready</h3>
                <p className="text-gray-400 text-sm">
                  Use Weather Essentials to track rain gear, winter coats, and sun protection for your family.
                </p>
              </CardContent>
            </Card>
            <Card className="bg-gray-800/50 border-gray-700">
              <CardContent className="p-6">
                <h3 className="text-lg font-semibold text-white mb-2">AI Styling</h3>
                <p className="text-gray-400 text-sm">
                  Chat with our AI stylist to get personalized outfit recommendations based on weather and occasion.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
