import { createRouter, createWebHistory } from 'vue-router'
import type { RouteRecordRaw } from 'vue-router'

const Dashboard = () => import('../modules/dashboard/DashboardView.vue')
const WorkOrders = () => import('../modules/workorders/WorkOrderList.vue')
const WorkOrderCalendar = () => import('../modules/workorders/WorkOrderCalendar.vue')
const WorkOrderHistory = () => import('../modules/workorders/WorkOrderHistoryView.vue')
const WorkOrderDetail = () => import('../modules/workorders/WorkOrderDetailView.vue')
const Assets = () => import('../modules/assets/AssetList.vue')
const AssetDetail = () => import('../modules/assets/AssetDetail.vue')
const AssetEdit = () => import('../modules/assets/AssetForm.vue')
const LocationManager = () => import('../modules/assets/LocationManager.vue')
const Plans = () => import('../modules/plans/PlansView.vue')
const Inventory = () => import('../modules/inventory/InventoryView.vue')
const Costs = () => import('../modules/costs/CostsView.vue')
const Teams = () => import('../modules/teams/TeamsView.vue')
const Reports = () => import('../modules/reports/ReportsView.vue')

const routes: RouteRecordRaw[] = [
  { path: '/', name: 'dashboard', component: Dashboard },
  // Redirecionamentos para manter compatibilidade com URLs antigas (/workorders ...)
  { path: '/workorders', redirect: '/os' },
  { path: '/workorders/:id', redirect: to => `/os/${to.params.id}` },
  { path: '/os', name: 'workorders', component: WorkOrders },
  { path: '/os/calendario', name: 'workorders-calendar', component: WorkOrderCalendar },
  { path: '/os/historico', name: 'workorders-history', component: WorkOrderHistory },
  { path: '/os/:id', name: 'workorder-detail', component: WorkOrderDetail },
  { path: '/planos', name: 'plans', component: Plans },
  { path: '/ativos', name: 'assets', component: Assets },
  { path: '/ativos/locais', name: 'assets-locations', component: LocationManager },
  { path: '/ativos/:id', name: 'asset-detail', component: AssetDetail },
  { path: '/ativos/:id/editar', name: 'assets-edit', component: AssetEdit },
  { path: '/estoque', name: 'inventory', component: Inventory },
  { path: '/custos', name: 'costs', component: Costs },
  { path: '/equipes', name: 'teams', component: Teams },
  { path: '/relatorios', name: 'reports', component: Reports },
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
})

export default router
