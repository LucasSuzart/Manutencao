<script setup lang="ts">
import { ref } from 'vue'
import { useAssetStore } from '../../stores/assets'
import { useLocationStore } from '../../stores/locations'
import { Button, InputField, SelectField } from '../shared/ui'

const props = defineProps({
  modelValue: { type: Object, required: false }
})

const emit = defineEmits(['update:modelValue', 'saved'])

const store = useAssetStore()
const locStore = useLocationStore()

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

const form = ref({
  id: props.modelValue?.id || null,
  name: props.modelValue?.name || '',
  code: props.modelValue?.code || '',
  status: props.modelValue?.status || 'operational',
  criticality: props.modelValue?.criticality || 'medium',
  category: props.modelValue?.category || '',
  location: props.modelValue?.location || '',
  manufacturer: props.modelValue?.manufacturer || '',
  model: props.modelValue?.model || '',
  serialNumber: props.modelValue?.serialNumber || ''
})

function save() {
  if (!form.value.name || !form.value.code) return
  if (form.value.id) {
    store.update(form.value.id, { ...form.value })
  } else {
    store.add({ ...form.value })
  }
  emit('saved')
}
</script>

<template>
  <div class="asset-form">
    <div class="form-grid">
      <InputField v-model="form.name" label="Nome do equipamento" required />
      <InputField v-model="form.code" label="Código" required />
      <SelectField v-model="form.status" :options="[{value:'operational',label:'Operacional'},{value:'down',label:'Parado'},{value:'maintenance',label:'Manutenção'},{value:'retired',label:'Retirado'}]" label="Status" />
      <SelectField v-model="form.criticality" :options="[{value:'low',label:'Baixa'},{value:'medium',label:'Média'},{value:'high',label:'Alta'}]" label="Criticidade" />
      <InputField v-model="form.category" label="Categoria (ex: Impressora Offset)" />
      <SelectField 
        v-model="form.location" 
        :options="formatLocationOptions(locStore.locations)" 
        label="Localização" 
        placeholder="Selecione a localização" 
      />
      <InputField v-model="form.manufacturer" label="Fabricante" />
      <InputField v-model="form.model" label="Modelo" />
      <InputField v-model="form.serialNumber" label="Número de Série" />
    </div>
    <div class="form-actions">
      <Button variant="primary" @click="save">Salvar</Button>
    </div>
  </div>
</template>

<style scoped>
.form-grid { display:grid; grid-template-columns:1fr 1fr; gap:12px }
.form-actions { margin-top:12px; display:flex; justify-content:flex-end }
@media (max-width:768px) { .form-grid{grid-template-columns:1fr} }
</style>
