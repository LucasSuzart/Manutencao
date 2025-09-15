<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAssetStore } from '../../stores/assets'
import { useLocationStore } from '../../stores/locations'
import { Button, InputField, SelectField } from '../shared/ui'

const props = defineProps({
  modelValue: { type: Object, required: false }
})

const emit = defineEmits(['update:modelValue', 'saved'])

const store = useAssetStore()
const locStore = useLocationStore()
const route = useRoute()
const router = useRouter()

// If this component is used as a route (/ativos/:id/editar), load the asset
onMounted(() => {
  // If modelValue provided (modal usage), keep it. Otherwise try route param.
  if (!props.modelValue) {
    const id = route.params.id as string | undefined
    if (id) {
      const a = store.byId(id)
      if (a) {
        form.value = {
          id: a.id,
          name: a.name || '',
          code: a.code || '',
          status: a.status || 'operational',
          criticality: a.criticality || 'medium',
          category: a.category || '',
          location: a.location || '',
          manufacturer: a.manufacturer || '',
          model: a.model || '',
          serialNumber: a.serialNumber || '',
          imageUrl: a.imageUrl || ''
        }
      }
    }
  }
})

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
  serialNumber: props.modelValue?.serialNumber || '',
  imageUrl: props.modelValue?.imageUrl || ''
})

// Handle file input and convert to Data URL
function onFileChange(ev: Event) {
  const input = ev.target as HTMLInputElement
  if (!input.files || !input.files[0]) return
  const file = input.files[0]
  const reader = new FileReader()
  reader.onload = () => {
    form.value.imageUrl = reader.result as string
  }
  reader.readAsDataURL(file)
}

function removeImage() {
  form.value.imageUrl = ''
}

function save() {
  if (!form.value.name || !form.value.code) return
  if (form.value.id) {
    const { imageUrl, ...rest } = form.value
    store.update(form.value.id, { ...rest, imageUrl })
    emit('saved')
    // navigate to detail after saving
    router.push({ name: 'asset-detail', params: { id: form.value.id } })
  } else {
    const { imageUrl, ...rest } = form.value
    store.add({ ...rest, imageUrl })
    emit('saved')
    // new asset - navigate to the newly created asset detail
    const newId = store.assets[store.assets.length - 1]?.id
    if (newId) router.push({ name: 'asset-detail', params: { id: newId } })
  }
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
      <!-- Image upload -->
      <div>
        <label class="label">Foto do equipamento</label>
        <input type="file" accept="image/*" @change="onFileChange" />
          <div v-if="form.imageUrl" class="image-preview">
            <img :src="form.imageUrl" alt="preview" class="preview-img" />
            <div class="preview-actions">
              <Button variant="ghost" size="sm" @click.prevent="removeImage">Remover</Button>
            </div>
          </div>
      </div>
    </div>
    <div class="form-actions">
      <Button variant="primary" @click="save">Salvar</Button>
    </div>
  </div>
</template>

<style scoped>
.form-grid { display:grid; grid-template-columns:1fr 1fr; gap:12px }
.form-actions { margin-top:12px; display:flex; justify-content:flex-end }
.image-preview { margin-top:8px; display:flex; flex-direction:column; gap:6px }
.preview-img { max-width:240px; border-radius:8px; border:1px solid var(--color-border); object-fit:cover }
.preview-actions { display:flex; gap:8px }
@media (max-width:768px) { .form-grid{grid-template-columns:1fr} }
</style>
