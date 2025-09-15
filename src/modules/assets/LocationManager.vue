<script setup lang="ts">
import { ref, computed } from 'vue'
import { useLocationStore } from '../../stores/locations'
import { Button, InputField, BaseCard, SelectField, Modal } from '../shared/ui'
import type { Location } from '../../types/core'

// Definimos uma string especial para representar o null, já que o SelectField não aceita null como valor
const NULL_VALUE = 'null';

const store = useLocationStore()
const showAddModal = ref(false)
const formData = ref({
  name: '',
  code: '',
  parentId: NULL_VALUE,
  description: ''
})
const selectedLocation = ref<Location | null>(null)
const expandedNodes = ref<string[]>([])

function toggleNode(id: string) {
  const index = expandedNodes.value.indexOf(id)
  if (index >= 0) {
    expandedNodes.value.splice(index, 1)
  } else {
    expandedNodes.value.push(id)
  }
}

function isNodeExpanded(id: string) {
  return expandedNodes.value.includes(id)
}

function addLocation() {
  if (!formData.value.name) return
  
  store.add({
    name: formData.value.name,
    code: formData.value.code || undefined,
    parentId: formData.value.parentId === NULL_VALUE ? undefined : formData.value.parentId,
    description: formData.value.description || undefined
  })
  
  // Se adicionamos um nó filho, expanda o pai automaticamente
  if (formData.value.parentId !== NULL_VALUE && !expandedNodes.value.includes(formData.value.parentId)) {
    expandedNodes.value.push(formData.value.parentId)
  }
  
  resetForm()
  showAddModal.value = false
}

function editLocation(location: Location) {
  selectedLocation.value = location
  formData.value = {
    name: location.name,
    code: location.code || '',
    parentId: location.parentId || NULL_VALUE,
    description: location.description || ''
  }
  showAddModal.value = true
}

function updateLocation() {
  if (!selectedLocation.value || !formData.value.name) return
  
  store.update(selectedLocation.value.id, {
    name: formData.value.name,
    code: formData.value.code || undefined,
    parentId: formData.value.parentId === NULL_VALUE ? undefined : formData.value.parentId,
    description: formData.value.description || undefined
  })
  
  resetForm()
  showAddModal.value = false
}

function resetForm() {
  selectedLocation.value = null
  formData.value = {
    name: '',
    code: '',
    parentId: NULL_VALUE,
    description: ''
  }
}

function remove(id: string) {
  // Verificar se tem filhos
  const hasChildren = store.locations.some(loc => loc.parentId === id)
  
  if (hasChildren && !confirm('Este local possui sublocais que também serão removidos. Deseja continuar?')) {
    return
  }
  
  store.remove(id)
}

interface TreeNode extends Location {
  level: number;
  hasChildren: boolean;
  expanded: boolean;
  childrenRendered: TreeNode[];
}

// Renderização recursiva dos nós da árvore
function renderLocationTree(nodes: Location[], level = 0): TreeNode[] {
  if (!nodes || nodes.length === 0) return []
  
  return nodes.map(node => {
    const hasChildren = !!(node.children && node.children.length > 0)
    
    return {
      ...node,
      level,
      hasChildren,
      expanded: isNodeExpanded(node.id),
      childrenRendered: hasChildren ? renderLocationTree(node.children || [], level + 1) : []
    } as TreeNode
  })
}

const locationTree = computed(() => renderLocationTree(store.tree))

const parentOptions = computed(() => {
  return [
    { value: NULL_VALUE, label: '-- Nenhum (raiz) --' },
    ...store.locations.map(loc => ({
      value: loc.id,
      label: loc.name
    }))
  ]
})
</script>

