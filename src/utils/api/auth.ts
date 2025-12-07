import { BaseApi } from './base'
import type { LoginData, TokenResponse, User } from '@/types/user'

export class AuthApi extends BaseApi {
  async login(loginData: LoginData): Promise<TokenResponse> {
    return await this.request<TokenResponse>('/login', {
      method: 'POST',
      body: JSON.stringify(loginData),
    })
  }

  async getCurrentUser(): Promise<User> {
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

  async checkAdminAccess(): Promise<boolean> {
    try {
      const user = await this.getCurrentUser()
      return user.is_superuser
    } catch {
      return false
    }
  }

  logout(): void {
    localStorage.removeItem('access_token')
    localStorage.removeItem('token_type')
    window.location.href = '/login'
  }

  isAuthenticated(): boolean {
    return !!localStorage.getItem('access_token')
  }
}
