<script setup lang="ts">
import { useWorkOrderStore } from '../../stores/workorders'
import { useAssetStore } from '../../stores/assets'
import { computed, ref } from 'vue'
import { BaseCard, DataTable, FilterPanel, StatusBadge } from '../shared/ui'

const woStore = useWorkOrderStore()
const assetStore = useAssetStore()

// Filtros
const statusFilter = ref<string>('')
const assetFilter = ref<string>('')
const typeFilter = ref<string>('')
const dateFrom = ref<string>('')
const dateTo = ref<string>('')

// Dados filtrados
const filteredWorkOrders = computed(() => {
  return woStore.workOrders.filter(order => {
    const matchesStatus = !statusFilter.value || order.status === statusFilter.value
    const matchesAsset = !assetFilter.value || order.assetId === assetFilter.value
    const matchesType = !typeFilter.value || order.type === typeFilter.value

    // Filtro de data (usando createdAt ou startedAt)
    const orderDate = order.startedAt || order.createdAt
    const matchesDateFrom = !dateFrom.value || (orderDate && orderDate >= dateFrom.value)
    const matchesDateTo = !dateTo.value || (orderDate && orderDate <= dateTo.value + 'T23:59:59')

    return matchesStatus && matchesAsset && matchesType && matchesDateFrom && matchesDateTo
  })
})

// Configuração das colunas da tabela
const columns = [
  {
    key: 'code',
    label: 'Código OS',
    sortable: true,
    format: (value: string, item: any) => value || item.id.substring(0, 8)
  },
  {
    key: 'title',
    label: 'Título',
    sortable: true
  },
  {
    key: 'assetId',
    label: 'Ativo',
    format: (value: string) => value ? assetStore.byId(value)?.name || '-' : '-'
  },
  {
    key: 'status',
    label: 'Status'
  },
  {
    key: 'type',
    label: 'Tipo',
    format: (value: string) => {
      const labels = {
        corrective: 'Corretiva',
        preventive: 'Preventiva',
        predictive: 'Preditiva',
        inspection: 'Inspeção'
      }
      return labels[value as keyof typeof labels] || value
    }
  },
  {
    key: 'priority',
    label: 'Prioridade',
    format: (value: string) => {
      const labels = {
        low: 'Baixa',
        medium: 'Média',
        high: 'Alta',
        critical: 'Crítica'
      }
      return labels[value as keyof typeof labels] || value
    }
  },
  {
    key: 'startedAt',
    label: 'Data Início',
    sortable: true,
    format: (value: string) => value ? new Date(value).toLocaleDateString('pt-BR') : '-'
  },
  {
    key: 'completedAt',
    label: 'Data Fim',
    sortable: true,
    format: (value: string) => value ? new Date(value).toLocaleDateString('pt-BR') : '-'
  },
  {
    key: 'createdAt',
    label: 'Criado em',
    sortable: true,
    format: (value: string) => value ? new Date(value).toLocaleDateString('pt-BR') : '-'
  }
]

// Configuração dos filtros
const filters = [
  {
    key: 'status',
    label: 'Status',
    type: 'select',
    options: [
      { value: '', label: 'Todos' },
      { value: 'open', label: 'Aberto' },
      { value: 'in_progress', label: 'Em Progresso' },
      { value: 'paused', label: 'Pausado' },
      { value: 'completed', label: 'Concluído' },
      { value: 'canceled', label: 'Cancelado' }
    ],
    modelValue: statusFilter
  },
  {
    key: 'assetId',
    label: 'Ativo',
    type: 'select',
    options: [
      { value: '', label: 'Todos' },
      ...assetStore.assets.map(asset => ({ value: asset.id, label: asset.name }))
    ],
    modelValue: assetFilter
  },
  {
    key: 'type',
    label: 'Tipo',
    type: 'select',
    options: [
      { value: '', label: 'Todos' },
      { value: 'corrective', label: 'Corretiva' },
      { value: 'preventive', label: 'Preventiva' },
      { value: 'predictive', label: 'Preditiva' },
      { value: 'inspection', label: 'Inspeção' }
    ],
    modelValue: typeFilter
  },
  {
    key: 'dateFrom',
    label: 'Data Inicial',
    type: 'date',
    modelValue: dateFrom
  },
  {
    key: 'dateTo',
    label: 'Data Final',
    type: 'date',
    modelValue: dateTo
  }
]

// Estatísticas
const stats = computed(() => {
  const total = filteredWorkOrders.value.length
  const completed = filteredWorkOrders.value.filter(wo => wo.status === 'completed').length
  const inProgress = filteredWorkOrders.value.filter(wo => wo.status === 'in_progress').length
  const open = filteredWorkOrders.value.filter(wo => wo.status === 'open').length

  return { total, completed, inProgress, open }
})
</script>

