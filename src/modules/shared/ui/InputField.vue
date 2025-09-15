<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps<{
  modelValue: string | number
  label?: string
  placeholder?: string
  type?: string
  disabled?: boolean
  error?: string
  id?: string
  required?: boolean
  helpText?: string
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', value: string | number): void
}>()

const inputId = computed(() => props.id || `input-${Math.random().toString(36).substring(2, 9)}`)
</script>

<template>
  <div class="form-field" :class="{ 'form-field--error': error }">
    <label v-if="label" :for="inputId" class="form-field__label">
      {{ label }}
      <span v-if="required" class="form-field__required">*</span>
    </label>
    
    <input
      :id="inputId"
      :type="type || 'text'"
      :value="modelValue"
      :placeholder="placeholder"
      :disabled="disabled"
      class="form-field__input"
      @input="$emit('update:modelValue', ($event.target as HTMLInputElement).value)"
    >
    
    <div v-if="error" class="form-field__error">{{ error }}</div>
    <div v-else-if="helpText" class="form-field__help">{{ helpText }}</div>
  </div>
</template>

<style scoped>
.form-field {
  margin-bottom: var(--spacing-md);
}

.form-field__label {
  display: block;
  font-size: var(--font-size-sm);
  font-weight: 500;
  margin-bottom: var(--spacing-xs);
  color: var(--color-text-primary);
}

.form-field__required {
  color: var(--color-error);
  margin-left: 2px;
}

.form-field__input {
  width: 100%;
  padding: var(--spacing-sm) var(--spacing-md);
  border: 1px solid var(--color-border);
  border-radius: var(--border-radius-md);
  background-color: var(--color-surface);
  font-size: var(--font-size-base);
  line-height: 1.5;
  color: var(--color-text-primary);
  transition: border-color var(--transition-fast), box-shadow var(--transition-fast);
}

.form-field__input:focus {
  outline: none;
  border-color: var(--color-accent);
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.15);
}

.form-field__input:disabled {
  background-color: var(--color-background);
  opacity: 0.7;
  cursor: not-allowed;
}

.form-field--error .form-field__input {
  border-color: var(--color-error);
}

.form-field--error .form-field__input:focus {
  box-shadow: 0 0 0 3px rgba(239, 68, 68, 0.15);
}

.form-field__error {
  font-size: var(--font-size-xs);
  color: var(--color-error);
  margin-top: var(--spacing-xs);
}

.form-field__help {
  font-size: var(--font-size-xs);
  color: var(--color-text-secondary);
  margin-top: var(--spacing-xs);
}
</style>
