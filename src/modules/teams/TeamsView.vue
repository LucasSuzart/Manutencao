<script setup lang="ts">
import { useTechnicianStore } from '../../stores/technicians'
import { ref, computed } from 'vue'
import { Button, DataTable, BaseCard, InputField, SelectField, Modal, StatusBadge } from '../shared/ui'

const store = useTechnicianStore()

// Form state
const showCreateModal = ref(false)
const formData = ref({
  name: '',
  role: 'Técnico',
  email: '',
  phone: '',
  skills: [] as string[],
  skillInput: ''
})

const columns = [
  { key: 'name', label: 'Nome' },
  { key: 'role', label: 'Função' },
  { key: 'email', label: 'E-mail' },
  { key: 'phone', label: 'Telefone' },
  {
    key: 'active',
    label: 'Status',
    format: (value: boolean) => value ? 'Ativo' : 'Inativo'
  },
  {
    key: 'skills',
    label: 'Habilidades',
    format: (value: string[]) => value.join(', ') || '-'
  }
]

const roleOptions = [
  { value: 'Técnico', label: 'Técnico' },
  { value: 'Técnico Mecânico', label: 'Técnico Mecânico' },
  { value: 'Técnico Elétrico', label: 'Técnico Elétrico' },
  { value: 'Técnico Eletrônico', label: 'Técnico Eletrônico' },
  { value: 'Engenheiro', label: 'Engenheiro' },
  { value: 'Supervisor', label: 'Supervisor' }
]

// Estatísticas
const activeTechnicians = computed(() => {
  return store.technicians.filter(tech => tech.active)
})

const techniciansByRole = computed(() => {
  const roles = store.technicians.reduce((acc, tech) => {
    acc[tech.role] = (acc[tech.role] || 0) + 1
    return acc
  }, {} as Record<string, number>)
  return Object.entries(roles).map(([role, count]) => ({ role, count }))
})

function resetForm() {
  formData.value = {
    name: '',
    role: 'Técnico',
    email: '',
    phone: '',
    skills: [],
    skillInput: ''
  }
}

function addSkill() {
  if (formData.value.skillInput.trim() && !formData.value.skills.includes(formData.value.skillInput.trim())) {
    formData.value.skills.push(formData.value.skillInput.trim())
    formData.value.skillInput = ''
  }
}

function removeSkill(skill: string) {
  const index = formData.value.skills.indexOf(skill)
  if (index > -1) {
    formData.value.skills.splice(index, 1)
  }
}

function addTechnician() {
  if (!formData.value.name) return

  store.add({
    name: formData.value.name,
    role: formData.value.role,
    email: formData.value.email || undefined,
    phone: formData.value.phone || undefined,
    active: true,
    skills: formData.value.skills
  })

  resetForm()
  showCreateModal.value = false
}
</script>