<template>
  <div class="work-order-history">
    <BaseCard class="history-header">
      <template #header>
        <div class="header-content">
          <h1 class="page-title">📋 Histórico de Ordens de Serviço</h1>
          <p class="page-subtitle">Acompanhe todas as ordens de serviço do sistema</p>
        </div>
      </template>

      <!-- Estatísticas -->
      <div class="stats-grid">
        <div class="stat-card">
          <div class="stat-icon">📊</div>
          <div class="stat-content">
            <div class="stat-value">{{ stats.total }}</div>
            <div class="stat-label">Total de OS</div>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-icon">✅</div>
          <div class="stat-content">
            <div class="stat-value">{{ stats.completed }}</div>
            <div class="stat-label">Concluídas</div>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-icon">🔄</div>
          <div class="stat-content">
            <div class="stat-value">{{ stats.inProgress }}</div>
            <div class="stat-label">Em Andamento</div>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-icon">⏳</div>
          <div class="stat-content">
            <div class="stat-value">{{ stats.open }}</div>
            <div class="stat-label">Abertas</div>
          </div>
        </div>
      </div>
    </BaseCard>

    <!-- Filtros -->
    <BaseCard class="filters-section">
      <template #header>
        <h3>🔍 Filtros</h3>
      </template>
      <div class="filters-grid">
        <div class="filter-group">
          <label>Status</label>
          <select v-model="statusFilter" class="filter-select">
            <option value="">Todos</option>
            <option value="open">Aberto</option>
            <option value="in_progress">Em Progresso</option>
            <option value="paused">Pausado</option>
            <option value="completed">Concluído</option>
            <option value="canceled">Cancelado</option>
          </select>
        </div>
        <div class="filter-group">
          <label>Ativo</label>
          <select v-model="assetFilter" class="filter-select">
            <option value="">Todos</option>
            <option v-for="asset in assetStore.assets" :key="asset.id" :value="asset.id">
              {{ asset.name }}
            </option>
          </select>
        </div>
        <div class="filter-group">
          <label>Tipo</label>
          <select v-model="typeFilter" class="filter-select">
            <option value="">Todos</option>
            <option value="corrective">Corretiva</option>
            <option value="preventive">Preventiva</option>
            <option value="predictive">Preditiva</option>
            <option value="inspection">Inspeção</option>
          </select>
        </div>
        <div class="filter-group">
          <label>Data Inicial</label>
          <input type="date" v-model="dateFrom" class="filter-input">
        </div>
        <div class="filter-group">
          <label>Data Final</label>
          <input type="date" v-model="dateTo" class="filter-input">
        </div>
      </div>
    </BaseCard>

    <!-- Tabela de dados -->
    <BaseCard class="data-section">
      <template #header>
        <div class="table-header">
          <h3>📋 Ordens de Serviço</h3>
          <div class="table-info">
            {{ filteredWorkOrders.length }} registros encontrados
          </div>
        </div>
      </template>

      <DataTable
        :data="filteredWorkOrders"
        :columns="columns"
        :items-per-page="15"
        empty-message="Nenhuma ordem de serviço encontrada com os filtros aplicados"
        class="work-orders-table"
      >
        <template #status="{ value }">
          <StatusBadge :status="value" type="workorder" readonly />
        </template>
      </DataTable>
    </BaseCard>
  </div>
</template>

<style scoped>
.work-order-history {
  padding: 1.5rem;
  max-width: 1400px;
  margin: 0 auto;
  gap: 1.5rem;
  display: flex;
  flex-direction: column;
}

.history-header {
  margin-bottom: 1rem;
}

.header-content {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.page-title {
  font-size: 2rem;
  font-weight: 700;
  color: var(--color-text-primary);
  margin: 0;
}

.page-subtitle {
  color: var(--color-text-secondary);
  font-size: 1rem;
  margin: 0;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
  margin-top: 1rem;
}

.stat-card {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem;
  background: var(--color-background-secondary);
  border-radius: 8px;
  border: 1px solid var(--color-border);
}

.stat-icon {
  font-size: 2rem;
  opacity: 0.8;
}

.stat-content {
  flex: 1;
}

.stat-value {
  font-size: 1.5rem;
  font-weight: 700;
  color: var(--color-primary);
}

.stat-label {
  font-size: 0.875rem;
  color: var(--color-text-secondary);
  margin-top: 0.25rem;
}

.filters-section {
  margin-bottom: 1rem;
}

.data-section {
  flex: 1;
}

.table-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 1rem;
}

.table-header h3 {
  margin: 0;
  font-size: 1.25rem;
  font-weight: 600;
}

.table-info {
  font-size: 0.875rem;
  color: var(--color-text-secondary);
  background: var(--color-background-secondary);
  padding: 0.5rem 1rem;
  border-radius: 6px;
  border: 1px solid var(--color-border);
}

.work-orders-table {
  margin-top: 1rem;
}

/* Filtros */
.filters-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
}

.filter-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.filter-group label {
  font-weight: 500;
  color: var(--color-text-primary);
  font-size: 0.875rem;
}

.filter-select,
.filter-input {
  padding: 0.75rem;
  border: 1px solid var(--color-border);
  border-radius: 6px;
  background: var(--color-background);
  color: var(--color-text-primary);
  font-size: 0.875rem;
  transition: border-color 0.2s ease, box-shadow 0.2s ease;
}

.filter-select:focus,
.filter-input:focus {
  outline: none;
  border-color: var(--color-primary);
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

/* Responsividade */
@media (max-width: 768px) {
  .work-order-history {
    padding: 1rem;
  }

  .page-title {
    font-size: 1.5rem;
  }

  .stats-grid {
    grid-template-columns: 1fr;
  }

  .stat-card {
    padding: 0.75rem;
  }

  .table-header {
    flex-direction: column;
    align-items: stretch;
  }

  .table-info {
    text-align: center;
  }

  .filters-grid {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 480px) {
  .work-order-history {
    padding: 0.5rem;
  }

  .stat-card {
    flex-direction: column;
    text-align: center;
    gap: 0.5rem;
  }

  .stat-icon {
    font-size: 1.5rem;
  }

  .stat-value {
    font-size: 1.25rem;
  }
}
</style>