import type { Strip, Theme } from './types'
import { THEME_STORAGE_KEY } from './constants'

const createBaseStrips = (stripCount: number): Strip[] =>
  Array.from({ length: stripCount }, (_, index) => ({
    id: index,
    originalIndex: index,
    offsetPercent: stripCount <= 1 ? 0 : (index / (stripCount - 1)) * 100,
  }))

export const createOrderedStrips = (stripCount: number): Strip[] => createBaseStrips(stripCount)

export const createShuffledStrips = (stripCount: number): Strip[] => {
  const shuffled = [...createBaseStrips(stripCount)]
  for (let currentIndex = shuffled.length - 1; currentIndex > 0; currentIndex -= 1) {
    const randomIndex = Math.floor(Math.random() * (currentIndex + 1))
    const temporary = shuffled[currentIndex]
    shuffled[currentIndex] = shuffled[randomIndex]
    shuffled[randomIndex] = temporary
  }

  return shuffled
}

export const formatMilliseconds = (ms: number): string => {
  if (!Number.isFinite(ms) || ms <= 0) return '0.00s'
  const s = ms / 1000
  if (s < 60) return `${s.toFixed(2)}s`
  const m = Math.floor(s / 60)
  const rs = s - m * 60
  return `${m}m ${rs.toFixed(1)}s`
}

export const getInitialTheme = (): Theme => {
  if (typeof window === 'undefined') return 'dark'
  const stored = safeStorageGetItem(THEME_STORAGE_KEY)
  if (stored === 'light' || stored === 'dark') return stored
  if (window.matchMedia?.('(prefers-color-scheme: light)').matches) return 'light'
  return 'dark'
}

export const safeStorageGetItem = (key: string): string | null => {
  if (typeof window === 'undefined') return null

  try {
    return window.localStorage.getItem(key)
  } catch {
    return null
  }
}

export const safeStorageSetItem = (key: string, value: string): boolean => {
  if (typeof window === 'undefined') return false

  try {
    window.localStorage.setItem(key, value)
    return true
  } catch {
    return false
  }
}
