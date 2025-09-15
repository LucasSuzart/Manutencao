<script setup lang="ts">
import { useRoute, useRouter } from 'vue-router'
import { computed, ref } from 'vue'
import { useAssetStore } from '../../stores/assets'
import { useLocationStore } from '../../stores/locations'
import { useWorkOrderStore } from '../../stores/workorders'
import { Button, BaseCard, StatusBadge } from '../shared/ui'
import QRPanel from './QRPanel.vue'
import { formatDate } from '../shared/date'

const route = useRoute()
const router = useRouter()
const id = route.params.id as string
const store = useAssetStore()
const locStore = useLocationStore()
const woStore = useWorkOrderStore()

const asset = computed(() => store.byId(id))
const location = computed(() => {
  if (!asset.value?.location) return null
  return locStore.byId(asset.value.location)
})

// Gerar URL completa para o ativo (para QR code)
function getPublicBase() {
  // Em produção, o site é hospedado em GitHub Pages neste repo
  if (import.meta.env.PROD) return 'https://lucassuzart.github.io/Manutencao'
  // Em dev, usa base local
  return window.location.origin
}

const assetUrl = computed(() => `${getPublicBase()}/ativos/${id}`)

// QR print handling
const qrRef = ref<InstanceType<typeof QRPanel> | null>(null)
function printAssetQR() {
  const dataUrl = qrRef.value?.toDataURL()
  if (!dataUrl || !asset.value) return
  const w = window.open('', '_blank', 'width=400,height=500')
  if (!w) return
  const html = `
    <html>
    <head>
      <meta charset="utf-8" />
      <title>QR - ${asset.value.name}</title>
      <style>
        body { font-family: Arial, sans-serif; text-align:center; padding: 12px; }
        img { width: 240px; height: 240px; }
        .name { margin-top: 8px; font-weight: 600; }
        .code { color: #555; }
      </style>
    </head>
    <body>
      <img src="${dataUrl}" alt="QR" />
      <div class="name">${asset.value.name}</div>
      <div class="code">${asset.value.code}</div>
      <script>window.onload = () => { window.print(); setTimeout(() => window.close(), 300); };<\/script>
    </body>
    </html>`
  w.document.write(html)
  w.document.close()
}

// Simular planos de serviço para o ativo
const servicePlans = computed(() => {
  // Implementação real seria buscar os planos de manutenção associados ao ativo
  // Por enquanto, vamos retornar um array vazio para a demonstração
  return []
})

// Responsável pelo ativo (técnico ou equipe)
const responsibleName = computed(() => {
  // Em uma implementação real, buscaria o técnico responsável
  return 'TIME MANUTENÇÃO'
})

// Data da última inspeção
const lastInspectionDate = computed(() => {
  const inspectionWOs = assetWorkOrders.value.filter(wo => 
    wo.type === 'inspection' && wo.status === 'completed'
  )
  if (inspectionWOs.length === 0) return null
  return inspectionWOs.sort((a, b) => 
    new Date(b.completedAt!).getTime() - new Date(a.completedAt!).getTime()
  )[0].completedAt
})

// Obter histórico de ordens de serviço para este ativo
const assetWorkOrders = computed(() => {
  if (!asset.value) return []
  return woStore.workOrders.filter(wo => wo.assetId === id)
    .sort((a, b) => {
      // Ordenar por data de criação, mais recentes primeiro
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    })
})

// Calcular métricas básicas
const metrics = computed(() => {
  if (!assetWorkOrders.value.length) {
    return {
      totalOrders: 0,
      pendingOrders: 0,
      lastMaintenance: null,
      completedOrders: 0,
      completionRate: 0,
      corrective: 0,
      preventive: 0
    }
  }

  const total = assetWorkOrders.value.length
  const pending = assetWorkOrders.value.filter(wo => 
    wo.status !== 'completed' && wo.status !== 'canceled'
  ).length
  const completed = assetWorkOrders.value.filter(wo => wo.status === 'completed').length
  
  const lastCompleted = assetWorkOrders.value
    .filter(wo => wo.completedAt)
    .sort((a, b) => new Date(b.completedAt!).getTime() - new Date(a.completedAt!).getTime())[0]
    
  const corrective = assetWorkOrders.value.filter(wo => wo.type === 'corrective').length
  const preventive = assetWorkOrders.value.filter(wo => 
    wo.type === 'preventive' || wo.type === 'predictive' || wo.type === 'inspection'
  ).length
  
  return {
    totalOrders: total,
    pendingOrders: pending,
    completedOrders: completed,
    completionRate: total ? Math.round((completed / total) * 100) : 0,
    lastMaintenance: lastCompleted?.completedAt || null,
    corrective,
    preventive
  }
})

