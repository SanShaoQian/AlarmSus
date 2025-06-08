// Mock AED service for demonstration
export interface AED {
  id: string
  name: string
  latitude: number
  longitude: number
  address: string
  distance?: number
}

// Mock AED data - replace with real data source
const mockAEDs: AED[] = [
  {
    id: "1",
    name: "City Hospital Main Entrance",
    latitude: 51.5074,
    longitude: -0.1278,
    address: "123 Hospital Street, London",
  },
  {
    id: "2",
    name: "Shopping Center AED",
    latitude: 51.5084,
    longitude: -0.1288,
    address: "456 Shopping Ave, London",
  },
  {
    id: "3",
    name: "Train Station AED",
    latitude: 51.5064,
    longitude: -0.1268,
    address: "789 Station Road, London",
  },
]

export const fetchNearbyAEDs = async (latitude: number, longitude: number, radiusKm = 5): Promise<AED[]> => {
  // Simulate API call delay
  await new Promise((resolve) => setTimeout(resolve, 1000))

  // Calculate distance and filter (simplified calculation)
  const aedsWithDistance = mockAEDs.map((aed) => {
    const distance = calculateDistance(latitude, longitude, aed.latitude, aed.longitude)
    return { ...aed, distance }
  })

  // Filter by radius and sort by distance
  return aedsWithDistance.filter((aed) => aed.distance! <= radiusKm).sort((a, b) => a.distance! - b.distance!)
}

// Simple distance calculation (Haversine formula)
function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371 // Earth's radius in kilometers
  const dLat = toRadians(lat2 - lat1)
  const dLon = toRadians(lon2 - lon1)
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRadians(lat1)) * Math.cos(toRadians(lat2)) * Math.sin(dLon / 2) * Math.sin(dLon / 2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  return R * c
}

function toRadians(degrees: number): number {
  return degrees * (Math.PI / 180)
}

export const searchAEDsByAddress = async (address: string): Promise<AED[]> => {
  // Simulate API call
  await new Promise((resolve) => setTimeout(resolve, 800))

  // Simple mock search
  return mockAEDs.filter(
    (aed) =>
      aed.address.toLowerCase().includes(address.toLowerCase()) ||
      aed.name.toLowerCase().includes(address.toLowerCase()),
  )
}
