"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { useAuth } from "@/hooks/useAuth"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { ArrowLeft, Send, MapPin, Sun, Cloud, CloudRain, Sparkles, User, ChevronDown, Check } from "lucide-react"

// Comprehensive list of US cities with coordinates
const US_CITIES = [
  { name: "New York, NY", lat: 40.7128, lon: -74.006 },
  { name: "Los Angeles, CA", lat: 34.0522, lon: -118.2437 },
  { name: "Chicago, IL", lat: 41.8781, lon: -87.6298 },
  { name: "Houston, TX", lat: 29.7604, lon: -95.3698 },
  { name: "Phoenix, AZ", lat: 33.4484, lon: -112.074 },
  { name: "Philadelphia, PA", lat: 39.9526, lon: -75.1652 },
  { name: "San Antonio, TX", lat: 29.4241, lon: -98.4936 },
  { name: "San Diego, CA", lat: 32.7157, lon: -117.1611 },
  { name: "Dallas, TX", lat: 32.7767, lon: -96.797 },
  { name: "San Jose, CA", lat: 37.3382, lon: -121.8863 },
  { name: "Austin, TX", lat: 30.2672, lon: -97.7431 },
  { name: "Jacksonville, FL", lat: 30.3322, lon: -81.6557 },
  { name: "Fort Worth, TX", lat: 32.7555, lon: -97.3308 },
  { name: "Columbus, OH", lat: 39.9612, lon: -82.9988 },
  { name: "Charlotte, NC", lat: 35.2271, lon: -80.8431 },
  { name: "San Francisco, CA", lat: 37.7749, lon: -122.4194 },
  { name: "Indianapolis, IN", lat: 39.7684, lon: -86.1581 },
  { name: "Seattle, WA", lat: 47.6062, lon: -122.3321 },
  { name: "Denver, CO", lat: 39.7392, lon: -104.9903 },
  { name: "Washington, DC", lat: 38.9072, lon: -77.0369 },
  { name: "Boston, MA", lat: 42.3601, lon: -71.0589 },
  { name: "El Paso, TX", lat: 31.7619, lon: -106.485 },
  { name: "Nashville, TN", lat: 36.1627, lon: -86.7816 },
  { name: "Detroit, MI", lat: 42.3314, lon: -83.0458 },
  { name: "Oklahoma City, OK", lat: 35.4676, lon: -97.5164 },
  { name: "Portland, OR", lat: 45.5152, lon: -122.6784 },
  { name: "Las Vegas, NV", lat: 36.1699, lon: -115.1398 },
  { name: "Memphis, TN", lat: 35.1495, lon: -90.049 },
  { name: "Louisville, KY", lat: 38.2527, lon: -85.7585 },
  { name: "Baltimore, MD", lat: 39.2904, lon: -76.6122 },
  { name: "Milwaukee, WI", lat: 43.0389, lon: -87.9065 },
  { name: "Albuquerque, NM", lat: 35.0844, lon: -106.6504 },
  { name: "Tucson, AZ", lat: 32.2226, lon: -110.9747 },
  { name: "Fresno, CA", lat: 36.7378, lon: -119.7871 },
  { name: "Sacramento, CA", lat: 38.5816, lon: -121.4944 },
  { name: "Mesa, AZ", lat: 33.4152, lon: -111.8315 },
  { name: "Kansas City, MO", lat: 39.0997, lon: -94.5786 },
  { name: "Atlanta, GA", lat: 33.749, lon: -84.388 },
  { name: "Long Beach, CA", lat: 33.7701, lon: -118.1937 },
  { name: "Colorado Springs, CO", lat: 38.8339, lon: -104.8214 },
  { name: "Raleigh, NC", lat: 35.7796, lon: -78.6382 },
  { name: "Miami, FL", lat: 25.7617, lon: -80.1918 },
  { name: "Virginia Beach, VA", lat: 36.8529, lon: -76.0818 },
  { name: "Omaha, NE", lat: 41.2565, lon: -95.9345 },
  { name: "Oakland, CA", lat: 37.8044, lon: -122.2711 },
  { name: "Minneapolis, MN", lat: 44.9778, lon: -93.265 },
  { name: "Tulsa, OK", lat: 36.154, lon: -95.9928 },
  { name: "Arlington, TX", lat: 32.7357, lon: -97.1081 },
  { name: "New Orleans, LA", lat: 29.9511, lon: -90.0715 },
  { name: "Wichita, KS", lat: 37.6872, lon: -97.3301 },
  { name: "Cleveland, OH", lat: 41.4993, lon: -81.6944 },
  { name: "Tampa, FL", lat: 27.9506, lon: -82.4572 },
  { name: "Bakersfield, CA", lat: 35.3733, lon: -119.0187 },
  { name: "Aurora, CO", lat: 39.7294, lon: -104.8319 },
  { name: "Anaheim, CA", lat: 33.8366, lon: -117.9143 },
  { name: "Honolulu, HI", lat: 21.3099, lon: -157.8581 },
  { name: "Santa Ana, CA", lat: 33.7455, lon: -117.8677 },
  { name: "Corpus Christi, TX", lat: 27.8006, lon: -97.3964 },
  { name: "Riverside, CA", lat: 33.9533, lon: -117.3962 },
  { name: "Lexington, KY", lat: 38.0406, lon: -84.5037 },
  { name: "Stockton, CA", lat: 37.9577, lon: -121.2908 },
  { name: "Henderson, NV", lat: 36.0397, lon: -114.9817 },
  { name: "Saint Paul, MN", lat: 44.9537, lon: -93.09 },
  { name: "St. Louis, MO", lat: 38.627, lon: -90.1994 },
  { name: "Cincinnati, OH", lat: 39.1031, lon: -84.512 },
  { name: "Pittsburgh, PA", lat: 40.4406, lon: -79.9959 },
  { name: "Greensboro, NC", lat: 36.0726, lon: -79.792 },
  { name: "Anchorage, AK", lat: 61.2181, lon: -149.9003 },
  { name: "Plano, TX", lat: 33.0198, lon: -96.6989 },
  { name: "Lincoln, NE", lat: 40.8136, lon: -96.7026 },
  { name: "Orlando, FL", lat: 28.5383, lon: -81.3792 },
  { name: "Irvine, CA", lat: 33.6846, lon: -117.8265 },
  { name: "Newark, NJ", lat: 40.7357, lon: -74.1724 },
  { name: "Durham, NC", lat: 35.994, lon: -78.8986 },
  { name: "Chula Vista, CA", lat: 32.6401, lon: -117.0842 },
  { name: "Toledo, OH", lat: 41.6528, lon: -83.5379 },
  { name: "Fort Wayne, IN", lat: 41.0793, lon: -85.1394 },
  { name: "St. Petersburg, FL", lat: 27.7676, lon: -82.6403 },
  { name: "Laredo, TX", lat: 27.5306, lon: -99.4803 },
  { name: "Jersey City, NJ", lat: 40.7178, lon: -74.0431 },
  { name: "Chandler, AZ", lat: 33.3062, lon: -111.8413 },
  { name: "Madison, WI", lat: 43.0731, lon: -89.4012 },
  { name: "Lubbock, TX", lat: 33.5779, lon: -101.8552 },
  { name: "Buffalo, NY", lat: 42.8864, lon: -78.8784 },
  { name: "Scottsdale, AZ", lat: 33.4942, lon: -111.9261 },
  { name: "Reno, NV", lat: 39.5296, lon: -119.8138 },
  { name: "Glendale, AZ", lat: 33.5387, lon: -112.186 },
  { name: "Gilbert, AZ", lat: 33.3528, lon: -111.789 },
  { name: "Winston-Salem, NC", lat: 36.0999, lon: -80.2442 },
  { name: "North Las Vegas, NV", lat: 36.1989, lon: -115.1175 },
  { name: "Norfolk, VA", lat: 36.8508, lon: -76.2859 },
  { name: "Chesapeake, VA", lat: 36.7682, lon: -76.2875 },
  { name: "Garland, TX", lat: 32.9126, lon: -96.6389 },
  { name: "Irving, TX", lat: 32.814, lon: -96.9489 },
  { name: "Hialeah, FL", lat: 25.8576, lon: -80.2781 },
  { name: "Fremont, CA", lat: 37.5485, lon: -121.9886 },
  { name: "Boise, ID", lat: 43.615, lon: -116.2023 },
  { name: "Richmond, VA", lat: 37.5407, lon: -77.436 },
  { name: "Baton Rouge, LA", lat: 30.4515, lon: -91.1871 },
  { name: "Spokane, WA", lat: 47.6587, lon: -117.426 },
  { name: "Des Moines, IA", lat: 41.5868, lon: -93.625 },
  { name: "Tacoma, WA", lat: 47.2529, lon: -122.4443 },
  { name: "San Bernardino, CA", lat: 34.1083, lon: -117.2898 },
  { name: "Modesto, CA", lat: 37.6391, lon: -120.9969 },
  { name: "Fontana, CA", lat: 34.0922, lon: -117.435 },
  { name: "Santa Clarita, CA", lat: 34.3917, lon: -118.5426 },
  { name: "Birmingham, AL", lat: 33.5207, lon: -86.8025 },
  { name: "Oxnard, CA", lat: 34.1975, lon: -119.1771 },
  { name: "Fayetteville, NC", lat: 35.0527, lon: -78.8784 },
  { name: "Moreno Valley, CA", lat: 33.9425, lon: -117.2297 },
  { name: "Akron, OH", lat: 41.0814, lon: -81.519 },
  { name: "Huntington Beach, CA", lat: 33.6603, lon: -117.9992 },
  { name: "Little Rock, AR", lat: 34.7465, lon: -92.2896 },
  { name: "Augusta, GA", lat: 33.4735, lon: -82.0105 },
  { name: "Amarillo, TX", lat: 35.222, lon: -101.8313 },
  { name: "Glendale, CA", lat: 34.1425, lon: -118.2551 },
  { name: "Mobile, AL", lat: 30.6954, lon: -88.0399 },
  { name: "Grand Rapids, MI", lat: 42.9634, lon: -85.6681 },
  { name: "Salt Lake City, UT", lat: 40.7608, lon: -111.891 },
  { name: "Tallahassee, FL", lat: 30.4518, lon: -84.2807 },
  { name: "Huntsville, AL", lat: 34.7304, lon: -86.5861 },
  { name: "Grand Prairie, TX", lat: 32.746, lon: -96.9978 },
  { name: "Knoxville, TN", lat: 35.9606, lon: -83.9207 },
  { name: "Worcester, MA", lat: 42.2626, lon: -71.8023 },
  { name: "Newport News, VA", lat: 37.0871, lon: -76.473 },
  { name: "Brownsville, TX", lat: 25.9018, lon: -97.4975 },
  { name: "Overland Park, KS", lat: 38.9822, lon: -94.6708 },
  { name: "Santa Rosa, CA", lat: 38.4404, lon: -122.7144 },
  { name: "Peoria, AZ", lat: 33.5806, lon: -112.2374 },
  { name: "Oceanside, CA", lat: 33.1959, lon: -117.3795 },
  { name: "Pembroke Pines, FL", lat: 26.007, lon: -80.2962 },
  { name: "Elk Grove, CA", lat: 38.4088, lon: -121.3716 },
  { name: "Salem, OR", lat: 44.9429, lon: -123.0351 },
  { name: "Eugene, OR", lat: 44.0521, lon: -123.0868 },
  { name: "Garden Grove, CA", lat: 33.7739, lon: -117.9415 },
  { name: "Cary, NC", lat: 35.7915, lon: -78.7811 },
  { name: "Fort Lauderdale, FL", lat: 26.1224, lon: -80.1373 },
  { name: "Corona, CA", lat: 33.8753, lon: -117.5664 },
  { name: "Springfield, MO", lat: 37.2153, lon: -93.2982 },
  { name: "Jackson, MS", lat: 32.2988, lon: -90.1848 },
  { name: "Alexandria, VA", lat: 38.8048, lon: -77.0469 },
  { name: "Hayward, CA", lat: 37.6688, lon: -122.0808 },
  { name: "Clarksville, TN", lat: 36.5298, lon: -87.3595 },
  { name: "Lakewood, CO", lat: 39.7047, lon: -105.0814 },
  { name: "Lancaster, CA", lat: 34.6868, lon: -118.1542 },
  { name: "Salinas, CA", lat: 36.6777, lon: -121.6555 },
  { name: "Palmdale, CA", lat: 34.5794, lon: -118.1165 },
  { name: "Hollywood, FL", lat: 26.0112, lon: -80.1495 },
  { name: "Springfield, MA", lat: 42.1015, lon: -72.5898 },
  { name: "Macon, GA", lat: 32.8407, lon: -83.6324 },
  { name: "Kansas City, KS", lat: 39.1142, lon: -94.6275 },
  { name: "Sunnyvale, CA", lat: 37.3688, lon: -122.0363 },
  { name: "Pomona, CA", lat: 34.0552, lon: -117.75 },
  { name: "Killeen, TX", lat: 31.1171, lon: -97.7278 },
  { name: "Escondido, CA", lat: 33.1192, lon: -117.0864 },
  { name: "Pasadena, TX", lat: 29.6911, lon: -95.2091 },
  { name: "Naperville, IL", lat: 41.7508, lon: -88.1535 },
  { name: "Bellevue, WA", lat: 47.6101, lon: -122.2015 },
  { name: "Joliet, IL", lat: 41.525, lon: -88.0817 },
  { name: "Murfreesboro, TN", lat: 35.8456, lon: -86.3903 },
  { name: "Rockford, IL", lat: 42.2711, lon: -89.094 },
  { name: "Paterson, NJ", lat: 40.9168, lon: -74.1718 },
  { name: "Torrance, CA", lat: 33.8358, lon: -118.3406 },
  { name: "Bridgeport, CT", lat: 41.1865, lon: -73.1952 },
  { name: "Mesquite, TX", lat: 32.7668, lon: -96.5991 },
  { name: "Syracuse, NY", lat: 43.0481, lon: -76.1474 },
  { name: "McAllen, TX", lat: 26.2034, lon: -98.23 },
  { name: "Pasadena, CA", lat: 34.1478, lon: -118.1445 },
  { name: "Orange, CA", lat: 33.7879, lon: -117.8531 },
  { name: "Dayton, OH", lat: 39.7589, lon: -84.1916 },
  { name: "Fullerton, CA", lat: 33.8704, lon: -117.9242 },
  { name: "Savannah, GA", lat: 32.0835, lon: -81.0998 },
  { name: "Cedar Rapids, IA", lat: 41.9778, lon: -91.6656 },
  { name: "Stamford, CT", lat: 41.0534, lon: -73.5387 },
]

