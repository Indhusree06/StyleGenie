import { streamText } from "ai"
import { openai } from "@ai-sdk/openai"
import { createClient } from "@supabase/supabase-js"
import { wardrobeService, supabase } from "@/lib/supabase"

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

    // Get the authorization header to authenticate the user
    let authenticatedUserId = userId
    const authHeader = req.headers.get('authorization')
    if (authHeader) {
      try {
        const token = authHeader.replace('Bearer ', '')
        const { data: { user }, error } = await supabase.auth.getUser(token)
        if (error) {
          console.error('Auth error:', error)
        } else if (user) {
          console.log(`Authenticated user: ${user.id}`)
          authenticatedUserId = user.id // Use the authenticated user ID
          if (user.id !== userId) {
            console.warn(`User ID mismatch: authenticated ${user.id} vs provided ${userId}`)
          }
        }
      } catch (authError) {
        console.error('Error verifying auth token:', authError)
      }
    }

    console.log(`Chat API - Processing request for userId: ${authenticatedUserId}`)

    const weatherInfo = weather
      ? `Current Weather: ${Math.round(weather.temperature)}°F, ${weather.description}, Humidity: ${weather.humidity}%, Wind: ${Math.round(weather.windSpeed)} mph`
      : "Weather information not available"

    // Get user's real wardrobe data
    let wardrobeItems: WardrobeItemForAI[] = []
    let wardrobeSource = "your personal wardrobe"
    
    console.log(`Chat API - Received userId: ${userId}, useRealDatabase: ${useRealDatabase}`)
    console.log(`Chat API - userId type: ${typeof userId}, userId value: "${userId}"`)
    
    if (useRealDatabase) {
      if (!authenticatedUserId) {
        console.error("No userId provided to chat API while useRealDatabase is true");
        return new Response(
          JSON.stringify({ error: "No userId provided. Please log in or provide a valid user ID." }),
          { status: 400, headers: { "Content-Type": "application/json" } },
        );
      }
      try {
        console.log(`Fetching wardrobe items for user: ${authenticatedUserId}`)
        
        // Temporary: Use known user ID for testing
        const testUserId = "593c6f85-5e4e-47a4-b7a7-5d95ffdf782e" // indhusr.katlakanti@gmail.com
        console.log(`Testing with known user ID: ${testUserId}`)
        
        // Use service role client to bypass RLS
        const serviceRoleSupabase = createClient(
          "https://xypmyqpkmnjbdbsfrgco.supabase.co",
          "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inh5cG15cXBrbW5qYmRic2ZyZ2NvIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MjU4OTAwNSwiZXhwIjoyMDY4MTY1MDA1fQ.X45Nd50noVBzp8DcvNnnhEzdPG5NN6fzodA_Es9em94"
        )
        
        const { data: items, error } = await serviceRoleSupabase
          .from("wardrobe_items")
          .select(`
            *,
            category:categories(*),
            wardrobe_item_tags(
              tag:tags(*)
            )
          `)
          .eq("user_id", testUserId)
          .order("created_at", { ascending: false })
        console.log(`Wardrobe service returned:`, items)
        console.log(`Items type:`, typeof items)
        console.log(`Items length:`, items?.length)
        console.log(`Items is array:`, Array.isArray(items))
        
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
1. First, try to recommend items that exist in the user's wardrobe collection above
2. If the user's wardrobe doesn't have suitable items for the occasion/weather, you can suggest ideal items they should have
3. Use exact item names from the wardrobe when available, or suggest specific item types when not available
4. Consider the occasion mentioned by the user
5. Take into account the current weather conditions (temperature, humidity, wind)
6. For cold weather (below 60°F), prioritize warm items like sweaters, coats, or boots
7. For hot weather (above 80°F), suggest lighter items like cotton t-shirts, summer dresses, and breathable fabrics
8. For rainy/humid conditions, avoid delicate fabrics and suggest practical items
9. Consider the condition and wear count of items (maybe suggest less-worn items occasionally)
10. Pay attention to favorite items (marked with ⭐) as the user likely enjoys wearing them
11. Provide practical and stylish combinations that work well together
12. Reference specific brands, prices, and styling details from their collection when available
13. Explain why each piece works well for the weather and occasion

After your recommendation, include a JSON object with this EXACT format (no markdown code blocks):

OUTFIT_RECOMMENDATION:
{
  "items": ["exact item name 1 from wardrobe", "exact item name 2 from wardrobe", "suggested item name if not in wardrobe"],
  "occasion": "occasion type",
  "weather": "weather description with temperature",
  "totalValue": "estimated total value of outfit",
  "reasoning": "brief explanation of why these items work together",
  "missingItems": ["suggested item name if not in wardrobe", "another missing item"]
}

IMPORTANT: 
- Do NOT wrap the JSON in markdown code blocks. Just provide the raw JSON after the OUTFIT_RECOMMENDATION: marker.
- In the "items" array, include both wardrobe items (using exact names) AND suggested items if the wardrobe lacks suitable pieces
- In the "missingItems" array, list only the suggested items that are NOT in the user's wardrobe
- If all recommended items are from the wardrobe, "missingItems" should be an empty array []

Be conversational, helpful, and enthusiastic about fashion. Always explain why you chose specific items from their wardrobe and how they work together for the current weather conditions. Reference the specific brands, conditions, and styling details from their collection when available.

When suggesting items not in their wardrobe, explain why these items would complete the outfit and mention that similar items can be found online.`

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