// Formatar datas em formato pt-BR
function formatDateBR(date: string | undefined | null) {
  if (!date) return 'N/A'
  return new Date(date).toLocaleDateString('pt-BR')
}

// Navegação
function goEdit() { 
  router.push({ name: 'assets-edit', params: { id } }) 
}

function goToWorkOrders() {
  router.push({ 
    name: 'workorders-new',
    query: { 
      assetId: id,
      assetName: asset.value?.name
    }
  })
}

function goToWorkOrder(orderId: string) {
  router.push({ name: 'workorder-detail', params: { id: orderId }})
}

function visualizarOrdens(type: 'pending' | 'completed') {
  router.push({ 
    name: 'workorders', 
    query: { 
      assetId: id, 
      status: type === 'pending' ? ['open', 'in_progress', 'paused'] : ['completed']
    }
  })
}
</script>

<template>
  <div class="asset-detail page" v-if="asset">
    <div class="page-header">
      <div class="asset-header">
        <div class="asset-icon">
          <i class="fas fa-cogs"></i>
        </div>
        <div class="asset-title">
          <h1>{{ asset.name }}</h1>
          <p class="muted">Código: {{ asset.code }}</p>
        </div>
      </div>
      <div>
        <Button variant="secondary" @click="goEdit">Editar</Button>
      </div>
    </div>

    <div class="detail-grid">
      <!-- Coluna principal (esquerda) -->
      <div class="detail-main">
        <!-- Imagem do equipamento -->
        <BaseCard class="asset-image-card">
          <div class="asset-image-container">
            <img 
              src="https://via.placeholder.com/400x300?text=Imagem+do+Equipamento" 
              alt="Imagem do equipamento" 
              class="asset-image"
            />
          </div>
        </BaseCard>
        
        <!-- Informações de manutenção -->
        <BaseCard>
          <template #header><h3>Informações de Manutenção</h3></template>
          
          <div class="info-grid">
            <div class="info-row">
              <div class="info-label">Status:</div>
              <div class="info-value">
                <StatusBadge v-if="asset.status" :status="asset.status" type="asset" />
              </div>
            </div>
            
            <div class="info-row">
              <div class="info-label">Criticidade:</div>
              <div class="info-value">
                <StatusBadge v-if="asset.criticality" :status="asset.criticality" type="criticality" />
              </div>
            </div>
            
            <div class="info-row">
              <div class="info-label">Instalação:</div>
              <div class="info-value">{{ formatDateBR(asset?.installationDate) }}</div>
            </div>

            <div class="info-row">
              <div class="info-label">Última falha:</div>
              <div class="info-value">{{ formatDateBR(asset?.lastFailureAt) }}</div>
            </div>

            <div class="info-row">
              <div class="info-label">Último reparo:</div>
              <div class="info-value">{{ formatDateBR(asset?.lastRepairAt) }}</div>
            </div>
            
            <div class="info-row">
              <div class="info-label">Localização:</div>
              <div class="info-value">{{ location?.name || '-' }}</div>
            </div>
          </div>
        </BaseCard>
        
        <!-- Solicitações -->
        <BaseCard>
          <template #header><h3>Solicitações</h3></template>
          
          <div v-if="!servicePlans.length" class="empty-item">
            <p>Nenhuma solicitação de manutenção planejada para este ativo.</p>
          </div>
          
          <div class="request-list">
            <!-- Itens de solicitação simulados baseados na imagem de referência -->
            <div class="request-item">
              <div class="request-icon">
                <i class="fas fa-clipboard-list"></i>
              </div>
              <div class="request-content">
                <div class="request-title">Verificação das Pás</div>
                <div class="tag-container">
                  <span class="tag tag-success">Planejada</span>
                </div>
              </div>
            </div>
            
            <div class="request-item">
              <div class="request-icon">
                <i class="fas fa-search"></i>
              </div>
              <div class="request-content">
                <div class="request-title">Inspeção Preventiva</div>
                <div class="tag-container">
                  <span class="tag tag-success">Planejada</span>
                </div>
              </div>
            </div>
            
            <!-- Simulação de itens de solicitação baseados na imagem -->
            <div class="request-item">
              <div class="request-icon">
                <i class="fas fa-clipboard-list"></i>
              </div>
              <div class="request-content">
                <div class="request-title">Verificação das Pás</div>
                <div class="tag-container">
                  <span class="tag tag-success">Planejada</span>
                </div>
              </div>
            </div>
            
            <div class="request-item">
              <div class="request-icon">
                <i class="fas fa-search"></i>
              </div>
              <div class="request-content">
                <div class="request-title">Inspeção Preventiva</div>
                <div class="tag-container">
                  <span class="tag tag-success">Planejada</span>
                </div>
              </div>
            </div>
          </div>
        </BaseCard>
        
        <!-- Ordens de Serviço -->
        <BaseCard>
          <template #header><h3>Ordens de Serviço</h3></template>
          
          <div class="order-summary">
            <div class="order-summary-item">
              <div class="order-summary-header">
                <span>Em aberto:</span>
                <span class="order-count">{{ metrics.pendingOrders }}</span>
              </div>
              <div class="order-summary-action">
                <Button variant="ghost" size="sm" @click="visualizarOrdens('pending')">Visualizar &rarr;</Button>
              </div>
            </div>
            
            <div class="order-summary-item">
              <div class="order-summary-header">
                <span>Concluídas:</span>
                <span class="order-count">{{ metrics.completedOrders }}</span>
              </div>
              <div class="order-summary-action">
                <Button variant="ghost" size="sm" @click="visualizarOrdens('completed')">Visualizar &rarr;</Button>
              </div>
            </div>
          </div>
        </BaseCard>
        
        <!-- Histórico de Ordens de Serviço -->
        <BaseCard class="history-card">
          <template #header>
            <div class="card-header">
              <h3>Histórico de Manutenção</h3>
              <Button variant="primary" size="sm" @click="goToWorkOrders">Nova OS</Button>
            </div>
          </template>
          
          <div v-if="assetWorkOrders.length === 0" class="empty-history">
            <p>Nenhuma ordem de serviço registrada para este ativo.</p>
          </div>
          
          <div v-else class="order-history">
            <div v-for="order in assetWorkOrders" :key="order.id" class="order-item">
              <div class="order-header">
                <div class="order-title">
                  <strong>{{ order.code }}</strong> - {{ order.title }}
                </div>
                <StatusBadge :status="order.status" type="workorder" />
              </div>
              
              <div class="order-info">
                <div class="order-details">
                  <div class="order-type">
                    <span class="label">Tipo:</span>
                    {{ order.type === 'corrective' ? 'Corretiva' : 
                       order.type === 'preventive' ? 'Preventiva' : 
                       order.type === 'predictive' ? 'Preditiva' : 
                       order.type === 'inspection' ? 'Inspeção' : 'Melhoria' }}
                  </div>
                  
                  <div class="order-date">
                    <span class="label">Data:</span>
                    {{ formatDateBR(order.createdAt) }}
                  </div>
                </div>
                
                <Button 
                  variant="ghost" 
                  size="sm" 
                  @click="goToWorkOrder(order.id)"
                >
                  Ver detalhes
                </Button>
              </div>
            </div>
          </div>
        </BaseCard>
      </div>
      
      <!-- Coluna lateral -->
      <div class="detail-side">
        <!-- Informações gerais -->
        <BaseCard>
          <template #header><h3>Informações Gerais</h3></template>
          
          <div class="info-grid">
            <div class="info-row">
              <div class="info-label">Modelo:</div>
              <div class="info-value">{{ asset?.model || 'Motobomba' }}</div>
            </div>
            
            <div class="info-row">
              <div class="info-label">Fabricante:</div>
              <div class="info-value">{{ asset?.manufacturer || '-' }}</div>
            </div>
            
            <div class="info-row">
              <div class="info-label">Série:</div>
              <div class="info-value">{{ asset?.serialNumber || '-' }}</div>
            </div>
            
            <div class="info-row">
              <div class="info-label">Categoria:</div>
              <div class="info-value">{{ asset?.category || '-' }}</div>
            </div>
          </div>
        </BaseCard>
        
        <!-- QR Code -->
        <BaseCard>
          <template #header>
            <div class="card-header">
              <h3>Código QR</h3>
              <Button size="sm" variant="secondary" @click="printAssetQR">🖨️ Imprimir</Button>
            </div>
          </template>
          <div class="qr-container">
            <QRPanel v-if="asset" ref="qrRef" :value="assetUrl" :caption="assetUrl" />
          </div>
        </BaseCard>
        
        <!-- Responsável -->
        <BaseCard>
          <template #header><h3>Responsável</h3></template>
          
          <div class="responsible-section">
            <div class="responsible-avatar">
              <i class="fas fa-user-hard-hat"></i>
            </div>
            <div class="responsible-info">
              <div class="responsible-name">{{ responsibleName }}</div>
              <div class="responsible-role">Equipe de manutenção</div>
            </div>
          </div>
        </BaseCard>
        
        <!-- Métricas e Indicadores -->
        <BaseCard>
          <template #header><h3>Métricas</h3></template>
          
          <div class="metrics">
            <div class="metric-item">
              <div class="metric-label">Total OS:</div>
              <div class="metric-value">{{ metrics.totalOrders }}</div>
            </div>
            
            <div class="metric-item">
              <div class="metric-label">OS Pendentes:</div>
              <div class="metric-value">{{ metrics.pendingOrders }}</div>
            </div>
            
            <div class="metric-item">
              <div class="metric-label">Taxa Conclusão:</div>
              <div class="metric-value">{{ metrics.completionRate }}%</div>
            </div>
            
            <div class="metric-item">
              <div class="metric-label">Última Manutenção:</div>
              <div class="metric-value">{{ formatDateBR(metrics.lastMaintenance) }}</div>
            </div>
            
            <div class="metric-item">
              <div class="metric-label">OS Corretivas:</div>
              <div class="metric-value">{{ metrics.corrective }}</div>
            </div>
            
            <div class="metric-item">
              <div class="metric-label">OS Preventivas:</div>
              <div class="metric-value">{{ metrics.preventive }}</div>
            </div>
          </div>
        </BaseCard>
      </div>
    </div>
  </div>
  
  <!-- Mensagem de erro se o ativo não for encontrado -->
  <div class="asset-not-found page" v-else>
    <h2>Ativo não encontrado</h2>
    <p>O ativo solicitado não existe ou foi removido.</p>
    <Button variant="primary" @click="router.push({ name: 'assets' })">Voltar para Ativos</Button>
  </div>