<template>
  <div class="location-manager page">
    <div class="page-header">
      <div class="page-header__content">
        <h1 class="page-title">Localizações</h1>
        <p class="page-subtitle">Gerencie a hierarquia de locais para equipamentos e estoque</p>
      </div>
      <div class="page-header__actions">
        <Button variant="primary" @click="showAddModal = true">
          Novo Local
        </Button>
      </div>
    </div>
    
    <BaseCard class="tree-card">
      <template #header>
        <div class="card-header">
          <h3>Estrutura Hierárquica</h3>
        </div>
      </template>
      
      <div class="tree-container">
        <div v-if="locationTree.length === 0" class="empty-state">
          <p>Nenhum local cadastrado. Clique em "Novo Local" para começar.</p>
        </div>
        
        <div v-else class="location-tree">
          <div 
            v-for="node in locationTree" 
            :key="node.id" 
            class="tree-node" 
            :class="{ 'has-children': node.hasChildren }"
          >
            <div class="node-content">
              <!-- Recuo baseado no nível -->
              <div class="node-indent" :style="{ width: `${node.level * 20}px` }"></div>
              
              <!-- Botão de expandir/recolher -->
              <button 
                v-if="node.hasChildren"
                class="toggle-btn" 
                @click.stop="toggleNode(node.id)"
              >
                <span v-if="node.expanded">▼</span>
                <span v-else>▶</span>
              </button>
              <span v-else class="toggle-placeholder"></span>
              
              <!-- Ícone de localização -->
              <div class="node-icon">
                <span class="material-icon">�</span>
              </div>
              
              <!-- Nome e código -->
              <div class="node-label">
                <span class="node-name">{{ node.name }}</span>
                <span v-if="node.code" class="node-code">{{ node.code }}</span>
              </div>
              
              <!-- Ações -->
              <div class="node-actions">
                <Button variant="ghost" size="sm" @click="editLocation(node)">Editar</Button>
                <Button variant="ghost" size="sm" @click="remove(node.id)">Remover</Button>
              </div>
            </div>
            
            <!-- Filhos (renderização recursiva) -->
            <div v-if="node.expanded && node.hasChildren" class="node-children">
              <div 
                v-for="childNode in node.childrenRendered" 
                :key="childNode.id" 
                class="tree-node" 
                :class="{ 'has-children': childNode.hasChildren }"
              >
                <div class="node-content">
                  <!-- Recuo baseado no nível -->
                  <div class="node-indent" :style="{ width: `${childNode.level * 20}px` }"></div>
                  
                  <!-- Botão de expandir/recolher -->
                  <button 
                    v-if="childNode.hasChildren"
                    class="toggle-btn" 
                    @click.stop="toggleNode(childNode.id)"
                  >
                    <span v-if="childNode.expanded">▼</span>
                    <span v-else>▶</span>
                  </button>
                  <span v-else class="toggle-placeholder"></span>
                  
                  <!-- Ícone de localização -->
                  <div class="node-icon">
                    <span class="material-icon">📍</span>
                  </div>
                  
                  <!-- Nome e código -->
                  <div class="node-label">
                    <span class="node-name">{{ childNode.name }}</span>
                    <span v-if="childNode.code" class="node-code">{{ childNode.code }}</span>
                  </div>
                  
                  <!-- Ações -->
                  <div class="node-actions">
                    <Button variant="ghost" size="sm" @click="editLocation(childNode)">Editar</Button>
                    <Button variant="ghost" size="sm" @click="remove(childNode.id)">Remover</Button>
                  </div>
                </div>
                
                <!-- Filhos dos filhos -->
                <div v-if="childNode.expanded && childNode.hasChildren" class="node-children">
                  <div 
                    v-for="grandChildNode in childNode.childrenRendered" 
                    :key="grandChildNode.id" 
                    class="tree-node"
                  >
                    <div class="node-content">
                      <!-- Recuo baseado no nível -->
                      <div class="node-indent" :style="{ width: `${grandChildNode.level * 20}px` }"></div>
                      
                      <!-- Espaço para o botão -->
                      <span class="toggle-placeholder"></span>
                      
                      <!-- Ícone de localização -->
                      <div class="node-icon">
                        <span class="material-icon">📍</span>
                      </div>
                      
                      <!-- Nome e código -->
                      <div class="node-label">
                        <span class="node-name">{{ grandChildNode.name }}</span>
                        <span v-if="grandChildNode.code" class="node-code">{{ grandChildNode.code }}</span>
                      </div>
                      
                      <!-- Ações -->
                      <div class="node-actions">
                        <Button variant="ghost" size="sm" @click="editLocation(grandChildNode)">Editar</Button>
                        <Button variant="ghost" size="sm" @click="remove(grandChildNode.id)">Remover</Button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </BaseCard>
  </div>
  
  <Modal v-model="showAddModal" :title="selectedLocation ? 'Editar Local' : 'Novo Local'" size="md">
    <form @submit.prevent="selectedLocation ? updateLocation() : addLocation()">
      <div class="form-grid">
        <InputField
          v-model="formData.name"
          label="Nome"
          placeholder="Ex: Área de Produção, Almoxarifado, etc."
          required
        />
        
        <InputField
          v-model="formData.code"
          label="Código"
          placeholder="Ex: PROD-A1, ALM-01, etc."
        />
        
        <SelectField
          v-model="formData.parentId"
          label="Local Pai"
          :options="parentOptions"
          :disabled="!!selectedLocation && store.locations.some(loc => selectedLocation && loc.parentId === selectedLocation.id)"
        />
        
        <InputField
          v-model="formData.description"
          label="Descrição"
          placeholder="Breve descrição sobre este local"
        />
      </div>
    </form>
    
    <template #footer>
      <Button variant="ghost" @click="showAddModal = false">Cancelar</Button>
      <Button 
        variant="primary" 
        @click="selectedLocation ? updateLocation() : addLocation()"
      >
        {{ selectedLocation ? 'Atualizar' : 'Criar' }}
      </Button>
    </template>
  </Modal>
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
}

