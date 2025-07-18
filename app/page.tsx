"use client"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Send,
  Sparkles,
  Eye,
  MapPin,
  AlertCircle,
  ExternalLink,
  Database,
  Palette,
  ArrowRight,
  Zap,
  Shield,
  Brain,
  Cloud,
  CheckCircle,
  Play,
} from "lucide-react"
import Link from "next/link"
import { useChat } from "ai/react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/hooks/useAuth"



interface OutfitRecommendation {
  items: string[]
  occasion: string
  weather: string
  totalValue?: string
  reasoning?: string
  similarItems: Array<{
    name: string
    price: string
    store: string
    image: string
  }>
}

interface WeatherData {
  temperature: number
  condition: string
  description: string
  humidity: number
  windSpeed: number
  icon: string
}

// Mock similar items from online stores
const getSimilarItems = (category: string) => {
  const similarItems = {
    dresses: [
      {
        name: "Elegant Black Dress",
        price: "$89.99",
        store: "Fashion Store",
        image: "/images/product-placeholder.jpg",
      },
      {
        name: "Classic Evening Gown",
        price: "$129.99",
        store: "Style Boutique",
        image: "/images/product-placeholder.jpg",
      },
    ],
    tops: [
      { name: "Premium Cotton Tee", price: "$24.99", store: "Basics Co", image: "/images/product-placeholder.jpg" },
      {
        name: "Organic Cotton Top",
        price: "$32.99",
        store: "Eco Fashion",
        image: "/images/product-placeholder.jpg",
      },
    ],
    bottoms: [
      { name: "Designer Jeans", price: "$79.99", store: "Denim World", image: "/images/product-placeholder.jpg" },
      {
        name: "Classic Fit Jeans",
        price: "$49.99",
        store: "Casual Wear",
        image: "/images/product-placeholder.jpg",
      },
    ],
    outerwear: [
      { name: "Wool Blazer", price: "$149.99", store: "Professional", image: "/images/product-placeholder.jpg" },
      {
        name: "Leather Jacket",
        price: "$199.99",
        store: "Urban Style",
        image: "/images/product-placeholder.jpg",
      },
    ],
    shoes: [
      { name: "Leather Boots", price: "$159.99", store: "Shoe Store", image: "/images/product-placeholder.jpg" },
      { name: "Casual Sneakers", price: "$89.99", store: "Sports Shop", image: "/images/product-placeholder.jpg" },
    ],
    accessories: [
      { name: "Gold Necklace", price: "$199.99", store: "Jewelry Co", image: "/images/product-placeholder.jpg" },
      {
        name: "Designer Sunglasses",
        price: "$149.99",
        store: "Eyewear Plus",
        image: "/images/product-placeholder.jpg",
      },
    ],
  }

  return similarItems[category as keyof typeof similarItems] || []
}

