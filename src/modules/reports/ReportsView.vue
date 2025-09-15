<script setup lang="ts">
import { useWorkOrderStore } from '../../stores/workorders'
import { useAssetStore } from '../../stores/assets'
import { useInventoryStore } from '../../stores/inventory'
import { ref, computed } from 'vue'
import { Button, DataTable, BaseCard, SelectField, FilterPanel, StatCard } from '../shared/ui'
import { calculateKPIs } from '../shared/kpi'

const woStore = useWorkOrderStore()
const assetStore = useAssetStore()
const inventoryStore = useInventoryStore()

// Filtros
const filters = ref({
  assetId: '',
  type: '',
  status: '',
  priority: '',
  fromDate: '',
  toDate: ''
})

// Dados filtrados
const filteredWorkOrders = computed(() => {
  return woStore.workOrders.filter(wo => {
    if (filters.value.assetId && wo.assetId !== filters.value.assetId) return false
    if (filters.value.type && wo.type !== filters.value.type) return false
    if (filters.value.status && wo.status !== filters.value.status) return false
    if (filters.value.priority && wo.priority !== filters.value.priority) return false

    if (filters.value.fromDate) {
      const fromDate = new Date(filters.value.fromDate)
      const woDate = wo.createdAt ? new Date(wo.createdAt) : new Date()
      if (woDate < fromDate) return false
    }

    if (filters.value.toDate) {
      const toDate = new Date(filters.value.toDate)
      const woDate = wo.createdAt ? new Date(wo.createdAt) : new Date()
      if (woDate > toDate) return false
    }

    return true
  })
})

// KPIs dos dados filtrados
const reportKPIs = computed(() => {
  return calculateKPIs(filteredWorkOrders.value)
})

// Opções para filtros
const assetOptions = computed(() => [
  { value: '', label: 'Todos os ativos' },
  ...assetStore.assets.map(asset => ({
    value: asset.id,
    label: asset.name
  }))
])

const typeOptions = [
  { value: '', label: 'Todos os tipos' },
  { value: 'corrective', label: 'Corretiva' },
  { value: 'preventive', label: 'Preventiva' },
  { value: 'predictive', label: 'Preditiva' },
  { value: 'inspection', label: 'Inspeção' },
  { value: 'improvement', label: 'Melhoria' }
]

const statusOptions = [
  { value: '', label: 'Todos os status' },
  { value: 'open', label: 'Aberto' },
  { value: 'in_progress', label: 'Em Progresso' },
  { value: 'paused', label: 'Pausado' },
  { value: 'completed', label: 'Concluído' },
  { value: 'canceled', label: 'Cancelado' }
]

const priorityOptions = [
  { value: '', label: 'Todas as prioridades' },
  { value: 'low', label: 'Baixa' },
  { value: 'medium', label: 'Média' },
  { value: 'high', label: 'Alta' },
  { value: 'critical', label: 'Crítica' }
]

