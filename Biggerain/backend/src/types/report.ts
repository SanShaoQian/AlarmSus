export interface EmergencyServices {
  police: boolean
  ambulance: boolean
  fire: boolean
}

export interface ReportRequest {
  caption: string
  isEmergency: boolean
  emergencyServices: EmergencyServices
  isInDanger: boolean
  location: string
  reportAnonymously: boolean
  imageUrl?: string | null
  userId?: string
}

export interface ReportResponse {
  id: number
  title?: string
  caption: string
  type?: "fire" | "health" | "security" | "other"
  isEmergency: boolean
  emergencyServices: EmergencyServices
  isInDanger: boolean
  location: string
  reportAnonymously: boolean
  imageUrl?: string | null
  userId?: string
  verified?: boolean
  alerts?: number
  comments?: number
  mapViews?: number
  createdAt: Date
  updatedAt: Date
  timeAgo?: string
}

export interface ForumIncident {
  id: number
  title: string
  caption: string
  type: "fire" | "health" | "security" | "other"
  isEmergency: boolean
  location: string
  verified: boolean
  alerts: number
  comments: number
  mapViews: number
  imageUrl?: string
  createdAt: string
  timeAgo?: string
}

export interface ForumQuery {
  type?: "fire" | "health" | "security" | "other"
  verified?: boolean
  sort?: "latest"
  search?: string
  page?: number
  limit?: number
}

export interface ApiResponse {
  success: boolean
  message: string
  data?: any
  reportId?: number
}

export interface User {
  id: string
  email: string
  name: string
  createdAt: Date
}
