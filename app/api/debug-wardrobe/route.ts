import { NextRequest, NextResponse } from "next/server"
import { wardrobeService } from "@/lib/supabase"

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const userId = searchParams.get("userId")

  if (!userId) {
    return NextResponse.json({ error: "userId parameter required" }, { status: 400 })
  }

  try {
    console.log(`Debug: Fetching wardrobe for user: ${userId}`)
    const items = await wardrobeService.getWardrobeItems(userId)
    
    return NextResponse.json({
      userId,
      itemCount: items?.length || 0,
      items: items?.slice(0, 3).map(item => ({
        name: item.name,
        category: item.category?.name,
        brand: item.brand
      })) || [],
      success: true
    })
  } catch (error) {
    console.error("Debug wardrobe error:", error)
    return NextResponse.json({ 
      error: "Failed to fetch wardrobe items",
      details: error instanceof Error ? error.message : "Unknown error"
    }, { status: 500 })
  }
}
