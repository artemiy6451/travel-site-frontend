import { isAuthenticated, isSuperuser } from '@/utils/auth'

export const adminGuard = () => {
  if (!isAuthenticated()) {
    return '/login'
  }

  if (!isSuperuser()) {
    // Перенаправляем на страницу с сообщением о недостатке прав
    return '/access-denied'
  }

  return true
}
