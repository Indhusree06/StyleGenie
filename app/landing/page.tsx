"use client"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Sparkles, ArrowRight, ChevronLeft, ChevronRight } from "lucide-react"
import Link from "next/link"

export default function LandingPage() {
  const [isVisible, setIsVisible] = useState(false)
  const [activeSection, setActiveSection] = useState("features")
  const [currentSlide, setCurrentSlide] = useState(0)
  const [audienceType, setAudienceType] = useState("moms") // "moms" or "teens"
  const carouselRef = useRef<HTMLDivElement>(null)

  // Separate image arrays for moms and teens
  const momImages = [
    {
      src: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/pexels-anastasia-shuraeva-8084471.jpg-TKVOJAiWQxAUx5npOxeZtJYTK7Z3Mi.jpeg",
      alt: "Mother and daughter in modern closet, mom helping daughter choose outfit",
    },
    {
      src: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/pexels-rdne-7104238.jpg-qXwBrU2bAbJaMU5Z1btG5zUYSoTigJ.jpeg",
      alt: "Two young girls in bedroom, one helping the other get dressed",
    },
    {
      src: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/pexels-yankrukov-6209525.jpg-Vz3V0htY3IvPilE1BY2bzWev7HKWHo.jpeg",
      alt: "Mother dressing baby in yellow outfit on bed",
    },
    {
      src: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/pexels-arina-krasnikova-5103911.jpg-9M9SwDkEgxjcjEcktf74MMiVyBE140.jpeg",
      alt: "Mother helping toddler get dressed in neutral clothing",
    },
    {
      src: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/pexels-anastasia-shuraeva-8084488.jpg-IHNGE5CK8VIWD1LyPJjdsDtboHYSWJ.jpeg",
      alt: "Mother and child in walk-in closet, mom helping with outfit selection",
    },
    {
      src: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/pexels-august-de-richelieu-4260756.jpg-BwzyoAlDDn6xnhqxKywW1wnl3gM0hr.jpeg",
      alt: "Mother helping young boy with checkered shirt during getting ready routine",
    },
    {
      src: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/pexels-august-de-richelieu-4261265.jpg-uHXyt6SSEb0yToqNSYpu0B87ANhgqO.jpeg",
      alt: "Mother helping child with face mask, modern parenting moment",
    },
  ]

  const teenImages = [
    {
      src: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/pexels-koolshooters-8956121.jpg-ZDxeyxsZofyWMY4FHnbooXGJc3TDt3.jpeg",
      alt: "Teen girl looking in mirror while getting ready, checking her outfit",
    },
    {
      src: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/pexels-cottonbro-6068956.jpg-tgUhoF0P95lXMlAOFDmVid153YCxmt.jpeg",
      alt: "Teen girl browsing clothes in a modern retail store",
    },
    {
      src: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/pexels-cottonbro-6068971.jpg-e8MFPtfp1aNbcBGKt6BxSpQFIicYYM.jpeg",
      alt: "Teen examining clothing patterns and textures while shopping",
    },
    {
      src: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/pexels-ron-lach-8386666.jpg-MbfUFqnW9Vq34RYFtDG9XCsGbnw5bN.jpeg",
      alt: "Two teen friends shopping together in a bright clothing store",
    },
    {
      src: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/pexels-cottonbro-6069552.jpg-UjRCSmEAX1OXA8fLlVAbizSphpGQhG.jpeg",
      alt: "Teen friends examining a coat together while shopping",
    },
    {
      src: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/pexels-rdne-5699243.jpg-dX3iq2VnlCsKzUwcSN4dMp9SykciP8.jpeg",
      alt: "Teen hands browsing through clothing on hangers in store",
    },
    {
      src: "https://plus.unsplash.com/premium_photo-1663957982967-90208afa3bba?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8NXx8c2Nob29sJTIwdGVlbnN8ZW58MHx8MHx8fDA%3D",
      alt: "Group of diverse teenagers with different personal styles",
    },
    {
      src: "https://plus.unsplash.com/premium_photo-1663089610389-21871eb04310?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MXx8c2Nob29sJTIwdGVlbnN8ZW58MHx8MHx8fDA%3D",
      alt: "School teens showcasing their individual fashion choices",
    },
    {
      src: "https://images.unsplash.com/photo-1549057446-9f5c6ac91a04?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Nnx8dGVlbnN8ZW58MHx8MHx8fDA%3D",
      alt: "Teenagers exploring fashion and personal style choices",
    },
    {
      src: "https://plus.unsplash.com/premium_photo-1727967290081-c50ae33dbc3d?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MXx8dGVlbnMlMjBkcmVzc2luZ3xlbnwwfHwwfHx8MA%3D%3D",
      alt: "Teens getting dressed and developing their fashion sense",
    },
  ]

  // Get current images based on selected audience type
  const currentImages = audienceType === "moms" ? momImages : teenImages

  useEffect(() => {
    setIsVisible(true)

    // Auto-slide the carousel
    const interval = setInterval(() => {
      nextSlide()
    }, 5000)

    // Keyboard navigation
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "ArrowLeft") {
        prevSlide()
      } else if (event.key === "ArrowRight") {
        nextSlide()
      }
    }

    window.addEventListener("keydown", handleKeyDown)

    return () => {
      clearInterval(interval)
      window.removeEventListener("keydown", handleKeyDown)
    }
  }, [])

  // Reset slide when audience type changes
  useEffect(() => {
    setCurrentSlide(0)
    if (carouselRef.current) {
      carouselRef.current.scrollTo({ left: 0, behavior: "smooth" })
    }
  }, [audienceType])

  const scrollToSection = (sectionId: string) => {
    setActiveSection(sectionId)
    const element = document.getElementById(sectionId)
    if (element) {
      element.scrollIntoView({ behavior: "smooth" })
    }
  }

  const goToSlide = (index: number) => {
    setCurrentSlide(index)
    if (carouselRef.current) {
      const slideWidth = carouselRef.current.offsetWidth
      carouselRef.current.scrollTo({
        left: slideWidth * index,
        behavior: "smooth",
      })
    }
  }

  const nextSlide = () => {
    const newIndex = (currentSlide + 1) % currentImages.length
    goToSlide(newIndex)
  }

  const prevSlide = () => {
    const newIndex = (currentSlide - 1 + currentImages.length) % currentImages.length
    goToSlide(newIndex)
  }

  const handleAudienceChange = (type: "moms" | "teens") => {
    setAudienceType(type)
  }

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
              <span className="text-2xl font-bold text-blue-500">Style Genie</span>
            </div>
            <div className="hidden md:flex items-center space-x-8">
              <button
                onClick={() => scrollToSection("audience")}
                className={`text-sm font-medium ${activeSection === "audience" ? "text-blue-500" : "text-gray-600 hover:text-blue-500"}`}
              >
                Our audience
              </button>
              <button
                onClick={() => scrollToSection("features")}
                className={`text-sm font-medium ${activeSection === "features" ? "text-blue-500" : "text-gray-600 hover:text-blue-500"}`}
              >
                Features
              </button>
              <button
                onClick={() => scrollToSection("how")}
                className={`text-sm font-medium ${activeSection === "how" ? "text-blue-500" : "text-gray-600 hover:text-blue-500"}`}
              >
                How it works
              </button>
            </div>
            <div className="flex items-center space-x-4">
              <Link href="/auth">
                <Button variant="outline" className="border-blue-500 text-blue-500 hover:bg-blue-50 bg-transparent">
                  Sign In
                </Button>
              </Link>
              <Link href="/auth">
                <Button className="bg-blue-500 hover:bg-blue-600 text-white">Get Started</Button>
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
                Transform your wardrobe with intelligent outfit recommendations based on weather, occasion, and your
                personal style.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link href="/auth">
                  <Button className="bg-blue-500 hover:bg-blue-600 text-white px-8 py-3 text-lg font-medium">
                    Get Started Free
                    <ArrowRight className="ml-2 w-5 h-5" />
                  </Button>
                </Link>
                <Link href="#how-it-works">
                  <Button
                    variant="outline"
                    className="border-gray-300 text-gray-700 hover:bg-gray-100 px-8 py-3 text-lg bg-transparent"
                  >
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

      {/* Our Audience Section */}
      <section id="audience" className="relative">
        {/* Content Section Above Carousel */}
        <div className="py-20 bg-white">
          <div className="container mx-auto px-6">
            <div className="text-center">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Made for Moms and Teens</h2>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto mb-12">
                Style Genie helps busy moms manage wardrobes for the whole family and empowers teens to develop their
                own style
              </p>

              {/* Audience Selection Buttons - Uniqlo Style */}
              <div className="flex justify-center mb-12">
                <div className="inline-flex bg-gray-100 rounded-lg p-1">
                  <button
                    onClick={() => handleAudienceChange("moms")}
                    className={`px-6 py-3 rounded-md text-sm font-medium transition-all duration-200 ${
                      audienceType === "moms" ? "bg-white text-gray-900 shadow-sm" : "text-gray-600 hover:text-gray-900"
                    }`}
                  >
                    For Moms
                  </button>
                  <button
                    onClick={() => handleAudienceChange("teens")}
                    className={`px-6 py-3 rounded-md text-sm font-medium transition-all duration-200 ${
                      audienceType === "teens"
                        ? "bg-white text-gray-900 shadow-sm"
                        : "text-gray-600 hover:text-gray-900"
                    }`}
                  >
                    For Teens
                  </button>
                </div>
              </div>

              {/* Dynamic Content Based on Selection */}
              <div className="transition-all duration-300 ease-in-out">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-12 max-w-4xl mx-auto mb-12">
                  {audienceType === "moms" ? (
                    <>
                      <div className="text-left">
                        <h3 className="text-2xl font-semibold text-gray-900 mb-4">For Busy Moms</h3>
                        <ul className="space-y-3 text-gray-600">
                          <li className="flex items-start">
                            <span className="text-blue-500 mr-2">•</span>
                            Simplify morning routines for the entire family
                          </li>
                          <li className="flex items-start">
                            <span className="text-blue-500 mr-2">•</span>
                            Get outfit suggestions for school, activities, and special occasions
                          </li>
                          <li className="flex items-start">
                            <span className="text-blue-500 mr-2">•</span>
                            Manage multiple wardrobes from one convenient app
                          </li>
                          <li className="flex items-start">
                            <span className="text-blue-500 mr-2">•</span>
                            Save time and reduce daily decision fatigue
                          </li>
                        </ul>
                      </div>
                      <div className="text-left">
                        <h3 className="text-2xl font-semibold text-gray-900 mb-4">Family Benefits</h3>
                        <ul className="space-y-3 text-gray-600">
                          <li className="flex items-start">
                            <span className="text-blue-500 mr-2">•</span>
                            Coordinate outfits for the whole family
                          </li>
                          <li className="flex items-start">
                            <span className="text-blue-500 mr-2">•</span>
                            Weather-appropriate clothing suggestions
                          </li>
                          <li className="flex items-start">
                            <span className="text-blue-500 mr-2">•</span>
                            Special occasion outfit planning
                          </li>
                          <li className="flex items-start">
                            <span className="text-blue-500 mr-2">•</span>
                            Track what everyone wore and when
                          </li>
                        </ul>
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="text-left">
                        <h3 className="text-2xl font-semibold text-gray-900 mb-4">For Teens</h3>
                        <ul className="space-y-3 text-gray-600">
                          <li className="flex items-start">
                            <span className="text-blue-500 mr-2">•</span>
                            Discover and develop your personal style
                          </li>
                          <li className="flex items-start">
                            <span className="text-blue-500 mr-2">•</span>
                            Get age-appropriate outfit recommendations
                          </li>
                          <li className="flex items-start">
                            <span className="text-blue-500 mr-2">•</span>
                            Build confidence through better styling choices
                          </li>
                          <li className="flex items-start">
                            <span className="text-blue-500 mr-2">•</span>
                            Learn to mix and match existing wardrobe pieces
                          </li>
                        </ul>
                      </div>
                      <div className="text-left">
                        <h3 className="text-2xl font-semibold text-gray-900 mb-4">Style Development</h3>
                        <ul className="space-y-3 text-gray-600">
                          <li className="flex items-start">
                            <span className="text-blue-500 mr-2">•</span>
                            Explore different fashion trends safely
                          </li>
                          <li className="flex items-start">
                            <span className="text-blue-500 mr-2">•</span>
                            Get inspiration from style influencers
                          </li>
                          <li className="flex items-start">
                            <span className="text-blue-500 mr-2">•</span>
                            Budget-friendly outfit combinations
                          </li>
                          <li className="flex items-start">
                            <span className="text-blue-500 mr-2">•</span>
                            Share looks with friends for feedback
                          </li>
                        </ul>
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Full Screen Image Carousel */}
        <div className="relative h-screen w-full overflow-hidden">
          {/* Carousel Container */}
          <div
            ref={carouselRef}
            className="flex h-full w-full overflow-x-hidden snap-x snap-mandatory transition-all duration-500 ease-in-out"
            style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
          >
            {currentImages.map((image, index) => (
              <div key={`${audienceType}-${index}`} className="min-w-full h-full flex-shrink-0 snap-center relative">
                {/* Full Screen Background Image */}
                <img src={image.src || "/placeholder.svg"} alt={image.alt} className="w-full h-full object-cover" />
              </div>
            ))}
          </div>

          {/* Navigation Arrows */}
          <button
            onClick={prevSlide}
            className="absolute top-1/2 left-6 transform -translate-y-1/2 bg-white/20 hover:bg-white/30 backdrop-blur-sm rounded-full p-3 shadow-lg z-20 transition-all"
            aria-label="Previous slide"
          >
            <ChevronLeft className="w-6 h-6 text-white" />
          </button>

          <button
            onClick={nextSlide}
            className="absolute top-1/2 right-6 transform -translate-y-1/2 bg-white/20 hover:bg-white/30 backdrop-blur-sm rounded-full p-3 shadow-lg z-20 transition-all"
            aria-label="Next slide"
          >
            <ChevronRight className="w-6 h-6 text-white" />
          </button>

          {/* Navigation Dots */}
          <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 flex space-x-3 z-20">
            {currentImages.map((_, index) => (
              <button
                key={index}
                onClick={() => goToSlide(index)}
                className={`w-3 h-3 rounded-full transition-all ${
                  currentSlide === index ? "bg-white scale-125" : "bg-white/50 hover:bg-white/75"
                }`}
                aria-label={`Go to slide ${index + 1}`}
              />
            ))}
          </div>
        </div>

        {/* Final CTA Section Below Carousel */}
        <div className="py-20 bg-white">
          <div className="container mx-auto px-6">
            <div className="text-center">
              <div className="bg-blue-50 rounded-2xl p-8">
                <h3 className="text-2xl font-semibold text-gray-900 mb-4">Perfect for the Whole Family</h3>
                <p className="text-gray-600 max-w-3xl mx-auto text-lg leading-relaxed">
                  Whether you're a busy mom juggling multiple schedules and wardrobes, or a teen exploring your unique
                  style, Style Genie brings families together through the shared experience of looking and feeling
                  great. Our AI understands that every family member has different needs, preferences, and occasions to
                  dress for.
                </p>
                <div className="mt-6">
                  <Link href="/auth">
                    <Button className="bg-blue-500 hover:bg-blue-600 text-white px-8 py-3 text-lg font-medium">
                      Start Your Family's Style Journey
                      <ArrowRight className="ml-2 w-5 h-5" />
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Smart Features for Your Wardrobe</h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Style Genie combines AI technology with your personal style to create the perfect wardrobe experience
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                title: "AI-Powered Styling",
                description:
                  "Get personalized outfit recommendations based on your wardrobe, weather conditions, and personal style preferences.",
                icon: "✨",
              },
              {
                title: "Weather Integration",
                description:
                  "Real-time weather data ensures your outfit recommendations are always appropriate for current conditions.",
                icon: "🌦️",
              },
              {
                title: "Smart Wardrobe",
                description:
                  "Organize and manage your clothing collection with intelligent categorization, favorites, and wear tracking.",
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
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">How It Works</h2>
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
            <h2 className="text-3xl font-bold text-white mb-6">Ready to Transform Your Style?</h2>
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
              <span className="text-xl font-bold text-blue-500">Style Genie</span>
            </div>

            <div className="flex flex-wrap justify-center gap-6 mb-6 md:mb-0">
              <a href="#" className="text-gray-600 hover:text-blue-500 transition-colors">
                About
              </a>
              <a href="#" className="text-gray-600 hover:text-blue-500 transition-colors">
                Features
              </a>
              <a href="#" className="text-gray-600 hover:text-blue-500 transition-colors">
                Pricing
              </a>
              <a href="#" className="text-gray-600 hover:text-blue-500 transition-colors">
                Contact
              </a>
            </div>

            <p className="text-gray-500 text-sm">© 2025 Style Genie. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
