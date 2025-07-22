"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Sparkles, Plus, User, Calendar, DollarSign, Upload, X, Trash2 } from "lucide-react"
import Link from "next/link"
import { useAuth } from "@/hooks/useAuth"
import { useRouter } from "next/navigation"
import { wardrobeProfileService, wardrobeService, databaseTestService, type WardrobeProfile } from "@/lib/supabase"

interface WardrobeProfileDisplay {
  id: string
  name: string
  relation?: string
  age?: number
  profile_picture_url?: string
  isOwner: boolean
  itemCount: number
  totalValue: number
  lastUpdated: string
  avatar: string
  color: string
}

export default function WardrobesPage() {
  const { user, signOut } = useAuth()
  const router = useRouter()
  const [wardrobes, setWardrobes] = useState<WardrobeProfileDisplay[]>([])
  const [showAddModal, setShowAddModal] = useState(false)
  const [formData, setFormData] = useState({
    name: "",
    relation: "",
    age: "",
    profilePicture: null as File | null
  })
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  // Load wardrobe profiles from database
  useEffect(() => {
    if (user) {
      loadWardrobeProfiles()
    }
  }, [user])

  const loadWardrobeProfiles = async () => {
    if (!user) return
    
    try {
      setLoading(true)
      console.log("🚀 Loading wardrobes for user:", user.id)
      
      // Create main user wardrobe
      const userInitial = user.email?.charAt(0).toUpperCase() || "U"
      const mainWardrobe: WardrobeProfileDisplay = {
        id: "main",
        name: `${user.email?.split('@')[0] || 'You'} (You)`,
        isOwner: true,
        itemCount: 24,
        totalValue: 2108,
        lastUpdated: "today",
        avatar: userInitial,
        color: "from-cyan-500 to-blue-500"
      }
      
      // Load additional profiles (silently handle any errors)
      let additionalWardrobes: WardrobeProfileDisplay[] = []
      try {
        const profiles = await wardrobeProfileService.getWardrobeProfiles(user.id)
        if (profiles && profiles.length > 0) {
          additionalWardrobes = profiles.map(profile => ({
            id: profile.id,
            name: profile.name,
            relation: profile.relation,
            age: profile.age,
            profile_picture_url: profile.profile_picture_url,
            isOwner: false,
            itemCount: 0,
            totalValue: 0,
            lastUpdated: "recently",
            avatar: profile.profile_picture_url ? "" : profile.name.charAt(0).toUpperCase(),
            color: getRandomColor()
          }))
        }
        console.log("✅ Loaded", additionalWardrobes.length, "additional wardrobes")
      } catch (profileError) {
        console.log("⚠️ Could not load additional profiles, showing main wardrobe only")
      }
      
      setWardrobes([mainWardrobe, ...additionalWardrobes])
    } catch (error) {
      console.error("Error in loadWardrobeProfiles:", error)
      // Always show at least the main wardrobe
      const userInitial = user.email?.charAt(0).toUpperCase() || "U"
      const mainWardrobe: WardrobeProfileDisplay = {
        id: "main",
        name: `${user.email?.split('@')[0] || 'You'} (You)`,
        isOwner: true,
        itemCount: 24,
        totalValue: 2108,
        lastUpdated: "today",
        avatar: userInitial,
        color: "from-cyan-500 to-blue-500"
      }
      setWardrobes([mainWardrobe])
    } finally {
      setLoading(false)
    }
  }

  const getRandomColor = () => {
    const colors = [
      "from-orange-500 to-red-500",
      "from-green-500 to-teal-500", 
      "from-purple-500 to-indigo-500",
      "from-pink-500 to-purple-500",
      "from-yellow-500 to-orange-500",
      "from-blue-500 to-purple-500"
    ]
    return colors[Math.floor(Math.random() * colors.length)]
  }

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setFormData({ ...formData, profilePicture: file })
      const reader = new FileReader()
      reader.onload = (e) => {
        setImagePreview(e.target?.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const removeImage = () => {
    setFormData({ ...formData, profilePicture: null })
    setImagePreview(null)
  }

  const resetForm = () => {
    setFormData({
      name: "",
      relation: "",
      age: "",
      profilePicture: null
    })
    setImagePreview(null)
  }



  const handleAddWardrobe = async () => {
    if (!formData.name.trim() || !user) return
    
    try {
      setLoading(true)
      console.log("Starting to add wardrobe profile:", formData)
      console.log("User ID:", user.id)
      
      // Test database connection first
      console.log("Testing database connection...")
      
      // Create the wardrobe profile in database
      const profileData: Omit<WardrobeProfile, "id" | "created_at" | "updated_at"> = {
        user_id: user.id,
        name: formData.name,
        relation: formData.relation || undefined,
        age: formData.age ? parseInt(formData.age) : undefined,
        is_owner: false
      }
      
      console.log("Profile data to be saved:", profileData)
      const newProfile = await wardrobeProfileService.addWardrobeProfile(profileData)
      console.log("New profile created:", newProfile)
      
      if (newProfile) {
        // Upload profile picture if provided
        if (formData.profilePicture) {
          try {
            console.log("Uploading profile picture...")
            const imageResult = await wardrobeProfileService.uploadProfilePicture(
              formData.profilePicture,
              user.id,
              newProfile.id
            )
            
            // Update profile with image URL
            await wardrobeProfileService.updateWardrobeProfile(newProfile.id, {
              profile_picture_url: imageResult.url,
              profile_picture_path: imageResult.path
            })
            console.log("Profile picture uploaded successfully")
          } catch (imageError) {
            console.error("Error uploading profile picture:", imageError)
            console.error("Image error details:", {
              message: imageError?.message,
              code: imageError?.code,
              details: imageError?.details
            })
            // Don't show error alert - profile was created successfully
            console.log("Profile created successfully, but image upload failed")
          }
        }
        
        // Reload profiles to show the new one
        console.log("Reloading wardrobe profiles...")
        await loadWardrobeProfiles()
        resetForm()
        setShowAddModal(false)
        console.log("✅ Wardrobe profile added successfully!")
      } else {
        console.error("Failed to create profile - newProfile is null")
        console.log("❌ Profile creation failed - check console for details")
      }
    } catch (error) {
      console.error("Error adding wardrobe profile:", error)
      console.error("Error details:", error)
      console.log("❌ Profile creation failed:", error.message || error)
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteWardrobe = async (wardrobeId: string, wardrobeName: string, event: React.MouseEvent) => {
    // Prevent the card click event from firing
    event.stopPropagation()
    
    if (!user) return
    
    // Confirm deletion
    const confirmDelete = confirm(`Are you sure you want to delete "${wardrobeName}"'s wardrobe? This action cannot be undone.`)
    if (!confirmDelete) return
    
    try {
      setLoading(true)
      console.log("Deleting wardrobe profile:", wardrobeId)
      
      await wardrobeProfileService.deleteWardrobeProfile(wardrobeId)
      console.log("✅ Wardrobe profile deleted successfully")
      
      // Reload profiles to update the grid
      await loadWardrobeProfiles()
      
    } catch (error) {
      console.error("Error deleting wardrobe profile:", error)
      console.log("❌ Failed to delete wardrobe profile:", error.message || error)
    } finally {
      setLoading(false)
    }
  }

  const handleWardrobeClick = (wardrobeId: string) => {
    if (wardrobeId === "main") {
      router.push("/wardrobe")
    } else {
      // Navigate to specific wardrobe profile
      router.push(`/wardrobe?profile=${wardrobeId}`)
    }
  }

  // Function to navigate to another user's wardrobe
  const handleViewUserWardrobe = (userId: string) => {
    router.push(`/wardrobe?userId=${userId}`)
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-800 via-slate-900 to-blue-900 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-400">Please log in to access wardrobes</p>
          <Link href="/auth">
            <Button className="mt-4 bg-cyan-500 hover:bg-cyan-600">
              Sign In
            </Button>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-800 via-slate-900 to-blue-900">
      {/* Navigation */}
      <nav className="bg-slate-800/95 backdrop-blur-xl border-b border-slate-700/50 sticky top-0 z-50">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-xl flex items-center justify-center shadow-lg">
                <Sparkles className="w-6 h-6 text-white" />
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-cyan-200 to-blue-200 bg-clip-text text-transparent">
                Style Genie
              </span>
            </div>
            <div className="flex items-center space-x-6">
              <div className="px-3 py-1 bg-gradient-to-r from-orange-500 to-yellow-500 text-black text-sm rounded-full font-bold">
                Premium
              </div>
              <div className="text-sm text-gray-400">
                {user.email}
              </div>
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
            </div>
          </div>
        </div>
      </nav>

      <div className="container mx-auto px-6 py-16">
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-4xl font-bold text-white mb-4">
            Choose a Wardrobe
          </h1>
          <p className="text-xl text-gray-300 max-w-2xl mx-auto">
            Select whose wardrobe you'd like to manage or create a new one
          </p>
        </div>

        {/* Wardrobe Grid */}
        <div className="max-w-4xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Existing Wardrobes */}
            {wardrobes.map((wardrobe) => (
              <Card
                key={wardrobe.id}
                className="border-0 shadow-2xl bg-slate-800/80 backdrop-blur-xl border-slate-600/50 hover:border-cyan-500/50 transition-all duration-300 cursor-pointer hover:scale-105 relative group"
                onClick={() => handleWardrobeClick(wardrobe.id)}
              >
                {/* Delete Button - Only show for non-owner wardrobes */}
                {!wardrobe.isOwner && (
                  <Button
                    onClick={(e) => handleDeleteWardrobe(wardrobe.id, wardrobe.name, e)}
                    variant="outline"
                    size="sm"
                    className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 bg-red-600/20 border-red-500/50 text-red-400 hover:bg-red-600/40 hover:text-red-300 z-10"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                )}
                
                <CardContent className="p-8 text-center">
                  <div className={`w-20 h-20 bg-gradient-to-r ${wardrobe.color} rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg`}>
                    {wardrobe.profile_picture_url ? (
                      <img
                        src={wardrobe.profile_picture_url}
                        alt={wardrobe.name}
                        className="w-full h-full object-cover rounded-full"
                      />
                    ) : (
                      <span className="text-2xl font-bold text-white">
                        {wardrobe.avatar}
                      </span>
                    )}
                  </div>
                  
                  <h3 className="text-xl font-bold text-white mb-2">
                    {wardrobe.name}
                  </h3>
                  
                  {/* Show relation and age if available */}
                  {(wardrobe.relation || wardrobe.age) && (
                    <div className="text-sm text-gray-400 mb-2">
                      {wardrobe.relation && <span className="capitalize">{wardrobe.relation}</span>}
                      {wardrobe.relation && wardrobe.age && <span> • </span>}
                      {wardrobe.age && <span>{wardrobe.age} years old</span>}
                    </div>
                  )}
                  
                  <div className="space-y-2 text-sm text-gray-400">
                    <div className="flex items-center justify-center gap-2">
                      <User className="w-4 h-4" />
                      <span>{wardrobe.itemCount} items</span>
                      <span>•</span>
                      <DollarSign className="w-4 h-4" />
                      <span>${wardrobe.totalValue} value</span>
                    </div>
                    
                    <div className="flex items-center justify-center gap-2">
                      <Calendar className="w-4 h-4" />
                      <span>Last updated {wardrobe.lastUpdated}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}

            {/* Add New Wardrobe Card */}
            <Dialog open={showAddModal} onOpenChange={setShowAddModal}>
              <DialogTrigger asChild>
                <Card className="border-2 border-dashed border-slate-600 bg-slate-800/50 hover:border-cyan-500/50 transition-all duration-300 cursor-pointer hover:scale-105">
                  <CardContent className="p-8 text-center flex flex-col items-center justify-center h-full min-h-[280px]">
                    <div className="w-20 h-20 border-2 border-dashed border-slate-600 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Plus className="w-8 h-8 text-slate-400" />
                    </div>
                    <h3 className="text-lg font-semibold text-slate-300 mb-2">
                      Add New Wardrobe
                    </h3>
                    <p className="text-sm text-slate-500">
                      Create a wardrobe for family or friends
                    </p>
                  </CardContent>
                </Card>
              </DialogTrigger>
              
              <DialogContent className="bg-slate-800 border-slate-700 text-white">
                <DialogHeader>
                  <DialogTitle className="text-xl font-bold text-white">
                    Add New Wardrobe
                  </DialogTitle>
                </DialogHeader>
                
                <div className="space-y-4 mt-4">
                  {/* Name Field */}
                  <div>
                    <Label htmlFor="name" className="text-sm font-medium text-gray-300">
                      Name *
                    </Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="Enter name (e.g., Emma, Dad, etc.)"
                      className="mt-1 bg-slate-700 border-slate-600 text-white placeholder-slate-400"
                    />
                  </div>
                  
                  {/* Relation Field */}
                  <div>
                    <Label htmlFor="relation" className="text-sm font-medium text-gray-300">
                      Relation to you (Optional)
                    </Label>
                    <Input
                      id="relation"
                      value={formData.relation}
                      onChange={(e) => setFormData({ ...formData, relation: e.target.value })}
                      placeholder="Enter relation (e.g., spouse, child, friend, etc.)"
                      className="mt-1 bg-slate-700 border-slate-600 text-white placeholder-slate-400"
                    />
                  </div>
                  
                  {/* Age Field */}
                  <div>
                    <Label htmlFor="age" className="text-sm font-medium text-gray-300">
                      Age (Optional)
                    </Label>
                    <Input
                      id="age"
                      type="number"
                      value={formData.age}
                      onChange={(e) => setFormData({ ...formData, age: e.target.value })}
                      placeholder="Enter age"
                      className="mt-1 bg-slate-700 border-slate-600 text-white placeholder-slate-400"
                      min="1"
                      max="120"
                    />
                  </div>
                  
                  {/* Profile Picture Upload */}
                  <div>
                    <Label className="text-sm font-medium text-gray-300 mb-2 block">
                      Upload Profile Picture (Optional)
                    </Label>
                    
                    {imagePreview ? (
                      <div className="relative">
                        <div className="w-24 h-24 rounded-full overflow-hidden mx-auto mb-4 border-2 border-slate-600">
                          <img
                            src={imagePreview}
                            alt="Profile preview"
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <Button
                          type="button"
                          onClick={removeImage}
                          variant="outline"
                          size="sm"
                          className="absolute top-0 right-1/2 transform translate-x-1/2 border-slate-600 text-slate-300 hover:bg-slate-700"
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      </div>
                    ) : (
                      <div className="border-2 border-dashed border-slate-600 rounded-lg p-6 text-center hover:border-slate-500 transition-colors relative">
                        <Upload className="w-8 h-8 text-slate-400 mx-auto mb-2" />
                        <p className="text-sm text-slate-400 mb-2">Click to upload or drag and drop</p>
                        <p className="text-xs text-slate-500">PNG, JPG up to 5MB</p>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleImageChange}
                          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                        />
                      </div>
                    )}
                  </div>
                  
                  <div className="flex gap-3 pt-4">
                    <Button
                      onClick={() => {
                        setShowAddModal(false)
                        resetForm()
                      }}
                      variant="outline"
                      className="flex-1 border-slate-600 text-slate-300 hover:bg-slate-700"
                      disabled={loading}
                    >
                      Cancel
                    </Button>
                    <Button
                      onClick={handleAddWardrobe}
                      disabled={!formData.name.trim() || loading}
                      className="flex-1 bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 text-white"
                    >
                      {loading ? "Adding..." : "Add Wardrobe"}
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </div>
    </div>
  )
}
