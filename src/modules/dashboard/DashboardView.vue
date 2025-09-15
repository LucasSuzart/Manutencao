<script setup lang="ts">
import { useWorkOrderStore } from '../../stores/workorders'
import { useAssetStore } from '../../stores/assets'
import { computed } from 'vue'
import { StatCard, BaseCard, Alert, StatusBadge, PriorityBadge, DataTable } from '../shared/ui'

const woStore = useWorkOrderStore()
const assetStore = useAssetStore()
const kpis = computed(() => woStore.kpis)

// Alerta para OS atrasadas
const overdueWorkOrders = computed(() => {
  return woStore.workOrders.filter(wo => {
    const isOverdue = wo.status !== 'completed' &&
                      wo.status !== 'canceled' &&
                      wo.plannedEnd &&
                      new Date(wo.plannedEnd) < new Date()
    return isOverdue
  })
})

// Ativos em manutenção
const assetsInMaintenance = computed(() => {
  return assetStore.assets.filter(asset => asset.status === 'maintenance')
})

// Ordens de serviço recentes
const recentWorkOrders = computed(() => {
  return woStore.workOrders.slice(0, 10)
})

// Configuração das colunas da tabela
const columns = [
  {
    key: 'code',
    label: 'Código',
    format: (value: string, item: any) => value || item.id.substring(0, 8)
  },
  {
    key: 'title',
    label: 'Título'
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
    key: 'plannedStart',
    label: 'Planejado',
    format: (value: string) => value ? new Date(value).toLocaleDateString('pt-BR') : '-'
  }
]
</script>

<template>
  <div class="dashboard">
    <!-- Header -->
    <div class="dashboard-header">
      <div class="header-content">
        <h1 class="dashboard-title">📊 Dashboard de Manutenção</h1>
        <p class="dashboard-subtitle">Visão geral do sistema de manutenção</p>
      </div>
    </div>

    <!-- Alertas -->
    <Alert
      v-if="overdueWorkOrders.length > 0"
      type="warning"
      title="⚠️ Atenção"
      class="alert-section"
    >
      Existem <strong>{{ overdueWorkOrders.length }}</strong> ordens de serviço atrasadas que precisam de atenção imediata.
    </Alert>

    <!-- Cards de Estatísticas -->
    <div class="stats-section">
      <div class="stats-grid">
        <StatCard
          title="⏱️ MTTR (Tempo Médio de Reparo)"
          :value="kpis.mttrHours || 0"
          unit="horas"
          color="primary"
        />
        <StatCard
          title="🔄 MTBF (Tempo Médio Entre Falhas)"
          :value="kpis.mtbfHours || 0"
          unit="horas"
          color="primary"
        />
        <StatCard
          title="✅ Disponibilidade"
          :value="kpis.availabilityPercent || 0"
          unit="%"
          color="success"
        />
        <StatCard
          title="📋 OS Abertas"
          :value="woStore.open.length"
          :decimals="0"
          color="warning"
        />
        <StatCard
          title="📊 Total de OS"
          :value="kpis.totalWorkOrders || 0"
          :decimals="0"
          color="primary"
        />
        <StatCard
          title="🎯 OS Concluídas"
          :value="woStore.workOrders.filter(wo => wo.status === 'completed').length"
          :decimals="0"
          color="success"
        />
      </div>
    </div>

    <!-- Grid Principal -->
    <div class="main-grid">
      <!-- Ordens de Serviço Recentes -->
      <BaseCard class="recent-workorders-card">
        <template #header>
          <div class="card-header">
            <h3>📋 Ordens de Serviço Recentes</h3>
            <div class="card-info">
              {{ recentWorkOrders.length }} registros
            </div>
          </div>
        </template>

        <DataTable
          :data="recentWorkOrders"
          :columns="columns"
          :items-per-page="5"
          empty-message="Nenhuma ordem de serviço encontrada"
          class="workorders-table"
        >
          <template #status="{ value }">
            <StatusBadge :status="value" type="workorder" readonly />
          </template>
          <template #priority="{ value }">
            <PriorityBadge :priority="value" />
          </template>
        </DataTable>
      </BaseCard>

      <!-- Ativos em Manutenção -->
      <BaseCard class="maintenance-assets-card">
        <template #header>
          <div class="card-header">
            <h3>🔧 Ativos em Manutenção</h3>
            <div class="card-info">
              {{ assetsInMaintenance.length }} ativos
            </div>
          </div>
        </template>

        <div v-if="assetsInMaintenance.length === 0" class="empty-state">
          <div class="empty-icon">✅</div>
          <p>Nenhum ativo em manutenção no momento</p>
        </div>

        <div v-else class="assets-list">
          <div
            v-for="asset in assetsInMaintenance"
            :key="asset.id"
            class="asset-item"
          >
            <div class="asset-info">
              <div class="asset-code">{{ asset.code }}</div>
              <div class="asset-name">{{ asset.name }}</div>
            </div>
            <div class="asset-criticality">
              <PriorityBadge :priority="asset.criticality" />
            </div>
          </div>
        </div>
      </BaseCard>

      <!-- Métricas de Manutenção -->
      <BaseCard class="metrics-card">
        <template #header>
          <h3>📈 Métricas de Manutenção</h3>
        </template>

        <div class="metrics-grid">
          <div class="metric-item">
            <div class="metric-icon">🔧</div>
            <div class="metric-content">
              <div class="metric-label">Corretivas vs. Preventivas</div>
              <div class="metric-value">
                {{ Math.round((woStore.workOrders.filter(wo => wo.type === 'preventive').length /
                   (woStore.workOrders.length || 1)) * 100) }}% preventivas
              </div>
            </div>
          </div>

          <div class="metric-item">
            <div class="metric-icon">🎯</div>
            <div class="metric-content">
              <div class="metric-label">Taxa de Conclusão</div>
              <div class="metric-value">
                {{ Math.round((woStore.workOrders.filter(wo => wo.status === 'completed').length /
                   (woStore.workOrders.length || 1)) * 100) }}%
              </div>
            </div>
          </div>

          <div class="metric-item">
            <div class="metric-icon">⚡</div>
            <div class="metric-content">
              <div class="metric-label">Tempo Médio de Resposta</div>
              <div class="metric-value">
                {{ kpis.avgResponseHours ? kpis.avgResponseHours.toFixed(1) + 'h' : 'N/A' }}
              </div>
            </div>
          </div>

          <div class="metric-item">
            <div class="metric-icon">📊</div>
            <div class="metric-content">
              <div class="metric-label">Eficiência Geral</div>
              <div class="metric-value">
                {{ Math.round(((woStore.workOrders.filter(wo => wo.status === 'completed').length /
                   (woStore.workOrders.length || 1)) * 100) * 0.8) }}%
              </div>
            </div>
          </div>
        </div>
      </BaseCard>
    </div>
  </div>