const usCities = [
  // Alabama
  { value: "birmingham-al", label: "Birmingham, AL", coords: { lat: 33.5186, lon: -86.8104 }, state: "Alabama" },
  { value: "montgomery-al", label: "Montgomery, AL", coords: { lat: 32.3668, lon: -86.3000 }, state: "Alabama" },
  { value: "mobile-al", label: "Mobile, AL", coords: { lat: 30.6954, lon: -88.0399 }, state: "Alabama" },
  
  // Alaska
  { value: "anchorage-ak", label: "Anchorage, AK", coords: { lat: 61.2181, lon: -149.9003 }, state: "Alaska" },
  { value: "fairbanks-ak", label: "Fairbanks, AK", coords: { lat: 64.8378, lon: -147.7164 }, state: "Alaska" },
  
  // Arizona
  { value: "phoenix-az", label: "Phoenix, AZ", coords: { lat: 33.4484, lon: -112.074 }, state: "Arizona" },
  { value: "tucson-az", label: "Tucson, AZ", coords: { lat: 32.2226, lon: -110.9747 }, state: "Arizona" },
  { value: "mesa-az", label: "Mesa, AZ", coords: { lat: 33.4152, lon: -111.8315 }, state: "Arizona" },
  { value: "scottsdale-az", label: "Scottsdale, AZ", coords: { lat: 33.4942, lon: -111.9261 }, state: "Arizona" },
  
  // Arkansas
  { value: "little-rock-ar", label: "Little Rock, AR", coords: { lat: 34.7465, lon: -92.2896 }, state: "Arkansas" },
  { value: "fort-smith-ar", label: "Fort Smith, AR", coords: { lat: 35.3859, lon: -94.3985 }, state: "Arkansas" },
  
  // California
  { value: "los-angeles-ca", label: "Los Angeles, CA", coords: { lat: 34.0522, lon: -118.2437 }, state: "California" },
  { value: "san-francisco-ca", label: "San Francisco, CA", coords: { lat: 37.7749, lon: -122.4194 }, state: "California" },
  { value: "san-diego-ca", label: "San Diego, CA", coords: { lat: 32.7157, lon: -117.1611 }, state: "California" },
  { value: "san-jose-ca", label: "San Jose, CA", coords: { lat: 37.3382, lon: -121.8863 }, state: "California" },
  { value: "sacramento-ca", label: "Sacramento, CA", coords: { lat: 38.5816, lon: -121.4944 }, state: "California" },
  { value: "oakland-ca", label: "Oakland, CA", coords: { lat: 37.8044, lon: -122.2712 }, state: "California" },
  { value: "fresno-ca", label: "Fresno, CA", coords: { lat: 36.7378, lon: -119.7871 }, state: "California" },
  { value: "long-beach-ca", label: "Long Beach, CA", coords: { lat: 33.7701, lon: -118.1937 }, state: "California" },
  
  // Colorado
  { value: "denver-co", label: "Denver, CO", coords: { lat: 39.7392, lon: -104.9903 }, state: "Colorado" },
  { value: "colorado-springs-co", label: "Colorado Springs, CO", coords: { lat: 38.8339, lon: -104.8214 }, state: "Colorado" },
  { value: "aurora-co", label: "Aurora, CO", coords: { lat: 39.7294, lon: -104.8319 }, state: "Colorado" },
  
  // Connecticut
  { value: "bridgeport-ct", label: "Bridgeport, CT", coords: { lat: 41.1865, lon: -73.1952 }, state: "Connecticut" },
  { value: "new-haven-ct", label: "New Haven, CT", coords: { lat: 41.3083, lon: -72.9279 }, state: "Connecticut" },
  { value: "hartford-ct", label: "Hartford, CT", coords: { lat: 41.7658, lon: -72.6734 }, state: "Connecticut" },
  
  // Delaware
  { value: "wilmington-de", label: "Wilmington, DE", coords: { lat: 39.7391, lon: -75.5398 }, state: "Delaware" },
  { value: "dover-de", label: "Dover, DE", coords: { lat: 39.1612, lon: -75.5264 }, state: "Delaware" },
  
  // Florida
  { value: "miami-fl", label: "Miami, FL", coords: { lat: 25.7617, lon: -80.1918 }, state: "Florida" },
  { value: "orlando-fl", label: "Orlando, FL", coords: { lat: 28.5383, lon: -81.3792 }, state: "Florida" },
  { value: "tampa-fl", label: "Tampa, FL", coords: { lat: 27.9506, lon: -82.4572 }, state: "Florida" },
  { value: "jacksonville-fl", label: "Jacksonville, FL", coords: { lat: 30.3322, lon: -81.6557 }, state: "Florida" },
  { value: "fort-lauderdale-fl", label: "Fort Lauderdale, FL", coords: { lat: 26.1224, lon: -80.1373 }, state: "Florida" },
  
  // Georgia
  { value: "atlanta-ga", label: "Atlanta, GA", coords: { lat: 33.749, lon: -84.388 }, state: "Georgia" },
  { value: "augusta-ga", label: "Augusta, GA", coords: { lat: 33.4735, lon: -82.0105 }, state: "Georgia" },
  { value: "savannah-ga", label: "Savannah, GA", coords: { lat: 32.0835, lon: -81.0998 }, state: "Georgia" },
  
  // Hawaii
  { value: "honolulu-hi", label: "Honolulu, HI", coords: { lat: 21.3099, lon: -157.8581 }, state: "Hawaii" },
  
  // Idaho
  { value: "boise-id", label: "Boise, ID", coords: { lat: 43.6150, lon: -116.2023 }, state: "Idaho" },
  
  // Illinois
  { value: "chicago-il", label: "Chicago, IL", coords: { lat: 41.8781, lon: -87.6298 }, state: "Illinois" },
  { value: "aurora-il", label: "Aurora, IL", coords: { lat: 41.7606, lon: -88.3201 }, state: "Illinois" },
  { value: "peoria-il", label: "Peoria, IL", coords: { lat: 40.6936, lon: -89.5890 }, state: "Illinois" },
  
  // Indiana
  { value: "indianapolis-in", label: "Indianapolis, IN", coords: { lat: 39.7684, lon: -86.1581 }, state: "Indiana" },
  { value: "fort-wayne-in", label: "Fort Wayne, IN", coords: { lat: 41.0793, lon: -85.1394 }, state: "Indiana" },
  
  // Iowa
  { value: "des-moines-ia", label: "Des Moines, IA", coords: { lat: 41.5868, lon: -93.6250 }, state: "Iowa" },
  { value: "cedar-rapids-ia", label: "Cedar Rapids, IA", coords: { lat: 41.9778, lon: -91.6656 }, state: "Iowa" },
  
  // Kansas
  { value: "wichita-ks", label: "Wichita, KS", coords: { lat: 37.6872, lon: -97.3301 }, state: "Kansas" },
  { value: "overland-park-ks", label: "Overland Park, KS", coords: { lat: 38.9822, lon: -94.6708 }, state: "Kansas" },
  
  // Kentucky
  { value: "louisville-ky", label: "Louisville, KY", coords: { lat: 38.2527, lon: -85.7585 }, state: "Kentucky" },
  { value: "lexington-ky", label: "Lexington, KY", coords: { lat: 38.0406, lon: -84.5037 }, state: "Kentucky" },
  
  // Louisiana
  { value: "new-orleans-la", label: "New Orleans, LA", coords: { lat: 29.9511, lon: -90.0715 }, state: "Louisiana" },
  { value: "baton-rouge-la", label: "Baton Rouge, LA", coords: { lat: 30.4515, lon: -91.1871 }, state: "Louisiana" },
  
  // Maine
  { value: "portland-me", label: "Portland, ME", coords: { lat: 43.6591, lon: -70.2568 }, state: "Maine" },
  
  // Maryland
  { value: "baltimore-md", label: "Baltimore, MD", coords: { lat: 39.2904, lon: -76.6122 }, state: "Maryland" },
  { value: "annapolis-md", label: "Annapolis, MD", coords: { lat: 38.9784, lon: -76.4951 }, state: "Maryland" },
  
  // Massachusetts
  { value: "boston-ma", label: "Boston, MA", coords: { lat: 42.3601, lon: -71.0589 }, state: "Massachusetts" },
  { value: "worcester-ma", label: "Worcester, MA", coords: { lat: 42.2626, lon: -71.8023 }, state: "Massachusetts" },
  { value: "springfield-ma", label: "Springfield, MA", coords: { lat: 42.1015, lon: -72.5898 }, state: "Massachusetts" },
  
  // Michigan
  { value: "detroit-mi", label: "Detroit, MI", coords: { lat: 42.3314, lon: -83.0458 }, state: "Michigan" },
  { value: "grand-rapids-mi", label: "Grand Rapids, MI", coords: { lat: 42.9634, lon: -85.6681 }, state: "Michigan" },
  
  // Minnesota
  { value: "minneapolis-mn", label: "Minneapolis, MN", coords: { lat: 44.9778, lon: -93.2650 }, state: "Minnesota" },
  { value: "saint-paul-mn", label: "Saint Paul, MN", coords: { lat: 44.9537, lon: -93.0900 }, state: "Minnesota" },
  
  // Mississippi
  { value: "jackson-ms", label: "Jackson, MS", coords: { lat: 32.2988, lon: -90.1848 }, state: "Mississippi" },
  
  // Missouri
  { value: "kansas-city-mo", label: "Kansas City, MO", coords: { lat: 39.0997, lon: -94.5786 }, state: "Missouri" },
  { value: "saint-louis-mo", label: "Saint Louis, MO", coords: { lat: 38.6270, lon: -90.1994 }, state: "Missouri" },
  
  // Montana
  { value: "billings-mt", label: "Billings, MT", coords: { lat: 45.7833, lon: -108.5007 }, state: "Montana" },
  
  // Nebraska
  { value: "omaha-ne", label: "Omaha, NE", coords: { lat: 41.2565, lon: -95.9345 }, state: "Nebraska" },
  { value: "lincoln-ne", label: "Lincoln, NE", coords: { lat: 40.8136, lon: -96.7026 }, state: "Nebraska" },
  
  // Nevada
  { value: "las-vegas-nv", label: "Las Vegas, NV", coords: { lat: 36.1699, lon: -115.1398 }, state: "Nevada" },
  { value: "reno-nv", label: "Reno, NV", coords: { lat: 39.5296, lon: -119.8138 }, state: "Nevada" },
  
  // New Hampshire
  { value: "manchester-nh", label: "Manchester, NH", coords: { lat: 42.9956, lon: -71.4548 }, state: "New Hampshire" },
  
  // New Jersey
  { value: "newark-nj", label: "Newark, NJ", coords: { lat: 40.7357, lon: -74.1724 }, state: "New Jersey" },
  { value: "jersey-city-nj", label: "Jersey City, NJ", coords: { lat: 40.7178, lon: -74.0431 }, state: "New Jersey" },
  
  // New Mexico
  { value: "albuquerque-nm", label: "Albuquerque, NM", coords: { lat: 35.0844, lon: -106.6504 }, state: "New Mexico" },
  { value: "santa-fe-nm", label: "Santa Fe, NM", coords: { lat: 35.6870, lon: -105.9378 }, state: "New Mexico" },
  
  // New York
  { value: "new-york-ny", label: "New York, NY", coords: { lat: 40.7128, lon: -74.006 }, state: "New York" },
  { value: "buffalo-ny", label: "Buffalo, NY", coords: { lat: 42.8864, lon: -78.8784 }, state: "New York" },
  { value: "rochester-ny", label: "Rochester, NY", coords: { lat: 43.1566, lon: -77.6088 }, state: "New York" },
  { value: "syracuse-ny", label: "Syracuse, NY", coords: { lat: 43.0481, lon: -76.1474 }, state: "New York" },
  { value: "albany-ny", label: "Albany, NY", coords: { lat: 42.6526, lon: -73.7562 }, state: "New York" },
  
  // North Carolina
  { value: "charlotte-nc", label: "Charlotte, NC", coords: { lat: 35.2271, lon: -80.8431 }, state: "North Carolina" },
  { value: "raleigh-nc", label: "Raleigh, NC", coords: { lat: 35.7796, lon: -78.6382 }, state: "North Carolina" },
  { value: "greensboro-nc", label: "Greensboro, NC", coords: { lat: 36.0726, lon: -79.7920 }, state: "North Carolina" },
  
  // North Dakota
  { value: "fargo-nd", label: "Fargo, ND", coords: { lat: 46.8772, lon: -96.7898 }, state: "North Dakota" },
  
  // Ohio
  { value: "columbus-oh", label: "Columbus, OH", coords: { lat: 39.9612, lon: -82.9988 }, state: "Ohio" },
  { value: "cleveland-oh", label: "Cleveland, OH", coords: { lat: 41.4993, lon: -81.6944 }, state: "Ohio" },
  { value: "cincinnati-oh", label: "Cincinnati, OH", coords: { lat: 39.1031, lon: -84.5120 }, state: "Ohio" },
  
  // Oklahoma
  { value: "oklahoma-city-ok", label: "Oklahoma City, OK", coords: { lat: 35.4676, lon: -97.5164 }, state: "Oklahoma" },
  { value: "tulsa-ok", label: "Tulsa, OK", coords: { lat: 36.1540, lon: -95.9928 }, state: "Oklahoma" },
  
  // Oregon
  { value: "portland-or", label: "Portland, OR", coords: { lat: 45.5152, lon: -122.6784 }, state: "Oregon" },
  { value: "eugene-or", label: "Eugene, OR", coords: { lat: 44.0521, lon: -123.0868 }, state: "Oregon" },
  
  // Pennsylvania
  { value: "philadelphia-pa", label: "Philadelphia, PA", coords: { lat: 39.9526, lon: -75.1652 }, state: "Pennsylvania" },
  { value: "pittsburgh-pa", label: "Pittsburgh, PA", coords: { lat: 40.4406, lon: -79.9959 }, state: "Pennsylvania" },
  { value: "allentown-pa", label: "Allentown, PA", coords: { lat: 40.6023, lon: -75.4714 }, state: "Pennsylvania" },
  
  // Rhode Island
  { value: "providence-ri", label: "Providence, RI", coords: { lat: 41.8240, lon: -71.4128 }, state: "Rhode Island" },
  
  // South Carolina
  { value: "charleston-sc", label: "Charleston, SC", coords: { lat: 32.7765, lon: -79.9311 }, state: "South Carolina" },
  { value: "columbia-sc", label: "Columbia, SC", coords: { lat: 34.0007, lon: -81.0348 }, state: "South Carolina" },
  
  // South Dakota
  { value: "sioux-falls-sd", label: "Sioux Falls, SD", coords: { lat: 43.5446, lon: -96.7311 }, state: "South Dakota" },
  
  // Tennessee
  { value: "nashville-tn", label: "Nashville, TN", coords: { lat: 36.1627, lon: -86.7816 }, state: "Tennessee" },
  { value: "memphis-tn", label: "Memphis, TN", coords: { lat: 35.1495, lon: -90.0490 }, state: "Tennessee" },
  { value: "knoxville-tn", label: "Knoxville, TN", coords: { lat: 35.9606, lon: -83.9207 }, state: "Tennessee" },
  
  // Texas
  { value: "houston-tx", label: "Houston, TX", coords: { lat: 29.7604, lon: -95.3698 }, state: "Texas" },
  { value: "san-antonio-tx", label: "San Antonio, TX", coords: { lat: 29.4241, lon: -98.4936 }, state: "Texas" },
  { value: "dallas-tx", label: "Dallas, TX", coords: { lat: 32.7767, lon: -96.797 }, state: "Texas" },
  { value: "austin-tx", label: "Austin, TX", coords: { lat: 30.2672, lon: -97.7431 }, state: "Texas" },
  { value: "fort-worth-tx", label: "Fort Worth, TX", coords: { lat: 32.7555, lon: -97.3308 }, state: "Texas" },
  { value: "el-paso-tx", label: "El Paso, TX", coords: { lat: 31.7619, lon: -106.4850 }, state: "Texas" },
  
  // Utah
  { value: "salt-lake-city-ut", label: "Salt Lake City, UT", coords: { lat: 40.7608, lon: -111.8910 }, state: "Utah" },
  
  // Vermont
  { value: "burlington-vt", label: "Burlington, VT", coords: { lat: 44.4759, lon: -73.2121 }, state: "Vermont" },
  
  // Virginia
  { value: "virginia-beach-va", label: "Virginia Beach, VA", coords: { lat: 36.8529, lon: -75.9780 }, state: "Virginia" },
  { value: "norfolk-va", label: "Norfolk, VA", coords: { lat: 36.8468, lon: -76.2852 }, state: "Virginia" },
  { value: "richmond-va", label: "Richmond, VA", coords: { lat: 37.5407, lon: -77.4360 }, state: "Virginia" },
  
  // Washington
  { value: "seattle-wa", label: "Seattle, WA", coords: { lat: 47.6062, lon: -122.3321 }, state: "Washington" },
  { value: "spokane-wa", label: "Spokane, WA", coords: { lat: 47.6587, lon: -117.4260 }, state: "Washington" },
  { value: "tacoma-wa", label: "Tacoma, WA", coords: { lat: 47.2529, lon: -122.4443 }, state: "Washington" },
  
  // West Virginia
  { value: "charleston-wv", label: "Charleston, WV", coords: { lat: 38.3498, lon: -81.6326 }, state: "West Virginia" },
  
  // Wisconsin
  { value: "milwaukee-wi", label: "Milwaukee, WI", coords: { lat: 43.0389, lon: -87.9065 }, state: "Wisconsin" },
  { value: "madison-wi", label: "Madison, WI", coords: { lat: 43.0731, lon: -89.4012 }, state: "Wisconsin" },
  
  // Wyoming
  { value: "cheyenne-wy", label: "Cheyenne, WY", coords: { lat: 41.1400, lon: -104.8197 }, state: "Wyoming" },
]

