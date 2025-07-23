"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"
import { useAuth } from "@/hooks/useAuth"
import { wardrobeService, wardrobeProfileService } from "@/lib/supabase"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import {
  Plus,
  Users,
  User,
  Sparkles,
  Upload,
  Baby,
  GraduationCap,
  Briefcase,
  Heart,
  CloudRain,
  Snowflake,
  Sun,
  Wind,
  Calendar,
  DollarSign,
  Settings,
  X,
  BookOpen,
  Shield,
  HeartIcon as UserHeart,
  Cloud,
  ArrowLeft,
  Edit,
  Trash2,
  CalendarDays,
} from "lucide-react"
import type { WardrobeProfile } from "@/lib/supabase"

interface WardrobeProfileDisplay {
  id: string
  name: string
  relation?: string
  age?: number
  dateOfBirth?: string
  profile_picture_url?: string
  isOwner: boolean
  itemCount: number
  totalValue: number
  lastUpdated: string
  avatar: string
  color: string
  profileData?: WardrobeProfile
}

const RELATIONSHIPS = [
  "spouse",
  "partner",
  "child",
  "parent",
  "sibling",
  "grandparent",
  "grandchild",
  "friend",
  "other",
]

const EDUCATION_TYPES = ["school", "university", "other"]

const WEATHER_ESSENTIALS = [
  { id: "raincoat", label: "Raincoat & Umbrella", icon: CloudRain },
  { id: "winter_jacket", label: "Winter Jacket", icon: Snowflake },
  { id: "gloves", label: "Gloves", icon: Shield },
  { id: "winter_hat", label: "Winter Hat", icon: Snowflake },
  { id: "scarf", label: "Scarf", icon: Wind },
  { id: "rain_boots", label: "Rain/Snow Boots", icon: Shield },
  { id: "sun_hat", label: "Sun Hat", icon: Sun },
  { id: "sunglasses", label: "Sunglasses", icon: Sun },
]

// Helper function to calculate age from date of birth
const calculateAge = (dateOfBirth: string): number => {
  const today = new Date()
  const birthDate = new Date(dateOfBirth)
  let age = today.getFullYear() - birthDate.getFullYear()
  const monthDiff = today.getMonth() - birthDate.getMonth()

  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--
  }

  return age
}

// Helper function to get age display with days/months for babies
const getAgeDisplay = (dateOfBirth: string): string => {
  const today = new Date()
  const birthDate = new Date(dateOfBirth)
  const ageInYears = calculateAge(dateOfBirth)

  if (ageInYears < 1) {
    const ageInMonths = Math.floor((today.getTime() - birthDate.getTime()) / (1000 * 60 * 60 * 24 * 30.44))
    if (ageInMonths < 1) {
      const ageInDays = Math.floor((today.getTime() - birthDate.getTime()) / (1000 * 60 * 60 * 24))
      return `${ageInDays} day${ageInDays !== 1 ? "s" : ""} old`
    }
    return `${ageInMonths} month${ageInMonths !== 1 ? "s" : ""} old`
  } else if (ageInYears < 2) {
    const ageInMonths = Math.floor((today.getTime() - birthDate.getTime()) / (1000 * 60 * 60 * 24 * 30.44))
    return `${ageInYears} year, ${ageInMonths - ageInYears * 12} month${(ageInMonths - ageInYears * 12) !== 1 ? "s" : ""} old`
  }

  return `${ageInYears} year${ageInYears !== 1 ? "s" : ""} old`
}

