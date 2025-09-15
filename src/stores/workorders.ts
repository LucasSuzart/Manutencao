import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { WorkOrder, ID, WorkOrderChecklistItem, MaintenancePlan } from '../types/core'
import { nowIso } from '../modules/shared/date'
import { v4 as uuid } from 'uuid'
import { calculateKPIs } from '../modules/shared/kpi'

export const useWorkOrderStore = defineStore('workorders', () => {
  const workOrders = ref<WorkOrder[]>([])
  const maintenancePlans = ref<MaintenancePlan[]>([])

  function create(data: Omit<WorkOrder, 'id' | 'createdAt' | 'updatedAt' | 'code' | 'costs'>) {
    const now = nowIso()
    const code = `OS-${String(workOrders.value.length + 1).padStart(5, '0')}`
    const costs = { parts: 0, labor: 0, total: 0 }
    workOrders.value.push({ ...data, id: uuid(), code, createdAt: now, updatedAt: now, costs })
  }

  function update(id: ID, patch: Partial<WorkOrder>) {
    const idx = workOrders.value.findIndex(o => o.id === id)
    if (idx >= 0) {
      const wo = { ...workOrders.value[idx], ...patch, updatedAt: nowIso() }
      // recalcula custos se partes/labor alterados
      wo.costs.parts = wo.parts.reduce((s, p) => s + p.quantity * p.unitCost, 0)
      wo.costs.labor = wo.labor.reduce((s, l) => s + l.hours * l.hourlyRate, 0)
      wo.costs.total = wo.costs.parts + wo.costs.labor
      workOrders.value[idx] = wo
    }
  }

  function toggleChecklistItem(woId: ID, itemId: ID, result?: string) {
    const wo = workOrders.value.find(o => o.id === woId)
    if (!wo) return
    const item = wo.checklist.find(i => i.id === itemId)
    if (item) {
      item.completed = !item.completed
      if (result !== undefined) item.result = result
      wo.updatedAt = nowIso()
    }
  }

  function addChecklistItem(woId: ID, description: string, mandatory = true) {
    const wo = workOrders.value.find(o => o.id === woId)
    if (!wo) return
    const item: WorkOrderChecklistItem = { id: uuid(), description, mandatory, completed: false }
    wo.checklist.push(item)
    wo.updatedAt = nowIso()
  }

  function complete(woId: ID) {
    update(woId, { status: 'completed', completedAt: nowIso() })
  }

  // Maintenance plans
  function addPlan(plan: Omit<MaintenancePlan, 'id' | 'createdAt' | 'updatedAt'>) {
    const now = nowIso()
    maintenancePlans.value.push({ ...plan, id: uuid(), createdAt: now, updatedAt: now })
  }

  function generateFromPlans(currentDateIso: string) {
    maintenancePlans.value.forEach(plan => {
      if (!plan.active) return
      if (plan.strategy === 'time' && plan.intervalDays && plan.nextDueAt && currentDateIso >= plan.nextDueAt) {
        create({
          title: plan.title,
          description: 'Geração automática do plano',
            assetId: plan.assetId,
            status: 'open',
            type: 'preventive',
            priority: 'medium',
            assignedToIds: [],
            checklist: [],
            parts: [],
            labor: [],
            costs: { parts: 0, labor: 0, total: 0 }
        } as any)
        // recalcula próxima data
        const next = new Date(currentDateIso)
        next.setDate(next.getDate() + plan.intervalDays)
        plan.nextDueAt = next.toISOString()
        plan.lastExecutionAt = currentDateIso
        plan.updatedAt = nowIso()
      }
    })
  }

  const kpis = computed(() => calculateKPIs(workOrders.value))
  const open = computed(() => workOrders.value.filter(o => o.status !== 'completed' && o.status !== 'canceled'))
  const byId = (id: ID) => workOrders.value.find(o => o.id === id)

  return {
    workOrders,
    maintenancePlans,
    create,
    update,
    toggleChecklistItem,
    addChecklistItem,
    complete,
    addPlan,
    generateFromPlans,
    kpis,
    open,
    byId,
  }
})
