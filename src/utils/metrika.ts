declare const window: any

export const sendMetrik = (action: string) => {
  if (typeof window !== 'undefined' && typeof window.ym !== 'undefined') {
    if (import.meta.env.PROD) {
      console.log('sendMetrik', action)
      window.ym(105554694, 'reachGoal', action)
    }
  }
}
