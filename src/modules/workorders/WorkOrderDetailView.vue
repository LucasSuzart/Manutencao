<script setup lang="ts">
import { useRoute } from "vue-router";
import { useWorkOrderStore } from "../../stores/workorders";
import { useAssetStore } from "../../stores/assets";
import { useTechnicianStore } from "../../stores/technicians";
import { computed, ref } from "vue";
import { Button, BaseCard, StatusBadge, PriorityBadge, Alert } from "../shared/ui";
import QRPanel from "../assets/QRPanel.vue";

const route = useRoute();
const woStore = useWorkOrderStore();
const assetStore = useAssetStore();
const technicianStore = useTechnicianStore();

const id = route.params.id as string;
const workOrder = computed(() => woStore.byId(id));

// QR printing helpers
const osQrRef = ref<InstanceType<typeof QRPanel> | null>(null)
const assetQrRef = ref<InstanceType<typeof QRPanel> | null>(null)
function getPublicBase() {
  if (import.meta.env.PROD) return 'https://lucassuzart.github.io/Manutencao'
  return window.location.origin
}

const osUrl = computed(() => `${getPublicBase()}/os/${id}`)
const assetUrl = computed(() => workOrder.value?.assetId ? `${getPublicBase()}/ativos/${workOrder.value.assetId}` : '')

function printQr(dataUrl: string, title: string, subtitle?: string) {
  if (!dataUrl) return
  const w = window.open('', '_blank', 'width=400,height=500')
  if (!w) return
  const html = `
    <html><head><meta charset='utf-8'/><title>${title}</title>
    <style>body{font-family:Arial,sans-serif;text-align:center;padding:12px}img{width:240px;height:240px}.t{margin-top:8px;font-weight:600}.s{color:#555}</style>
    </head><body>
    <img src='${dataUrl}' alt='QR' />
    <div class='t'>${title}</div>
    ${subtitle ? `<div class='s'>${subtitle}</div>` : ''}
    <script>window.onload=()=>{window.print();setTimeout(()=>window.close(),300)}<\/script>
    </body></html>`
  w.document.write(html)
  w.document.close()
}

// States
const note = ref("");
const partDesc = ref("");
const laborHours = ref(1);
const showAddNote = ref(false);
const showAddPart = ref(false);
const showAddLabor = ref(false);

function toggleStatus() {
  if (!workOrder.value) return;
  if (workOrder.value.status === "open") {
    woStore.update(workOrder.value.id, {
      status: "in_progress",
      startedAt: new Date().toISOString(),
    });
  } else if (workOrder.value.status === "in_progress") {
    woStore.update(workOrder.value.id, {
      status: "completed",
      completedAt: new Date().toISOString(),
    });
  }
}

function addChecklist() {
  if (!workOrder.value) return;
  woStore.addChecklistItem(
    workOrder.value.id,
    "Item " + ((workOrder.value.checklist?.length || 0) + 1)
  );
}

function toggleChecklistItem(itemId: string) {
  if (!workOrder.value) return;
  woStore.toggleChecklistItem(workOrder.value.id, itemId);
}

function addNote() {
  if (!workOrder.value || !note.value.trim()) return;
  const currentNotes = workOrder.value.notes || "";
  const newNote = `[${new Date().toLocaleString("pt-BR")}] ${note.value.trim()}\n`;
  woStore.update(workOrder.value.id, { notes: currentNotes + newNote });
  note.value = "";
  showAddNote.value = false;
}

function addPart() {
  if (!workOrder.value || !partDesc.value.trim()) return;
  const newPart = { inventoryItemId: partDesc.value.trim(), quantity: 1, unitCost: 0 };
  const currentParts = workOrder.value.parts || [];
  woStore.update(workOrder.value.id, { parts: [...currentParts, newPart] });
  partDesc.value = "";
  showAddPart.value = false;
}

function addLabor() {
  if (!workOrder.value) return;
  const newLabor = {
    technicianId: "default-technician",
    hours: laborHours.value,
    hourlyRate: 50,
  };
  const currentLabor = workOrder.value.labor || [];
  woStore.update(workOrder.value.id, { labor: [...currentLabor, newLabor] });
  laborHours.value = 1;
  showAddLabor.value = false;
}

function removePart(partId: string) {
  if (!workOrder.value) return;
  const currentParts = workOrder.value.parts || [];
  woStore.update(workOrder.value.id, {
    parts: currentParts.filter((p) => p.inventoryItemId !== partId),
  });
}

