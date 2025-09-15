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
  background: linear-gradient(135deg, #ffffff 0%, #fafbfc 100%);
  border-radius: 16px;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
  padding: 2rem 1.5rem;
  display: flex;
  flex-direction: column;
  min-width: 200px;
  border: 1px solid #e5e7eb;
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
}

.stat-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 4px;
  background: linear-gradient(90deg, #f78018, #ea580c);
}

.stat-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
}

.stat-card--primary::before {
  background: linear-gradient(90deg, #f78018, #ea580c);
}

.stat-card--success::before {
  background: linear-gradient(90deg, #10b981, #059669);
}

.stat-card--warning::before {
  background: linear-gradient(90deg, #f59e0b, #d97706);
}

.stat-card--danger::before {
  background: linear-gradient(90deg, #ef4444, #dc2626);
}

.stat-card__title {
  font-size: 0.875rem;
  color: #6b7280;
  font-weight: 600;
  margin-bottom: 0.75rem;
  letter-spacing: 0.025em;
}

.stat-card__value {
  font-size: 2.25rem;
  font-weight: 800;
  margin-bottom: 0.5rem;
  color: #1f2937;
  line-height: 1;
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
