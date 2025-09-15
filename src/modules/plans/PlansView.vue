<script setup lang="ts">
import { ref, computed } from "vue";
import { useAssetStore } from "../../stores/assets";
import { useWorkOrderStore } from "../../stores/workorders";
import {
  Button,
  DataTable,
  BaseCard,
  InputField,
  SelectField,
  Modal,
  Alert,
} from "../shared/ui";

const assetStore = useAssetStore();
const woStore = useWorkOrderStore();

// Estado dos planos (simulado - em produção viria de uma store)
const plans = ref<
  Array<{
    id: string;
    code: string;
    title: string;
    assetId: string;
    strategy: "time" | "meter" | "condition";
    intervalDays?: number;
    meterType?: string;
    meterInterval?: number;
    lastExecutionAt?: string;
    nextDueAt?: string;
    active: boolean;
    checklistItems: string[];
  }>
>([
  {
    id: "1",
    code: "PLN-001",
    title: "Inspeção Mensal Compressor",
    assetId: assetStore.assets[0]?.id || "",
    strategy: "time",
    intervalDays: 30,
    lastExecutionAt: "2024-08-15T10:00:00Z",
    nextDueAt: "2024-09-15T10:00:00Z",
    active: true,
    checklistItems: [
      "Verificar vibração",
      "Verificar temperatura",
      "Verificar pressão",
      "Verificar nível de óleo",
    ],
  },
]);

// Form state
const showCreateModal = ref(false);
const editingPlan = ref<{
  id: string;
  code: string;
  title: string;
  assetId: string;
  strategy: "time" | "meter" | "condition";
  intervalDays?: number;
  meterType?: string;
  meterInterval?: number;
  lastExecutionAt?: string;
  nextDueAt?: string;
  active: boolean;
  checklistItems: string[];
} | null>(null);
const formData = ref({
  code: "",
  title: "",
  assetId: "",
  strategy: "time" as "time" | "meter" | "condition",
  intervalDays: 30,
  meterType: "",
  meterInterval: 0,
  checklistItems: [] as string[],
  checklistInput: "",
});

// Dados calculados
const plansWithAssets = computed(() => {
  return plans.value.map((plan) => ({
    ...plan,
    assetName: plan.assetId ? assetStore.byId(plan.assetId)?.name : "N/A",
    daysUntilDue: plan.nextDueAt
      ? Math.ceil(
          (new Date(plan.nextDueAt).getTime() - new Date().getTime()) /
            (1000 * 60 * 60 * 24)
        )
      : null,
    isOverdue: plan.nextDueAt ? new Date(plan.nextDueAt) < new Date() : false,
  }));
});

const overduePlans = computed(() => {
  return plansWithAssets.value.filter((plan) => plan.isOverdue && plan.active);
});

// Opções para formulários
const assetOptions = computed(() => [
  { value: "", label: "Selecione um ativo" },
  ...assetStore.assets.map((asset) => ({
    value: asset.id,
    label: asset.name,
  })),
]);

const strategyOptions = [
  { value: "time", label: "Baseado em Tempo" },
  { value: "meter", label: "Baseado em Medição" },
  { value: "condition", label: "Baseado em Condição" },
];

// Colunas da tabela
const columns = [
  { key: "code", label: "Código" },
  { key: "title", label: "Título" },
  { key: "assetName", label: "Ativo" },
  {
    key: "strategy",
    label: "Estratégia",
    format: (value: string) => {
      const labels = {
        time: "Tempo",
        meter: "Medição",
        condition: "Condição",
      };
      return labels[value as keyof typeof labels] || value;
    },
  },
  {
    key: "intervalDays",
    label: "Intervalo",
    format: (value: number, item: any) => {
      if (item.strategy === "time") {
        return `${value} dias`;
      } else if (item.strategy === "meter") {
        return `${item.meterInterval} ${item.meterType}`;
      }
      return "Por condição";
    },
  },
  {
    key: "nextDueAt",
    label: "Próxima Execução",
    format: (value: string) => (value ? new Date(value).toLocaleDateString() : "-"),
  },
  {
    key: "daysUntilDue",
    label: "Dias Restantes",
    format: (value: number | null, item: any) => {
      if (value === null) return "-";
      if (item.isOverdue) return "Vencido";
      return value.toString();
    },
  },
];

