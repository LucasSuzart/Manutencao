<script setup lang="ts">
import { computed } from 'vue'
import Button from './Button.vue'

const props = defineProps<{
  currentPage: number
  totalPages: number
  maxVisiblePages?: number
}>()

const emit = defineEmits<{
  (e: 'change', page: number): void
}>()

const maxVisible = computed(() => props.maxVisiblePages || 5)

const pages = computed(() => {
  const totalVisible = Math.min(props.totalPages, maxVisible.value)
  const halfVisible = Math.floor(totalVisible / 2)
  
  let startPage = Math.max(1, props.currentPage - halfVisible)
  const endPage = Math.min(props.totalPages, startPage + totalVisible - 1)
  
  // Adjust start page if we're near the end
  if (endPage - startPage + 1 < totalVisible) {
    startPage = Math.max(1, endPage - totalVisible + 1)
  }
  
  return Array.from({ length: endPage - startPage + 1 }, (_, i) => startPage + i)
})

const showFirstPage = computed(() => pages.value[0] > 1)
const showLastPage = computed(() => pages.value[pages.value.length - 1] < props.totalPages)

function changePage(page: number) {
  if (page !== props.currentPage && page >= 1 && page <= props.totalPages) {
    emit('change', page)
  }
}
</script>

<template>
  <div v-if="totalPages > 1" class="pagination">
    <Button
      variant="ghost"
      size="sm"
      icon="«"
      :disabled="currentPage === 1"
      @click="changePage(1)"
    />
    
    <Button
      variant="ghost"
      size="sm"
      icon="‹"
      :disabled="currentPage === 1"
      @click="changePage(currentPage - 1)"
    />
    
    <Button
      v-if="showFirstPage"
      variant="ghost"
      size="sm"
      @click="changePage(1)"
    >
      1
    </Button>
    
    <span v-if="showFirstPage && pages[0] > 2" class="pagination__ellipsis">...</span>
    
    <Button
      v-for="page in pages"
      :key="page"
      :variant="page === currentPage ? 'primary' : 'ghost'"
      size="sm"
      @click="changePage(page)"
    >
      {{ page }}
    </Button>
    
    <span v-if="showLastPage && pages[pages.length - 1] < totalPages - 1" class="pagination__ellipsis">...</span>
    
    <Button
      v-if="showLastPage"
      variant="ghost"
      size="sm"
      @click="changePage(totalPages)"
    >
      {{ totalPages }}
    </Button>
    
    <Button
      variant="ghost"
      size="sm"
      icon="›"
      :disabled="currentPage === totalPages"
      @click="changePage(currentPage + 1)"
    />
    
    <Button
      variant="ghost"
      size="sm"
      icon="»"
      :disabled="currentPage === totalPages"
      @click="changePage(totalPages)"
    />
  </div>
</template>

<style scoped>
.pagination {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: var(--spacing-xs);
  margin: var(--spacing-lg) 0;
}

.pagination__ellipsis {
  font-size: var(--font-size-sm);
  color: var(--color-text-secondary);
  padding: 0 var(--spacing-xs);
}
</style>
