<script setup lang="ts">
import { useWorkOrderStore } from '../../stores/workorders'
import { useAssetStore } from '../../stores/assets'
import { useTechnicianStore } from '../../stores/technicians'
import { computed, ref, onMounted } from 'vue'
import { RouterLink } from 'vue-router'
import { Button, DataTable, BaseCard, StatusBadge, PriorityBadge, Modal, Alert } from '../shared/ui'
import CreateWorkOrderForm from './CreateWorkOrderForm.vue'
import EditWorkOrderForm from './EditWorkOrderForm.vue'

const woStore = useWorkOrderStore()
const assetStore = useAssetStore()
const teamStore = useTechnicianStore()

// Estados
const showCreateForm = ref(false)
const showFilters = ref(false)
const selectedWorkOrder = ref<any>(null)
const showEditModal = ref(false)

// Filtros
const statusFilter = ref<string>('')
const typeFilter = ref<string>('')
const priorityFilter = ref<string>('')
const assetFilter = ref<string>('')
const assignedFilter = ref<string>('')

// Dados filtrados
const filteredWorkOrders = computed(() => {
  return woStore.workOrders.filter(wo => {
    const matchesStatus = !statusFilter.value || wo.status === statusFilter.value
    const matchesType = !typeFilter.value || wo.type === typeFilter.value
    const matchesPriority = !priorityFilter.value || wo.priority === priorityFilter.value
    const matchesAsset = !assetFilter.value || wo.assetId === assetFilter.value
    const matchesAssigned = !assignedFilter.value ||
      (wo.assignedToIds && wo.assignedToIds.includes(assignedFilter.value))

    return matchesStatus && matchesType && matchesPriority && matchesAsset && matchesAssigned
  })
})

