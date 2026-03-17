import { useRef, useEffect } from 'react'
import type { SortAlgorithm } from '../types'

export const useAudio = (soundEnabled: boolean, activeAlgorithm: SortAlgorithm) => {
  const audioContextRef = useRef<AudioContext | null>(null)

  const ensureAudioContext = () => {
    if (!soundEnabled) return null
    if (typeof window === 'undefined') return null
    if (!audioContextRef.current) {
      type WindowWithWebkit = typeof window & { webkitAudioContext?: typeof AudioContext }
      const AC = (window as WindowWithWebkit).webkitAudioContext ?? AudioContext
      audioContextRef.current = new AC()
    }
    if (audioContextRef.current && audioContextRef.current.state === 'suspended') {
      void audioContextRef.current.resume()
    }
    return audioContextRef.current
  }

  const playStepSound = (valueRatio: number) => {
    const ctx = ensureAudioContext()
    if (!ctx) return
    const osc = ctx.createOscillator()
    const gain = ctx.createGain()
    const baseFreq = activeAlgorithm.tone === 'sharp' ? 400 : 200
    const range = activeAlgorithm.tone === 'sharp' ? 900 : 600
    osc.type = activeAlgorithm.tone === 'sharp' ? 'square' : 'sine'
    osc.frequency.value = baseFreq + valueRatio * range
    osc.connect(gain)
    gain.connect(ctx.destination)
    const now = ctx.currentTime
    gain.gain.setValueAtTime(0.001, now)
    gain.gain.exponentialRampToValueAtTime(0.16, now + 0.01)
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.06)
    osc.start(now)
    osc.stop(now + 0.08)
  }

  const playCompleteSound = () => {
    const ctx = ensureAudioContext()
    if (!ctx) return
    const gain = ctx.createGain()
    gain.connect(ctx.destination)
    const createTone = (offset: number, freq: number) => {
      const osc = ctx.createOscillator()
      osc.type = 'triangle'
      osc.frequency.value = freq
      osc.connect(gain)
      const start = ctx.currentTime + offset
      const stop = start + 0.12
      gain.gain.setValueAtTime(0.001, start)
      gain.gain.exponentialRampToValueAtTime(0.2, start + 0.02)
      gain.gain.exponentialRampToValueAtTime(0.001, stop)
      osc.start(start)
      osc.stop(stop + 0.02)
    }
    createTone(0, 440)
    createTone(0.12, 660)
    createTone(0.24, 880)
  }

  useEffect(() => {
    return () => {
      if (audioContextRef.current) audioContextRef.current.close()
    }
  }, [])

  return {
    playStepSound,
    playCompleteSound,
  }
}
