import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { v4 as uuid } from 'uuid'
import type { ID, Location } from '../types/core'
import { nowIso } from '../modules/shared/date'

export const useLocationStore = defineStore('locations', () => {
  const locations = ref<Location[]>([])

  function add(location: Omit<Location, 'id' | 'createdAt' | 'updatedAt' | 'children'>) {
    const now = nowIso()
    const newLoc: Location = { ...location, id: uuid(), createdAt: now, updatedAt: now, children: [] }
    locations.value.push(newLoc)
    return newLoc
  }

  function update(id: ID, patch: Partial<Location>) {
    const idx = locations.value.findIndex((l: Location) => l.id === id)
    if (idx >= 0) {
      locations.value[idx] = { ...locations.value[idx], ...patch, updatedAt: nowIso() }
    }
  }

  function remove(id: ID) {
    const idx = locations.value.findIndex((l: Location) => l.id === id)
    if (idx >= 0) locations.value.splice(idx, 1)
  }

  const byId = (id: ID) => locations.value.find((l: Location) => l.id === id)

  function addChild(parentId: ID, child: Omit<Location, 'id' | 'createdAt' | 'updatedAt' | 'children'>) {
    const parent = byId(parentId)
    if (!parent) return null
    const now = nowIso()
    const newChild: Location = { ...child, id: uuid(), createdAt: now, updatedAt: now, children: [] }
    parent.children = parent.children || []
    parent.children.push(newChild)
    // also keep flat list for search convenience
    locations.value.push(newChild)
    return newChild
  }

  const tree = computed(() => {
    // build tree from flat list: roots are those without parentId
    const map = new Map<string, Location & { children: Location[] }>()
    
    // Primeiro, crie cópias de todas as localizações com arrays children vazios
    locations.value.forEach((l: Location) => {
      map.set(l.id, { 
        ...l, 
        children: [] // Inicialmente, todos têm children vazios
      })
    })
    
    // Em seguida, preencha a relação pai-filho
    const roots: (Location & { children: Location[] })[] = []
    
    locations.value.forEach((l: Location) => {
      if (l.parentId) {
        const parent = map.get(l.parentId)
        if (parent) {
          // Não adiciona o filho se ele já estiver nos filhos (evita duplicação)
          if (!parent.children.some(child => child.id === l.id)) {
            const childNode = map.get(l.id)
            if (childNode) {
              parent.children.push(childNode)
            }
          }
        } else {
          // Se o pai não for encontrado, considere como raiz
          roots.push(map.get(l.id)!)
        }
      } else {
        // É uma raiz (não tem pai)
        roots.push(map.get(l.id)!)
      }
    })
    
    // Filtra as raízes para garantir que são realmente raízes (sem parentId)
    return roots.filter(node => !node.parentId)
  })

  return { locations, add, update, remove, byId, addChild, tree }
})
