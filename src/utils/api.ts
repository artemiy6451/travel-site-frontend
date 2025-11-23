import type {
  Excursion,
  ExcursionCreate,
  ExcursionUpdate,
  ExcursionFullInfo,
  ExcursionDetails,
  ExcursionDetailsCreate,
  ExcursionDetailsUpdate,
  ItineraryItem,
} from '@/types/excursion'
import type { LoginData, TokenResponse, User } from '@/types/user'
import { cache } from '@/utils/cache'

const API_BASE_URL = import.meta.env.PROD ? '/api' : 'http://192.168.0.108:8000'

class Api {
  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const url = `${API_BASE_URL}${endpoint}`

    const config: RequestInit = {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...this.getAuthHeaders(),
        ...options.headers,
      },
    }

    if (config.body && typeof config.body === 'object' && !(config.body instanceof FormData)) {
      config.body = JSON.stringify(config.body)
    }

    const response = await fetch(url, config)

    if (!response.ok) {
      if (response.status === 401) {
        localStorage.removeItem('access_token')
        localStorage.removeItem('token_type')
        cache.clearAll() // Очищаем кеш при logout
        window.location.href = '/login'
      }

      let errorMessage = `HTTP error! status: ${response.status}`
      try {
        const errorData = await response.json()
        console.error('Backend error details:', errorData)
        errorMessage =
          typeof errorData.detail === 'string' ? errorData.detail : JSON.stringify(errorData.detail)
      } catch {
        // Если не удалось распарсить JSON
      }

      throw new Error(errorMessage)
    }

    if (response.status === 204) {
      return {} as T
    }

    return response.json()
  }

  private getAuthHeaders(): HeadersInit {
    const token = localStorage.getItem('access_token')
    const tokenType = localStorage.getItem('token_type') || 'bearer'

    return token ? { Authorization: `${tokenType} ${token}` } : {}
  }

  // Вспомогательный метод для построения ключа кеша
  private buildCacheKey(prefix: string, params?: any): string {
    if (!params) return prefix
    return `${prefix}:${JSON.stringify(params)}`
  }

  // Метод для инвалидации кеша при изменениях
  private invalidateExcursionCache(excursionId?: number) {
    // Очищаем все связанные с экскурсиями кеши
    cache.clearByPrefix('excursions')
    cache.clearByPrefix('excursion_full')

    if (excursionId) {
      // Очищаем кеш конкретной экскурсии
      cache.delete(`excursion:${excursionId}`)
      cache.delete(`excursion_details:${excursionId}`)
      cache.delete(`excursion_inclusions:${excursionId}`)
      cache.delete(`excursion_itinerary:${excursionId}`)
      cache.delete(`excursion_requirements:${excursionId}`)
    }
  }

  // Auth methods (без кеширования)
  async login(loginData: LoginData): Promise<TokenResponse> {
    const response = await this.request<TokenResponse>('/login', {
      method: 'POST',
      body: JSON.stringify(loginData),
    })
    return response
  }

  async getCurrentUser(): Promise<User> {
    // Не кешируем текущего пользователя, так как данные могут меняться
    return await this.request<User>('/users/me', {
      headers: {
        ...this.getAuthHeaders(),
      },
    })
  }

  async register(userData: LoginData): Promise<User> {
    return await this.request<User>('/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    })
  }

  // Excursion methods с кешированием
  async getExcursions(params?: {
    category?: string
    min_price?: number
    max_price?: number
    skip?: number
    limit?: number
  }): Promise<Excursion[]> {
    const cacheKey = this.buildCacheKey('excursions', params)
    const cached = cache.get(cacheKey)
    if (cached) return cached

    const queryParams = new URLSearchParams()
    if (params?.category) queryParams.append('category', params.category)
    if (params?.min_price) queryParams.append('min_price', params.min_price.toString())
    if (params?.max_price) queryParams.append('max_price', params.max_price.toString())
    if (params?.skip) queryParams.append('skip', params.skip.toString())
    if (params?.limit) queryParams.append('limit', params.limit.toString())

    const queryString = queryParams.toString()
    const endpoint = queryString ? `/excursions?${queryString}` : '/excursions'

    const response = await this.request<Excursion[]>(endpoint)
    cache.set(cacheKey, response, 2 * 60 * 1000) // 2 минуты для списков
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

    // Инвалидируем кеш после создания
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

    // Инвалидируем кеш после обновления
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

    // Инвалидируем кеш после удаления
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

    // Инвалидируем кеш после изменения активности
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

    // Инвалидируем кеш после изменения количества людей
    this.invalidateExcursionCache(id)
    return response
  }

  // Получить полную информацию об экскурсии
  async getExcursionFull(id: number): Promise<ExcursionFullInfo> {
    const cacheKey = `excursion_full:${id}`
    const cached = cache.get(cacheKey)
    if (cached) return cached

    const response = await this.request<ExcursionFullInfo>(`/excursions/${id}/full`)
    cache.set(cacheKey, response)
    return response
  }

  // Получить детальную информацию об экскурсии
  async getExcursionDetails(excursionId: number): Promise<ExcursionDetails> {
    const cacheKey = `excursion_details:${excursionId}`
    const cached = cache.get(cacheKey)
    if (cached) return cached

    const response = await this.request<ExcursionDetails>(`/excursions/${excursionId}/details`)
    cache.set(cacheKey, response)
    return response
  }

  // Создать детальную информацию
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

    // Инвалидируем кеш после создания деталей
    this.invalidateExcursionCache(excursionId)
    return response
  }

  // Обновить детальную информацию
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

    // Инвалидируем кеш после обновления деталей
    this.invalidateExcursionCache(excursionId)
    return response
  }

  // Создать или обновить детальную информацию
  async createOrUpdateExcursionDetails(
    excursionId: number,
    details: ExcursionDetailsCreate,
  ): Promise<ExcursionDetails> {
    const response = await this.request<ExcursionDetails>(`/excursions/${excursionId}/details`, {
      method: 'PATCH',
      headers: {
        ...this.getAuthHeaders(),
      },
      body: JSON.stringify(details),
    })

    // Инвалидируем кеш после создания/обновления деталей
    this.invalidateExcursionCache(excursionId)
    return response
  }

  // Удалить детальную информацию
  async deleteExcursionDetails(excursionId: number): Promise<void> {
    await this.request(`/excursions/${excursionId}/details`, {
      method: 'DELETE',
      headers: {
        ...this.getAuthHeaders(),
      },
    })

    // Инвалидируем кеш после удаления деталей
    this.invalidateExcursionCache(excursionId)
  }

  // Получить список включений
  async getExcursionInclusions(excursionId: number): Promise<string[]> {
    const cacheKey = `excursion_inclusions:${excursionId}`
    const cached = cache.get(cacheKey)
    if (cached) return cached

    const response = await this.request<string[]>(`/excursions/${excursionId}/inclusions`)
    cache.set(cacheKey, response)
    return response
  }

  // Получить программу тура
  async getExcursionItinerary(excursionId: number): Promise<ItineraryItem[]> {
    const cacheKey = `excursion_itinerary:${excursionId}`
    const cached = cache.get(cacheKey)
    if (cached) return cached

    const response = await this.request<ItineraryItem[]>(`/excursions/${excursionId}/itinerary`)
    cache.set(cacheKey, response)
    return response
  }

  // Получить требования
  async getExcursionRequirements(excursionId: number): Promise<string[]> {
    const cacheKey = `excursion_requirements:${excursionId}`
    const cached = cache.get(cacheKey)
    if (cached) return cached

    const response = await this.request<string[]>(`/excursions/${excursionId}/requirements`)
    cache.set(cacheKey, response)
    return response
  }

  async saveImage(imageFile: File): Promise<string> {
    try {
      const formData = new FormData()
      formData.append('image_file', imageFile)

      const response = await fetch(`${API_BASE_URL}/excursions/save_image`, {
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

  async changeBusNumber(id: number, busNumber: number): Promise<Excursion> {
    const response = await this.request<Excursion>(
      `/excursions/${id}/bus-number?bus_number=${busNumber}`,
      {
        method: 'PUT',
        headers: {
          ...this.getAuthHeaders(),
        },
        body: JSON.stringify({ bus_number: busNumber }),
      })

    this.invalidateExcursionCache(id)
    return response
  }

  async checkAdminAccess(): Promise<boolean> {
    try {
      const user = await this.getCurrentUser()
      return user.is_superuser
    } catch {
      return false
    }
  }

  // Дополнительный метод для ручной очистки кеша (можно использовать в админке)
  clearCache(): void {
    cache.clearAll()
  }

  // Метод для очистки кеша конкретной экскурсии
  clearExcursionCache(excursionId: number): void {
    this.invalidateExcursionCache(excursionId)
  }
}

export const api = new Api()