function resetForm() {
  formData.value = {
    code: "",
    title: "",
    assetId: "",
    strategy: "time",
    intervalDays: 30,
    meterType: "",
    meterInterval: 0,
    checklistItems: [],
    checklistInput: "",
  };
  editingPlan.value = null;
}

function addChecklistItem() {
  if (formData.value.checklistInput.trim()) {
    formData.value.checklistItems.push(formData.value.checklistInput.trim());
    formData.value.checklistInput = "";
  }
}

function removeChecklistItem(index: number) {
  formData.value.checklistItems.splice(index, 1);
}

function savePlan() {
  if (!formData.value.title || !formData.value.assetId) return;

  const planData = {
    id: editingPlan.value?.id || Date.now().toString(),
    code: formData.value.code || `PLN-${Date.now()}`,
    title: formData.value.title,
    assetId: formData.value.assetId,
    strategy: formData.value.strategy,
    intervalDays: formData.value.intervalDays,
    meterType: formData.value.meterType,
    meterInterval: formData.value.meterInterval,
    lastExecutionAt: editingPlan.value?.lastExecutionAt,
    nextDueAt: calculateNextDue(formData.value),
    active: true,
    checklistItems: formData.value.checklistItems,
  };

  if (editingPlan.value) {
    const index = plans.value.findIndex((p) => p.id === editingPlan.value!.id);
    if (index > -1) {
      plans.value[index] = planData;
    }
  } else {
    plans.value.push(planData);
  }

  resetForm();
  showCreateModal.value = false;
}

function calculateNextDue(planData: any): string {
  const now = new Date();
  if (planData.strategy === "time") {
    now.setDate(now.getDate() + planData.intervalDays);
  }
  return now.toISOString();
}

function executePlan(plan: any) {
  // Criar OS baseada no plano
  const workOrder = {
    title: `Execução: ${plan.title}`,
    description: `Execução automática do plano ${plan.code}`,
    assetId: plan.assetId,
    type: "preventive" as const,
    priority: "medium" as const,
    status: "open" as const,
    assignedToIds: [], // Empty array for now, can be assigned later
    checklist: plan.checklistItems.map((item: string) => ({
      id: Date.now().toString() + Math.random(),
      description: item,
      mandatory: true,
      completed: false,
    })),
    parts: [],
    labor: [],
    costs: { parts: 0, labor: 0, total: 0 },
  };

  woStore.create(workOrder);

  // Atualizar plano
  const planIndex = plans.value.findIndex((p) => p.id === plan.id);
  if (planIndex > -1) {
    plans.value[planIndex].lastExecutionAt = new Date().toISOString();
    plans.value[planIndex].nextDueAt = calculateNextDue(plans.value[planIndex]);
  }
}

function editPlan(plan: any) {
  editingPlan.value = plan;
  formData.value = {
    code: plan.code,
    title: plan.title,
    assetId: plan.assetId,
    strategy: plan.strategy,
    intervalDays: plan.intervalDays || 30,
    meterType: plan.meterType || "",
    meterInterval: plan.meterInterval || 0,
    checklistItems: [...plan.checklistItems],
    checklistInput: "",
  };
  showCreateModal.value = true;
}

function deletePlan(planId: string) {
  const index = plans.value.findIndex((p) => p.id === planId);
  if (index > -1) {
    plans.value.splice(index, 1);
  }
}
</script>

