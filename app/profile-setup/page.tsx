"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/hooks/useAuth"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Sparkles, Camera, User, MessageCircle, Users, Cloud, LogOut, Upload, X } from "lucide-react"

export default function ProfileSetupPage() {
  const { user, signOut } = useAuth()
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [displayName, setDisplayName] = useState("")
  const [description, setDescription] = useState("")
  const [profilePicture, setProfilePicture] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)

  useEffect(() => {
    if (!user) {
      router.push("/auth")
      return
    }

    // Pre-fill with user data if available
    const userName = user.email?.split("@")[0] || ""
    setDisplayName(userName)
  }, [user, router])

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setProfilePicture(file)
      const reader = new FileReader()
      reader.onload = (e) => {
        setImagePreview(e.target?.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleSaveProfile = async () => {
    setLoading(true)
    try {
      // Here you would typically save the profile data to your backend
      // For now, we'll just simulate a save operation
      await new Promise((resolve) => setTimeout(resolve, 1000))

      // After saving, redirect to home
      router.push("/home")
    } catch (error) {
      console.error("Error saving profile:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleCreateWardrobe = async () => {
    setLoading(true)
    try {
      // Save profile data first, then redirect to wardrobe
      await new Promise((resolve) => setTimeout(resolve, 1000))
      router.push("/add-clothes")
    } catch (error) {
      console.error("Error creating wardrobe:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleSkipSetup = () => {
    router.push("/add-clothes")
  }

  const handleLogout = async () => {
    try {
      await signOut()
      router.push("/")
    } catch (error) {
      console.error("Error signing out:", error)
    }
  }

  if (!user) {
    return null
  }

  const userInitial = user.email?.charAt(0).toUpperCase() || "U"

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
      {/* Navigation */}
      <nav className="border-b border-gray-700 bg-gray-800/50 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-8">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center">
                  <Sparkles className="w-5 h-5 text-black" />
                </div>
                <span className="text-xl font-bold text-white">Weather Smart</span>
              </div>

              <div className="hidden md:flex items-center space-x-6">
                <div className="text-blue-400 border-b-2 border-blue-400 pb-2 flex items-center space-x-2">
                  <User className="w-4 h-4" />
                  <span>My Profile</span>
                </div>
                <div className="text-gray-500 flex items-center space-x-2">
                  <MessageCircle className="w-4 h-4" />
                  <span>AI Outfit Picker</span>
                </div>
                <div className="text-gray-500 flex items-center space-x-2">
                  <Users className="w-4 h-4" />
                  <span>Family Wardrobe</span>
                </div>
                <div className="text-gray-500 flex items-center space-x-2">
                  <Cloud className="w-4 h-4" />
                  <span>Weather Essentials</span>
                </div>
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
                  <p className="text-sm font-medium text-white">{user.email?.split("@")[0]}</p>
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

      {/* Progress Indicator */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex items-center justify-center space-x-4">
          <div className="flex items-center">
            <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white text-sm font-medium">
              1
            </div>
            <span className="ml-2 text-blue-400 font-medium">My Profile</span>
          </div>
          <div className="w-16 h-0.5 bg-gray-600"></div>
          <div className="flex items-center">
            <div className="w-8 h-8 bg-gray-600 rounded-full flex items-center justify-center text-gray-400 text-sm font-medium">
              2
            </div>
            <span className="ml-2 text-gray-400">AI Outfit Picker</span>
          </div>
          <div className="w-16 h-0.5 bg-gray-600"></div>
          <div className="flex items-center">
            <div className="w-8 h-8 bg-gray-600 rounded-full flex items-center justify-center text-gray-400 text-sm font-medium">
              3
            </div>
            <span className="ml-2 text-gray-400">Family Wardrobe</span>
          </div>
          <div className="w-16 h-0.5 bg-gray-600"></div>
          <div className="flex items-center">
            <div className="w-8 h-8 bg-gray-600 rounded-full flex items-center justify-center text-gray-400 text-sm font-medium">
              4
            </div>
            <span className="ml-2 text-gray-400">Weather Essentials</span>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <Card className="bg-gray-800/80 backdrop-blur-xl border-gray-700 shadow-2xl">
          <CardContent className="p-8">
            <div className="text-center mb-8">
              <h1 className="text-3xl font-bold text-white mb-2">Welcome to Weather Smart!</h1>
              <p className="text-gray-400">Let's set up your profile and start building your smart wardrobe</p>
            </div>

            <div className="space-y-6">
              {/* Profile Picture */}
              <div className="text-center">
                <div className="relative inline-block">
                  {imagePreview ? (
                    <div className="relative">
                      <img
                        src={imagePreview || "/placeholder.svg"}
                        alt="Profile preview"
                        className="w-24 h-24 rounded-full object-cover border-4 border-gray-600"
                      />
                      <Button
                        type="button"
                        variant="destructive"
                        size="sm"
                        className="absolute -top-2 -right-2 rounded-full w-8 h-8 p-0"
                        onClick={() => {
                          setImagePreview(null)
                          setProfilePicture(null)
                        }}
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  ) : (
                    <div className="w-24 h-24 bg-gray-600 rounded-full flex items-center justify-center border-4 border-gray-500">
                      <Camera className="w-8 h-8 text-gray-400" />
                    </div>
                  )}
                </div>
                <div className="mt-4">
                  <Input
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="hidden"
                    id="profile-picture"
                  />
                  <Button
                    type="button"
                    variant="link"
                    onClick={() => document.getElementById("profile-picture")?.click()}
                    className="text-blue-400 hover:text-blue-300"
                  >
                    <Upload className="w-4 h-4 mr-2" />
                    Update Profile Picture
                  </Button>
                </div>
              </div>

              {/* Display Name */}
              <div>
                <Label htmlFor="displayName" className="text-gray-300 text-sm font-medium flex items-center gap-2">
                  <User className="w-4 h-4" />
                  Display Name
                </Label>
                <Input
                  id="displayName"
                  type="text"
                  placeholder="Enter your display name"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  className="mt-2 h-12 bg-gray-700 border-gray-600 text-white placeholder-gray-400 focus:border-blue-400 focus:ring-blue-400"
                />
              </div>

              {/* Description */}
              <div>
                <Label htmlFor="description" className="text-gray-300 text-sm font-medium flex items-center gap-2">
                  <MessageCircle className="w-4 h-4" />
                  Describe yourself
                </Label>
                <Textarea
                  id="description"
                  placeholder="Tell us about your style preferences..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="mt-2 bg-gray-700 border-gray-600 text-white placeholder-gray-400 focus:border-blue-400 focus:ring-blue-400 min-h-[100px]"
                />
              </div>

              {/* Action Buttons */}
              <div className="space-y-3 pt-4">
                <Button
                  onClick={handleSaveProfile}
                  disabled={loading || !displayName.trim()}
                  className="w-full h-12 bg-blue-600 hover:bg-blue-700 text-white font-medium"
                >
                  {loading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                      Saving Profile...
                    </>
                  ) : (
                    "Save Profile"
                  )}
                </Button>

                <Button
                  onClick={handleCreateWardrobe}
                  disabled={loading}
                  className="w-full h-12 bg-green-600 hover:bg-green-700 text-white font-medium"
                >
                  {loading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                      Creating Wardrobe...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4 mr-2" />
                      Create My Wardrobe
                    </>
                  )}
                </Button>

                <div className="text-center pt-2">
                  <Button
                    variant="link"
                    onClick={handleSkipSetup}
                    className="text-gray-400 hover:text-gray-300 text-sm"
                  >
                    Skip profile setup and start adding clothes
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
