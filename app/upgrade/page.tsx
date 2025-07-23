"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Textarea } from "@/components/ui/textarea"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import {
  Sparkles,
  ArrowLeft,
  Check,
  User,
  Baby,
  GraduationCap,
  Briefcase,
  Upload,
  X,
  Plus,
  Trash2,
  Cloud,
  CloudRain,
  Sun,
  Snowflake,
  Wind,
  Umbrella,
  Shield,
  BookOpen,
} from "lucide-react"
import Link from "next/link"
import { useAuth } from "@/hooks/useAuth"
import { useRouter } from "next/navigation"
import { wardrobeProfileService } from "@/lib/supabase"
import type { WardrobeProfile } from "@/lib/supabase"

interface ProfileFormData {
  name: string
  relation: string
  age: string
  gender: string
  goesToSchool: boolean
  educationType: string // school, university, other
  profilePicture: File | null
  imagePreview: string | null
  // Weather essentials for kids
  weatherEssentials: {
    raincoat: boolean
    umbrella: boolean
    winterJacket: boolean
    gloves: boolean
    hat: boolean
    boots: boolean
    scarf: boolean
    sunhat: boolean
  }
  // Education-specific info
  educationInfo: {
    institutionName: string
    uniformRequired: boolean
    dresscode: string
    course: string // for university students
    year: string // grade/year level
  }
  // Size preferences for shopping
  sizePreferences: {
    topSize: string
    bottomSize: string
    shoeSize: string
    preferredBrands: string
  }
}

const FAMILY_RELATIONS = [
  { value: "spouse", label: "Spouse/Partner" },
  { value: "child", label: "Child" },
  { value: "parent", label: "Parent" },
  { value: "sibling", label: "Sibling" },
  { value: "grandparent", label: "Grandparent" },
  { value: "grandchild", label: "Grandchild" },
  { value: "friend", label: "Friend" },
  { value: "other", label: "Other Family Member" },
]

const GENDER_OPTIONS = [
  { value: "male", label: "Male" },
  { value: "female", label: "Female" },
  { value: "non-binary", label: "Non-binary" },
  { value: "prefer-not-to-say", label: "Prefer not to say" },
]

const EDUCATION_TYPES = [
  { value: "school", label: "School (K-12)" },
  { value: "university", label: "University/College" },
  { value: "other", label: "Other Education" },
]

const WEATHER_ESSENTIALS = [
  { key: "raincoat", label: "Raincoat", icon: CloudRain },
  { key: "umbrella", label: "Umbrella", icon: Umbrella },
  { key: "winterJacket", label: "Winter Jacket", icon: Snowflake },
  { key: "gloves", label: "Gloves", icon: Shield },
  { key: "hat", label: "Winter Hat", icon: Snowflake },
  { key: "boots", label: "Rain/Snow Boots", icon: Shield },
  { key: "scarf", label: "Scarf", icon: Wind },
  { key: "sunhat", label: "Sun Hat", icon: Sun },
]

