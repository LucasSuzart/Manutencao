// Tipos centrais do CMMS
export type ID = string;

export interface Timestamped {
  createdAt: string; // ISO
  updatedAt: string; // ISO
}

export interface Asset extends Timestamped {
  id: ID;
  name: string;
  code: string; // tag patrimonial / código interno
  imageUrl?: string; // opcional: caminho relativo para imagem do ativo (ex: /images/maquina.jpg)
  category?: string;
  location?: string;
  status: 'operational' | 'down' | 'maintenance' | 'retired';
  criticality: 'low' | 'medium' | 'high';
  manufacturer?: string;
  model?: string;
  serialNumber?: string;
  installationDate?: string;
  expectedLifeMonths?: number;
  mtbfHours?: number; // estimativa
  lastFailureAt?: string;
  lastRepairAt?: string;
  customFields?: Record<string, string | number | boolean | null>;
}

export interface InventoryItem extends Timestamped {
  id: ID;
  sku: string;
  name: string;
  description?: string;
  unit: string;
  currentQty: number;
  minQty: number;
  cost: number; // custo médio
  location?: string;
  assetId?: ID; // peça associada a um ativo
  customFields?: Record<string, string | number | boolean | null>;
}

export interface Technician extends Timestamped {
  id: ID;
  name: string;
  role: string;
  email?: string;
  phone?: string;
  active: boolean;
  skills: string[];
  hourlyRate?: number;
}

export interface WorkOrderChecklistItem {
  id: ID;
  description: string;
  mandatory: boolean;
  completed: boolean;
  result?: string; // valor medido
}

export interface WorkOrder extends Timestamped {
  id: ID;
  code: string; // número OS
  title: string;
  description?: string;
  assetId?: ID;
  status: 'open' | 'in_progress' | 'paused' | 'completed' | 'canceled';
  type: 'corrective' | 'preventive' | 'predictive' | 'inspection' | 'improvement';
  priority: 'low' | 'medium' | 'high' | 'critical';
  requester?: string;
  assignedToIds: ID[]; // técnicos
  plannedStart?: string;
  plannedEnd?: string;
  startedAt?: string;
  completedAt?: string;
  downtimeMinutes?: number; // parada de máquina
  checklist: WorkOrderChecklistItem[];
  parts: { inventoryItemId: ID; quantity: number; unitCost: number }[];
  labor: { technicianId: ID; hours: number; hourlyRate: number }[];
  costs: {
    parts: number;
    labor: number;
    total: number;
  };
  failureCause?: string;
  rootCause?: string;
  notes?: string;
}

export interface MaintenancePlan extends Timestamped {
  id: ID;
  code: string;
  title: string;
  assetId: ID;
  strategy: 'time' | 'meter' | 'condition';
  intervalDays?: number; // para time
  meterType?: string; // horas, ciclos etc
  meterInterval?: number;
  lastExecutionAt?: string;
  nextDueAt?: string;
  generateAheadDays?: number;
  defaultChecklistTemplateId?: ID;
  active: boolean;
}

export interface ChecklistTemplate extends Timestamped {
  id: ID;
  name: string;
  items: { id: ID; description: string; mandatory: boolean }[];
}

export interface KPISet {
  mttrHours?: number;
  mtbfHours?: number;
  availabilityPercent?: number;
  totalDowntimeMinutes?: number;
  totalWorkOrders?: number;
  completedWorkOrders?: number;
  completionRatePercent?: number;
  maintenanceCost?: number;
  avgResponseHours?: number;
}

export interface ReportFilter {
  assetIds?: ID[];
  from?: string;
  to?: string;
  types?: WorkOrder['type'][];
  statuses?: WorkOrder['status'][];
}

export interface Location extends Timestamped {
  id: ID;
  name: string;
  code?: string;
  parentId?: ID | null; // hierarquia pai -> filho
  description?: string;
  tags?: string[];
  customFields?: Record<string, string | number | boolean | null>;
  children?: Location[];
}