<template>
  <div class="page">
    <div class="page-header">
      <div class="page-header__content">
        <h1 class="page-title">Planos de Manutenção</h1>
        <p class="page-subtitle">Gerencie planos preventivos e preditivos</p>
      </div>
      <div class="page-header__actions">
        <Button variant="primary" @click="showCreateModal = true"> Novo Plano </Button>
      </div>
    </div>

    <Alert
      v-if="overduePlans.length > 0"
      type="warning"
      title="Planos Vencidos"
      class="mb-lg"
    >
      {{ overduePlans.length }} plano(s) de manutenção estão vencidos e precisam ser
      executados.
    </Alert>

    <!-- Estatísticas -->
    <div class="stats-grid">
      <BaseCard>
        <div class="stat">
          <div class="stat__value">{{ plans.length }}</div>
          <div class="stat__label">Total de Planos</div>
        </div>
      </BaseCard>

      <BaseCard>
        <div class="stat">
          <div class="stat__value">{{ plans.filter((p: any) => p.active).length }}</div>
          <div class="stat__label">Planos Ativos</div>
        </div>
      </BaseCard>

      <BaseCard>
        <div class="stat">
          <div class="stat__value">{{ overduePlans.length }}</div>
          <div class="stat__label">Planos Vencidos</div>
        </div>
      </BaseCard>
    </div>

    <!-- Tabela de Planos -->
    <BaseCard>
      <DataTable
        :data="plansWithAssets"
        :columns="columns"
        searchable
        sortable
        striped
        hoverable
        empty-text="Nenhum plano de manutenção cadastrado"
      >
        <template #cell-daysUntilDue="{ value, item }">
          <span :class="{ 'text-error': item.isOverdue }">
            {{ item.isOverdue ? "Vencido" : value ? `${value} dias` : "-" }}
          </span>
        </template>

        <template #actions="{ item }">
          <div class="actions">
            <Button variant="outline" size="sm" @click="executePlan(item)">
              Executar
            </Button>
            <Button variant="ghost" size="sm" @click="editPlan(item)"> Editar </Button>
            <Button variant="danger" size="sm" @click="deletePlan(item.id)">
              Excluir
            </Button>
          </div>
        </template>
      </DataTable>
    </BaseCard>

    <!-- Modal de Criação/Edição -->
    <Modal
      v-model="showCreateModal"
      :title="editingPlan ? 'Editar Plano' : 'Novo Plano'"
      size="lg"
    >
      <form @submit.prevent="savePlan">
        <div class="form-grid">
          <InputField
            v-model="formData.code"
            label="Código do Plano"
            placeholder="PLN-001"
          />

          <InputField
            v-model="formData.title"
            label="Título do Plano"
            placeholder="Inspeção mensal..."
            required
          />

          <SelectField
            v-model="formData.assetId"
            label="Ativo"
            :options="assetOptions"
            required
          />

          <SelectField
            v-model="formData.strategy"
            label="Estratégia"
            :options="strategyOptions"
            required
          />

          <InputField
            v-if="formData.strategy === 'time'"
            v-model.number="formData.intervalDays"
            label="Intervalo (dias)"
            type="number"
            placeholder="30"
            required
          />

          <InputField
            v-if="formData.strategy === 'meter'"
            v-model="formData.meterType"
            label="Tipo de Medição"
            placeholder="horas, ciclos, km..."
          />

          <InputField
            v-if="formData.strategy === 'meter'"
            v-model.number="formData.meterInterval"
            label="Intervalo de Medição"
            type="number"
            placeholder="1000"
          />

          <div class="form-full-width">
            <label class="form-field__label">Itens do Checklist</label>
            <div class="checklist-input">
              <InputField
                v-model="formData.checklistInput"
                placeholder="Digite um item do checklist"
                @keyup.enter="addChecklistItem"
              />
              <Button variant="outline" size="sm" @click="addChecklistItem">
                Adicionar
              </Button>
            </div>
            <div v-if="formData.checklistItems.length > 0" class="checklist-items">
              <div
                v-for="(item, index) in formData.checklistItems"
                :key="index"
                class="checklist-item"
              >
                {{ item }}
                <button
                  type="button"
                  @click="removeChecklistItem(index)"
                  class="checklist-remove"
                >
                  ×
                </button>
              </div>
            </div>
          </div>
        </div>
      </form>

      <template #footer>
        <Button variant="ghost" @click="showCreateModal = false"> Cancelar </Button>
        <Button variant="primary" @click="savePlan">
          {{ editingPlan ? "Salvar" : "Criar" }} Plano
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

.checklist-input {
  display: flex;
  gap: var(--spacing-sm);
  margin-bottom: var(--spacing-sm);
}

.checklist-items {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-xs);
}

.checklist-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: var(--spacing-sm);
  background-color: var(--color-background);
  border: 1px solid var(--color-border);
  border-radius: var(--border-radius-md);
  font-size: var(--font-size-sm);
}

.checklist-remove {
  background: none;
  border: none;
  color: var(--color-text-secondary);
  cursor: pointer;
  font-size: var(--font-size-base);
  line-height: 1;
  padding: 0;
  margin-left: var(--spacing-sm);
}

.checklist-remove:hover {
  color: var(--color-error);
}

.actions {
  display: flex;
  gap: var(--spacing-xs);
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

  .checklist-input {
    flex-direction: column;
  }

  .actions {
    flex-direction: column;
  }
}
</style>
