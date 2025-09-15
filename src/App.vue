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
        <RouterLink to="/">Dashboard</RouterLink>
        <RouterLink to="/os">Ordens</RouterLink>
        <RouterLink to="/os/historico">Histórico OS</RouterLink>
        <RouterLink to="/planos">Planos</RouterLink>
        <RouterLink to="/ativos">Ativos</RouterLink>
        <RouterLink to="/estoque">Estoque</RouterLink>
        <RouterLink to="/custos">Custos</RouterLink>
        <RouterLink to="/equipes">Equipes</RouterLink>
        <RouterLink to="/relatorios">Relatórios</RouterLink>
      </nav>
      <div class="nav__footer">v0.1.0</div>
    </aside>
    <div class="workspace">
      <header class="topbar">
        <div class="topbar__title">CMMS</div>
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
  background: var(--color-primary);
  color: var(--color-text-inverted);
  display: flex;
  flex-direction: column;
  padding: var(--spacing-lg) var(--spacing-md);
  gap: var(--spacing-lg);
}

.nav__brand {
  font-weight: 600;
  font-size: var(--font-size-xl);
  color: var(--color-text-inverted);
  letter-spacing: 0.5px;
}

.nav__menu {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-xs);
}

.nav__menu a {
  padding: var(--spacing-sm) var(--spacing-md);
  border-radius: var(--border-radius-md);
  text-decoration: none;
  color: var(--color-text-inverted);
  font-weight: 500;
  font-size: var(--font-size-sm);
  transition: background-color var(--transition-fast);
}

.nav__menu a.router-link-active {
  background: var(--color-primary-hover);
}

.nav__menu a:hover {
  background: var(--color-primary-active);
}

.nav__footer {
  margin-top: auto;
  font-size: var(--font-size-xs);
  opacity: 0.6;
}

.workspace {
  display: flex;
  flex-direction: column;
  background: var(--color-background);
}

.topbar {
  height: var(--topbar-height);
  background: var(--color-surface);
  border-bottom: 1px solid var(--color-border);
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 var(--spacing-lg);
  position: sticky;
  top: 0;
  z-index: 10;
  box-shadow: var(--shadow-sm);
}

.topbar__title {
  font-size: var(--font-size-base);
  font-weight: 600;
  letter-spacing: 0.5px;
}

.main {
  padding: var(--spacing-lg) var(--spacing-xl) var(--spacing-xxl);
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
