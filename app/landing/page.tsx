"use client"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Sparkles, ArrowRight, ChevronLeft, ChevronRight, Upload, Tag, Zap } from "lucide-react"
import Link from "next/link"

export default function LandingPage() {
  const [isVisible, setIsVisible] = useState(false)
  const [activeSection, setActiveSection] = useState("")
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
      src: "https://images.unsplash.com/photo-1549057446-9f5c6ac91a04?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Nnx8c2Nob29sJTIwdGVlbnN8ZW58MHx8MHx8fDA%3D",
      alt: "Group of diverse teenagers with different personal styles",
    },
    {
      src: "https://plus.unsplash.com/premium_photo-1663089610389-21871eb04310?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MXx8c2Nob29sJTIwdGVlbnN8ZW58MHx8MHx8fDA%3D",
      alt: "School teens showcasing their individual fashion choices",
    },
    {
      src: "https://images.unsplash.com/photo-1549057446-9f5c6ac91a04?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Nnx8c2Nob29sJTIwdGVlbnN8ZW58MHx8MHx8fDA%3D",
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

    // Set active section based on scroll position
    const handleScroll = () => {
      const scrollPosition = window.scrollY + 100 // offset for the navbar

      // Get all sections
      const sections = ["hero", "audience", "features", "how"]

      // Find the current section
      for (let i = sections.length - 1; i >= 0; i--) {
        const section = document.getElementById(sections[i])
        if (section && scrollPosition >= section.offsetTop) {
          setActiveSection(sections[i])
          break
        }
      }
    }

    window.addEventListener("scroll", handleScroll)
    handleScroll() // Set initial active section

    return () => {
      clearInterval(interval)
      window.removeEventListener("keydown", handleKeyDown)
      window.removeEventListener("scroll", handleScroll)
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
      // Add offset to account for sticky navigation
      const navHeight = 80 // Approximate height of navigation
      const elementPosition = element.offsetTop - navHeight
      window.scrollTo({
        top: elementPosition,
        behavior: "smooth",
      })
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
    <div className="min-h-screen bg-black">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 bg-black/95 backdrop-blur-sm border-b border-gray-800">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center">
                <Sparkles className="w-6 h-6 text-black" />
              </div>
              <span className="text-2xl font-bold text-white">Weather Smart</span>
            </div>
            <div className="hidden md:flex items-center space-x-8">
              <button
                onClick={() => scrollToSection("audience")}
                className={`text-sm font-medium transition-colors ${activeSection === "audience" ? "text-white" : "text-gray-400 hover:text-white"}`}
              >
                Our audience
              </button>
              <button
                onClick={() => scrollToSection("features")}
                className={`text-sm font-medium transition-colors ${activeSection === "features" ? "text-white" : "text-gray-400 hover:text-white"}`}
              >
                Features
              </button>
              <button
                onClick={() => scrollToSection("how")}
                className={`text-sm font-medium transition-colors ${activeSection === "how" ? "text-white" : "text-gray-400 hover:text-white"}`}
              >
                How it works
              </button>
            </div>
            <div className="flex items-center space-x-4">
              <Link href="/auth">
                <Button
                  variant="outline"
                  className="border-gray-600 text-gray-300 hover:bg-gray-800 hover:text-white bg-transparent"
                >
                  Sign In
                </Button>
              </Link>
              <Link href="/auth">
                <Button className="bg-white text-black hover:bg-gray-200">Get Started</Button>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section id="hero" className="py-24 bg-gradient-to-br from-black via-gray-900 to-black relative overflow-hidden">
        {/* Background decorative elements */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-gray-800 rounded-full opacity-20 blur-3xl -translate-y-1/2 translate-x-1/2"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-gray-700 rounded-full opacity-10 blur-3xl translate-y-1/2 -translate-x-1/2"></div>

        <div className="container mx-auto px-6 relative z-10">
          <div className="flex flex-col items-center justify-center gap-12">
            <div className="text-center">
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-4">Weather Smart</h1>
              <p className="text-lg md:text-xl text-gray-300 mb-6 max-w-3xl mx-auto">
                Your AI-powered Outfit Selector with intelligent outfit recommendations based on weather, occasion, and
                your personal style
              </p>
              <div className="mt-2">
                <Link href="/auth">
                  <Button className="bg-white text-black hover:bg-gray-200 px-8 py-3 text-lg font-medium">
                    Get Started Free
                    <ArrowRight className="ml-2 w-5 h-5" />
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Our Audience Section */}
      <section id="audience" className="py-20 bg-gray-900">
        <div className="container mx-auto px-6">
          <div className="text-center">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">Made for Families</h2>
            <p className="text-lg text-gray-400 max-w-2xl mx-auto mb-12">
              Weather Smart helps families manage wardrobes for everyone and empowers each family member to develop
              their own personal style
            </p>

            {/* Audience Selection Buttons - Dark Style */}
            <div className="flex justify-center mb-12">
              <div className="inline-flex bg-gray-800 rounded-lg p-1">
                <button
                  onClick={() => handleAudienceChange("moms")}
                  className={`px-6 py-3 rounded-md text-sm font-medium transition-all duration-200 ${
                    audienceType === "moms" ? "bg-white text-black shadow-sm" : "text-gray-400 hover:text-white"
                  }`}
                >
                  For Moms
                </button>
                <button
                  onClick={() => handleAudienceChange("teens")}
                  className={`px-6 py-3 rounded-md text-sm font-medium transition-all duration-200 ${
                    audienceType === "teens" ? "bg-white text-black shadow-sm" : "text-gray-400 hover:text-white"
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
                      <h3 className="text-2xl font-semibold text-white mb-4">For Busy Moms</h3>
                      <ul className="space-y-3 text-gray-400">
                        <li className="flex items-start">
                          <span className="text-white mr-2">•</span>
                          Simplify morning routines for the entire family
                        </li>
                        <li className="flex items-start">
                          <span className="text-white mr-2">•</span>
                          Get outfit suggestions for school, activities, and special occasions
                        </li>
                        <li className="flex items-start">
                          <span className="text-white mr-2">•</span>
                          Manage multiple wardrobes from one convenient app
                        </li>
                        <li className="flex items-start">
                          <span className="text-white mr-2">•</span>
                          Save time and reduce daily decision fatigue
                        </li>
                      </ul>
                    </div>
                    <div className="text-left">
                      <h3 className="text-2xl font-semibold text-white mb-4">Family Benefits</h3>
                      <ul className="space-y-3 text-gray-400">
                        <li className="flex items-start">
                          <span className="text-white mr-2">•</span>
                          Coordinate outfits for the whole family
                        </li>
                        <li className="flex items-start">
                          <span className="text-white mr-2">•</span>
                          Weather-appropriate clothing suggestions
                        </li>
                        <li className="flex items-start">
                          <span className="text-white mr-2">•</span>
                          Special occasion outfit planning
                        </li>
                        <li className="flex items-start">
                          <span className="text-white mr-2">•</span>
                          Track what everyone wore and when
                        </li>
                      </ul>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="text-left">
                      <h3 className="text-2xl font-semibold text-white mb-4">For Teens</h3>
                      <ul className="space-y-3 text-gray-400">
                        <li className="flex items-start">
                          <span className="text-white mr-2">•</span>
                          Discover and develop your personal style
                        </li>
                        <li className="flex items-start">
                          <span className="text-white mr-2">•</span>
                          Get age-appropriate outfit recommendations
                        </li>
                        <li className="flex items-start">
                          <span className="text-white mr-2">•</span>
                          Build confidence through better styling choices
                        </li>
                        <li className="flex items-start">
                          <span className="text-white mr-2">•</span>
                          Learn to mix and match existing wardrobe pieces
                        </li>
                      </ul>
                    </div>
                    <div className="text-left">
                      <h3 className="text-2xl font-semibold text-white mb-4">Style Development</h3>
                      <ul className="space-y-3 text-gray-400">
                        <li className="flex items-start">
                          <span className="text-white mr-2">•</span>
                          Explore different fashion trends safely
                        </li>
                        <li className="flex items-start">
                          <span className="text-white mr-2">•</span>
                          Get inspiration from style influencers
                        </li>
                        <li className="flex items-start">
                          <span className="text-white mr-2">•</span>
                          Budget-friendly outfit combinations
                        </li>
                        <li className="flex items-start">
                          <span className="text-white mr-2">•</span>
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
                {/* Full Screen Background Image with Dark Overlay */}
                <img src={image.src || "/placeholder.svg"} alt={image.alt} className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-black/40"></div>
              </div>
            ))}
          </div>

          {/* Navigation Arrows */}
          <button
            onClick={prevSlide}
            className="absolute top-1/2 left-6 transform -translate-y-1/2 bg-black/40 hover:bg-black/60 backdrop-blur-sm rounded-full p-3 shadow-lg z-20 transition-all"
            aria-label="Previous slide"
          >
            <ChevronLeft className="w-6 h-6 text-white" />
          </button>

          <button
            onClick={nextSlide}
            className="absolute top-1/2 right-6 transform -translate-y-1/2 bg-black/40 hover:bg-black/60 backdrop-blur-sm rounded-full p-3 shadow-lg z-20 transition-all"
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
        <div className="py-20 bg-gray-900">
          <div className="container mx-auto px-6">
            <div className="text-center">
              <div className="bg-gray-800 rounded-2xl p-8 border border-gray-700">
                <h3 className="text-2xl font-semibold text-white mb-4">Perfect for the Whole Family</h3>
                <p className="text-gray-400 max-w-3xl mx-auto text-lg leading-relaxed">
                  Whether you're a busy mom juggling multiple schedules and wardrobes, or a teen exploring your unique
                  style, Weather Smart brings families together through the shared experience of looking and feeling
                  great. Our AI understands that every family member has different needs, preferences, and occasions to
                  dress for.
                </p>
                <div className="mt-6">
                  <Link href="/auth">
                    <Button className="bg-white text-black hover:bg-gray-200 px-8 py-3 text-lg font-medium">
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
      <section id="features" className="py-20 bg-black">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">Why families love Weather Smart</h2>
            <p className="text-lg text-gray-400 max-w-2xl mx-auto">
              Real solutions for real wardrobe challenges that busy families face every day
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            <div className="bg-gray-900 rounded-xl p-8 shadow-sm border border-gray-800 hover:bg-gray-800 transition-colors">
              <div className="w-12 h-12 bg-gray-800 rounded-lg flex items-center justify-center mb-6">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
                  />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-white mb-4">Never guess the weather again</h3>
              <p className="text-gray-400 leading-relaxed">
                No more sending kids to school in shorts when it's 45°F. Get outfit suggestions that actually match the
                weather forecast, so everyone stays comfortable all day.
              </p>
            </div>

            <div className="bg-gray-900 rounded-xl p-8 shadow-sm border border-gray-800 hover:bg-gray-800 transition-colors">
              <div className="w-12 h-12 bg-gray-800 rounded-lg flex items-center justify-center mb-6">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-white mb-4">Cut morning chaos in half</h3>
              <p className="text-gray-400 leading-relaxed">
                Stop the daily "I have nothing to wear" meltdowns. Plan outfits the night before or get instant
                suggestions when you're running late.
              </p>
            </div>

            <div className="bg-gray-900 rounded-xl p-8 shadow-sm border border-gray-800 hover:bg-gray-800 transition-colors">
              <div className="w-12 h-12 bg-gray-800 rounded-lg flex items-center justify-center mb-6">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                  />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-white mb-4">Rediscover clothes you forgot you had</h3>
              <p className="text-gray-400 leading-relaxed">
                That cute top buried in the back of the closet? Weather Smart remembers it and suggests new ways to wear
                it. Make the most of what you already own.
              </p>
            </div>
          </div>

          {/* Additional Features Row */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto mt-12">
            <div className="bg-gray-900 rounded-xl p-8 shadow-sm border border-gray-800 hover:bg-gray-800 transition-colors">
              <div className="w-12 h-12 bg-gray-800 rounded-lg flex items-center justify-center mb-6">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                  />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-white mb-4">Perfect for the whole family</h3>
              <p className="text-gray-400 leading-relaxed">
                Manage everyone's wardrobe in one place. From toddler tantrums to teenage fashion crises, get
                age-appropriate suggestions for every family member.
              </p>
            </div>

            <div className="bg-gray-900 rounded-xl p-8 shadow-sm border border-gray-800 hover:bg-gray-800 transition-colors">
              <div className="w-12 h-12 bg-gray-800 rounded-lg flex items-center justify-center mb-6">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138-3.138"
                  />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-white mb-4">Explore and Mix</h3>
              <p className="text-gray-400 leading-relaxed">
                Easily explore different fashion trends and mix and match pieces from your wardrobe to create unique
                outfits.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how" className="py-20 bg-gray-900">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">How it works</h2>
            <p className="text-lg text-gray-400 max-w-2xl mx-auto">
              Getting started with Weather Smart is simple and takes just a few minutes
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            <div className="text-center">
              <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-6">
                <Upload className="w-8 h-8 text-black" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-3">1. Upload Your Photos</h3>
              <p className="text-gray-400 leading-relaxed">
                Take photos of your clothes and upload them to create your digital wardrobe. Our app makes it easy to
                organize everything by category, color, and season.
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-gray-600 rounded-full flex items-center justify-center mx-auto mb-6">
                <Tag className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-3">2. Add Your Tags</h3>
              <p className="text-gray-400 leading-relaxed">
                Tag your items with details like color, style, occasion, and season. This helps our AI understand your
                preferences and suggest the perfect combinations.
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-6">
                <Zap className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-3">3. Get Smart Suggestions</h3>
              <p className="text-gray-400 leading-relaxed">
                Receive personalized outfit recommendations based on weather, occasion, and your style preferences.
                Getting dressed has never been easier!
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative">
        {/* Full-width wardrobe image */}
        <div className="w-full h-64 md:h-80 bg-gradient-to-r from-black to-gray-900 relative overflow-hidden">
          <div className="absolute inset-0 bg-black/60"></div>
          <img
            src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/faith-lee-rg5WfuAihU8-unsplash.jpg-7BrehqsohboRsoCRh8XjJTQ8Jk7DzO.jpeg"
            alt="Black and white wardrobe with hanging clothes showing sophisticated style aesthetic"
            className="w-full h-full object-cover opacity-70"
          />
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center text-white">
              <h3 className="text-2xl md:text-3xl font-bold mb-2">Your Style Journey Starts Here</h3>
              <p className="text-lg opacity-90">Discover the perfect outfit for every occasion</p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
