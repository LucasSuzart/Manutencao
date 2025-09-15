<script setup lang="ts">
import { useWorkOrderStore } from '../../stores/workorders'
import { useAssetStore } from '../../stores/assets'
import { useInventoryStore } from '../../stores/inventory'
import { computed } from 'vue'
import { StatCard, BaseCard, DataTable } from '../shared/ui'

const woStore = useWorkOrderStore()
const assetStore = useAssetStore()
const inventoryStore = useInventoryStore()

// Totais gerais
const totals = computed(() => {
  const parts = woStore.workOrders.reduce((s, o) => s + o.costs.parts, 0)
  const labor = woStore.workOrders.reduce((s, o) => s + o.costs.labor, 0)
  return { parts, labor, total: parts + labor }
})

// Custos por ativo
const costsByAsset = computed(() => {
  const assetCosts = woStore.workOrders.reduce((acc, wo) => {
    if (wo.assetId) {
      if (!acc[wo.assetId]) {
        acc[wo.assetId] = { parts: 0, labor: 0, total: 0, workOrders: 0 }
      }
      acc[wo.assetId].parts += wo.costs.parts
      acc[wo.assetId].labor += wo.costs.labor
      acc[wo.assetId].total += wo.costs.total
      acc[wo.assetId].workOrders += 1
    }
    return acc
  }, {} as Record<string, { parts: number; labor: number; total: number; workOrders: number }>)

  return Object.entries(assetCosts)
    .map(([assetId, costs]) => ({
      assetId,
      assetName: assetStore.byId(assetId)?.name || 'Desconhecido',
      ...costs
    }))
    .sort((a, b) => b.total - a.total)
})

// Custos por tipo de manutenção
const costsByType = computed(() => {
  const typeCosts = woStore.workOrders.reduce((acc, wo) => {
    if (!acc[wo.type]) {
      acc[wo.type] = { parts: 0, labor: 0, total: 0, count: 0 }
    }
    acc[wo.type].parts += wo.costs.parts
    acc[wo.type].labor += wo.costs.labor
    acc[wo.type].total += wo.costs.total
    acc[wo.type].count += 1
    return acc
  }, {} as Record<string, { parts: number; labor: number; total: number; count: number }>)

  return Object.entries(typeCosts).map(([type, costs]) => ({
    type,
    typeName: {
      corrective: 'Corretiva',
      preventive: 'Preventiva',
      predictive: 'Preditiva',
      inspection: 'Inspeção',
      improvement: 'Melhoria'
    }[type] || type,
    ...costs
  }))
})

// Top itens de estoque mais utilizados
const topInventoryItems = computed(() => {
  const itemUsage = woStore.workOrders.reduce((acc, wo) => {
    wo.parts.forEach(part => {
      if (!acc[part.inventoryItemId]) {
        acc[part.inventoryItemId] = { quantity: 0, cost: 0 }
      }
      acc[part.inventoryItemId].quantity += part.quantity
      acc[part.inventoryItemId].cost += part.quantity * part.unitCost
    })
    return acc
  }, {} as Record<string, { quantity: number; cost: number }>)

  return Object.entries(itemUsage)
    .map(([itemId, usage]) => {
      const item = inventoryStore.items.find(i => i.id === itemId)
      return {
        itemId,
        itemName: item?.name || 'Desconhecido',
        sku: item?.sku || '',
        quantity: usage.quantity,
        totalCost: usage.cost
      }
    })
    .sort((a, b) => b.totalCost - a.totalCost)
    .slice(0, 10)
})

// Colunas para tabela de custos por ativo
const assetColumns = [
  { key: 'assetName', label: 'Ativo' },
  { key: 'workOrders', label: 'OS', format: (value: number) => value.toString() },
  {
    key: 'parts',
    label: 'Peças',
    format: (value: number) => `R$ ${value.toFixed(2)}`
  },
  {
    key: 'labor',
    label: 'Mão de Obra',
    format: (value: number) => `R$ ${value.toFixed(2)}`
  },
  {
    key: 'total',
    label: 'Total',
    format: (value: number) => `R$ ${value.toFixed(2)}`
  }
]

// Colunas para tabela de custos por tipo
const typeColumns = [
  { key: 'typeName', label: 'Tipo de Manutenção' },
  { key: 'count', label: 'Quantidade', format: (value: number) => value.toString() },
  {
    key: 'parts',
    label: 'Peças',
    format: (value: number) => `R$ ${value.toFixed(2)}`
  },
  {
    key: 'labor',
    label: 'Mão de Obra',
    format: (value: number) => `R$ ${value.toFixed(2)}`
  },
  {
    key: 'total',
    label: 'Total',
    format: (value: number) => `R$ ${value.toFixed(2)}`
  }
]

// Colunas para tabela de itens mais utilizados
const inventoryColumns = [
  { key: 'itemName', label: 'Item' },
  { key: 'sku', label: 'SKU' },
  { key: 'quantity', label: 'Quantidade Utilizada' },
  {
    key: 'totalCost',
    label: 'Custo Total',
    format: (value: number) => `R$ ${value.toFixed(2)}`
  }
]
</script>

<template>
  <div class="page">
    <div class="page-header">
      <div class="page-header__content">
        <h1 class="page-title">Análise de Custos</h1>
        <p class="page-subtitle">Controle e análise de custos de manutenção</p>
      </div>
    </div>

    <!-- Totais Gerais -->
    <div class="stats-grid">
      <StatCard
        title="Total em Peças"
        :value="totals.parts"
        unit="R$"
        color="primary"
      />
      <StatCard
        title="Total em Mão de Obra"
        :value="totals.labor"
        unit="R$"
        color="warning"
      />
      <StatCard
        title="Custo Total"
        :value="totals.total"
        unit="R$"
        color="success"
      />
      <StatCard
        title="Ordens de Serviço"
        :value="woStore.workOrders.length"
        :decimals="0"
      />
    </div>

    <!-- Custos por Ativo -->
    <BaseCard title="Custos por Ativo" class="mb-lg">
      <DataTable
        :data="costsByAsset"
        :columns="assetColumns"
        sortable
        striped
        hoverable
        empty-text="Nenhum custo registrado por ativo"
      />
    </BaseCard>

    <!-- Custos por Tipo de Manutenção -->
    <BaseCard title="Custos por Tipo de Manutenção" class="mb-lg">
      <DataTable
        :data="costsByType"
        :columns="typeColumns"
        sortable
        striped
        hoverable
        empty-text="Nenhum custo registrado por tipo"
      />
    </BaseCard>

    <!-- Itens Mais Utilizados -->
    <BaseCard title="Top 10 Itens Mais Utilizados">
      <DataTable
        :data="topInventoryItems"
        :columns="inventoryColumns"
        sortable
        striped
        hoverable
        empty-text="Nenhum item utilizado ainda"
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

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: var(--spacing-md);
  margin-bottom: var(--spacing-lg);
}

.mb-lg {
  margin-bottom: var(--spacing-lg);
}

@media (max-width: 768px) {
  .stats-grid {
    grid-template-columns: 1fr;
  }
}
</style>