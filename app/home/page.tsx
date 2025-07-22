"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Sparkles, User, Palette, Eye, ArrowRight } from "lucide-react"
import Link from "next/link"
import { useAuth } from "@/hooks/useAuth"
import { useRouter } from "next/navigation"

export default function HomePage() {
  const { user, signOut } = useAuth()
  const router = useRouter()
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    // If not authenticated, redirect to landing page
    if (!user) {
      router.push("/landing")
    }
    
    setIsVisible(true)
  }, [user, router])

  if (!user) {
    return null // Will redirect in useEffect
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
      {/* Navigation */}
      <nav className="bg-gray-800/95 backdrop-blur-sm border-b border-gray-700 sticky top-0 z-50">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-r from-teal-500 to-cyan-500 rounded-xl flex items-center justify-center shadow-lg">
                <Sparkles className="w-6 h-6 text-white" />
              </div>
              <span className="text-2xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
                Style Genie
              </span>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-sm text-gray-400">
                {user.email}
              </div>
              <Button
                onClick={async () => {
                  await signOut()
                  router.push('/landing')
                }}
                variant="outline"
                size="sm"
                className="border-gray-600 hover:bg-gray-700 bg-transparent text-gray-300 hover:text-white"
              >
                Logout
              </Button>
            </div>
          </div>
        </div>
      </nav>

      <div className="container mx-auto px-6 py-16">
        {/* Welcome Section */}
        <div className="text-center mb-16">
          <div
            className={`transition-all duration-1000 ${
              isVisible ? "translate-y-0 opacity-100" : "translate-y-10 opacity-0"
            }`}
          >
            <h1 className="text-5xl md:text-6xl font-bold bg-gradient-to-r from-white via-gray-100 to-gray-300 bg-clip-text text-transparent mb-6 leading-tight">
              Welcome to Style Genie
            </h1>
            <p className="text-xl text-gray-400 mb-8 max-w-3xl mx-auto">
              Your AI-powered wardrobe assistant. What would you like to do today?
            </p>
          </div>
        </div>

        {/* Options Grid */}
        <div className="max-w-4xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* View My Profile */}
            <Link href="/profile">
              <Card className="bg-gray-800/50 backdrop-blur-xl border-gray-700/50 hover:border-teal-500/50 transition-all duration-300 hover:shadow-lg hover:shadow-teal-500/10 hover:scale-105 h-full">
                <CardContent className="p-8 flex flex-col items-center text-center h-full">
                  <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-2xl flex items-center justify-center mb-6 shadow-lg">
                    <User className="w-8 h-8 text-white" />
                  </div>
                  <h2 className="text-2xl font-bold text-white mb-4">View My Profile</h2>
                  <p className="text-gray-400 mb-6 flex-grow">
                    Manage your account settings, preferences, and personal information
                  </p>
                  <Button className="w-full bg-gradient-to-r from-blue-500 to-indigo-500 hover:opacity-90 text-white group">
                    Go to Profile
                    <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </CardContent>
              </Card>
            </Link>

            {/* Start Styling */}
            <Link href="/">
              <Card className="bg-gray-800/50 backdrop-blur-xl border-gray-700/50 hover:border-teal-500/50 transition-all duration-300 hover:shadow-lg hover:shadow-teal-500/10 hover:scale-105 h-full">
                <CardContent className="p-8 flex flex-col items-center text-center h-full">
                  <div className="w-16 h-16 bg-gradient-to-r from-teal-500 to-cyan-500 rounded-2xl flex items-center justify-center mb-6 shadow-lg">
                    <Palette className="w-8 h-8 text-white" />
                  </div>
                  <h2 className="text-2xl font-bold text-white mb-4">Start Styling</h2>
                  <p className="text-gray-400 mb-6 flex-grow">
                    Get AI-powered outfit recommendations based on your wardrobe and the weather
                  </p>
                  <Button className="w-full bg-gradient-to-r from-teal-500 to-cyan-500 hover:opacity-90 text-white group">
                    Get Recommendations
                    <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </CardContent>
              </Card>
            </Link>

            {/* View My Wardrobe */}
            <Link href="/wardrobes">
              <Card className="bg-gray-800/50 backdrop-blur-xl border-gray-700/50 hover:border-teal-500/50 transition-all duration-300 hover:shadow-lg hover:shadow-teal-500/10 hover:scale-105 h-full">
                <CardContent className="p-8 flex flex-col items-center text-center h-full">
                  <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center mb-6 shadow-lg">
                    <Eye className="w-8 h-8 text-white" />
                  </div>
                  <h2 className="text-2xl font-bold text-white mb-4">View My Wardrobe</h2>
                  <p className="text-gray-400 mb-6 flex-grow">
                    Browse, manage, and organize your clothing collection and family wardrobes
                  </p>
                  <Button className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:opacity-90 text-white group">
                    Open Wardrobe
                    <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </CardContent>
              </Card>
            </Link>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="mt-20 max-w-4xl mx-auto">
          <div className="bg-gray-800/30 backdrop-blur-md rounded-2xl p-8 border border-gray-700/50">
            <h3 className="text-xl font-bold text-white mb-6">Your Wardrobe at a Glance</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              <div className="text-center">
                <div className="text-3xl font-bold bg-gradient-to-r from-teal-400 to-cyan-400 bg-clip-text text-transparent">24</div>
                <div className="text-sm text-gray-400 mt-1">Total Items</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">5</div>
                <div className="text-sm text-gray-400 mt-1">Categories</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold bg-gradient-to-r from-amber-400 to-orange-400 bg-clip-text text-transparent">3</div>
                <div className="text-sm text-gray-400 mt-1">Favorite Items</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-indigo-400 bg-clip-text text-transparent">2</div>
                <div className="text-sm text-gray-400 mt-1">Family Wardrobes</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}