export default function WardrobesPage() {
  const { user, signOut } = useAuth()
  const router = useRouter()
  const searchParams = useSearchParams()
  const [wardrobes, setWardrobes] = useState<WardrobeProfileDisplay[]>([])
  const [loading, setLoading] = useState(true)
  const [showAddDialog, setShowAddDialog] = useState(false)
  const [showEditDialog, setShowEditDialog] = useState(false)
  const [editingProfile, setEditingProfile] = useState<WardrobeProfile | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [dobColumnExists, setDobColumnExists] = useState(false)
  const [profileColumnExists, setProfileColumnExists] = useState(false)

  // Get the referrer from URL params or default to home
  const referrer = searchParams.get("from") || "/home"

  // Form state for adding new profile
  const [newProfile, setNewProfile] = useState({
    name: "",
    relation: "",
    dateOfBirth: "",
    age: "",
    gender: "",
    profilePicture: null as File | null,
    goesToSchool: false,
    educationType: "school",
    institutionName: "",
    courseMajor: "",
    yearGrade: "",
    hasUniform: false,
    dressCodeNotes: "",
    weatherEssentials: [] as string[],
  })

  // Form state for editing existing profile
  const [editProfile, setEditProfile] = useState({
    name: "",
    relation: "",
    dateOfBirth: "",
    age: "",
    gender: "",
    profilePicture: null as File | null,
    goesToSchool: false,
    educationType: "school",
    institutionName: "",
    courseMajor: "",
    yearGrade: "",
    hasUniform: false,
    dressCodeNotes: "",
    weatherEssentials: [] as string[],
  })

  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [editImagePreview, setEditImagePreview] = useState<string | null>(null)
  const [errors, setErrors] = useState<{ [key: string]: string }>({})

  useEffect(() => {
    if (user) {
      checkDatabaseColumns()
      loadWardrobeProfiles()
    }
  }, [user])

  // Check if database columns exist
  const checkDatabaseColumns = async () => {
    try {
      const dobExists = await wardrobeProfileService.checkDobColumnExists()
      const profileExists = await wardrobeService.checkProfileColumnExists()
      setDobColumnExists(dobExists)
      setProfileColumnExists(profileExists)
      console.log("DOB column exists:", dobExists)
      console.log("Profile column exists:", profileExists)
    } catch (error) {
      console.error("Error checking database columns:", error)
      setDobColumnExists(false)
      setProfileColumnExists(false)
    }
  }

  // Check if DOB column exists in the database
  const checkDobColumn = async () => {
    try {
      const exists = await wardrobeProfileService.checkDobColumnExists()
      setDobColumnExists(exists)
      console.log("DOB column exists:", exists)
    } catch (error) {
      console.error("Error checking DOB column:", error)
      setDobColumnExists(false)
    }
  }

  // Handle back navigation
  const handleBack = () => {
    router.push(referrer)
  }

  // Get back button text based on referrer
  const getBackButtonText = () => {
    switch (referrer) {
      case "/home":
        return "Back to Home"
      case "/weather-essentials":
        return "Back to Weather Essentials"
      case "/wardrobe":
        return "Back to My Wardrobe"
      case "/chat":
        return "Back to Style Chat"
      default:
        return "Back"
    }
  }

  const loadWardrobeProfiles = async () => {
    if (!user) return

    try {
      setLoading(true)

      // Get wardrobe profiles
      const profiles = await wardrobeProfileService.getWardrobeProfiles(user.id)

      // Get main wardrobe data (items not associated with any profile, or all items if column doesn't exist)
      const mainWardrobeItems = await wardrobeService.getWardrobeItems(user.id, undefined)
      const mainItemCount = mainWardrobeItems?.length || 0
      const mainTotalValue = mainWardrobeItems?.reduce((sum, item) => sum + (item.price || 0), 0) || 0

      const userInitial = user.email?.charAt(0).toUpperCase() || "U"

      // Create main wardrobe display object with real data
      const mainWardrobe: WardrobeProfileDisplay = {
        id: "main",
        name: `${user.email?.split("@")[0] || "You"} (You)`,
        isOwner: true,
        itemCount: mainItemCount,
        totalValue: mainTotalValue,
        lastUpdated: mainItemCount > 0 ? "recently" : "never",
        avatar: userInitial,
        color: "from-cyan-500 to-blue-500",
      }

      let additionalWardrobes: WardrobeProfileDisplay[] = []

      if (profiles && profiles.length > 0) {
        // Check if profile column exists to determine how to handle profile-specific data
        const profileColumnExists = await wardrobeService.checkProfileColumnExists()

        if (profileColumnExists) {
          // Get real data for each profile - load their specific wardrobe items
          const profilesWithData = await Promise.all(
            profiles.map(async (profile) => {
              // Load items specifically for this profile
              const profileItems = await wardrobeService.getWardrobeItems(user.id, profile.id)
              const itemCount = profileItems?.length || 0
              const totalValue = profileItems?.reduce((sum, item) => sum + (item.price || 0), 0) || 0

              // Calculate current age from DOB if available, otherwise use stored age
              let currentAge = profile.age
              if (profile.date_of_birth) {
                currentAge = calculateAge(profile.date_of_birth)
              }

              console.log(`Profile ${profile.name}: ${itemCount} items, $${totalValue} value`)

              return {
                id: profile.id,
                name: profile.name,
                relation: profile.relation,
                age: currentAge,
                dateOfBirth: profile.date_of_birth,
                profile_picture_url: profile.profile_picture_url,
                isOwner: false,
                itemCount,
                totalValue,
                lastUpdated: itemCount > 0 ? "recently" : "never",
                avatar: profile.profile_picture_url ? "" : profile.name.charAt(0).toUpperCase(),
                color: getRandomColor(),
                profileData: profile,
              }
            }),
          )

          additionalWardrobes = profilesWithData
        } else {
          // Profile column doesn't exist yet - show profiles but with placeholder data
          const profilesWithPlaceholderData = profiles.map((profile) => {
            // Calculate current age from DOB if available, otherwise use stored age
            let currentAge = profile.age
            if (profile.date_of_birth) {
              currentAge = calculateAge(profile.date_of_birth)
            }

            return {
              id: profile.id,
              name: profile.name,
              relation: profile.relation,
              age: currentAge,
              dateOfBirth: profile.date_of_birth,
              profile_picture_url: profile.profile_picture_url,
              isOwner: false,
              itemCount: 0, // Placeholder - separate wardrobes not available yet
              totalValue: 0, // Placeholder - separate wardrobes not available yet
              lastUpdated: "never",
              avatar: profile.profile_picture_url ? "" : profile.name.charAt(0).toUpperCase(),
              color: getRandomColor(),
              profileData: profile,
            }
          })

          additionalWardrobes = profilesWithPlaceholderData
        }
      }

      console.log("Main wardrobe:", mainItemCount, "items")
      console.log(
        "Additional wardrobes:",
        additionalWardrobes.map((w) => `${w.name}: ${w.itemCount} items`),
      )

      setWardrobes([mainWardrobe, ...additionalWardrobes])
    } catch (error) {
      console.error("Error loading wardrobe profiles:", error)
      // Show main wardrobe even if profiles fail to load
      const userInitial = user.email?.charAt(0).toUpperCase() || "U"
      const mainWardrobe: WardrobeProfileDisplay = {
        id: "main",
        name: `${user.email?.split("@")[0] || "You"} (You)`,
        isOwner: true,
        itemCount: 0,
        totalValue: 0,
        lastUpdated: "never",
        avatar: userInitial,
        color: "from-cyan-500 to-blue-500",
      }
      setWardrobes([mainWardrobe])
    } finally {
      setLoading(false)
    }
  }

  const getRandomColor = () => {
    const colors = [
      "from-purple-500 to-pink-500",
      "from-green-500 to-teal-500",
      "from-blue-500 to-indigo-500",
      "from-yellow-500 to-orange-500",
      "from-red-500 to-pink-500",
      "from-indigo-500 to-purple-500",
    ]
    return colors[Math.floor(Math.random() * colors.length)]
  }

  const getAgeIcon = (age?: number) => {
    if (!age) return <User className="w-5 h-5" />
    if (age < 3) return <Baby className="w-5 h-5" />
    if (age < 6) return <Baby className="w-5 h-5" />
    if (age < 18) return <GraduationCap className="w-5 h-5" />
    return <Briefcase className="w-5 h-5" />
  }

  const getRelationIcon = (relation?: string) => {
    switch (relation) {
      case "spouse":
      case "partner":
        return <UserHeart className="w-4 h-4 text-pink-400" />
      case "child":
        return <Baby className="w-4 h-4 text-blue-400" />
      case "parent":
        return <User className="w-4 h-4 text-green-400" />
      default:
        return <User className="w-4 h-4 text-gray-400" />
    }
  }

  const getAgeCategory = (age?: number) => {
    if (!age) return "Adult"
    if (age < 2) return "Baby"
    if (age < 6) return "Toddler"
    if (age < 13) return "Child"
    if (age < 18) return "Teen"
    if (age < 26) return "Young Adult"
    return "Adult"
  }

  const getRelationshipDisplayName = (relation?: string) => {
    switch (relation) {
      case "spouse":
        return "Spouse"
      case "partner":
        return "Partner"
      case "child":
        return "Child"
      case "parent":
        return "Parent"
      case "sibling":
        return "Sibling"
      case "grandparent":
        return "Grandparent"
      case "grandchild":
        return "Grandchild"
      case "friend":
        return "Friend"
      case "other":
        return "Family Member"
      default:
        return "Family Member"
    }
  }

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setNewProfile({ ...newProfile, profilePicture: file })
      const reader = new FileReader()
      reader.onload = (e) => {
        setImagePreview(e.target?.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleEditImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setEditProfile({ ...editProfile, profilePicture: file })
      const reader = new FileReader()
      reader.onload = (e) => {
        setEditImagePreview(e.target?.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const validateForm = (formData: typeof newProfile) => {
    const newErrors: { [key: string]: string } = {}

    if (!formData.name.trim()) newErrors.name = "Name is required"
    if (!formData.relation) newErrors.relation = "Relationship is required"

    // Validate based on whether DOB column exists
    if (dobColumnExists) {
      if (!formData.dateOfBirth) {
        newErrors.dateOfBirth = "Date of birth is required"
      } else {
        const birthDate = new Date(formData.dateOfBirth)
        const today = new Date()
        if (birthDate > today) {
          newErrors.dateOfBirth = "Date of birth cannot be in the future"
        }
        if (birthDate < new Date("1900-01-01")) {
          newErrors.dateOfBirth = "Please enter a valid date of birth"
        }
      }
    } else {
      // Fallback to age validation if DOB column doesn't exist
      if (!formData.age || Number.parseInt(formData.age) < 0 || Number.parseInt(formData.age) > 120) {
        newErrors.age = "Please enter a valid age (0-120)"
      }
    }

    if (!formData.gender) newErrors.gender = "Gender is required"

    // Education validation for children only
    const age =
      dobColumnExists && formData.dateOfBirth ? calculateAge(formData.dateOfBirth) : Number.parseInt(formData.age) || 0

    if (formData.relation === "child" && age <= 25 && formData.goesToSchool) {
      if (!formData.educationType) newErrors.educationType = "Education type is required"
      if (!formData.institutionName.trim()) newErrors.institutionName = "Institution name is required"
      if (formData.educationType === "university" && !formData.courseMajor.trim()) {
        newErrors.courseMajor = "Course/Major is required for university students"
      }
      if (!formData.yearGrade.trim()) newErrors.yearGrade = "Year/Grade is required"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleAddProfile = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) return

    if (!validateForm(newProfile)) return

    setIsSubmitting(true)
    try {
      // Calculate age from DOB or use provided age
      const age =
        dobColumnExists && newProfile.dateOfBirth
          ? calculateAge(newProfile.dateOfBirth)
          : Number.parseInt(newProfile.age) || 0

      let description = `${getAgeCategory(age)}`

      if (dobColumnExists && newProfile.dateOfBirth) {
        description += ` (${getAgeDisplay(newProfile.dateOfBirth)})`
      } else {
        description += ` (${age} years old)`
      }

      description += `, ${newProfile.gender}`

      if (newProfile.relation === "child" && age <= 25 && newProfile.goesToSchool) {
        description += `, ${newProfile.educationType}`
        if (newProfile.institutionName) description += ` at ${newProfile.institutionName}`
        if (newProfile.courseMajor) description += ` (${newProfile.courseMajor})`
        if (newProfile.yearGrade) description += `, ${newProfile.yearGrade}`
        if (newProfile.hasUniform) description += `, Has uniform/dress code`
      }

      if (newProfile.weatherEssentials.length > 0) {
        const essentialLabels = newProfile.weatherEssentials
          .map((id) => WEATHER_ESSENTIALS.find((item) => item.id === id)?.label)
          .filter(Boolean)
        description += `. Weather essentials: ${essentialLabels.join(", ")}`
      }

      if (newProfile.dressCodeNotes) {
        description += `. Dress code notes: ${newProfile.dressCodeNotes}`
      }

      const profileData = {
        user_id: user.id,
        name: newProfile.name,
        relation: newProfile.relation || undefined,
        age: age,
        date_of_birth: dobColumnExists ? newProfile.dateOfBirth : undefined,
        profile_picture_url: undefined,
        profile_picture_path: undefined,
        is_owner: false,
      }

      const savedProfile = await wardrobeProfileService.addWardrobeProfile(profileData)
      if (!savedProfile) {
        throw new Error("Failed to create profile")
      }

      // Upload profile picture if provided
      if (newProfile.profilePicture) {
        try {
          const imageResult = await wardrobeProfileService.uploadProfilePicture(
            newProfile.profilePicture,
            user.id,
            savedProfile.id,
          )
          await wardrobeProfileService.updateWardrobeProfile(savedProfile.id, {
            profile_picture_url: imageResult.url,
            profile_picture_path: imageResult.path,
          })
        } catch (imageError) {
          console.error("Error uploading profile picture:", imageError)
        }
      }

      // Reset form
      setNewProfile({
        name: "",
        relation: "",
        dateOfBirth: "",
        age: "",
        gender: "",
        profilePicture: null,
        goesToSchool: false,
        educationType: "school",
        institutionName: "",
        courseMajor: "",
        yearGrade: "",
        hasUniform: false,
        dressCodeNotes: "",
        weatherEssentials: [],
      })
      setImagePreview(null)
      setErrors({})
      setShowAddDialog(false)

      // Reload profiles
      await loadWardrobeProfiles()
    } catch (error) {
      console.error("Error adding profile:", error)
      setErrors({ submit: "Failed to add profile. Please try again." })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleEditProfile = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user || !editingProfile) return

    if (!validateForm(editProfile)) return

    setIsSubmitting(true)
    try {
      // Calculate age from DOB or use provided age
      const age =
        dobColumnExists && editProfile.dateOfBirth
          ? calculateAge(editProfile.dateOfBirth)
          : Number.parseInt(editProfile.age) || 0

      // Upload new profile picture if provided
      const updateData: Partial<WardrobeProfile> = {
        name: editProfile.name,
        relation: editProfile.relation || undefined,
        age: age,
      }

      // Only include date_of_birth if the column exists
      if (dobColumnExists) {
        updateData.date_of_birth = editProfile.dateOfBirth
      }

      if (editProfile.profilePicture) {
        try {
          const imageResult = await wardrobeProfileService.uploadProfilePicture(
            editProfile.profilePicture,
            user.id,
            editingProfile.id,
          )
          updateData.profile_picture_url = imageResult.url
          updateData.profile_picture_path = imageResult.path
        } catch (imageError) {
          console.error("Error uploading profile picture:", imageError)
        }
      }

      const updatedProfile = await wardrobeProfileService.updateWardrobeProfile(editingProfile.id, updateData)
      if (!updatedProfile) {
        throw new Error("Failed to update profile")
      }

      // Reset form and close dialog
      setEditProfile({
        name: "",
        relation: "",
        dateOfBirth: "",
        age: "",
        gender: "",
        profilePicture: null,
        goesToSchool: false,
        educationType: "school",
        institutionName: "",
        courseMajor: "",
        yearGrade: "",
        hasUniform: false,
        dressCodeNotes: "",
        weatherEssentials: [],
      })
      setEditImagePreview(null)
      setEditingProfile(null)
      setErrors({})
      setShowEditDialog(false)

      // Reload profiles
      await loadWardrobeProfiles()
    } catch (error) {
      console.error("Error updating profile:", error)
      setErrors({ submit: "Failed to update profile. Please try again." })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDeleteProfile = async (profileId: string) => {
    if (!user) return

    const confirmed = window.confirm(
      "Are you sure you want to delete this family member's wardrobe? This action cannot be undone and will delete all their clothing items.",
    )

    if (!confirmed) return

    try {
      setIsSubmitting(true)
      await wardrobeProfileService.deleteWardrobeProfile(profileId)
      await loadWardrobeProfiles()
    } catch (error) {
      console.error("Error deleting profile:", error)
      alert("Failed to delete profile. Please try again.")
    } finally {
      setIsSubmitting(false)
    }
  }

  const openEditDialog = (wardrobe: WardrobeProfileDisplay) => {
    if (!wardrobe.profileData) return

    setEditingProfile(wardrobe.profileData)
    setEditProfile({
      name: wardrobe.profileData.name,
      relation: wardrobe.profileData.relation || "",
      dateOfBirth: wardrobe.profileData.date_of_birth || "",
      age: wardrobe.profileData.age?.toString() || "",
      gender: "", // This would need to be stored in the profile - for now default to empty
      profilePicture: null,
      goesToSchool: false, // Default values - could be stored in profile description or separate fields
      educationType: "school",
      institutionName: "",
      courseMajor: "",
      yearGrade: "",
      hasUniform: false,
      dressCodeNotes: "",
      weatherEssentials: [], // Default empty - could parse from profile description
    })
    setEditImagePreview(wardrobe.profileData.profile_picture_url || null)
    setShowEditDialog(true)
  }

  const handleWeatherEssentialToggle = (essentialId: string, isEdit = false) => {
    if (isEdit) {
      setEditProfile((prev) => ({
        ...prev,
        weatherEssentials: prev.weatherEssentials.includes(essentialId)
          ? prev.weatherEssentials.filter((id) => id !== essentialId)
          : [...prev.weatherEssentials, essentialId],
      }))
    } else {
      setNewProfile((prev) => ({
        ...prev,
        weatherEssentials: prev.weatherEssentials.includes(essentialId)
          ? prev.weatherEssentials.filter((id) => id !== essentialId)
          : [...prev.weatherEssentials, essentialId],
      }))
    }
  }

  // Function to create navigation URL with referrer
  const createNavUrl = (path: string) => {
    return `${path}?from=/wardrobes`
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-white border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-400">Loading your wardrobes...</p>
        </div>
      </div>
    )
  }

  // Calculate age based on available data
  const age =
    dobColumnExists && newProfile.dateOfBirth
      ? calculateAge(newProfile.dateOfBirth)
      : Number.parseInt(newProfile.age) || 0

  const editAge =
    dobColumnExists && editProfile.dateOfBirth
      ? calculateAge(editProfile.dateOfBirth)
      : Number.parseInt(editProfile.age) || 0

  const showEducation = newProfile.relation === "child" && age <= 25
  const showEditEducation = editProfile.relation === "child" && editAge <= 25
  const showWeatherEssentials = age >= 0 && age <= 25
  const showEditWeatherEssentials = editAge >= 0 && editAge <= 25

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
      {/* Navigation */}
      <nav className="bg-gray-800/50 backdrop-blur-sm border-b border-gray-700 sticky top-0 z-50">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button variant="ghost" onClick={handleBack} className="text-gray-300 hover:text-white hover:bg-gray-700">
                <ArrowLeft className="w-4 h-4 mr-2" />
                {getBackButtonText()}
              </Button>
              <div className="text-gray-400">|</div>
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center">
                  <Users className="w-4 h-4 text-black" />
                </div>
                <h1 className="text-2xl font-bold text-white">My Wardrobes</h1>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <Link href={createNavUrl("/weather-essentials")}>
                <Button
                  variant="outline"
                  size="sm"
                  className="border-gray-600 hover:bg-gray-700 bg-transparent text-gray-300 hover:text-white"
                >
                  <Cloud className="w-4 h-4 mr-2" />
                  Weather Essentials
                </Button>
              </Link>
              {user && (
                <>
                  <div className="text-sm text-gray-400">{user.email}</div>
                  <Button
                    onClick={async () => {
                      await signOut()
                      router.push("/landing")
                    }}
                    variant="outline"
                    size="sm"
                    className="border-gray-600 hover:bg-gray-700 bg-transparent text-gray-300 hover:text-white"
                  >
                    Logout
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Profile Column Status Alert */}
      {!profileColumnExists && wardrobes.length > 1 && (
        <div className="bg-blue-900/50 border-blue-700 text-blue-100 border rounded-lg p-4 mx-6 mt-4">
          <div className="flex items-center">
            <div className="w-4 h-4 text-blue-400 mr-2">ℹ️</div>
            <div>
              <span className="font-semibold">Database Update Required:</span> The wardrobe profile feature is not fully
              activated yet. All items are currently stored in your main wardrobe. Please run the database migration
              script to enable separate wardrobes for each family member.
            </div>
          </div>
        </div>
      )}

      <div className="container mx-auto px-6 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-3xl font-bold text-white mb-2">Wardrobe Collection</h2>
            <p className="text-gray-400">Manage wardrobes for yourself and your family members</p>
          </div>

          <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
            <DialogTrigger asChild>
              <Button className="bg-white hover:bg-gray-200 text-black shadow-lg">
                <Plus className="w-4 h-4 mr-2" />
                Add Family Member
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-gray-800 border-gray-700 text-white max-w-4xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <Users className="w-5 h-5" />
                  Add Family Member Wardrobe
                </DialogTitle>
              </DialogHeader>
              <form onSubmit={handleAddProfile} className="space-y-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Left Column - Basic Info */}
                  <div className="space-y-4">
                    {/* Profile Picture */}
                    <div>
                      <Label className="text-sm font-semibold text-gray-300">Profile Picture</Label>
                      <div className="mt-3">
                        {imagePreview ? (
                          <div className="relative w-24 h-24 mx-auto">
                            <img
                              src={imagePreview || "/placeholder.svg"}
                              alt="Preview"
                              className="w-full h-full object-cover rounded-full border-2 border-gray-600"
                            />
                            <Button
                              type="button"
                              variant="destructive"
                              size="sm"
                              className="absolute -top-1 -right-1 rounded-full w-6 h-6 p-0"
                              onClick={() => {
                                setImagePreview(null)
                                setNewProfile({ ...newProfile, profilePicture: null })
                              }}
                            >
                              <X className="w-3 h-3" />
                            </Button>
                          </div>
                        ) : (
                          <div className="border-2 border-dashed border-gray-600 rounded-lg p-6 text-center">
                            <div className="w-12 h-12 bg-gray-600 rounded-full flex items-center justify-center mx-auto mb-2">
                              <Upload className="w-6 h-6 text-gray-400" />
                            </div>
                            <p className="text-sm text-gray-400 mb-2">Upload profile picture</p>
                            <Input
                              type="file"
                              accept="image/*"
                              onChange={handleImageChange}
                              className="hidden"
                              id="profile-picture"
                            />
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={() => document.getElementById("profile-picture")?.click()}
                              className="bg-gray-700 hover:bg-gray-600 border-gray-600 text-white"
                            >
                              Choose Image
                            </Button>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Name - Required */}
                    <div>
                      <Label htmlFor="name" className="text-sm font-semibold text-gray-300">
                        Name <span className="text-red-400">*</span>
                      </Label>
                      <Input
                        id="name"
                        value={newProfile.name}
                        onChange={(e) => setNewProfile({ ...newProfile, name: e.target.value })}
                        placeholder="e.g., Emma, Dad, Mom, Sarah"
                        required
                        className="mt-2 bg-gray-700 border-gray-600 text-white"
                      />
                      {errors.name && <p className="text-red-400 text-sm mt-1">{errors.name}</p>}
                    </div>

                    {/* Relationship - Required */}
                    <div>
                      <Label htmlFor="relation" className="text-sm font-semibold text-gray-300">
                        Relationship <span className="text-red-400">*</span>
                      </Label>
                      <Select
                        value={newProfile.relation}
                        onValueChange={(value) => setNewProfile({ ...newProfile, relation: value })}
                      >
                        <SelectTrigger className="mt-2 bg-gray-700 border-gray-600 text-white">
                          <SelectValue placeholder="Select relationship" />
                        </SelectTrigger>
                        <SelectContent className="bg-gray-800 text-white border-gray-700">
                          <SelectItem value="spouse">
                            <div className="flex items-center gap-2">
                              <UserHeart className="w-4 h-4 text-pink-400" />
                              Spouse
                            </div>
                          </SelectItem>
                          <SelectItem value="partner">
                            <div className="flex items-center gap-2">
                              <UserHeart className="w-4 h-4 text-pink-400" />
                              Partner
                            </div>
                          </SelectItem>
                          <SelectItem value="child">
                            <div className="flex items-center gap-2">
                              <Baby className="w-4 h-4 text-blue-400" />
                              Child
                            </div>
                          </SelectItem>
                          <SelectItem value="parent">
                            <div className="flex items-center gap-2">
                              <User className="w-4 h-4 text-green-400" />
                              Parent
                            </div>
                          </SelectItem>
                          <SelectItem value="sibling">
                            <div className="flex items-center gap-2">
                              <Users className="w-4 h-4 text-blue-400" />
                              Sibling
                            </div>
                          </SelectItem>
                          <SelectItem value="grandparent">
                            <div className="flex items-center gap-2">
                              <User className="w-4 h-4 text-purple-400" />
                              Grandparent
                            </div>
                          </SelectItem>
                          <SelectItem value="grandchild">
                            <div className="flex items-center gap-2">
                              <Baby className="w-4 h-4 text-yellow-400" />
                              Grandchild
                            </div>
                          </SelectItem>
                          <SelectItem value="friend">
                            <div className="flex items-center gap-2">
                              <Heart className="w-4 h-4 text-orange-400" />
                              Friend
                            </div>
                          </SelectItem>
                          <SelectItem value="other">
                            <div className="flex items-center gap-2">
                              <User className="w-4 h-4 text-gray-400" />
                              Other Family Member
                            </div>
                          </SelectItem>
                        </SelectContent>
                      </Select>
                      {errors.relation && <p className="text-red-400 text-sm mt-1">{errors.relation}</p>}
                    </div>

                    {/* Date of Birth or Age - Required */}
                    {dobColumnExists ? (
                      <div>
                        <Label htmlFor="dateOfBirth" className="text-sm font-semibold text-gray-300">
                          Date of Birth <span className="text-red-400">*</span>
                        </Label>
                        <div className="relative mt-2">
                          <Input
                            id="dateOfBirth"
                            type="date"
                            value={newProfile.dateOfBirth}
                            onChange={(e) => setNewProfile({ ...newProfile, dateOfBirth: e.target.value })}
                            required
                            max={new Date().toISOString().split("T")[0]}
                            className="bg-gray-700 border-gray-600 text-white"
                          />
                          <CalendarDays className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                        </div>
                        {newProfile.dateOfBirth && (
                          <p className="text-xs text-blue-400 mt-1">
                            Current age: {getAgeDisplay(newProfile.dateOfBirth)}
                          </p>
                        )}
                        {errors.dateOfBirth && <p className="text-red-400 text-sm mt-1">{errors.dateOfBirth}</p>}
                      </div>
                    ) : (
                      <div>
                        <Label htmlFor="age" className="text-sm font-semibold text-gray-300">
                          Age <span className="text-red-400">*</span>
                        </Label>
                        <Input
                          id="age"
                          type="number"
                          min="0"
                          max="120"
                          value={newProfile.age}
                          onChange={(e) => setNewProfile({ ...newProfile, age: e.target.value })}
                          placeholder="e.g., 8, 25, 45"
                          required
                          className="mt-2 bg-gray-700 border-gray-600 text-white"
                        />
                        <p className="text-xs text-gray-500 mt-1">
                          Age helps customize clothing suggestions and categories
                        </p>
                        {errors.age && <p className="text-red-400 text-sm mt-1">{errors.age}</p>}
                      </div>
                    )}

                    {/* Gender - Required */}
                    <div>
                      <Label className="text-sm font-semibold text-gray-300">
                        Gender <span className="text-red-400">*</span>
                      </Label>
                      <div className="mt-2 grid grid-cols-2 gap-2">
                        <label className="flex items-center space-x-2 cursor-pointer">
                          <input
                            type="radio"
                            name="gender"
                            value="male"
                            checked={newProfile.gender === "male"}
                            onChange={(e) => setNewProfile({ ...newProfile, gender: e.target.value })}
                            className="text-blue-500"
                          />
                          <span className="text-sm text-gray-300">Male</span>
                        </label>
                        <label className="flex items-center space-x-2 cursor-pointer">
                          <input
                            type="radio"
                            name="gender"
                            value="female"
                            checked={newProfile.gender === "female"}
                            onChange={(e) => setNewProfile({ ...newProfile, gender: e.target.value })}
                            className="text-blue-500"
                          />
                          <span className="text-sm text-gray-300">Female</span>
                        </label>
                        <label className="flex items-center space-x-2 cursor-pointer">
                          <input
                            type="radio"
                            name="gender"
                            value="non-binary"
                            checked={newProfile.gender === "non-binary"}
                            onChange={(e) => setNewProfile({ ...newProfile, gender: e.target.value })}
                            className="text-blue-500"
                          />
                          <span className="text-sm text-gray-300">Non-binary</span>
                        </label>
                        <label className="flex items-center space-x-2 cursor-pointer">
                          <input
                            type="radio"
                            name="gender"
                            value="prefer-not-to-say"
                            checked={newProfile.gender === "prefer-not-to-say"}
                            onChange={(e) => setNewProfile({ ...newProfile, gender: e.target.value })}
                            className="text-blue-500"
                          />
                          <span className="text-sm text-gray-300">Prefer not to say</span>
                        </label>
                      </div>
                      {errors.gender && <p className="text-red-400 text-sm mt-1">{errors.gender}</p>}
                    </div>
                  </div>

                  {/* Right Column - Age-Specific Features */}
                  <div className="space-y-4">
                    {/* Age Category Display */}
                    {((dobColumnExists && newProfile.dateOfBirth) ||
                      (!dobColumnExists && newProfile.age && Number.parseInt(newProfile.age) > 0)) && (
                      <div className="bg-gray-700/30 rounded-lg p-4 border border-gray-600/30">
                        <h4 className="text-white font-medium mb-2 flex items-center gap-2">
                          {age < 2 && <Baby className="w-4 h-4" />}
                          {age >= 2 && age < 6 && <Baby className="w-4 h-4" />}
                          {age >= 6 && age < 13 && <GraduationCap className="w-4 h-4" />}
                          {age >= 13 && age < 18 && <User className="w-4 h-4" />}
                          {age >= 18 && <Briefcase className="w-4 h-4" />}
                          Age Category: {getAgeCategory(age)}
                        </h4>
                        <p className="text-sm text-blue-400">
                          {dobColumnExists && newProfile.dateOfBirth
                            ? getAgeDisplay(newProfile.dateOfBirth)
                            : `${age} years old`}
                        </p>
                      </div>
                    )}

                    {/* Education Section - Only for children aged 25 or under */}
                    {showEducation && (
                      <div className="bg-blue-900/20 rounded-lg p-4 border border-blue-600/30">
                        <h4 className="text-white font-medium mb-3 flex items-center gap-2">
                          <GraduationCap className="w-4 h-4" />
                          Education Information
                        </h4>

                        <div className="flex items-center space-x-2 mb-3">
                          <input
                            type="checkbox"
                            id="goes-to-school"
                            checked={newProfile.goesToSchool}
                            onChange={(e) => setNewProfile({ ...newProfile, goesToSchool: e.target.checked })}
                            className="rounded border-gray-500 text-blue-500 focus:ring-blue-400"
                          />
                          <Label htmlFor="goes-to-school" className="text-gray-300 flex items-center gap-2">
                            <BookOpen className="w-4 h-4" />
                            Goes to school/university
                          </Label>
                        </div>

                        {newProfile.goesToSchool && (
                          <div className="space-y-3">
                            <div>
                              <Label className="text-xs text-gray-400">Education Type</Label>
                              <Select
                                value={newProfile.educationType}
                                onValueChange={(value) => setNewProfile({ ...newProfile, educationType: value })}
                              >
                                <SelectTrigger className="mt-1 bg-gray-700 border-gray-600 text-white text-sm">
                                  <SelectValue placeholder="Select education type" />
                                </SelectTrigger>
                                <SelectContent className="bg-gray-800 text-white border-gray-700">
                                  <SelectItem value="school">School (K-12)</SelectItem>
                                  <SelectItem value="university">University/College</SelectItem>
                                  <SelectItem value="other">Other Education</SelectItem>
                                </SelectContent>
                              </Select>
                              {errors.educationType && (
                                <p className="text-red-400 text-sm mt-1">{errors.educationType}</p>
                              )}
                            </div>

                            <div>
                              <Label className="text-xs text-gray-400">
                                {newProfile.educationType === "university" ? "University/College Name" : "School Name"}
                              </Label>
                              <Input
                                value={newProfile.institutionName || ""}
                                onChange={(e) => setNewProfile({ ...newProfile, institutionName: e.target.value })}
                                placeholder={
                                  newProfile.educationType === "university"
                                    ? "Enter university name"
                                    : "Enter school name"
                                }
                                className="mt-1 bg-gray-700 border-gray-600 text-white text-sm"
                              />
                              {errors.institutionName && (
                                <p className="text-red-400 text-sm mt-1">{errors.institutionName}</p>
                              )}
                            </div>

                            {newProfile.educationType === "university" && (
                              <div>
                                <Label className="text-xs text-gray-400">Course/Major</Label>
                                <Input
                                  value={newProfile.courseMajor || ""}
                                  onChange={(e) => setNewProfile({ ...newProfile, courseMajor: e.target.value })}
                                  placeholder="e.g., Computer Science, Business"
                                  className="mt-1 bg-gray-700 border-gray-600 text-white text-sm"
                                />
                                {errors.courseMajor && (
                                  <p className="text-red-400 text-sm mt-1">{errors.courseMajor}</p>
                                )}
                              </div>
                            )}

                            <div>
                              <Label className="text-xs text-gray-400">
                                {newProfile.educationType === "university" ? "Year" : "Grade"}
                              </Label>
                              <Input
                                value={newProfile.yearGrade || ""}
                                onChange={(e) => setNewProfile({ ...newProfile, yearGrade: e.target.value })}
                                placeholder={
                                  newProfile.educationType === "university" ? "e.g., 2nd Year" : "e.g., Grade 10"
                                }
                                className="mt-1 bg-gray-700 border-gray-600 text-white text-sm"
                              />
                              {errors.yearGrade && <p className="text-red-400 text-sm mt-1">{errors.yearGrade}</p>}
                            </div>

                            <div className="flex items-center space-x-2">
                              <input
                                type="checkbox"
                                id="uniform-required"
                                checked={newProfile.hasUniform || false}
                                onChange={(e) => setNewProfile({ ...newProfile, hasUniform: e.target.checked })}
                                className="rounded border-gray-500 text-blue-500 focus:ring-blue-400"
                              />
                              <Label htmlFor="uniform-required" className="text-xs text-gray-300">
                                {newProfile.educationType === "university"
                                  ? "Dress code required"
                                  : "School uniform required"}
                              </Label>
                            </div>

                            {newProfile.hasUniform && (
                              <div>
                                <Label className="text-xs text-gray-400">Dress Code Notes</Label>
                                <Textarea
                                  value={newProfile.dressCodeNotes}
                                  onChange={(e) => setNewProfile({ ...newProfile, dressCodeNotes: e.target.value })}
                                  placeholder="Describe uniform requirements or dress code..."
                                  className="mt-1 bg-gray-700 border-gray-600 text-white text-sm"
                                  rows={2}
                                />
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    )}

                    {/* Weather Essentials - Ages 0-25 */}
                    {showWeatherEssentials && (
                      <div className="bg-green-900/20 rounded-lg p-4 border border-green-600/30">
                        <h4 className="text-white font-medium mb-3 flex items-center gap-2">
                          <CloudRain className="w-4 h-4" />
                          Weather Essentials Needed
                        </h4>
                        <p className="text-xs text-gray-400 mb-3">
                          Check items that {newProfile.name || "this person"} needs for different weather conditions
                        </p>
                        <div className="grid grid-cols-2 gap-2">
                          {WEATHER_ESSENTIALS.map((essential) => (
                            <div key={essential.id} className="flex items-center space-x-2">
                              <input
                                type="checkbox"
                                id={essential.id}
                                checked={newProfile.weatherEssentials?.includes(essential.id) || false}
                                onChange={() => handleWeatherEssentialToggle(essential.id)}
                                className="rounded border-gray-500 text-green-500 focus:ring-green-400"
                              />
                              <Label htmlFor={essential.id} className="text-xs text-gray-300 flex items-center gap-1">
                                <essential.icon className="w-3 h-3" />
                                {essential.label}
                              </Label>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {errors.submit && <div className="text-red-400 text-sm text-center">{errors.submit}</div>}

                <div className="flex gap-3 pt-4">
                  <Button
                    type="submit"
                    disabled={
                      !newProfile.name ||
                      !newProfile.relation ||
                      (dobColumnExists ? !newProfile.dateOfBirth : !newProfile.age) ||
                      !newProfile.gender ||
                      isSubmitting
                    }
                    className="flex-1 bg-white hover:bg-gray-200 text-black"
                  >
                    {isSubmitting ? (
                      <>
                        <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin mr-2" />
                        Adding...
                      </>
                    ) : (
                      <>
                        <Plus className="w-4 h-4 mr-2" />
                        Add Wardrobe
                      </>
                    )}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setShowAddDialog(false)}
                    className="border-gray-600 hover:bg-gray-700 bg-transparent text-white"
                  >
                    Cancel
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Edit Profile Dialog - Now with all the same options as Add */}
        <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
          <DialogContent className="bg-gray-800 border-gray-700 text-white max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Edit className="w-5 h-5" />
                Edit Family Member Profile
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleEditProfile} className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Left Column - Basic Info */}
                <div className="space-y-4">
                  {/* Profile Picture */}
                  <div>
                    <Label className="text-sm font-semibold text-gray-300">Profile Picture</Label>
                    <div className="mt-3">
                      {editImagePreview ? (
                        <div className="relative w-24 h-24 mx-auto">
                          <img
                            src={editImagePreview || "/placeholder.svg"}
                            alt="Preview"
                            className="w-full h-full object-cover rounded-full border-2 border-gray-600"
                          />
                          <Button
                            type="button"
                            variant="destructive"
                            size="sm"
                            className="absolute -top-1 -right-1 rounded-full w-6 h-6 p-0"
                            onClick={() => {
                              setEditImagePreview(null)
                              setEditProfile({ ...editProfile, profilePicture: null })
                            }}
                          >
                            <X className="w-3 h-3" />
                          </Button>
                        </div>
                      ) : (
                        <div className="border-2 border-dashed border-gray-600 rounded-lg p-6 text-center">
                          <div className="w-12 h-12 bg-gray-600 rounded-full flex items-center justify-center mx-auto mb-2">
                            <Upload className="w-6 h-6 text-gray-400" />
                          </div>
                          <p className="text-sm text-gray-400 mb-2">Upload profile picture</p>
                          <Input
                            type="file"
                            accept="image/*"
                            onChange={handleEditImageChange}
                            className="hidden"
                            id="edit-profile-picture"
                          />
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => document.getElementById("edit-profile-picture")?.click()}
                            className="bg-gray-700 hover:bg-gray-600 border-gray-600 text-white"
                          >
                            Choose Image
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Name - Required */}
                  <div>
                    <Label htmlFor="edit-name" className="text-sm font-semibold text-gray-300">
                      Name <span className="text-red-400">*</span>
                    </Label>
                    <Input
                      id="edit-name"
                      value={editProfile.name}
                      onChange={(e) => setEditProfile({ ...editProfile, name: e.target.value })}
                      placeholder="e.g., Emma, Dad, Mom, Sarah"
                      required
                      className="mt-2 bg-gray-700 border-gray-600 text-white"
                    />
                    {errors.name && <p className="text-red-400 text-sm mt-1">{errors.name}</p>}
                  </div>

                  {/* Relationship - Required */}
                  <div>
                    <Label htmlFor="edit-relation" className="text-sm font-semibold text-gray-300">
                      Relationship <span className="text-red-400">*</span>
                    </Label>
                    <Select
                      value={editProfile.relation}
                      onValueChange={(value) => setEditProfile({ ...editProfile, relation: value })}
                    >
                      <SelectTrigger className="mt-2 bg-gray-700 border-gray-600 text-white">
                        <SelectValue placeholder="Select relationship" />
                      </SelectTrigger>
                      <SelectContent className="bg-gray-800 text-white border-gray-700">
                        <SelectItem value="spouse">
                          <div className="flex items-center gap-2">
                            <UserHeart className="w-4 h-4 text-pink-400" />
                            Spouse
                          </div>
                        </SelectItem>
                        <SelectItem value="partner">
                          <div className="flex items-center gap-2">
                            <UserHeart className="w-4 h-4 text-pink-400" />
                            Partner
                          </div>
                        </SelectItem>
                        <SelectItem value="child">
                          <div className="flex items-center gap-2">
                            <Baby className="w-4 h-4 text-blue-400" />
                            Child
                          </div>
                        </SelectItem>
                        <SelectItem value="parent">
                          <div className="flex items-center gap-2">
                            <User className="w-4 h-4 text-green-400" />
                            Parent
                          </div>
                        </SelectItem>
                        <SelectItem value="sibling">
                          <div className="flex items-center gap-2">
                            <Users className="w-4 h-4 text-blue-400" />
                            Sibling
                          </div>
                        </SelectItem>
                        <SelectItem value="grandparent">
                          <div className="flex items-center gap-2">
                            <User className="w-4 h-4 text-purple-400" />
                            Grandparent
                          </div>
                        </SelectItem>
                        <SelectItem value="grandchild">
                          <div className="flex items-center gap-2">
                            <Baby className="w-4 h-4 text-yellow-400" />
                            Grandchild
                          </div>
                        </SelectItem>
                        <SelectItem value="friend">
                          <div className="flex items-center gap-2">
                            <Heart className="w-4 h-4 text-orange-400" />
                            Friend
                          </div>
                        </SelectItem>
                        <SelectItem value="other">
                          <div className="flex items-center gap-2">
                            <User className="w-4 h-4 text-gray-400" />
                            Other Family Member
                          </div>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                    {errors.relation && <p className="text-red-400 text-sm mt-1">{errors.relation}</p>}
                  </div>

                  {/* Date of Birth or Age - Required */}
                  {dobColumnExists ? (
                    <div>
                      <Label htmlFor="edit-dateOfBirth" className="text-sm font-semibold text-gray-300">
                        Date of Birth <span className="text-red-400">*</span>
                      </Label>
                      <div className="relative mt-2">
                        <Input
                          id="edit-dateOfBirth"
                          type="date"
                          value={editProfile.dateOfBirth}
                          onChange={(e) => setEditProfile({ ...editProfile, dateOfBirth: e.target.value })}
                          required
                          max={new Date().toISOString().split("T")[0]}
                          className="bg-gray-700 border-gray-600 text-white"
                        />
                        <CalendarDays className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                      </div>
                      {editProfile.dateOfBirth && (
                        <p className="text-xs text-blue-400 mt-1">
                          Current age: {getAgeDisplay(editProfile.dateOfBirth)}
                        </p>
                      )}
                      {errors.dateOfBirth && <p className="text-red-400 text-sm mt-1">{errors.dateOfBirth}</p>}
                    </div>
                  ) : (
                    <div>
                      <Label htmlFor="edit-age" className="text-sm font-semibold text-gray-300">
                        Age <span className="text-red-400">*</span>
                      </Label>
                      <Input
                        id="edit-age"
                        type="number"
                        min="0"
                        max="120"
                        value={editProfile.age}
                        onChange={(e) => setEditProfile({ ...editProfile, age: e.target.value })}
                        placeholder="e.g., 8, 25, 45"
                        required
                        className="mt-2 bg-gray-700 border-gray-600 text-white"
                      />
                      {errors.age && <p className="text-red-400 text-sm mt-1">{errors.age}</p>}
                    </div>
                  )}

                  {/* Gender - Required */}
                  <div>
                    <Label className="text-sm font-semibold text-gray-300">
                      Gender <span className="text-red-400">*</span>
                    </Label>
                    <div className="mt-2 grid grid-cols-2 gap-2">
                      <label className="flex items-center space-x-2 cursor-pointer">
                        <input
                          type="radio"
                          name="edit-gender"
                          value="male"
                          checked={editProfile.gender === "male"}
                          onChange={(e) => setEditProfile({ ...editProfile, gender: e.target.value })}
                          className="text-blue-500"
                        />
                        <span className="text-sm text-gray-300">Male</span>
                      </label>
                      <label className="flex items-center space-x-2 cursor-pointer">
                        <input
                          type="radio"
                          name="edit-gender"
                          value="female"
                          checked={editProfile.gender === "female"}
                          onChange={(e) => setEditProfile({ ...editProfile, gender: e.target.value })}
                          className="text-blue-500"
                        />
                        <span className="text-sm text-gray-300">Female</span>
                      </label>
                      <label className="flex items-center space-x-2 cursor-pointer">
                        <input
                          type="radio"
                          name="edit-gender"
                          value="non-binary"
                          checked={editProfile.gender === "non-binary"}
                          onChange={(e) => setEditProfile({ ...editProfile, gender: e.target.value })}
                          className="text-blue-500"
                        />
                        <span className="text-sm text-gray-300">Non-binary</span>
                      </label>
                      <label className="flex items-center space-x-2 cursor-pointer">
                        <input
                          type="radio"
                          name="edit-gender"
                          value="prefer-not-to-say"
                          checked={editProfile.gender === "prefer-not-to-say"}
                          onChange={(e) => setEditProfile({ ...editProfile, gender: e.target.value })}
                          className="text-blue-500"
                        />
                        <span className="text-sm text-gray-300">Prefer not to say</span>
                      </label>
                    </div>
                    {errors.gender && <p className="text-red-400 text-sm mt-1">{errors.gender}</p>}
                  </div>
                </div>

                {/* Right Column - Age-Specific Features */}
                <div className="space-y-4">
                  {/* Age Category Display */}
                  {((dobColumnExists && editProfile.dateOfBirth) ||
                    (!dobColumnExists && editProfile.age && Number.parseInt(editProfile.age) > 0)) && (
                    <div className="bg-gray-700/30 rounded-lg p-4 border border-gray-600/30">
                      <h4 className="text-white font-medium mb-2 flex items-center gap-2">
                        {editAge < 2 && <Baby className="w-4 h-4" />}
                        {editAge >= 2 && editAge < 6 && <Baby className="w-4 h-4" />}
                        {editAge >= 6 && editAge < 13 && <GraduationCap className="w-4 h-4" />}
                        {editAge >= 13 && editAge < 18 && <User className="w-4 h-4" />}
                        {editAge >= 18 && <Briefcase className="w-4 h-4" />}
                        Age Category: {getAgeCategory(editAge)}
                      </h4>
                      <p className="text-sm text-blue-400">
                        {dobColumnExists && editProfile.dateOfBirth
                          ? getAgeDisplay(editProfile.dateOfBirth)
                          : `${editAge} years old`}
                      </p>
                    </div>
                  )}

                  {/* Education Section - Only for children aged 25 or under */}
                  {showEditEducation && (
                    <div className="bg-blue-900/20 rounded-lg p-4 border border-blue-600/30">
                      <h4 className="text-white font-medium mb-3 flex items-center gap-2">
                        <GraduationCap className="w-4 h-4" />
                        Education Information
                      </h4>

                      <div className="flex items-center space-x-2 mb-3">
                        <input
                          type="checkbox"
                          id="edit-goes-to-school"
                          checked={editProfile.goesToSchool}
                          onChange={(e) => setEditProfile({ ...editProfile, goesToSchool: e.target.checked })}
                          className="rounded border-gray-500 text-blue-500 focus:ring-blue-400"
                        />
                        <Label htmlFor="edit-goes-to-school" className="text-gray-300 flex items-center gap-2">
                          <BookOpen className="w-4 h-4" />
                          Goes to school/university
                        </Label>
                      </div>

                      {editProfile.goesToSchool && (
                        <div className="space-y-3">
                          <div>
                            <Label className="text-xs text-gray-400">Education Type</Label>
                            <Select
                              value={editProfile.educationType}
                              onValueChange={(value) => setEditProfile({ ...editProfile, educationType: value })}
                            >
                              <SelectTrigger className="mt-1 bg-gray-700 border-gray-600 text-white text-sm">
                                <SelectValue placeholder="Select education type" />
                              </SelectTrigger>
                              <SelectContent className="bg-gray-800 text-white border-gray-700">
                                <SelectItem value="school">School (K-12)</SelectItem>
                                <SelectItem value="university">University/College</SelectItem>
                                <SelectItem value="other">Other Education</SelectItem>
                              </SelectContent>
                            </Select>
                            {errors.educationType && (
                              <p className="text-red-400 text-sm mt-1">{errors.educationType}</p>
                            )}
                          </div>

                          <div>
                            <Label className="text-xs text-gray-400">
                              {editProfile.educationType === "university" ? "University/College Name" : "School Name"}
                            </Label>
                            <Input
                              value={editProfile.institutionName || ""}
                              onChange={(e) => setEditProfile({ ...editProfile, institutionName: e.target.value })}
                              placeholder={
                                editProfile.educationType === "university"
                                  ? "Enter university name"
                                  : "Enter school name"
                              }
                              className="mt-1 bg-gray-700 border-gray-600 text-white text-sm"
                            />
                            {errors.institutionName && (
                              <p className="text-red-400 text-sm mt-1">{errors.institutionName}</p>
                            )}
                          </div>

                          {editProfile.educationType === "university" && (
                            <div>
                              <Label className="text-xs text-gray-400">Course/Major</Label>
                              <Input
                                value={editProfile.courseMajor || ""}
                                onChange={(e) => setEditProfile({ ...editProfile, courseMajor: e.target.value })}
                                placeholder="e.g., Computer Science, Business"
                                className="mt-1 bg-gray-700 border-gray-600 text-white text-sm"
                              />
                              {errors.courseMajor && <p className="text-red-400 text-sm mt-1">{errors.courseMajor}</p>}
                            </div>
                          )}

                          <div>
                            <Label className="text-xs text-gray-400">
                              {editProfile.educationType === "university" ? "Year" : "Grade"}
                            </Label>
                            <Input
                              value={editProfile.yearGrade || ""}
                              onChange={(e) => setEditProfile({ ...editProfile, yearGrade: e.target.value })}
                              placeholder={
                                editProfile.educationType === "university" ? "e.g., 2nd Year" : "e.g., Grade 10"
                              }
                              className="mt-1 bg-gray-700 border-gray-600 text-white text-sm"
                            />
                            {errors.yearGrade && <p className="text-red-400 text-sm mt-1">{errors.yearGrade}</p>}
                          </div>

                          <div className="flex items-center space-x-2">
                            <input
                              type="checkbox"
                              id="edit-uniform-required"
                              checked={editProfile.hasUniform || false}
                              onChange={(e) => setEditProfile({ ...editProfile, hasUniform: e.target.checked })}
                              className="rounded border-gray-500 text-blue-500 focus:ring-blue-400"
                            />
                            <Label htmlFor="edit-uniform-required" className="text-xs text-gray-300">
                              {editProfile.educationType === "university"
                                ? "Dress code required"
                                : "School uniform required"}
                            </Label>
                          </div>

                          {editProfile.hasUniform && (
                            <div>
                              <Label className="text-xs text-gray-400">Dress Code Notes</Label>
                              <Textarea
                                value={editProfile.dressCodeNotes}
                                onChange={(e) => setEditProfile({ ...editProfile, dressCodeNotes: e.target.value })}
                                placeholder="Describe uniform requirements or dress code..."
                                className="mt-1 bg-gray-700 border-gray-600 text-white text-sm"
                                rows={2}
                              />
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Weather Essentials - Ages 0-25 */}
                  {showEditWeatherEssentials && (
                    <div className="bg-green-900/20 rounded-lg p-4 border border-green-600/30">
                      <h4 className="text-white font-medium mb-3 flex items-center gap-2">
                        <CloudRain className="w-4 h-4" />
                        Weather Essentials Needed
                      </h4>
                      <p className="text-xs text-gray-400 mb-3">
                        Check items that {editProfile.name || "this person"} needs for different weather conditions
                      </p>
                      <div className="grid grid-cols-2 gap-2">
                        {WEATHER_ESSENTIALS.map((essential) => (
                          <div key={essential.id} className="flex items-center space-x-2">
                            <input
                              type="checkbox"
                              id={`edit-${essential.id}`}
                              checked={editProfile.weatherEssentials?.includes(essential.id) || false}
                              onChange={() => handleWeatherEssentialToggle(essential.id, true)}
                              className="rounded border-gray-500 text-green-500 focus:ring-green-400"
                            />
                            <Label
                              htmlFor={`edit-${essential.id}`}
                              className="text-xs text-gray-300 flex items-center gap-1"
                            >
                              <essential.icon className="w-3 h-3" />
                              {essential.label}
                            </Label>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {errors.submit && <div className="text-red-400 text-sm text-center">{errors.submit}</div>}

              <div className="flex gap-3 pt-4">
                <Button
                  type="submit"
                  disabled={
                    !editProfile.name ||
                    !editProfile.relation ||
                    (dobColumnExists ? !editProfile.dateOfBirth : !editProfile.age) ||
                    !editProfile.gender ||
                    isSubmitting
                  }
                  className="flex-1 bg-white hover:bg-gray-200 text-black"
                >
                  {isSubmitting ? (
                    <>
                      <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin mr-2" />
                      Updating...
                    </>
                  ) : (
                    <>
                      <Edit className="w-4 h-4 mr-2" />
                      Update Profile
                    </>
                  )}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    if (
                      editingProfile &&
                      window.confirm(
                        "Are you sure you want to delete this family member's wardrobe? This action cannot be undone.",
                      )
                    ) {
                      handleDeleteProfile(editingProfile.id)
                      setShowEditDialog(false)
                    }
                  }}
                  className="border-red-600 hover:bg-red-700 bg-transparent text-red-400 hover:text-white"
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Delete
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowEditDialog(false)}
                  className="border-gray-600 hover:bg-gray-700 bg-transparent text-white"
                >
                  Cancel
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>

        {/* Wardrobes Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {wardrobes.map((wardrobe) => (
            <Card
              key={wardrobe.id}
              className="group cursor-pointer transition-all duration-300 hover:scale-105 hover:shadow-2xl bg-gray-800/80 backdrop-blur-xl border-gray-700 hover:border-gray-600"
              onClick={() => {
                if (wardrobe.id === "main") {
                  router.push("/wardrobe?from=/wardrobes")
                } else {
                  if (profileColumnExists) {
                    router.push(`/wardrobe?profile=${wardrobe.id}&from=/wardrobes`)
                  } else {
                    // Show a message that the feature isn't available yet
                    alert("Database update required to view separate wardrobes. Please run the migration script.")
                  }
                }
              }}
            >
              <CardHeader className="pb-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    {wardrobe.profile_picture_url ? (
                      <img
                        src={wardrobe.profile_picture_url || "/placeholder.svg"}
                        alt={wardrobe.name}
                        className="w-12 h-12 rounded-full object-cover border-2 border-gray-600"
                      />
                    ) : (
                      <div
                        className={`w-12 h-12 rounded-full bg-gradient-to-r ${wardrobe.color} flex items-center justify-center text-white font-bold text-lg shadow-lg`}
                      >
                        {wardrobe.avatar}
                      </div>
                    )}
                    <div>
                      <CardTitle className="text-lg text-white group-hover:text-gray-100">{wardrobe.name}</CardTitle>
                      {wardrobe.relation && (
                        <p className="text-sm text-gray-400 capitalize flex items-center gap-1">
                          {getRelationIcon(wardrobe.relation)}
                          {getRelationshipDisplayName(wardrobe.relation)} •{" "}
                          {wardrobe.dateOfBirth ? getAgeDisplay(wardrobe.dateOfBirth) : getAgeCategory(wardrobe.age)}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center space-x-1 text-gray-400">
                    {getAgeIcon(wardrobe.age)}
                    {wardrobe.isOwner && <Heart className="w-4 h-4 text-red-400" />}
                  </div>
                </div>
              </CardHeader>

              <CardContent className="pt-0">
                <div className="space-y-4">
                  {/* Stats */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center p-3 bg-gray-700/50 rounded-lg">
                      <div className="flex items-center justify-center mb-1">
                        <Sparkles className="w-4 h-4 text-white mr-1" />
                        <span className="text-2xl font-bold text-white">{wardrobe.itemCount}</span>
                      </div>
                      <p className="text-xs text-gray-400">Items</p>
                    </div>
                    <div className="text-center p-3 bg-gray-700/50 rounded-lg">
                      <div className="flex items-center justify-center mb-1">
                        <DollarSign className="w-4 h-4 text-green-400 mr-1" />
                        <span className="text-2xl font-bold text-white">${wardrobe.totalValue}</span>
                      </div>
                      <p className="text-xs text-gray-400">Value</p>
                    </div>
                  </div>

                  {/* Empty State or Last Updated */}
                  <div className="text-center py-4">
                    {wardrobe.itemCount === 0 ? (
                      <div className="text-gray-400">
                        <Sparkles className="w-8 h-8 mx-auto mb-2 text-gray-500" />
                        <p className="text-sm font-medium">No items yet</p>
                        <p className="text-xs">Click to add items</p>
                      </div>
                    ) : (
                      <div className="flex items-center justify-center text-gray-400">
                        <Calendar className="w-4 h-4 mr-2" />
                        <span className="text-sm">Updated {wardrobe.lastUpdated}</span>
                      </div>
                    )}
                  </div>

                  {/* Quick Actions */}
                  <div className="flex gap-2">
                    <Link
                      href={
                        wardrobe.id === "main"
                          ? "/add-clothes?from=/wardrobes"
                          : profileColumnExists
                            ? `/add-clothes?profile=${wardrobe.id}&from=/wardrobes`
                            : "#"
                      }
                      className="flex-1"
                      onClick={(e) => {
                        e.stopPropagation()
                        if (wardrobe.id !== "main" && !profileColumnExists) {
                          e.preventDefault()
                          alert(
                            "Database update required to add items to separate wardrobes. Please run the migration script.",
                          )
                        }
                      }}
                    >
                      <Button
                        size="sm"
                        className="w-full bg-white hover:bg-gray-200 text-black text-xs"
                        disabled={wardrobe.id !== "main" && !profileColumnExists}
                      >
                        <Plus className="w-3 h-3 mr-1" />
                        Add Item
                      </Button>
                    </Link>
                    {!wardrobe.isOwner && (
                      <Button
                        size="sm"
                        variant="outline"
                        className="border-gray-600 hover:bg-gray-700 bg-transparent text-gray-300 hover:text-white"
                        onClick={(e) => {
                          e.stopPropagation()
                          openEditDialog(wardrobe)
                        }}
                      >
                        <Settings className="w-3 h-3" />
                      </Button>
                    )}
                  </div>
                  {!profileColumnExists && wardrobe.id !== "main" && (
                    <p className="text-xs text-center mt-2 text-gray-400">
                      Database update required to view separate wardrobes
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Empty State for No Additional Wardrobes */}
        {wardrobes.length === 1 && (
          <div className="mt-12 text-center">
            <div className="max-w-md mx-auto">
              <Users className="w-16 h-16 text-gray-600 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-white mb-2">Add Family Wardrobes</h3>
              <p className="text-gray-400 mb-6">
                Create separate wardrobes for family members to organize everyone's clothing with age-appropriate
                features and suggestions.
              </p>
              <Button onClick={() => setShowAddDialog(true)} className="bg-white hover:bg-gray-200 text-black">
                <Plus className="w-4 h-4 mr-2" />
                Add Your First Family Member
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
