"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Sparkles,
  Upload,
  X,
  ArrowLeft,
  Star,
  DollarSign,
  Calendar,
  Shirt,
  Sun,
  Cloud,
  Snowflake,
  CloudRain,
  Wind,
  GraduationCap,
  Briefcase,
  Baby,
  User,
  Shield,
  Heart,
  Zap,
} from "lucide-react"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { useAuth } from "@/hooks/useAuth"
import { wardrobeService, wardrobeProfileService, type WardrobeProfile } from "@/lib/supabase"

interface FormData {
  name: string
  description: string
  brand: string
  color: string
  size: string
  price: string
  purchaseDate: string
  category: string
  condition: string
  image: File | null
  tags: string[]
  // Age-specific fields
  weatherSuitability: string[]
  seasonalUse: string[]
  occasions: string[]
  schoolCompliant: boolean
  workAppropriate: boolean
  hasGrowthRoom: boolean
  safetyFeatures: string[]
  careInstructions: string
}

const CONDITIONS = [
  { value: "new", label: "New with tags" },
  { value: "excellent", label: "Excellent" },
  { value: "good", label: "Good" },
  { value: "fair", label: "Fair" },
  { value: "poor", label: "Poor" },
]

const WEATHER_CONDITIONS = [
  { value: "hot", label: "Hot weather", icon: Sun },
  { value: "cold", label: "Cold weather", icon: Snowflake },
  { value: "rainy", label: "Rainy weather", icon: CloudRain },
  { value: "windy", label: "Windy weather", icon: Wind },
  { value: "mild", label: "Mild weather", icon: Cloud },
]

const SEASONS = [
  { value: "spring", label: "Spring" },
  { value: "summer", label: "Summer" },
  { value: "fall", label: "Fall/Autumn" },
  { value: "winter", label: "Winter" },
]

const SAFETY_FEATURES = [
  { value: "reflective", label: "Reflective strips" },
  { value: "bright_colors", label: "Bright/visible colors" },
  { value: "non_slip", label: "Non-slip soles" },
  { value: "soft_materials", label: "Soft materials" },
  { value: "no_small_parts", label: "No small parts" },
  { value: "flame_resistant", label: "Flame resistant" },
]

// Age-specific categories and occasions
const getAgeSpecificData = (age?: number) => {
  const isChild = age !== undefined && age < 13
  const isTeen = age !== undefined && age >= 13 && age < 18
  const isAdult = age === undefined || age >= 18

  const categories = [
    { value: "tops", label: "Tops & Shirts" },
    { value: "bottoms", label: "Bottoms" },
    { value: "dresses", label: "Dresses" },
    { value: "outerwear", label: "Outerwear" },
    { value: "shoes", label: "Shoes" },
    { value: "accessories", label: "Accessories" },
    { value: "underwear", label: "Underwear" },
    { value: "sleepwear", label: "Sleepwear" },
    { value: "activewear", label: "Activewear" },
  ]

  if (isChild) {
    categories.push(
      { value: "school_uniform", label: "School Uniform" },
      { value: "play_clothes", label: "Play Clothes" },
      { value: "party_wear", label: "Party Wear" },
    )
  }

  if (isTeen) {
    categories.push({ value: "trendy_casual", label: "Trendy Casual" })
  }

  if (isAdult) {
    categories.push(
      { value: "work_wear", label: "Work Wear" },
      { value: "business_casual", label: "Business Casual" },
      { value: "evening_wear", label: "Evening Wear" },
      { value: "formal_wear", label: "Formal Wear" },
    )
  }

  const occasions = []
  if (isChild) {
    occasions.push(
      { value: "school", label: "School" },
      { value: "playground", label: "Playground" },
      { value: "party", label: "Birthday Party" },
      { value: "sleep", label: "Sleep/Bedtime" },
      { value: "sports", label: "Sports/PE" },
      { value: "family_event", label: "Family Event" },
    )
  } else if (isTeen) {
    occasions.push(
      { value: "school", label: "School" },
      { value: "casual", label: "Casual Hangout" },
      { value: "sports", label: "Sports/Activities" },
      { value: "party", label: "Party/Social Event" },
      { value: "date", label: "Date" },
      { value: "family_event", label: "Family Event" },
    )
  } else {
    occasions.push(
      { value: "work", label: "Work/Professional" },
      { value: "casual", label: "Casual" },
      { value: "formal", label: "Formal Event" },
      { value: "date_night", label: "Date Night" },
      { value: "travel", label: "Travel" },
      { value: "exercise", label: "Exercise/Gym" },
      { value: "home", label: "Home/Lounging" },
    )
  }

  return { categories, occasions, isChild, isTeen, isAdult }
}

