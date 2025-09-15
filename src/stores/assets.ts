import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { Asset, ID } from '../types/core'
import { nowIso } from '../modules/shared/date'
import { v4 as uuid } from 'uuid'

export const useAssetStore = defineStore('assets', () => {
  const assets = ref<Asset[]>([])

  function add(asset: Omit<Asset, 'id' | 'createdAt' | 'updatedAt'>) {
    const now = nowIso()
    assets.value.push({ ...asset, id: uuid(), createdAt: now, updatedAt: now })
  }

  function update(id: ID, patch: Partial<Asset>) {
    const idx = assets.value.findIndex(a => a.id === id)
    if (idx >= 0) {
      assets.value[idx] = { ...assets.value[idx], ...patch, updatedAt: nowIso() }
    }
  }

  function remove(id: ID) {
    const idx = assets.value.findIndex(a => a.id === id)
    if (idx >= 0) assets.value.splice(idx, 1)
  }

  const byId = (id: ID) => assets.value.find(a => a.id === id)
  const total = computed(() => assets.value.length)

  return { assets, add, update, byId, total }
})
 
