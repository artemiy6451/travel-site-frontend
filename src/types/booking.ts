export interface Booking {
  id: number
  excursion_id: number
  first_name: string
  last_name: string
  phone_number: string
  total_people: number
  children?: number
  created_at?: string
}

export interface BookingCreate {
  excursion_id: number
  first_name: string
  last_name: string
  phone_number: string
  total_people: number
  children?: number
}
