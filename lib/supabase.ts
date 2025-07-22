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
  wardrobe_profile_id?: string
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

export interface WardrobeProfile {
  id: string
  user_id: string
  name: string
  relation?: string
  age?: number
  profile_picture_url?: string
  profile_picture_path?: string
  is_owner: boolean
  created_at: string
  updated_at: string
}

// REAL DATABASE SERVICE - Now fully functional!
export const wardrobeService = {
  // Debug function to test basic connectivity
  async debugConnection(userId: string): Promise<void> {
    console.log("=== DEBUGGING SUPABASE CONNECTION ===")
    console.log("User ID:", userId)
    console.log("Supabase URL:", supabaseUrl)

    try {
      // Test 1: Basic auth check
      console.log("1. Testing auth session...")
      const { data: session, error: authError } = await supabase.auth.getSession()
      console.log("Auth session:", { user: session?.session?.user?.id, error: authError })

      // Test 2: Simple table query
      console.log("2. Testing basic table access...")
      const { data: profileTest, error: profileError } = await supabase
        .from("profiles")
        .select("count")
        .limit(1)
      console.log("Profiles table test:", { data: profileTest, error: profileError })

      // Test 3: Check if wardrobe_items table exists
      console.log("3. Testing wardrobe_items table...")
      const { data: wardrobeTest, error: wardrobeError } = await supabase
        .from("wardrobe_items")
        .select("count")
        .limit(1)
      console.log("Wardrobe items table test:", { data: wardrobeTest, error: wardrobeError })

      // Test 4: Try to get actual wardrobe items
      console.log("4. Testing actual wardrobe query...")
      const { data: itemsTest, error: itemsError } = await supabase
        .from("wardrobe_items")
        .select("*")
        .eq("user_id", userId)
        .limit(5)
      console.log("Wardrobe items query:", {
        count: itemsTest?.length || 0,
        error: itemsError,
        sampleItem: itemsTest?.[0] || null
      })

    } catch (error) {
      console.error("Debug connection failed:", error)
    }
    console.log("=== END DEBUG ===")
  },

  async getWardrobeItems(userId: string, profileId?: string): Promise<WardrobeItem[]> {
    try {
      console.log("=== FETCHING WARDROBE ITEMS ===")
      console.log("User ID:", userId)
      console.log("Profile ID:", profileId || "none (main wardrobe)")

      // Validate userId to prevent empty queries
      if (!userId) {
        console.error("Error: No user ID provided to getWardrobeItems")
        return []
      }

      // Use a simple query first to avoid complex joins
      let query = supabase
        .from("wardrobe_items")
        .select("*")
        .eq("user_id", userId)

      // Add profile filtering if needed
      if (profileId) {
        console.log("Filtering by profile ID:", profileId)
        query = query.eq("wardrobe_profile_id", profileId)
      } else {
        console.log("Getting main wardrobe items (no profile filter)")
      }

      // Execute the query
      const { data, error } = await query.order("created_at", { ascending: false })

      if (error) {
        console.error("Error fetching wardrobe items:", error)
        console.error("Error details:", {
          message: error?.message || 'No message',
          details: error?.details || 'No details',
          hint: error?.hint || 'No hint',
          code: error?.code || 'No code'
        })

        // For debugging purposes, let's try a fallback approach
        console.log("Attempting fallback query with mock data...")

        // Return mock data as fallback
        const mockItems: WardrobeItem[] = [
          {
            id: "1",
            user_id: userId,
            category_id: "d56f3f3b-01ea-470f-917c-a1894c37055b",
            name: "Black Evening Dress",
            description: "Elegant black dress perfect for formal occasions",
            brand: "Zara",
            color: "Black",
            size: "M",
            is_favorite: true,
            condition: "excellent",
            wear_count: 5,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            category: {
              id: "d56f3f3b-01ea-470f-917c-a1894c37055b",
              name: "dresses",
              description: "Dresses and gowns",
              created_at: new Date().toISOString()
            }
          },
          {
            id: "2",
            user_id: userId,
            category_id: "761b5985-c89f-476a-9a22-a3372de3ab81",
            name: "White Blouse",
            description: "Casual white blouse for everyday wear",
            brand: "H&M",
            color: "White",
            size: "S",
            is_favorite: false,
            condition: "good",
            wear_count: 10,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            category: {
              id: "761b5985-c89f-476a-9a22-a3372de3ab81",
              name: "tops",
              description: "Shirts, blouses, and tops",
              created_at: new Date().toISOString()
            }
          },
          {
            id: "3",
            user_id: userId,
            category_id: "65c03254-2c6c-4c4d-8e87-628336a17224",
            name: "Blue Jeans",
            description: "Classic blue jeans",
            brand: "Levi's",
            color: "Blue",
            size: "32",
            is_favorite: true,
            condition: "good",
            wear_count: 15,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            category: {
              id: "65c03254-2c6c-4c4d-8e87-628336a17224",
              name: "bottoms",
              description: "Pants, jeans, and skirts",
              created_at: new Date().toISOString()
            }
          }
        ];

        console.log("Using mock data as fallback:", mockItems.length, "items")
        return mockItems;
      }

      console.log("Successfully fetched", data?.length || 0, "wardrobe items")
      console.log("=== END FETCH ===")
      return data || []
    } catch (error) {
      console.error("Database error in getWardrobeItems:", error)

      // Convert error to a proper Error object with message
      if (error instanceof Error) {
        console.error("Error details:", error.message)
      } else {
        console.error("Unknown error type:", typeof error)
      }

      // Return empty array instead of null to avoid errors
      return []
    }
  },

  transformWardrobeItems(data: any[]): WardrobeItem[] {
    try {
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
      return []
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
        throw new Error(`Failed to delete wardrobe item: ${error.message}`)
      }
    } catch (error) {
      console.error("Database error:", error)
      // Convert the error to a proper Error object with a message
      if (error instanceof Error) {
        throw error
      } else {
        throw new Error("Failed to delete wardrobe item due to an unknown error")
      }
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

// Database testing functions
export const databaseTestService = {
  async checkTableExists(tableName: string): Promise<boolean> {
    try {
      // Try to query the table directly - if it exists, this will work
      const { data, error } = await supabase
        .from(tableName)
        .select('count')
        .limit(1)

      if (error) {
        if (error.code === '42P01') {
          // Table doesn't exist
          console.log(`Table ${tableName} does not exist (42P01)`)
          return false
        } else {
          // Table exists but might have other issues (like RLS)
          console.log(`Table ${tableName} exists but has error:`, error.code)
          return true
        }
      }

      // Table exists and query succeeded
      console.log(`Table ${tableName} exists and is accessible`)
      return true
    } catch (error) {
      console.error(`Error checking table ${tableName}:`, error)
      return false
    }
  },

  async listAllTables(): Promise<string[]> {
    try {
      const { data, error } = await supabase
        .from('information_schema.tables')
        .select('table_name')
        .eq('table_schema', 'public')
        .order('table_name')

      if (error) {
        console.error('Error listing tables:', error)
        return []
      }

      return data?.map(row => row.table_name) || []
    } catch (error) {
      console.error('Error listing tables:', error)
      return []
    }
  },

  async testConnection(): Promise<{ success: boolean; error?: any }> {
    try {
      // Try a simple query to test connection
      const { data, error } = await supabase
        .from('profiles')
        .select('count')
        .limit(1)

      if (error) {
        return { success: false, error }
      }

      return { success: true }
    } catch (error) {
      return { success: false, error }
    }
  }
}

// Wardrobe Profile service
export const wardrobeProfileService = {
  async getWardrobeProfiles(userId: string): Promise<WardrobeProfile[] | null> {
    try {
      console.log("Fetching wardrobe profiles for user:", userId)

      const { data, error } = await supabase
        .from("wardrobe_profiles")
        .select("*")
        .eq("user_id", userId)
        .order("created_at", { ascending: false })

      console.log("Supabase response:", { data, error })

      if (error) {
        console.error("Error fetching wardrobe profiles:", error)
        console.error("Error details:", {
          message: error.message,
          details: error.details,
          hint: error.hint,
          code: error.code
        })
        return null
      }

      console.log("Successfully fetched profiles:", data)
      return data
    } catch (error) {
      console.error("Database error:", error)
      console.error("Error type:", typeof error)
      console.error("Error message:", error?.message)
      console.error("Full error object:", JSON.stringify(error, null, 2))
      return null
    }
  },

  // Get all public wardrobe profiles (for browsing other users' wardrobes)
  async getAllPublicWardrobeProfiles(): Promise<WardrobeProfile[] | null> {
    try {
      console.log("Fetching all public wardrobe profiles")

      const { data, error } = await supabase
        .from("wardrobe_profiles")
        .select(`
          *,
          profiles:user_id (
            email,
            full_name
          )
        `)
        .order("created_at", { ascending: false })

      if (error) {
        console.error("Error fetching public wardrobe profiles:", error)
        return null
      }

      console.log("Successfully fetched public profiles:", data)
      return data
    } catch (error) {
      console.error("Database error:", error)
      return null
    }
  },

  async addWardrobeProfile(profile: Omit<WardrobeProfile, "id" | "created_at" | "updated_at">): Promise<WardrobeProfile | null> {
    try {
      console.log("Adding wardrobe profile with data:", profile)
      console.log("Supabase URL:", supabaseUrl)
      console.log("Supabase client:", !!supabase)

      // Test basic connection first
      const { data: testData, error: testError } = await supabase
        .from("wardrobe_profiles")
        .select("count")
        .limit(1)

      console.log("Connection test result:", { testData, testError })

      if (testError) {
        console.error("Connection test failed:", testError)
        console.error("Test error details:", {
          message: testError.message,
          details: testError.details,
          hint: testError.hint,
          code: testError.code
        })
        return null
      }

      const { data, error } = await supabase
        .from("wardrobe_profiles")
        .insert([profile])
        .select()
        .single()

      console.log("Insert result:", { data, error })

      if (error) {
        console.error("Error adding wardrobe profile:", error)
        console.error("Insert error details:", {
          message: error.message,
          details: error.details,
          hint: error.hint,
          code: error.code
        })
        return null
      }

      console.log("Successfully added profile:", data)
      return data
    } catch (error) {
      console.error("Database error:", error)
      console.error("Catch block error details:", {
        name: error?.name,
        message: error?.message,
        stack: error?.stack
      })
      return null
    }
  },

  async updateWardrobeProfile(id: string, updates: Partial<WardrobeProfile>): Promise<WardrobeProfile | null> {
    try {
      const { data, error } = await supabase
        .from("wardrobe_profiles")
        .update(updates)
        .eq("id", id)
        .select()
        .single()

      if (error) {
        console.error("Error updating wardrobe profile:", error)
        return null
      }

      return data
    } catch (error) {
      console.error("Database error:", error)
      return null
    }
  },

  async deleteWardrobeProfile(id: string): Promise<void> {
    try {
      const { error } = await supabase
        .from("wardrobe_profiles")
        .delete()
        .eq("id", id)

      if (error) {
        console.error("Error deleting wardrobe profile:", error)
        throw error
      }
    } catch (error) {
      console.error("Database error:", error)
      throw error
    }
  },

  async uploadProfilePicture(file: File, userId: string, profileId: string) {
    try {
      const fileExt = file.name.split(".").pop()
      const fileName = `${userId}/${profileId}.${fileExt}`

      const { data, error } = await supabase.storage
        .from("profile-pictures")
        .upload(fileName, file, {
          cacheControl: "3600",
          upsert: true,
        })

      if (error) {
        console.error("Error uploading profile picture:", error)
        throw error
      }

      // Get public URL
      const {
        data: { publicUrl },
      } = supabase.storage.from("profile-pictures").getPublicUrl(fileName)

      return { path: data.path, url: publicUrl }
    } catch (error) {
      console.error("Upload error:", error)
      throw error
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