// Colunas da tabela
const columns = [
  {
    key: 'code',
    label: 'Código OS',
    format: (value: string, item: any) => value || item.id.substring(0, 8)
  },
  {
    key: 'assetId',
    label: 'Ativo',
    format: (value: string) => value ? assetStore.byId(value)?.name : '-'
  },
  {
    key: 'type',
    label: 'Tipo',
    format: (value: string) => {
      const labels = {
        corrective: 'Corretiva',
        preventive: 'Preventiva',
        predictive: 'Preditiva',
        inspection: 'Inspeção',
        improvement: 'Melhoria'
      }
      return labels[value as keyof typeof labels] || value
    }
  },
  {
    key: 'status',
    label: 'Status',
    format: (value: string) => {
      const labels = {
        open: 'Aberto',
        in_progress: 'Em Progresso',
        paused: 'Pausado',
        completed: 'Concluído',
        canceled: 'Cancelado'
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
    format: (value: string) => value ? new Date(value).toLocaleDateString() : '-'
  },
  {
    key: 'completedAt',
    label: 'Data Fim',
    format: (value: string) => value ? new Date(value).toLocaleDateString() : '-'
  },
  {
    key: 'costs',
    label: 'Custo Total',
    format: (value: any) => `R$ ${value.total.toFixed(2)}`
  }
]

// Estatísticas de estoque
const lowStockItems = computed(() => {
  return inventoryStore.items.filter(item => item.currentQty <= item.minQty)
})

function clearFilters() {
  filters.value = {
    assetId: '',
    type: '',
    status: '',
    priority: '',
    fromDate: '',
    toDate: ''
  }
}

function exportToCSV() {
  const headers = columns.map(col => col.label).join(',')
  const rows = filteredWorkOrders.value.map(wo =>
    columns.map(col => {
      try {
        const value = wo[col.key as keyof typeof wo]
        const formattedValue = col.format ? col.format(value as any, wo) : String(value || '')
        return `"${formattedValue.replace(/"/g, '""')}"`
      } catch {
        return '""'
      }
    }).join(',')
  )

  const csv = [headers, ...rows].join('\n')
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' })
  const url = window.URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = 'relatorio-os.csv'
  a.click()
  window.URL.revokeObjectURL(url)
}
</script>

<template>
  <div class="page">
    <div class="page-header">
      <div class="page-header__content">
        <h1 class="page-title">Relatórios</h1>
        <p class="page-subtitle">Análise e relatórios de manutenção</p>
      </div>
      <div class="page-header__actions">
        <Button variant="outline" @click="exportToCSV">
          Exportar CSV
        </Button>
      </div>
    </div>

    <!-- KPIs -->
    <div class="stats-grid">
      <StatCard
        title="Total de OS"
        :value="filteredWorkOrders.length"
        :decimals="0"
      />
      <StatCard
        title="OS Concluídas"
        :value="reportKPIs.totalWorkOrders ? (reportKPIs.completedWorkOrders || 0) : 0"
        :decimals="0"
        color="success"
      />
      <StatCard
        title="MTTR"
        :value="reportKPIs.mttrHours || 0"
        unit="horas"
        color="warning"
      />
      <StatCard
        title="Custo Total"
        :value="reportKPIs.maintenanceCost || 0"
        unit="R$"
        color="primary"
      />
      <StatCard
        title="Itens com Estoque Baixo"
        :value="lowStockItems.length"
        :decimals="0"
        color="danger"
      />
    </div>

    <!-- Filtros -->
    <BaseCard title="Filtros" class="mb-lg">
      <div class="filters-grid">
        <SelectField
          v-model="filters.assetId"
          label="Ativo"
          :options="assetOptions"
        />

        <SelectField
          v-model="filters.type"
          label="Tipo"
          :options="typeOptions"
        />

        <SelectField
          v-model="filters.status"
          label="Status"
          :options="statusOptions"
        />

        <SelectField
          v-model="filters.priority"
          label="Prioridade"
          :options="priorityOptions"
        />

        <div class="form-field">
          <label class="form-field__label">Data Inicial</label>
          <input
            v-model="filters.fromDate"
            type="date"
            class="form-field__input"
          >
        </div>

        <div class="form-field">
          <label class="form-field__label">Data Final</label>
          <input
            v-model="filters.toDate"
            type="date"
            class="form-field__input"
          >
        </div>

        <div class="filters-actions">
          <Button variant="ghost" size="sm" @click="clearFilters">
            Limpar Filtros
          </Button>
        </div>
      </div>
    </BaseCard>

    <!-- Tabela de dados -->
    <BaseCard>
      <DataTable
        :data="filteredWorkOrders"
        :columns="columns"
        searchable
        sortable
        striped
        hoverable
        empty-text="Nenhuma ordem de serviço encontrada com os filtros aplicados"
      />
    </BaseCard>
  </div>
</template>

<style scoped>
.page {
  padding: var(--spacing-lg);
  max-width: 1400px;
  margin: 0 auto;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: var(--spacing-lg);
  gap: var(--spacing-md);
}

.page-header__content {
  flex: 1;
}

.page-title {
  font-size: var(--font-size-xl);
  font-weight: 700;
  margin: 0 0 var(--spacing-xs) 0;
  color: var(--color-text-primary);
}

.page-subtitle {
  font-size: var(--font-size-base);
  color: var(--color-text-secondary);
  margin: 0;
}

.page-header__actions {
  display: flex;
  gap: var(--spacing-sm);
  align-items: center;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: var(--spacing-md);
  margin-bottom: var(--spacing-lg);
}

.filters-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: var(--spacing-md);
  align-items: end;
}

.filters-actions {
  display: flex;
  justify-content: flex-end;
  align-items: flex-end;
}

.form-field {
  margin-bottom: 0;
}

.form-field__label {
  display: block;
  font-size: var(--font-size-sm);
  font-weight: 500;
  margin-bottom: var(--spacing-xs);
  color: var(--color-text-primary);
}

.form-field__input {
  width: 100%;
  padding: var(--spacing-sm) var(--spacing-md);
  border: 1px solid var(--color-border);
  border-radius: var(--border-radius-md);
  background-color: var(--color-surface);
  font-size: var(--font-size-base);
  color: var(--color-text-primary);
}

.form-field__input:focus {
  outline: none;
  border-color: var(--color-accent);
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.15);
}

.mb-lg {
  margin-bottom: var(--spacing-lg);
}

@media (max-width: 768px) {
  .filters-grid {
    grid-template-columns: 1fr;
  }

  .page-header {
    flex-direction: column;
    align-items: stretch;
  }

  .page-header__actions {
    justify-content: flex-start;
  }
}
</style>