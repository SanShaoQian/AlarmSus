"use client"

// OneMap API service functions
const ONEMAP_BASE_URL = "https://developers.onemap.sg"

export async function searchAddress(query: string) {
  try {
    const response = await fetch(
      `${ONEMAP_BASE_URL}/commonapi/search?searchVal=${encodeURIComponent(query)}&returnGeom=Y&getAddrDetails=Y`,
    )
    const data = await response.json()
    return data.results || []
  } catch (error) {
    console.error("Error searching address:", error)
    return []
  }
}

export async function fetchAEDs() {
  try {
    // Mock AED data for demo purposes since we can't access the actual API in this environment
    return [
      {
        LATITUDE: "1.3521",
        LONGITUDE: "103.8198",
        DESCRIPTION: "AED at Marina Bay",
        ADDRESS: "Marina Bay Sands, Singapore",
      },
      {
        LATITUDE: "1.3500",
        LONGITUDE: "103.8200",
        DESCRIPTION: "AED at Raffles Place",
        ADDRESS: "Raffles Place MRT Station, Singapore",
      },
      {
        LATITUDE: "1.3540",
        LONGITUDE: "103.8190",
        DESCRIPTION: "AED at Esplanade",
        ADDRESS: "Esplanade - Theatres on the Bay, Singapore",
      },
    ]
  } catch (error) {
    console.error("Error fetching AEDs:", error)
    return []
  }
}
