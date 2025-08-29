import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.55.0'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { lat, lon, language = 'en' } = await req.json()

    if (!lat || !lon) {
      return new Response(
        JSON.stringify({ error: 'Latitude and longitude are required' }), 
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    const apiKey = Deno.env.get('OPENWEATHER_API_KEY')
    if (!apiKey) {
      return new Response(
        JSON.stringify({ error: 'Weather API key not configured' }), 
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    // Get current weather
    const weatherUrl = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric&lang=${language}`
    const weatherResponse = await fetch(weatherUrl)
    
    if (!weatherResponse.ok) {
      throw new Error(`Weather API error: ${weatherResponse.status}`)
    }

    const weatherData = await weatherResponse.json()

    // Get 5-day forecast
    const forecastUrl = `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric&lang=${language}`
    const forecastResponse = await fetch(forecastUrl)
    
    if (!forecastResponse.ok) {
      throw new Error(`Forecast API error: ${forecastResponse.status}`)
    }

    const forecastData = await forecastResponse.json()

    // Transform weather data to match our interface
    const transformedWeather = {
      location: weatherData.name,
      temperature: Math.round(weatherData.main.temp),
      condition: weatherData.weather[0].main,
      humidity: weatherData.main.humidity,
      windSpeed: Math.round(weatherData.wind.speed * 3.6), // Convert m/s to km/h
      visibility: Math.round(weatherData.visibility / 1000), // Convert m to km
      icon: weatherData.weather[0].main.toLowerCase(),
      feels_like: Math.round(weatherData.main.feels_like),
      uv_index: 5, // UV index not available in basic plan, using default
      sunrise: new Date(weatherData.sys.sunrise * 1000).toLocaleTimeString('en-GB', { 
        hour: '2-digit', 
        minute: '2-digit',
        timeZone: 'Asia/Kuala_Lumpur'
      }),
      sunset: new Date(weatherData.sys.sunset * 1000).toLocaleTimeString('en-GB', { 
        hour: '2-digit', 
        minute: '2-digit',
        timeZone: 'Asia/Kuala_Lumpur'
      })
    }

    // Transform forecast data - get one forecast per day for next 5 days
    const dailyForecasts = []
    const seenDates = new Set()
    
    for (const item of forecastData.list) {
      const date = new Date(item.dt * 1000)
      const dateKey = date.toDateString()
      
      if (!seenDates.has(dateKey) && dailyForecasts.length < 5) {
        seenDates.add(dateKey)
        
        const dayName = dailyForecasts.length === 0 ? 'Today' : 
                       dailyForecasts.length === 1 ? 'Tomorrow' : 
                       date.toLocaleDateString('en-US', { weekday: 'short' })

        // Find min/max temps for this day
        const dayForecasts = forecastData.list.filter(f => 
          new Date(f.dt * 1000).toDateString() === dateKey
        )
        
        const temps = dayForecasts.map(f => f.main.temp)
        const high = Math.round(Math.max(...temps))
        const low = Math.round(Math.min(...temps))

        dailyForecasts.push({
          day: dayName,
          high,
          low,
          condition: item.weather[0].main,
          icon: item.weather[0].main.toLowerCase()
        })
      }
    }

    return new Response(
      JSON.stringify({ 
        weather: transformedWeather,
        forecast: dailyForecasts
      }), 
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )

  } catch (error) {
    console.error('Error fetching weather data:', error)
    return new Response(
      JSON.stringify({ error: 'Failed to fetch weather data' }), 
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )
  }
})