<script setup lang="ts">
import { onMounted, onBeforeUnmount, watch, ref } from 'vue'
import Button from './Button.vue'

const props = defineProps<{
  modelValue: boolean
  title?: string
  size?: 'sm' | 'md' | 'lg'
  closeOnEscape?: boolean
  closeOnClickOutside?: boolean
  hideCloseButton?: boolean
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', value: boolean): void
  (e: 'close'): void
}>()

const modalRef = ref<HTMLElement | null>(null)

function close() {
  emit('update:modelValue', false)
  emit('close')
}

function handleEscape(e: KeyboardEvent) {
  if (props.closeOnEscape !== false && e.key === 'Escape') {
    close()
  }
}

function handleClickOutside(e: MouseEvent) {
  if (props.closeOnClickOutside !== false && 
      modalRef.value && 
      !modalRef.value.contains(e.target as Node)) {
    close()
  }
}

onMounted(() => {
  document.addEventListener('keydown', handleEscape)
})

onBeforeUnmount(() => {
  document.removeEventListener('keydown', handleEscape)
})

watch(() => props.modelValue, (newVal) => {
  if (newVal) {
    // Prevent scrolling when modal is open
    document.body.style.overflow = 'hidden'
    // Add event listener with delay to avoid closing the modal when it's just opened
    setTimeout(() => {
      document.addEventListener('mousedown', handleClickOutside)
    }, 10)
  } else {
    // Restore scrolling when modal is closed
    document.body.style.overflow = ''
    document.removeEventListener('mousedown', handleClickOutside)
  }
})
</script>

<template>
  <teleport to="body">
    <div v-if="modelValue" class="modal-overlay">
      <div 
        ref="modalRef"
        class="modal" 
        :class="[`modal--${size || 'md'}`]"
        role="dialog"
        aria-modal="true"
      >
        <div class="modal__header">
          <h3 v-if="title" class="modal__title">{{ title }}</h3>
          <Button 
            v-if="!hideCloseButton" 
            variant="ghost" 
            size="sm"
            icon="×" 
            class="modal__close" 
            @click="close"
          />
        </div>
        
        <div class="modal__content">
          <slot></slot>
        </div>
        
        <div v-if="$slots.footer" class="modal__footer">
          <slot name="footer"></slot>
        </div>
      </div>
    </div>
  </teleport>
</template>

<style scoped>
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: var(--spacing-md);
}

.modal {
  background-color: var(--color-surface);
  border-radius: var(--border-radius-lg);
  box-shadow: var(--shadow-md);
  display: flex;
  flex-direction: column;
  max-height: calc(100vh - 2rem);
  width: 100%;
}

.modal--sm {
  max-width: 400px;
}

.modal--md {
  max-width: 600px;
}

.modal--lg {
  max-width: 800px;
}

.modal__header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: var(--spacing-lg);
  padding-bottom: var(--spacing-md);
  border-bottom: 1px solid var(--color-border);
}

.modal__title {
  font-size: var(--font-size-lg);
  font-weight: 600;
  margin: 0;
  color: var(--color-text-primary);
}

.modal__close {
  font-size: 1.5rem;
  line-height: 1;
  cursor: pointer;
}

.modal__content {
  padding: var(--spacing-lg);
  overflow-y: auto;
  flex: 1;
}

.modal__footer {
  padding: var(--spacing-lg);
  padding-top: var(--spacing-md);
  border-top: 1px solid var(--color-border);
  display: flex;
  justify-content: flex-end;
  gap: var(--spacing-md);
}
</style>
