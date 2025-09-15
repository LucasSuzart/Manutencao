<script setup lang="ts">
import { RouterLink, RouterView } from "vue-router";
import { ref } from "vue";
import { Button, Modal } from "./modules/shared/ui";

const resetDataModal = ref(false);

function resetData() {
  localStorage.clear();
  location.reload();
}
</script>

<template>
  <div class="app-shell">
    <aside class="nav">
      <div class="nav__brand">eMainPrint Manager</div>
      <nav class="nav__menu">
        <RouterLink to="/dashboard">Dashboard</RouterLink>
        <RouterLink to="/ativos">Ativos</RouterLink>
        <RouterLink to="/os">Ordens</RouterLink>
        <RouterLink to="/os/calendario">Calendário OS</RouterLink>
        <RouterLink to="/os/historico">Histórico OS</RouterLink>
        <RouterLink to="/planos">Planos</RouterLink>
        <RouterLink to="/estoque">Estoque</RouterLink>
        <RouterLink to="/custos">Custos</RouterLink>
        <RouterLink to="/equipes">Equipes</RouterLink>
        <RouterLink to="/relatorios">Relatórios</RouterLink>
      </nav>
      <div class="nav__footer">v0.1.0</div>
    </aside>
    <div class="workspace">
      <header class="topbar">
        <div class="topbar__title">eMainPrint Manager</div>
        <div class="topbar__actions">
          <Button variant="outline" size="sm" @click="resetDataModal = true">
            Resetar Dados
          </Button>
        </div>
      </header>
      <main class="main">
        <RouterView />
      </main>
    </div>
  </div>

  <Modal v-model="resetDataModal" title="Resetar Dados" size="sm">
    <p>Tem certeza que deseja resetar todos os dados? Esta ação não pode ser desfeita.</p>
    <template #footer>
      <Button variant="ghost" size="sm" @click="resetDataModal = false">Cancelar</Button>
      <Button variant="danger" size="sm" @click="resetData">Resetar</Button>
    </template>
  </Modal>
</template>

  <style>
/* Estilos específicos do App */
.app-shell {
  display: grid;
  grid-template-columns: var(--sidebar-width) 1fr;
  min-height: 100vh;
}

.nav {
  background: #ffffff;
  color: var(--color-text-primary);
  display: flex;
  flex-direction: column;
  padding: var(--spacing-xl) var(--spacing-lg);
  gap: var(--spacing-xl);
  border-right: 1px solid #e5e7eb;
  box-shadow: 2px 0 10px rgba(0, 0, 0, 0.05);
}

.nav__brand {
  font-weight: 700;
  font-size: var(--font-size-lg);
  color: #f78018;
  letter-spacing: 0.5px;
  text-align: center;
  padding: var(--spacing-md);
  border-radius: var(--border-radius-lg);
  background: linear-gradient(135deg, #fff7ed, #fed7aa);
  border: 2px solid #fdba74;
  box-shadow: 0 2px 8px rgba(247, 128, 24, 0.15);
}

.nav__menu {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-xs);
}

.nav__menu a {
  padding: var(--spacing-md) var(--spacing-lg);
  border-radius: var(--border-radius-lg);
  text-decoration: none;
  color: #4b5563;
  font-weight: 500;
  font-size: var(--font-size-base);
  transition: all var(--transition-normal);
  position: relative;
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
}

.nav__menu a::before {
  content: '';
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: #d1d5db;
  transition: all var(--transition-normal);
}

.nav__menu a.router-link-active {
  background: linear-gradient(135deg, #fff7ed, #fed7aa);
  color: #f78018;
  font-weight: 600;
  box-shadow: 0 2px 8px rgba(247, 128, 24, 0.15);
  border: 1px solid #fdba74;
}

.nav__menu a.router-link-active::before {
  background: #f78018;
  box-shadow: 0 0 0 3px rgba(247, 128, 24, 0.2);
}

.nav__menu a:hover {
  background: #f9fafb;
  color: #374151;
  transform: translateX(4px);
}

.nav__menu a:hover::before {
  background: #9ca3af;
}

.nav__footer {
  margin-top: auto;
  font-size: var(--font-size-xs);
  opacity: 0.6;
  text-align: center;
  color: #9ca3af;
  font-weight: 500;
}

.workspace {
  display: flex;
  flex-direction: column;
  background: #fafbfc;
}

.topbar {
  height: var(--topbar-height);
  background: #ffffff;
  border-bottom: 1px solid #e5e7eb;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 var(--spacing-xl);
  position: sticky;
  top: 0;
  z-index: 10;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.topbar__title {
  font-size: var(--font-size-lg);
  font-weight: 700;
  letter-spacing: 0.5px;
  color: #f78018;
}

.main {
  padding: var(--spacing-xl) var(--spacing-xxl) var(--spacing-xxl);
  background: linear-gradient(135deg, #fafbfc 0%, #f3f4f6 100%);
  min-height: calc(100vh - var(--topbar-height));
}

@media (max-width: 940px) {
  .app-shell {
    grid-template-columns: var(--sidebar-width-collapsed) 1fr;
  }

  .nav__menu a {
    font-size: 0;
    position: relative;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .nav__menu a::after {
    content: attr(to);
    font-size: var(--font-size-xs);
    position: absolute;
    opacity: 0.8;
  }

  .nav__brand {
    font-size: var(--font-size-sm);
    text-align: center;
  }
}
</style>