// Estatísticas
const stats = computed(() => {
  const total = filteredWorkOrders.value.length
  const open = filteredWorkOrders.value.filter(wo => wo.status === 'open').length
  const inProgress = filteredWorkOrders.value.filter(wo => wo.status === 'in_progress').length
  const completed = filteredWorkOrders.value.filter(wo => wo.status === 'completed').length
  const overdue = filteredWorkOrders.value.filter(wo => {
    return wo.status !== 'completed' && wo.status !== 'canceled' &&
           wo.plannedEnd && new Date(wo.plannedEnd) < new Date()
  }).length

  return { total, open, inProgress, completed, overdue }
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
    format: (value: string) => value,
    component: StatusBadge,
    props: { type: 'workorder' }
  },
  {
    key: 'priority',
    label: 'Prioridade',
    format: (value: string) => value,
    component: 'PriorityBadge'
  },
  {
    key: 'assignedToIds',
    label: 'Responsável',
    format: (value: any[]) => {
      if (!value || value.length === 0) return '-'
      const technician = teamStore.technicians.find((t: any) => t.id === value[0])
      return technician ? technician.name : '-'
    }
  },
  {
    key: 'plannedStart',
    label: 'Planejado',
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

// Ações da tabela
function editWorkOrder(workOrder: any) {
  selectedWorkOrder.value = workOrder
  showEditModal.value = true
}

function deleteWorkOrder(workOrder: any) {
  if (confirm(`Tem certeza que deseja excluir a OS ${workOrder.code}?`)) {
    // Implementar exclusão se necessário
    console.log('Exclusão não implementada ainda:', workOrder.id)
  }
}

function duplicateWorkOrder(workOrder: any) {
  const newWorkOrder = {
    ...workOrder,
    id: undefined,
    code: undefined,
    title: `${workOrder.title} (Cópia)`,
    status: 'open',
    createdAt: new Date().toISOString(),
    startedAt: undefined,
    completedAt: undefined,
    checklist: workOrder.checklist?.map((item: any) => ({
      ...item,
      id: Date.now().toString() + Math.random(),
      completed: false
    })) || []
  }
  woStore.create(newWorkOrder)
}

function clearFilters() {
  statusFilter.value = ''
  typeFilter.value = ''
  priorityFilter.value = ''
  assetFilter.value = ''
  assignedFilter.value = ''
}

onMounted(() => {
  // Carregar dados se necessário
})
</script>

<template>
  <div class="work-orders-page">
    <!-- Header -->
    <div class="page-header">
      <div class="header-content">
        <h1 class="page-title">📋 Ordens de Serviço</h1>
        <p class="page-subtitle">Gerencie todas as ordens de serviço do sistema de manutenção</p>
      </div>
      <div class="header-actions">
        <RouterLink to="/os/calendario">
          <Button variant="secondary">
            📅 Calendário
          </Button>
        </RouterLink>
        <Button variant="secondary" @click="showFilters = !showFilters">
          🔍 Filtros
        </Button>
        <Button variant="primary" @click="showCreateForm = true">
          ➕ Nova OS
        </Button>
      </div>
    </div>

    <!-- Alertas -->
    <Alert
      v-if="stats.overdue > 0"
      type="warning"
      title="⚠️ Ordens de Serviço Atrasadas"
      class="alert-section"
    >
      Existem <strong>{{ stats.overdue }}</strong> ordens de serviço com prazo vencido que precisam de atenção imediata.
    </Alert>

    <!-- Cards de Estatísticas -->
    <BaseCard class="stats-section">
      <template #header>
        <h3>📊 Estatísticas das Ordens de Serviço</h3>
      </template>
      <div class="stats-grid">
        <div class="stat-card total">
          <div class="stat-icon">📊</div>
          <div class="stat-content">
            <div class="stat-value">{{ stats.total }}</div>
            <div class="stat-label">Total de OS</div>
          </div>
        </div>
        <div class="stat-card open">
          <div class="stat-icon">🟡</div>
          <div class="stat-content">
            <div class="stat-value">{{ stats.open }}</div>
            <div class="stat-label">Abertas</div>
          </div>
        </div>
        <div class="stat-card in-progress">
          <div class="stat-icon">🔄</div>
          <div class="stat-content">
            <div class="stat-value">{{ stats.inProgress }}</div>
            <div class="stat-label">Em Andamento</div>
          </div>
        </div>
        <div class="stat-card completed">
          <div class="stat-icon">✅</div>
          <div class="stat-content">
            <div class="stat-value">{{ stats.completed }}</div>
            <div class="stat-label">Concluídas</div>
          </div>
        </div>
      </div>
    </BaseCard>

    <!-- Filtros Expansíveis -->
    <BaseCard v-if="showFilters" class="filters-section">
      <template #header>
        <h3>🔍 Filtros Avançados</h3>
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
          <label>Tipo</label>
          <select v-model="typeFilter" class="filter-select">
            <option value="">Todos</option>
            <option value="corrective">Corretiva</option>
            <option value="preventive">Preventiva</option>
            <option value="predictive">Preditiva</option>
            <option value="inspection">Inspeção</option>
            <option value="improvement">Melhoria</option>
          </select>
        </div>
        <div class="filter-group">
          <label>Prioridade</label>
          <select v-model="priorityFilter" class="filter-select">
            <option value="">Todas</option>
            <option value="low">Baixa</option>
            <option value="medium">Média</option>
            <option value="high">Alta</option>
            <option value="critical">Crítica</option>
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
          <label>Responsável</label>
          <select v-model="assignedFilter" class="filter-select">
            <option value="">Todos</option>
            <option v-for="technician in teamStore.technicians" :key="technician.id" :value="technician.id">
              {{ technician.name }}
            </option>
          </select>
        </div>
        <div class="filter-actions">
          <Button variant="secondary" @click="clearFilters">
            🗑️ Limpar
          </Button>
        </div>
      </div>
    </BaseCard>

    <!-- Tabela de Ordens de Serviço -->
    <BaseCard class="workorders-section">
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
        :items-per-page="10"
        searchable
        sortable
        striped
        hoverable
        empty-message="Nenhuma ordem de serviço encontrada com os filtros aplicados"
        class="workorders-table"
      >
        <template #cell-code="{ value, item }">
          <RouterLink :to="`/workorders/${item.id}`" class="workorder-link">
            {{ value || item.id.substring(0, 8) }}
          </RouterLink>
        </template>

        <template #cell-status="{ value }">
          <StatusBadge :status="value" type="workorder" readonly />
        </template>

        <template #cell-priority="{ value }">
          <PriorityBadge :priority="value" />
        </template>

        <template #actions="{ item }">
          <div class="action-buttons">
            <Button variant="secondary" size="sm" @click="editWorkOrder(item)">
              ✏️ Editar
            </Button>
            <Button variant="secondary" size="sm" @click="duplicateWorkOrder(item)">
              📋 Duplicar
            </Button>
            <Button variant="danger" size="sm" @click="deleteWorkOrder(item)">
              🗑️ Excluir
            </Button>
          </div>
        </template>
      </DataTable>
    </BaseCard>

    <!-- Modal de Criação -->
    <Modal v-model="showCreateForm" title="Nova Ordem de Serviço" size="lg">
      <CreateWorkOrderForm @created="showCreateForm = false" @cancel="showCreateForm = false" />
    </Modal>

    <!-- Modal de Edição -->
    <Modal v-model="showEditModal" title="Editar Ordem de Serviço" size="lg">
      <EditWorkOrderForm
        v-if="selectedWorkOrder"
        :workOrder="selectedWorkOrder"
        @updated="showEditModal = false"
        @cancel="showEditModal = false"
      />
    </Modal>
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

.link {
  color: var(--color-accent);
  text-decoration: none;
  font-weight: 500;
}

.link:hover {
  text-decoration: underline;
}

@media (max-width: 768px) {
  .page-header {
    flex-direction: column;
    align-items: stretch;
  }

  .page-header__actions {
    justify-content: flex-start;
  }
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
@media (max-width: 1024px) {
  .main-grid {
    grid-template-columns: 1fr;
  }

  .recent-workorders-card,
  .maintenance-assets-card {
    grid-column: 1 / -1;
  }

  .stats-grid {
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  }
}

@media (max-width: 768px) {
  .work-orders-page {
    padding: 1rem;
  }

  .page-title {
    font-size: 1.5rem;
  }

  .stats-grid {
    grid-template-columns: 1fr;
  }

  .filters-grid {
    grid-template-columns: 1fr;
  }

  .table-header {
    flex-direction: column;
    align-items: stretch;
    gap: 1rem;
  }

  .table-info {
    text-align: center;
  }

  .action-buttons {
    flex-direction: column;
    gap: 0.5rem;
  }
}

@media (max-width: 480px) {
  .work-orders-page {
    padding: 0.5rem;
  }

  .stat-card,
  .metric-item {
    padding: 0.75rem;
  }

  .metric-value {
    font-size: 1rem;
  }
}

/* Estatísticas */
.stats-section {
  margin-bottom: var(--spacing-lg);
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: var(--spacing-md);
}

.stat-card {
  display: flex;
  align-items: center;
  padding: var(--spacing-lg);
  background: var(--color-background);
  border: 1px solid var(--color-border);
  border-radius: var(--border-radius-lg);
  box-shadow: var(--shadow-sm);
  transition: all 0.2s ease;
  gap: var(--spacing-md);
}

.stat-card:hover {
  box-shadow: var(--shadow-md);
  transform: translateY(-2px);
}

.stat-icon {
  font-size: 2rem;
  flex-shrink: 0;
}

.stat-content {
  flex: 1;
}

.stat-value {
  font-size: 2.5rem;
  font-weight: 700;
  color: var(--color-text-primary);
  line-height: 1;
  margin-bottom: var(--spacing-xs);
}

.stat-label {
  font-size: var(--font-size-sm);
  color: var(--color-text-secondary);
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

/* Cores específicas para cada estatística */
.stat-card.total {
  border-left: 4px solid var(--color-primary);
}

.stat-card.total .stat-icon {
  color: var(--color-primary);
}

.stat-card.open {
  border-left: 4px solid #f59e0b;
}

.stat-card.open .stat-icon {
  color: #f59e0b;
}

.stat-card.in-progress {
  border-left: 4px solid #3b82f6;
}

.stat-card.in-progress .stat-icon {
  color: #3b82f6;
}

.stat-card.completed {
  border-left: 4px solid #10b981;
}

.stat-card.completed .stat-icon {
  color: #10b981;
}

/* Responsividade para estatísticas */
@media (max-width: 768px) {
  .stats-grid {
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  }

  .stat-card {
    padding: var(--spacing-md);
  }

  .stat-value {
    font-size: 2rem;
  }

  .stat-icon {
    font-size: 1.5rem;
  }
}

@media (max-width: 480px) {
  .stats-grid {
    grid-template-columns: 1fr;
  }

  .stat-card {
    padding: var(--spacing-sm);
  }

  .stat-value {
    font-size: 1.5rem;
  }

  .stat-icon {
    font-size: 1.25rem;
  }
}
</style>
