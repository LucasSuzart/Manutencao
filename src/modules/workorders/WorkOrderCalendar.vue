<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter, RouterLink } from 'vue-router'
import { useWorkOrderStore } from '../../stores/workorders'
import { useAssetStore } from '../../stores/assets'
import { useTechnicianStore } from '../../stores/technicians'
import { Button, BaseCard } from '../shared/ui'
import { formatDate } from '../shared/date'

const router = useRouter()
const woStore = useWorkOrderStore()
const assetStore = useAssetStore()
const techStore = useTechnicianStore()

// Estado do calendário
const currentDate = ref(new Date())
const currentWeekStart = computed(() => {
  const date = new Date(currentDate.value)
  const day = date.getDay() // 0 = domingo, 1 = segunda, etc.
  const diff = date.getDate() - day + (day === 0 ? -6 : 1) // Ajustar para começar na segunda-feira
  return new Date(date.setDate(diff))
})

// Estado para arrastar e soltar
const draggedOrder = ref<any>(null)
const isDragging = ref(false)

// Dias da semana
const weekDays = computed(() => {
  const days = []
  const start = new Date(currentWeekStart.value)
  
  for (let i = 0; i < 7; i++) {
    const date = new Date(start)
    date.setDate(start.getDate() + i)
    days.push(date)
  }
  
  return days
})

// Formatar data para exibição
function formatDay(date: Date) {
  return date.toLocaleDateString('pt-BR', { weekday: 'short', day: 'numeric' })
}

function formatMonth(date: Date) {
  return date.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })
}

function formatTime(time: string) {
  return time.substring(0, 5) // Formato: "HH:MM"
}

// Navegar entre semanas
function previousWeek() {
  const newDate = new Date(currentDate.value)
  newDate.setDate(newDate.getDate() - 7)
  currentDate.value = newDate
}

function nextWeek() {
  const newDate = new Date(currentDate.value)
  newDate.setDate(newDate.getDate() + 7)
  currentDate.value = newDate
}

function goToToday() {
  currentDate.value = new Date()
}

// Ordens de serviço para a semana atual
const weekWorkOrders = computed(() => {
  // Filtrar ordens que têm data planejada na semana atual
  const startOfWeek = new Date(currentWeekStart.value)
  startOfWeek.setHours(0, 0, 0, 0)
  
  const endOfWeek = new Date(startOfWeek)
  endOfWeek.setDate(endOfWeek.getDate() + 6)
  endOfWeek.setHours(23, 59, 59, 999)
  
  return woStore.workOrders.filter(wo => {
    // Incluir ordens sem planejamento ou dentro da semana atual
    if (!wo.plannedStart) return true
    
    const woDate = new Date(wo.plannedStart)
    return woDate >= startOfWeek && woDate <= endOfWeek
  })
})

// Organizar as ordens de serviço por dia e hora
const ordersPerDay = computed(() => {
  const result = {} as Record<string, any[]>
  
  // Inicializar dias
  weekDays.value.forEach(day => {
    const dayKey = day.toISOString().split('T')[0]
    result[dayKey] = []
  })
  
  // Agrupar ordens por dia (apenas planejadas)
  weekWorkOrders.value.forEach(order => {
    if (!order.plannedStart) return
    const dayKey = new Date(order.plannedStart).toISOString().split('T')[0]
    if (result[dayKey]) result[dayKey].push(order)
  })
  
  // Ordenar por hora
  Object.keys(result).forEach(day => {
    result[day].sort((a, b) => {
      if (!a.plannedStart) return -1
      if (!b.plannedStart) return 1
      return new Date(a.plannedStart).getTime() - new Date(b.plannedStart).getTime()
    })
  })
  
  return result
})

// Sidebar: ordens não planejadas
const searchUnplanned = ref('')
const unplannedOrders = computed(() => {
  const list = woStore.workOrders.filter(o => !o.plannedStart)
  const q = searchUnplanned.value.trim().toLowerCase()
  if (!q) return list
  return list.filter(o =>
    o.title.toLowerCase().includes(q) ||
    (o.code && o.code.toLowerCase().includes(q)) ||
    getAssetName(o.assetId).toLowerCase().includes(q)
  )
})