function removeLabor(laborId: string) {
  if (!workOrder.value) return;
  const currentLabor = workOrder.value.labor || [];
  woStore.update(workOrder.value.id, {
    labor: currentLabor.filter((l) => l.technicianId !== laborId),
  });
}

function getTechnicianName(technicianId: string) {
  const technician = technicianStore.technicians.find((t) => t.id === technicianId);
  return technician ? technician.name : "Técnico não encontrado";
}

function formatCurrency(value: number) {
  return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(
    value
  );
}

function formatDate(dateString: string) {
  return new Date(dateString).toLocaleString("pt-BR");
}

console.log(
  "Work Orders disponíveis:",
  woStore.workOrders.map((wo) => ({ id: wo.id, code: wo.code }))
);
console.log("ID solicitado:", id);
</script>

<template>
  <div class="workorder-detail">
    <template v-if="!workOrder">
      <div class="not-found">
        <Alert type="error" title="❌ Ordem de Serviço não encontrada">
          <p>
            A Ordem de Serviço com ID <strong>{{ id }}</strong> não foi encontrada.
          </p>
          <div class="mt-4">
            <RouterLink to="/os" class="btn btn-primary"
              >← Voltar para lista de OS</RouterLink
            >
          </div>
        </Alert>
      </div>
    </template>
    <template v-else>
      <div class="detail-header">
        <div class="header-content">
          <div class="workorder-title">
            <h1>📋 OS {{ workOrder.code || workOrder.id.substring(0, 8) }}</h1>
            <div class="workorder-badges">
              <StatusBadge :status="workOrder.status" type="workorder" readonly />
              <PriorityBadge :priority="workOrder.priority" />
            </div>
          </div>
          <p class="workorder-description">{{ workOrder.title }}</p>
        </div>
        <div class="header-actions">
          <Button
            variant="primary"
            @click="toggleStatus"
            :disabled="
              workOrder.status === 'completed' || workOrder.status === 'canceled'
            "
          >
            {{
              workOrder.status === "open"
                ? "▶️ Iniciar"
                : workOrder.status === "in_progress"
                ? "✅ Finalizar"
                : "Concluída"
            }}
          </Button>
        </div>
      </div>

      <Alert
        v-if="workOrder.status === 'completed'"
        type="success"
        title="✅ Ordem de Serviço Concluída"
        class="status-alert"
      >
        Esta OS foi finalizada em
        {{ formatDate(workOrder.completedAt || workOrder.updatedAt) }}
      </Alert>
      <Alert
        v-else-if="workOrder.plannedEnd && new Date(workOrder.plannedEnd) < new Date()"
        type="warning"
        title="⚠️ Prazo Vencido"
        class="status-alert"
      >
        Esta OS está atrasada em relação ao prazo planejado
      </Alert>

      <div class="detail-grid">
        <BaseCard class="info-card">
          <template #header><h3>📋 Informações Básicas</h3></template>
          <div class="info-grid">
            <div class="info-item">
              <label>Código OS</label
              ><span>{{ workOrder.code || workOrder.id.substring(0, 8) }}</span>
            </div>
            <div class="info-item">
              <label>Título</label><span>{{ workOrder.title }}</span>
            </div>
            <div class="info-item">
              <label>Status</label><StatusBadge :status="workOrder.status" type="workorder" readonly />
            </div>
            <div class="info-item">
              <label>Prioridade</label><PriorityBadge :priority="workOrder.priority" />
            </div>
            <div class="info-item">
              <label>Tipo</label
              ><span>{{
                workOrder.type === "corrective"
                  ? "Corretiva"
                  : workOrder.type === "preventive"
                  ? "Preventiva"
                  : workOrder.type === "predictive"
                  ? "Preditiva"
                  : workOrder.type === "inspection"
                  ? "Inspeção"
                  : "Melhoria"
              }}</span>
            </div>
            <div class="info-item">
              <label>Ativo</label
              ><span>{{
                workOrder.assetId ? assetStore.byId(workOrder.assetId)?.name : "-"
              }}</span>
            </div>
            <div class="info-item">
              <label>Criado em</label><span>{{ formatDate(workOrder.createdAt) }}</span>
            </div>
            <div class="info-item">
              <label>Atualizado em</label
              ><span>{{ formatDate(workOrder.updatedAt) }}</span>
            </div>
            <div class="info-item" v-if="workOrder.startedAt">
              <label>Iniciado em</label><span>{{ formatDate(workOrder.startedAt) }}</span>
            </div>
            <div class="info-item" v-if="workOrder.completedAt">
              <label>Finalizado em</label
              ><span>{{ formatDate(workOrder.completedAt) }}</span>
            </div>
            <div class="info-item" v-if="workOrder.plannedStart">
              <label>Planejado para</label
              ><span>{{ formatDate(workOrder.plannedStart) }}</span>
            </div>
          </div>
          <div v-if="workOrder.description" class="description-section">
            <h4>Descrição</h4>
            <p>{{ workOrder.description }}</p>
          </div>
        </BaseCard>

        <BaseCard class="qr-card">
          <template #header>
            <div class="card-header">
              <h3>🔗 QR Codes</h3>
            </div>
          </template>
          <div class="qr-grid">
            <div class="qr-item">
              <div class="qr-title">OS {{ workOrder.code }}</div>
              <QRPanel ref="osQrRef" :value="osUrl" :caption="osUrl" />
              <div class="qr-actions">
                <Button size="sm" variant="secondary" @click="printQr(osQrRef?.toDataURL() || '', `OS ${workOrder.code}`)">🖨️ Imprimir</Button>
              </div>
            </div>
            <div class="qr-item" v-if="workOrder.assetId">
              <div class="qr-title">Ativo</div>
              <QRPanel ref="assetQrRef" :value="assetUrl" :caption="assetUrl" />
              <div class="qr-actions">
                <Button size="sm" variant="secondary" @click="printQr(assetQrRef?.toDataURL() || '', (assetStore.byId(workOrder.assetId!)?.name || 'Ativo'), (assetStore.byId(workOrder.assetId!)?.code || ''))">🖨️ Imprimir</Button>
              </div>
            </div>
          </div>
        </BaseCard>

        <BaseCard class="checklist-card">
          <template #header
            ><div class="card-header">
              <h3>✅ Checklist</h3>
              <Button variant="secondary" size="sm" @click="addChecklist">➕ Item</Button>
            </div></template
          >
          <div
            v-if="!workOrder.checklist || workOrder.checklist.length === 0"
            class="empty-state"
          >
            <p>Nenhum item no checklist</p>
          </div>
          <div v-else class="checklist-items">
            <div
              v-for="item in workOrder.checklist"
              :key="item.id"
              class="checklist-item"
              :class="{ completed: item.completed }"
            >
              <input
                type="checkbox"
                :checked="item.completed"
                @change="toggleChecklistItem(item.id)"
              />
              <span>{{ item.description }}</span>
            </div>
          </div>
        </BaseCard>

        <BaseCard class="technicians-card">
          <template #header><h3>👥 Responsáveis</h3></template>
          <div
            v-if="!workOrder.assignedToIds || workOrder.assignedToIds.length === 0"
            class="empty-state"
          >
            <p>Nenhum responsável atribuído</p>
          </div>
          <div v-else class="technicians-list">
            <div
              v-for="technicianId in workOrder.assignedToIds"
              :key="technicianId"
              class="technician-item"
            >
              <div class="technician-avatar">
                {{ getTechnicianName(technicianId).charAt(0).toUpperCase() }}
              </div>
              <div class="technician-info">
                <div class="technician-name">{{ getTechnicianName(technicianId) }}</div>
              </div>
            </div>
          </div>
        </BaseCard>

        <BaseCard class="parts-card">
          <template #header
            ><div class="card-header">
              <h3>🔧 Peças Utilizadas</h3>
              <Button variant="secondary" size="sm" @click="showAddPart = !showAddPart"
                >➕ Peça</Button
              >
            </div></template
          >
          <div v-if="showAddPart" class="add-form">
            <input
              v-model="partDesc"
              placeholder="Descrição da peça"
              class="form-input"
            />
            <Button variant="primary" size="sm" @click="addPart">Adicionar</Button>
            <Button variant="secondary" size="sm" @click="showAddPart = false"
              >Cancelar</Button
            >
          </div>
          <div
            v-if="!workOrder.parts || workOrder.parts.length === 0"
            class="empty-state"
          >
            <p>Nenhuma peça registrada</p>
          </div>
          <div v-else class="parts-list">
            <div v-for="(part, index) in workOrder.parts" :key="index" class="part-item">
              <div class="part-info">
                <div class="part-description">Item ID: {{ part.inventoryItemId }}</div>
                <div class="part-details">
                  Qtd: {{ part.quantity }} | Custo Unit.:
                  {{ formatCurrency(part.unitCost) }}
                </div>
              </div>
              <Button variant="danger" size="sm" @click="removePart(part.inventoryItemId)"
                >🗑️</Button
              >
            </div>
          </div>
        </BaseCard>

        <BaseCard class="labor-card">
          <template #header
            ><div class="card-header">
              <h3>👷 Mão de Obra</h3>
              <Button variant="secondary" size="sm" @click="showAddLabor = !showAddLabor"
                >➕ Trabalho</Button
              >
            </div></template
          >
          <div v-if="showAddLabor" class="add-form">
            <input
              v-model.number="laborHours"
              type="number"
              placeholder="Horas"
              class="form-input"
              min="0.5"
              step="0.5"
            />
            <Button variant="primary" size="sm" @click="addLabor">Adicionar</Button>
            <Button variant="secondary" size="sm" @click="showAddLabor = false"
              >Cancelar</Button
            >
          </div>
          <div
            v-if="!workOrder.labor || workOrder.labor.length === 0"
            class="empty-state"
          >
            <p>Nenhum trabalho registrado</p>
          </div>
          <div v-else class="labor-list">
            <div
              v-for="(labor, index) in workOrder.labor"
              :key="index"
              class="labor-item"
            >
              <div class="labor-info">
                <div class="labor-description">Técnico ID: {{ labor.technicianId }}</div>
                <div class="labor-details">
                  {{ labor.hours }}h | Taxa: {{ formatCurrency(labor.hourlyRate) }}
                </div>
              </div>
              <Button variant="danger" size="sm" @click="removeLabor(labor.technicianId)"
                >🗑️</Button
              >
            </div>
          </div>
        </BaseCard>

        <BaseCard class="costs-card">
          <template #header><h3>💰 Custos</h3></template>
          <div class="costs-summary">
            <div class="cost-item">
              <span>Peças:</span
              ><span>{{ formatCurrency(workOrder.costs?.parts || 0) }}</span>
            </div>
            <div class="cost-item">
              <span>Mão de Obra:</span
              ><span>{{ formatCurrency(workOrder.costs?.labor || 0) }}</span>
            </div>
            <div class="cost-total">
              <span>Total:</span
              ><span>{{ formatCurrency(workOrder.costs?.total || 0) }}</span>
            </div>
          </div>
        </BaseCard>

        <BaseCard class="notes-card">
          <template #header
            ><div class="card-header">
              <h3>📝 Notas e Observações</h3>
              <Button variant="secondary" size="sm" @click="showAddNote = !showAddNote"
                >➕ Nota</Button
              >
            </div></template
          >
          <div v-if="showAddNote" class="add-form">
            <textarea
              v-model="note"
              placeholder="Digite sua nota..."
              rows="3"
              class="form-textarea"
            ></textarea>
            <Button variant="primary" size="sm" @click="addNote">Salvar</Button>
            <Button variant="secondary" size="sm" @click="showAddNote = false"
              >Cancelar</Button
            >
          </div>
          <div v-if="!workOrder.notes" class="empty-state">
            <p>Nenhuma nota registrada</p>
          </div>
          <div v-else class="notes-content">
            <pre>{{ workOrder.notes }}</pre>
          </div>
        </BaseCard>
      </div>
    </template>
  </div>