.page-title {
  font-size: var(--font-size-xl);
  font-weight: 700;
  margin: 0 0 var(--spacing-xs) 0;
}

.page-subtitle {
  color: var(--color-text-secondary);
  margin: 0;
}

.tree-card {
  margin-bottom: var(--spacing-lg);
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.tree-container {
  min-height: 400px;
}

.empty-state {
  text-align: center;
  padding: var(--spacing-xl);
  color: var(--color-text-secondary);
}

.location-tree {
  padding: var(--spacing-md) 0;
}

.tree-node {
  margin-bottom: var(--spacing-xs);
}

.node-content {
  display: flex;
  align-items: center;
  padding: var(--spacing-xs) 0;
  border-radius: var(--border-radius-sm);
  transition: background-color 0.2s;
}

.node-content:hover {
  background-color: var(--color-background);
}

.node-indent {
  display: inline-block;
  flex-shrink: 0;
}

.toggle-btn {
  background: none;
  border: none;
  cursor: pointer;
  font-size: 10px;
  width: 20px;
  height: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--color-text-secondary);
  margin-right: var(--spacing-xs);
}

.toggle-placeholder {
  width: 20px;
  display: inline-block;
}

.node-icon {
  margin-right: var(--spacing-sm);
  color: var(--color-primary);
  width: 20px;
  height: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.node-label {
  flex: 1;
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
}

.node-name {
  font-weight: 500;
}

.node-code {
  font-size: var(--font-size-xs);
  color: var(--color-text-secondary);
  background: var(--color-background);
  padding: 2px 6px;
  border-radius: var(--border-radius-sm);
}

.node-actions {
  display: flex;
  gap: var(--spacing-xs);
  opacity: 0;
  transition: opacity 0.2s;
}

.node-content:hover .node-actions {
  opacity: 1;
}

.node-children {
  margin-left: var(--spacing-md);
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
}
</style>
