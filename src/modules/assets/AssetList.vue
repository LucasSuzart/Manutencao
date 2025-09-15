<script setup lang="ts">
import { ref } from "vue";
import { useRouter } from "vue-router";
import { useAssetStore } from "../../stores/assets";
import { useLocationStore } from "../../stores/locations";
import { computed } from "vue";
import {
  Button,
  DataTable,
  BaseCard,
  InputField,
  SelectField,
  Modal,
  StatusBadge,
} from "../shared/ui";
import { assetTemplates } from './AssetTemplates'

const store = useAssetStore();
const router = useRouter();
const showCatalog = ref(false);
const locationStore = useLocationStore();
const assets = computed(() => store.assets);

// Form state
const showCreateModal = ref(false);
const formData = ref({
  name: "",
  code: "",
  status: "operational" as const,
  criticality: "medium" as const,
  category: "",
  location: "",
  manufacturer: "",
  model: "",
});

const columns = [
  { key: "name", label: "Nome" },
  { key: "code", label: "Código" },
  {
    key: "status",
    label: "Status",
    format: (value: string) => {
      const labels = {
        operational: "Operacional",
        down: "Parado",
        maintenance: "Manutenção",
        retired: "Retirado",
      };
      return labels[value as keyof typeof labels] || value;
    },
  },
  {
    key: "criticality",
    label: "Criticidade",
    format: (value: string) => {
      const labels = {
        low: "Baixa",
        medium: "Média",
        high: "Alta",
      };
      return labels[value as keyof typeof labels] || value;
    },
  },
  { key: "category", label: "Categoria" },
  {
    key: "location",
    label: "Localização",
    format: (value: string) => {
      const location = locationStore.locations.find((loc) => loc.id === value);
      return location ? location.name : value;
    },
  },
  { key: "actions", label: "Ações" },
];

function openAsset(id: string) {
  // navigate to detail using router (respects base)
  router.push({ name: "asset-detail", params: { id } });
}

function editAsset(id: string) {
  router.push({ name: "assets-edit", params: { id } });
}

const statusOptions = [
  { value: "operational", label: "Operacional" },
  { value: "down", label: "Parado" },
  { value: "maintenance", label: "Manutenção" },
  { value: "retired", label: "Retirado" },
];

const criticalityOptions = [
  { value: "low", label: "Baixa" },
  { value: "medium", label: "Média" },
  { value: "high", label: "Alta" },
];

// Função para formatar as opções de localização hierarquicamente
function formatLocationOptions(locations: any[]) {
  const result: { value: string; label: string }[] = [];

  // Primeiro adiciona todas as localizações raiz
  const rootLocations = locations.filter((loc) => !loc.parentId);
  rootLocations.forEach((loc) => {
    result.push({
      value: loc.id,
      label: loc.name,
    });

    // Adiciona localizações filhas com recuo
    addChildLocations(loc.id, 1, result, locations);
  });

  return result;
}

// Adiciona localizações filhas recursivamente com recuo visual
function addChildLocations(
  parentId: string,
  level: number,
  result: any[],
  allLocations: any[]
) {
  const children = allLocations.filter((loc) => loc.parentId === parentId);

  children.forEach((child) => {
    const indent = "—".repeat(level) + " ";
    result.push({
      value: child.id,
      label: indent + child.name + (child.code ? ` (${child.code})` : ""),
    });

    // Recursivamente adiciona os filhos deste filho
    addChildLocations(child.id, level + 1, result, allLocations);
  });
}

function resetForm() {
  formData.value = {
    name: "",
    code: "",
    status: "operational",
    criticality: "medium",
    category: "",
    location: "",
    manufacturer: "",
    model: "",
  };
}

function addAsset() {
  if (!formData.value.name || !formData.value.code) return;

  store.add({
    name: formData.value.name,
    code: formData.value.code,
    status: formData.value.status,
    criticality: formData.value.criticality,
    category: formData.value.category || undefined,
    location: formData.value.location || undefined,
    manufacturer: formData.value.manufacturer || undefined,
    model: formData.value.model || undefined,
  });

  resetForm();
  showCreateModal.value = false;
}

function addFromTemplate(tpl: any) {
  store.add({
    name: tpl.name,
    code: tpl.code,
    status: 'operational',
    criticality: 'medium',
    category: tpl.category,
    manufacturer: tpl.manufacturer,
    model: tpl.model,
    imageUrl: tpl.imageUrl
  });
  showCatalog.value = false;
}

function resolveTemplateUrl(url?: string) {
  if (!url) return ''
  if (url.startsWith('data:') || url.startsWith('http')) return url
  const base = import.meta.env.BASE_URL || '/'
  if (url.startsWith('/')) return base.replace(/\/$/, '') + url
  return base + url
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
        <Button
          variant="secondary"
          @click.prevent="$router.push({ name: 'assets-locations' })"
          >Gerenciar Locais</Button
        >
          <Button variant="ghost" @click.prevent="showCatalog = true">Adicionar do Catálogo</Button>
          <Button variant="primary" @click="showCreateModal = true"> Novo Ativo </Button>
      </div>
    </div>

    <BaseCard>
      <Modal v-model="showCatalog" title="Catálogo de Ativos" size="md">
        <div style="display:flex;flex-direction:column;gap:12px">
          <div v-for="tpl in assetTemplates" :key="tpl.code" style="display:flex;align-items:center;gap:12px;padding:8px;border:1px solid var(--color-border);border-radius:6px">
            <img :src="resolveTemplateUrl(tpl.imageUrl)" alt="tpl" style="width:80px;height:56px;object-fit:cover;border-radius:4px" />
            <div style="flex:1">
              <div style="font-weight:600">{{ tpl.name }}</div>
              <div style="color:var(--color-text-secondary);font-size:12px">{{ tpl.manufacturer }} — {{ tpl.model }}</div>
            </div>
            <div>
              <Button size="sm" variant="primary" @click="addFromTemplate(tpl)">Adicionar</Button>
            </div>
          </div>
        </div>
      </Modal>
      <DataTable
        :data="assets"
        :columns="columns"
        searchable
        sortable
        striped
        hoverable
        empty-text="Nenhum ativo cadastrado"
      >
        <template #cell-name="{ item, value }">
          <a href="" @click.prevent="openAsset(item.id)" class="asset-link">{{
            value
          }}</a>
        </template>

        <template #cell-status="{ value }">
          <StatusBadge :status="value" type="asset" />
        </template>

        <template #cell-criticality="{ value }">
          <StatusBadge :status="value" type="criticality" />
        </template>

        <template #actions="{ item }">
          <div class="row-actions">
            <Button variant="ghost" size="sm" @click="openAsset(item.id)">Ver</Button>
            <Button variant="secondary" size="sm" @click="editAsset(item.id)"
              >Editar</Button
            >
          </div>
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
        <Button variant="ghost" @click="showCreateModal = false"> Cancelar </Button>
        <Button variant="primary" @click="addAsset"> Criar Ativo </Button>
      </template>
    </Modal>
  </div>
</template>

<style scoped>
.page {
  padding: var(--spacing-lg);
  max-width: 1200px;
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

.row-actions { display:flex; gap:8px }

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
