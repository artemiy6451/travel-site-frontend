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
  ExcursionImage,
} from '@/types/excursion'

export class ExcursionsApi extends BaseApi {
  private invalidateExcursionCache(excursionId?: number) {
    cache.clearByPrefix('excursions')
    cache.clearByPrefix('excursion_full')

    if (excursionId) {
      cache.delete(`excursion:${excursionId}`)
      cache.delete(`excursion_details:${excursionId}`)
      cache.delete(`excursion_images:${excursionId}`)
    }
  }

  async getActiveExcursions(params?: {
    category?: string
    skip?: number
    limit?: number
    excursion_type?: string
  }): Promise<Excursion[]> {
    const cacheKey = this.buildCacheKey('activeExcursions', params)
    const cached = cache.get(cacheKey)
    if (cached) return cached

    const queryParams = new URLSearchParams()
    if (params?.category) queryParams.append('category', params.category)
    if (params?.skip) queryParams.append('skip', params.skip.toString())
    if (params?.limit) queryParams.append('limit', params.limit.toString())
    if (params?.excursion_type) queryParams.append('excursion_type', params.excursion_type)

    const queryString = queryParams.toString()
    const endpoint = queryString ? `/excursions/active?${queryString}` : '/excursions/active'

    const response = await this.request<Excursion[]>(endpoint)
    cache.set(cacheKey, response, 2 * 60 * 1000)
    return response
  }

