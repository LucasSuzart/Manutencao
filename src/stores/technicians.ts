import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { Technician, ID } from '../types/core'
import { nowIso } from '../modules/shared/date'
import { v4 as uuid } from 'uuid'

export const useTechnicianStore = defineStore('technicians', () => {
  const technicians = ref<Technician[]>([])

  function add(tech: Omit<Technician, 'id' | 'createdAt' | 'updatedAt'>) {
    const now = nowIso()
    technicians.value.push({ ...tech, id: uuid(), createdAt: now, updatedAt: now })
  }

  function update(id: ID, patch: Partial<Technician>) {
    const idx = technicians.value.findIndex(t => t.id === id)
    if (idx >= 0) technicians.value[idx] = { ...technicians.value[idx], ...patch, updatedAt: nowIso() }
  }

  const active = computed(() => technicians.value.filter(t => t.active))
  const byId = (id: ID) => technicians.value.find(t => t.id === id)

  return { technicians, add, update, active, byId }
})