</template>

<style scoped>
/* Layout principal */
.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--spacing-lg);
}

.asset-header {
  display: flex;
  align-items: center;
  gap: var(--spacing-md);
}

.asset-icon {
  width: 42px;
  height: 42px;
  background-color: #e5f0ff;
  color: #2563eb;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 18px;
}

.asset-title {
  display: flex;
  flex-direction: column;
}

.detail-grid {
  display: grid;
  grid-template-columns: 1fr 350px;
  gap: var(--spacing-lg);
}

.detail-main {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-lg);
}

.detail-side {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-lg);
}

/* Imagem do ativo */
.asset-image-container {
  display: flex;
  justify-content: center;
  padding: var(--spacing-md);
}

.asset-image {
  max-width: 100%;
  border-radius: var(--border-radius-md);
  border: 1px solid var(--color-border);
}

/* Informações gerais */
.info-grid {
  display: grid;
  row-gap: var(--spacing-sm);
}

.info-row {
  display: grid;
  grid-template-columns: 120px 1fr;
  align-items: center;
}

.info-label {
  font-weight: 500;
  color: var(--color-text-secondary);
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

/* Solicitações */
.empty-item {
  padding: var(--spacing-lg);
  text-align: center;
  color: var(--color-text-secondary);
}

.request-list {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-sm);
}

