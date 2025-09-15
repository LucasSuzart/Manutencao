<script setup lang="ts">
import { ref } from 'vue'
import { useAssetStore } from '../../stores/assets'
import { useLocationStore } from '../../stores/locations'
import { computed } from 'vue'
import { Button, DataTable, BaseCard, InputField, SelectField, Modal, StatusBadge } from '../shared/ui'

const store = useAssetStore()
const locationStore = useLocationStore()
const assets = computed(() => store.assets)

// Form state
const showCreateModal = ref(false)
const formData = ref({
  name: '',
  code: '',
  status: 'operational' as const,
  criticality: 'medium' as const,
  category: '',
  location: '',
  manufacturer: '',
  model: ''
})

  const columns = [
  { key: 'name', label: 'Nome' },
  { key: 'code', label: 'Código' },
  {
    key: 'status',
    label: 'Status',
    format: (value: string) => {
      const labels = {
        operational: 'Operacional',
        down: 'Parado',
        maintenance: 'Manutenção',
        retired: 'Retirado'
      }
      return labels[value as keyof typeof labels] || value
    }
  },
  {
    key: 'criticality',
    label: 'Criticidade',
    format: (value: string) => {
      const labels = {
        low: 'Baixa',
        medium: 'Média',
        high: 'Alta'
      }
      return labels[value as keyof typeof labels] || value
    }
  },
  { key: 'category', label: 'Categoria' },
  { 
    key: 'location', 
    label: 'Localização',
    format: (value: string) => {
      const location = locationStore.locations.find(loc => loc.id === value);
      return location ? location.name : value;
    }
  }
]

function openAsset(id: string) {
  // navigate to detail
  window.location.href = `/ativos/${id}`
}

const statusOptions = [
  { value: 'operational', label: 'Operacional' },
  { value: 'down', label: 'Parado' },
  { value: 'maintenance', label: 'Manutenção' },
  { value: 'retired', label: 'Retirado' }
]

const criticalityOptions = [
  { value: 'low', label: 'Baixa' },
  { value: 'medium', label: 'Média' },
  { value: 'high', label: 'Alta' }
]

// Função para formatar as opções de localização hierarquicamente
function formatLocationOptions(locations: any[]) {
  const result: {value: string, label: string}[] = []
  
  // Primeiro adiciona todas as localizações raiz
  const rootLocations = locations.filter(loc => !loc.parentId)
  rootLocations.forEach(loc => {
    result.push({
      value: loc.id,
      label: loc.name
    })
    
    // Adiciona localizações filhas com recuo
    addChildLocations(loc.id, 1, result, locations)
  })
  
  return result
}

// Adiciona localizações filhas recursivamente com recuo visual
function addChildLocations(parentId: string, level: number, result: any[], allLocations: any[]) {
  const children = allLocations.filter(loc => loc.parentId === parentId)
  
  children.forEach(child => {
    const indent = '—'.repeat(level) + ' '
    result.push({
      value: child.id,
      label: indent + child.name + (child.code ? ` (${child.code})` : '')
    })
    
    // Recursivamente adiciona os filhos deste filho
    addChildLocations(child.id, level + 1, result, allLocations)
  })
}

function resetForm() {
  formData.value = {
    name: '',
    code: '',
    status: 'operational',
    criticality: 'medium',
    category: '',
    location: '',
    manufacturer: '',
    model: ''
  }
}

function addAsset() {
  if (!formData.value.name || !formData.value.code) return

  store.add({
    name: formData.value.name,
    code: formData.value.code,
    status: formData.value.status,
    criticality: formData.value.criticality,
    category: formData.value.category || undefined,
    location: formData.value.location || undefined,
    manufacturer: formData.value.manufacturer || undefined,
    model: formData.value.model || undefined
  })

  resetForm()
  showCreateModal.value = false
}
</script>

<template>
  <div class="page">
    <div class="page-header">
      <div class="page-header__content">
        <h1 class="page-title">Ativos</h1>
        <p class="page-subtitle">Gerencie todos os ativos da empresa</p>
      </div>
      <div class="page-header__actions">
        <Button variant="secondary" @click.prevent="$router.push({ name: 'assets-locations' })">Gerenciar Locais</Button>
        <Button variant="primary" @click="showCreateModal = true">
          Novo Ativo
        </Button>
      </div>
    </div>

    <BaseCard>
      <DataTable
        :data="assets"
        :columns="columns"
        searchable
        sortable
        striped
        hoverable
        empty-text="Nenhum ativo cadastrado"
      >
        <template #cell-status="{ value }">
          <StatusBadge :status="value" type="asset" />
        </template>

        <template #cell-criticality="{ value }">
          <StatusBadge :status="value" type="criticality" />
        </template>
      </DataTable>
    </BaseCard>

    <Modal v-model="showCreateModal" title="Novo Ativo" size="md">
      <form @submit.prevent="addAsset">
        <div class="form-grid">
          <InputField
            v-model="formData.name"
            label="Nome do Ativo"
            placeholder="Digite o nome do ativo"
            required
          />

          <InputField
            v-model="formData.code"
            label="Código"
            placeholder="Digite o código do ativo"
            required
          />

          <SelectField
            v-model="formData.status"
            label="Status"
            :options="statusOptions"
            required
          />

          <SelectField
            v-model="formData.criticality"
            label="Criticidade"
            :options="criticalityOptions"
            required
          />

          <InputField
            v-model="formData.category"
            label="Categoria"
            placeholder="Ex: Equipamento, Veículo, etc."
          />

          <SelectField
            v-model="formData.location"
            label="Localização"
            :options="formatLocationOptions(locationStore.locations)"
            placeholder="Selecione a localização"
          />

          <InputField
            v-model="formData.manufacturer"
            label="Fabricante"
            placeholder="Digite o fabricante"
          />

          <InputField
            v-model="formData.model"
            label="Modelo"
            placeholder="Digite o modelo"
          />
        </div>
      </form>

      <template #footer>
        <Button variant="ghost" @click="showCreateModal = false">
          Cancelar
        </Button>
        <Button variant="primary" @click="addAsset">
          Criar Ativo
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

@media (max-width: 768px) {
  .form-grid {
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
