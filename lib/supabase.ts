import { createClient } from "@supabase/supabase-js"

const supabaseUrl = "https://xypmyqpkmnjbdbsfrgco.supabase.co"
const supabaseAnonKey =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inh5cG15cXBrbW5qYmRic2ZyZ2NvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTI1ODkwMDUsImV4cCI6MjA2ODE2NTAwNX0.qs9IcBdpdzypjEulWtkSscr_mcPtXaDaR2WNXj5HRGE"

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  }
})

// Simple connection check function
export const checkSupabaseConnection = async (): Promise<boolean> => {
  try {
    const { data, error } = await supabase.from("profiles").select("count").limit(1)
    return !error
  } catch (error) {
    console.warn("Supabase connection failed:", error)
    return false
  }
}

// Test authentication connection
export const testAuthConnection = async (): Promise<{ success: boolean; error?: string }> => {
  try {
    // Test basic connection first
    const { data, error } = await supabase.auth.getSession()
    if (error) {
      return { success: false, error: error.message }
    }
    return { success: true }
  } catch (err) {
    console.error('Auth connection test failed:', err)
    return { success: false, error: 'Network connection failed' }
  }
}

// Types for our database
export interface Profile {
  id: string
  email?: string
  full_name?: string
  avatar_url?: string
  created_at: string
  updated_at: string
}

export interface Category {
  id: string
  name: string
  description?: string
  icon?: string
  created_at: string
}

export interface Tag {
  id: string
  name: string
  color: string
  created_at: string
}

export interface WardrobeItem {
  id: string
  user_id: string
  category_id: string
  name: string
  description?: string
  brand?: string
  color?: string
  size?: string
  price?: number
  purchase_date?: string
  image_url?: string
  image_path?: string
  is_favorite: boolean
  condition: "new" | "excellent" | "good" | "fair" | "poor"
  last_worn?: string
  wear_count: number
  created_at: string
  updated_at: string
  category?: Category
  tags?: Tag[]
}

export interface Outfit {
  id: string
  user_id: string
  name: string
  description?: string
  occasion?: string
  weather_condition?: string
  temperature_range?: string
  season?: string
  is_favorite: boolean
  worn_date?: string
  image_url?: string
  created_at: string
  updated_at: string
  items?: WardrobeItem[]
}

export interface OutfitRecommendation {
  id: string
  user_id: string
  occasion?: string
  weather_data?: any
  location?: string
  ai_response?: string
  recommended_items?: string[]
  similar_items?: any[]
  is_saved: boolean
  created_at: string
}

