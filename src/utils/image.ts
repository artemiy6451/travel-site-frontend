const STATIC_BASE_URL = import.meta.env.PROD
  ? '/static'
  : (import.meta.env.VITE_APP_API_URL || '') + '/static';

export const handleImageError = (event: Event) => {
  const target = event.target as HTMLImageElement
  target.src = `${STATIC_BASE_URL}/default.jpg`
}