</template>

<style scoped>
.workorder-detail {
  padding: 1rem 1.25rem 2rem;
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
}
.detail-header {
  display: flex;
  justify-content: space-between;
  gap: 1rem;
  flex-wrap: wrap;
}
.workorder-title {
  display: flex;
  align-items: center;
  gap: 1rem;
  flex-wrap: wrap;
}
.workorder-badges {
  display: flex;
  gap: 0.5rem;
}
.workorder-description {
  margin: 0.25rem 0 0;
  font-size: 0.95rem;
  color: #475569;
}
.detail-grid {
  display: grid;
  gap: 1rem;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
}
.card-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.5rem;
}
.empty-state {
  padding: 0.75rem;
  font-size: 0.8rem;
  color: #64748b;
  background: #f8fafc;
  border: 1px dashed #cbd5e1;
  border-radius: 6px;
  text-align: center;
}
.checklist-items,
.parts-list,
.labor-list,
.technicians-list {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}
.checklist-item {
  display: flex;
  gap: 0.5rem;
  align-items: center;
  padding: 0.4rem 0.5rem;
  border: 1px solid #e2e8f0;
  border-radius: 4px;
  background: #fff;
  font-size: 0.8rem;
}
.checklist-item.completed {
  opacity: 0.65;
  text-decoration: line-through;
}
.technician-item,
.part-item,
.labor-item {
  display: flex;
  justify-content: space-between;
  gap: 0.75rem;
  padding: 0.55rem 0.6rem;
  border: 1px solid #e2e8f0;
  background: #fff;
  border-radius: 6px;
  font-size: 0.75rem;
}
.technician-avatar {
  width: 32px;
  height: 32px;
  background: #2563eb;
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  font-weight: 600;
}
.technician-info {
  display: flex;
  flex-direction: column;
  justify-content: center;
}
.add-form {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  margin-bottom: 0.75rem;
}
.form-input,
.form-textarea {
  width: 100%;
  padding: 0.55rem 0.65rem;
  border: 1px solid #cbd5e1;
  border-radius: 6px;
  font-size: 0.8rem;
  font-family: inherit;
}
.form-textarea {
  resize: vertical;
}
.part-details,
.labor-details {
  font-size: 0.65rem;
  color: #64748b;
  margin-top: 2px;
}
.costs-summary {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  font-size: 0.8rem;
}
.cost-item,
.cost-total {
  display: flex;
  justify-content: space-between;
}
.cost-total {
  font-weight: 600;
  border-top: 1px solid #e2e8f0;
  padding-top: 0.4rem;
}
.notes-content pre {
  margin: 0;
  font-family: ui-monospace, monospace;
  font-size: 0.7rem;
  line-height: 1.2;
  white-space: pre-wrap;
  word-break: break-word;
  background: #f8fafc;
  padding: 0.6rem;
  border: 1px solid #e2e8f0;
  border-radius: 6px;
}
.status-alert {
  margin-bottom: 0.25rem;
}
.info-grid {
  display: grid;
  gap: 0.5rem;
  grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
  font-size: 0.7rem;
}
.info-item {
  display: flex;
  flex-direction: column;
  gap: 2px;
  background: #fff;
  padding: 0.45rem 0.55rem;
  border: 1px solid #e2e8f0;
  border-radius: 6px;
}
.info-item label {
  font-size: 0.6rem;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  color: #64748b;
  font-weight: 600;
}
.description-section {
  margin-top: 0.75rem;
  font-size: 0.8rem;
  line-height: 1.25;
}
.description-section h4 {
  margin: 0 0 0.35rem;
  font-size: 0.75rem;
  letter-spacing: 0.5px;
  color: #334155;
  text-transform: uppercase;
}
.header-actions {
  display: flex;
  gap: 0.5rem;
  align-items: center;
}

