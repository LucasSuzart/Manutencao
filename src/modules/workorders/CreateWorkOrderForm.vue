<script setup lang="ts">
import { ref } from 'vue'
import { useWorkOrderStore } from '../../stores/workorders'
import { useAssetStore } from '../../stores/assets'
import { useTechnicianStore } from '../../stores/technicians'
import { Button } from '../shared/ui'

const emit = defineEmits(['created', 'cancel'])

const woStore = useWorkOrderStore()
const assetStore = useAssetStore()
const technicianStore = useTechnicianStore()

// Campos do formulário
const title = ref('')
const description = ref('')
const assetId = ref<string | undefined>()
const type = ref<'corrective' | 'preventive' | 'predictive' | 'inspection' | 'improvement'>('corrective')
const priority = ref<'low' | 'medium' | 'high' | 'critical'>('medium')
const assignedToIds = ref<string[]>([])
const plannedStart = ref('')
const plannedEnd = ref('')
const estimatedHours = ref(0)

function submit() {
  if (!title.value) return

  const workOrder = {
    title: title.value,
    description: description.value,
    assetId: assetId.value,
    status: 'open' as const,
    type: type.value,
    priority: priority.value,
    assignedToIds: assignedToIds.value,
    plannedStart: plannedStart.value ? new Date(plannedStart.value).toISOString() : undefined,
    plannedEnd: plannedEnd.value ? new Date(plannedEnd.value).toISOString() : undefined,
    estimatedHours: estimatedHours.value,
    checklist: [],
    parts: [],
    labor: [],
    costs: { parts: 0, labor: 0, total: 0 },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }

  woStore.create(workOrder)
  emit('created')
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
  <div class="create-workorder-form">
    <form @submit.prevent="submit" class="form-grid">
      <!-- Informações Básicas -->
      <div class="form-section">
        <h4>📋 Informações Básicas</h4>
        <div class="form-group">
          <label>Título da Ordem de Serviço *</label>
          <input
            v-model="title"
            type="text"
            required
            class="form-input"
            placeholder="Ex: Manutenção preventiva - Motor principal"
          >
        </div>
        <div class="form-group">
          <label>Descrição do Problema/Trabalho</label>
          <textarea
            v-model="description"
            rows="4"
            class="form-textarea"
            placeholder="Descreva detalhadamente o problema identificado ou o trabalho a ser realizado..."
          ></textarea>
        </div>
      </div>

      <!-- Classificação e Priorização -->
      <div class="form-section">
        <h4>🏷️ Classificação</h4>
        <div class="form-row">
          <div class="form-group">
            <label>Tipo de Manutenção</label>
            <select v-model="type" class="form-select">
              <option value="corrective">🔧 Corretiva - Reparo de falha</option>
              <option value="preventive">🛡️ Preventiva - Manutenção programada</option>
              <option value="predictive">📊 Preditiva - Baseada em análise</option>
              <option value="inspection">👁️ Inspeção - Verificação periódica</option>
              <option value="improvement">⚡ Melhoria - Otimização/Upgrade</option>
            </select>
          </div>
          <div class="form-group">
            <label>Prioridade</label>
            <select v-model="priority" class="form-select">
              <option value="low">🟢 Baixa - Pode aguardar</option>
              <option value="medium">🟡 Média - Importante</option>
              <option value="high">🟠 Alta - Urgente</option>
              <option value="critical">🔴 Crítica - Parada imediata</option>
            </select>
          </div>
        </div>
      </div>

      <!-- Ativo e Planejamento -->
      <div class="form-section">
        <h4>🏭 Ativo e Planejamento</h4>
        <div class="form-row">
          <div class="form-group">
            <label>Ativo/Equipamento</label>
            <select v-model="assetId" class="form-select">
              <option :value="undefined">-- Selecione um ativo --</option>
              <option v-for="asset in assetStore.assets" :key="asset.id" :value="asset.id">
                {{ asset.code }} - {{ asset.name }}
              </option>
            </select>
          </div>
          <div class="form-group">
            <label>Horas Estimadas</label>
            <input
              v-model.number="estimatedHours"
              type="number"
              min="0"
              step="0.5"
              class="form-input"
              placeholder="0.0"
            >
          </div>
        </div>
        <div class="form-row">
          <div class="form-group">
            <label>Data/Hora Inicial Planejada</label>
            <input v-model="plannedStart" type="datetime-local" class="form-input">
          </div>
          <div class="form-group">
            <label>Data/Hora Final Planejada</label>
            <input v-model="plannedEnd" type="datetime-local" class="form-input">
          </div>
        </div>
      </div>

      <!-- Responsáveis -->
      <div class="form-section">
        <h4>👥 Responsáveis pela Execução</h4>
        <p class="form-help">Selecione os técnicos que irão executar esta ordem de serviço</p>
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
              <div class="technician-role">{{ technician.role || 'Técnico' }}</div>
            </div>
            <div class="technician-check" v-if="assignedToIds.includes(technician.id)">
              ✅
            </div>
          </div>
        </div>
        <div v-if="technicianStore.technicians.length === 0" class="no-technicians">
          <p>⚠️ Nenhum técnico cadastrado no sistema.</p>
          <small>Você pode adicionar técnicos na seção "Equipes" do menu.</small>
        </div>
      </div>

      <!-- Ações -->
      <div class="form-actions">
        <Button variant="secondary" @click="cancel">
          ❌ Cancelar
        </Button>
        <Button variant="primary" type="submit" :disabled="!title">
          ✅ Criar Ordem de Serviço
        </Button>
      </div>
    </form>
  </div>
</template>

<style scoped>
.create-workorder-form {
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

.form-help {
  margin: 0 0 1rem 0;
  color: var(--color-text-secondary);
  font-size: 0.875rem;
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
  min-height: 100px;
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

.no-technicians {
  text-align: center;
  padding: 2rem;
  color: var(--color-text-secondary);
}

.no-technicians p {
  margin: 0 0 0.5rem 0;
  font-weight: 500;
}

.no-technicians small {
  color: var(--color-text-secondary);
  font-size: 0.75rem;
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
