import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { InventoryItem, ID } from '../types/core'
import { nowIso } from '../modules/shared/date'
import { v4 as uuid } from 'uuid'

export const useInventoryStore = defineStore('inventory', () => {
  const items = ref<InventoryItem[]>([])

  function add(item: Omit<InventoryItem, 'id' | 'createdAt' | 'updatedAt'>) {
    const now = nowIso()
    items.value.push({ ...item, id: uuid(), createdAt: now, updatedAt: now })
  }

  function adjustQuantity(id: ID, delta: number) {
    const idx = items.value.findIndex(i => i.id === id)
    if (idx >= 0) {
      items.value[idx].currentQty += delta
      items.value[idx].updatedAt = nowIso()
    }
  }

  const lowStock = computed(() => items.value.filter(i => i.currentQty <= i.minQty))
  const byId = (id: ID) => items.value.find(i => i.id === id)

  return { items, add, adjustQuantity, lowStock, byId }
})
