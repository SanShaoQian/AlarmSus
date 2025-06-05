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
  caption: string
  isEmergency: boolean
  emergencyServices: EmergencyServices
  isInDanger: boolean
  location: string
  reportAnonymously: boolean
  imageUrl?: string | null
  userId?: string
  createdAt: Date
  updatedAt: Date
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
