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

export interface ForumFilters {
  type?: "fire" | "health" | "security" | "other"
  verified?: boolean
  sort: "latest" | "nearest"
  search: string
}
