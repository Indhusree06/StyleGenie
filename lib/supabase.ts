import { createClient } from "@supabase/supabase-js"

const supabaseUrl = "https://xypmyqpkmnjbdbsfrgco.supabase.co"
const supabaseAnonKey =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inh5cG15cXBrbW5qYmRic2ZyZ2NvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTI1ODkwMDUsImV4cCI6MjA2ODE2NTAwNX0.qs9IcBdpdzypjEulWtkSscr_mcPtXaDaR2WNXj5HRGE"

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
  },
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
    console.error("Auth connection test failed:", err)
    return { success: false, error: "Network connection failed" }
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
  date_of_birth?: string
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
      const { data: profileTest, error: profileError } = await supabase.from("profiles").select("count").limit(1)
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
        sampleItem: itemsTest?.[0] || null,
      })
    } catch (error) {
      console.error("Debug connection failed:", error)
    }
    console.log("=== END DEBUG ===")
  },

  // Check if wardrobe_profile_id column exists
  async checkProfileColumnExists(): Promise<boolean> {
    try {
      const { data, error } = await supabase.from("wardrobe_items").select("wardrobe_profile_id").limit(1)
      return !error
    } catch (error) {
      console.log("wardrobe_profile_id column doesn't exist yet:", error)
      return false
    }
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

      // Check if the wardrobe_profile_id column exists
      const profileColumnExists = await this.checkProfileColumnExists()
      console.log("Profile column exists:", profileColumnExists)

      // Build the query based on column availability
      let query = supabase
        .from("wardrobe_items")
        .select(`
      *,
      category:categories(*),
      tags:wardrobe_item_tags(
        tag:tags(*)
      )
    `)
        .eq("user_id", userId)

      if (profileColumnExists && profileId) {
        // For profile-specific wardrobes, filter by wardrobe_profile_id
        console.log("Filtering by profile ID:", profileId)
        query = query.eq("wardrobe_profile_id", profileId)
      } else if (profileColumnExists && !profileId) {
        // For main wardrobe, get items that don't belong to any profile
        console.log("Getting main wardrobe items (no profile association)")
        query = query.is("wardrobe_profile_id", null)
      } else if (!profileColumnExists) {
        // Column doesn't exist yet - handle gracefully
        if (profileId) {
          console.log("Profile column doesn't exist yet, returning empty array for profile-specific request")
          return []
        } else {
          console.log("Profile column doesn't exist yet, returning all user items for main wardrobe")
          // Return all items for the user (legacy behavior)
        }
      }

      // Execute the query
      const { data, error } = await query.order("created_at", { ascending: false })

      if (error) {
        console.error("Error fetching wardrobe items:", error)
        console.error("Error details:", {
          message: error?.message || "No message",
          details: error?.details || "No details",
          hint: error?.hint || "No hint",
          code: error?.code || "No code",
        })

        // Return empty array for now - in production, you might want to handle this differently
        console.log("Returning empty array due to database error")
        return []
      }

      console.log(
        "Successfully fetched",
        data?.length || 0,
        "wardrobe items for",
        profileId ? `profile ${profileId}` : "main wardrobe",
      )
      console.log("=== END FETCH ===")
      return this.transformWardrobeItems(data || [])
    } catch (error) {
      console.error("Database error in getWardrobeItems:", error)
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

      if (profileError && profileError.code === "PGRST116") {
        // Profile doesn't exist, create it
        const { data: user } = await supabase.auth.getUser()
        if (user.user) {
          await supabase.from("profiles").insert([
            {
              id: item.user_id,
              email: user.user.email,
              full_name: user.user.user_metadata?.full_name || null,
            },
          ])
        }
      }

      // Check if the wardrobe_profile_id column exists
      const profileColumnExists = await this.checkProfileColumnExists()

      let itemData: any
      if (profileColumnExists) {
        // Include wardrobe_profile_id in the item data
        itemData = {
          ...item,
          wardrobe_profile_id: item.wardrobe_profile_id || null, // Explicitly set to null for main wardrobe
        }
      } else {
        // Remove wardrobe_profile_id from item if column doesn't exist
        const { wardrobe_profile_id, ...itemWithoutProfileId } = item
        itemData = itemWithoutProfileId
      }

      const { data, error } = await supabase.from("wardrobe_items").insert([itemData]).select().single()

      if (error) {
        console.error("Error adding wardrobe item:", error)
        console.error("Error details:", {
          message: error.message,
          details: error.details,
          hint: error.hint,
          code: error.code,
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
      // Check if the wardrobe_profile_id column exists
      const profileColumnExists = await this.checkProfileColumnExists()

      let updateData: any
      if (profileColumnExists) {
        updateData = updates
      } else {
        // Remove wardrobe_profile_id from updates if column doesn't exist
        const { wardrobe_profile_id, ...updatesWithoutProfileId } = updates
        updateData = updatesWithoutProfileId
      }

      const { data, error } = await supabase.from("wardrobe_items").update(updateData).eq("id", id).select().single()

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
      const { data, error } = await supabase.from(tableName).select("count").limit(1)

      if (error) {
        if (error.code === "42P01") {
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
        .from("information_schema.tables")
        .select("table_name")
        .eq("table_schema", "public")
        .order("table_name")

      if (error) {
        console.error("Error listing tables:", error)
        return []
      }

      return data?.map((row) => row.table_name) || []
    } catch (error) {
      console.error("Error listing tables:", error)
      return []
    }
  },

  async testConnection(): Promise<{ success: boolean; error?: any }> {
    try {
      // Try a simple query to test connection
      const { data, error } = await supabase.from("profiles").select("count").limit(1)

      if (error) {
        return { success: false, error }
      }

      return { success: true }
    } catch (error) {
      return { success: false, error }
    }
  },
}

// Wardrobe Profile service
export const wardrobeProfileService = {
  // Check if date_of_birth column exists
  async checkDobColumnExists(): Promise<boolean> {
    try {
      const { data, error } = await supabase.from("wardrobe_profiles").select("date_of_birth").limit(1)

      return !error
    } catch (error) {
      console.log("DOB column doesn't exist yet:", error)
      return false
    }
  },

  async getWardrobeProfiles(userId: string): Promise<WardrobeProfile[] | null> {
    try {
      console.log("Fetching wardrobe profiles for user:", userId)

      // Check if DOB column exists
      const dobExists = await this.checkDobColumnExists()
      console.log("DOB column exists:", dobExists)

      // Build select query based on column availability
      const selectFields = dobExists
        ? "id, user_id, name, relation, age, date_of_birth, profile_picture_url, profile_picture_path, is_owner, created_at, updated_at"
        : "id, user_id, name, relation, age, profile_picture_url, profile_picture_path, is_owner, created_at, updated_at"

      const { data, error } = await supabase
        .from("wardrobe_profiles")
        .select(selectFields)
        .eq("user_id", userId)
        .order("created_at", { ascending: false })

      console.log("Supabase response:", { data, error })

      if (error) {
        console.error("Error fetching wardrobe profiles:", error)
        console.error("Error details:", {
          message: error.message,
          details: error.details,
          hint: error.hint,
          code: error.code,
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

      // Check if DOB column exists
      const dobExists = await this.checkDobColumnExists()

      const selectFields = dobExists
        ? `id, user_id, name, relation, age, date_of_birth, profile_picture_url, profile_picture_path, is_owner, created_at, updated_at,
           profiles:user_id (
             email,
             full_name
           )`
        : `id, user_id, name, relation, age, profile_picture_url, profile_picture_path, is_owner, created_at, updated_at,
           profiles:user_id (
             email,
             full_name
           )`

      const { data, error } = await supabase
        .from("wardrobe_profiles")
        .select(selectFields)
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

  async addWardrobeProfile(
    profile: Omit<WardrobeProfile, "id" | "created_at" | "updated_at">,
  ): Promise<WardrobeProfile | null> {
    try {
      console.log("Adding wardrobe profile with data:", profile)
      console.log("Supabase URL:", supabaseUrl)
      console.log("Supabase client:", !!supabase)

      // Check if DOB column exists
      const dobExists = await this.checkDobColumnExists()
      console.log("DOB column exists for insert:", dobExists)

      // Test basic connection first
      const { data: testData, error: testError } = await supabase.from("wardrobe_profiles").select("count").limit(1)

      console.log("Connection test result:", { testData, testError })

      if (testError) {
        console.error("Connection test failed:", testError)
        console.error("Test error details:", {
          message: testError.message,
          details: testError.details,
          hint: testError.hint,
          code: testError.code,
        })
        return null
      }

      // Prepare profile data based on column availability
      const profileData: any = {
        user_id: profile.user_id,
        name: profile.name,
        relation: profile.relation,
        age: profile.age,
        profile_picture_url: profile.profile_picture_url,
        profile_picture_path: profile.profile_picture_path,
        is_owner: profile.is_owner,
      }

      // Only include date_of_birth if the column exists
      if (dobExists && profile.date_of_birth) {
        profileData.date_of_birth = profile.date_of_birth
      }

      const { data, error } = await supabase.from("wardrobe_profiles").insert([profileData]).select().single()

      console.log("Insert result:", { data, error })

      if (error) {
        console.error("Error adding wardrobe profile:", error)
        console.error("Insert error details:", {
          message: error.message,
          details: error.details,
          hint: error.hint,
          code: error.code,
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
        stack: error?.stack,
      })
      return null
    }
  },

  async updateWardrobeProfile(id: string, updates: Partial<WardrobeProfile>): Promise<WardrobeProfile | null> {
    try {
      console.log("Updating wardrobe profile:", id, "with updates:", updates)

      // Check if DOB column exists
      const dobExists = await this.checkDobColumnExists()
      console.log("DOB column exists for update:", dobExists)

      // Prepare update data based on column availability
      const updateData: any = {
        name: updates.name,
        relation: updates.relation,
        age: updates.age,
        profile_picture_url: updates.profile_picture_url,
        profile_picture_path: updates.profile_picture_path,
      }

      // Only include date_of_birth if the column exists and the value is provided
      if (dobExists && updates.date_of_birth !== undefined) {
        updateData.date_of_birth = updates.date_of_birth
      }

      // Remove undefined values
      Object.keys(updateData).forEach((key) => {
        if (updateData[key] === undefined) {
          delete updateData[key]
        }
      })

      console.log("Final update data:", updateData)

      const { data, error } = await supabase.from("wardrobe_profiles").update(updateData).eq("id", id).select().single()

      if (error) {
        console.error("Error updating wardrobe profile:", error)
        console.error("Update error details:", {
          message: error.message,
          details: error.details,
          hint: error.hint,
          code: error.code,
        })
        return null
      }

      console.log("Successfully updated profile:", data)
      return data
    } catch (error) {
      console.error("Database error:", error)
      return null
    }
  },

  async deleteWardrobeProfile(id: string): Promise<void> {
    try {
      const { error } = await supabase.from("wardrobe_profiles").delete().eq("id", id)

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

      const { data, error } = await supabase.storage.from("profile-pictures").upload(fileName, file, {
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