export default function AddClothesPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const profileId = searchParams.get("profile")
  const { user } = useAuth()

  const [currentProfile, setCurrentProfile] = useState<WardrobeProfile | null>(null)
  const [loading, setLoading] = useState(false)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [formData, setFormData] = useState<FormData>({
    name: "",
    description: "",
    brand: "",
    color: "",
    size: "",
    price: "",
    purchaseDate: "",
    category: "",
    condition: "good",
    image: null,
    tags: [],
    weatherSuitability: [],
    seasonalUse: [],
    occasions: [],
    schoolCompliant: false,
    workAppropriate: false,
    hasGrowthRoom: false,
    safetyFeatures: [],
    careInstructions: "",
  })

  // Load profile data if profileId is provided
  useEffect(() => {
    const loadProfile = async () => {
      if (profileId && user) {
        try {
          const profiles = await wardrobeProfileService.getWardrobeProfiles(user.id)
          const profile = profiles?.find((p) => p.id === profileId)
          setCurrentProfile(profile || null)
        } catch (error) {
          console.error("Error loading profile:", error)
        }
      }
    }
    loadProfile()
  }, [profileId, user])

  const ageSpecificData = getAgeSpecificData(currentProfile?.age)

  const getAgeIcon = () => {
    if (!currentProfile?.age) return <User className="w-5 h-5" />
    if (currentProfile.age < 5) return <Baby className="w-5 h-5" />
    if (currentProfile.age < 18) return <GraduationCap className="w-5 h-5" />
    return <Briefcase className="w-5 h-5" />
  }

  const getAgeCategory = () => {
    if (!currentProfile?.age) return "Adult"
    if (currentProfile.age < 5) return "Toddler"
    if (currentProfile.age < 13) return "Child"
    if (currentProfile.age < 18) return "Teen"
    return "Adult"
  }

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setFormData({ ...formData, image: file })
      const reader = new FileReader()
      reader.onload = (e) => {
        setImagePreview(e.target?.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const removeImage = () => {
    setFormData({ ...formData, image: null })
    setImagePreview(null)
  }

  const handleArrayFieldChange = (field: keyof FormData, value: string, checked: boolean) => {
    const currentArray = formData[field] as string[]
    if (checked) {
      setFormData({
        ...formData,
        [field]: [...currentArray, value],
      })
    } else {
      setFormData({
        ...formData,
        [field]: currentArray.filter((item) => item !== value),
      })
    }
  }

  const generateEnhancedDescription = () => {
    let description = formData.description

    // Add age-specific context
    if (currentProfile?.age) {
      description += `\n\nAge-appropriate for: ${getAgeCategory()} (${currentProfile.age} years old)`
    }

    // Add weather suitability
    if (formData.weatherSuitability.length > 0) {
      description += `\nWeather: Suitable for ${formData.weatherSuitability.join(", ")} weather`
    }

    // Add seasonal use
    if (formData.seasonalUse.length > 0) {
      description += `\nSeasons: Best for ${formData.seasonalUse.join(", ")}`
    }

    // Add occasions
    if (formData.occasions.length > 0) {
      description += `\nOccasions: Perfect for ${formData.occasions.join(", ")}`
    }

    // Add compliance info
    if (formData.schoolCompliant) {
      description += `\nSchool dress code compliant`
    }
    if (formData.workAppropriate) {
      description += `\nWork appropriate`
    }

    // Add child-specific features
    if (ageSpecificData.isChild) {
      if (formData.hasGrowthRoom) {
        description += `\nHas room for growth`
      }
      if (formData.safetyFeatures.length > 0) {
        description += `\nSafety features: ${formData.safetyFeatures.join(", ")}`
      }
    }

    // Add care instructions
    if (formData.careInstructions) {
      description += `\nCare: ${formData.careInstructions}`
    }

    return description.trim()
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) return

    setLoading(true)
    try {
      // Create the wardrobe item with proper profile association
      const itemData = {
        user_id: user.id,
        name: formData.name,
        description: generateEnhancedDescription(),
        brand: formData.brand || undefined,
        color: formData.color || undefined,
        size: formData.size || undefined,
        price: formData.price ? Number.parseFloat(formData.price) : undefined,
        purchase_date: formData.purchaseDate || undefined,
        category_id: formData.category,
        condition: formData.condition as "new" | "excellent" | "good" | "fair" | "poor",
        is_favorite: false,
        wear_count: 0,
        image_url: undefined,
        image_path: undefined,
        // Associate with profile if profileId is provided
        wardrobe_profile_id: profileId || undefined,
      }

      console.log("Adding item to wardrobe:", {
        profileId: profileId || "main wardrobe",
        itemName: itemData.name,
        userId: user.id,
      })

      const savedItem = await wardrobeService.addWardrobeItem(itemData)
      if (!savedItem) {
        throw new Error("Failed to save item")
      }

      // Upload image if provided
      if (formData.image) {
        try {
          const imageResult = await wardrobeService.uploadImage(formData.image, user.id, savedItem.id)
          await wardrobeService.updateWardrobeItem(savedItem.id, {
            image_url: imageResult.url,
            image_path: imageResult.path,
          })
        } catch (imageError) {
          console.error("Error uploading image:", imageError)
          // Don't fail the entire operation if image upload fails
        }
      }

      console.log("Item successfully added to", profileId ? `profile ${profileId}` : "main wardrobe")

      // Navigate back to wardrobe
      if (profileId) {
        router.push(`/wardrobe?profile=${profileId}`)
      } else {
        router.push("/wardrobe")
      }
    } catch (error) {
      console.error("Error adding item:", error)
      alert("Failed to add item. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-400">Please log in to add clothes</p>
          <Link href="/auth">
            <Button className="mt-4 bg-white hover:bg-gray-200 text-black">Sign In</Button>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
      {/* Navigation */}
      <nav className="bg-gray-800/50 backdrop-blur-sm border-b border-gray-700 sticky top-0 z-50">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link href={profileId ? `/wardrobe?profile=${profileId}` : "/wardrobe"}>
                <Button variant="ghost" size="sm" className="text-gray-300 hover:text-white hover:bg-gray-700">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back to Wardrobe
                </Button>
              </Link>
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center">
                  <Shirt className="w-4 h-4 text-black" />
                </div>
                <h1 className="text-2xl font-bold text-white">Add New Item</h1>
              </div>
            </div>
            {currentProfile && (
              <div className="flex items-center space-x-3 bg-gray-700/50 px-4 py-2 rounded-lg">
                {getAgeIcon()}
                <div>
                  <p className="text-white font-medium">{currentProfile.name}</p>
                  <p className="text-gray-400 text-sm">
                    {getAgeCategory()} • {currentProfile.age} years old
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </nav>

      <div className="container mx-auto px-6 py-8">
        <form onSubmit={handleSubmit} className="max-w-4xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Left Column - Basic Info */}
            <div className="space-y-6">
              {/* Item Image */}
              <Card className="bg-gray-800/80 backdrop-blur-xl border-gray-700">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-white">
                    <Sparkles className="w-5 h-5" />
                    Item Image
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {imagePreview ? (
                    <div className="relative">
                      <img
                        src={imagePreview || "/placeholder.svg"}
                        alt="Preview"
                        className="w-full h-64 object-cover rounded-lg border-2 border-gray-600"
                      />
                      <Button
                        type="button"
                        onClick={removeImage}
                        variant="destructive"
                        size="sm"
                        className="absolute top-2 right-2"
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  ) : (
                    <div className="border-2 border-dashed border-gray-600 rounded-lg p-8 text-center">
                      <div className="w-16 h-16 bg-gray-600 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Upload className="w-8 h-8 text-gray-400" />
                      </div>
                      <p className="text-gray-300 mb-2">Upload an image of your clothing item</p>
                      <p className="text-gray-500 text-sm mb-4">Drag and drop or click to browse</p>
                      <Input
                        type="file"
                        accept="image/*"
                        onChange={handleImageChange}
                        className="hidden"
                        id="image-upload"
                      />
                      <Button
                        type="button"
                        onClick={() => document.getElementById("image-upload")?.click()}
                        className="bg-white hover:bg-gray-200 text-black"
                      >
                        Choose Image
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Basic Details */}
              <Card className="bg-gray-800/80 backdrop-blur-xl border-gray-700">
                <CardHeader>
                  <CardTitle className="text-white">Basic Details</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="name" className="text-gray-300 font-medium">
                      Item Name *
                    </Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder={
                        ageSpecificData.isChild
                          ? "e.g., School uniform shirt, Play dress"
                          : ageSpecificData.isTeen
                            ? "e.g., Trendy jeans, School hoodie"
                            : "e.g., Business blazer, Casual t-shirt"
                      }
                      required
                      className="mt-2 bg-gray-700 border-gray-600 text-white"
                    />
                  </div>

                  <div>
                    <Label htmlFor="description" className="text-gray-300 font-medium">
                      Description
                    </Label>
                    <Textarea
                      id="description"
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      placeholder={
                        ageSpecificData.isChild
                          ? "Describe the item, any special features for kids..."
                          : "Describe the item, style, fit, special features..."
                      }
                      className="mt-2 bg-gray-700 border-gray-600 text-white"
                      rows={3}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="brand" className="text-gray-300 font-medium">
                        Brand
                      </Label>
                      <Input
                        id="brand"
                        value={formData.brand}
                        onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
                        placeholder="e.g., Nike, Zara"
                        className="mt-2 bg-gray-700 border-gray-600 text-white"
                      />
                    </div>
                    <div>
                      <Label htmlFor="color" className="text-gray-300 font-medium">
                        Color
                      </Label>
                      <Input
                        id="color"
                        value={formData.color}
                        onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                        placeholder="e.g., Navy blue, Red"
                        className="mt-2 bg-gray-700 border-gray-600 text-white"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="size" className="text-gray-300 font-medium">
                        Size
                      </Label>
                      <Input
                        id="size"
                        value={formData.size}
                        onChange={(e) => setFormData({ ...formData, size: e.target.value })}
                        placeholder={ageSpecificData.isChild ? "e.g., 8Y, 10-12Y" : "e.g., M, L, 32, 8.5"}
                        className="mt-2 bg-gray-700 border-gray-600 text-white"
                      />
                    </div>
                    <div>
                      <Label htmlFor="condition" className="text-gray-300 font-medium">
                        Condition
                      </Label>
                      <Select
                        value={formData.condition}
                        onValueChange={(value) => setFormData({ ...formData, condition: value })}
                      >
                        <SelectTrigger className="mt-2 bg-gray-700 border-gray-600 text-white">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="bg-gray-800 text-white border-gray-700">
                          {CONDITIONS.map((condition) => (
                            <SelectItem key={condition.value} value={condition.value}>
                              {condition.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="price" className="text-gray-300 font-medium">
                        Price
                      </Label>
                      <div className="relative mt-2">
                        <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <Input
                          id="price"
                          type="number"
                          step="0.01"
                          value={formData.price}
                          onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                          placeholder="0.00"
                          className="pl-10 bg-gray-700 border-gray-600 text-white"
                        />
                      </div>
                    </div>
                    <div>
                      <Label htmlFor="purchaseDate" className="text-gray-300 font-medium">
                        Purchase Date
                      </Label>
                      <div className="relative mt-2">
                        <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <Input
                          id="purchaseDate"
                          type="date"
                          value={formData.purchaseDate}
                          onChange={(e) => setFormData({ ...formData, purchaseDate: e.target.value })}
                          className="pl-10 bg-gray-700 border-gray-600 text-white"
                        />
                      </div>
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="category" className="text-gray-300 font-medium">
                      Category *
                    </Label>
                    <Select
                      value={formData.category}
                      onValueChange={(value) => setFormData({ ...formData, category: value })}
                    >
                      <SelectTrigger className="mt-2 bg-gray-700 border-gray-600 text-white">
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent className="bg-gray-800 text-white border-gray-700">
                        {ageSpecificData.categories.map((category) => (
                          <SelectItem key={category.value} value={category.value}>
                            {category.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Right Column - Age-Specific Features */}
            <div className="space-y-6">
              {/* Weather & Season Suitability */}
              <Card className="bg-gray-800/80 backdrop-blur-xl border-gray-700">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-white">
                    <Sun className="w-5 h-5" />
                    Weather & Season
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label className="text-gray-300 font-medium mb-3 block">Weather Suitability</Label>
                    <div className="grid grid-cols-2 gap-2">
                      {WEATHER_CONDITIONS.map((weather) => (
                        <div key={weather.value} className="flex items-center space-x-2">
                          <Checkbox
                            id={`weather-${weather.value}`}
                            checked={formData.weatherSuitability.includes(weather.value)}
                            onCheckedChange={(checked) =>
                              handleArrayFieldChange("weatherSuitability", weather.value, checked as boolean)
                            }
                            className="border-gray-600"
                          />
                          <Label
                            htmlFor={`weather-${weather.value}`}
                            className="text-gray-300 text-sm flex items-center gap-1"
                          >
                            <weather.icon className="w-3 h-3" />
                            {weather.label}
                          </Label>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <Label className="text-gray-300 font-medium mb-3 block">Seasonal Use</Label>
                    <div className="grid grid-cols-2 gap-2">
                      {SEASONS.map((season) => (
                        <div key={season.value} className="flex items-center space-x-2">
                          <Checkbox
                            id={`season-${season.value}`}
                            checked={formData.seasonalUse.includes(season.value)}
                            onCheckedChange={(checked) =>
                              handleArrayFieldChange("seasonalUse", season.value, checked as boolean)
                            }
                            className="border-gray-600"
                          />
                          <Label htmlFor={`season-${season.value}`} className="text-gray-300 text-sm">
                            {season.label}
                          </Label>
                        </div>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Occasions */}
              <Card className="bg-gray-800/80 backdrop-blur-xl border-gray-700">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-white">
                    <Star className="w-5 h-5" />
                    Occasions & Use
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label className="text-gray-300 font-medium mb-3 block">Perfect for</Label>
                    <div className="grid grid-cols-2 gap-2">
                      {ageSpecificData.occasions.map((occasion) => (
                        <div key={occasion.value} className="flex items-center space-x-2">
                          <Checkbox
                            id={`occasion-${occasion.value}`}
                            checked={formData.occasions.includes(occasion.value)}
                            onCheckedChange={(checked) =>
                              handleArrayFieldChange("occasions", occasion.value, checked as boolean)
                            }
                            className="border-gray-600"
                          />
                          <Label htmlFor={`occasion-${occasion.value}`} className="text-gray-300 text-sm">
                            {occasion.label}
                          </Label>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Age-specific compliance checks */}
                  <div className="space-y-3">
                    {(ageSpecificData.isChild || ageSpecificData.isTeen) && (
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="schoolCompliant"
                          checked={formData.schoolCompliant}
                          onCheckedChange={(checked) =>
                            setFormData({ ...formData, schoolCompliant: checked as boolean })
                          }
                          className="border-gray-600"
                        />
                        <Label htmlFor="schoolCompliant" className="text-gray-300 text-sm flex items-center gap-1">
                          <GraduationCap className="w-3 h-3" />
                          School dress code compliant
                        </Label>
                      </div>
                    )}

                    {ageSpecificData.isAdult && (
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="workAppropriate"
                          checked={formData.workAppropriate}
                          onCheckedChange={(checked) =>
                            setFormData({ ...formData, workAppropriate: checked as boolean })
                          }
                          className="border-gray-600"
                        />
                        <Label htmlFor="workAppropriate" className="text-gray-300 text-sm flex items-center gap-1">
                          <Briefcase className="w-3 h-3" />
                          Work appropriate
                        </Label>
                      </div>
                    )}

                    {ageSpecificData.isChild && (
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="hasGrowthRoom"
                          checked={formData.hasGrowthRoom}
                          onCheckedChange={(checked) => setFormData({ ...formData, hasGrowthRoom: checked as boolean })}
                          className="border-gray-600"
                        />
                        <Label htmlFor="hasGrowthRoom" className="text-gray-300 text-sm flex items-center gap-1">
                          <Zap className="w-3 h-3" />
                          Has room for growth
                        </Label>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Child-specific Safety Features */}
              {ageSpecificData.isChild && (
                <Card className="bg-gray-800/80 backdrop-blur-xl border-gray-700">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-white">
                      <Shield className="w-5 h-5" />
                      Safety Features
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div>
                      <Label className="text-gray-300 font-medium mb-3 block">Safety Features</Label>
                      <div className="grid grid-cols-1 gap-2">
                        {SAFETY_FEATURES.map((feature) => (
                          <div key={feature.value} className="flex items-center space-x-2">
                            <Checkbox
                              id={`safety-${feature.value}`}
                              checked={formData.safetyFeatures.includes(feature.value)}
                              onCheckedChange={(checked) =>
                                handleArrayFieldChange("safetyFeatures", feature.value, checked as boolean)
                              }
                              className="border-gray-600"
                            />
                            <Label htmlFor={`safety-${feature.value}`} className="text-gray-300 text-sm">
                              {feature.label}
                            </Label>
                          </div>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Care Instructions */}
              <Card className="bg-gray-800/80 backdrop-blur-xl border-gray-700">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-white">
                    <Heart className="w-5 h-5" />
                    Care Instructions
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div>
                    <Label htmlFor="careInstructions" className="text-gray-300 font-medium">
                      Washing & Care
                    </Label>
                    <Textarea
                      id="careInstructions"
                      value={formData.careInstructions}
                      onChange={(e) => setFormData({ ...formData, careInstructions: e.target.value })}
                      placeholder="e.g., Machine wash cold, tumble dry low, iron on medium heat"
                      className="mt-2 bg-gray-700 border-gray-600 text-white"
                      rows={2}
                    />
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Submit Button */}
          <div className="mt-8 flex justify-end space-x-4">
            <Link href={profileId ? `/wardrobe?profile=${profileId}` : "/wardrobe"}>
              <Button
                type="button"
                variant="outline"
                className="border-gray-600 hover:bg-gray-700 bg-transparent text-white"
              >
                Cancel
              </Button>
            </Link>
            <Button
              type="submit"
              disabled={!formData.name || !formData.category || loading}
              className="bg-white hover:bg-gray-200 text-black min-w-[120px]"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin mr-2" />
                  Adding...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 mr-2" />
                  Add Item
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