</template>

<style scoped>
.dashboard {
  padding: 2rem;
  max-width: 1400px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

.dashboard-header {
  margin-bottom: 0;
  background: linear-gradient(135deg, #ffffff 0%, #fef7ed 100%);
  padding: 2rem;
  border-radius: 16px;
  border: 1px solid #fed7aa;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
}

.header-content {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.dashboard-title {
  font-size: 2.5rem;
  font-weight: 800;
  background: linear-gradient(135deg, #f78018 0%, #ea580c 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  margin: 0;
  letter-spacing: -0.02em;
}

.dashboard-subtitle {
  color: #6b7280;
  font-size: 1.1rem;
  margin: 0.5rem 0 0 0;
  font-weight: 500;
}

.alert-section {
  margin-bottom: 1rem;
}

.stats-section {
  margin-bottom: 1rem;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 1.5rem;
}

.main-grid {
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: 2rem;
}

.recent-workorders-card {
  grid-column: 1 / 2;
}

.maintenance-assets-card {
  grid-column: 2 / 3;
}

.metrics-card {
  grid-column: 1 / -1;
  margin-top: 1rem;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

.card-header h3 {
  margin: 0;
  font-size: 1.25rem;
  font-weight: 600;
  color: var(--color-text-primary);
}

.card-info {
  font-size: 0.875rem;
  color: #6b7280;
  background: linear-gradient(135deg, #fef7ed, #fed7aa);
  padding: 0.5rem 1rem;
  border-radius: 12px;
  border: 1px solid #fdba74;
  font-weight: 600;
}

.workorders-table {
  margin-top: 0;
}

.empty-state {
  text-align: center;
  padding: 2rem;
  color: var(--color-text-secondary);
}

.empty-icon {
  font-size: 3rem;
  margin-bottom: 1rem;
  opacity: 0.5;
}

.assets-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.asset-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1rem;
  background: var(--color-background-secondary);
  border-radius: 8px;
  border: 1px solid var(--color-border);
  transition: border-color 0.2s ease, box-shadow 0.2s ease;
}

.asset-item:hover {
  border-color: var(--color-primary);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.asset-info {
  flex: 1;
}

.asset-code {
  font-size: 0.875rem;
  font-weight: 600;
  color: var(--color-primary);
  margin-bottom: 0.25rem;
}

.asset-name {
  font-size: 1rem;
  font-weight: 500;
  color: var(--color-text-primary);
}

.asset-criticality {
  margin-left: 1rem;
}

.metrics-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1rem;
}

.metric-item {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem;
  background: var(--color-background-secondary);
  border-radius: 8px;
  border: 1px solid var(--color-border);
  transition: border-color 0.2s ease, box-shadow 0.2s ease;
}

.metric-item:hover {
  border-color: var(--color-primary);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.metric-icon {
  font-size: 2rem;
  opacity: 0.8;
}

.metric-content {
  flex: 1;
}

.metric-label {
  font-size: 0.875rem;
  color: var(--color-text-secondary);
  margin-bottom: 0.25rem;
}

.metric-value {
  font-size: 1.25rem;
  font-weight: 700;
  color: var(--color-primary);
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
  .dashboard {
    padding: 1rem;
  }

  .dashboard-title {
    font-size: 1.5rem;
  }

  .stats-grid {
    grid-template-columns: 1fr;
  }

  .metrics-grid {
    grid-template-columns: 1fr;
  }

  .card-header {
    flex-direction: column;
    align-items: stretch;
    gap: 1rem;
  }

  .card-info {
    text-align: center;
  }

  .asset-item {
    flex-direction: column;
    align-items: stretch;
    gap: 0.5rem;
  }

  .asset-criticality {
    margin-left: 0;
    align-self: flex-end;
  }

  .metric-item {
    flex-direction: column;
    text-align: center;
    gap: 0.5rem;
  }

  .metric-icon {
    font-size: 1.5rem;
  }
}

@media (max-width: 480px) {
  .dashboard {
    padding: 0.5rem;
  }

  .asset-item,
  .metric-item {
    padding: 0.75rem;
  }

  .metric-value {
    font-size: 1rem;
  }
}
</style>
