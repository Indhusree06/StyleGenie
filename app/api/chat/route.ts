import { streamText } from "ai"
import { openai } from "@ai-sdk/openai"
import { wardrobeService } from "@/lib/supabase"

// Define the type for a wardrobe item used in this API
interface WardrobeItemForAI {
  name: string;
  category: string;
  description: string;
  brand: string;
  condition: string;
  tags: string[];
  wearCount: number;
  isFavorite: boolean;
  price?: string;
}

export async function POST(req: Request) {
  try {
    const { messages, location, weather, userId, useRealDatabase } = await req.json()

    // Check if API key is available
    const apiKey = process.env.OPENAI_API_KEY
    if (!apiKey) {
      return new Response(
        JSON.stringify({
          error: "OpenAI API key not configured. Please add OPENAI_API_KEY to your environment variables.",
        }),
        { status: 500, headers: { "Content-Type": "application/json" } },
      )
    }

    const weatherInfo = weather
      ? `Current Weather: ${Math.round(weather.temperature)}°F, ${weather.description}, Humidity: ${weather.humidity}%, Wind: ${Math.round(weather.windSpeed)} mph`
      : "Weather information not available"

    // Get user's real wardrobe data
    let wardrobeItems: WardrobeItemForAI[] = []
    let wardrobeSource = "your personal wardrobe"
    
    console.log(`Chat API - Received userId: ${userId}, useRealDatabase: ${useRealDatabase}`)
    
    if (useRealDatabase) {
      if (!userId) {
        console.error("No userId provided to chat API while useRealDatabase is true");
        return new Response(
          JSON.stringify({ error: "No userId provided. Please log in or provide a valid user ID." }),
          { status: 400, headers: { "Content-Type": "application/json" } },
        );
      }
      try {
        console.log(`Fetching wardrobe items for user: ${userId}`)
        const items = await wardrobeService.getWardrobeItems(userId)
        if (items && items.length > 0) {
          wardrobeItems = items.map(item => ({
            name: item.name,
            category: item.category?.name || 'uncategorized',
            description: item.description || '',
            brand: item.brand || 'Unknown',
            condition: item.condition,
            tags: Array.isArray(item.tags)
              ? item.tags.map((t: any) => (t.tag?.name || t.name))
              : [],
            wearCount: item.wear_count,
            isFavorite: item.is_favorite,
            price: item.price ? `$${item.price}` : undefined
          }))
          console.log(`Using real wardrobe data: ${wardrobeItems.length} items`)
        } else {
          console.warn(`No wardrobe items found for user ${userId}.`)
        }
      } catch (error) {
        console.error("Error fetching wardrobe:", error)
        return new Response(
          JSON.stringify({ error: "Failed to fetch wardrobe items from the database." }),
          { status: 500, headers: { "Content-Type": "application/json" } },
        );
      }
    } else {
      // If not using real database, return an error (or you can remove this block if not needed)
      return new Response(
        JSON.stringify({ error: "useRealDatabase must be true to fetch wardrobe items." }),
        { status: 400, headers: { "Content-Type": "application/json" } },
      );
    }

    // Format wardrobe items for AI
    const formattedWardrobe = wardrobeItems.map((item) => {
      const tagsList = item.tags?.join(", ") || ""
      const wearInfo = item.wearCount > 0 ? ` (worn ${item.wearCount} times)` : " (never worn)"
      const favoriteInfo = item.isFavorite ? " ⭐ FAVORITE" : ""
      const priceInfo = item.price ? ` - $${item.price}` : ""
      return `- ${item.name} (${item.category})${favoriteInfo}${priceInfo}
  Brand: ${item.brand}
  Description: ${item.description}
  Condition: ${item.condition}
  Tags: ${tagsList}${wearInfo}`
    })

    const systemPrompt = `You are a professional AI stylist assistant. You have access to the user's wardrobe and current weather information.

User's Wardrobe Collection (from ${wardrobeSource}):
${formattedWardrobe.length > 0 ? formattedWardrobe.join("\n\n") : "No items in wardrobe yet. Please ask the user to add some clothing items to their wardrobe first."}

\nNote: This is your personal wardrobe collection from your database.

Current Location & Weather:
${weatherInfo}

When recommending outfits:
1. ONLY recommend items that exist in the user's wardrobe collection above
2. Use the exact item names from the wardrobe when making recommendations
3. Consider the occasion mentioned by the user
4. Take into account the current weather conditions (temperature, humidity, wind)
5. For cold weather (below 60°F), prioritize warm items like sweaters, coats, or boots
6. For hot weather (above 80°F), suggest lighter items like cotton t-shirts, summer dresses, and breathable fabrics
7. For rainy/humid conditions, avoid delicate fabrics and suggest practical items
8. Consider the condition and wear count of items (maybe suggest less-worn items occasionally)
9. Pay attention to favorite items (marked with ⭐) as the user likely enjoys wearing them
10. Provide practical and stylish combinations that work well together
11. Reference specific brands, prices, and styling details from their collection
12. Explain why each piece works well for the weather and occasion

After your recommendation, include a JSON object with this EXACT format (no markdown code blocks):

OUTFIT_RECOMMENDATION:
{
  "items": ["exact item name 1", "exact item name 2", "exact item name 3"],
  "occasion": "occasion type",
  "weather": "weather description with temperature",
  "totalValue": "estimated total value of outfit",
  "reasoning": "brief explanation of why these items work together"
}

IMPORTANT: Do NOT wrap the JSON in markdown code blocks. Just provide the raw JSON after the OUTFIT_RECOMMENDATION: marker.

Be conversational, helpful, and enthusiastic about fashion. Always explain why you chose specific items from their wardrobe and how they work together for the current weather conditions. Reference the specific brands, conditions, and styling details from their collection.

If the user asks about items not in their wardrobe, politely suggest they add those items to their collection first.`

    const result = await streamText({
      model: openai("gpt-4o"),
      system: systemPrompt,
      messages,
    })

    return result.toDataStreamResponse()
  } catch (error) {
    console.error("Chat API error:", error)
    return new Response(
      JSON.stringify({ error: "Failed to process chat request. Please check your OpenAI API key and try again." }),
      { status: 500, headers: { "Content-Type": "application/json" } },
    )
  }
}