// Gerar horários para o calendário (de 7h às 18h)
const timeSlots = computed(() => {
  const slots = []
  for (let hour = 7; hour <= 18; hour++) {
    slots.push(`${hour.toString().padStart(2, '0')}:00`)
    slots.push(`${hour.toString().padStart(2, '0')}:30`)
  }
  return slots
})

// Obter nome do ativo
function getAssetName(assetId: string | undefined) {
  if (!assetId) return 'Sem ativo'
  const asset = assetStore.byId(assetId)
  return asset ? asset.name : 'Ativo não encontrado'
}

// Obter nome do técnico
function getTechnicianName(techIds: string[] | undefined) {
  if (!techIds || techIds.length === 0) return 'Não atribuído'
  const tech = techStore.byId(techIds[0])
  return tech ? tech.name : 'Técnico não encontrado'
}

// Criar nova ordem de serviço
function createWorkOrder() {
  router.push({ name: 'workorders' })
}

// Editar uma ordem de serviço
function editWorkOrder(order: any) {
  router.push({ name: 'workorder-detail', params: { id: order.id } })
}

// Classes de estilo para diferentes tipos de ordens de serviço
function getOrderClasses(order: any) {
  const classes = ['calendar-event']
  
  if (order.isNotPlanned) {
    classes.push('event-not-planned')
  }
  
  switch (order.type) {
    case 'corrective':
      classes.push('event-corrective')
      break
    case 'preventive':
      classes.push('event-preventive')
      break
    case 'predictive':
      classes.push('event-predictive')
      break
    case 'inspection':
      classes.push('event-inspection')
      break
    default:
      classes.push('event-other')
  }
  
  switch (order.priority) {
    case 'low':
      classes.push('priority-low')
      break
    case 'medium':
      classes.push('priority-medium')
      break
    case 'high':
      classes.push('priority-high')
      break
    case 'critical':
      classes.push('priority-critical')
      break
  }
  
  if (isDragging.value && draggedOrder.value?.id === order.id) {
    classes.push('is-dragging')
  }
  
  return classes.join(' ')
}

// Funções de arrastar e soltar
function onDragStart(event: DragEvent, order: any) {
  if (!order.isNotPlanned) return
  
  if (event.dataTransfer) {
    event.dataTransfer.effectAllowed = 'move'
    event.dataTransfer.setData('application/json', JSON.stringify(order))
    draggedOrder.value = order
    isDragging.value = true
  }
}

function onDragEnd() {
  draggedOrder.value = null
  isDragging.value = false
}

function onDragOver(event: DragEvent, timeSlot: string, day: Date) {
  if (!draggedOrder.value || !draggedOrder.value.isNotPlanned) return
  
  event.preventDefault()
  event.dataTransfer!.dropEffect = 'move'
  
  // Adicionar classe visual para indicar área de drop
  if (event.currentTarget) {
    (event.currentTarget as HTMLElement).classList.add('drag-over')
  }
}

function onDragLeave(event: DragEvent) {
  // Remover classe visual quando o cursor sai da área
  if (event.currentTarget) {
    (event.currentTarget as HTMLElement).classList.remove('drag-over')
  }
}

function onDrop(event: DragEvent, timeSlot: string, day: Date) {
  event.preventDefault()
  
  // Remover classe visual
  if (event.currentTarget) {
    (event.currentTarget as HTMLElement).classList.remove('drag-over')
  }
  
  if (!draggedOrder.value || !draggedOrder.value.isNotPlanned) return
  
  const orderData = JSON.parse(event.dataTransfer!.getData('application/json'))
  const orderId = orderData.id
  
  // Montar a data e hora planejadas
  const [hours, minutes] = timeSlot.split(':')
  const plannedDate = new Date(day)
  plannedDate.setHours(parseInt(hours), parseInt(minutes), 0, 0)
  
  // Atualizar a ordem de serviço
  woStore.update(orderId, {
    plannedStart: plannedDate.toISOString(),
    plannedEnd: new Date(plannedDate.getTime() + 2 * 60 * 60 * 1000).toISOString() // + 2 horas por padrão
  })
  
  draggedOrder.value = null
  isDragging.value = false
}
</script>

