"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { useAuth } from "@/hooks/useAuth"
import { Button } from "@/components/ui/button"
import { Sparkles, User, Camera } from "lucide-react"

export default function HomePage() {
  const { user, loading, signOut } = useAuth()
  const router = useRouter()

  // Redirect if not authenticated
  useEffect(() => {
    if (!loading && !user) {
      router.push("/auth")
    }
  }, [user, loading, router])

  const handleLogout = async () => {
    try {
      await signOut()
      router.push("/auth")
    } catch (error) {
      console.error("Logout error:", error)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-white">Loading...</div>
      </div>
    )
  }

  if (!user) {
    return null
  }

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Navigation */}
      <nav className="border-b border-gray-800 bg-black/50 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <Link href="/home" className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-black" />
              </div>
              <span className="text-xl font-bold">Style Genie</span>
            </Link>

            {/* Navigation Items */}
            <div className="hidden md:flex items-center space-x-8">
              <Link href="/wardrobe" className="text-gray-300 hover:text-white transition-colors">
                My Wardrobe
              </Link>
              <Link href="/chat" className="text-gray-300 hover:text-white transition-colors">
                AI Outfit Picker
              </Link>
              <Link href="/wardrobes" className="text-gray-300 hover:text-white transition-colors">
                Family Wardrobes
              </Link>
            </div>

            {/* User Profile */}
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-gray-700 rounded-full flex items-center justify-center">
                  <User className="w-4 h-4" />
                </div>
                <div className="hidden sm:block">
                  <div className="text-sm font-medium">{user.email?.split("@")[0]}</div>
                  <div className="text-xs text-gray-400">{user.email}</div>
                </div>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={handleLogout}
                className="bg-white text-black hover:bg-gray-100"
              >
                Logout
              </Button>
            </div>

            {/* Mobile menu button */}
            <div className="md:hidden">
              <Button variant="ghost" size="sm">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </Button>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Welcome Section */}
        <div className="text-center mb-12">
          {/* User Avatar */}
          <div className="relative inline-block mb-6">
            <div className="w-24 h-24 bg-gray-700 rounded-full flex items-center justify-center">
              <User className="w-12 h-12 text-gray-300" />
            </div>
            <Button
              size="sm"
              className="absolute -bottom-2 -right-2 bg-gray-800 hover:bg-gray-700 text-white border border-gray-600 rounded-full p-2"
            >
              <Camera className="w-4 h-4" />
            </Button>
          </div>

          {/* Welcome Message */}
          <h1 className="text-4xl font-bold mb-4">Welcome back, {user.email?.split("@")[0]}!</h1>
          <p className="text-xl text-gray-400 max-w-2xl mx-auto">
            Ready to discover your perfect style? Let's explore your wardrobe and get personalized recommendations.
          </p>
        </div>
      </div>
    </div>
  )
}
