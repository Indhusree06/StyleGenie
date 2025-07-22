import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

export async function POST(req: NextRequest) {
  try {
    const { itemNames, userId } = await req.json()

    if (!itemNames || !Array.isArray(itemNames)) {
      return NextResponse.json({ error: "itemNames array is required" }, { status: 400 })
    }

    // Use service role client to bypass RLS
    const serviceRoleSupabase = createClient(
      "https://xypmyqpkmnjbdbsfrgco.supabase.co",
      "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inh5cG15cXBrbW5qYmRic2ZyZ2NvIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MjU4OTAwNSwiZXhwIjoyMDY4MTY1MDA1fQ.X45Nd50noVBzp8DcvNnnhEzdPG5NN6fzodA_Es9em94"
    )

    // Use the known user ID for now
    const testUserId = "593c6f85-5e4e-47a4-b7a7-5d95ffdf782e" // indhusr.katlakanti@gmail.com

    const { data: items, error } = await serviceRoleSupabase
      .from("wardrobe_items")
      .select("name, image_url")
      .eq("user_id", testUserId)
      .in("name", itemNames)

    if (error) {
      console.error("Error fetching wardrobe items:", error)
      return NextResponse.json({ error: "Failed to fetch wardrobe items" }, { status: 500 })
    }

    // Return the items with name and image_url
    const wardrobeItems = itemNames.map(itemName => {
      const dbItem = items?.find(item => item.name === itemName)
      return {
        name: itemName,
        image_url: dbItem?.image_url || null
      }
    })

    return NextResponse.json(wardrobeItems)

  } catch (error) {
    console.error("API error:", error)
    return NextResponse.json({ 
      error: "Internal server error",
      details: error instanceof Error ? error.message : "Unknown error"
    }, { status: 500 })
  }
}