interface WeatherData {
  temperature: number
  description: string
  humidity: number
  windSpeed: number
  icon: string
}

interface Message {
  id: string
  text: string
  isUser: boolean
  timestamp: Date
}

export default function ChatPage() {
  const { user, loading } = useAuth()
  const router = useRouter()
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      text: "Hi! I'm your AI Style Assistant. I can help you pick the perfect outfit based on the weather, occasion, and your wardrobe. What would you like help with today?",
      isUser: false,
      timestamp: new Date(),
    },
  ])
  const [inputMessage, setInputMessage] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  // Weather state
  const [selectedCity, setSelectedCity] = useState(US_CITIES[0])
  const [weatherData, setWeatherData] = useState<WeatherData | null>(null)
  const [weatherLoading, setWeatherLoading] = useState(false)
  const [cityDropdownOpen, setCityDropdownOpen] = useState(false)

  // Redirect if not authenticated
  useEffect(() => {
    if (!loading && !user) {
      router.push("/auth")
    }
  }, [user, loading, router])

  // Fetch weather data
  const fetchWeatherData = async (city: (typeof US_CITIES)[0]) => {
    setWeatherLoading(true)
    try {
      const response = await fetch(
        `https://api.openweathermap.org/data/2.5/weather?lat=${city.lat}&lon=${city.lon}&appid=3354ce372409b8a76d8a8643d70115ae&units=imperial`,
      )

      if (!response.ok) {
        throw new Error(`Weather API error: ${response.status}`)
      }

      const data = await response.json()

      setWeatherData({
        temperature: Math.round(data.main.temp),
        description: data.weather[0].description,
        humidity: data.main.humidity,
        windSpeed: Math.round(data.wind.speed),
        icon: data.weather[0].main,
      })
    } catch (error) {
      console.error("Error fetching weather:", error)
      setWeatherData(null)
    } finally {
      setWeatherLoading(false)
    }
  }

  // Fetch weather when city changes
  useEffect(() => {
    fetchWeatherData(selectedCity)
  }, [selectedCity])

  // Auto scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  const getWeatherIcon = (iconType: string) => {
    switch (iconType.toLowerCase()) {
      case "clear":
      case "sunny":
        return <Sun className="w-5 h-5 text-yellow-400" />
      case "rain":
      case "drizzle":
        return <CloudRain className="w-5 h-5 text-blue-400" />
      case "clouds":
      case "cloudy":
      default:
        return <Cloud className="w-5 h-5 text-gray-400" />
    }
  }

  const handleSendMessage = async () => {
    if (!inputMessage.trim()) return

    const userMessage: Message = {
      id: Date.now().toString(),
      text: inputMessage,
      isUser: true,
      timestamp: new Date(),
    }

    setMessages((prev) => [...prev, userMessage])
    setInputMessage("")
    setIsLoading(true)

    try {
      // Include weather context in the message
      const weatherContext = weatherData
        ? `Current weather in ${selectedCity.name}: ${weatherData.temperature}°F, ${weatherData.description}, ${weatherData.humidity}% humidity, ${weatherData.windSpeed} mph wind.`
        : ""

      const response = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message: inputMessage,
          weatherContext,
          userId: user?.id,
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to get response")
      }

      const data = await response.json()

      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: data.response || "Sorry, I encountered an error. Please try again.",
        isUser: false,
        timestamp: new Date(),
      }

      setMessages((prev) => [...prev, aiMessage])
    } catch (error) {
      console.error("Error sending message:", error)
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: "Sorry, I encountered an error. Please try again.",
        isUser: false,
        timestamp: new Date(),
      }
      setMessages((prev) => [...prev, errorMessage])
    } finally {
      setIsLoading(false)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center">
        <div className="text-white">Loading...</div>
      </div>
    )
  }

  if (!user) {
    return null
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white">
      {/* Navigation */}
      <nav className="border-b border-gray-700 bg-gray-800/40 backdrop-blur-sm">
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
              <Link href="/chat" className="text-white font-medium">
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
                onClick={() => {
                  // Handle logout
                  router.push("/auth")
                }}
                className="bg-white text-black hover:bg-gray-100"
              >
                Logout
              </Button>
            </div>
          </div>
        </div>
      </nav>

      {/* Weather Section */}
      <div className="border-b border-gray-700 bg-gray-800/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              {/* City Selector */}
              <Popover open={cityDropdownOpen} onOpenChange={setCityDropdownOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={cityDropdownOpen}
                    className="w-[200px] justify-between bg-gray-700 border-gray-600 text-white hover:bg-gray-600"
                  >
                    <div className="flex items-center space-x-2">
                      <MapPin className="w-4 h-4" />
                      <span className="truncate">{selectedCity.name}</span>
                    </div>
                    <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-[300px] p-0 bg-gray-700 border-gray-600">
                  <Command className="bg-gray-700">
                    <CommandInput placeholder="Search cities..." className="text-white placeholder:text-gray-400" />
                    <CommandEmpty className="text-gray-400 p-4">No city found.</CommandEmpty>
                    <CommandGroup className="max-h-[300px] overflow-y-auto">
                      <CommandList>
                        {US_CITIES.map((city) => (
                          <CommandItem
                            key={city.name}
                            value={city.name}
                            onSelect={() => {
                              setSelectedCity(city)
                              setCityDropdownOpen(false)
                            }}
                            className="text-white hover:bg-gray-600 cursor-pointer"
                          >
                            <Check
                              className={`mr-2 h-4 w-4 ${
                                selectedCity.name === city.name ? "opacity-100" : "opacity-0"
                              }`}
                            />
                            {city.name}
                          </CommandItem>
                        ))}
                      </CommandList>
                    </CommandGroup>
                  </Command>
                </PopoverContent>
              </Popover>

              {/* Weather Display */}
              <div className="flex items-center space-x-3">
                {weatherLoading ? (
                  <div className="text-gray-400">Loading weather...</div>
                ) : weatherData ? (
                  <>
                    {getWeatherIcon(weatherData.icon)}
                    <div className="overflow-hidden">
                      <div className="animate-scroll whitespace-nowrap text-sm text-gray-300">
                        {weatherData.temperature}°F • {weatherData.description} • Humidity: {weatherData.humidity}% •
                        Wind: {weatherData.windSpeed} mph
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="text-red-400 text-sm">Weather unavailable</div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Back to Home Button */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <Link href="/home">
          <Button variant="outline" className="bg-gray-700 border-gray-600 text-white hover:bg-gray-600">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Home
          </Button>
        </Link>
      </div>

      {/* Chat Interface */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pb-8">
        {/* Chat Header */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Sparkles className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold mb-2">AI Style Assistant</h1>
          <p className="text-gray-400">
            Get personalized outfit recommendations based on weather, occasion, and your wardrobe
          </p>
        </div>

        {/* Messages */}
        <div className="space-y-4 mb-6 max-h-[500px] overflow-y-auto">
          {messages.map((message) => (
            <div key={message.id} className={`flex ${message.isUser ? "justify-end" : "justify-start"}`}>
              <div
                className={`max-w-[80%] p-4 rounded-2xl ${
                  message.isUser ? "bg-white text-black" : "bg-gray-700 text-white"
                }`}
              >
                <p className="text-sm">{message.text}</p>
                <p className="text-xs opacity-60 mt-2">
                  {message.timestamp.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                </p>
              </div>
            </div>
          ))}
          {isLoading && (
            <div className="flex justify-start">
              <div className="bg-gray-700 text-white p-4 rounded-2xl">
                <div className="flex space-x-1">
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                  <div
                    className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                    style={{ animationDelay: "0.1s" }}
                  ></div>
                  <div
                    className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                    style={{ animationDelay: "0.2s" }}
                  ></div>
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div className="flex space-x-2">
          <Input
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Ask me about outfit recommendations..."
            className="flex-1 bg-gray-700 border-gray-600 text-white placeholder:text-gray-400 focus:border-white"
            disabled={isLoading}
          />
          <Button
            onClick={handleSendMessage}
            disabled={isLoading || !inputMessage.trim()}
            className="bg-white text-black hover:bg-gray-100"
          >
            <Send className="w-4 h-4" />
          </Button>
        </div>
      </div>

      <style jsx>{`
        @keyframes scroll {
          0% { transform: translateX(100%); }
          100% { transform: translateX(-100%); }
        }
        .animate-scroll {
          animation: scroll 15s linear infinite;
        }
      `}</style>
    </div>
  )
}
