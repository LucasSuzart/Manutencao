<script setup lang="ts">
// Componente de filtro reusável para relatórios
import { ref } from 'vue'

const props = defineProps<{
  title?: string
  initialDateRange?: { from: string; to: string }
  showAssetFilter?: boolean
  showStatusFilter?: boolean
  showTypeFilter?: boolean
  assets?: { id: string; name: string }[]
}>()

const emit = defineEmits(['filter'])

const from = ref(props.initialDateRange?.from || '')
const to = ref(props.initialDateRange?.to || '')
const assetId = ref('')
const status = ref('')
const type = ref('')

function applyFilter() {
  emit('filter', {
    from: from.value || undefined,
    to: to.value || undefined,
    assetId: assetId.value || undefined,
    status: status.value || undefined,
    type: type.value || undefined
  })
}

function resetFilter() {
  from.value = ''
  to.value = ''
  assetId.value = ''
  status.value = ''
  type.value = ''
  applyFilter()
}
</script>

<template>
  <div class="filter-panel">
    <div v-if="title" class="filter-panel__title">{{ title }}</div>
    <div class="filter-panel__controls">
      <div class="filter-group">
        <input type="date" v-model="from" placeholder="De" />
        <input type="date" v-model="to" placeholder="Até" />
      </div>
      
      <select v-if="showAssetFilter" v-model="assetId">
        <option value="">Todos os ativos</option>
        <option v-for="asset in assets" :key="asset.id" :value="asset.id">{{ asset.name }}</option>
      </select>
      
      <select v-if="showStatusFilter" v-model="status">
        <option value="">Todos os status</option>
        <option value="open">Aberto</option>
        <option value="in_progress">Em andamento</option>
        <option value="completed">Concluído</option>
        <option value="canceled">Cancelado</option>
      </select>
      
      <select v-if="showTypeFilter" v-model="type">
        <option value="">Todos os tipos</option>
        <option value="corrective">Corretiva</option>
        <option value="preventive">Preventiva</option>
        <option value="predictive">Preditiva</option>
        <option value="inspection">Inspeção</option>
        <option value="improvement">Melhoria</option>
      </select>
      
      <div class="filter-actions">
        <button class="btn btn--primary btn--sm" @click="applyFilter">Aplicar</button>
        <button class="btn btn--ghost btn--sm" @click="resetFilter">Limpar</button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.filter-panel {
  background: var(--color-surface);
  border-radius: var(--border-radius-md);
  padding: var(--spacing-md);
  margin-bottom: var(--spacing-lg);
  border: 1px solid var(--color-border);
}

.filter-panel__title {
  font-weight: 600;
  font-size: var(--font-size-sm);
  margin-bottom: var(--spacing-sm);
  color: var(--color-text-secondary);
}

.filter-panel__controls {
  display: flex;
  flex-wrap: wrap;
  gap: var(--spacing-sm);
  align-items: center;
}

.filter-group {
  display: flex;
  gap: var(--spacing-xs);
}

select, input {
  font-size: var(--font-size-xs);
  padding: var(--spacing-xs) var(--spacing-sm);
  border: 1px solid var(--color-border);
  border-radius: var(--border-radius-sm);
  background: var(--color-surface);
}

.filter-actions {
  margin-left: auto;
  display: flex;
  gap: var(--spacing-xs);
}

@media (max-width: 768px) {
  .filter-panel__controls {
    flex-direction: column;
    align-items: flex-start;
  }
  
  .filter-group, select, .filter-actions {
    width: 100%;
  }
  
  .filter-actions {
    margin-left: 0;
    margin-top: var(--spacing-sm);
  }
}
</style>
