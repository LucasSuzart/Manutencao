<script setup lang="ts">
import { computed, ref, watchEffect } from "vue";
import Pagination from "./Pagination.vue";

interface Column {
  key: string;
  label: string;
  sortable?: boolean;
  format?: (value: any, item: any) => string;
  component?: any;
  props?: Record<string, any>;
}

const props = defineProps<{
  data: any[];
  columns: Column[];
  itemsPerPage?: number;
  searchable?: boolean;
  sortable?: boolean;
  striped?: boolean;
  hoverable?: boolean;
  bordered?: boolean;
  compact?: boolean;
  emptyText?: string;
}>();

const emit = defineEmits<{
  (e: "row-click", item: any): void;
  (e: "sort", key: string, direction: "asc" | "desc"): void;
}>();

// Pagination
const currentPage = ref(1);
const itemsPerPage = computed(() => props.itemsPerPage || 10);
const totalPages = computed(() =>
  Math.ceil(filteredData.value.length / itemsPerPage.value)
);

// Searching
const searchQuery = ref("");
const filteredData = computed(() => {
  if (!searchQuery.value.trim() || !props.searchable) {
    return props.data;
  }

  const query = searchQuery.value.toLowerCase();
  return props.data.filter((item) => {
    return props.columns.some((column) => {
      const value = item[column.key];
      if (value === null || value === undefined) return false;
      return String(value).toLowerCase().includes(query);
    });
  });
});

// Sorting
const sortKey = ref("");
const sortDirection = ref<"asc" | "desc">("asc");

const sortedData = computed(() => {
  if (!sortKey.value || !props.sortable) {
    return filteredData.value;
  }

  return [...filteredData.value].sort((a, b) => {
    const valueA = a[sortKey.value];
    const valueB = b[sortKey.value];

    // Handle null/undefined values
    if (valueA === null || valueA === undefined)
      return sortDirection.value === "asc" ? -1 : 1;
    if (valueB === null || valueB === undefined)
      return sortDirection.value === "asc" ? 1 : -1;

    // Compare values
    if (typeof valueA === "string" && typeof valueB === "string") {
      return sortDirection.value === "asc"
        ? valueA.localeCompare(valueB)
        : valueB.localeCompare(valueA);
    }

    return sortDirection.value === "asc" ? valueA - valueB : valueB - valueA;
  });
});

const paginatedData = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage.value;
  const end = start + itemsPerPage.value;
  return sortedData.value.slice(start, end);
});

function sort(key: string) {
  if (!props.sortable) return;

  if (sortKey.value === key) {
    // Toggle direction
    sortDirection.value = sortDirection.value === "asc" ? "desc" : "asc";
  } else {
    // New sort key
    sortKey.value = key;
    sortDirection.value = "asc";
  }

  emit("sort", key, sortDirection.value);
}

function handleRowClick(item: any) {
  emit("row-click", item);
}

// Reset to first page when data or search changes
watchEffect(() => {
  if (filteredData.value.length > 0) {
    currentPage.value = 1;
  }
});

// Format cell value
function formatCellValue(column: Column, item: any) {
  const value = item[column.key];

  if (column.format) {
    return column.format(value, item);
  }

  if (value === null || value === undefined) {
    return "-";
  }

  return value;
}
</script>

<template>
  <div class="data-table-wrapper">
    <!-- Search -->
    <div v-if="searchable" class="data-table__search">
      <input
        v-model="searchQuery"
        type="text"
        placeholder="Buscar..."
        class="data-table__search-input"
      />
    </div>

    <!-- Table -->
    <div class="data-table__container">
      <table
        class="data-table"
        :class="{
          'data-table--striped': striped,
          'data-table--hoverable': hoverable,
          'data-table--bordered': bordered,
          'data-table--compact': compact,
        }"
      >
        <thead>
          <tr>
            <th
              v-for="column in columns"
              :key="column.key"
              :class="{
                'data-table__column--sortable': sortable && column.sortable !== false,
              }"
              @click="column.sortable !== false && sort(column.key)"
            >
              {{ column.label }}
              <span
                v-if="sortable && column.sortable !== false && sortKey === column.key"
                class="data-table__sort-icon"
              >
                {{ sortDirection === "asc" ? "↑" : "↓" }}
              </span>
            </th>
          </tr>
        </thead>
        <tbody>
          <tr v-if="paginatedData.length === 0">
            <td :colspan="columns.length" class="data-table__empty">
              {{ emptyText || "Nenhum dado encontrado" }}
            </td>
          </tr>
          <tr
            v-for="(item, index) in paginatedData"
            :key="index"
            @click="handleRowClick(item)"
          >
            <td v-for="column in columns" :key="column.key">
              <slot :name="`cell-${column.key}`" :value="item[column.key]" :item="item">
                <component
                  v-if="column.component"
                  :is="column.component"
                  :value="item[column.key]"
                  v-bind="column.props || {}"
                />
                <template v-else>
                  {{ formatCellValue(column, item) }}
                </template>
              </slot>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Pagination -->
    <Pagination
      v-if="totalPages > 1"
      :current-page="currentPage"
      :total-pages="totalPages"
      @change="currentPage = $event"
    />
  </div>
</template>

<style scoped>
.data-table-wrapper {
  display: flex;
  flex-direction: column;
  width: 100%;
}

.data-table__search {
  margin-bottom: var(--spacing-md);
}

.data-table__search-input {
  width: 100%;
  max-width: 300px;
  padding: var(--spacing-sm) var(--spacing-md);
  border: 1px solid var(--color-border);
  border-radius: var(--border-radius-md);
  font-size: var(--font-size-sm);
}

.data-table__container {
  overflow-x: auto;
  width: 100%;
}

.data-table {
  width: 100%;
  border-collapse: collapse;
  font-size: var(--font-size-sm);
}

.data-table th {
  background-color: var(--color-background);
  font-weight: 600;
  text-align: left;
  padding: var(--spacing-md);
  border-bottom: 2px solid var(--color-border);
  color: var(--color-text-primary);
}

.data-table td {
  padding: var(--spacing-md);
  border-bottom: 1px solid var(--color-border);
  color: var(--color-text-primary);
}

.data-table--compact th,
.data-table--compact td {
  padding: var(--spacing-sm) var(--spacing-md);
}

.data-table--striped tbody tr:nth-child(even) {
  background-color: var(--color-background);
}

.data-table--hoverable tbody tr:hover {
  background-color: rgba(59, 130, 246, 0.05);
  cursor: pointer;
}

.data-table--bordered th,
.data-table--bordered td {
  border: 1px solid var(--color-border);
}

.data-table__column--sortable {
  cursor: pointer;
}

.data-table__column--sortable:hover {
  background-color: rgba(59, 130, 246, 0.1);
}

.data-table__sort-icon {
  margin-left: var(--spacing-xs);
  display: inline-block;
}

.data-table__empty {
  text-align: center;
  padding: var(--spacing-xl);
  color: var(--color-text-secondary);
}
</style>
