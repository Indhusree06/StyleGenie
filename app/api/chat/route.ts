import { type NextRequest, NextResponse } from "next/server"
import { generateText } from "ai"
import { openai } from "@ai-sdk/openai"

export async function POST(req: NextRequest) {
  try {
    const { messages } = await req.json()

    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json({ error: "Messages array is required" }, { status: 400 })
    }

    const lastMessage = messages[messages.length - 1]
    const userMessage = lastMessage?.content || ""

    // Check if this is an outfit-related query
    const outfitKeywords = ["outfit", "wear", "dress", "clothes", "style", "fashion", "look", "attire"]
    const isOutfitQuery = outfitKeywords.some((keyword) => userMessage.toLowerCase().includes(keyword))

    let systemPrompt = `You are StyleGenie AI, a helpful fashion and wardrobe assistant. You help users with outfit suggestions, styling advice, and wardrobe management.`

    if (isOutfitQuery) {
      systemPrompt += ` Focus on providing practical outfit suggestions based on the user's wardrobe items, weather conditions, and occasions. Be specific and helpful with your recommendations.`
    }

    // Generate response using AI SDK
    const { text } = await generateText({
      model: openai("gpt-4o-mini"),
      system: systemPrompt,
      prompt: userMessage,
      maxTokens: 500,
    })

    return NextResponse.json({
      message: text,
      suggestions: isOutfitQuery
        ? [
            "Show me casual outfits",
            "What should I wear to work?",
            "Suggest a date night outfit",
            "Help me with weekend style",
          ]
        : [
            "Help me organize my wardrobe",
            "What colors work well together?",
            "How to mix and match clothes?",
            "Seasonal wardrobe tips",
          ],
    })
  } catch (error) {
    console.error("Chat API Error:", error)

    // Return a helpful fallback response instead of an error
    return NextResponse.json(
      {
        message:
          "I'm here to help with your wardrobe and outfit suggestions! Try asking me about what to wear for different occasions, how to style specific items, or general fashion advice.",
        suggestions: [
          "What should I wear today?",
          "Help me style my wardrobe",
          "Suggest outfits for work",
          "Weekend casual looks",
        ],
      },
      { status: 200 },
    )
  }
}
