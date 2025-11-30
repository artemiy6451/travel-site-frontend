export interface Review {
  id: number
  author_name: string
  email: string
  rating: number
  text: string
  created_at: string
  is_approved: boolean
  is_active: boolean
  excursion_id?: number
}

export interface ReviewCreate {
  author_name: string
  email: string
  rating: number
  text: string
  excursion_id?: number
}

export interface ReviewStats {
  total: number
  average_rating: number
  approved_reviews: number
  pending_reviews: number
}
