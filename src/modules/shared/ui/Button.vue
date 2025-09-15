<script setup lang="ts">
defineProps<{
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger'
  size?: 'sm' | 'md' | 'lg'
  disabled?: boolean
  block?: boolean
  icon?: string
}>()

defineEmits<{
  (e: 'click', event: MouseEvent): void
}>()
</script>

<template>
  <button
    class="btn"
    :class="{
      [`btn--${variant || 'primary'}`]: true,
      [`btn--${size || 'md'}`]: true,
      'btn--block': block,
      'btn--icon': icon && !$slots.default
    }"
    :disabled="disabled"
    @click="$emit('click', $event)"
  >
    <span v-if="icon" class="btn__icon" :class="$slots.default ? 'btn__icon--left' : ''">{{ icon }}</span>
    <slot></slot>
  </button>
</template>

<style scoped>
.btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: var(--border-radius-md);
  font-weight: 500;
  text-align: center;
  cursor: pointer;
  transition: all var(--transition-fast);
  outline: none;
  white-space: nowrap;
  border: 1px solid transparent;
  gap: var(--spacing-xs);
}

.btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

/* Sizes */
.btn--sm {
  font-size: var(--font-size-xs);
  padding: var(--spacing-xs) var(--spacing-md);
  height: 28px;
}

.btn--md {
  font-size: var(--font-size-sm);
  padding: var(--spacing-sm) var(--spacing-lg);
  height: 36px;
}

.btn--lg {
  font-size: var(--font-size-base);
  padding: var(--spacing-md) var(--spacing-xl);
  height: 44px;
}

/* Variants */
.btn--primary {
  background-color: var(--color-accent);
  color: var(--color-text-inverted);
  border-color: var(--color-accent);
}

.btn--primary:hover:not(:disabled) {
  background-color: var(--color-accent-hover);
  border-color: var(--color-accent-hover);
}

.btn--secondary {
  background-color: var(--color-surface);
  color: var(--color-text-primary);
  border-color: var(--color-border);
}

.btn--secondary:hover:not(:disabled) {
  background-color: var(--color-background);
  border-color: var(--color-text-secondary);
}

.btn--outline {
  background-color: transparent;
  color: var(--color-accent);
  border-color: var(--color-accent);
}

.btn--outline:hover:not(:disabled) {
  background-color: rgba(59, 130, 246, 0.05);
}

.btn--ghost {
  background-color: transparent;
  color: var(--color-text-primary);
  border-color: transparent;
}

.btn--ghost:hover:not(:disabled) {
  background-color: rgba(15, 23, 42, 0.05);
}

.btn--danger {
  background-color: var(--color-error);
  color: var(--color-text-inverted);
  border-color: var(--color-error);
}

.btn--danger:hover:not(:disabled) {
  background-color: #dc2626;
  border-color: #dc2626;
}

/* Block */
.btn--block {
  display: flex;
  width: 100%;
}

/* Icon button */
.btn--icon {
  padding: 0;
  aspect-ratio: 1/1;
}

.btn__icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

.btn__icon--left {
  margin-right: var(--spacing-xs);
}
</style>
