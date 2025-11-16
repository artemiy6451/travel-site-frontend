// src/utils/auth.ts
import { api } from '@/utils/api'
import { type User } from '@/types/user'

export function isAuthenticated(): boolean {
  return !!localStorage.getItem('access_token')
}

export function isSuperuser(): boolean {
  const userData = localStorage.getItem('admin_user')
  if (!userData) return false

  const user: User = JSON.parse(userData)
  return user.is_superuser || false
}

export function getCurrentUser(): User | null {
  const userData = localStorage.getItem('admin_user')
  return userData ? JSON.parse(userData) : null
}

export function logout(): void {
  localStorage.removeItem('access_token')
  localStorage.removeItem('token_type')
  localStorage.removeItem('admin_user')
  window.location.href = '/login'
}

export async function login(email: string, password: string): Promise<void> {
  try {
    const response = await api.login({ email, password })

    // Сохраняем токен
    localStorage.setItem('access_token', response.access_token)
    localStorage.setItem('token_type', response.token_type)

    // Декодируем JWT токен чтобы получить информацию о superuser
    const tokenData = parseJwt(response.access_token)

    // Сохраняем информацию о пользователе
    const user: User = {
      id: tokenData.id || 0,
      email: email,
      is_superuser: tokenData.is_superuser || false,
    }
    localStorage.setItem('admin_user', JSON.stringify(user))
  } catch (error: any) {
    if (error.message?.includes('403')) {
      throw new Error('Доступ запрещен. Требуются права администратора.')
    }
    throw new Error('Ошибка авторизации. Проверьте email и пароль.')
  }
}

// Вспомогательная функция для декодирования JWT
function parseJwt(token: string): any {
  try {
    const base64Url = token.split('.')[1]
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/')
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join(''),
    )
    return JSON.parse(jsonPayload)
  } catch (error) {
    return {}
  }
}
