import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"
import { supabase } from "@/lib/supabase"

export async function GET() {
  try {
    // Test basic connection
    const { data: connectionTest, error: connectionError } = await supabase
      .from("profiles")
      .select("count")
      .limit(1)

    if (connectionError) {
      return NextResponse.json({
        success: false,
        error: "Connection failed",
        details: connectionError
      })
    }

    // Test wardrobe items table - get ALL items to see what's in the database
    const { data: wardrobeTest, error: wardrobeError } = await supabase
      .from("wardrobe_items")
      .select("id, name, user_id")
      .limit(50)

    // Also try with service role (bypassing RLS)
    const serviceRoleSupabase = createClient(
      "https://xypmyqpkmnjbdbsfrgco.supabase.co",
      "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inh5cG15cXBrbW5qYmRic2ZyZ2NvIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MjU4OTAwNSwiZXhwIjoyMDY4MTY1MDA1fQ.X45Nd50noVBzp8DcvNnnhEzdPG5NN6fzodA_Es9em94"
    )

    const { data: serviceRoleTest, error: serviceRoleError } = await serviceRoleSupabase
      .from("wardrobe_items")
      .select("id, name, user_id")
      .limit(50)

    // Check if there are any tables with data
    const { data: profilesData } = await serviceRoleSupabase
      .from("profiles")
      .select("id, email")
      .limit(10)

    const { data: categoriesData } = await serviceRoleSupabase
      .from("categories")
      .select("id, name")
      .limit(10)

    const { data: tagsData } = await serviceRoleSupabase
      .from("tags")
      .select("id, name")
      .limit(10)

    // Get current session
    const { data: { session }, error: sessionError } = await supabase.auth.getSession()

    return NextResponse.json({
      success: true,
      connection: "OK",
      wardrobeItemsFound: wardrobeTest?.length || 0,
      wardrobeError: wardrobeError?.message || null,
      sampleItems: wardrobeTest?.map(item => ({
        id: item.id,
        name: item.name,
        user_id: item.user_id
      })) || [],
      serviceRoleItemsFound: serviceRoleTest?.length || 0,
      serviceRoleError: serviceRoleError?.message || null,
      serviceRoleSampleItems: serviceRoleTest?.map(item => ({
        id: item.id,
        name: item.name,
        user_id: item.user_id
      })) || [],
      profilesFound: profilesData?.length || 0,
      profiles: profilesData || [],
      categoriesFound: categoriesData?.length || 0,
      categories: categoriesData || [],
      tagsFound: tagsData?.length || 0,
      tags: tagsData || [],
      currentUser: session?.user?.id || "No user session",
      sessionExists: !!session
    })

  } catch (error) {
    return NextResponse.json({
      success: false,
      error: "Unexpected error",
      details: error instanceof Error ? error.message : "Unknown error"
    })
  }
}
