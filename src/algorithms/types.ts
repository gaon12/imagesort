export type Strip = {
  id: number
  originalIndex: number
  offsetPercent: number
}

export type SortStep = {
  array: Strip[]
  activeIndices: [number, number] | null
  comparisons: number
  swaps: number
}
