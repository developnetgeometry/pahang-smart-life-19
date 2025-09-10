import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')
    
    if (!supabaseUrl || !supabaseServiceKey) {
      throw new Error('Missing required environment variables')
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    // Fetch all districts from database
    const { data: districts, error: fetchError } = await supabase
      .from('districts')
      .select('id, name, latitude, longitude')

    if (fetchError) {
      throw new Error(`Failed to fetch districts: ${fetchError.message}`)
    }

    if (!districts || districts.length === 0) {
      return new Response(JSON.stringify({ error: 'No districts found' }), {
        status: 404,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    console.log(`Processing ${districts.length} districts for area calculation`)

    let updatedCount = 0
    let errorCount = 0
    const errors: string[] = []

    // Process each district
    for (const district of districts) {
      try {
        // Search for the district boundary using Overpass API
        const overpassQuery = `
          [out:json][timeout:25];
          (
            relation["admin_level"="6"]["name"="${district.name}"]["place"!="city"]["place"!="town"];
            relation["admin_level"="7"]["name"="${district.name}"];
            relation["admin_level"="8"]["name"="${district.name}"];
          );
          out geom;
        `

        const overpassUrl = 'https://overpass-api.de/api/interpreter'
        const overpassResponse = await fetch(overpassUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
          body: `data=${encodeURIComponent(overpassQuery)}`
        })

        if (!overpassResponse.ok) {
          throw new Error(`Overpass API error: ${overpassResponse.status}`)
        }

        const overpassData = await overpassResponse.json()
        
        if (!overpassData.elements || overpassData.elements.length === 0) {
          console.log(`No boundary found for district: ${district.name}`)
          errors.push(`No boundary found for district: ${district.name}`)
          errorCount++
          continue
        }

        // Get the first relation (should be the district boundary)
        const relation = overpassData.elements[0]
        
        if (!relation.members) {
          console.log(`Invalid boundary data for district: ${district.name}`)
          errors.push(`Invalid boundary data for district: ${district.name}`)
          errorCount++
          continue
        }

        // Extract coordinates from the relation
        let totalArea = 0
        let coordinates: number[][] = []

        // Simple area calculation using bounding box as approximation
        // In a real implementation, you'd use a proper geometry library like Turf.js
        
        let minLat = 90, maxLat = -90, minLon = 180, maxLon = -180
        
        for (const member of relation.members) {
          if (member.geometry) {
            for (const coord of member.geometry) {
              if (coord.lat && coord.lon) {
                minLat = Math.min(minLat, coord.lat)
                maxLat = Math.max(maxLat, coord.lat)
                minLon = Math.min(minLon, coord.lon)
                maxLon = Math.max(maxLon, coord.lon)
                coordinates.push([coord.lon, coord.lat])
              }
            }
          }
        }

        if (coordinates.length === 0) {
          console.log(`No valid coordinates for district: ${district.name}`)
          errors.push(`No valid coordinates for district: ${district.name}`)
          errorCount++
          continue
        }

        // Approximate area calculation using bounding box
        // This is a simple approximation - for accurate area calculation, use proper GIS libraries
        const latDiff = maxLat - minLat
        const lonDiff = maxLon - minLon
        
        // Convert to approximate km² (very rough calculation)
        // 1 degree latitude ≈ 111 km
        // 1 degree longitude ≈ 111 km * cos(latitude)
        const avgLat = (minLat + maxLat) / 2
        const latKm = latDiff * 111
        const lonKm = lonDiff * 111 * Math.cos(avgLat * Math.PI / 180)
        totalArea = latKm * lonKm

        // Update district with calculated area
        const { error: updateError } = await supabase
          .from('districts')
          .update({ 
            area_km2: Math.round(totalArea * 100) / 100, // Round to 2 decimal places
            latitude: avgLat,
            longitude: (minLon + maxLon) / 2
          })
          .eq('id', district.id)

        if (updateError) {
          console.error(`Failed to update district ${district.name}:`, updateError)
          errors.push(`Failed to update district ${district.name}: ${updateError.message}`)
          errorCount++
        } else {
          console.log(`Updated area for ${district.name}: ${totalArea.toFixed(2)} km²`)
          updatedCount++
        }

        // Add delay to avoid overwhelming the Overpass API
        await new Promise(resolve => setTimeout(resolve, 1000))

      } catch (error) {
        console.error(`Error processing district ${district.name}:`, error)
        errors.push(`Error processing district ${district.name}: ${error.message}`)
        errorCount++
      }
    }

    const result = {
      success: true,
      message: `Area calculation completed. Updated ${updatedCount} districts.`,
      summary: {
        total: districts.length,
        updated: updatedCount,
        errors: errorCount
      },
      errors: errors.length > 0 ? errors : undefined
    }

    console.log('Area calculation summary:', result)

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })

  } catch (error) {
    console.error('Error in fetch-osm-boundaries function:', error)
    return new Response(JSON.stringify({ 
      error: error.message,
      success: false 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
  }
})