  async getNotActiveExcursions(params?: {
    category?: string
    skip?: number
    limit?: number
    excursion_type?: string
  }): Promise<Excursion[]> {
    const cacheKey = this.buildCacheKey('notActiveExcursions', params)
    const cached = cache.get(cacheKey)
    if (cached) return cached

    const queryParams = new URLSearchParams()
    if (params?.category) queryParams.append('category', params.category)
    if (params?.skip) queryParams.append('skip', params.skip.toString())
    if (params?.limit) queryParams.append('limit', params.limit.toString())
    if (params?.excursion_type) queryParams.append('excursion_type', params.excursion_type)

    const queryString = queryParams.toString()
    const endpoint = queryString ? `/excursions/not_active?${queryString}` : '/excursions/not_active'

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
      },
    )

    this.invalidateExcursionCache(id)
    return response
  }

  // ========== Работа с изображениями ==========

  /**
   * Добавляет изображение к экскурсии
   */
  async addExcursionImage(excursionId: number, imageFile: File): Promise<ExcursionImage> {
    try {
      const formData = new FormData()
      formData.append('image_file', imageFile)

      const response = await fetch(`${this.API_BASE_URL}/excursions/${excursionId}/add_image`, {
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

      const image = await response.json()

      // Инвалидируем кэш изображений для этой экскурсии
      cache.delete(`excursion_images:${excursionId}`)
      this.invalidateExcursionCache(excursionId)

      return image
    } catch (error) {
      console.error('Error adding excursion image:', error)
      throw error
    }
  }

  /**
   * Получает все изображения экскурсии
   */
  async getExcursionImages(excursionId: number): Promise<ExcursionImage[]> {
    const cacheKey = `excursion_images:${excursionId}`
    const cached = cache.get(cacheKey)
    if (cached) return cached

    try {
      const response = await this.request<ExcursionImage[]>(
        `/excursions/${excursionId}/get_images`
      )
      cache.set(cacheKey, response)
      return response
    } catch (error) {
      console.error('Error getting excursion images:', error)
      // Если ручка не найдена, возвращаем пустой массив
      if (error instanceof Error && error.message.includes('404')) {
        return []
      }
      throw error
    }
  }

  /**
   * Удаляет изображение экскурсии
   */
  async deleteExcursionImage(imageId: number): Promise<boolean> {
    try {
      const response = await fetch(`${this.API_BASE_URL}/excursions/image/${imageId}`, {
        method: 'DELETE',
        headers: {
          ...this.getAuthHeaders(),
        },
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

      const result = await response.json()

      // Нужно инвалидировать кэш всех экскурсий, так как не знаем excursionId
      cache.clearByPrefix('excursion_images')
      cache.clearByPrefix('excursion_full')
      cache.clearByPrefix('excursions')

      return result === true || result === 'true'
    } catch (error) {
      console.error('Error deleting excursion image:', error)
      throw error
    }
  }

  /**
   * Массовая загрузка изображений для экскурсии
   */
  async bulkAddExcursionImages(excursionId: number, imageFiles: File[]): Promise<ExcursionImage[]> {
    const uploadPromises = imageFiles.map(file =>
      this.addExcursionImage(excursionId, file)
    )

    try {
      const results = await Promise.all(uploadPromises)

      // Инвалидируем кэш после всех загрузок
      cache.delete(`excursion_images:${excursionId}`)
      this.invalidateExcursionCache(excursionId)

      return results
    } catch (error) {
      console.error('Error bulk uploading images:', error)
      throw error
    }
  }

  // ========== Работа с детальной информацией ==========

  async getExcursionFull(id: number): Promise<ExcursionFullInfo> {
    const cacheKey = `excursion_full:${id}`
    const cached = cache.get(cacheKey)
    if (cached) return cached

    const response = await this.request<ExcursionFullInfo>(`/excursions/${id}/full`)

    // Если в ответе нет изображений, пытаемся их получить отдельно
    if (response && (!response.images || response.images.length === 0)) {
      try {
        const images = await this.getExcursionImages(id)
        response.images = images
      } catch (error) {
        console.warn('Could not load images separately:', error)
      }
    }

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

  // ========== Вспомогательные методы ==========

  /**
   * Создает экскурсию с деталями и изображениями за один запрос
   */
  async createExcursionWithDetailsAndImages(
    excursion: ExcursionCreate,
    details?: ExcursionDetailsCreate,
    images?: File[]
  ): Promise<ExcursionFullInfo> {
    // 1. Создаем экскурсию
    const newExcursion = await this.createExcursion(excursion)

    // 2. Создаем детали если есть
    if (details) {
      await this.createExcursionDetails(newExcursion.id, details)
    }

    // 3. Загружаем изображения если есть
    if (images && images.length > 0) {
      await this.bulkAddExcursionImages(newExcursion.id, images)
    }

    // 4. Получаем полную информацию
    return this.getExcursionFull(newExcursion.id)
  }

  /**
   * Обновляет экскурсию, детали и изображения
   */
  async updateExcursionComprehensive(
    excursionId: number,
    excursionUpdate: ExcursionUpdate,
    detailsUpdate?: ExcursionDetailsUpdate,
    newImages?: File[],
    deletedImageIds?: number[]
  ): Promise<ExcursionFullInfo> {
    // 1. Обновляем экскурсию
    await this.updateExcursion(excursionId, excursionUpdate)

    // 2. Обновляем детали если есть
    if (detailsUpdate) {
      try {
        await this.updateExcursionDetails(excursionId, detailsUpdate)
      } catch (error) {
        // Если деталей еще нет, создаем их
        if (error instanceof Error && error.message.includes('404')) {
          const detailsCreate: ExcursionDetailsCreate = {
            description: detailsUpdate.description || '',
            inclusions: detailsUpdate.inclusions || [],
            itinerary: detailsUpdate.itinerary || [],
            meeting_point: detailsUpdate.meeting_point || '',
            requirements: detailsUpdate.requirements || [],
            recommendations: detailsUpdate.recommendations || [],
          }
          await this.createExcursionDetails(excursionId, detailsCreate)
        } else {
          throw error
        }
      }
    }

    // 3. Добавляем новые изображения
    if (newImages && newImages.length > 0) {
      await this.bulkAddExcursionImages(excursionId, newImages)
    }

    // 4. Удаляем изображения
    if (deletedImageIds && deletedImageIds.length > 0) {
      const deletePromises = deletedImageIds.map(id =>
        this.deleteExcursionImage(id).catch(error => {
          console.error(`Error deleting image ${id}:`, error)
          return false
        })
      )
      await Promise.all(deletePromises)
    }

    // 5. Получаем обновленную информацию
    return this.getExcursionFull(excursionId)
  }
}
