"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Sparkles, ArrowRight } from "lucide-react"
import Link from "next/link"
import Image from "next/image"

export default function LandingPage() {
  const [isVisible, setIsVisible] = useState(false)
  const [activeSection, setActiveSection] = useState("features")

  useEffect(() => {
    setIsVisible(true)
  }, [])

  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 bg-white border-b border-gray-100">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center">
                <Sparkles className="w-6 h-6 text-white" />
              </div>
              <span className="text-2xl font-bold text-blue-500">
                Style Genie
              </span>
            </div>
            <div className="hidden md:flex items-center space-x-8">
              <button 
                onClick={() => setActiveSection("audience")}
                className={`text-sm font-medium ${activeSection === "audience" ? "text-blue-500" : "text-gray-600 hover:text-blue-500"}`}
              >
                Our audience
              </button>
              <button 
                onClick={() => setActiveSection("features")}
                className={`text-sm font-medium ${activeSection === "features" ? "text-blue-500" : "text-gray-600 hover:text-blue-500"}`}
              >
                Features
              </button>
              <button 
                onClick={() => setActiveSection("how")}
                className={`text-sm font-medium ${activeSection === "how" ? "text-blue-500" : "text-gray-600 hover:text-blue-500"}`}
              >
                How it works
              </button>
            </div>
            <div className="flex items-center space-x-4">
              <Link href="/auth">
                <Button variant="outline" className="border-blue-500 text-blue-500 hover:bg-blue-50">
                  Sign In
                </Button>
              </Link>
              <Link href="/auth">
                <Button className="bg-blue-500 hover:bg-blue-600 text-white">
                  Get Started
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="py-20 bg-gradient-to-b from-blue-50 to-white">
        <div className="container mx-auto px-6">
          <div className="flex flex-col md:flex-row items-center">
            <div className="md:w-1/2 mb-10 md:mb-0">
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 mb-6">
                Your AI-Powered <br />
                <span className="text-blue-500">Wardrobe Assistant</span>
              </h1>
              <p className="text-lg text-gray-600 mb-8 max-w-lg">
                Transform your wardrobe with intelligent outfit recommendations based on weather, occasion, and your personal style.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link href="/auth">
                  <Button className="bg-blue-500 hover:bg-blue-600 text-white px-8 py-3 text-lg font-medium">
                    Get Started Free
                    <ArrowRight className="ml-2 w-5 h-5" />
                  </Button>
                </Link>
                <Link href="#how-it-works">
                  <Button variant="outline" className="border-gray-300 text-gray-700 hover:bg-gray-100 px-8 py-3 text-lg">
                    Learn More
                  </Button>
                </Link>
              </div>
            </div>
            <div className="md:w-1/2">
              <div className="relative">
                <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100">
                  <div className="p-1">
                    <div className="bg-gray-50 rounded-xl overflow-hidden">
                      <div className="flex justify-between items-center p-4 border-b border-gray-200">
                        <div className="flex space-x-2">
                          <div className="w-3 h-3 rounded-full bg-red-400"></div>
                          <div className="w-3 h-3 rounded-full bg-yellow-400"></div>
                          <div className="w-3 h-3 rounded-full bg-green-400"></div>
                        </div>
                        <div className="px-4 py-1 rounded-full bg-gray-100 text-xs text-gray-500">style-genie.app</div>
                      </div>
                      <div className="p-6">
                        <div className="flex justify-between items-center mb-6">
                          <div className="flex items-center space-x-3">
                            <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center">
                              <Sparkles className="w-5 h-5 text-white" />
                            </div>
                            <span className="text-lg font-semibold text-gray-800">Style Genie</span>
                          </div>
                        </div>
                        
                        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-200 mb-6">
                          <p className="text-gray-700 text-sm mb-4">Here's your outfit for today's business meeting:</p>
                          <div className="grid grid-cols-3 gap-3">
                            <div className="bg-gray-100 rounded-lg p-2 text-center">
                              <div className="w-full h-16 bg-blue-100 rounded-md mb-2"></div>
                              <span className="text-xs text-gray-600">Navy Blazer</span>
                            </div>
                            <div className="bg-gray-100 rounded-lg p-2 text-center">
                              <div className="w-full h-16 bg-blue-100 rounded-md mb-2"></div>
                              <span className="text-xs text-gray-600">White Shirt</span>
                            </div>
                            <div className="bg-gray-100 rounded-lg p-2 text-center">
                              <div className="w-full h-16 bg-blue-100 rounded-md mb-2"></div>
                              <span className="text-xs text-gray-600">Gray Slacks</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                {/* Decorative elements */}
                <div className="absolute -top-6 -right-6 w-24 h-24 bg-blue-100 rounded-full"></div>
                <div className="absolute -bottom-6 -left-6 w-24 h-24 bg-blue-100 rounded-full"></div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Smart Features for Your Wardrobe
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Style Genie combines AI technology with your personal style to create the perfect wardrobe experience
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                title: "AI-Powered Styling",
                description: "Get personalized outfit recommendations based on your wardrobe, weather conditions, and personal style preferences.",
                icon: "✨",
              },
              {
                title: "Weather Integration",
                description: "Real-time weather data ensures your outfit recommendations are always appropriate for current conditions.",
                icon: "🌦️",
              },
              {
                title: "Smart Wardrobe",
                description: "Organize and manage your clothing collection with intelligent categorization, favorites, and wear tracking.",
                icon: "👕",
              },
            ].map((feature, index) => (
              <div 
                key={index} 
                className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow"
              >
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center text-2xl mb-4">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">{feature.title}</h3>
                <p className="text-gray-600">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="py-20 bg-blue-50">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              How It Works
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Getting started with Style Genie is easy and takes just minutes
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            {[
              {
                step: "1",
                title: "Add Your Clothes",
                description: "Take photos or manually add items to build your digital wardrobe.",
              },
              {
                step: "2",
                title: "Set Your Preferences",
                description: "Tell us about your style, favorite colors, and occasions you dress for.",
              },
              {
                step: "3",
                title: "Get Recommendations",
                description: "Receive personalized outfit suggestions based on weather and events.",
              },
            ].map((step, index) => (
              <div key={index} className="text-center">
                <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center text-white font-bold text-lg mx-auto mb-4">
                  {step.step}
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">{step.title}</h3>
                <p className="text-gray-600">{step.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20">
        <div className="container mx-auto px-6">
          <div className="bg-blue-500 rounded-2xl p-12 text-center">
            <h2 className="text-3xl font-bold text-white mb-6">
              Ready to Transform Your Style?
            </h2>
            <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
              Join thousands of users who have revolutionized their wardrobe with AI-powered styling.
            </p>
            <Link href="/auth">
              <Button className="bg-white text-blue-500 hover:bg-blue-50 px-8 py-3 text-lg font-medium">
                Get Started Free
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-50 py-12 border-t border-gray-100">
        <div className="container mx-auto px-6">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center space-x-3 mb-6 md:mb-0">
              <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                <Sparkles className="w-4 h-4 text-white" />
              </div>
              <span className="text-xl font-bold text-blue-500">
                Style Genie
              </span>
            </div>
            
            <div className="flex flex-wrap justify-center gap-6 mb-6 md:mb-0">
              <a href="#" className="text-gray-600 hover:text-blue-500 transition-colors">About</a>
              <a href="#" className="text-gray-600 hover:text-blue-500 transition-colors">Features</a>
              <a href="#" className="text-gray-600 hover:text-blue-500 transition-colors">Pricing</a>
              <a href="#" className="text-gray-600 hover:text-blue-500 transition-colors">Contact</a>
            </div>
            
            <p className="text-gray-500 text-sm">© 2025 Style Genie. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}