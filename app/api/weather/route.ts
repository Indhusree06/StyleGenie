import { type NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const lat = searchParams.get("lat")
  const lon = searchParams.get("lon")

  if (!lat || !lon) {
    return NextResponse.json({ error: "Latitude and longitude are required" }, { status: 400 })
  }

  // Check if API key is available
  const OPENWEATHER_API_KEY = process.env.OPENWEATHER_API_KEY
  if (!OPENWEATHER_API_KEY) {
    return NextResponse.json(
      { error: "OpenWeather API key not configured. Please add OPENWEATHER_API_KEY to your environment variables." },
      { status: 500 }
    )
  }

  try {
    // Build the API URL with proper parameters
    const weatherUrl = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${OPENWEATHER_API_KEY}&units=imperial`
    
    console.log(`Fetching weather for coordinates: ${lat}, ${lon}`)
    console.log('OPENWEATHER_API_KEY:', process.env.OPENWEATHER_API_KEY);
    console.log('lat:', lat, 'lon:', lon);
    
    const response = await fetch(weatherUrl, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error(`OpenWeather API error: ${response.status} - ${errorText}`)
      throw new Error(`OpenWeather API returned ${response.status}: ${errorText}`)
    }

    const data = await response.json()
    
    // Log the raw response for debugging
    console.log('OpenWeather API response:', JSON.stringify(data, null, 2))

    // Validate the response structure
    if (!data.main || !data.weather || !data.weather[0]) {
      console.error('Invalid weather data structure:', data)
      throw new Error('Invalid weather data structure received from API')
    }

    const weatherData = {
      temperature: Math.round(data.main.temp * 10) / 10, // Round to 1 decimal place
      condition: data.weather[0].main,
      description: data.weather[0].description,
      humidity: data.main.humidity,
      windSpeed: Math.round(data.wind?.speed * 10) / 10 || 0, // Handle missing wind data
      icon: data.weather[0].icon,
      location: data.name || 'Unknown',
      country: data.sys?.country || 'Unknown',
      timestamp: new Date().toISOString(),
    }

    console.log('Processed weather data:', weatherData)
    return NextResponse.json(weatherData)
    
  } catch (error) {
    console.error("Weather API error:", error)
    
    // Return more detailed error information
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred'
    return NextResponse.json({ 
      error: "Failed to fetch weather data", 
      details: errorMessage,
      coordinates: { lat, lon }
    }, { status: 500 })
  }
}
