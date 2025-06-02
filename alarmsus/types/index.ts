// Additional type definitions for the app

export interface NewsItem {
  id: string
  title: string
  isVerified: boolean
  timestamp: string
  location: string
  imageUrl: string
  readMoreUrl: string
  category?: string
  author?: string
}

export interface FooterTab {
  name: string
  icon: string
  label: string
  isActive: boolean
}

export type TabName = "Map" | "Forum" | "Report" | "News" | "Account"

export interface NavigationProps {
  navigation: {
    navigate: (screen: string, params?: any) => void
    goBack: () => void
    replace: (screen: string, params?: any) => void
  }
  route: {
    params?: any
    name: string
  }
}

export interface NewsScreenProps extends NavigationProps {
  newsItems?: NewsItem[]
  onRefresh?: () => Promise<void>
  isLoading?: boolean
}

// API Response types
export interface NewsApiResponse {
  data: NewsItem[]
  pagination: {
    page: number
    limit: number
    total: number
    hasMore: boolean
  }
  status: "success" | "error"
  message?: string
}

// Error types
export interface AppError {
  code: string
  message: string
  details?: any
}