.request-item {
  padding: var(--spacing-md);
  border-radius: var(--border-radius-sm);
  background-color: #f8fafc;
  display: flex;
  align-items: center;
  gap: var(--spacing-md);
}

.request-icon {
  width: 32px;
  height: 32px;
  background-color: #e5f0ff;
  color: #2563eb;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.request-content {
  flex: 1;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.request-title {
  font-weight: 500;
}

.tag-container {
  display: flex;
  gap: var(--spacing-xs);
}

.tag {
  padding: 2px 8px;
  border-radius: 12px;
  font-size: var(--font-size-xs);
  font-weight: 500;
}

.tag-success {
  background-color: #dcfce7;
  color: #10b981;
}

.tag-warning {
  background-color: #fef3c7;
  color: #f59e0b;
}

/* Resumo de Ordens de Serviço */
.order-summary {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-sm);
}

.order-summary-item {
  padding: var(--spacing-md);
  border-radius: var(--border-radius-sm);
  background-color: #f8fafc;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.order-summary-header {
  font-weight: 500;
  display: flex;
  align-items: center;
  gap: var(--spacing-md);
}

.order-count {
  font-size: 18px;
  font-weight: 600;
  color: #2563eb;
}

/* Histórico de Ordens de Serviço */
.empty-history {
  padding: var(--spacing-lg);
  text-align: center;
  color: var(--color-text-secondary);
}

