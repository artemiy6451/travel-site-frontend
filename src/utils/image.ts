const STATICK_BASE_URL = import.meta.env.PROD
  ? '/static/uploads/'
  : 'http://192.168.0.107:8000/static/uploads'

export const handleImageError = (event: Event) => {
  const target = event.target as HTMLImageElement
  target.src = `${STATICK_BASE_URL}/default.jpg`
}
