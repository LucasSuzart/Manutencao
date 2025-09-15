<script setup lang="ts">
import { useInventoryStore } from '../../stores/inventory'
import { ref, computed } from 'vue'
import { Button, DataTable, BaseCard, InputField, SelectField, Modal, Alert } from '../shared/ui'

const store = useInventoryStore()

// Form state
const showCreateModal = ref(false)
const formData = ref({
  sku: '',
  name: '',
  unit: 'pc',
  minQty: 0,
  cost: 0,
  description: '',
  location: ''
})

const columns = [
  { key: 'sku', label: 'SKU' },
  { key: 'name', label: 'Nome' },
  { key: 'currentQty', label: 'Quantidade Atual' },
  { key: 'minQty', label: 'Quantidade Mínima' },
  {
    key: 'cost',
    label: 'Custo Unitário',
    format: (value: number) => `R$ ${value.toFixed(2)}`
  },
  { key: 'unit', label: 'Unidade' },
  { key: 'location', label: 'Localização' }
]

const unitOptions = [
  { value: 'pc', label: 'Peça' },
  { value: 'kg', label: 'Quilograma' },
  { value: 'L', label: 'Litro' },
  { value: 'm', label: 'Metro' },
  { value: 'm²', label: 'Metro Quadrado' },
  { value: 'm³', label: 'Metro Cúbico' }
]

// Itens com estoque baixo
const lowStockItems = computed(() => {
  return store.items.filter(item => item.currentQty <= item.minQty)
})

function resetForm() {
  formData.value = {
    sku: '',
    name: '',
    unit: 'pc',
    minQty: 0,
    cost: 0,
    description: '',
    location: ''
  }
}

function addItem() {
  if (!formData.value.name || !formData.value.sku) return

  store.add({
    sku: formData.value.sku,
    name: formData.value.name,
    unit: formData.value.unit,
    currentQty: 0,
    minQty: formData.value.minQty,
    cost: formData.value.cost,
    description: formData.value.description || undefined,
    location: formData.value.location || undefined
  })

  resetForm()
  showCreateModal.value = false
}
</script>

<template>
  <div class="page">
    <div class="page-header">
      <div class="page-header__content">
        <h1 class="page-title">Estoque</h1>
        <p class="page-subtitle">Controle de inventário e materiais</p>
      </div>
      <div class="page-header__actions">
        <Button variant="primary" @click="showCreateModal = true">
          Novo Item
        </Button>
      </div>
    </div>

    <Alert
      v-if="lowStockItems.length > 0"
      type="warning"
      title="Atenção"
      class="mb-lg"
    >
      {{ lowStockItems.length }} item(ns) com estoque baixo ou esgotado.
    </Alert>

    <BaseCard>
      <DataTable
        :data="store.items"
        :columns="columns"
        searchable
        sortable
        striped
        hoverable
        empty-text="Nenhum item no estoque"
      >
        <template #cell-currentQty="{ value, item }">
          <span :class="{ 'text-error': value <= item.minQty }">
            {{ value }}
          </span>
        </template>
      </DataTable>
    </BaseCard>

    <Modal v-model="showCreateModal" title="Novo Item de Estoque" size="md">
      <form @submit.prevent="addItem">
        <div class="form-grid">
          <InputField
            v-model="formData.sku"
            label="SKU"
            placeholder="Código do produto"
            required
          />

          <InputField
            v-model="formData.name"
            label="Nome do Item"
            placeholder="Nome do produto"
            required
          />

          <SelectField
            v-model="formData.unit"
            label="Unidade"
            :options="unitOptions"
            required
          />

          <InputField
            v-model.number="formData.minQty"
            label="Quantidade Mínima"
            type="number"
            placeholder="0"
            required
          />

          <InputField
            v-model.number="formData.cost"
            label="Custo Unitário (R$)"
            type="number"
            step="0.01"
            placeholder="0.00"
            required
          />

          <InputField
            v-model="formData.location"
            label="Localização"
            placeholder="Ex: Almoxarifado A, Prateleira 3"
          />

          <div class="form-full-width">
            <InputField
              v-model="formData.description"
              label="Descrição"
              placeholder="Descrição detalhada do item"
            />
          </div>
        </div>
      </form>

      <template #footer>
        <Button variant="ghost" @click="showCreateModal = false">
          Cancelar
        </Button>
        <Button variant="primary" @click="addItem">
          Adicionar Item
        </Button>
      </template>
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

.form-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: var(--spacing-md);
}

.form-full-width {
  grid-column: 1 / -1;
}

.text-error {
  color: var(--color-error);
  font-weight: 600;
}

.mb-lg {
  margin-bottom: var(--spacing-lg);
}

@media (max-width: 768px) {
  .form-grid {
    grid-template-columns: 1fr;
  }

  .form-full-width {
    grid-column: 1;
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