<template>
  <div class="workorder-calendar">
    <div class="calendar-header">
      <div class="calendar-title">
        <h2>{{ formatMonth(currentWeekStart) }}</h2>
      </div>
      <div class="calendar-nav">
        <RouterLink to="/os">
          <Button variant="secondary" size="sm">
            Lista de OS
          </Button>
        </RouterLink>
        <Button variant="secondary" size="sm" @click="previousWeek">
          &lt; Semana anterior
        </Button>
        <Button variant="primary" size="sm" @click="goToToday">
          Hoje
        </Button>
        <Button variant="secondary" size="sm" @click="nextWeek">
          Próxima semana &gt;
        </Button>
        <Button variant="primary" @click="createWorkOrder">
          + Nova OS
        </Button>
      </div>
    </div>
    
    <div class="calendar-layout">
      <div class="calendar-sidebar">
        <div class="sidebar-header">Não planejadas</div>
        <div class="sidebar-search"><input type="text" v-model="searchUnplanned" placeholder="Buscar..." /></div>
        <div class="sidebar-list">
          <div v-for="order in unplannedOrders" :key="order.id" :class="getOrderClasses({ ...order, isNotPlanned: true })"
               draggable="true" @dragstart="onDragStart($event, { ...order, isNotPlanned: true })" @dragend="onDragEnd" @click="editWorkOrder(order)">
            <div class="event-title">{{ order.title }}</div>
            <div class="event-asset">{{ getAssetName(order.assetId) }}</div>
          </div>
        </div>
      </div>
      <div class="calendar-container">
      <!-- Cabeçalho dos dias -->
      <div class="calendar-days-header">
        <div class="calendar-time-column"></div>
        <div v-for="(day, index) in weekDays" 
             :key="index" 
             class="calendar-day-header"
             :class="{ 'today': new Date().toDateString() === day.toDateString() }">
          {{ formatDay(day) }}
        </div>
      </div>
      
      <!-- Grid principal do calendário -->
      <div class="calendar-time-grid">
        <div v-for="(timeSlot, timeIndex) in timeSlots" 
             :key="timeIndex" 
             class="calendar-time-row">
          <div class="calendar-time-column">{{ timeSlot }}</div>
          <div v-for="(day, dayIndex) in weekDays" 
               :key="dayIndex" 
               class="calendar-day-column"
               @dragover="onDragOver($event, timeSlot, day)"
               @dragleave="onDragLeave($event)"
               @drop="onDrop($event, timeSlot, day)">
            <div v-for="(order, orderIndex) in ordersPerDay[day.toISOString().split('T')[0]].filter(o => {
                   if (!o.plannedStart) return false
                   const orderTime = new Date(o.plannedStart).toTimeString().substring(0, 5)
                   return orderTime === timeSlot
                 })"
                 :key="orderIndex" 
                 :class="getOrderClasses(order)"
                 @click="editWorkOrder(order)">
              <div class="event-time">{{ order.code }}</div>
              <div class="event-title">{{ order.title }}</div>
              <div class="event-asset">{{ getAssetName(order.assetId) }}</div>
              <div class="event-tech">{{ getTechnicianName(order.assignedToIds) }}</div>
            </div>
          </div>
        </div>
      </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.workorder-calendar {
  display: flex;
  flex-direction: column;
  height: 100%;
  width: 100%;
}

.calendar-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--spacing-md);
  padding: var(--spacing-md);
  background-color: var(--color-background);
  border-radius: var(--border-radius-md);
}

.calendar-title h2 {
  margin: 0;
  font-size: 1.5rem;
  text-transform: capitalize;
}

.calendar-nav {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
}

.calendar-layout { display: grid; grid-template-columns: 280px 1fr; gap: var(--spacing-md); }

