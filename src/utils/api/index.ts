import { AuthApi } from './auth'
import { BookingApi } from './booking'
import { ExcursionsApi } from './excursion'
import { ReviewsApi } from './reviews'

export class Api {
  auth: AuthApi
  excursions: ExcursionsApi
  reviews: ReviewsApi
  booking: BookingApi

  constructor() {
    this.auth = new AuthApi()
    this.excursions = new ExcursionsApi()
    this.reviews = new ReviewsApi()
    this.booking = new BookingApi()
  }
}

export const api = new Api()
