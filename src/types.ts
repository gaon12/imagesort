import type { Strip, SortStep } from './algorithms'

export type { Strip, SortStep }

export type Theme = 'light' | 'dark'
export type ImageSourceType = 'preset' | 'upload' | 'url'
export type SortAlgorithmId =
  | 'bubble'
  | 'merge'
  | 'quick'
  | 'heap'
  | 'insertion'
  | 'selection'
  | 'shell'
  | 'cocktail'
  | 'tree'
  | 'tim'
  | 'blockMerge'
  | 'intro'
  | 'pdq'
  | 'radix'
  | 'counting'
  | 'sleep'
  | 'gravity'
  | 'stooge'
  | 'bogo'
  | 'bogobogo'

export type PresetImage = {
  id: string
  label: string
  url: string
}

export type SortAlgorithm = {
  id: SortAlgorithmId
  name: string
  description: string
  complexity: string
  tone: 'soft' | 'sharp'
  isProbabilistic?: boolean
  generateSteps: (items: Strip[]) => SortStep[]
}

export type AlgorithmDetail = {
  subtitle: string
  traits: string[]
}

export type QuickSortPivot = 'first' | 'last' | 'middle' | 'random'