.page {
  padding: 1rem;
  font-size: 0.8rem;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}
.meta {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
  gap: 0.4rem;
  background: #fff;
  padding: 0.6rem 0.8rem;
  border: 1px solid #e2e8f0;
  border-radius: 6px;
  font-size: 0.7rem;
}
.actions {
  display: flex;
  gap: 0.5rem;
}
button {
  padding: 0.45rem 0.7rem;
  font-size: 0.65rem;
  border: 1px solid #cbd5e1;
  background: #fff;
  cursor: pointer;
  border-radius: 4px;
}
button:hover {
  background: #f1f5f9;
}
.checklist {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 0.3rem;
}
.checklist li {
  cursor: pointer;
  padding: 0.3rem 0.4rem;
  border: 1px solid #e2e8f0;
  border-radius: 4px;
  background: #fff;
  display: flex;
  align-items: center;
  gap: 0.4rem;
}
.checklist li.done {
  opacity: 0.6;
  text-decoration: line-through;
}
textarea {
  width: 100%;
  font-family: inherit;
  font-size: 0.7rem;
  padding: 0.4rem;
  border: 1px solid #cbd5e1;
  border-radius: 4px;
}

/* Estilos para mensagem de erro */
.not-found {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 400px;
  padding: 2rem;
}

.btn {
  display: inline-block;
  padding: 0.75rem 1.5rem;
  background: var(--color-primary);
  color: white;
  text-decoration: none;
  border-radius: 6px;
  font-weight: 500;
  transition: background-color 0.2s;
}

.btn:hover {
  background: var(--color-primary-dark);
}

.mt-4 {
  margin-top: 1rem;
}

/* QR card layout */
.qr-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 12px;
}
.qr-item { display: flex; flex-direction: column; align-items: center; }
.qr-title { font-weight: 600; margin-bottom: 4px; }
.qr-actions { margin-top: 6px; }
</style>
