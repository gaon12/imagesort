import type { Strip, SortStep } from './types'

type BSTNode = {
  strip: Strip
  left: BSTNode | null
  right: BSTNode | null
}

export const generateTreeSortSteps = (items: Strip[]): SortStep[] => {
  if (items.length === 0) return []
  const arr = [...items]
  const steps: SortStep[] = []
  let comparisons = 0
  let swaps = 0

  // Build BST - insertion phase
  let root: BSTNode | null = null

  const bstInsert = (node: BSTNode | null, strip: Strip): BSTNode => {
    if (!node) return { strip, left: null, right: null }
    comparisons++
    if (strip.originalIndex < node.strip.originalIndex) {
      node.left = bstInsert(node.left, strip)
    } else {
      node.right = bstInsert(node.right, strip)
    }
    return node
  }

  // Show each insertion
  for (let i = 0; i < arr.length; i++) {
    root = bstInsert(root, arr[i])
    steps.push({
      array: [...arr],
      activeIndices: i > 0 ? [0, i] : null,
      comparisons,
      swaps,
    })
  }

  // In-order traversal
  const sorted: Strip[] = []
  const inorder = (node: BSTNode | null) => {
    if (!node) return
    inorder(node.left)
    sorted.push(node.strip)
    inorder(node.right)
  }
  inorder(root)

  // Place sorted elements back into arr position by position
  const result = [...arr]
  for (let i = 0; i < sorted.length; i++) {
    const fromIdx = result.findIndex(s => s.id === sorted[i].id)
    if (fromIdx !== i) {
      comparisons++
      steps.push({
        array: [...result],
        activeIndices: [fromIdx, i],
        comparisons,
        swaps,
      })
      ;[result[fromIdx], result[i]] = [result[i], result[fromIdx]]
      swaps++
      steps.push({
        array: [...result],
        activeIndices: [fromIdx, i],
        comparisons,
        swaps,
      })
    }
  }

  return steps
}
