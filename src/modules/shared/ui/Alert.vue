<script setup lang="ts">
defineProps<{
  type?: 'info' | 'success' | 'warning' | 'error'
  title?: string
  dismissible?: boolean
}>()

const emit = defineEmits<{
  (e: 'close'): void
}>()
</script>

<template>
  <div class="alert" :class="`alert--${type || 'info'}`">
    <div class="alert__icon">
      <!-- Info Icon -->
      <svg v-if="type === 'info' || !type" xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <circle cx="12" cy="12" r="10"></circle>
        <path d="M12 16v-4"></path>
        <path d="M12 8h.01"></path>
      </svg>
      
      <!-- Success Icon -->
      <svg v-else-if="type === 'success'" xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
        <path d="M22 4L12 14.01l-3-3"></path>
      </svg>
      
      <!-- Warning Icon -->
      <svg v-else-if="type === 'warning'" xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path>
        <path d="M12 9v4"></path>
        <path d="M12 17h.01"></path>
      </svg>
      
      <!-- Error Icon -->
      <svg v-else-if="type === 'error'" xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <circle cx="12" cy="12" r="10"></circle>
        <path d="M15 9l-6 6"></path>
        <path d="M9 9l6 6"></path>
      </svg>
    </div>
    
    <div class="alert__content">
      <h4 v-if="title" class="alert__title">{{ title }}</h4>
      <div class="alert__message">
        <slot></slot>
      </div>
    </div>
    
    <button v-if="dismissible" class="alert__close" @click="$emit('close')">
      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <path d="M18 6L6 18"></path>
        <path d="M6 6l12 12"></path>
      </svg>
    </button>
  </div>
</template>

<style scoped>
.alert {
  display: flex;
  padding: var(--spacing-md) var(--spacing-lg);
  border-radius: var(--border-radius-md);
  margin-bottom: var(--spacing-md);
  align-items: flex-start;
  gap: var(--spacing-md);
}

.alert--info {
  background-color: rgba(59, 130, 246, 0.1);
  border-left: 4px solid var(--color-accent);
  color: var(--color-accent);
}

.alert--success {
  background-color: rgba(16, 185, 129, 0.1);
  border-left: 4px solid var(--color-success);
  color: var(--color-success);
}

.alert--warning {
  background-color: rgba(245, 158, 11, 0.1);
  border-left: 4px solid var(--color-warning);
  color: var(--color-warning);
}

.alert--error {
  background-color: rgba(239, 68, 68, 0.1);
  border-left: 4px solid var(--color-error);
  color: var(--color-error);
}

.alert__icon {
  flex-shrink: 0;
  margin-top: 1px;
}

.alert__content {
  flex: 1;
}

.alert__title {
  font-size: var(--font-size-base);
  font-weight: 600;
  margin-bottom: var(--spacing-xs);
}

.alert__message {
  font-size: var(--font-size-sm);
  color: var(--color-text-primary);
}

.alert__close {
  background: transparent;
  border: none;
  cursor: pointer;
  padding: 0;
  color: inherit;
  opacity: 0.6;
  transition: opacity var(--transition-fast);
}

.alert__close:hover {
  opacity: 1;
}
</style>
