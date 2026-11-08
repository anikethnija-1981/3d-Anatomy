import { ORGANS, SYSTEMS, organById } from '../data/catalog.js'

export class AnatomyTree {
  constructor(systems = SYSTEMS, organs = ORGANS) {
    this.root = {
      id: 'body',
      name: 'Human body',
      children: systems.map((system) => ({
        id: system.id,
        name: system.name,
        children: organs
          .filter((organ) => organ.system === system.id)
          .map((organ) => ({
            id: organ.id,
            name: organ.name,
            children: (organ.parts || []).map((part) => ({
              id: `${organ.id}:${part.name}`,
              name: part.name,
              children: [],
            })),
          })),
      })),
    }
  }
}

class TrieNode {
  constructor() {
    this.children = new Map()
    this.ids = new Set()
  }
}

export class Trie {
  constructor() {
    this.root = new TrieNode()
  }

  insert(word, id) {
    const text = word.toLowerCase().trim()
    if (!text) return
    let node = this.root
    for (const char of text) {
      if (!node.children.has(char)) node.children.set(char, new TrieNode())
      node = node.children.get(char)
    }
    node.ids.add(id)
  }

  suggest(prefix, limit = 8) {
    const text = prefix.toLowerCase().trim()
    if (!text) return []
    let node = this.root
    for (const char of text) {
      if (!node.children.has(char)) return []
      node = node.children.get(char)
    }
    const ids = []
    const walk = (current) => {
      current.ids.forEach((id) => {
        if (!ids.includes(id)) ids.push(id)
      })
      for (const child of current.children.values()) walk(child)
    }
    walk(node)
    return ids
      .map((id) => organById.get(id))
      .filter(Boolean)
      .sort((a, b) => {
        const aStart = a.name.toLowerCase().startsWith(text) ? 0 : 1
        const bStart = b.name.toLowerCase().startsWith(text) ? 0 : 1
        if (aStart !== bStart) return aStart - bStart
        return a.name.localeCompare(b.name)
      })
      .slice(0, limit)
  }
}

export class Graph {
  constructor() {
    this.adj = new Map()
  }

  addNode(id) {
    if (!this.adj.has(id)) this.adj.set(id, [])
  }

  addEdge(from, to) {
    this.addNode(from)
    this.addNode(to)
    this.adj.get(from).push(to)
  }

  shortestPath(start, goal) {
    const queue = [start]
    const previous = new Map([[start, null]])
    while (queue.length) {
      const node = queue.shift()
      if (node === goal) break
      for (const next of this.adj.get(node) || []) {
        if (!previous.has(next)) {
          previous.set(next, node)
          queue.push(next)
        }
      }
    }
    if (!previous.has(goal)) return []
    const path = []
    for (let node = goal; node; node = previous.get(node)) path.push(node)
    path.reverse()
    return path
  }
}

export class ListNode {
  constructor(value, next = null) {
    this.value = value
    this.next = next
  }
}

export class LinkedList {
  constructor(items = []) {
    this.head = null
    let tail = null
    for (const item of items) {
      const node = new ListNode(item)
      if (!this.head) this.head = node
      else tail.next = node
      tail = node
    }
  }

  toArray() {
    const values = []
    let node = this.head
    while (node) {
      values.push(node.value)
      node = node.next
    }
    return values
  }
}

export class Stack {
  constructor() {
    this.items = []
  }

  push(value) {
    this.items.push(value)
  }

  pop() {
    return this.items.pop()
  }

  peek() {
    return this.items[this.items.length - 1]
  }

  get size() {
    return this.items.length
  }

  toArray() {
    return [...this.items]
  }
}

export class Queue {
  constructor(items = []) {
    this.items = [...items]
  }

  enqueue(value) {
    this.items.push(value)
  }

  dequeue() {
    return this.items.shift()
  }

  get size() {
    return this.items.length
  }

  get isEmpty() {
    return this.items.length === 0
  }
}

const exactMap = new Map()
export const organTrie = new Trie()

for (const organ of ORGANS) {
  const keys = [organ.name, organ.id.replaceAll('-', ' '), ...(organ.aliases || [])]
  for (const key of keys) {
    const normalized = key.toLowerCase().trim()
    if (!exactMap.has(normalized)) exactMap.set(normalized, [])
    if (!exactMap.get(normalized).some((item) => item.id === organ.id)) {
      exactMap.get(normalized).push(organ)
    }
    organTrie.insert(normalized, organ.id)
  }
}

export function exactOrgans(query) {
  return exactMap.get(query.toLowerCase().trim()) || []
}

export const anatomyTree = new AnatomyTree()

export const circulationGraph = new Graph()
const circulationEdges = [
  ['Right atrium', 'Right ventricle'],
  ['Right ventricle', 'Pulmonary arteries'],
  ['Pulmonary arteries', 'Lungs'],
  ['Lungs', 'Pulmonary veins'],
  ['Pulmonary veins', 'Left atrium'],
  ['Left atrium', 'Left ventricle'],
  ['Left ventricle', 'Aorta'],
  ['Aorta', 'Body tissues'],
  ['Body tissues', 'Venae cavae'],
  ['Venae cavae', 'Right atrium'],
]
for (const [from, to] of circulationEdges) circulationGraph.addEdge(from, to)

export const systemicReturnPath = circulationGraph.shortestPath('Left ventricle', 'Right atrium')

export const digestionPath = new LinkedList([
  'Mouth',
  'Pharynx',
  'Esophagus',
  'Stomach',
  'Small intestine',
  'Large intestine',
  'Rectum',
])
