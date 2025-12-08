import { BaseApi } from './base'
import type { Booking, BookingCreate } from '@/types/booking'

export class BookingApi extends BaseApi {
  async createBooking(booking: BookingCreate): Promise<Booking> {
    return this.request<Booking>('/booking', {
      method: 'POST',
      body: JSON.stringify(booking),
    })
  }

  async getAllBookings(): Promise<Booking[]> {
    return this.request<Booking[]>('/bookings', {
      headers: {
        ...this.getAuthHeaders(),
      },
    })
  }

  async toggleBooking(id: number): Promise<Booking> {
    return this.request<Booking>(`/booking/${id}/toggle`, {
      method: 'GET',
      headers: {
        ...this.getAuthHeaders(),
      },
    })
  }
}
