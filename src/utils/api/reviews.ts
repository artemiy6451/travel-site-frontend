import { BaseApi } from './base'
import type { Review, ReviewCreate, ReviewStats } from '@/types/review'

export class ReviewsApi extends BaseApi {
  async getApprovedReviews(): Promise<Review[]> {
    const response = await this.request<Review[]>('/review/')
    // Сортируем по дате создания на фронте (от новых к старым)
    return response.sort(
      (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
    )
  }

  async getReviewsStats(): Promise<ReviewStats> {
    return this.request<ReviewStats>('/review/stats')
  }

  async createReview(review: ReviewCreate): Promise<Review> {
    const response = await this.request<Review>('/review/', {
      method: 'POST',
      body: JSON.stringify(review),
    })
    return response
  }

  // Админские методы (требуют авторизации)
  async getAllReviews(): Promise<Review[]> {
    const response = await this.request<Review[]>('/review/admin/all', {
      headers: {
        ...this.getAuthHeaders(),
      },
    })
    // Сортируем на фронте
    return response.sort(
      (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
    )
  }

  async getPendingReviews(): Promise<Review[]> {
    const response = await this.request<Review[]>('/review/admin/pending', {
      headers: {
        ...this.getAuthHeaders(),
      },
    })
    // Сортируем на фронте
    return response.sort(
      (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
    )
  }

  async toggleReview(reviewId: number): Promise<Review> {
    return this.request<Review>(`/review/admin/${reviewId}/toggle`, {
      method: 'POST',
      headers: {
        ...this.getAuthHeaders(),
      },
    })
  }

  async deleteReview(reviewId: number): Promise<void> {
    await this.request(`/review/admin/${reviewId}`, {
      method: 'DELETE',
      headers: {
        ...this.getAuthHeaders(),
      },
    })
  }
}
