export interface Review {
  id: number
  author_name: string
  email: string
  rating: number
  text: string
  created_at: string
  is_active: boolean
}

export interface ReviewCreate {
  author_name: string
  email: string
  rating: number
  text: string
}

export interface ReviewStats {
  total: number
  average_rating: number
  rating_distribution: {
    1: number
    2: number
    3: number
    4: number
    5: number
  }
  pending_count: number
  approved_count: number
}

export interface ReviewAdmin extends Review {
  email: string
}
