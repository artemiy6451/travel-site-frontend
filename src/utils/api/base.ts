import { cache } from '@/utils/cache'

const API_BASE_URL = import.meta.env.PROD
  ? '/api'
  : (import.meta.env.VITE_APP_API_URL || '');

export class BaseApi {
  protected API_BASE_URL = API_BASE_URL

  protected async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const url = `${this.API_BASE_URL}${endpoint}`

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
        cache.clearAll()
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

  protected getAuthHeaders(): HeadersInit {
    const token = localStorage.getItem('access_token')
    const tokenType = localStorage.getItem('token_type') || 'bearer'

    return token ? { Authorization: `${tokenType} ${token}` } : {}
  }

  protected buildCacheKey(prefix: string, params?: any): string {
    if (!params) return prefix
    return `${prefix}:${JSON.stringify(params)}`
  }
}
