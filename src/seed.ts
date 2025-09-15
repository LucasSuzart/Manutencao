import { useAssetStore } from './stores/assets'
import { useTechnicianStore } from './stores/technicians'
import { useInventoryStore } from './stores/inventory'
import { useWorkOrderStore } from './stores/workorders'
import { useLocationStore } from './stores/locations'
import { nowIso } from './modules/shared/date'
import { v4 as uuid } from 'uuid'

// Seed inicial apenas se stores estiverem vazias
export function seedInitialData() {
  const assetStore = useAssetStore()
  const techStore = useTechnicianStore()
  const invStore = useInventoryStore()
  const woStore = useWorkOrderStore()
  const locationStore = useLocationStore()

  if (assetStore.assets.length || woStore.workOrders.length) return

  // Cria estrutura hierárquica de localização
  const fabricacaoId = locationStore.add({ name: 'FABRICAÇÃO', code: 'FAB', description: 'Área de produção gráfica' }).id
  
  const preImpressaoId = locationStore.add({ name: 'PRÉ-IMPRESSÃO', code: 'PRE', parentId: fabricacaoId, description: 'Setor de pré-impressão' }).id
  const ctpAreaId = locationStore.add({ name: 'CTP', code: 'CTP-AREA', parentId: preImpressaoId, description: 'Área de CTP' }).id
  locationStore.add({ name: 'DESIGN', code: 'DESIGN', parentId: preImpressaoId, description: 'Estações de design' })

  const impressaoId = locationStore.add({ name: 'IMPRESSÃO', code: 'IMP', parentId: fabricacaoId, description: 'Setor de impressão' }).id
  const offsetAreaId = locationStore.add({ name: 'OFFSET', code: 'OFFS', parentId: impressaoId, description: 'Máquinas offset' }).id
  const digitalAreaId = locationStore.add({ name: 'DIGITAL', code: 'DIG', parentId: impressaoId, description: 'Impressoras digitais' }).id

  const acabamentoId = locationStore.add({ name: 'ACABAMENTO', code: 'ACAB', parentId: fabricacaoId, description: 'Setor de acabamento' }).id
  const corteAreaId = locationStore.add({ name: 'CORTE', code: 'CORTE', parentId: acabamentoId, description: 'Área de corte e guilhotinas' }).id
  const dobraAreaId = locationStore.add({ name: 'DOBRA', code: 'DOBRA', parentId: acabamentoId, description: 'Área de dobradeiras' }).id
  locationStore.add({ name: 'COLA', code: 'COLA', parentId: acabamentoId, description: 'Setor de colagem' })

  const almoxId = locationStore.add({ name: 'ALMOXARIFADO', code: 'ALM', description: 'Almoxarifado central' }).id
  locationStore.add({ name: 'TINTAS', code: 'ALM-TINT', parentId: almoxId, description: 'Estoque de tintas' })
  locationStore.add({ name: 'PAPEL', code: 'ALM-PAP', parentId: almoxId, description: 'Estoque de papel' })
  locationStore.add({ name: 'PEÇAS', code: 'ALM-PC', parentId: almoxId, description: 'Peças de reposição' })

  locationStore.add({ name: 'EXPEDIÇÃO', code: 'EXP', description: 'Área de expedição e entrega' })
  locationStore.add({ name: 'ADMINISTRAÇÃO', code: 'ADM', description: 'Escritórios administrativos' })

  // Agora cria os ativos associados às localizações
  assetStore.add({
    name: 'Impressora Offset Heidelberg GTO-52',
    code: 'OFF-001',
    status: 'operational',
    criticality: 'high',
    manufacturer: 'Heidelberg',
    model: 'GTO-52',
    location: offsetAreaId,
    category: 'Impressora Offset'
  })
  
  assetStore.add({
    name: 'Guilhotina Industrial Polar 115',
    code: 'GUIL-01',
    status: 'operational',
    criticality: 'high',
    manufacturer: 'Polar',
    model: '115',
    location: corteAreaId,
    category: 'Guilhotina'
  })
  
  assetStore.add({
    name: 'Dobradeira Stahl T-52',
    code: 'DOB-01',
    status: 'maintenance',
    criticality: 'medium',
    manufacturer: 'Stahl',
    model: 'T-52',
    location: dobraAreaId,
    category: 'Dobradeira'
  })
  
  assetStore.add({
    name: 'CTP Heidelberg Suprasetter',
    code: 'CTP-01',
    status: 'operational',
    criticality: 'high',
    manufacturer: 'Heidelberg',
    model: 'Suprasetter A75',
    location: ctpAreaId,
    category: 'CTP'
  })
  
  assetStore.add({
    name: 'Impressora Digital Konica Minolta',
    code: 'DIG-01',
    status: 'operational',
    criticality: 'medium',
    manufacturer: 'Konica Minolta',
    model: 'AccurioPress C3080',
    location: digitalAreaId,
    category: 'Impressora Digital'
  })

  techStore.add({ name: 'João Silva', role: 'Técnico Mecânico', active: true, skills: ['mecânica'] })
  techStore.add({ name: 'Maria Souza', role: 'Técnica Elétrica', active: true, skills: ['elétrica'] })

  invStore.add({ sku: 'ROL-6205', name: 'Rolamento 6205', unit: 'pc', currentQty: 25, minQty: 10, cost: 18 })
  invStore.add({ sku: 'OL-ISO68', name: 'Óleo Lubrificante ISO 68', unit: 'L', currentQty: 200, minQty: 50, cost: 12 })
  invStore.add({ sku: 'COR-A45', name: 'Correia A45', unit: 'pc', currentQty: 8, minQty: 5, cost: 35 })
  invStore.add({ sku: 'BLANQ-01', name: 'Blanqueta de Impressão', unit: 'pc', currentQty: 15, minQty: 5, cost: 120 })
  invStore.add({ sku: 'CHAPA-01', name: 'Chapa CTP Offset', unit: 'pc', currentQty: 50, minQty: 10, cost: 45 })
  invStore.add({ sku: 'TINT-K', name: 'Tinta Preta Offset', unit: 'kg', currentQty: 40, minQty: 10, cost: 35 })

  // Cria algumas OS simuladas
  const now = nowIso()
  const earlier = new Date(Date.now() - 1000 * 60 * 60 * 6).toISOString() // 6h atrás
  const earlier2 = new Date(Date.now() - 1000 * 60 * 60 * 30).toISOString() // 30h atrás

  woStore.create({
    title: 'Vibração Elevada no Compressor',
    description: 'Analisar origem da vibração e corrigir',
    assetId: assetStore.assets[0].id,
    status: 'completed',
    type: 'corrective',
    priority: 'high',
    assignedToIds: [],
    plannedStart: earlier2,
    plannedEnd: now,
    startedAt: earlier2,
    completedAt: earlier2,
    checklist: [],
    parts: [],
    labor: [],
    costs: { parts: 0, labor: 0, total: 0 },
  } as any)

  woStore.create({
    title: 'Inspeção Preventiva Mensal',
    description: 'Checklist padrão de compressor',
    assetId: assetStore.assets[0].id,
    status: 'completed',
    type: 'preventive',
    priority: 'medium',
    assignedToIds: [],
    plannedStart: earlier,
    plannedEnd: now,
    startedAt: earlier,
    completedAt: now,
    checklist: [],
    parts: [],
    labor: [],
    costs: { parts: 0, labor: 0, total: 0 },
  } as any)

  // Simula downtime em OS corretiva
  const wo = woStore.workOrders.find(o => o.type === 'corrective')
  if (wo) {
    wo.downtimeMinutes = 120
    wo.startedAt = earlier2
    wo.completedAt = new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString()
  }
}