<template>
  <div class="page">
    <div class="page-header">
      <div class="page-header__content">
        <h1 class="page-title">Equipes</h1>
        <p class="page-subtitle">Gerencie técnicos e equipe de manutenção</p>
      </div>
      <div class="page-header__actions">
        <Button variant="primary" @click="showCreateModal = true">
          Novo Técnico
        </Button>
      </div>
    </div>

    <!-- Estatísticas -->
    <div class="stats-grid">
      <BaseCard>
        <div class="stat">
          <div class="stat__value">{{ activeTechnicians.length }}</div>
          <div class="stat__label">Técnicos Ativos</div>
        </div>
      </BaseCard>

      <BaseCard>
        <div class="stat">
          <div class="stat__value">{{ store.technicians.length }}</div>
          <div class="stat__label">Total de Técnicos</div>
        </div>
      </BaseCard>

      <BaseCard>
        <div class="stat">
          <div class="stat__value">{{ techniciansByRole.length }}</div>
          <div class="stat__label">Funções Diferentes</div>
        </div>
      </BaseCard>
    </div>

    <BaseCard>
      <DataTable
        :data="store.technicians"
        :columns="columns"
        searchable
        sortable
        striped
        hoverable
        empty-text="Nenhum técnico cadastrado"
      >
        <template #cell-active="{ value }">
          <span class="status-badge" :class="value ? 'status-badge--active' : 'status-badge--inactive'">
            {{ value ? 'Ativo' : 'Inativo' }}
          </span>
        </template>
      </DataTable>
    </BaseCard>

    <Modal v-model="showCreateModal" title="Novo Técnico" size="md">
      <form @submit.prevent="addTechnician">
        <div class="form-grid">
          <InputField
            v-model="formData.name"
            label="Nome Completo"
            placeholder="Digite o nome do técnico"
            required
          />

          <SelectField
            v-model="formData.role"
            label="Função"
            :options="roleOptions"
            required
          />

          <InputField
            v-model="formData.email"
            label="E-mail"
            placeholder="email@empresa.com"
            type="email"
          />

          <InputField
            v-model="formData.phone"
            label="Telefone"
            placeholder="(11) 99999-9999"
          />

          <div class="form-full-width">
            <label class="form-field__label">Habilidades</label>
            <div class="skills-input">
              <InputField
                v-model="formData.skillInput"
                placeholder="Digite uma habilidade"
                @keyup.enter="addSkill"
              />
              <Button variant="outline" size="sm" @click="addSkill">
                Adicionar
              </Button>
            </div>
            <div v-if="formData.skills.length > 0" class="skills-list">
              <span
                v-for="skill in formData.skills"
                :key="skill"
                class="skill-tag"
              >
                {{ skill }}
                <button type="button" @click="removeSkill(skill)" class="skill-remove">×</button>
              </span>
            </div>
          </div>
        </div>
      </form>

      <template #footer>
        <Button variant="ghost" @click="showCreateModal = false">
          Cancelar
        </Button>
        <Button variant="primary" @click="addTechnician">
          Adicionar Técnico
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

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: var(--spacing-md);
  margin-bottom: var(--spacing-lg);
}

.stat {
  text-align: center;
  padding: var(--spacing-md);
}

.stat__value {
  font-size: var(--font-size-xl);
  font-weight: 700;
  color: var(--color-accent);
  margin-bottom: var(--spacing-xs);
}

.stat__label {
  font-size: var(--font-size-sm);
  color: var(--color-text-secondary);
}

.form-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: var(--spacing-md);
}

.form-full-width {
  grid-column: 1 / -1;
}

.skills-input {
  display: flex;
  gap: var(--spacing-sm);
  margin-bottom: var(--spacing-sm);
}

.skills-list {
  display: flex;
  flex-wrap: wrap;
  gap: var(--spacing-xs);
}

.skill-tag {
  display: inline-flex;
  align-items: center;
  gap: var(--spacing-xs);
  padding: var(--spacing-xs) var(--spacing-sm);
  background-color: var(--color-background);
  border: 1px solid var(--color-border);
  border-radius: var(--border-radius-md);
  font-size: var(--font-size-sm);
}

.skill-remove {
  background: none;
  border: none;
  color: var(--color-text-secondary);
  cursor: pointer;
  font-size: var(--font-size-base);
  line-height: 1;
  padding: 0;
  margin-left: var(--spacing-xs);
}

.skill-remove:hover {
  color: var(--color-error);
}

.status-badge {
  display: inline-flex;
  align-items: center;
  padding: 0.25rem 0.5rem;
  border-radius: var(--border-radius-sm);
  font-size: var(--font-size-xs);
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.025em;
}

.status-badge--active {
  background-color: rgba(16, 185, 129, 0.1);
  color: var(--color-success);
}

.status-badge--inactive {
  background-color: rgba(239, 68, 68, 0.1);
  color: var(--color-error);
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

  .skills-input {
    flex-direction: column;
  }
}
</style>