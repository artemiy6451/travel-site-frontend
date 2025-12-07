import { BaseApi } from './base'
import { cache } from '@/utils/cache'
import type {
  Excursion,
  ExcursionCreate,
  ExcursionUpdate,
  ExcursionFullInfo,
  ExcursionDetails,
  ExcursionDetailsCreate,
  ExcursionDetailsUpdate,
} from '@/types/excursion'

export class ExcursionsApi extends BaseApi {
  private invalidateExcursionCache(excursionId?: number) {
    cache.clearByPrefix('excursions')
    cache.clearByPrefix('excursion_full')

    if (excursionId) {
      cache.delete(`excursion:${excursionId}`)
      cache.delete(`excursion_details:${excursionId}`)
    }
  }

  async getExcursions(params?: {
    category?: string
    skip?: number
    limit?: number
  }): Promise<Excursion[]> {
    const cacheKey = this.buildCacheKey('excursions', params)
    const cached = cache.get(cacheKey)
    if (cached) return cached

    const queryParams = new URLSearchParams()
    if (params?.category) queryParams.append('category', params.category)
    if (params?.skip) queryParams.append('skip', params.skip.toString())
    if (params?.limit) queryParams.append('limit', params.limit.toString())

    const queryString = queryParams.toString()
    const endpoint = queryString ? `/excursions?${queryString}` : '/excursions'

    const response = await this.request<Excursion[]>(endpoint)
    cache.set(cacheKey, response, 2 * 60 * 1000)
    return response
  }

  async getExcursion(id: number): Promise<Excursion> {
    const cacheKey = `excursion:${id}`
    const cached = cache.get(cacheKey)
    if (cached) return cached

    const response = await this.request<Excursion>(`/excursions/${id}`)
    cache.set(cacheKey, response)
    return response
  }

  async createExcursion(excursion: ExcursionCreate): Promise<Excursion> {
    const response = await this.request<Excursion>('/excursions', {
      method: 'POST',
      headers: {
        ...this.getAuthHeaders(),
      },
      body: JSON.stringify(excursion),
    })

    this.invalidateExcursionCache()
    return response
  }

  async updateExcursion(id: number, excursion: ExcursionUpdate): Promise<Excursion> {
    const response = await this.request<Excursion>(`/excursions/${id}`, {
      method: 'PUT',
      headers: {
        ...this.getAuthHeaders(),
      },
      body: JSON.stringify(excursion),
    })

    this.invalidateExcursionCache(id)
    return response
  }

  async deleteExcursion(id: number): Promise<void> {
    await this.request(`/excursions/${id}`, {
      method: 'DELETE',
      headers: {
        ...this.getAuthHeaders(),
      },
    })

    this.invalidateExcursionCache(id)
  }

  async getExcursionsByCategory(category: string): Promise<Excursion[]> {
    const cacheKey = `excursions_category:${category}`
    const cached = cache.get(cacheKey)
    if (cached) return cached

    const response = await this.request<Excursion[]>(`/excursions/category/${category}`)
    cache.set(cacheKey, response, 2 * 60 * 1000)
    return response
  }

  async searchExcursions(query: string): Promise<Excursion[]> {
    const cacheKey = `excursions_search:${query}`
    const cached = cache.get(cacheKey)
    if (cached) return cached

    const response = await this.request<Excursion[]>(
      `/excursions/search/?q=${encodeURIComponent(query)}`,
    )
    cache.set(cacheKey, response, 2 * 60 * 1000)
    return response
  }

  async toggleExcursionActive(id: number): Promise<Excursion> {
    const response = await this.request<Excursion>(`/excursions/${id}/toggle-active`, {
      method: 'PATCH',
      headers: {
        ...this.getAuthHeaders(),
      },
    })

    this.invalidateExcursionCache(id)
    return response
  }

  async addPeopleToExcursion(id: number, peopleCount: number): Promise<Excursion> {
    const endpoint = `/excursions/${id}/add_people?people_count=${peopleCount}`

    const response = await this.request<Excursion>(endpoint, {
      method: 'PATCH',
      headers: {
        ...this.getAuthHeaders(),
      },
    })

    this.invalidateExcursionCache(id)
    return response
  }

  async changeBusNumber(id: number, busNumber: number): Promise<Excursion> {
    const response = await this.request<Excursion>(
      `/excursions/${id}/bus-number?bus_number=${busNumber}`,
      {
        method: 'PUT',
        headers: {
          ...this.getAuthHeaders(),
        },
      }
    )

    this.invalidateExcursionCache(id)
    return response
  }

  async saveImage(imageFile: File): Promise<string> {
    try {
      const formData = new FormData()
      formData.append('image_file', imageFile)

      const response = await fetch(`${this.API_BASE_URL}/excursions/save_image`, {
        method: 'POST',
        headers: {
          ...this.getAuthHeaders(),
        },
        body: formData,
      })

      if (!response.ok) {
        let errorMessage = `HTTP error! status: ${response.status}`
        try {
          const errorData = await response.json()
          errorMessage =
            typeof errorData.detail === 'string'
              ? errorData.detail
              : JSON.stringify(errorData.detail)
        } catch {}
        throw new Error(errorMessage)
      }

      return await response.json()
    } catch (error) {
      console.error('Error uploading image:', error)
      throw error
    }
  }

  async getExcursionFull(id: number): Promise<ExcursionFullInfo> {
    const cacheKey = `excursion_full:${id}`
    const cached = cache.get(cacheKey)
    if (cached) return cached

    const response = await this.request<ExcursionFullInfo>(`/excursions/${id}/full`)
    cache.set(cacheKey, response)
    return response
  }

  async getExcursionDetails(excursionId: number): Promise<ExcursionDetails> {
    const cacheKey = `excursion_details:${excursionId}`
    const cached = cache.get(cacheKey)
    if (cached) return cached

    const response = await this.request<ExcursionDetails>(`/excursions/${excursionId}/details`)
    cache.set(cacheKey, response)
    return response
  }

  async createExcursionDetails(
    excursionId: number,
    details: ExcursionDetailsCreate,
  ): Promise<ExcursionDetails> {
    const response = await this.request<ExcursionDetails>(`/excursions/${excursionId}/details`, {
      method: 'POST',
      headers: {
        ...this.getAuthHeaders(),
      },
      body: JSON.stringify(details),
    })

    this.invalidateExcursionCache(excursionId)
    return response
  }

  async updateExcursionDetails(
    excursionId: number,
    details: ExcursionDetailsUpdate,
  ): Promise<ExcursionDetails> {
    const response = await this.request<ExcursionDetails>(`/excursions/${excursionId}/details`, {
      method: 'PUT',
      headers: {
        ...this.getAuthHeaders(),
      },
      body: JSON.stringify(details),
    })

    this.invalidateExcursionCache(excursionId)
    return response
  }

  async deleteExcursionDetails(excursionId: number): Promise<void> {
    await this.request(`/excursions/${excursionId}/details`, {
      method: 'DELETE',
      headers: {
        ...this.getAuthHeaders(),
      },
    })

    this.invalidateExcursionCache(excursionId)
  }
}
