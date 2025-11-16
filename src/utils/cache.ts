// Класс для кеширования
class Cache {
  private cache = new Map<string, { data: any; timestamp: number }>()
  private readonly DEFAULT_TTL = 5 * 60 * 1000 // 5 минут

  set(key: string, data: any, ttl: number = this.DEFAULT_TTL) {
    this.cache.set(key, { data, timestamp: Date.now() + ttl })
  }

  get(key: string): any | null {
    const item = this.cache.get(key)
    if (!item) return null

    if (Date.now() > item.timestamp) {
      this.cache.delete(key)
      return null
    }

    return item.data
  }

  delete(key: string) {
    this.cache.delete(key)
  }

  clearByPrefix(prefix: string) {
    const keysToDelete: string[] = []
    for (const key of this.cache.keys()) {
      if (key.startsWith(prefix)) {
        keysToDelete.push(key)
      }
    }
    keysToDelete.forEach((key) => this.cache.delete(key))
  }

  clearAll() {
    this.cache.clear()
  }
}

export const cache = new Cache()