.calendar-container {
  flex: 1;
  display: flex;
  flex-direction: column;
  border: 1px solid var(--color-border);
  border-radius: var(--border-radius-md);
  overflow: hidden;
}

.calendar-sidebar {
  border: 1px solid var(--color-border);
  border-radius: var(--border-radius-md);
  background: var(--color-surface);
  display: flex;
  flex-direction: column;
  max-height: 80vh;
}
.sidebar-header { font-weight: 600; padding: 8px 12px; border-bottom: 1px solid var(--color-border); }
.sidebar-search { padding: 8px 12px; border-bottom: 1px solid var(--color-border); }
.sidebar-search input { width: 100%; padding: 6px 8px; border: 1px solid var(--color-border); border-radius: 6px; font-size: 12px; }
.sidebar-list { padding: 8px; overflow: auto; display: flex; flex-direction: column; gap: 6px; }
.sidebar-list .calendar-event { margin: 0; }

.calendar-days-header {
  display: flex;
  background-color: var(--color-background-alt);
  border-bottom: 1px solid var(--color-border);
}

.calendar-time-column {
  width: 80px;
  min-width: 80px;
  padding: var(--spacing-sm);
  text-align: center;
  font-weight: 500;
  border-right: 1px solid var(--color-border);
  display: flex;
  align-items: center;
  justify-content: center;
}

.calendar-day-header {
  flex: 1;
  padding: var(--spacing-sm);
  text-align: center;
  font-weight: 500;
  border-right: 1px solid var(--color-border);
}

.calendar-day-header.today {
  background-color: rgba(59, 130, 246, 0.1);
  font-weight: 700;
}

.calendar-unplanned-section {
  display: flex;
  border-bottom: 2px solid var(--color-border);
}

.calendar-time-grid {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.calendar-time-row {
  display: flex;
  border-bottom: 1px solid var(--color-border);
}

.calendar-time-row:nth-child(even) {
  background-color: var(--color-background-alt);
}

.calendar-day-column {
  flex: 1;
  min-height: 60px;
  border-right: 1px solid var(--color-border);
  padding: 2px;
  position: relative;
}

.unplanned-column {
  min-height: 100px;
}

/* Eventos do calendário */
.calendar-event {
  margin: 2px;
  padding: var(--spacing-xs);
  border-radius: var(--border-radius-sm);
  background-color: #e5f0ff;
  border-left: 4px solid #2563eb;
  cursor: pointer;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
  overflow: hidden;
}

.calendar-event:hover {
  transform: translateY(-2px);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.event-time {
  font-size: 0.75rem;
  font-weight: 600;
}

.event-title {
  font-weight: 500;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.event-asset, .event-tech {
  font-size: 0.75rem;
  color: var(--color-text-secondary);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

/* Cores por tipo de OS */
.event-corrective {
  background-color: #fee2e2;
  border-left-color: #ef4444;
}

.event-preventive {
  background-color: #dcfce7;
  border-left-color: #10b981;
}

.event-predictive {
  background-color: #dbeafe;
  border-left-color: #3b82f6;
}

.event-inspection {
  background-color: #fef3c7;
  border-left-color: #f59e0b;
}

.event-not-planned {
  background-color: #f1f5f9;
  border-left-color: #64748b;
  border-style: dashed;
}

/* Cores por prioridade */
.priority-critical {
  box-shadow: 0 0 0 1px #ef4444;
}

.priority-high {
  box-shadow: 0 0 0 1px #f59e0b;
}

/* Estilos para arrastar e soltar */
.is-dragging {
  opacity: 0.5;
  transform: scale(0.95);
}

.calendar-day-column.drag-over {
  background-color: rgba(59, 130, 246, 0.1);
}

/* Responsividade */
@media (max-width: 768px) {
  .calendar-header {
    flex-direction: column;
    align-items: flex-start;
  }
  
  .calendar-nav {
    margin-top: var(--spacing-sm);
    flex-wrap: wrap;
  }
  
  .calendar-time-column {
    width: 60px;
    min-width: 60px;
  }
  .calendar-layout { grid-template-columns: 1fr; }
  .calendar-sidebar { order: 2; }
}
</style>