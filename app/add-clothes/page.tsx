"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ArrowLeft, Upload, X, Plus, Sparkles } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"

import { wardrobeService, type Category, type Tag } from "@/lib/supabase"
import { useAuth } from "@/hooks/useAuth"

export default function AddClothesPage() {
  const router = useRouter()
  const [formData, setFormData] = useState({
    name: "",
    category: "",
    description: "",
    brand: "",
    color: "",
    size: "",
    price: "",
    purchaseDate: "",
    wearCount: "0",
    lastWorn: "",
    condition: "good" as const,
    image: null as File | null,
  })

  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const [categories, setCategories] = useState<Category[]>([])
  const [availableTags, setAvailableTags] = useState<Tag[]>([])
  const [selectedTags, setSelectedTags] = useState<string[]>([])

  const { user, signOut } = useAuth()

  useEffect(() => {
    loadFormData()
  }, [])

  const loadFormData = async () => {
    try {
      const [categoriesData, tagsData] = await Promise.all([wardrobeService.getCategories(), wardrobeService.getTags()])
      setCategories(categoriesData || [])
      setAvailableTags(tagsData || [])
    } catch (error) {
      console.error("Error loading form data:", error)
    }
  }

  // Real database category IDs (fetched from your database)
  const defaultCategories = [
    { id: "d56f3f3b-01ea-470f-917c-a1894c37055b", name: "dresses", description: "Dresses and gowns" },
    { id: "761b5985-c89f-476a-9a22-a3372de3ab81", name: "tops", description: "Shirts, blouses, and tops" },
    { id: "65c03254-2c6c-4c4d-8e87-628336a17224", name: "bottoms", description: "Pants, jeans, and skirts" },
    { id: "8799b586-cfcb-4d73-a3fe-63d7fd9570c5", name: "shoes", description: "All types of footwear" },
    { id: "e06a4d3f-9c48-45f3-bcdb-b8745fddb430", name: "outerwear", description: "Jackets, coats, and blazers" },
    { id: "d468436f-836e-4292-8683-00621ee6ca35", name: "accessories", description: "Jewelry, bags, and accessories" },
  ]

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



  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) {
      alert("Please log in to add items to your wardrobe")
      return
    }

    setIsSubmitting(true)

    try {
      // Find the selected category
      const allCategories = categories.length > 0 ? categories : defaultCategories
      const selectedCategory = allCategories.find(cat => cat.name === formData.category)
      
      if (!selectedCategory) {
        throw new Error("Please select a valid category")
      }

      // Create the wardrobe item with all form data
      const newItem = {
        user_id: user.id,
        category_id: selectedCategory.id,
        name: formData.name,
        description: formData.description,
        brand: formData.brand || "",
        color: formData.color || "",
        size: formData.size || "",
        price: formData.price ? parseFloat(formData.price) : 0,
        purchase_date: formData.purchaseDate || undefined,
        image_url: undefined,
        image_path: undefined,
        is_favorite: false,
        condition: formData.condition,
        last_worn: formData.lastWorn || undefined,
        wear_count: parseInt(formData.wearCount) || 0
      }

      // Debug: Log the item being saved
      console.log("Attempting to save item:", newItem)
      
      // Save the item to database
      const savedItem = await wardrobeService.addWardrobeItem(newItem)
      if (!savedItem) {
        throw new Error("Failed to save item to database - no item returned")
      }
      
      console.log("Item saved successfully:", savedItem)

      // Upload image if provided
      if (formData.image) {
        try {
          const imageResult = await wardrobeService.uploadImage(formData.image, user.id, savedItem.id)
          await wardrobeService.updateWardrobeItem(savedItem.id, {
            image_url: imageResult.url,
            image_path: imageResult.path
          })
        } catch (imageError) {
          console.error("Error uploading image:", imageError)
          // Continue without image - item is already saved
        }
      }

      // Add selected tags
      if (selectedTags.length > 0) {
        try {
          await wardrobeService.addTagsToItem(savedItem.id, selectedTags)
        } catch (tagError) {
          console.error("Error adding tags:", tagError)
          // Continue - item is saved, just without tags
        }
      }
      
      alert("Item added successfully!")
      router.push("/wardrobe")
    } catch (error) {
      console.error("Error saving item:", error)
      alert(`Failed to save item: ${error instanceof Error ? error.message : 'Unknown error'}`)
    } finally {
      setIsSubmitting(false)
    }
  }

  const isFormValid = formData.name && formData.category && formData.description

  return (
    <div className="min-h-screen bg-gray-900">
      {/* Navigation */}
      <nav className="bg-gray-800/95 backdrop-blur-sm border-b border-gray-700 sticky top-0 z-50">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-4">
              <Link href="/wardrobe">
                <Button variant="ghost" size="sm" className="text-gray-400 hover:text-gray-100">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back to Wardrobe
                </Button>
              </Link>
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-teal-500 rounded-full flex items-center justify-center">
                  <Plus className="w-4 h-4 text-white" />
                </div>
                <h1 className="text-2xl font-bold text-white">Add New Item</h1>
              </div>
            </div>
            <div className="flex items-center gap-4">
              {user && (
                <>
                  <div className="text-sm text-gray-400">
                    {user.email}
                  </div>
                  <Button
                    onClick={async () => {
                      await signOut()
                      router.push('/landing')
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

      <div className="container mx-auto px-6 py-8">
        <div className="max-w-2xl mx-auto">
          <Card className="shadow-2xl border-0 bg-gray-800 border-gray-700">
            <CardHeader className="bg-gray-700/50 border-b">
              <CardTitle className="flex items-center gap-2 text-white">
                <Sparkles className="w-5 h-5 text-teal-500" />
                Item Details
              </CardTitle>
              <p className="text-sm text-gray-400">Add a new item to your wardrobe collection</p>
            </CardHeader>
            <CardContent className="p-8">
              <form onSubmit={handleSubmit} className="space-y-8">
                {/* Image Upload */}
                <div>
                  <Label htmlFor="image" className="text-sm font-semibold text-gray-300">
                    Item Image
                  </Label>
                  <div className="mt-3">
                    {imagePreview ? (
                      <div className="relative w-48 h-64 mx-auto">
                        <img
                          src={imagePreview}
                          alt="Preview"
                          className="w-full h-full object-cover rounded-xl border-2 border-gray-200 shadow-lg"
                        />
                        <Button
                          type="button"
                          variant="destructive"
                          size="sm"
                          className="absolute -top-2 -right-2 rounded-full w-8 h-8 p-0 shadow-lg"
                          onClick={() => {
                            setImagePreview(null)
                            setFormData({ ...formData, image: null })
                          }}
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      </div>
                    ) : (
                      <div className="border-2 border-dashed border-gray-600 rounded-xl p-12 text-center bg-gray-700 hover:bg-gray-600 transition-colors">
                        <div className="w-16 h-16 bg-teal-700 rounded-full flex items-center justify-center mx-auto mb-4">
                          <Upload className="w-8 h-8 text-gray-400" />
                        </div>
                        <p className="text-gray-400 mb-4 font-medium">Upload an image of your clothing item</p>
                        <p className="text-sm text-gray-500 mb-6">Drag and drop or click to browse</p>
                        <Input
                          id="image"
                          type="file"
                          accept="image/*"
                          onChange={handleImageChange}
                          className="hidden"
                        />
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => document.getElementById("image")?.click()}
                          className="bg-gray-700 hover:bg-gray-600 border-gray-600 text-white"
                        >
                          Choose Image
                        </Button>
                      </div>
                    )}
                  </div>
                </div>

                {/* Item Name */}
                <div>
                  <Label htmlFor="name" className="text-sm font-semibold text-gray-300">
                    Item Name *
                  </Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g., Black Evening Dress"
                    required
                    className="mt-2 bg-gray-700 border-gray-600 text-white focus:border-teal-400 focus:ring-teal-400"
                  />
                </div>

                {/* Category */}
                <div>
                  <Label htmlFor="category" className="text-sm font-semibold text-gray-300">
                    Category *
                  </Label>
                  <Select
                    value={formData.category}
                    onValueChange={(value) => setFormData({ ...formData, category: value })}
                  >
                    <SelectTrigger className="mt-2 bg-gray-700 border-gray-600 text-white focus:border-teal-400 focus:ring-teal-400">
                      <SelectValue placeholder="Select a category" />
                    </SelectTrigger>
                    <SelectContent className="bg-gray-800 text-white border-gray-700">
                      {(categories.length > 0 ? categories : defaultCategories).map((category) => (
                        <SelectItem key={category.id} value={category.name}>
                          {category.name.charAt(0).toUpperCase() + category.name.slice(1)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Description */}
                <div>
                  <Label htmlFor="description" className="text-sm font-semibold text-gray-300">
                    Description *
                  </Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Describe the item, its style, material, color, and any special features..."
                    rows={4}
                    required
                    className="mt-2 bg-gray-700 border-gray-600 text-white focus:border-teal-400 focus:ring-teal-400"
                  />
                </div>

                {/* Additional Details Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Brand */}
                  <div>
                    <Label htmlFor="brand" className="text-sm font-semibold text-gray-300">
                      Brand
                    </Label>
                    <Input
                      id="brand"
                      value={formData.brand}
                      onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
                      placeholder="e.g., Nike, Zara, H&M"
                      className="mt-2 bg-gray-700 border-gray-600 text-white focus:border-teal-400 focus:ring-teal-400"
                    />
                  </div>

                  {/* Color */}
                  <div>
                    <Label htmlFor="color" className="text-sm font-semibold text-gray-300">
                      Primary Color
                    </Label>
                    <Select
                      value={formData.color}
                      onValueChange={(value) => setFormData({ ...formData, color: value })}
                    >
                      <SelectTrigger className="mt-2 bg-gray-700 border-gray-600 text-white focus:border-teal-400 focus:ring-teal-400">
                        <SelectValue placeholder="Select primary color" />
                      </SelectTrigger>
                      <SelectContent className="bg-gray-800 text-white border-gray-700">
                        {["black", "white", "blue", "red", "pink", "gray", "green", "yellow", "purple", "brown", "orange", "navy", "beige", "cream"].map((color) => (
                          <SelectItem key={color} value={color}>
                            <div className="flex items-center gap-2">
                              <div 
                                className="w-4 h-4 rounded-full border border-gray-400" 
                                style={{ backgroundColor: color === 'white' ? '#ffffff' : color === 'black' ? '#000000' : color === 'gray' ? '#808080' : color === 'navy' ? '#000080' : color === 'beige' ? '#f5f5dc' : color === 'cream' ? '#fffdd0' : color }}
                              />
                              {color.charAt(0).toUpperCase() + color.slice(1)}
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Size */}
                  <div>
                    <Label htmlFor="size" className="text-sm font-semibold text-gray-300">
                      Size
                    </Label>
                    <Input
                      id="size"
                      value={formData.size}
                      onChange={(e) => setFormData({ ...formData, size: e.target.value })}
                      placeholder="e.g., S, M, L, XL, 32, 8.5"
                      className="mt-2 bg-gray-700 border-gray-600 text-white focus:border-teal-400 focus:ring-teal-400"
                    />
                  </div>

                  {/* Price */}
                  <div>
                    <Label htmlFor="price" className="text-sm font-semibold text-gray-300">
                      Price ($)
                    </Label>
                    <Input
                      id="price"
                      type="number"
                      step="0.01"
                      min="0"
                      value={formData.price}
                      onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                      placeholder="0.00"
                      className="mt-2 bg-gray-700 border-gray-600 text-white focus:border-teal-400 focus:ring-teal-400"
                    />
                  </div>

                  {/* Purchase Date */}
                  <div>
                    <Label htmlFor="purchaseDate" className="text-sm font-semibold text-gray-300">
                      Purchase Date
                    </Label>
                    <Input
                      id="purchaseDate"
                      type="date"
                      value={formData.purchaseDate}
                      onChange={(e) => setFormData({ ...formData, purchaseDate: e.target.value })}
                      max={new Date().toISOString().split('T')[0]}
                      className="mt-2 bg-gray-700 border-gray-600 text-white focus:border-teal-400 focus:ring-teal-400"
                    />
                  </div>

                  {/* Condition */}
                  <div>
                    <Label htmlFor="condition" className="text-sm font-semibold text-gray-300">
                      Condition
                    </Label>
                    <Select
                      value={formData.condition}
                      onValueChange={(value) => setFormData({ ...formData, condition: value as "new" | "excellent" | "good" | "fair" | "poor" })}
                    >
                      <SelectTrigger className="mt-2 bg-gray-700 border-gray-600 text-white focus:border-teal-400 focus:ring-teal-400">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-gray-800 text-white border-gray-700">
                        <SelectItem value="new">New (with tags)</SelectItem>
                        <SelectItem value="excellent">Excellent (like new)</SelectItem>
                        <SelectItem value="good">Good (minor wear)</SelectItem>
                        <SelectItem value="fair">Fair (noticeable wear)</SelectItem>
                        <SelectItem value="poor">Poor (significant wear)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Wear Information */}
                <div className="bg-gray-700/30 rounded-xl p-6 border border-gray-600/50">
                  <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-teal-400" />
                    Wear History
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Wear Count */}
                    <div>
                      <Label htmlFor="wearCount" className="text-sm font-semibold text-gray-300">
                        Times Worn
                      </Label>
                      <Input
                        id="wearCount"
                        type="number"
                        min="0"
                        value={formData.wearCount}
                        onChange={(e) => setFormData({ ...formData, wearCount: e.target.value })}
                        placeholder="0"
                        className="mt-2 bg-gray-700 border-gray-600 text-white focus:border-teal-400 focus:ring-teal-400"
                      />
                      <p className="text-xs text-gray-500 mt-1">How many times have you worn this item?</p>
                    </div>

                  </div>
                </div>

                {/* Tags */}
                <div>
                  <Label className="text-sm font-semibold text-gray-300">Tags</Label>
                  <p className="text-xs text-gray-500 mt-1 mb-3">Select tags that describe this item</p>
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-2 max-h-40 overflow-y-auto p-3 bg-gray-700 rounded-lg border border-gray-600">
                      {availableTags.map((tag) => (
                        <label key={tag.id} className="flex items-center space-x-2 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={selectedTags.includes(tag.id)}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setSelectedTags([...selectedTags, tag.id])
                              } else {
                                setSelectedTags(selectedTags.filter((id) => id !== tag.id))
                              }
                            }}
                            className="rounded border-gray-500 text-teal-500 focus:ring-teal-400"
                          />
                          <div
                            className="px-2 py-1 rounded text-xs border-0"
                            style={{ backgroundColor: `${tag.color}20`, color: tag.color }}
                          >
                            {tag.name}
                          </div>
                        </label>
                      ))}
                    </div>

                    {selectedTags.length > 0 && (
                      <div className="flex gap-2 flex-wrap p-3 bg-gray-700/50 rounded-lg border border-gray-600">
                        <span className="text-sm text-gray-300">Selected:</span>
                        {selectedTags.map((tagId) => {
                          const tag = availableTags.find((t) => t.id === tagId)
                          return tag ? (
                            <div
                              key={tag.id}
                              className="px-2 py-1 rounded text-xs border-0"
                              style={{ backgroundColor: `${tag.color}30`, color: tag.color }}
                            >
                              {tag.name}
                            </div>
                          ) : null
                        })}
                      </div>
                    )}
                  </div>
                </div>

                {/* Submit Button */}
                <div className="flex gap-4 pt-6 border-t border-gray-700">
                  <Button
                    type="submit"
                    disabled={!isFormValid || isSubmitting}
                    className="flex-1 bg-teal-500 hover:bg-teal-600 text-white shadow-lg py-3"
                  >
                    {isSubmitting ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                        Adding Item...
                      </>
                    ) : (
                      <>
                        <Plus className="w-4 h-4 mr-2" />
                        Add to Wardrobe
                      </>
                    )}
                  </Button>
                  <Link href="/wardrobe">
                    <Button
                      type="button"
                      variant="outline"
                      className="px-8 py-3 border-gray-600 hover:bg-gray-700 bg-transparent text-white"
                    >
                      Cancel
                    </Button>
                  </Link>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
