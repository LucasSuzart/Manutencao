<script setup lang="ts">
import { ref, watch } from 'vue'
import { useWorkOrderStore } from '../../stores/workorders'
import { useAssetStore } from '../../stores/assets'
import { useTechnicianStore } from '../../stores/technicians'
import { Button } from '../shared/ui'

interface Props {
  workOrder: any
}

const props = defineProps<Props>()
const emit = defineEmits(['updated', 'cancel'])

const woStore = useWorkOrderStore()
const assetStore = useAssetStore()
const technicianStore = useTechnicianStore()

// Campos do formulário
const title = ref('')
const description = ref('')
const assetId = ref<string | undefined>()
const type = ref<'corrective' | 'preventive' | 'predictive' | 'inspection' | 'improvement'>('corrective')
const priority = ref<'low' | 'medium' | 'high' | 'critical'>('medium')
const status = ref<'open' | 'in_progress' | 'paused' | 'completed' | 'canceled'>('open')
const assignedToIds = ref<string[]>([])
const plannedStart = ref('')
const plannedEnd = ref('')
const estimatedHours = ref(0)

// Carregar dados da OS quando ela muda
watch(() => props.workOrder, (newWorkOrder) => {
  if (newWorkOrder) {
    title.value = newWorkOrder.title || ''
    description.value = newWorkOrder.description || ''
    assetId.value = newWorkOrder.assetId
    type.value = newWorkOrder.type || 'corrective'
    priority.value = newWorkOrder.priority || 'medium'
    status.value = newWorkOrder.status || 'open'
    assignedToIds.value = newWorkOrder.assignedToIds || []
    plannedStart.value = newWorkOrder.plannedStart ? newWorkOrder.plannedStart.substring(0, 16) : ''
    plannedEnd.value = newWorkOrder.plannedEnd ? newWorkOrder.plannedEnd.substring(0, 16) : ''
    estimatedHours.value = newWorkOrder.estimatedHours || 0
  }
}, { immediate: true })

function submit() {
  if (!title.value || !props.workOrder) return

  const updates = {
    title: title.value,
    description: description.value,
    assetId: assetId.value,
    type: type.value,
    priority: priority.value,
    status: status.value,
    assignedToIds: assignedToIds.value,
    plannedStart: plannedStart.value ? new Date(plannedStart.value).toISOString() : undefined,
    plannedEnd: plannedEnd.value ? new Date(plannedEnd.value).toISOString() : undefined,
    estimatedHours: estimatedHours.value,
    updatedAt: new Date().toISOString()
  }

  woStore.update(props.workOrder.id, updates)
  emit('updated')
}

function cancel() {
  emit('cancel')
}

function toggleTechnician(technicianId: string) {
  const index = assignedToIds.value.indexOf(technicianId)
  if (index > -1) {
    assignedToIds.value.splice(index, 1)
  } else {
    assignedToIds.value.push(technicianId)
  }
}
</script>

