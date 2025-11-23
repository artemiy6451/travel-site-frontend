const STATICK_BASE_URL = import.meta.env.PROD
  ? '/static'
  : `http://192.168.0.108:8000/static`


export const handleImageError = (event: Event) => {
  const target = event.target as HTMLImageElement
  target.src = `${STATICK_BASE_URL}/default.jpg`
}
