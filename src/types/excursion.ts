export interface Excursion {
  id: number
  title: string
  category: string
  description: string
  date: Date
  price: number
  duration: number
  people_amount: number
  people_left: number
  bus_number: number
  is_active: boolean
  image_url: string
}

export interface ExcursionCreate {
  title: string
  category: string
  description: string
  date: Date
  price: number
  duration: number
  people_amount: number
  people_left: number
  bus_number: number
  is_active: boolean
  image_url: string
}

export interface ExcursionUpdate {
  title?: string
  category?: string
  description?: string
  date?: Date
  price?: number
  duration?: number
  people_amount?: number
  people_left?: number
  bus_number?: number
  is_active?: boolean
  image_url?: string
}

export interface ItineraryItem {
  time?: string
  title: string
  description?: string
}

export interface ExcursionDetailsCreate {
  description?: string
  inclusions?: string[]
  itinerary?: ItineraryItem[]
  meeting_point?: string
  requirements?: string[]
  recommendations?: string[]
}

export interface ExcursionDetailsUpdate {
  description?: string
  inclusions?: string[]
  itinerary?: ItineraryItem[]
  meeting_point?: string
  requirements?: string[]
  recommendations?: string[]
}

export interface ExcursionDetails {
  id: number
  excursion_id: number
  description?: string
  inclusions?: string[]
  itinerary?: ItineraryItem[]
  meeting_point?: string
  requirements?: string[]
  recommendations?: string[]
}

export interface ExcursionFullInfo extends Excursion {
  details?: ExcursionDetails
}
