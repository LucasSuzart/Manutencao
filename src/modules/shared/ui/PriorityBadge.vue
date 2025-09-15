<script setup lang="ts">
const props = defineProps<{
  priority: "low" | "medium" | "high" | "critical";
  readonly?: boolean;
}>();

function priorityName(priority: string) {
  const names: Record<string, string> = {
    low: "Baixa",
    medium: "Média",
    high: "Alta",
    critical: "Crítica",
  };
  return names[priority] || priority;
}

function priorityColor(priority: string) {
  const colors: Record<string, string> = {
    low: "success",
    medium: "warning",
    high: "danger",
    critical: "danger",
  };
  return colors[priority] || "neutral";
}
</script>

<template>
  <div class="priority-badge" :class="`priority-badge--${priorityColor(priority)}`">
    {{ priorityName(priority) }}
  </div>
</template>

<style scoped>
.priority-badge {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: var(--spacing-xs) var(--spacing-sm);
  border-radius: var(--border-radius-sm);
  font-size: var(--font-size-xs);
  font-weight: 500;
  user-select: none;
}

.priority-badge--neutral {
  background-color: #f1f5f9;
  color: #64748b;
}

.priority-badge--success {
  background-color: #dcfce7;
  color: #10b981;
}

.priority-badge--warning {
  background-color: #fef3c7;
  color: #f59e0b;
}

.priority-badge--danger {
  background-color: #fee2e2;
  color: #ef4444;
}
</style>
