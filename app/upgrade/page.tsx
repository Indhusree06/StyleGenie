"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Sparkles, ArrowLeft, Plus, User, Check, X, Upload, Trash2 } from "lucide-react"
import Link from "next/link"
import { useAuth } from "@/hooks/useAuth"
import { useRouter } from "next/navigation"
import { wardrobeProfileService } from "@/lib/supabase"
import { type WardrobeProfile } from "@/lib/supabase"

export default function UpgradePage() {
  const { user } = useAuth()
  const router = useRouter()
  const [step, setStep] = useState<"plan" | "profiles" | "payment" | "success">("plan")
  const [loading, setLoading] = useState(false)
  const [profiles, setProfiles] = useState<any[]>([])
  const [newProfiles, setNewProfiles] = useState<Array<{
    name: string;
    relation?: string;
    age?: string;
    profilePicture: File | null;
    imagePreview: string | null;
  }>>([
    {
      name: "",
      relation: "",
      age: "",
      profilePicture: null,
      imagePreview: null
    }
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

  const handleProfileChange = (index: number, field: string, value: string) => {
    const updatedProfiles = [...newProfiles]
    updatedProfiles[index] = {
      ...updatedProfiles[index],
      [field]: value
    }
    setNewProfiles(updatedProfiles)
  }

  const handleImageChange = (index: number, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const updatedProfiles = [...newProfiles]
      updatedProfiles[index] = {
        ...updatedProfiles[index],
        profilePicture: file
      }
      
      // Create image preview
      const reader = new FileReader()
      reader.onload = (e) => {
        const updatedProfilesWithPreview = [...updatedProfiles]
        updatedProfilesWithPreview[index] = {
          ...updatedProfilesWithPreview[index],
          imagePreview: e.target?.result as string
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
      imagePreview: null
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
          profilePicture: null,
          imagePreview: null
        }
      ])
    }
  }

  const removeProfileForm = (index: number) => {
    const updatedProfiles = [...newProfiles]
    updatedProfiles.splice(index, 1)
    setNewProfiles(updatedProfiles)
  }

  const handleSubmitProfiles = async () => {
    if (!user) return
    
    try {
      setLoading(true)
      
      // Create each profile
      for (const profile of newProfiles) {
        if (profile.name.trim()) {
          // Create profile in database
          const profileData: Omit<WardrobeProfile, "id" | "created_at" | "updated_at"> = {
            user_id: user.id,
            name: profile.name.trim(),
            relation: profile.relation?.trim() || undefined,
            age: profile.age ? parseInt(profile.age) : undefined,
            is_owner: false
          }
          
          const newProfile = await wardrobeProfileService.addWardrobeProfile(profileData)
          
          // Upload profile picture if provided
          if (newProfile && profile.profilePicture) {
            await wardrobeProfileService.uploadProfilePicture(
              profile.profilePicture,
              user.id,
              newProfile.id
            )
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

  const handleContinue = () => {
    // Skip payment and go directly to profiles step
    setStep("profiles")
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-400">Please log in to upgrade your account</p>
          <Link href="/auth">
            <Button className="mt-4 bg-teal-500 hover:bg-teal-600">
              Sign In
            </Button>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
      {/* Navigation */}
      <nav className="bg-gray-800/95 backdrop-blur-sm border-b border-gray-700 sticky top-0 z-50">
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
                <div className="w-8 h-8 bg-teal-500 rounded-full flex items-center justify-center">
                  <Sparkles className="w-4 h-4 text-white" />
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
              <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                step === "plan" ? "bg-teal-500" : "bg-gray-700"
              }`}>
                <span className="text-white font-bold">1</span>
              </div>
              <span className="text-sm mt-2 text-gray-400">Plan</span>
            </div>
            <div className={`flex-1 h-1 ${step !== "plan" ? "bg-teal-500" : "bg-gray-700"}`}></div>
            <div className="flex flex-col items-center">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                step === "profiles" ? "bg-teal-500" : step === "success" ? "bg-teal-500" : "bg-gray-700"
              }`}>
                <span className="text-white font-bold">2</span>
              </div>
              <span className="text-sm mt-2 text-gray-400">Profiles</span>
            </div>
            <div className={`flex-1 h-1 ${step === "success" ? "bg-teal-500" : "bg-gray-700"}`}></div>
            <div className="flex flex-col items-center">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                step === "success" ? "bg-teal-500" : "bg-gray-700"
              }`}>
                <span className="text-white font-bold">3</span>
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
              <p className="text-gray-400">Manage wardrobes for your entire family and get personalized recommendations for everyone you care about</p>
            </div>

            <Card className="bg-gray-800/50 backdrop-blur-xl border-gray-700/50 mb-8">
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
                    <div className="w-5 h-5 mt-0.5 rounded-full bg-gradient-to-r from-teal-500 to-cyan-500 flex-shrink-0 flex items-center justify-center">
                      <Check className="w-3 h-3 text-white" />
                    </div>
                    <span className="text-gray-300">Everything in Free Plan</span>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-5 h-5 mt-0.5 rounded-full bg-gradient-to-r from-teal-500 to-cyan-500 flex-shrink-0 flex items-center justify-center">
                      <Check className="w-3 h-3 text-white" />
                    </div>
                    <span className="text-gray-300">Up to 5 family wardrobes</span>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-5 h-5 mt-0.5 rounded-full bg-gradient-to-r from-teal-500 to-cyan-500 flex-shrink-0 flex items-center justify-center">
                      <Check className="w-3 h-3 text-white" />
                    </div>
                    <span className="text-gray-300">Kids, spouse, friends profiles</span>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-5 h-5 mt-0.5 rounded-full bg-gradient-to-r from-teal-500 to-cyan-500 flex-shrink-0 flex items-center justify-center">
                      <Check className="w-3 h-3 text-white" />
                    </div>
                    <span className="text-gray-300">Age-appropriate recommendations</span>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-5 h-5 mt-0.5 rounded-full bg-gradient-to-r from-teal-500 to-cyan-500 flex-shrink-0 flex items-center justify-center">
                      <Check className="w-3 h-3 text-white" />
                    </div>
                    <span className="text-gray-300">Advanced AI styling engine</span>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-5 h-5 mt-0.5 rounded-full bg-gradient-to-r from-teal-500 to-cyan-500 flex-shrink-0 flex items-center justify-center">
                      <Check className="w-3 h-3 text-white" />
                    </div>
                    <span className="text-gray-300">Shared wardrobe access</span>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-5 h-5 mt-0.5 rounded-full bg-gradient-to-r from-teal-500 to-cyan-500 flex-shrink-0 flex items-center justify-center">
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
                className="bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-600 hover:to-cyan-600 text-white shadow-lg px-8 py-6 text-lg font-semibold"
              >
                Continue to Create Profiles
              </Button>
            </div>
          </div>
        )}

        {/* Payment Step */}
        {step === "payment" && (
          <div className="max-w-2xl mx-auto">
            <div className="text-center mb-10">
              <h2 className="text-3xl font-bold text-white mb-4">Payment Details</h2>
              <p className="text-gray-400">Your subscription will begin immediately after payment</p>
            </div>

            <Card className="bg-gray-800/50 backdrop-blur-xl border-gray-700/50 mb-8">
              <CardContent className="p-8">
                <div className="space-y-6">
                  {/* Payment form would go here in a real app */}
                  <div className="space-y-2">
                    <Label htmlFor="card-number" className="text-gray-300">Card Number</Label>
                    <Input 
                      id="card-number" 
                      placeholder="1234 5678 9012 3456" 
                      className="bg-gray-700 border-gray-600 text-white"
                    />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="expiry" className="text-gray-300">Expiry Date</Label>
                      <Input 
                        id="expiry" 
                        placeholder="MM/YY" 
                        className="bg-gray-700 border-gray-600 text-white"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="cvc" className="text-gray-300">CVC</Label>
                      <Input 
                        id="cvc" 
                        placeholder="123" 
                        className="bg-gray-700 border-gray-600 text-white"
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="name" className="text-gray-300">Name on Card</Label>
                    <Input 
                      id="name" 
                      placeholder="John Doe" 
                      className="bg-gray-700 border-gray-600 text-white"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="flex justify-between">
              <Button 
                onClick={() => setStep("plan")}
                variant="outline"
                className="border-gray-600 text-gray-300 hover:bg-gray-700"
              >
                Back
              </Button>
              <Button 
                onClick={handlePayment}
                className="bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-600 hover:to-cyan-600 text-white shadow-lg"
              >
                Complete Payment
              </Button>
            </div>
          </div>
        )}

        {/* Profiles Step */}
        {step === "profiles" && (
          <div className="max-w-3xl mx-auto">
            <div className="text-center mb-10">
              <h2 className="text-3xl font-bold text-white mb-4">Create Family Profiles</h2>
              <p className="text-gray-400">Add up to 5 profiles for family members or different purposes</p>
            </div>

            {/* Existing profiles */}
            {profiles.length > 0 && (
              <div className="mb-8">
                <h3 className="text-xl font-semibold text-white mb-4">Existing Profiles</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
                  {profiles.map((profile) => (
                    <Card key={profile.id} className="bg-gray-800/50 backdrop-blur-xl border-gray-700/50">
                      <CardContent className="p-4">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 rounded-full bg-gradient-to-r from-teal-500 to-cyan-500 flex items-center justify-center">
                            {profile.profile_picture_url ? (
                              <img 
                                src={profile.profile_picture_url} 
                                alt={profile.name} 
                                className="w-full h-full object-cover rounded-full"
                              />
                            ) : (
                              <span className="text-lg font-bold text-white">{profile.name.charAt(0).toUpperCase()}</span>
                            )}
                          </div>
                          <div>
                            <h4 className="text-white font-medium">{profile.name}</h4>
                            {profile.relation && (
                              <p className="text-gray-400 text-sm capitalize">{profile.relation}</p>
                            )}
                            {profile.age && (
                              <p className="text-gray-400 text-sm">{profile.age} years old</p>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            )}

            {/* New profile forms */}
            <div className="space-y-6">
              <h3 className="text-xl font-semibold text-white mb-4">
                {profiles.length > 0 ? "Add More Profiles" : "Create New Profiles"}
              </h3>
              
              {newProfiles.map((profile, index) => (
                <Card key={index} className="bg-gray-800/50 backdrop-blur-xl border-gray-700/50">
                  <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle className="text-white">Profile {index + 1}</CardTitle>
                    {index > 0 && (
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="text-gray-400 hover:text-white hover:bg-gray-700"
                        onClick={() => removeProfileForm(index)}
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    )}
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor={`name-${index}`} className="text-gray-300">Name *</Label>
                      <Input 
                        id={`name-${index}`}
                        value={profile.name}
                        onChange={(e) => handleProfileChange(index, "name", e.target.value)}
                        placeholder="Enter name"
                        className="bg-gray-700 border-gray-600 text-white"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor={`relation-${index}`} className="text-gray-300">Relation (Optional)</Label>
                      <Input 
                        id={`relation-${index}`}
                        value={profile.relation}
                        onChange={(e) => handleProfileChange(index, "relation", e.target.value)}
                        placeholder="E.g., spouse, child, friend"
                        className="bg-gray-700 border-gray-600 text-white"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor={`age-${index}`} className="text-gray-300">Age (Optional)</Label>
                      <Input 
                        id={`age-${index}`}
                        type="number"
                        value={profile.age}
                        onChange={(e) => handleProfileChange(index, "age", e.target.value)}
                        placeholder="Enter age"
                        className="bg-gray-700 border-gray-600 text-white"
                        min="1"
                        max="120"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label className="text-gray-300 block mb-2">Profile Picture (Optional)</Label>
                      
                      {profile.imagePreview ? (
                        <div className="relative">
                          <div className="w-24 h-24 rounded-full overflow-hidden mx-auto mb-4 border-2 border-gray-600">
                            <img
                              src={profile.imagePreview}
                              alt="Profile preview"
                              className="w-full h-full object-cover"
                            />
                          </div>
                          <Button
                            type="button"
                            onClick={() => removeImage(index)}
                            variant="outline"
                            size="sm"
                            className="absolute top-0 right-1/2 transform translate-x-1/2 border-gray-600 text-gray-300 hover:bg-gray-700"
                          >
                            <X className="w-4 h-4" />
                          </Button>
                        </div>
                      ) : (
                        <div className="border-2 border-dashed border-gray-600 rounded-lg p-6 text-center hover:border-gray-500 transition-colors relative">
                          <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                          <p className="text-sm text-gray-400 mb-2">Click to upload or drag and drop</p>
                          <p className="text-xs text-gray-500">PNG, JPG up to 5MB</p>
                          <input
                            type="file"
                            accept="image/*"
                            onChange={(e) => handleImageChange(index, e)}
                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                          />
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
              
              {/* Add more profiles button */}
              {newProfiles.length + profiles.length < 5 && (
                <Button
                  onClick={addProfileForm}
                  variant="outline"
                  className="w-full border-dashed border-gray-600 text-gray-400 hover:text-white hover:bg-gray-800/50"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add Another Profile
                </Button>
              )}
            </div>

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
                disabled={loading || newProfiles.every(p => !p.name.trim())}
                className="bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-600 hover:to-cyan-600 text-white shadow-lg"
              >
                {loading ? "Creating Profiles..." : "Create Profiles"}
              </Button>
            </div>
          </div>
        )}

        {/* Success Step */}
        {step === "success" && (
          <div className="max-w-2xl mx-auto text-center">
            <div className="w-20 h-20 bg-gradient-to-r from-teal-500 to-cyan-500 rounded-full flex items-center justify-center mx-auto mb-6">
              <Check className="w-10 h-10 text-white" />
            </div>
            
            <h2 className="text-3xl font-bold text-white mb-4">Upgrade Complete!</h2>
            <p className="text-gray-400 mb-8">
              Your account has been upgraded to Premium Family. You can now manage wardrobes for your entire family.
            </p>
            
            <Link href="/wardrobes">
              <Button className="bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-600 hover:to-cyan-600 text-white shadow-lg px-8 py-4 text-lg font-semibold">
                Go to My Wardrobes
              </Button>
            </Link>
          </div>
        )}
      </div>
    </div>
  )
}