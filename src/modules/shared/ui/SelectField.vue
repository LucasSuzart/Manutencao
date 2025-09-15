<script setup lang="ts">
import { computed } from 'vue'

interface Option {
  value: string | number
  label: string
}

const props = defineProps<{
  modelValue: string | number
  options: Option[] | string[] | number[]
  label?: string
  placeholder?: string
  disabled?: boolean
  error?: string
  id?: string
  required?: boolean
  helpText?: string
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', value: string | number): void
}>()

const inputId = computed(() => props.id || `select-${Math.random().toString(36).substring(2, 9)}`)

const normalizedOptions = computed<Option[]>(() => {
  if (!props.options.length) return []
  
  // Check if the options are already in the { value, label } format
  if (typeof props.options[0] === 'object' && 'value' in props.options[0]) {
    return props.options as Option[]
  }
  
  // Convert simple array to option objects
  return (props.options as (string | number)[]).map(option => ({
    value: option,
    label: String(option)
  }))
})
</script>

<template>
  <div class="form-field" :class="{ 'form-field--error': error }">
    <label v-if="label" :for="inputId" class="form-field__label">
      {{ label }}
      <span v-if="required" class="form-field__required">*</span>
    </label>
    
    <select
      :id="inputId"
      :value="modelValue"
      :disabled="disabled"
      class="form-field__select"
      @change="$emit('update:modelValue', ($event.target as HTMLSelectElement).value)"
    >
      <option v-if="placeholder" value="" disabled selected>{{ placeholder }}</option>
      <option 
        v-for="option in normalizedOptions" 
        :key="`${option.value}`"
        :value="option.value"
      >
        {{ option.label }}
      </option>
    </select>
    
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

.form-field__select {
  width: 100%;
  padding: var(--spacing-sm) var(--spacing-md);
  padding-right: var(--spacing-xl);
  border: 1px solid var(--color-border);
  border-radius: var(--border-radius-md);
  background-color: var(--color-surface);
  font-size: var(--font-size-base);
  line-height: 1.5;
  color: var(--color-text-primary);
  appearance: none;
  background-image: url("data:image/svg+xml;charset=utf-8,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3E%3Cpath stroke='%2364748B' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3E%3C/svg%3E");
  background-position: right var(--spacing-md) center;
  background-repeat: no-repeat;
  background-size: 16px;
  transition: border-color var(--transition-fast), box-shadow var(--transition-fast);
}

.form-field__select:focus {
  outline: none;
  border-color: var(--color-accent);
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.15);
}

.form-field__select:disabled {
  background-color: var(--color-background);
  opacity: 0.7;
  cursor: not-allowed;
}

.form-field--error .form-field__select {
  border-color: var(--color-error);
}

.form-field--error .form-field__select:focus {
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