<template>
  <div class="edit-workorder-form">
    <form @submit.prevent="submit" class="form-grid">
      <!-- Informações Básicas -->
      <div class="form-section">
        <h4>📋 Informações Básicas</h4>
        <div class="form-row">
          <div class="form-group">
            <label>Título *</label>
            <input v-model="title" type="text" required class="form-input">
          </div>
          <div class="form-group">
            <label>Status</label>
            <select v-model="status" class="form-select">
              <option value="open">Aberto</option>
              <option value="in_progress">Em Progresso</option>
              <option value="paused">Pausado</option>
              <option value="completed">Concluído</option>
              <option value="canceled">Cancelado</option>
            </select>
          </div>
        </div>
        <div class="form-group">
          <label>Descrição</label>
          <textarea v-model="description" rows="3" class="form-textarea" placeholder="Descreva o problema ou trabalho a ser realizado..."></textarea>
        </div>
      </div>

      <!-- Classificação -->
      <div class="form-section">
        <h4>🏷️ Classificação</h4>
        <div class="form-row">
          <div class="form-group">
            <label>Tipo</label>
            <select v-model="type" class="form-select">
              <option value="corrective">Corretiva</option>
              <option value="preventive">Preventiva</option>
              <option value="predictive">Preditiva</option>
              <option value="inspection">Inspeção</option>
              <option value="improvement">Melhoria</option>
            </select>
          </div>
          <div class="form-group">
            <label>Prioridade</label>
            <select v-model="priority" class="form-select">
              <option value="low">Baixa</option>
              <option value="medium">Média</option>
              <option value="high">Alta</option>
              <option value="critical">Crítica</option>
            </select>
          </div>
        </div>
        <div class="form-row">
          <div class="form-group">
            <label>Ativo</label>
            <select v-model="assetId" class="form-select">
              <option :value="undefined">-- Selecione um ativo --</option>
              <option v-for="asset in assetStore.assets" :key="asset.id" :value="asset.id">
                {{ asset.name }}
              </option>
            </select>
          </div>
          <div class="form-group">
            <label>Horas Estimadas</label>
            <input v-model.number="estimatedHours" type="number" min="0" step="0.5" class="form-input">
          </div>
        </div>
      </div>

      <!-- Planejamento -->
      <div class="form-section">
        <h4>📅 Planejamento</h4>
        <div class="form-row">
          <div class="form-group">
            <label>Data Inicial Planejada</label>
            <input v-model="plannedStart" type="datetime-local" class="form-input">
          </div>
          <div class="form-group">
            <label>Data Final Planejada</label>
            <input v-model="plannedEnd" type="datetime-local" class="form-input">
          </div>
        </div>
      </div>

      <!-- Responsáveis -->
      <div class="form-section">
        <h4>👥 Responsáveis</h4>
        <div class="technicians-grid">
          <div
            v-for="technician in technicianStore.technicians"
            :key="technician.id"
            class="technician-item"
            :class="{ 'selected': assignedToIds.includes(technician.id) }"
            @click="toggleTechnician(technician.id)"
          >
            <div class="technician-avatar">
              {{ technician.name.charAt(0).toUpperCase() }}
            </div>
            <div class="technician-info">
              <div class="technician-name">{{ technician.name }}</div>
              <div class="technician-role">{{ technician.role }}</div>
            </div>
            <div class="technician-check" v-if="assignedToIds.includes(technician.id)">
              ✅
            </div>
          </div>
        </div>
      </div>

      <!-- Ações -->
      <div class="form-actions">
        <Button variant="secondary" @click="cancel">
          Cancelar
        </Button>
        <Button variant="primary" type="submit">
          Salvar Alterações
        </Button>
      </div>
    </form>
  </div>
</template>

<style scoped>
.edit-workorder-form {
  max-width: 800px;
  margin: 0 auto;
}

.form-grid {
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

.form-section {
  padding: 1.5rem;
  background: var(--color-background-secondary);
  border-radius: 8px;
  border: 1px solid var(--color-border);
}

.form-section h4 {
  margin: 0 0 1rem 0;
  color: var(--color-text-primary);
  font-size: 1.1rem;
  font-weight: 600;
}

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
  margin-bottom: 1rem;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.form-group label {
  font-weight: 500;
  color: var(--color-text-primary);
  font-size: 0.875rem;
}

.form-input,
.form-select,
.form-textarea {
  padding: 0.75rem;
  border: 1px solid var(--color-border);
  border-radius: 6px;
  background: var(--color-background);
  color: var(--color-text-primary);
  font-size: 0.875rem;
  transition: border-color 0.2s ease, box-shadow 0.2s ease;
}

.form-input:focus,
.form-select:focus,
.form-textarea:focus {
  outline: none;
  border-color: var(--color-primary);
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.form-textarea {
  resize: vertical;
  min-height: 80px;
}

.technicians-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 0.75rem;
}

.technician-item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem;
  background: var(--color-background);
  border: 1px solid var(--color-border);
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.technician-item:hover {
  border-color: var(--color-primary);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.technician-item.selected {
  border-color: var(--color-primary);
  background: rgba(59, 130, 246, 0.05);
}

.technician-avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: var(--color-primary);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  font-size: 1.1rem;
}

.technician-info {
  flex: 1;
}

.technician-name {
  font-weight: 500;
  color: var(--color-text-primary);
  font-size: 0.875rem;
}

.technician-role {
  font-size: 0.75rem;
  color: var(--color-text-secondary);
}

.technician-check {
  color: var(--color-primary);
  font-size: 1.1rem;
}

.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
  padding-top: 1rem;
  border-top: 1px solid var(--color-border);
}

/* Responsividade */
@media (max-width: 768px) {
  .form-row {
    grid-template-columns: 1fr;
  }

  .technicians-grid {
    grid-template-columns: 1fr;
  }

  .form-section {
    padding: 1rem;
  }

  .form-actions {
    flex-direction: column;
  }
}
</style>