// REAL DATABASE SERVICE - Now fully functional!
export const wardrobeService = {
  async getWardrobeItems(userId: string): Promise<WardrobeItem[] | null> {
    try {
      const { data, error } = await supabase
        .from("wardrobe_items")
        .select(`
          *,
          category:categories(*),
          wardrobe_item_tags(
            tag:tags(*)
          )
        `)
        .eq("user_id", userId)
        .order("created_at", { ascending: false })

      if (error) {
        console.error("Error fetching wardrobe items:", error)
        return null
      }

      // Transform the data to match our expected format
      return (
        data?.map((item) => ({
          ...item,
          tags:
            item.wardrobe_item_tags?.map((tagAssoc: any) => ({
              tag_id: tagAssoc.tag.id,
              wardrobe_item_id: item.id,
              tag: tagAssoc.tag,
            })) || [],
        })) || []
      )
    } catch (error) {
      console.error("Database error:", error)
      return null
    }
  },

  async addWardrobeItem(item: Omit<WardrobeItem, "id" | "created_at" | "updated_at">): Promise<WardrobeItem | null> {
    try {
      // First, ensure the user profile exists
      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("id")
        .eq("id", item.user_id)
        .single()

      if (profileError && profileError.code === 'PGRST116') {
        // Profile doesn't exist, create it
        const { data: user } = await supabase.auth.getUser()
        if (user.user) {
          await supabase.from("profiles").insert([{
            id: item.user_id,
            email: user.user.email,
            full_name: user.user.user_metadata?.full_name || null
          }])
        }
      }

      const { data, error } = await supabase.from("wardrobe_items").insert([item]).select().single()

      if (error) {
        console.error("Error adding wardrobe item:", error)
        console.error("Error details:", {
          message: error.message,
          details: error.details,
          hint: error.hint,
          code: error.code
        })
        return null
      }

      return data
    } catch (error) {
      console.error("Database error:", error)
      return null
    }
  },

  async updateWardrobeItem(id: string, updates: Partial<WardrobeItem>): Promise<WardrobeItem | null> {
    try {
      const { data, error } = await supabase.from("wardrobe_items").update(updates).eq("id", id).select().single()

      if (error) {
        console.error("Error updating wardrobe item:", error)
        return null
      }

      return data
    } catch (error) {
      console.error("Database error:", error)
      return null
    }
  },

  async deleteWardrobeItem(id: string): Promise<void> {
    try {
      const { error } = await supabase.from("wardrobe_items").delete().eq("id", id)

      if (error) {
        console.error("Error deleting wardrobe item:", error)
        throw error
      }
    } catch (error) {
      console.error("Database error:", error)
      throw error
    }
  },

  async uploadImage(file: File, userId: string, itemId: string) {
    try {
      const fileExt = file.name.split(".").pop()
      const fileName = `${userId}/${itemId}.${fileExt}`

      const { data, error } = await supabase.storage.from("wardrobe-images").upload(fileName, file, {
        cacheControl: "3600",
        upsert: true,
      })

      if (error) {
        console.error("Error uploading image:", error)
        throw error
      }

      // Get public URL
      const {
        data: { publicUrl },
      } = supabase.storage.from("wardrobe-images").getPublicUrl(fileName)

      return { path: data.path, url: publicUrl }
    } catch (error) {
      console.error("Upload error:", error)
      throw error
    }
  },

  async getCategories(): Promise<Category[] | null> {
    try {
      const { data, error } = await supabase.from("categories").select("*").order("name")

      if (error) {
        console.error("Error fetching categories:", error)
        return null
      }

      return data
    } catch (error) {
      console.error("Database error:", error)
      return null
    }
  },

  async getTags(): Promise<Tag[] | null> {
    try {
      const { data, error } = await supabase.from("tags").select("*").order("name")

      if (error) {
        console.error("Error fetching tags:", error)
        return null
      }

      return data
    } catch (error) {
      console.error("Database error:", error)
      return null
    }
  },

  async addTagsToItem(itemId: string, tagIds: string[]): Promise<void> {
    try {
      const tagAssociations = tagIds.map((tagId) => ({
        wardrobe_item_id: itemId,
        tag_id: tagId,
      }))

      const { error } = await supabase.from("wardrobe_item_tags").insert(tagAssociations)

      if (error) {
        console.error("Error adding tags to item:", error)
        throw error
      }
    } catch (error) {
      console.error("Database error:", error)
      throw error
    }
  },

  async removeTagsFromItem(itemId: string, tagIds?: string[]): Promise<void> {
    try {
      let query = supabase.from("wardrobe_item_tags").delete().eq("wardrobe_item_id", itemId)

      if (tagIds && tagIds.length > 0) {
        query = query.in("tag_id", tagIds)
      }

      const { error } = await query

      if (error) {
        console.error("Error removing tags from item:", error)
        throw error
      }
    } catch (error) {
      console.error("Database error:", error)
      throw error
    }
  },

  async getWardrobeStats(userId: string): Promise<Record<string, number>> {
    try {
      const { data, error } = await supabase
        .from("wardrobe_items")
        .select("category:categories(name)")
        .eq("user_id", userId)

      if (error) {
        console.error("Error fetching wardrobe stats:", error)
        return {}
      }

      const stats: Record<string, number> = {}
      data?.forEach((item) => {
        const categoryName = item.category?.name || "uncategorized"
        stats[categoryName] = (stats[categoryName] || 0) + 1
      })

      return stats
    } catch (error) {
      console.error("Database error:", error)
      return {}
    }
  },
}

// Outfit service
export const outfitService = {
  async saveRecommendation(
    recommendation: Omit<OutfitRecommendation, "id" | "created_at">,
  ): Promise<OutfitRecommendation | null> {
    try {
      const { data, error } = await supabase.from("outfit_recommendations").insert([recommendation]).select().single()

      if (error) {
        console.error("Error saving recommendation:", error)
        return null
      }

      return data
    } catch (error) {
      console.error("Database error:", error)
      return null
    }
  },

  async getRecommendations(userId: string): Promise<OutfitRecommendation[] | null> {
    try {
      const { data, error } = await supabase
        .from("outfit_recommendations")
        .select("*")
        .eq("user_id", userId)
        .order("created_at", { ascending: false })

      if (error) {
        console.error("Error fetching recommendations:", error)
        return null
      }

      return data
    } catch (error) {
      console.error("Database error:", error)
      return null
    }
  },
}
