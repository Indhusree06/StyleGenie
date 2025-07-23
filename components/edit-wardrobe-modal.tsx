"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Textarea } from "@/components/ui/textarea"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  User,
  Baby,
  GraduationCap,
  Briefcase,
  Upload,
  X,
  Cloud,
  CloudRain,
  Sun,
  Snowflake,
  Wind,
  Umbrella,
  Shield,
  BookOpen,
} from "lucide-react"
import { wardrobeProfileService } from "@/lib/supabase"
import type { WardrobeProfile } from "@/lib/supabase"

interface EditWardrobeModalProps {
  isOpen: boolean
  onClose: () => void
  onSave: (profile: WardrobeProfile) => void
  profile?: WardrobeProfile | null
  userId: string
}

interface ProfileFormData {
  name: string
  relation: string
  age: string
  gender: string
  goesToEducation: boolean
  educationType: string
  profilePicture: File | null
  imagePreview: string | null
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
  educationInfo: {
    institutionName: string
    uniformRequired: boolean
    dresscode: string
    course: string
    year: string
  }
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

export default function EditWardrobeModal({ isOpen, onClose, onSave, profile, userId }: EditWardrobeModalProps) {
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState<ProfileFormData>({
    name: "",
    relation: "",
    age: "",
    gender: "",
    goesToEducation: false,
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
  })

  useEffect(() => {
    if (profile) {
      setFormData({
        name: profile.name || "",
        relation: profile.relation || "",
        age: profile.age?.toString() || "",
        gender: "", // This would need to be added to the profile schema
        goesToEducation: false,
        educationType: "school",
        profilePicture: null,
        imagePreview: profile.profile_picture_url || null,
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
      })
    } else {
      // Reset form for new profile
      setFormData({
        name: "",
        relation: "",
        age: "",
        gender: "",
        goesToEducation: false,
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
      })
    }
  }, [profile, isOpen])

  const getAgeCategory = (age: number) => {
    if (age < 3) return "toddler"
    if (age < 13) return "child"
    if (age < 18) return "teen"
    if (age < 26) return "young adult"
    return "adult"
  }

  const getAgeIcon = (age: number) => {
    if (age < 3) return <Baby className="w-4 h-4" />
    if (age < 13) return <GraduationCap className="w-4 h-4" />
    if (age < 18) return <User className="w-4 h-4" />
    if (age < 26) return <BookOpen className="w-4 h-4" />
    return <Briefcase className="w-4 h-4" />
  }

  const handleFieldChange = (field: string, value: any) => {
    if (field.includes(".")) {
      const [parent, child] = field.split(".")
      setFormData((prev) => ({
        ...prev,
        [parent]: {
          ...prev[parent as keyof ProfileFormData],
          [child]: value,
        },
      }))
    } else {
      setFormData((prev) => ({
        ...prev,
        [field]: value,
      }))
    }
  }

  const handleWeatherEssentialChange = (essential: string, checked: boolean) => {
    setFormData((prev) => ({
      ...prev,
      weatherEssentials: {
        ...prev.weatherEssentials,
        [essential]: checked,
      },
    }))
  }

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setFormData((prev) => ({
        ...prev,
        profilePicture: file,
      }))

      // Create image preview
      const reader = new FileReader()
      reader.onload = (e) => {
        setFormData((prev) => ({
          ...prev,
          imagePreview: e.target?.result as string,
        }))
      }
      reader.readAsDataURL(file)
    }
  }

  const removeImage = () => {
    setFormData((prev) => ({
      ...prev,
      profilePicture: null,
      imagePreview: null,
    }))
  }

  const validateForm = () => {
    if (!formData.name.trim()) return "Name is required"
    if (!formData.relation.trim()) return "Relationship is required"
    if (!formData.age.trim()) return "Age is required"
    if (!formData.gender.trim()) return "Gender is required"
    const age = Number.parseInt(formData.age)
    if (isNaN(age) || age < 0 || age > 120) return "Please enter a valid age"
    return null
  }

  const handleSave = async () => {
    const error = validateForm()
    if (error) {
      alert(error)
      return
    }

    setLoading(true)
    try {
      const age = Number.parseInt(formData.age)

      // Create enhanced description with all collected info
      let description = `Age: ${age} years old, Gender: ${formData.gender}`

      if (formData.goesToEducation) {
        description += `\nEducation: ${formData.educationType}`
        if (formData.educationInfo.institutionName) {
          description += `\nInstitution: ${formData.educationInfo.institutionName}`
        }
        if (formData.educationInfo.course && formData.educationType === "university") {
          description += `\nCourse: ${formData.educationInfo.course}`
        }
        if (formData.educationInfo.year) {
          description += `\nYear/Grade: ${formData.educationInfo.year}`
        }
        if (formData.educationInfo.uniformRequired) {
          description += `\nUniform required: Yes`
        }
        if (formData.educationInfo.dresscode) {
          description += `\nDress code: ${formData.educationInfo.dresscode}`
        }
      }

      // Add weather essentials for kids and young adults
      if (age < 26) {
        const essentials = Object.entries(formData.weatherEssentials)
          .filter(([_, has]) => has)
          .map(([item, _]) => item)

        if (essentials.length > 0) {
          description += `\nWeather essentials needed: ${essentials.join(", ")}`
        }
      }

      // Add size preferences
      if (
        formData.sizePreferences.topSize ||
        formData.sizePreferences.bottomSize ||
        formData.sizePreferences.shoeSize
      ) {
        description += `\nSizes - Top: ${formData.sizePreferences.topSize}, Bottom: ${formData.sizePreferences.bottomSize}, Shoes: ${formData.sizePreferences.shoeSize}`
      }

      if (formData.sizePreferences.preferredBrands) {
        description += `\nPreferred brands: ${formData.sizePreferences.preferredBrands}`
      }

      if (profile) {
        // Update existing profile
        const updatedProfile = await wardrobeProfileService.updateWardrobeProfile(profile.id, {
          name: formData.name.trim(),
          relation: formData.relation.trim(),
          age: age,
        })

        if (updatedProfile) {
          onSave(updatedProfile)
        }
      } else {
        // Create new profile
        const profileData: Omit<WardrobeProfile, "id" | "created_at" | "updated_at"> = {
          user_id: userId,
          name: formData.name.trim(),
          relation: formData.relation.trim(),
          age: age,
          is_owner: false,
        }

        const newProfile = await wardrobeProfileService.addWardrobeProfile(profileData)

        if (newProfile) {
          // Upload profile picture if provided
          if (formData.profilePicture) {
            try {
              const imageResult = await wardrobeProfileService.uploadProfilePicture(
                formData.profilePicture,
                userId,
                newProfile.id,
              )
              const updatedProfile = await wardrobeProfileService.updateWardrobeProfile(newProfile.id, {
                profile_picture_url: imageResult.url,
                profile_picture_path: imageResult.path,
              })
              onSave(updatedProfile || newProfile)
            } catch (imageError) {
              console.error("Error uploading profile picture:", imageError)
              onSave(newProfile)
            }
          } else {
            onSave(newProfile)
          }
        }
      }

      onClose()
    } catch (error) {
      console.error("Error saving profile:", error)
      alert("There was an error saving the profile. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  const age = Number.parseInt(formData.age) || 0
  const ageCategory = getAgeCategory(age)
  const isEducationAge = age >= 3 && age <= 25
  const isWeatherEssentialsAge = age > 0 && age < 26

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-gray-800 text-white border-gray-700 max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <User className="w-5 h-5" />
            {profile ? "Edit Family Member Wardrobe" : "Add Family Member Wardrobe"}
          </DialogTitle>
          <DialogDescription className="text-gray-400">
            {profile ? "Update family member details" : "Create a new wardrobe profile for a family member"}
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 py-4">
          {/* Left Column - Basic Info */}
          <div className="space-y-4">
            {/* Profile Picture */}
            <div>
              <Label className="text-gray-300 font-medium">Profile Picture</Label>
              <div className="mt-2">
                {formData.imagePreview ? (
                  <div className="relative w-24 h-24">
                    <img
                      src={formData.imagePreview || "/placeholder.svg"}
                      alt="Preview"
                      className="w-full h-full object-cover rounded-full border-2 border-gray-600"
                    />
                    <Button
                      type="button"
                      onClick={removeImage}
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
                        onChange={handleImageChange}
                        className="hidden"
                        id="profile-image"
                      />
                      <Button
                        type="button"
                        onClick={() => document.getElementById("profile-image")?.click()}
                        variant="ghost"
                        size="sm"
                        className="text-xs text-gray-400 hover:text-white p-1 h-auto"
                      >
                        Choose Image
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
                value={formData.name}
                onChange={(e) => handleFieldChange("name", e.target.value)}
                placeholder="e.g., Emma, Dad, Mom"
                className="mt-2 bg-gray-700 border-gray-600 text-white"
                required
              />
            </div>

            {/* Relationship - Required */}
            <div>
              <Label className="text-gray-300 font-medium">
                Relationship <span className="text-red-400">*</span>
              </Label>
              <Select value={formData.relation} onValueChange={(value) => handleFieldChange("relation", value)}>
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
                value={formData.age}
                onChange={(e) => handleFieldChange("age", e.target.value)}
                placeholder="e.g., 8, 25, 45"
                className="mt-2 bg-gray-700 border-gray-600 text-white"
                required
              />
              <p className="text-xs text-gray-400 mt-1">Age helps customize clothing suggestions and categories</p>
            </div>

            {/* Gender - Required */}
            <div>
              <Label className="text-gray-300 font-medium">
                Gender <span className="text-red-400">*</span>
              </Label>
              <RadioGroup
                value={formData.gender}
                onValueChange={(value) => handleFieldChange("gender", value)}
                className="mt-2"
              >
                <div className="grid grid-cols-2 gap-2">
                  {GENDER_OPTIONS.map((gender) => (
                    <div key={gender.value} className="flex items-center space-x-2">
                      <RadioGroupItem
                        value={gender.value}
                        id={`gender-${gender.value}`}
                        className="border-gray-600 text-white"
                      />
                      <Label htmlFor={`gender-${gender.value}`} className="text-sm text-gray-300">
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
                    value={formData.sizePreferences.topSize}
                    onChange={(e) => handleFieldChange("sizePreferences.topSize", e.target.value)}
                    placeholder={age < 18 ? "8Y" : "M"}
                    className="mt-1 bg-gray-700 border-gray-600 text-white text-sm"
                  />
                </div>
                <div>
                  <Label className="text-xs text-gray-400">Bottom Size</Label>
                  <Input
                    value={formData.sizePreferences.bottomSize}
                    onChange={(e) => handleFieldChange("sizePreferences.bottomSize", e.target.value)}
                    placeholder={age < 18 ? "8Y" : "32"}
                    className="mt-1 bg-gray-700 border-gray-600 text-white text-sm"
                  />
                </div>
                <div>
                  <Label className="text-xs text-gray-400">Shoe Size</Label>
                  <Input
                    value={formData.sizePreferences.shoeSize}
                    onChange={(e) => handleFieldChange("sizePreferences.shoeSize", e.target.value)}
                    placeholder={age < 18 ? "2Y" : "9"}
                    className="mt-1 bg-gray-700 border-gray-600 text-white text-sm"
                  />
                </div>
              </div>
              <div>
                <Label className="text-xs text-gray-400">Preferred Brands</Label>
                <Input
                  value={formData.sizePreferences.preferredBrands}
                  onChange={(e) => handleFieldChange("sizePreferences.preferredBrands", e.target.value)}
                  placeholder="e.g., Nike, Zara, H&M"
                  className="mt-1 bg-gray-700 border-gray-600 text-white text-sm"
                />
              </div>
            </div>
          </div>

          {/* Right Column - Age-Specific Features */}
          <div className="space-y-4">
            {/* Age Category Info */}
            {age > 0 && (
              <div className="bg-gray-700/30 rounded-lg p-4 border border-gray-600/30">
                <h4 className="text-white font-medium mb-2 flex items-center gap-2">
                  {getAgeIcon(age)}
                  Age Category: {ageCategory.charAt(0).toUpperCase() + ageCategory.slice(1)}
                </h4>
                <p className="text-xs text-gray-400">
                  {age < 3 && "Toddler-specific features will be available for clothing recommendations"}
                  {age >= 3 && age < 13 && "Child-specific features including safety considerations and growth room"}
                  {age >= 13 &&
                    age < 18 &&
                    "Teen-specific features including school appropriateness and style preferences"}
                  {age >= 18 && age < 26 && "Young adult features including university and professional styling"}
                  {age >= 26 && "Adult features including work appropriateness and professional styling"}
                </p>
              </div>
            )}

            {/* Education Information - Show for ages 3-25 */}
            {isEducationAge && (
              <div className="bg-blue-900/20 rounded-lg p-4 border border-blue-600/30">
                <h4 className="text-white font-medium mb-3 flex items-center gap-2">
                  <GraduationCap className="w-4 h-4" />
                  Education Information
                </h4>

                {/* Goes to Education Checkbox */}
                <div className="flex items-center space-x-2 mb-3">
                  <Checkbox
                    id="education"
                    checked={formData.goesToEducation}
                    onCheckedChange={(checked) => handleFieldChange("goesToEducation", checked as boolean)}
                    className="border-gray-600"
                  />
                  <Label htmlFor="education" className="text-gray-300 flex items-center gap-2">
                    <BookOpen className="w-4 h-4" />
                    Goes to school/university
                  </Label>
                </div>

                {/* Education Details - Only show if goes to education */}
                {formData.goesToEducation && (
                  <div className="space-y-3">
                    {/* Education Type */}
                    <div>
                      <Label className="text-xs text-gray-400">Education Type</Label>
                      <Select
                        value={formData.educationType}
                        onValueChange={(value) => handleFieldChange("educationType", value)}
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
                        {formData.educationType === "university" ? "University/College Name" : "School Name"}
                      </Label>
                      <Input
                        value={formData.educationInfo.institutionName}
                        onChange={(e) => handleFieldChange("educationInfo.institutionName", e.target.value)}
                        placeholder={
                          formData.educationType === "university" ? "Enter university name" : "Enter school name"
                        }
                        className="mt-1 bg-gray-700 border-gray-600 text-white text-sm"
                      />
                    </div>

                    {/* Course (for university) */}
                    {formData.educationType === "university" && (
                      <div>
                        <Label className="text-xs text-gray-400">Course/Major</Label>
                        <Input
                          value={formData.educationInfo.course}
                          onChange={(e) => handleFieldChange("educationInfo.course", e.target.value)}
                          placeholder="e.g., Computer Science, Business"
                          className="mt-1 bg-gray-700 border-gray-600 text-white text-sm"
                        />
                      </div>
                    )}

                    {/* Year/Grade */}
                    <div>
                      <Label className="text-xs text-gray-400">
                        {formData.educationType === "university" ? "Year" : "Grade"}
                      </Label>
                      <Input
                        value={formData.educationInfo.year}
                        onChange={(e) => handleFieldChange("educationInfo.year", e.target.value)}
                        placeholder={formData.educationType === "university" ? "e.g., 2nd Year" : "e.g., Grade 10"}
                        className="mt-1 bg-gray-700 border-gray-600 text-white text-sm"
                      />
                    </div>

                    {/* Uniform Required */}
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="uniform"
                        checked={formData.educationInfo.uniformRequired}
                        onCheckedChange={(checked) =>
                          handleFieldChange("educationInfo.uniformRequired", checked as boolean)
                        }
                        className="border-gray-600"
                      />
                      <Label htmlFor="uniform" className="text-xs text-gray-300">
                        {formData.educationType === "university" ? "Dress code required" : "School uniform required"}
                      </Label>
                    </div>

                    {/* Dress Code Notes */}
                    <div>
                      <Label className="text-xs text-gray-400">Dress Code Notes</Label>
                      <Textarea
                        value={formData.educationInfo.dresscode}
                        onChange={(e) => handleFieldChange("educationInfo.dresscode", e.target.value)}
                        placeholder="Any specific dress code requirements..."
                        className="mt-1 bg-gray-700 border-gray-600 text-white text-sm"
                        rows={2}
                      />
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Weather Essentials - Show for ages 0-25 */}
            {isWeatherEssentialsAge && (
              <div className="bg-green-900/20 rounded-lg p-4 border border-green-600/30">
                <h4 className="text-white font-medium mb-3 flex items-center gap-2">
                  <Cloud className="w-4 h-4" />
                  Weather Essentials Needed
                </h4>
                <p className="text-xs text-gray-400 mb-3">
                  Check items that {formData.name || "this person"} needs for different weather conditions
                </p>
                <div className="grid grid-cols-2 gap-2">
                  {WEATHER_ESSENTIALS.map((essential) => (
                    <div key={essential.key} className="flex items-center space-x-2">
                      <Checkbox
                        id={essential.key}
                        checked={formData.weatherEssentials[essential.key as keyof typeof formData.weatherEssentials]}
                        onCheckedChange={(checked) => handleWeatherEssentialChange(essential.key, checked as boolean)}
                        className="border-gray-600"
                      />
                      <Label htmlFor={essential.key} className="text-xs text-gray-300 flex items-center gap-1">
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

        <DialogFooter>
          <Button
            onClick={onClose}
            variant="outline"
            className="border-gray-600 text-gray-300 hover:bg-gray-700 bg-transparent"
          >
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            disabled={loading}
            className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white"
          >
            {loading ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                Saving...
              </>
            ) : (
              <>+ Add Wardrobe</>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
