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

export async function fetchPlaceholderAEDs() {
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

async function getOneMapToken() {
  const url = "https://www.onemap.gov.sg/api/auth/post/getToken";

  const email = "sanshaoqian@gmail.com";
  const password = "";

  if (!email || !password) {
    throw new Error('Missing OneMap credentials in environment variables');
  }

  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      email,
      password,
    }),
  });

  if (!res.ok) {
    throw new Error(`Failed to get token: ${res.status}`);
  }
  const data = await res.json();
  return data.access_token;
}

export async function fetchNearbyAEDs(latitude: string, longitude: string, radius: number = 2000) {
  try {
    const token = await getOneMapToken();
    if (!token) {
      throw new Error('Failed to get OneMap token');
    }

    // Using the correct API endpoint with authentication
    const response = await fetch(`https://developers.onemap.sg/privateapi/themesvc/retrieveTheme?queryName=aed&token=${token}`);
    const data = await response.json();
    const allAEDs = data.SrchResults || [];
    console.log("AEDs loaded:", allAEDs.length);

    return allAEDs.filter((aed: any) => {
      const distance = calculateDistance(
        parseFloat(latitude),
        parseFloat(longitude),
        parseFloat(aed.LATITUDE),
        parseFloat(aed.LONGITUDE)
      );
      return distance <= radius;
    });
  } catch (error) {
    console.error("Error fetching nearby AEDs:", error);
    return [];
  }
}

// Helper function to calculate distance between two points using Haversine formula
function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371e3; // Earth's radius in meters
  const φ1 = lat1 * Math.PI / 180;
  const φ2 = lat2 * Math.PI / 180;
  const Δφ = (lat2 - lat1) * Math.PI / 180;
  const Δλ = (lon2 - lon1) * Math.PI / 180;

  const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
    Math.cos(φ1) * Math.cos(φ2) *
    Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
  
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c; // Distance in meters
}

interface Coordinates {
  latitude: number;
  longitude: number;
}

export async function geocodePostalCode(postalCode: string): Promise<Coordinates | null> {
  const url = `https://www.onemap.gov.sg/api/common/elastic/search?searchVal=${postalCode}&returnGeom=Y&getAddrDetails=Y`;

  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Failed to fetch coordinates for postal code ${postalCode}`);
    }

    const data = await response.json();

    if (data.found > 0 && data.results && data.results[0]) {
      const { LATITUDE, LONGITUDE } = data.results[0];
      return {
        latitude: parseFloat(LATITUDE),
        longitude: parseFloat(LONGITUDE),
      };
    }

    return null; // No result found
  } catch (err) {
    console.error('Geocoding error:', err);
    return null;
  }
}