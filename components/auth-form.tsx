"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent } from "@/components/ui/card"
import { Sparkles, ArrowLeft } from "lucide-react"
import { useAuth } from "@/hooks/useAuth"
import { useRouter } from "next/navigation"
import Link from "next/link"

export function AuthForm() {
  const [isSignUp, setIsSignUp] = useState(false)
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [fullName, setFullName] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  const { signIn, signUp } = useAuth()
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")

    try {
      let result
      if (isSignUp) {
        result = await signUp(email, password, fullName)
      } else {
        result = await signIn(email, password)
      }

      if (result.error) {
        setError(result.error.message)
      } else {
        // Redirect to profile setup for new users, home for existing users
        if (isSignUp) {
          router.push("/profile-setup")
        } else {
          router.push("/home")
        }
      }
    } catch (err) {
      setError("An unexpected error occurred")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 relative overflow-hidden">
      {/* Background Image */}
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-20"
        style={{
          backgroundImage:
            "url('https://hebbkx1anhila5yf.public.blob.vercel-storage.com/priscilla-du-preez-JGyRJlk3idE-unsplash.jpg-af3pIApkOYdobxx6Z9Px603LOHB9s3.jpeg')",
        }}
      />
      <div className="absolute inset-0 bg-black/40" />

      <div className="relative z-10 flex items-center justify-center min-h-screen p-4">
        <Card className="w-full max-w-md bg-gray-800/80 backdrop-blur-xl border-gray-700/50 shadow-2xl">
          <CardContent className="p-8">
            {/* Back Button */}
            <div className="mb-6">
              <Link href="/">
                <Button
                  variant="outline"
                  size="sm"
                  className="border-gray-600 hover:bg-gray-700 bg-transparent text-gray-300 hover:text-white"
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back to Main page
                </Button>
              </Link>
            </div>

            {/* Logo and Header */}
            <div className="text-center mb-8">
              <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
                <Sparkles className="w-8 h-8 text-black" />
              </div>
              <h1 className="text-2xl font-bold text-white mb-2">Welcome to Weather Smart</h1>
              <p className="text-gray-400">Your AI-powered wardrobe assistant</p>
            </div>

            {/* Tab Buttons */}
            <div className="flex mb-6 bg-gray-700 rounded-lg p-1">
              <button
                onClick={() => setIsSignUp(false)}
                className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                  !isSignUp ? "bg-white text-black" : "text-gray-400 hover:text-white"
                }`}
              >
                Sign In
              </button>
              <button
                onClick={() => setIsSignUp(true)}
                className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                  isSignUp ? "bg-white text-black" : "text-gray-400 hover:text-white"
                }`}
              >
                Sign Up
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              {isSignUp && (
                <div>
                  <Label htmlFor="fullName" className="text-gray-300 text-sm font-medium">
                    Full Name
                  </Label>
                  <Input
                    id="fullName"
                    type="text"
                    placeholder="Enter your full name"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="mt-1 h-12 bg-gray-700 border-gray-600 text-white placeholder-gray-400 focus:border-white focus:ring-white"
                    required={isSignUp}
                  />
                </div>
              )}

              <div>
                <Label htmlFor="email" className="text-gray-300 text-sm font-medium">
                  Email
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="mt-1 h-12 bg-gray-700 border-gray-600 text-white placeholder-gray-400 focus:border-white focus:ring-white"
                  required
                />
              </div>

              <div>
                <Label htmlFor="password" className="text-gray-300 text-sm font-medium">
                  Password
                </Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="mt-1 h-12 bg-gray-700 border-gray-600 text-white placeholder-gray-400 focus:border-white focus:ring-white"
                  required
                />
              </div>

              {error && (
                <div className="text-red-400 text-sm text-center bg-red-900/20 border border-red-800 rounded-lg p-3">
                  {error}
                </div>
              )}

              <Button
                type="submit"
                disabled={loading}
                className="w-full h-12 bg-white hover:bg-gray-100 text-black font-medium text-base disabled:opacity-50"
              >
                {loading ? "Please wait..." : isSignUp ? "Sign Up" : "Sign In"}
              </Button>
            </form>

            {!isSignUp && (
              <div className="text-center mt-4">
                <button className="text-gray-400 hover:text-white text-sm">Forgot your password?</button>
              </div>
            )}

            {/* Demo Credentials */}
            <div className="mt-8 text-center">
              <p className="text-gray-500 text-sm mb-2">Demo credentials for testing:</p>
              <p className="text-gray-400 text-xs">Email: demo@weathersmart.com | Password: demo123</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