// Group cities by state for better organization
const citiesByState = usCities.reduce((acc, city) => {
  if (!acc[city.state]) {
    acc[city.state] = []
  }
  acc[city.state].push(city)
  return acc
}, {} as Record<string, typeof usCities>)

// Popular cities for quick access
const popularCities = [
  "new-york-ny", "los-angeles-ca", "chicago-il", "houston-tx", "phoenix-az",
  "philadelphia-pa", "san-antonio-tx", "san-diego-ca", "dallas-tx", "san-jose-ca",
  "austin-tx", "jacksonville-fl", "fort-worth-tx", "columbus-oh", "charlotte-nc",
  "san-francisco-ca", "indianapolis-in", "seattle-wa", "denver-co", "boston-ma"
].map(value => usCities.find(city => city.value === value)).filter(Boolean)

// Enhanced helper function to extract JSON from text with better markdown handling
const extractOutfitRecommendation = (text: string): OutfitRecommendation | null => {
  try {
    if (!text.includes("OUTFIT_RECOMMENDATION:")) {
      return null
    }

    const jsonStart = text.indexOf("OUTFIT_RECOMMENDATION:") + "OUTFIT_RECOMMENDATION:".length
    let jsonPart = text.substring(jsonStart).trim()

    if (jsonPart.startsWith("```json")) {
      jsonPart = jsonPart.substring(7).trim()
    } else if (jsonPart.startsWith("```")) {
      jsonPart = jsonPart.substring(3).trim()
    }

    const codeBlockEnd = jsonPart.indexOf("```")
    if (codeBlockEnd !== -1) {
      jsonPart = jsonPart.substring(0, codeBlockEnd).trim()
    }

    let braceCount = 0
    let jsonEnd = -1
    let inString = false
    let escapeNext = false

    for (let i = 0; i < jsonPart.length; i++) {
      const char = jsonPart[i]

      if (escapeNext) {
        escapeNext = false
        continue
      }

      if (char === "\\") {
        escapeNext = true
        continue
      }

      if (char === '"') {
        inString = !inString
        continue
      }

      if (!inString) {
        if (char === "{") {
          braceCount++
        } else if (char === "}") {
          braceCount--
          if (braceCount === 0) {
            jsonEnd = i + 1
            break
          }
        }
      }
    }

    let jsonString = jsonPart
    if (jsonEnd !== -1) {
      jsonString = jsonPart.substring(0, jsonEnd)
    }

    const recommendation = JSON.parse(jsonString)

    if (recommendation.items && recommendation.items.length > 0) {
      // For demo purposes, we'll show a generic wardrobe item
      const firstItem = { name: recommendation.items[0], category: "clothing" }

      const category = firstItem?.category || "dresses"
      recommendation.similarItems = getSimilarItems(category)
    }

    return recommendation
  } catch (error) {
    console.error("Error parsing outfit recommendation:", error)
    return null
  }
}

