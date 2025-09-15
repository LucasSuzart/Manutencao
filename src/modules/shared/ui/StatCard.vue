<script setup lang="ts">
import { ref } from "vue";

defineProps<{
  title: string;
  value: number | string;
  unit?: string;
  change?: number;
  decimals?: number;
  color?: "default" | "primary" | "success" | "warning" | "danger";
}>();
</script>

<template>
  <div class="stat-card" :class="`stat-card--${color || 'default'}`">
    <div class="stat-card__title">{{ title }}</div>
    <div class="stat-card__value">
      {{ typeof value === "number" ? value.toFixed(decimals ?? 2) : value }}
      <span v-if="unit" class="stat-card__unit">{{ unit }}</span>
    </div>
    <div
      v-if="change !== undefined"
      class="stat-card__change"
      :class="change >= 0 ? 'positive' : 'negative'"
    >
      {{ change >= 0 ? "+" : "" }}{{ change.toFixed(1) }}%
    </div>
  </div>
</template>

<style scoped>
.stat-card {
  background: var(--color-surface);
  border-radius: var(--border-radius-md);
  box-shadow: var(--shadow-sm);
  padding: var(--spacing-md) var(--spacing-lg);
  display: flex;
  flex-direction: column;
  min-width: 140px;
  border: 1px solid var(--color-border);
}

.stat-card--primary {
  border-left: 4px solid var(--color-accent);
}

.stat-card--success {
  border-left: 4px solid var(--color-success);
}

.stat-card--warning {
  border-left: 4px solid var(--color-warning);
}

.stat-card--danger {
  border-left: 4px solid var(--color-error);
}

.stat-card__title {
  font-size: var(--font-size-xs);
  color: var(--color-text-secondary);
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin-bottom: var(--spacing-xs);
}

.stat-card__value {
  font-size: var(--font-size-xl);
  font-weight: 600;
  margin-bottom: var(--spacing-xs);
}

.stat-card__unit {
  font-size: var(--font-size-sm);
  font-weight: 400;
  color: var(--color-text-secondary);
  margin-left: var(--spacing-xs);
}

.stat-card__change {
  font-size: var(--font-size-xs);
  font-weight: 500;
}

.stat-card__change.positive {
  color: var(--color-success);
}

.stat-card__change.negative {
  color: var(--color-error);
}
</style>