export default function UpgradePage() {
  const { user } = useAuth()
  const router = useRouter()
  const [step, setStep] = useState<"plan" | "profiles" | "success">("plan")
  const [loading, setLoading] = useState(false)
  const [profiles, setProfiles] = useState<WardrobeProfile[]>([])
  const [newProfiles, setNewProfiles] = useState<ProfileFormData[]>([
    {
      name: "",
      relation: "",
      age: "",
      gender: "",
      goesToSchool: false,
      educationType: "school",
      profilePicture: null,
      imagePreview: null,
      weatherEssentials: {
        raincoat: false,
        umbrella: false,
        winterJacket: false,
        gloves: false,
        hat: false,
        boots: false,
        scarf: false,
        sunhat: false,
      },
      educationInfo: {
        institutionName: "",
        uniformRequired: false,
        dresscode: "",
        course: "",
        year: "",
      },
      sizePreferences: {
        topSize: "",
        bottomSize: "",
        shoeSize: "",
        preferredBrands: "",
      },
    },
  ])

  useEffect(() => {
    if (!user) {
      router.push("/auth")
    } else {
      loadExistingProfiles()
    }
  }, [user, router])

  const loadExistingProfiles = async () => {
    if (!user) return

    try {
      setLoading(true)
      const existingProfiles = await wardrobeProfileService.getWardrobeProfiles(user.id)
      if (existingProfiles) {
        setProfiles(existingProfiles)
      }
    } catch (error) {
      console.error("Error loading profiles:", error)
    } finally {
      setLoading(false)
    }
  }

  const getAgeCategory = (age: number) => {
    if (age < 3) return "toddler"
    if (age < 13) return "child"
    if (age < 18) return "teen"
    if (age < 26) return "young adult"
    return "adult"
  }

  const getAgeIcon = (age: number) => {
    if (age < 3) return <Baby className="w-5 h-5" />
    if (age < 13) return <GraduationCap className="w-5 h-5" />
    if (age < 18) return <User className="w-5 h-5" />
    if (age < 26) return <BookOpen className="w-5 h-5" />
    return <Briefcase className="w-5 h-5" />
  }

  const handleProfileChange = (index: number, field: string, value: any) => {
    const updatedProfiles = [...newProfiles]
    if (field.includes(".")) {
      const [parent, child] = field.split(".")
      updatedProfiles[index] = {
        ...updatedProfiles[index],
        [parent]: {
          ...updatedProfiles[index][parent as keyof ProfileFormData],
          [child]: value,
        },
      }
    } else {
      updatedProfiles[index] = {
        ...updatedProfiles[index],
        [field]: value,
      }
    }
    setNewProfiles(updatedProfiles)
  }

  const handleWeatherEssentialChange = (index: number, essential: string, checked: boolean) => {
    const updatedProfiles = [...newProfiles]
    updatedProfiles[index] = {
      ...updatedProfiles[index],
      weatherEssentials: {
        ...updatedProfiles[index].weatherEssentials,
        [essential]: checked,
      },
    }
    setNewProfiles(updatedProfiles)
  }

  const handleImageChange = (index: number, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const updatedProfiles = [...newProfiles]
      updatedProfiles[index] = {
        ...updatedProfiles[index],
        profilePicture: file,
      }

      // Create image preview
      const reader = new FileReader()
      reader.onload = (e) => {
        const updatedProfilesWithPreview = [...updatedProfiles]
        updatedProfilesWithPreview[index] = {
          ...updatedProfilesWithPreview[index],
          imagePreview: e.target?.result as string,
        }
        setNewProfiles(updatedProfilesWithPreview)
      }
      reader.readAsDataURL(file)
    }
  }

  const removeImage = (index: number) => {
    const updatedProfiles = [...newProfiles]
    updatedProfiles[index] = {
      ...updatedProfiles[index],
      profilePicture: null,
      imagePreview: null,
    }
    setNewProfiles(updatedProfiles)
  }

  const addProfileForm = () => {
    if (newProfiles.length + profiles.length < 5) {
      setNewProfiles([
        ...newProfiles,
        {
          name: "",
          relation: "",
          age: "",
          gender: "",
          goesToSchool: false,
          educationType: "school",
          profilePicture: null,
          imagePreview: null,
          weatherEssentials: {
            raincoat: false,
            umbrella: false,
            winterJacket: false,
            gloves: false,
            hat: false,
            boots: false,
            scarf: false,
            sunhat: false,
          },
          educationInfo: {
            institutionName: "",
            uniformRequired: false,
            dresscode: "",
            course: "",
            year: "",
          },
          sizePreferences: {
            topSize: "",
            bottomSize: "",
            shoeSize: "",
            preferredBrands: "",
          },
        },
      ])
    }
  }

  const removeProfileForm = (index: number) => {
    const updatedProfiles = [...newProfiles]
    updatedProfiles.splice(index, 1)
    setNewProfiles(updatedProfiles)
  }

  const validateProfile = (profile: ProfileFormData) => {
    if (!profile.name.trim()) return "Name is required"
    if (!profile.relation.trim()) return "Relationship is required for family wardrobes"
    if (!profile.age.trim()) return "Age is required"
    if (!profile.gender.trim()) return "Gender is required"
    const age = Number.parseInt(profile.age)
    if (isNaN(age) || age < 0 || age > 120) return "Please enter a valid age"
    return null
  }

  const handleSubmitProfiles = async () => {
    if (!user) return

    // Validate all profiles
    for (let i = 0; i < newProfiles.length; i++) {
      const profile = newProfiles[i]
      if (profile.name.trim()) {
        // Only validate profiles that have a name
        const error = validateProfile(profile)
        if (error) {
          alert(`Profile ${i + 1}: ${error}`)
          return
        }
      }
    }

    try {
      setLoading(true)

      // Create each profile
      for (const profile of newProfiles) {
        if (profile.name.trim()) {
          const age = Number.parseInt(profile.age)

          // Create enhanced description with all the collected info
          let description = `Age: ${age} years old, Gender: ${profile.gender}`

          if (profile.goesToSchool) {
            description += `\nEducation: ${profile.educationType}`
            if (profile.educationInfo.institutionName) {
              description += `\nInstitution: ${profile.educationInfo.institutionName}`
            }
            if (profile.educationInfo.course && profile.educationType === "university") {
              description += `\nCourse: ${profile.educationInfo.course}`
            }
            if (profile.educationInfo.year) {
              description += `\nYear/Grade: ${profile.educationInfo.year}`
            }
            if (profile.educationInfo.uniformRequired) {
              description += `\nUniform required: Yes`
            }
            if (profile.educationInfo.dresscode) {
              description += `\nDress code: ${profile.educationInfo.dresscode}`
            }
          }

          // Add weather essentials for kids and young adults
          if (age < 26) {
            const essentials = Object.entries(profile.weatherEssentials)
              .filter(([_, has]) => has)
              .map(([item, _]) => item)

            if (essentials.length > 0) {
              description += `\nWeather essentials needed: ${essentials.join(", ")}`
            }
          }

          // Add size preferences
          if (
            profile.sizePreferences.topSize ||
            profile.sizePreferences.bottomSize ||
            profile.sizePreferences.shoeSize
          ) {
            description += `\nSizes - Top: ${profile.sizePreferences.topSize}, Bottom: ${profile.sizePreferences.bottomSize}, Shoes: ${profile.sizePreferences.shoeSize}`
          }

          if (profile.sizePreferences.preferredBrands) {
            description += `\nPreferred brands: ${profile.sizePreferences.preferredBrands}`
          }

          // Create profile in database
          const profileData: Omit<WardrobeProfile, "id" | "created_at" | "updated_at"> = {
            user_id: user.id,
            name: profile.name.trim(),
            relation: profile.relation.trim(),
            age: age,
            is_owner: false,
          }

          const newProfile = await wardrobeProfileService.addWardrobeProfile(profileData)

          // Upload profile picture if provided
          if (newProfile && profile.profilePicture) {
            try {
              const imageResult = await wardrobeProfileService.uploadProfilePicture(
                profile.profilePicture,
                user.id,
                newProfile.id,
              )
              await wardrobeProfileService.updateWardrobeProfile(newProfile.id, {
                profile_picture_url: imageResult.url,
                profile_picture_path: imageResult.path,
              })
            } catch (imageError) {
              console.error("Error uploading profile picture:", imageError)
            }
          }
        }
      }

      // Move to success step
      setStep("success")
    } catch (error) {
      console.error("Error creating profiles:", error)
      alert("There was an error creating profiles. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-400">Please log in to upgrade your account</p>
          <Link href="/auth">
            <Button className="mt-4 bg-white text-black hover:bg-gray-200">Sign In</Button>
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
              <Link href="/">
                <Button variant="ghost" size="sm" className="text-gray-400 hover:text-gray-100">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back to Home
                </Button>
              </Link>
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center">
                  <Sparkles className="w-4 h-4 text-black" />
                </div>
                <h1 className="text-2xl font-bold text-white">Upgrade to Premium</h1>
              </div>
            </div>
          </div>
        </div>
      </nav>

      <div className="container mx-auto px-6 py-12">
        {/* Progress Steps */}
        <div className="max-w-3xl mx-auto mb-12">
          <div className="flex items-center justify-between">
            <div className="flex flex-col items-center">
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center ${
                  step === "plan" ? "bg-white" : "bg-gray-700"
                }`}
              >
                <span className={`font-bold ${step === "plan" ? "text-black" : "text-white"}`}>1</span>
              </div>
              <span className="text-sm mt-2 text-gray-400">Plan</span>
            </div>
            <div className={`flex-1 h-1 ${step !== "plan" ? "bg-white" : "bg-gray-700"}`}></div>
            <div className="flex flex-col items-center">
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center ${
                  step === "profiles" ? "bg-white" : step === "success" ? "bg-white" : "bg-gray-700"
                }`}
              >
                <span
                  className={`font-bold ${step === "profiles" || step === "success" ? "text-black" : "text-white"}`}
                >
                  2
                </span>
              </div>
              <span className="text-sm mt-2 text-gray-400">Profiles</span>
            </div>
            <div className={`flex-1 h-1 ${step === "success" ? "bg-white" : "bg-gray-700"}`}></div>
            <div className="flex flex-col items-center">
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center ${
                  step === "success" ? "bg-white" : "bg-gray-700"
                }`}
              >
                <span className={`font-bold ${step === "success" ? "text-black" : "text-white"}`}>3</span>
              </div>
              <span className="text-sm mt-2 text-gray-400">Done</span>
            </div>
          </div>
        </div>

        {/* Plan Selection Step */}
        {step === "plan" && (
          <div className="max-w-3xl mx-auto">
            <div className="text-center mb-10">
              <h2 className="text-3xl font-bold text-white mb-4">Upgrade to Premium Family</h2>
              <p className="text-gray-400">
                Manage wardrobes for your entire family and get personalized recommendations for everyone you care about
              </p>
            </div>

            <Card className="bg-gray-800/80 backdrop-blur-xl border-gray-700 mb-8">
              <CardContent className="p-8">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h3 className="text-2xl font-bold text-white">Premium Family</h3>
                    <p className="text-gray-400">Advanced styling for families</p>
                  </div>
                  <div className="text-right">
                    <div className="text-3xl font-bold text-white">$9.99</div>
                    <div className="text-sm text-gray-400">per month</div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <div className="w-5 h-5 mt-0.5 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex-shrink-0 flex items-center justify-center">
                      <Check className="w-3 h-3 text-white" />
                    </div>
                    <span className="text-gray-300">Everything in Free Plan</span>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-5 h-5 mt-0.5 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex-shrink-0 flex items-center justify-center">
                      <Check className="w-3 h-3 text-white" />
                    </div>
                    <span className="text-gray-300">Up to 5 family wardrobes</span>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-5 h-5 mt-0.5 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex-shrink-0 flex items-center justify-center">
                      <Check className="w-3 h-3 text-white" />
                    </div>
                    <span className="text-gray-300">Kids, spouse, friends profiles</span>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-5 h-5 mt-0.5 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex-shrink-0 flex items-center justify-center">
                      <Check className="w-3 h-3 text-white" />
                    </div>
                    <span className="text-gray-300">Age & gender-appropriate recommendations</span>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-5 h-5 mt-0.5 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex-shrink-0 flex items-center justify-center">
                      <Check className="w-3 h-3 text-white" />
                    </div>
                    <span className="text-gray-300">Weather essentials tracking for kids</span>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-5 h-5 mt-0.5 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex-shrink-0 flex items-center justify-center">
                      <Check className="w-3 h-3 text-white" />
                    </div>
                    <span className="text-gray-300">School & university wardrobe management</span>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-5 h-5 mt-0.5 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex-shrink-0 flex items-center justify-center">
                      <Check className="w-3 h-3 text-white" />
                    </div>
                    <span className="text-gray-300">Advanced AI styling engine</span>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-5 h-5 mt-0.5 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex-shrink-0 flex items-center justify-center">
                      <Check className="w-3 h-3 text-white" />
                    </div>
                    <span className="text-gray-300">Priority customer support</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="flex justify-center">
              <Button
                onClick={() => setStep("profiles")}
                className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white shadow-lg px-8 py-6 text-lg font-semibold"
              >
                Continue to Create Profiles
              </Button>
            </div>
          </div>
        )}

        {/* Profiles Step */}
        {step === "profiles" && (
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-10">
              <h2 className="text-3xl font-bold text-white mb-4">Create Family Profiles</h2>
              <p className="text-gray-400">
                Add detailed profiles for family members with age and gender-specific features
              </p>
            </div>

            {/* Existing profiles */}
            {profiles.length > 0 && (
              <div className="mb-8">
                <h3 className="text-xl font-semibold text-white mb-4">Existing Profiles</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
                  {profiles.map((profile) => (
                    <Card key={profile.id} className="bg-gray-800/80 backdrop-blur-xl border-gray-700">
                      <CardContent className="p-4">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center">
                            {profile.profile_picture_url ? (
                              <img
                                src={profile.profile_picture_url || "/placeholder.svg"}
                                alt={profile.name}
                                className="w-full h-full object-cover rounded-full"
                              />
                            ) : (
                              <span className="text-lg font-bold text-white">
                                {profile.name.charAt(0).toUpperCase()}
                              </span>
                            )}
                          </div>
                          <div>
                            <h4 className="text-white font-medium">{profile.name}</h4>
                            <p className="text-gray-400 text-sm">
                              {profile.relation} • {profile.age} years old
                            </p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            )}

            {/* New profile forms */}
            <div className="space-y-8">
              {newProfiles.map((profile, index) => {
                const age = Number.parseInt(profile.age) || 0
                const ageCategory = getAgeCategory(age)
                const isChild = age > 0 && age < 26 // Extended for weather essentials
                const isEducationAge = age >= 3 && age <= 25 // Extended for university

                return (
                  <Card key={index} className="bg-gray-800/80 backdrop-blur-xl border-gray-700">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center">
                            {getAgeIcon(age)}
                          </div>
                          <h3 className="text-xl font-bold text-white">
                            Profile {index + 1}
                            {profile.name && ` - ${profile.name}`}
                            {age > 0 && <span className="text-sm font-normal text-gray-400 ml-2">({ageCategory})</span>}
                          </h3>
                        </div>
                        {newProfiles.length > 1 && (
                          <Button
                            type="button"
                            onClick={() => removeProfileForm(index)}
                            variant="outline"
                            size="sm"
                            className="border-red-600 text-red-400 hover:bg-red-600 hover:text-white"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        )}
                      </div>

                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {/* Left Column - Basic Info */}
                        <div className="space-y-4">
                          {/* Profile Picture */}
                          <div>
                            <Label className="text-gray-300 font-medium">Profile Picture</Label>
                            <div className="mt-2">
                              {profile.imagePreview ? (
                                <div className="relative w-24 h-24">
                                  <img
                                    src={profile.imagePreview || "/placeholder.svg"}
                                    alt="Preview"
                                    className="w-full h-full object-cover rounded-full border-2 border-gray-600"
                                  />
                                  <Button
                                    type="button"
                                    onClick={() => removeImage(index)}
                                    variant="destructive"
                                    size="sm"
                                    className="absolute -top-1 -right-1 rounded-full w-6 h-6 p-0"
                                  >
                                    <X className="w-3 h-3" />
                                  </Button>
                                </div>
                              ) : (
                                <div className="w-24 h-24 border-2 border-dashed border-gray-600 rounded-full flex items-center justify-center">
                                  <div className="text-center">
                                    <Upload className="w-6 h-6 text-gray-400 mx-auto mb-1" />
                                    <Input
                                      type="file"
                                      accept="image/*"
                                      onChange={(e) => handleImageChange(index, e)}
                                      className="hidden"
                                      id={`image-${index}`}
                                    />
                                    <Button
                                      type="button"
                                      onClick={() => document.getElementById(`image-${index}`)?.click()}
                                      variant="ghost"
                                      size="sm"
                                      className="text-xs text-gray-400 hover:text-white p-1 h-auto"
                                    >
                                      Add Photo
                                    </Button>
                                  </div>
                                </div>
                              )}
                            </div>
                          </div>

                          {/* Name - Required */}
                          <div>
                            <Label className="text-gray-300 font-medium">
                              Name <span className="text-red-400">*</span>
                            </Label>
                            <Input
                              value={profile.name}
                              onChange={(e) => handleProfileChange(index, "name", e.target.value)}
                              placeholder="Enter full name"
                              className="mt-2 bg-gray-700 border-gray-600 text-white"
                              required
                            />
                          </div>

                          {/* Relationship - Required */}
                          <div>
                            <Label className="text-gray-300 font-medium">
                              Relationship <span className="text-red-400">*</span>
                            </Label>
                            <Select
                              value={profile.relation}
                              onValueChange={(value) => handleProfileChange(index, "relation", value)}
                            >
                              <SelectTrigger className="mt-2 bg-gray-700 border-gray-600 text-white">
                                <SelectValue placeholder="Select relationship" />
                              </SelectTrigger>
                              <SelectContent className="bg-gray-800 text-white border-gray-700">
                                {FAMILY_RELATIONS.map((relation) => (
                                  <SelectItem key={relation.value} value={relation.value}>
                                    {relation.label}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>

                          {/* Age - Required */}
                          <div>
                            <Label className="text-gray-300 font-medium">
                              Age <span className="text-red-400">*</span>
                            </Label>
                            <Input
                              type="number"
                              min="0"
                              max="120"
                              value={profile.age}
                              onChange={(e) => handleProfileChange(index, "age", e.target.value)}
                              placeholder="Enter age"
                              className="mt-2 bg-gray-700 border-gray-600 text-white"
                              required
                            />
                          </div>

                          {/* Gender - Required */}
                          <div>
                            <Label className="text-gray-300 font-medium">
                              Gender <span className="text-red-400">*</span>
                            </Label>
                            <RadioGroup
                              value={profile.gender}
                              onValueChange={(value) => handleProfileChange(index, "gender", value)}
                              className="mt-2"
                            >
                              <div className="grid grid-cols-2 gap-2">
                                {GENDER_OPTIONS.map((gender) => (
                                  <div key={gender.value} className="flex items-center space-x-2">
                                    <RadioGroupItem
                                      value={gender.value}
                                      id={`gender-${gender.value}-${index}`}
                                      className="border-gray-600 text-white"
                                    />
                                    <Label
                                      htmlFor={`gender-${gender.value}-${index}`}
                                      className="text-sm text-gray-300"
                                    >
                                      {gender.label}
                                    </Label>
                                  </div>
                                ))}
                              </div>
                            </RadioGroup>
                          </div>

                          {/* Size Preferences */}
                          <div className="space-y-3">
                            <Label className="text-gray-300 font-medium">Size Preferences</Label>
                            <div className="grid grid-cols-3 gap-2">
                              <div>
                                <Label className="text-xs text-gray-400">Top Size</Label>
                                <Input
                                  value={profile.sizePreferences.topSize}
                                  onChange={(e) =>
                                    handleProfileChange(index, "sizePreferences.topSize", e.target.value)
                                  }
                                  placeholder={isChild ? "8Y" : "M"}
                                  className="mt-1 bg-gray-700 border-gray-600 text-white text-sm"
                                />
                              </div>
                              <div>
                                <Label className="text-xs text-gray-400">Bottom Size</Label>
                                <Input
                                  value={profile.sizePreferences.bottomSize}
                                  onChange={(e) =>
                                    handleProfileChange(index, "sizePreferences.bottomSize", e.target.value)
                                  }
                                  placeholder={isChild ? "8Y" : "32"}
                                  className="mt-1 bg-gray-700 border-gray-600 text-white text-sm"
                                />
                              </div>
                              <div>
                                <Label className="text-xs text-gray-400">Shoe Size</Label>
                                <Input
                                  value={profile.sizePreferences.shoeSize}
                                  onChange={(e) =>
                                    handleProfileChange(index, "sizePreferences.shoeSize", e.target.value)
                                  }
                                  placeholder={isChild ? "2Y" : "9"}
                                  className="mt-1 bg-gray-700 border-gray-600 text-white text-sm"
                                />
                              </div>
                            </div>
                            <div>
                              <Label className="text-xs text-gray-400">Preferred Brands</Label>
                              <Input
                                value={profile.sizePreferences.preferredBrands}
                                onChange={(e) =>
                                  handleProfileChange(index, "sizePreferences.preferredBrands", e.target.value)
                                }
                                placeholder="e.g., Nike, Zara, H&M"
                                className="mt-1 bg-gray-700 border-gray-600 text-white text-sm"
                              />
                            </div>
                          </div>
                        </div>

                        {/* Right Column - Age-Specific Features */}
                        <div className="space-y-4">
                          {/* Education Information - Show for ages 3-25 */}
                          {age >= 3 && age <= 25 && (
                            <div className="bg-blue-900/20 rounded-lg p-4 border border-blue-600/30">
                              <h4 className="text-white font-medium mb-3 flex items-center gap-2">
                                <GraduationCap className="w-4 h-4" />
                                Education Information
                              </h4>

                              {/* Goes to School/University Checkbox */}
                              <div className="flex items-center space-x-2 mb-3">
                                <Checkbox
                                  id={`education-${index}`}
                                  checked={profile.goesToSchool}
                                  onCheckedChange={(checked) =>
                                    handleProfileChange(index, "goesToSchool", checked as boolean)
                                  }
                                  className="border-gray-600"
                                />
                                <Label htmlFor={`education-${index}`} className="text-gray-300 flex items-center gap-2">
                                  <BookOpen className="w-4 h-4" />
                                  Goes to school/university
                                </Label>
                              </div>

                              {/* Education Details - Only show if goes to school/university */}
                              {profile.goesToSchool && (
                                <div className="space-y-3">
                                  {/* Education Type */}
                                  <div>
                                    <Label className="text-xs text-gray-400">Education Type</Label>
                                    <Select
                                      value={profile.educationType}
                                      onValueChange={(value) => handleProfileChange(index, "educationType", value)}
                                    >
                                      <SelectTrigger className="mt-1 bg-gray-700 border-gray-600 text-white text-sm">
                                        <SelectValue placeholder="Select education type" />
                                      </SelectTrigger>
                                      <SelectContent className="bg-gray-800 text-white border-gray-700">
                                        {EDUCATION_TYPES.map((type) => (
                                          <SelectItem key={type.value} value={type.value}>
                                            {type.label}
                                          </SelectItem>
                                        ))}
                                      </SelectContent>
                                    </Select>
                                  </div>

                                  {/* Institution Name */}
                                  <div>
                                    <Label className="text-xs text-gray-400">
                                      {profile.educationType === "university"
                                        ? "University/College Name"
                                        : "School Name"}
                                    </Label>
                                    <Input
                                      value={profile.educationInfo.institutionName}
                                      onChange={(e) =>
                                        handleProfileChange(index, "educationInfo.institutionName", e.target.value)
                                      }
                                      placeholder={
                                        profile.educationType === "university"
                                          ? "Enter university name"
                                          : "Enter school name"
                                      }
                                      className="mt-1 bg-gray-700 border-gray-600 text-white text-sm"
                                    />
                                  </div>

                                  {/* Course (for university) */}
                                  {profile.educationType === "university" && (
                                    <div>
                                      <Label className="text-xs text-gray-400">Course/Major</Label>
                                      <Input
                                        value={profile.educationInfo.course}
                                        onChange={(e) =>
                                          handleProfileChange(index, "educationInfo.course", e.target.value)
                                        }
                                        placeholder="e.g., Computer Science, Business"
                                        className="mt-1 bg-gray-700 border-gray-600 text-white text-sm"
                                      />
                                    </div>
                                  )}

                                  {/* Year/Grade */}
                                  <div>
                                    <Label className="text-xs text-gray-400">
                                      {profile.educationType === "university" ? "Year" : "Grade"}
                                    </Label>
                                    <Input
                                      value={profile.educationInfo.year}
                                      onChange={(e) => handleProfileChange(index, "educationInfo.year", e.target.value)}
                                      placeholder={
                                        profile.educationType === "university" ? "e.g., 2nd Year" : "e.g., Grade 10"
                                      }
                                      className="mt-1 bg-gray-700 border-gray-600 text-white text-sm"
                                    />
                                  </div>

                                  {/* Uniform Required */}
                                  <div className="flex items-center space-x-2">
                                    <Checkbox
                                      id={`uniform-${index}`}
                                      checked={profile.educationInfo.uniformRequired}
                                      onCheckedChange={(checked) =>
                                        handleProfileChange(index, "educationInfo.uniformRequired", checked as boolean)
                                      }
                                      className="border-gray-600"
                                    />
                                    <Label htmlFor={`uniform-${index}`} className="text-xs text-gray-300">
                                      {profile.educationType === "university"
                                        ? "Dress code required"
                                        : "School uniform required"}
                                    </Label>
                                  </div>

                                  {/* Dress Code Notes */}
                                  <div>
                                    <Label className="text-xs text-gray-400">Dress Code Notes</Label>
                                    <Textarea
                                      value={profile.educationInfo.dresscode}
                                      onChange={(e) =>
                                        handleProfileChange(index, "educationInfo.dresscode", e.target.value)
                                      }
                                      placeholder="Any specific dress code requirements..."
                                      className="mt-1 bg-gray-700 border-gray-600 text-white text-sm"
                                      rows={2}
                                    />
                                  </div>
                                </div>
                              )}
                            </div>
                          )}

                          {/* Weather Essentials for Kids and Young Adults - Show for ages 0-25 */}
                          {age > 0 && age < 26 && (
                            <div className="bg-green-900/20 rounded-lg p-4 border border-green-600/30">
                              <h4 className="text-white font-medium mb-3 flex items-center gap-2">
                                <Cloud className="w-4 h-4" />
                                Weather Essentials Needed
                              </h4>
                              <p className="text-xs text-gray-400 mb-3">
                                Check items that {profile.name || "this person"} needs for different weather conditions
                              </p>
                              <div className="grid grid-cols-2 gap-2">
                                {WEATHER_ESSENTIALS.map((essential) => (
                                  <div key={essential.key} className="flex items-center space-x-2">
                                    <Checkbox
                                      id={`${essential.key}-${index}`}
                                      checked={
                                        profile.weatherEssentials[
                                          essential.key as keyof typeof profile.weatherEssentials
                                        ]
                                      }
                                      onCheckedChange={(checked) =>
                                        handleWeatherEssentialChange(index, essential.key, checked as boolean)
                                      }
                                      className="border-gray-600"
                                    />
                                    <Label
                                      htmlFor={`${essential.key}-${index}`}
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

                          {/* Age Category Info */}
                          <div className="bg-gray-700/30 rounded-lg p-4 border border-gray-600/30">
                            <h4 className="text-white font-medium mb-2 flex items-center gap-2">
                              {getAgeIcon(age)}
                              Age Category: {ageCategory.charAt(0).toUpperCase() + ageCategory.slice(1)}
                            </h4>
                            <p className="text-xs text-gray-400">
                              {age < 3 && "Toddler-specific features will be available for clothing recommendations"}
                              {age >= 3 &&
                                age < 13 &&
                                "Child-specific features including safety considerations and growth room"}
                              {age >= 13 &&
                                age < 18 &&
                                "Teen-specific features including school appropriateness and style preferences"}
                              {age >= 18 &&
                                age < 26 &&
                                "Young adult features including university and professional styling"}
                              {age >= 26 && "Adult features including work appropriateness and professional styling"}
                            </p>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            </div>

            {/* Add Profile Button */}
            {newProfiles.length + profiles.length < 5 && (
              <div className="mt-6 text-center">
                <Button
                  type="button"
                  onClick={addProfileForm}
                  variant="outline"
                  className="border-gray-600 hover:bg-gray-700 bg-transparent text-white"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add Another Profile
                </Button>
              </div>
            )}

            {/* Navigation Buttons */}
            <div className="flex justify-between mt-8">
              <Button
                onClick={() => setStep("plan")}
                variant="outline"
                className="border-gray-600 text-gray-300 hover:bg-gray-700"
              >
                Back
              </Button>
              <Button
                onClick={handleSubmitProfiles}
                disabled={loading || newProfiles.every((p) => !p.name.trim())}
                className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white shadow-lg"
              >
                {loading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                    Creating Profiles...
                  </>
                ) : (
                  "Create Profiles & Continue"
                )}
              </Button>
            </div>
          </div>
        )}

        {/* Success Step */}
        {step === "success" && (
          <div className="max-w-2xl mx-auto text-center">
            <div className="w-20 h-20 bg-gradient-to-r from-green-500 to-blue-500 rounded-full flex items-center justify-center mx-auto mb-6">
              <Check className="w-10 h-10 text-white" />
            </div>
            <h2 className="text-3xl font-bold text-white mb-4">Welcome to Premium Family!</h2>
            <p className="text-gray-400 mb-8">
              Your family profiles have been created successfully. You can now manage wardrobes for everyone and get
              personalized, age and gender-appropriate recommendations.
            </p>
            <div className="space-y-4">
              <Link href="/wardrobe">
                <Button className="bg-white hover:bg-gray-200 text-black shadow-lg w-full">
                  Start Managing Family Wardrobes
                </Button>
              </Link>
              <Link href="/home">
                <Button
                  variant="outline"
                  className="border-gray-600 hover:bg-gray-700 bg-transparent text-white w-full"
                >
                  Go to Dashboard
                </Button>
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