// Helper function to find wardrobe item by name (simplified for demo)
const findWardrobeItemByName = (itemName: string) => {
  return { name: itemName, category: "clothing" }
}

// Animated counter component
const AnimatedCounter = ({ end, duration = 2000 }: { end: number; duration?: number }) => {
  const [count, setCount] = useState(0)
  const countRef = useRef<HTMLSpanElement>(null)

  useEffect(() => {
    let startTime: number
    let animationFrame: number

    const animate = (timestamp: number) => {
      if (!startTime) startTime = timestamp
      const progress = Math.min((timestamp - startTime) / duration, 1)

      setCount(Math.floor(progress * end))

      if (progress < 1) {
        animationFrame = requestAnimationFrame(animate)
      }
    }

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          animationFrame = requestAnimationFrame(animate)
          observer.disconnect()
        }
      },
      { threshold: 0.1 },
    )

    if (countRef.current) {
      observer.observe(countRef.current)
    }

    return () => {
      if (animationFrame) {
        cancelAnimationFrame(animationFrame)
      }
      observer.disconnect()
    }
  }, [end, duration])

  return <span ref={countRef}>{count}</span>
}

export default function HomePage() {
  // ALL HOOKS MUST BE AT THE VERY TOP - BEFORE ANY CONDITIONAL LOGIC
  const router = useRouter()
  const { user, loading, signOut } = useAuth()
  
  const [selectedLocation, setSelectedLocation] = useState("chicago-il")
  const [weatherData, setWeatherData] = useState<WeatherData | null>(null)
  const [weatherLoading, setWeatherLoading] = useState(false)
  const [outfitRecommendation, setOutfitRecommendation] = useState<OutfitRecommendation | null>(null)
  const [showChat, setShowChat] = useState(false)
  const [chatError, setChatError] = useState<string | null>(null)
  const [useRealDatabase, setUseRealDatabase] = useState(true)
  const [isVisible, setIsVisible] = useState(false)

  const { messages, input, handleInputChange, handleSubmit, isLoading, error } = useChat({
    api: "/api/chat",
    body: {
      location: selectedLocation,
      weather: weatherData,
      userId: user?.id,
      useRealDatabase: useRealDatabase,
    },
    onRequest: (request) => {
      console.log('Sending chat request with body:', {
        location: selectedLocation,
        weather: weatherData,
        userId: user?.id,
        useRealDatabase: useRealDatabase,
      })
    },
    onFinish: (message) => {
      const recommendation = extractOutfitRecommendation(message.content)
      if (recommendation) {
        setOutfitRecommendation(recommendation)
      }
    },
    onError: (error) => {
      console.error("Chat error:", error)
      setChatError("Failed to get response from AI assistant. Please check your API key configuration.")
    },
  })

  // Redirect to landing page if not authenticated
  useEffect(() => {
    if (!user && !loading) {
      router.push("/landing")
    }
  }, [user, loading, router])

  // Weather effect
  useEffect(() => {
    const fetchWeatherData = async (cityValue: string) => {
      setWeatherLoading(true)
      try {
        // Find city in the comprehensive US cities list
        const city = usCities.find((c) => c.value === cityValue)
        if (!city) {
          console.error(`City not found: ${cityValue}`)
          return
        }

        console.log(`Fetching weather for ${city.label} (${city.coords.lat}, ${city.coords.lon})`)
        
        const response = await fetch(`/api/weather?lat=${city.coords.lat}&lon=${city.coords.lon}`)

        if (response.ok) {
          const data = await response.json()
          console.log('Weather data received:', data)
          setWeatherData(data)
        } else {
          const errorData = await response.json()
          console.error('Weather API error:', errorData)
        }
      } catch (error) {
        console.error("Error fetching weather:", error)
      } finally {
        setWeatherLoading(false)
      }
    }

    fetchWeatherData(selectedLocation)
    setIsVisible(true)
  }, [selectedLocation])

  // Show loading while checking auth state
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-teal-400 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-400">Loading...</p>
        </div>
      </div>
    )
  }

  // If not authenticated, don't show content (will redirect)
  if (!user) {
    return null
  }

  const handleLocationChange = (value: string) => {
    setSelectedLocation(value)
  }

  const handleItemClick = (itemName: string) => {
    router.push(`/wardrobe?search=${encodeURIComponent(itemName)}`)
  }

  const selectedCity = usCities.find((city) => city.value === selectedLocation)

  const handleGetStarted = () => {
    setShowChat(true)
  }

  if (showChat) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
        {/* Navigation */}
        <nav className="bg-gray-900/95 backdrop-blur-xl border-b border-gray-700/50 sticky top-0 z-50">
          <div className="container mx-auto px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-r from-teal-500 to-cyan-500 rounded-xl flex items-center justify-center shadow-lg">
                  <Sparkles className="w-6 h-6 text-white" />
                </div>
                <span className="text-xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
                  Style Genie
                </span>
              </div>
              <div className="flex items-center space-x-6">
                <div className="text-sm text-gray-400">
                  {user?.email}
                </div>
                <Link href="/wardrobe">
                  <Button
                    variant="ghost"
                    className="text-gray-300 hover:text-white hover:bg-gray-800/50 transition-all"
                  >
                    My Wardrobe
                  </Button>
                </Link>
                <Button
                  variant="ghost"
                  onClick={async () => {
                    await signOut()
                    router.push('/landing')
                  }}
                  className="text-gray-300 hover:text-white hover:bg-gray-800/50 transition-all"
                >
                  Logout
                </Button>
                <Button
                  variant="ghost"
                  onClick={() => setShowChat(false)}
                  className="text-gray-300 hover:text-white hover:bg-gray-800/50 transition-all"
                >
                  Back to Home
                </Button>
              </div>
            </div>
          </div>
        </nav>

        <div className="container mx-auto px-6 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Chatbot Section */}
            <div className="lg:col-span-2">
              <Card className="h-[600px] flex flex-col shadow-2xl border-0 bg-gray-800/50 backdrop-blur-xl">
                <CardHeader className="bg-gradient-to-r from-gray-800/80 to-gray-700/80 border-b border-gray-600/50">
                  <CardTitle className="flex items-center gap-3 text-white">
                    <div className="w-8 h-8 bg-gradient-to-r from-teal-500 to-cyan-500 rounded-lg flex items-center justify-center">
                      <Brain className="w-5 h-5 text-white" />
                    </div>
                    Your AI Style Assistant
                  </CardTitle>
                  <div className="flex items-center gap-4 flex-wrap">
                    <div className="flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-gray-400" />
                      <span className="text-sm text-gray-300">Location:</span>
                      <Select value={selectedLocation} onValueChange={handleLocationChange}>
                        <SelectTrigger className="w-48 h-8 bg-gray-700/50 border-gray-600 text-white backdrop-blur-sm">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="bg-gray-800/95 border-gray-700 backdrop-blur-xl max-h-96 overflow-y-auto">
                          {/* Popular Cities Section */}
                          <div className="px-2 py-1 text-xs font-semibold text-gray-400 uppercase tracking-wide">
                            Popular Cities
                          </div>
                          {popularCities.map((city) => (
                            <SelectItem key={city.value} value={city.value} className="text-white hover:bg-gray-700/50">
                              {city.label}
                            </SelectItem>
                          ))}
                          
                          {/* Separator */}
                          <div className="border-t border-gray-600 my-2"></div>
                          
                          {/* All Cities by State */}
                          <div className="px-2 py-1 text-xs font-semibold text-gray-400 uppercase tracking-wide">
                            All US Cities
                          </div>
                          {Object.entries(citiesByState)
                            .sort(([a], [b]) => a.localeCompare(b))
                            .map(([state, cities]) => (
                              <div key={state}>
                                <div className="px-2 py-1 text-xs font-medium text-gray-500 bg-gray-700/30">
                                  {state}
                                </div>
                                {cities
                                  .sort((a, b) => a.label.localeCompare(b.label))
                                  .map((city) => (
                                    <SelectItem 
                                      key={city.value} 
                                      value={city.value} 
                                      className="text-white hover:bg-gray-700/50 pl-4"
                                    >
                                      {city.label}
                                    </SelectItem>
                                  ))}
                              </div>
                            ))}
                        </SelectContent>
                      </Select>
                    </div>
                    {user && (
                      <div className="flex items-center gap-2">
                        <Database className="w-4 h-4 text-gray-400" />
                        <label className="text-sm text-gray-300 flex items-center gap-2">
                          <input
                            type="checkbox"
                            checked={useRealDatabase}
                            onChange={(e) => setUseRealDatabase(e.target.checked)}
                            className="rounded border-gray-500 text-teal-500 focus:ring-teal-400 bg-gray-700"
                          />
                          Use My Wardrobe
                        </label>
                      </div>
                    )}
                  </div>
                </CardHeader>
                <CardContent className="flex-1 flex flex-col p-0">
                  <ScrollArea className="flex-1 p-6">
                    {/* Database Status */}
                    {user && (
                      <div
                        className={`mb-4 p-4 rounded-xl border backdrop-blur-sm ${
                          useRealDatabase
                            ? "bg-emerald-900/20 border-emerald-500/30"
                            : "bg-blue-900/20 border-blue-500/30"
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <Palette className="w-4 h-4 text-teal-400" />
                          <span className="text-sm font-medium text-white">
                            {useRealDatabase ? "Using Your Personal Wardrobe" : "Using Sample Wardrobe"}
                          </span>
                        </div>
                        <p className="text-xs text-gray-400 mt-1">
                          {useRealDatabase
                            ? "AI will recommend outfits from your actual wardrobe items"
                            : "AI will use sample wardrobe data for demonstrations"}
                        </p>
                      </div>
                    )}

                    {/* Error Message */}
                    {(error || chatError) && (
                      <div className="mb-4 p-4 bg-red-900/20 border border-red-500/30 rounded-xl backdrop-blur-sm">
                        <div className="flex items-center gap-2 text-red-400">
                          <AlertCircle className="w-4 h-4" />
                          <span className="font-medium">Chat Error</span>
                        </div>
                        <p className="text-sm text-red-300 mt-1">
                          {error?.message || chatError || "Failed to connect to AI assistant"}
                        </p>
                        <p className="text-xs text-red-400 mt-2">
                          Please make sure your OpenAI API key is properly configured in the environment variables.
                        </p>
                      </div>
                    )}

                    {messages.length === 0 && (
                      <div className="text-center text-gray-400 mt-8">
                        <div className="w-20 h-20 bg-gradient-to-r from-teal-500/20 to-cyan-500/20 rounded-2xl flex items-center justify-center mx-auto mb-6">
                          <Brain className="w-10 h-10 text-teal-400" />
                        </div>
                        <h3 className="text-xl font-semibold text-white mb-3">Hi! I'm your AI stylist</h3>
                        <p className="text-gray-400 mb-6">
                          Ask me for outfit recommendations based on your wardrobe and current weather!
                        </p>
                        <div className="bg-gray-700/30 backdrop-blur-sm rounded-xl p-6 text-left max-w-md mx-auto border border-gray-600/30">
                          <p className="text-sm text-gray-300 mb-3 font-medium">Try asking:</p>
                          <ul className="text-sm text-gray-400 space-y-2">
                            <li className="flex items-center gap-2">
                              <div className="w-1.5 h-1.5 bg-teal-400 rounded-full"></div>
                              "Recommend an outfit for a dinner date tonight"
                            </li>
                            <li className="flex items-center gap-2">
                              <div className="w-1.5 h-1.5 bg-teal-400 rounded-full"></div>
                              "What should I wear for today's weather?"
                            </li>
                            <li className="flex items-center gap-2">
                              <div className="w-1.5 h-1.5 bg-teal-400 rounded-full"></div>
                              "Suggest a casual weekend outfit"
                            </li>
                            <li className="flex items-center gap-2">
                              <div className="w-1.5 h-1.5 bg-teal-400 rounded-full"></div>
                              "Pick something from my favorite items"
                            </li>
                          </ul>
                        </div>
                      </div>
                    )}
                    {messages.map((message) => (
                      <div
                        key={message.id}
                        className={`flex gap-4 mb-6 ${message.role === "user" ? "justify-end" : "justify-start"}`}
                      >
                        {message.role === "assistant" && (
                          <Avatar className="w-10 h-10 bg-gradient-to-r from-teal-500 to-cyan-500 shadow-lg">
                            <AvatarFallback className="text-white text-sm font-medium">AI</AvatarFallback>
                          </Avatar>
                        )}
                        <div
                          className={`max-w-[80%] p-4 rounded-2xl backdrop-blur-sm ${
                            message.role === "user"
                              ? "bg-gradient-to-r from-teal-500 to-cyan-500 text-white shadow-lg"
                              : "bg-gray-700/50 text-gray-100 border border-gray-600/50"
                          }`}
                        >
                          {message.content.split("OUTFIT_RECOMMENDATION:")[0]}
                        </div>
                        {message.role === "user" && (
                          <Avatar className="w-10 h-10 bg-gray-600/50 backdrop-blur-sm">
                            <AvatarFallback className="text-gray-300 text-sm">You</AvatarFallback>
                          </Avatar>
                        )}
                      </div>
                    ))}
                    {isLoading && (
                      <div className="flex gap-4 mb-6">
                        <Avatar className="w-10 h-10 bg-gradient-to-r from-teal-500 to-cyan-500">
                          <AvatarFallback className="text-white text-sm">AI</AvatarFallback>
                        </Avatar>
                        <div className="bg-gray-700/50 p-4 rounded-2xl border border-gray-600/50 backdrop-blur-sm">
                          <div className="flex space-x-2">
                            <div className="w-2 h-2 bg-teal-400 rounded-full animate-bounce"></div>
                            <div
                              className="w-2 h-2 bg-teal-400 rounded-full animate-bounce"
                              style={{ animationDelay: "0.1s" }}
                            ></div>
                            <div
                              className="w-2 h-2 bg-teal-400 rounded-full animate-bounce"
                              style={{ animationDelay: "0.2s" }}
                            ></div>
                          </div>
                        </div>
                      </div>
                    )}
                  </ScrollArea>
                  <div className="p-6 border-t border-gray-600/50 bg-gray-800/30 backdrop-blur-sm">
                    <form onSubmit={handleSubmit} className="flex gap-3">
                      <Input
                        value={input}
                        onChange={handleInputChange}
                        placeholder="Ask for outfit recommendations..."
                        className="flex-1 bg-gray-700/50 border-gray-600 text-white placeholder:text-gray-400 focus:border-teal-400 focus:ring-teal-400 backdrop-blur-sm"
                        disabled={isLoading}
                      />
                      <Button
                        type="submit"
                        disabled={isLoading}
                        className="bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-600 hover:to-cyan-600 text-white shadow-lg"
                      >
                        <Send className="w-4 h-4" />
                      </Button>
                    </form>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Recommendations Sidebar */}
            <div className="space-y-6">
              {outfitRecommendation && (
                <Card className="shadow-2xl border-0 bg-gray-800/50 backdrop-blur-xl">
                  <CardHeader className="bg-gradient-to-r from-gray-800/80 to-gray-700/80">
                    <CardTitle className="text-white flex items-center gap-2">
                      <Sparkles className="w-5 h-5 text-teal-400" />
                      Recommended Outfit
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-6">
                    <div className="space-y-4">
                      <div>
                        <h4 className="font-semibold mb-3 text-white">Your Outfit:</h4>
                        <div className="grid grid-cols-2 gap-3">
                          {outfitRecommendation.items.map((item, index) => {
                            const wardrobeItem = findWardrobeItemByName(item)

                            return (
                              <div
                                key={index}
                                className="bg-gray-700/50 p-3 rounded-xl text-center border border-gray-600/30 cursor-pointer hover:bg-gray-600/50 transition-all duration-300 backdrop-blur-sm group"
                                onClick={() => handleItemClick(item)}
                              >
                                <div className="w-full h-20 bg-gray-600/50 rounded-lg mb-2 overflow-hidden flex items-center justify-center group-hover:scale-105 transition-transform duration-300">
                                  {wardrobeItem?.image_url ? (
                                    <img
                                      src={wardrobeItem.image_url || "/images/placeholder-clothing.jpg"}
                                      alt={item}
                                      className="w-full h-full object-cover"
                                    />
                                  ) : (
                                    <Sparkles className="w-6 h-6 text-gray-400" />
                                  )}
                                </div>
                                <p className="text-xs font-medium text-gray-200">{item}</p>
                                <div className="flex items-center justify-center mt-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                  <ExternalLink className="w-3 h-3 text-teal-400" />
                                </div>
                              </div>
                            )
                          })}
                        </div>
                      </div>
                      <div className="text-sm text-gray-300 bg-gray-700/30 backdrop-blur-sm rounded-xl p-4 space-y-2 border border-gray-600/30">
                        <p>
                          <strong className="text-teal-400">Occasion:</strong> {outfitRecommendation.occasion}
                        </p>
                        <p>
                          <strong className="text-teal-400">Weather:</strong> {outfitRecommendation.weather}
                        </p>
                        {outfitRecommendation.totalValue && (
                          <p>
                            <strong className="text-teal-400">Total Value:</strong> {outfitRecommendation.totalValue}
                          </p>
                        )}
                        {outfitRecommendation.reasoning && (
                          <p>
                            <strong className="text-teal-400">Why:</strong> {outfitRecommendation.reasoning}
                          </p>
                        )}
                      </div>
                      <div className="text-center">
                        <Link href="/wardrobe">
                          <Button
                            variant="outline"
                            size="sm"
                            className="border-gray-600 hover:bg-gray-700/50 bg-transparent text-white backdrop-blur-sm"
                          >
                            <Eye className="w-4 h-4 mr-2" />
                            View Full Wardrobe
                          </Button>
                        </Link>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Weather Card */}
              <Card className="shadow-2xl border-0 bg-gray-800/50 backdrop-blur-xl">
                <CardHeader className="bg-gradient-to-r from-gray-800/80 to-gray-700/80">
                  <CardTitle className="flex items-center gap-2 text-white">
                    <Cloud className="w-5 h-5 text-teal-400" />
                    Current Weather
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                  {weatherLoading ? (
                    <div className="text-center">
                      <div className="w-8 h-8 border-2 border-teal-400 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
                      <p className="text-gray-400 text-sm">Loading weather...</p>
                    </div>
                  ) : weatherData ? (
                    <div className="text-center space-y-3">
                      <div className="text-4xl font-bold bg-gradient-to-r from-teal-400 to-cyan-400 bg-clip-text text-transparent">
                        {Math.round(weatherData.temperature)}°F
                      </div>
                      <div className="text-gray-300 capitalize font-medium">{weatherData.description}</div>
                      <div className="text-sm text-gray-400">{selectedCity?.label}</div>
                      <div className="flex justify-center gap-6 text-xs text-gray-500 mt-4 pt-4 border-t border-gray-600/30">
                        <div className="flex items-center gap-1">
                          <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                          <span>Humidity: {weatherData.humidity}%</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                          <span>Wind: {Math.round(weatherData.windSpeed)} mph</span>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center text-gray-400">
                      <p>Unable to load weather data</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-r from-teal-500/10 to-cyan-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div
          className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-r from-purple-500/10 to-pink-500/10 rounded-full blur-3xl animate-pulse"
          style={{ animationDelay: "1s" }}
        ></div>
        <div
          className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-r from-blue-500/5 to-teal-500/5 rounded-full blur-3xl animate-pulse"
          style={{ animationDelay: "2s" }}
        ></div>
      </div>

      {/* Navigation */}
      <nav
        className={`bg-gray-900/95 backdrop-blur-xl border-b border-gray-700/50 sticky top-0 z-50 transition-all duration-700 ${isVisible ? "translate-y-0 opacity-100" : "-translate-y-full opacity-0"}`}
      >
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-gradient-to-r from-teal-500 to-cyan-500 rounded-xl flex items-center justify-center shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
                <Sparkles className="w-7 h-7 text-white" />
              </div>
              <div>
                <span className="text-2xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
                  Style Genie
                </span>
                <div className="text-xs text-gray-400 font-medium">AI-Powered Styling</div>
              </div>
            </div>
            <div className="flex items-center space-x-6">
              <Link href="/wardrobe">
                <Button
                  variant="ghost"
                  className="text-gray-300 hover:text-white hover:bg-gray-800/50 transition-all duration-300 flex items-center gap-2"
                >
                  <Eye className="w-4 h-4" />
                  My Wardrobe
                </Button>
              </Link>
              <Button
                onClick={handleGetStarted}
                className="bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-600 hover:to-cyan-600 text-white rounded-full px-8 py-2 font-semibold shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
              >
                Get Started
              </Button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="container mx-auto px-6 py-20 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <div
            className={`space-y-8 transition-all duration-1000 ${isVisible ? "translate-x-0 opacity-100" : "-translate-x-20 opacity-0"}`}
          >
            <div className="space-y-4">
              <div className="inline-flex items-center gap-2 bg-gradient-to-r from-teal-500/20 to-cyan-500/20 backdrop-blur-sm border border-teal-500/30 rounded-full px-4 py-2 text-sm text-teal-300 font-medium">
                <Zap className="w-4 h-4" />
                AI-Powered Fashion Assistant
              </div>
              <h1 className="text-7xl md:text-8xl font-bold leading-tight">
                <span className="bg-gradient-to-r from-teal-400 via-cyan-400 to-blue-400 bg-clip-text text-transparent">
                  Style
                </span>
                <br />
                <span className="bg-gradient-to-r from-amber-200 via-yellow-200 to-amber-100 bg-clip-text text-transparent">
                  Better.
                </span>
              </h1>
              <div className="w-24 h-1 bg-gradient-to-r from-teal-500 to-cyan-500 rounded-full"></div>
            </div>

            <p className="text-xl text-gray-300 leading-relaxed font-light">
              Transform your wardrobe experience with AI-powered styling recommendations that adapt to weather,
              occasion, and your personal taste.
            </p>

            <p className="text-lg text-gray-400 leading-relaxed max-w-lg">
              Imagine a world where every morning begins with inspiration, not frustration. Where your closet becomes a
              curated collection of possibilities, perfectly matched to your lifestyle.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 pt-4">
              <Button
                onClick={handleGetStarted}
                className="bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-600 hover:to-cyan-600 text-white text-lg px-10 py-4 rounded-full font-semibold shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105 flex items-center gap-3"
              >
                <Play className="w-5 h-5" />
                Start Styling
                <ArrowRight className="w-5 h-5" />
              </Button>
              <Link href="/wardrobe">
                <Button
                  variant="outline"
                  className="border-2 border-gray-600 hover:border-teal-500 bg-transparent hover:bg-teal-500/10 text-white text-lg px-10 py-4 rounded-full font-semibold transition-all duration-300 hover:scale-105 backdrop-blur-sm"
                >
                  View Wardrobe
                </Button>
              </Link>
            </div>
          </div>

          {/* Hero Visual */}
          <div
            className={`relative transition-all duration-1000 delay-300 ${isVisible ? "translate-x-0 opacity-100" : "translate-x-20 opacity-0"}`}
          >
            <div className="relative">
              {/* Main Image Container */}
              <div className="w-96 h-96 bg-gradient-to-br from-teal-500/20 via-cyan-500/20 to-blue-500/20 rounded-3xl flex items-center justify-center mx-auto backdrop-blur-sm border border-gray-700/30 shadow-2xl">
                <div className="w-80 h-80 bg-gradient-to-br from-gray-800/50 to-gray-700/50 rounded-2xl flex items-center justify-center backdrop-blur-sm border border-gray-600/30">
                  <img
                    src="/images/app-preview.jpg"
                    alt="Style Genie app interface"
                    className="w-56 h-80 object-cover rounded-xl shadow-2xl"
                  />
                </div>
              </div>

              {/* Floating Feature Cards */}
              <div className="absolute -top-6 -left-12 bg-gradient-to-r from-gray-800/90 to-gray-700/90 backdrop-blur-xl border border-gray-600/50 rounded-2xl p-4 shadow-2xl transform -rotate-6 hover:rotate-0 transition-all duration-500 hidden md:block">
                <div className="w-12 h-12 bg-gradient-to-r from-teal-500 to-cyan-500 rounded-xl mb-3 flex items-center justify-center">
                  <Sparkles className="w-6 h-6 text-white" />
                </div>
                <p className="text-sm font-semibold text-white">AI Styling</p>
                <p className="text-xs text-gray-400">Smart & Personal</p>
              </div>

              <div className="absolute -top-6 -right-12 bg-gradient-to-r from-gray-800/90 to-gray-700/90 backdrop-blur-xl border border-gray-600/50 rounded-2xl p-4 shadow-2xl transform rotate-6 hover:rotate-0 transition-all duration-500 hidden md:block">
                <div className="w-12 h-12 bg-gradient-to-r from-amber-500 to-yellow-500 rounded-xl mb-3 flex items-center justify-center">
                  <MapPin className="w-6 h-6 text-white" />
                </div>
                <p className="text-sm font-semibold text-white">Weather Smart</p>
                <p className="text-xs text-gray-400">
                  {weatherData ? `${Math.round(weatherData.temperature)}°F ${weatherData.condition}` : "Loading..."}
                </p>
              </div>

              <div className="absolute -bottom-6 left-12 bg-gradient-to-r from-gray-800/90 to-gray-700/90 backdrop-blur-xl border border-gray-600/50 rounded-2xl p-4 shadow-2xl transform -rotate-3 hover:rotate-0 transition-all duration-500 hidden md:block">
                <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl mb-3 flex items-center justify-center">
                  <Eye className="w-6 h-6 text-white" />
                </div>
                <p className="text-sm font-semibold text-white">Your Wardrobe</p>
                <p className="text-xs text-gray-400">Personal Collection</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="bg-gradient-to-r from-gray-800/50 to-gray-700/50 backdrop-blur-xl py-24 mt-24 border-y border-gray-700/30">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-5xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent mb-4">
              Why Choose Style Genie?
            </h2>
            <p className="text-xl text-gray-400 max-w-2xl mx-auto">
              Experience the future of personal styling with our advanced AI technology
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                icon: Sparkles,
                title: "AI-Powered Styling",
                description:
                  "Get personalized outfit recommendations based on your wardrobe, weather conditions, and personal style preferences.",
                gradient: "from-teal-500 to-cyan-500",
              },
              {
                icon: MapPin,
                title: "Weather Integration",
                description:
                  "Real-time weather data ensures your outfit recommendations are always appropriate for current conditions.",
                gradient: "from-blue-500 to-purple-500",
              },
              {
                icon: Eye,
                title: "Smart Wardrobe",
                description:
                  "Organize and manage your clothing collection with intelligent categorization, favorites, and wear tracking.",
                gradient: "from-purple-500 to-pink-500",
              },
            ].map((feature, index) => (
              <Card
                key={index}
                className={`group bg-gray-800/50 backdrop-blur-xl border-gray-700/50 hover:border-gray-600/50 transition-all duration-500 hover:scale-105 hover:shadow-2xl ${isVisible ? "translate-y-0 opacity-100" : "translate-y-10 opacity-0"}`}
                style={{ transitionDelay: `${index * 200}ms` }}
              >
                <CardContent className="p-8 text-center">
                  <div
                    className={`w-16 h-16 bg-gradient-to-r ${feature.gradient} rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300 shadow-lg`}
                  >
                    <feature.icon className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-xl font-semibold mb-4 text-white group-hover:text-teal-300 transition-colors">
                    {feature.title}
                  </h3>
                  <p className="text-gray-400 leading-relaxed">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="py-24">
        <div className="container mx-auto px-6 text-center">
          <div
            className={`max-w-4xl mx-auto transition-all duration-1000 ${isVisible ? "translate-y-0 opacity-100" : "translate-y-10 opacity-0"}`}
          >
            <h2 className="text-6xl font-bold bg-gradient-to-r from-teal-400 via-cyan-400 to-blue-400 bg-clip-text text-transparent mb-6">
              Ready to Transform Your Style?
            </h2>
            <p className="text-xl text-gray-300 mb-12 max-w-2xl mx-auto">
              Experience AI-powered styling recommendations tailored to your wardrobe, weather, and personal
              preferences.
            </p>

            <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
              <Button
                onClick={handleGetStarted}
                className="bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-600 hover:to-cyan-600 text-white text-xl px-12 py-5 rounded-full font-semibold shadow-2xl hover:shadow-3xl transition-all duration-300 hover:scale-105 flex items-center gap-3"
              >
                <Sparkles className="w-6 h-6" />
                Start Your Style Journey
                <ArrowRight className="w-6 h-6" />
              </Button>

              <div className="flex items-center gap-4 text-gray-400">
                <div className="flex items-center gap-1">
                  <CheckCircle className="w-5 h-5 text-green-400" />
                  <span>Free to start</span>
                </div>
                <div className="flex items-center gap-1">
                  <Shield className="w-5 h-5 text-blue-400" />
                  <span>Privacy protected</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
