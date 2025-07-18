"use client"

import { useState, useEffect, Suspense, useMemo } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { ArrowLeft, Search, Sparkles, Plus, BarChart3, Heart, Trash2, Info, Filter, Grid3X3, List, Edit, Upload, X } from "lucide-react"
import Link from "next/link"
import { type WardrobeItem } from "@/lib/supabase"
import { wardrobeService } from "@/lib/supabase"
import { useAuth } from "@/hooks/useAuth"
import { useSearchParams, useRouter } from "next/navigation"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import EditWardrobeModal from "@/components/edit-wardrobe-modal"

function WardrobeContent() {
  const [searchTerm, setSearchTerm] = useState("")
  const [wardrobeItems, setWardrobeItems] = useState<WardrobeItem[]>([])
  const [initialized, setInitialized] = useState(false)
  const [loading, setLoading] = useState(true)

  const { user, signOut } = useAuth()
  const router = useRouter()
  const searchParams = useSearchParams()
  const searchParam = searchParams?.get("search")

  const categories = ["all", "dresses", "tops", "bottoms", "shoes", "outerwear", "accessories"]

  // Enhanced filtering and sorting state
  const [filters, setFilters] = useState({
    category: "all",
    season: "all",
    occasion: "all",
    color: "all",
    condition: "all",
    favorites: false,
    neverWorn: false,
  })
  const [sortBy, setSortBy] = useState("newest")
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid")
  
  // Edit modal state
  const [editModalOpen, setEditModalOpen] = useState(false)
  const [editingItem, setEditingItem] = useState<WardrobeItem | null>(null)
  const [editFormData, setEditFormData] = useState({
    name: "",
    description: "",
    brand: "",
    color: "",
    size: "",
    price: "",
    condition: "good" as const,
    wearCount: "0",
    lastWorn: "",
    selectedTags: [] as string[],
    newImage: null as File | null,
  })
  const [availableTags, setAvailableTags] = useState<any[]>([])
  const [imagePreview, setImagePreview] = useState<string | null>(null)

  // Add these filter options after the existing categories
  const seasons = ["all", "summer", "winter", "spring", "fall"]
  const occasions = ["all", "casual", "formal", "business", "party", "traditional"]
  const colors = ["all", "black", "white", "blue", "red", "pink", "gray", "green", "yellow", "purple"]
  const conditions = ["all", "new", "excellent", "good", "fair", "poor"]
  const sortOptions = [
    { value: "newest", label: "Newest First" },
    { value: "oldest", label: "Oldest First" },
    { value: "alphabetical", label: "A-Z" },
    { value: "mostWorn", label: "Most Worn" },
    { value: "leastWorn", label: "Least Worn" },
    { value: "favorites", label: "Favorites First" },
  ]

  // Calculate stats using useMemo to prevent recalculation
  const stats = useMemo(() => {
    return wardrobeItems.reduce((acc: Record<string, number>, item) => {
      const categoryName = item.category?.name || item.category || 'uncategorized'
      acc[categoryName] = (acc[categoryName] || 0) + 1
      return acc
    }, {})
  }, [wardrobeItems])

  // Initialize data - load user's real wardrobe
  useEffect(() => {
    if (!initialized && user) {
      loadWardrobeData()
      setInitialized(true)
    } else if (!user) {
      setLoading(false)
    }
  }, [initialized, user])

  const loadWardrobeData = async () => {
    if (!user) {
      setLoading(false)
      return
    }

    try {
      setLoading(true)
      console.log("Loading wardrobe from Supabase database...")
      const items = await wardrobeService.getWardrobeItems(user.id)
      setWardrobeItems(items || [])
      console.log(`Loaded ${items?.length || 0} items from database`)
    } catch (error) {
      console.error("Error loading wardrobe from database:", error)
      setWardrobeItems([])
    } finally {
      setLoading(false)
    }
  }

  // Handle search param separately to avoid infinite loops
  useEffect(() => {
    if (searchParam && searchParam !== searchTerm) {
      setSearchTerm(searchParam)
    }
  }, [searchParam]) // Only depend on searchParam, not searchTerm

  // Enhanced filtering logic
  const filteredItems = useMemo(() => {
    const filtered = wardrobeItems.filter((item) => {
      const matchesSearch =
        item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.tags?.some((tagAssoc: any) => tagAssoc.tag.name.toLowerCase().includes(searchTerm.toLowerCase()))

      const itemCategoryName = item.category?.name || item.category || 'uncategorized'
      const matchesCategory = filters.category === "all" || itemCategoryName === filters.category

      const matchesSeason =
        filters.season === "all" ||
        item.tags?.some((tagAssoc: any) => tagAssoc.tag.name.toLowerCase() === filters.season.toLowerCase())

      const matchesOccasion =
        filters.occasion === "all" ||
        item.tags?.some((tagAssoc: any) => tagAssoc.tag.name.toLowerCase() === filters.occasion.toLowerCase())

      const matchesColor =
        filters.color === "all" ||
        item.tags?.some((tagAssoc: any) => tagAssoc.tag.name.toLowerCase() === filters.color.toLowerCase())

      const matchesCondition = filters.condition === "all" || item.condition === filters.condition

      const matchesFavorites = !filters.favorites || item.is_favorite

      const matchesNeverWorn = !filters.neverWorn || item.wear_count === 0

      return (
        matchesSearch &&
        matchesCategory &&
        matchesSeason &&
        matchesOccasion &&
        matchesColor &&
        matchesCondition &&
        matchesFavorites &&
        matchesNeverWorn
      )
    })

    // Apply sorting
    switch (sortBy) {
      case "oldest":
        filtered.sort((a, b) => Number.parseInt(a.id) - Number.parseInt(b.id))
        break
      case "alphabetical":
        filtered.sort((a, b) => a.name.localeCompare(b.name))
        break
      case "mostWorn":
        filtered.sort((a, b) => b.wear_count - a.wear_count)
        break
      case "leastWorn":
        filtered.sort((a, b) => a.wear_count - b.wear_count)
        break
      case "favorites":
        filtered.sort((a, b) => (b.is_favorite ? 1 : 0) - (a.is_favorite ? 1 : 0))
        break
      default: // newest
        filtered.sort((a, b) => Number.parseInt(b.id) - Number.parseInt(a.id))
    }

    return filtered
  }, [wardrobeItems, searchTerm, filters, sortBy])

  const toggleFavorite = async (itemId: string, currentFavorite: boolean) => {
    if (!user) return

    try {
      await wardrobeService.updateWardrobeItem(itemId, { is_favorite: !currentFavorite })
      setWardrobeItems((prev) =>
        prev.map((item) => (item.id === itemId ? { ...item, is_favorite: !currentFavorite } : item)),
      )
    } catch (error) {
      console.error("Error updating favorite status:", error)
      alert("Failed to update favorite status")
    }
  }

  const deleteItem = async (itemId: string) => {
    if (!confirm("Are you sure you want to delete this item?")) return
    if (!user) return

    try {
      await wardrobeService.deleteWardrobeItem(itemId)
      setWardrobeItems((prev) => prev.filter((item) => item.id !== itemId))
    } catch (error) {
      console.error("Error deleting item:", error)
      alert("Failed to delete item")
    }
  }

  // Edit modal functions
  const openEditModal = async (item: WardrobeItem) => {
    setEditingItem(item)
    setEditFormData({
      name: item.name,
      description: item.description || "",
      brand: item.brand || "",
      color: item.color || "",
      size: item.size || "",
      price: item.price?.toString() || "",
      condition: item.condition,
      wearCount: item.wear_count?.toString() || "0",
      lastWorn: item.last_worn || "",
      selectedTags: item.tags?.map((t: any) => t.tag?.id || t.id) || [],
      newImage: null,
    })
    setImagePreview(item.image_url || null)
    
    // Load available tags
    try {
      const tags = await wardrobeService.getTags()
      setAvailableTags(tags || [])
    } catch (error) {
      console.error("Error loading tags:", error)
    }
    
    setEditModalOpen(true)
  }

  const closeEditModal = () => {
    setEditModalOpen(false)
    setEditingItem(null)
    setEditFormData({
      name: "",
      description: "",
      brand: "",
      color: "",
      size: "",
      price: "",
      condition: "good",
      wearCount: "0",
      lastWorn: "",
      selectedTags: [],
      newImage: null,
    })
    setImagePreview(null)
  }

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setEditFormData({ ...editFormData, newImage: file })
      const reader = new FileReader()
      reader.onload = (e) => {
        setImagePreview(e.target?.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const removeImage = () => {
    setEditFormData({ ...editFormData, newImage: null })
    setImagePreview(null)
  }

  const saveEditedItem = async () => {
    if (!editingItem || !user) return

    try {
      // Update basic item data
      const updateData = {
        name: editFormData.name,
        description: editFormData.description,
        brand: editFormData.brand,
        color: editFormData.color,
        size: editFormData.size,
        price: editFormData.price ? parseFloat(editFormData.price) : undefined,
        condition: editFormData.condition,
        wear_count: parseInt(editFormData.wearCount) || 0,
        last_worn: editFormData.lastWorn || undefined,
      }

      await wardrobeService.updateWardrobeItem(editingItem.id, updateData)

      // Handle image upload if new image is provided
      if (editFormData.newImage) {
        try {
          const imageResult = await wardrobeService.uploadImage(editFormData.newImage, user.id, editingItem.id)
          await wardrobeService.updateWardrobeItem(editingItem.id, {
            image_url: imageResult.url,
            image_path: imageResult.path
          })
        } catch (imageError) {
          console.error("Error uploading image:", imageError)
        }
      }

      // Update tags
      try {
        // Remove existing tags
        await wardrobeService.removeTagsFromItem(editingItem.id)
        // Add new tags
        if (editFormData.selectedTags.length > 0) {
          await wardrobeService.addTagsToItem(editingItem.id, editFormData.selectedTags)
        }
      } catch (tagError) {
        console.error("Error updating tags:", tagError)
      }

      // Reload wardrobe data
      await loadWardrobeData()
      closeEditModal()
      alert("Item updated successfully!")
    } catch (error) {
      console.error("Error updating item:", error)
      alert("Failed to update item")
    }
  }

  // Show loading while initializing
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-teal-400 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-400">Loading your wardrobe...</p>
        </div>
      </div>
    )
  }

  // Show login prompt if not authenticated
  if (!user) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="w-20 h-20 bg-teal-800 rounded-full flex items-center justify-center mx-auto mb-6">
            <Sparkles className="w-10 h-10 text-gray-400" />
          </div>
          <h3 className="text-xl font-semibold text-gray-100 mb-2">Please log in</h3>
          <p className="text-gray-500 mb-6">
            You need to be logged in to view your wardrobe
          </p>
          <Link href="/">
            <Button className="bg-teal-500 hover:bg-teal-600 text-white">
              Go to Home
            </Button>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-900">
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
                <h1 className="text-2xl font-bold text-white">My Wardrobe</h1>
              </div>
            </div>
            <div className="flex items-center gap-4">
              {user && (
                <>
                  <div className="text-sm text-gray-400">
                    Welcome, {user.email}
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
              <Link href="/add-clothes">
                <Button className="bg-teal-500 hover:bg-teal-600 text-white shadow-lg">
                  <Plus className="w-4 h-4 mr-2" />
                  Add New Item
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      <div className="container mx-auto px-6 py-8">


        {/* Statistics */}
        {Object.keys(stats).length > 0 && (
          <div className="mb-8">
            <div className="flex items-center gap-2 mb-6">
              <BarChart3 className="w-5 h-5 text-gray-400" />
              <h2 className="text-lg font-semibold text-gray-100">Wardrobe Statistics</h2>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              {Object.entries(stats).map(([category, count]) => (
                <Card
                  key={category}
                  className="border-0 shadow-lg bg-gray-800 border-gray-700 hover:shadow-xl transition-shadow"
                >
                  <CardContent className="p-6 text-center">
                    <div className="text-3xl font-bold bg-gradient-to-r from-teal-500 to-teal-600 bg-clip-text text-transparent">
                      {count}
                    </div>
                    <div className="text-sm text-gray-400 capitalize font-medium">{category}</div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Search and Filter */}
        {wardrobeItems.length > 0 && (
          <div className="mb-8">
            {/* Search Bar */}
            <div className="relative mb-6">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Search your wardrobe..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 border-gray-700 focus:border-teal-400 focus:ring-teal-400 bg-gray-800 text-white"
              />
            </div>

            {/* Advanced Filters */}
            <Card className="border-gray-700 bg-gray-800 mb-6">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                    <Filter className="w-5 h-5 text-teal-400" />
                    Advanced Filters
                  </h3>
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-gray-400">View:</span>
                      <Button
                        variant={viewMode === "grid" ? "default" : "outline"}
                        size="sm"
                        onClick={() => setViewMode("grid")}
                        className={viewMode === "grid" ? "bg-teal-500 text-white" : "border-gray-600 text-gray-400"}
                      >
                        <Grid3X3 className="w-4 h-4" />
                      </Button>
                      <Button
                        variant={viewMode === "list" ? "default" : "outline"}
                        size="sm"
                        onClick={() => setViewMode("list")}
                        className={viewMode === "list" ? "bg-teal-500 text-white" : "border-gray-600 text-gray-400"}
                      >
                        <List className="w-4 h-4" />
                      </Button>
                    </div>
                    <Select value={sortBy} onValueChange={setSortBy}>
                      <SelectTrigger className="w-40 bg-gray-700 border-gray-600 text-white">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-gray-800 border-gray-700">
                        {sortOptions.map((option) => (
                          <SelectItem key={option.value} value={option.value} className="text-white hover:bg-gray-700">
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-6 gap-4">
                  {/* Category Filter */}
                  <div>
                    <Label className="text-sm text-gray-300 mb-2 block">Category</Label>
                    <Select
                      value={filters.category}
                      onValueChange={(value) => setFilters({ ...filters, category: value })}
                    >
                      <SelectTrigger className="bg-gray-700 border-gray-600 text-white">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-gray-800 border-gray-700">
                        {categories.map((category) => (
                          <SelectItem
                            key={category}
                            value={category}
                            className="text-white hover:bg-gray-700 capitalize"
                          >
                            {category}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Season Filter */}
                  <div>
                    <Label className="text-sm text-gray-300 mb-2 block">Season</Label>
                    <Select value={filters.season} onValueChange={(value) => setFilters({ ...filters, season: value })}>
                      <SelectTrigger className="bg-gray-700 border-gray-600 text-white">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-gray-800 border-gray-700">
                        {seasons.map((season) => (
                          <SelectItem key={season} value={season} className="text-white hover:bg-gray-700 capitalize">
                            {season}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Occasion Filter */}
                  <div>
                    <Label className="text-sm text-gray-300 mb-2 block">Occasion</Label>
                    <Select
                      value={filters.occasion}
                      onValueChange={(value) => setFilters({ ...filters, occasion: value })}
                    >
                      <SelectTrigger className="bg-gray-700 border-gray-600 text-white">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-gray-800 border-gray-700">
                        {occasions.map((occasion) => (
                          <SelectItem
                            key={occasion}
                            value={occasion}
                            className="text-white hover:bg-gray-700 capitalize"
                          >
                            {occasion}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Color Filter */}
                  <div>
                    <Label className="text-sm text-gray-300 mb-2 block">Color</Label>
                    <Select value={filters.color} onValueChange={(value) => setFilters({ ...filters, color: value })}>
                      <SelectTrigger className="bg-gray-700 border-gray-600 text-white">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-gray-800 border-gray-700">
                        {colors.map((color) => (
                          <SelectItem key={color} value={color} className="text-white hover:bg-gray-700 capitalize">
                            <div className="flex items-center gap-2">
                              {color !== "all" && (
                                <div
                                  className="w-3 h-3 rounded-full border border-gray-500"
                                  style={{ backgroundColor: color === "gray" ? "#6B7280" : color }}
                                />
                              )}
                              {color}
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Condition Filter */}
                  <div>
                    <Label className="text-sm text-gray-300 mb-2 block">Condition</Label>
                    <Select
                      value={filters.condition}
                      onValueChange={(value) => setFilters({ ...filters, condition: value })}
                    >
                      <SelectTrigger className="bg-gray-700 border-gray-600 text-white">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-gray-800 border-gray-700">
                        {conditions.map((condition) => (
                          <SelectItem
                            key={condition}
                            value={condition}
                            className="text-white hover:bg-gray-700 capitalize"
                          >
                            {condition}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Special Filters */}
                  <div className="space-y-3">
                    <Label className="text-sm text-gray-300 block">Special</Label>
                    <div className="space-y-2">
                      <label className="flex items-center space-x-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={filters.favorites}
                          onChange={(e) => setFilters({ ...filters, favorites: e.target.checked })}
                          className="rounded border-gray-500 text-teal-500 focus:ring-teal-400 bg-gray-700"
                        />
                        <span className="text-sm text-gray-300">Favorites Only</span>
                      </label>
                      <label className="flex items-center space-x-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={filters.neverWorn}
                          onChange={(e) => setFilters({ ...filters, neverWorn: e.target.checked })}
                          className="rounded border-gray-500 text-teal-500 focus:ring-teal-400 bg-gray-700"
                        />
                        <span className="text-sm text-gray-300">Never Worn</span>
                      </label>
                    </div>
                  </div>
                </div>

                {/* Active Filters Display */}
                {(Object.values(filters).some((f) => f !== "all" && f !== false) || sortBy !== "newest") && (
                  <div className="mt-4 pt-4 border-t border-gray-700">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-sm text-gray-400">Active filters:</span>
                      {Object.entries(filters).map(([key, value]) => {
                        if (value === "all" || value === false) return null
                        return (
                          <Badge key={key} variant="secondary" className="bg-teal-800 text-teal-200">
                            {key}: {value === true ? "yes" : value}
                            <button
                              onClick={() =>
                                setFilters({
                                  ...filters,
                                  [key]: key === "favorites" || key === "neverWorn" ? false : "all",
                                })
                              }
                              className="ml-1 hover:text-white"
                            >
                              ×
                            </button>
                          </Badge>
                        )
                      })}
                      {sortBy !== "newest" && (
                        <Badge variant="secondary" className="bg-purple-800 text-purple-200">
                          Sort: {sortOptions.find((s) => s.value === sortBy)?.label}
                        </Badge>
                      )}
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setFilters({
                            category: "all",
                            season: "all",
                            occasion: "all",
                            color: "all",
                            condition: "all",
                            favorites: false,
                            neverWorn: false,
                          })
                          setSortBy("newest")
                        }}
                        className="text-gray-400 hover:text-white text-xs"
                      >
                        Clear All
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Results Summary */}
            <div className="flex items-center justify-between mb-6">
              <div className="text-sm text-gray-400">
                Showing {filteredItems.length} of {wardrobeItems.length} items
                {filteredItems.length !== wardrobeItems.length && (
                  <span className="text-teal-400 ml-1">
                    ({wardrobeItems.length - filteredItems.length} filtered out)
                  </span>
                )}
              </div>
              <div className="flex items-center gap-4 text-sm text-gray-400">
                <span>Total Value: ${wardrobeItems.reduce((sum, item) => sum + (item.price || 0), 0).toFixed(2)}</span>
                <span>
                  Avg. Wear Count:{" "}
                  {(wardrobeItems.reduce((sum, item) => sum + item.wear_count, 0) / wardrobeItems.length).toFixed(1)}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Wardrobe Grid */}
        {wardrobeItems.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
            {filteredItems.map((item) => (
              <Card
                key={item.id}
                className="overflow-hidden hover:shadow-xl transition-all duration-300 border-0 shadow-lg bg-gray-800 border-gray-700 group"
              >
                <div className="aspect-[3/4] relative overflow-hidden">
                  {item.image_url ? (
                    <img
                      src={item.image_url}
                      alt={item.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.style.display = 'none';
                        target.nextElementSibling?.classList.remove('hidden');
                      }}
                    />
                  ) : null}
                  <div className={`w-full h-full flex items-center justify-center bg-gray-700 ${item.image_url ? 'hidden' : ''}`}>
                    <div className="text-center">
                      <Sparkles className="w-12 h-12 text-gray-500 mx-auto mb-2" />
                      <p className="text-xs text-gray-500">No Image</p>
                    </div>
                  </div>
                  <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                  {/* Action buttons */}
                  <div className="absolute top-2 right-2 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button
                      size="sm"
                      variant="secondary"
                      className="w-8 h-8 p-0 bg-blue-500/90 hover:bg-blue-600"
                      onClick={() => openEditModal(item)}
                    >
                      <Edit className="w-4 h-4 text-white" />
                    </Button>
                    <Button
                      size="sm"
                      variant="secondary"
                      className="w-8 h-8 p-0 bg-white/90 hover:bg-white"
                      onClick={() => toggleFavorite(item.id, item.is_favorite)}
                    >
                      <Heart
                        className={`w-4 h-4 ${item.is_favorite ? "fill-red-500 text-red-500" : "text-gray-600"}`}
                      />
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      className="w-8 h-8 p-0 bg-red-500/90 hover:bg-red-600"
                      onClick={() => deleteItem(item.id)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
                <CardContent className="p-4">
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="font-semibold text-sm text-gray-100 flex-1">{item.name}</h3>
                    {item.is_favorite && <Heart className="w-4 h-4 fill-red-500 text-red-500 ml-2" />}
                  </div>

                  {item.brand && <p className="text-xs text-gray-500 mb-1">{item.brand}</p>}

                  <p className="text-xs text-gray-400 mb-3 line-clamp-2">{item.description}</p>

                  <div className="flex flex-wrap gap-1 mb-2">
                    {item.tags?.map((tagAssoc: any) => (
                      <Badge
                        key={tagAssoc.tag?.id || tagAssoc.id}
                        variant="secondary"
                        className="text-xs bg-teal-800 text-gray-300 border-0"
                        style={{
                          backgroundColor: `${tagAssoc.tag?.color || tagAssoc.color}20`,
                          color: tagAssoc.tag?.color || tagAssoc.color,
                        }}
                      >
                        {tagAssoc.tag?.name || tagAssoc.name}
                      </Badge>
                    ))}
                  </div>

                  <div className="flex justify-between items-center text-xs text-gray-500">
                    <span className="capitalize">{item.condition}</span>
                    {item.wear_count > 0 && <span>Worn {item.wear_count} times</span>}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Empty State */}
        {wardrobeItems.length === 0 && (
          <div className="text-center py-20">
            <div className="w-20 h-20 bg-teal-800 rounded-full flex items-center justify-center mx-auto mb-6">
              <Sparkles className="w-10 h-10 text-gray-400" />
            </div>
            <h3 className="text-xl font-semibold text-gray-100 mb-2">Your wardrobe is empty</h3>
            <p className="text-gray-500 mb-6">
              Start building your digital wardrobe by adding your first item to get personalized outfit recommendations
            </p>
            <Link href="/add-clothes">
              <Button className="bg-teal-500 hover:bg-teal-600 text-white">
                <Plus className="w-4 h-4 mr-2" />
                Add Your First Item
              </Button>
            </Link>
          </div>
        )}

        {/* No Search Results */}
        {wardrobeItems.length > 0 && filteredItems.length === 0 && (
          <div className="text-center py-20">
            <div className="w-20 h-20 bg-teal-800 rounded-full flex items-center justify-center mx-auto mb-6">
              <Search className="w-10 h-10 text-gray-400" />
            </div>
            <h3 className="text-xl font-semibold text-gray-100 mb-2">No items found</h3>
            <p className="text-gray-500 mb-6">Try adjusting your search or filter criteria</p>
            <Button
              onClick={() => {
                setSearchTerm("")
                setFilters({
                  category: "all",
                  season: "all",
                  occasion: "all",
                  color: "all",
                  condition: "all",
                  favorites: false,
                  neverWorn: false,
                })
                setSortBy("newest")
              }}
              variant="outline"
              className="border-gray-600 hover:bg-gray-700 bg-transparent text-white"
            >
              Clear Filters
            </Button>
          </div>
        )}
      </div>

      {/* Edit Modal */}
      <EditWardrobeModal
        isOpen={editModalOpen}
        onClose={closeEditModal}
        onSave={saveEditedItem}
        editFormData={editFormData}
        setEditFormData={setEditFormData}
        availableTags={availableTags}
        imagePreview={imagePreview}
        onImageChange={handleImageChange}
        onRemoveImage={removeImage}
      />
    </div>
  )
}

export default function WardrobePage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-gray-900 flex items-center justify-center">
          <div className="text-center">
            <div className="w-8 h-8 border-2 border-teal-400 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-400">Loading wardrobe...</p>
          </div>
        </div>
      }
    >
      <WardrobeContent />
    </Suspense>
  )
}

