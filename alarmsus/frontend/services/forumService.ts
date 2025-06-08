import type { ForumIncident, ForumFilters } from "../types/forum"
import { LOCAL_IP, DEV_IP, PROD_IP } from '@env';
import { Platform } from 'react-native';

// Determine if running on emulator/simulator or device
const isRunningOnDevice = Platform.OS === 'ios' || Platform.OS === 'android';

// Determine if running on simulator/emulator or physical device
// For Android, we can detect emulator, for iOS simulators it's the same OS check
// But this can get complicated, so simplest is:

// If on mobile device, use DEV_IP (your computer's LAN IP)
// If on laptop or web, use LOCAL_IP

const API_BASE_URL = isRunningOnDevice ? DEV_IP : LOCAL_IP;
// If you want to add production mode, you can do:

// e.g. NODE_ENV can be 'production' or 'development'
const ENV = process.env.NODE_ENV;

const FINAL_API_BASE_URL = ENV === 'production' ? PROD_IP : API_BASE_URL;

export interface ForumResponse {
  success: boolean
  message: string
  data: {
    incidents: ForumIncident[]
    total: number
    page: number
    limit: number
    hasMore: boolean
  }
}

export const fetchForumIncidents = async (filters: ForumFilters, page = 1): Promise<ForumResponse> => {
  try {
    const params = new URLSearchParams()

    // Add forum flag to get forum-specific data
    params.append("forum", "true")

    if (filters.type) params.append("type", filters.type)
    if (filters.verified !== undefined) params.append("verified", filters.verified.toString())
    if (filters.sort) params.append("sort", filters.sort)
    if (filters.search) params.append("search", filters.search)
    params.append("page", page.toString())
    params.append("limit", "20")

    const url = `${API_BASE_URL}/api/reports?${params.toString()}`
    console.log("Fetching forum incidents:", url)

    const response = await fetch(url)

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    const data = await response.json()
    return data
  } catch (error) {
    console.error("Error fetching forum incidents:", error)
    return {
      success: false,
      message: "Failed to fetch incidents",
      data: {
        incidents: [],
        total: 0,
        page: 1,
        limit: 20,
        hasMore: false,
      },
    }
  }
}

export const incrementMapViews = async (incidentId: number): Promise<void> => {
  try {
    await fetch(`${API_BASE_URL}/api/reports/${incidentId}/map-views`, {
      method: "POST",
    })
  } catch (error) {
    console.error("Error incrementing map views:", error)
  }
}

export const incrementAlerts = async (incidentId: number): Promise<void> => {
  try {
    await fetch(`${API_BASE_URL}/api/reports/${incidentId}/alerts`, {
      method: "POST",
    })
  } catch (error) {
    console.error("Error incrementing alerts:", error)
  }
}