.order-history {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-md);
}

.order-item {
  padding: var(--spacing-md);
  border: 1px solid var(--color-border);
  border-radius: var(--border-radius-md);
  background-color: var(--color-surface);
}

.order-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--spacing-sm);
}

.order-info {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.order-details {
  display: flex;
  gap: var(--spacing-lg);
}

.order-type, .order-date {
  color: var(--color-text-secondary);
  font-size: var(--font-size-sm);
}

.label {
  font-weight: 500;
  margin-right: var(--spacing-xs);
}

/* QR Code */
.qr-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--spacing-md);
  padding: var(--spacing-md);
}

.qr-info {
  text-align: center;
  font-size: var(--font-size-sm);
  color: var(--color-text-secondary);
  width: 100%;
}

.qr-url {
  padding: var(--spacing-xs);
  background-color: var(--color-background);
  border-radius: var(--border-radius-sm);
  border: 1px solid var(--color-border);
  word-break: break-all;
  font-size: var(--font-size-xs);
  margin-top: var(--spacing-xs);
}

/* Responsável */
.responsible-section {
  display: flex;
  align-items: center;
  gap: var(--spacing-md);
  padding: var(--spacing-md);
}

.responsible-avatar {
  width: 48px;
  height: 48px;
  background-color: #e5f0ff;
  color: #2563eb;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
}

.responsible-info {
  display: flex;
  flex-direction: column;
}

.responsible-name {
  font-weight: 600;
}

.responsible-role {
  font-size: var(--font-size-sm);
  color: var(--color-text-secondary);
}

/* Métricas */
.metrics {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-sm);
}

.metric-item {
  display: flex;
  justify-content: space-between;
  padding: var(--spacing-xs) 0;
  border-bottom: 1px solid var(--color-border);
}

.metric-item:last-child {
  border-bottom: none;
}

.metric-label {
  font-weight: 500;
  color: var(--color-text-secondary);
}

.metric-value {
  font-weight: 600;
}

.muted {
  color: var(--color-text-secondary);
}

/* Mensagem de ativo não encontrado */
.asset-not-found {
  text-align: center;
  padding: var(--spacing-xl);
  max-width: 500px;
  margin: 0 auto;
}

/* Responsividade */
@media (max-width: 900px) {
  .detail-grid {
    grid-template-columns: 1fr;
  }
}
</style>
