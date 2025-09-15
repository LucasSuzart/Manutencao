<script setup lang="ts">
type WorkOrderStatus = 'open' | 'in_progress' | 'paused' | 'completed' | 'canceled';
type AssetStatus = 'operational' | 'down' | 'maintenance' | 'retired';
type CriticalityLevel = 'low' | 'medium' | 'high';

type StatusType = 'workorder' | 'asset' | 'criticality';

const props = defineProps<{
  status: WorkOrderStatus | AssetStatus | CriticalityLevel
  type: StatusType
  readonly?: boolean
}>()

const emit = defineEmits(['change'])

function statusName(status: string, type: StatusType) {
  const names: Record<StatusType, Record<string, string>> = {
    workorder: {
      open: 'Aberto',
      in_progress: 'Em Andamento',
      paused: 'Pausado',
      completed: 'Concluído',
      canceled: 'Cancelado'
    },
    asset: {
      operational: 'Operacional',
      down: 'Parado',
      maintenance: 'Em Manutenção',
      retired: 'Desativado'
    },
    criticality: {
      low: 'Baixa',
      medium: 'Média',
      high: 'Alta'
    }
  }
  
  return names[type][status] || status
}

function statusColor(status: string, type: StatusType) {
  const colors: Record<StatusType, Record<string, string>> = {
    workorder: {
      open: 'neutral',
      in_progress: 'warning',
      paused: 'warning',
      completed: 'success',
      canceled: 'danger'
    },
    asset: {
      operational: 'success',
      down: 'danger',
      maintenance: 'warning',
      retired: 'neutral'
    },
    criticality: {
      low: 'success',
      medium: 'warning',
      high: 'danger'
    }
  }
  
  return colors[type][status] || 'neutral'
}

function changeStatus() {
  if (props.readonly || props.type !== 'workorder') return
  
  const flow = {
    open: 'in_progress',
    in_progress: 'paused',
    paused: 'in_progress',
    completed: 'completed',
    canceled: 'canceled'
  }
  
  const nextStatus = flow[props.status as WorkOrderStatus] as WorkOrderStatus
  if (nextStatus && nextStatus !== props.status) {
    emit('change', nextStatus)
  }
}
</script>

<template>
  <div class="status-badge" :class="{
    [`status-badge--${statusColor(status, type)}`]: true,
    'status-badge--readonly': readonly || type !== 'workorder'
  }" @click="changeStatus">
    {{ statusName(status, type) }}
  </div>
</template>

<style scoped>
.status-badge {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: var(--spacing-xs) var(--spacing-sm);
  border-radius: var(--border-radius-sm);
  font-size: var(--font-size-xs);
  font-weight: 500;
  cursor: pointer;
  transition: background-color var(--transition-fast);
  user-select: none;
}

.status-badge--readonly {
  cursor: default;
}

.status-badge--neutral {
  background-color: #f1f5f9;
  color: #64748b;
}

.status-badge--success {
  background-color: #dcfce7;
  color: #10b981;
}

.status-badge--warning {
  background-color: #fef3c7;
  color: #f59e0b;
}

.status-badge--danger {
  background-color: #fee2e2;
  color: #ef4444;
}

.status-badge:not(.status-badge--readonly):hover {
  opacity: 0.9;
}
</style>
