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

    const apiKey = Deno.env.get('GOOGLE_MAPS_API_KEY')
    if (!apiKey) {
      return new Response(
        JSON.stringify({ error: 'Google Maps API key not configured' }), 
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    // Get current weather using WeatherAPI (provides Google-like data)
    const weatherApiKey = Deno.env.get('WEATHER_API_KEY') || apiKey
    const weatherUrl = `https://api.weatherapi.com/v1/forecast.json?key=${weatherApiKey}&q=${lat},${lon}&days=5&lang=${language}`
    const weatherResponse = await fetch(weatherUrl)
    
    if (!weatherResponse.ok) {
      throw new Error(`Weather API error: ${weatherResponse.status}`)
    }

    const weatherData = await weatherResponse.json()

    // Transform weather data to match our interface
    const current = weatherData.current
    const location = weatherData.location
    const forecast = weatherData.forecast.forecastday
    
    const transformedWeather = {
      location: location.name,
      temperature: Math.round(current.temp_c),
      condition: current.condition.text,
      humidity: current.humidity,
      windSpeed: Math.round(current.wind_kph),
      visibility: Math.round(current.vis_km),
      icon: current.condition.text.toLowerCase(),
      feels_like: Math.round(current.feelslike_c),
      uv_index: Math.round(current.uv),
      sunrise: forecast[0].astro.sunrise,
      sunset: forecast[0].astro.sunset
    }

    // Transform forecast data - get daily forecasts
    const dailyForecasts = forecast.map((day, index) => {
      const date = new Date(day.date)
      const dayName = index === 0 ? 'Today' : 
                     index === 1 ? 'Tomorrow' : 
                     date.toLocaleDateString('en-US', { weekday: 'short' })

      return {
        day: dayName,
        high: Math.round(day.day.maxtemp_c),
        low: Math.round(day.day.mintemp_c),
        condition: day.day.condition.text,
        icon: day.day.condition.text.toLowerCase()
      }
    })

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