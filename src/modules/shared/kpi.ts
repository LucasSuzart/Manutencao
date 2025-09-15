import type { WorkOrder, KPISet } from '../../types/core'
import { diffMinutes } from './date'

// Calcula métricas principais baseado em um conjunto de ordens de serviço
export function calculateKPIs(workOrders: WorkOrder[]): KPISet {
  if (!workOrders.length) return {}
  const completed = workOrders.filter(o => o.status === 'completed' && o.startedAt && o.completedAt)
  const failures = workOrders.filter(o => o.type === 'corrective' && o.completedAt && o.startedAt)

  const mttrHours = failures.length
    ? failures.reduce((sum, o) => sum + (diffMinutes(o.startedAt, o.completedAt) || 0), 0) / failures.length / 60
    : undefined

  // Para MTBF: intervalo médio entre falhas = (tempo total operacional) / (nº de falhas)
  // Aproximação: usar diferença entre primeira e última falha dividido por (falhas - 1)
  let mtbfHours: number | undefined
  if (failures.length > 1) {
    const sorted = [...failures].sort((a, b) => (a.startedAt! > b.startedAt! ? 1 : -1))
    const first = sorted[0].startedAt!
    const last = sorted[sorted.length - 1].completedAt!
    const totalHours = (diffMinutes(first, last) || 0) / 60
    mtbfHours = totalHours / (failures.length - 1)
  }

  const totalDowntimeMinutes = failures.reduce(
    (sum, f) => sum + (f.downtimeMinutes ?? diffMinutes(f.startedAt, f.completedAt) ?? 0),
    0
  )

  // Disponibilidade (simplificada): Tempo Operacional / (Tempo Operacional + Downtime)
  // Considerando período coberto pelas OS completadas
  let availabilityPercent: number | undefined
  if (completed.length) {
    const minStart = completed.reduce((min, o) => (o.startedAt! < min ? o.startedAt! : min), completed[0].startedAt!)
    const maxEnd = completed.reduce(
      (max, o) => (o.completedAt! > max ? o.completedAt! : max),
      completed[0].completedAt!
    )
    const windowMinutes = diffMinutes(minStart, maxEnd) || 0
    const operationalMinutes = windowMinutes - totalDowntimeMinutes
    availabilityPercent = windowMinutes > 0 ? (operationalMinutes / windowMinutes) * 100 : undefined
  }

  const totalWorkOrders = workOrders.length
  const completedWorkOrders = completed.length
  const completionRatePercent = totalWorkOrders ? (completedWorkOrders / totalWorkOrders) * 100 : undefined

  const maintenanceCost = workOrders.reduce((sum, o) => sum + (o.costs?.total || 0), 0)
  
  // Tempo médio de resposta (intervalo entre planejado e início real)
  const responsiveOrders = workOrders.filter(wo => wo.startedAt && wo.plannedStart)
  const avgResponseHours = responsiveOrders.length
    ? responsiveOrders.reduce((sum, wo) => {
        const planned = new Date(wo.plannedStart!)
        const actual = new Date(wo.startedAt!)
        return sum + (actual.getTime() - planned.getTime()) / (1000 * 60 * 60)
      }, 0) / responsiveOrders.length
    : undefined

  return {
    mttrHours,
    mtbfHours,
    availabilityPercent,
    totalDowntimeMinutes,
    totalWorkOrders,
    completedWorkOrders,
    completionRatePercent,
    maintenanceCost,
    avgResponseHours,
  }
}
