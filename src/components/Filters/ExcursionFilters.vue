<template>
  <div class="filters-section">
    <div class="search-box">
      <input
        type="text"
        :placeholder="searchPlaceholder"
        :value="searchQuery"
        @input="handleSearchInput"
        class="search-input"
      >
      <span class="search-icon">🔍</span>
    </div>

    <div class="filters">
      <BaseButton
        v-for="filter in filters"
        :key="filter.id"
        :variant="activeFilter === filter.id ? 'primary' : 'secondary'"
        size="sm"
        @click="handleFilterClick(filter.id)"
        class="filter-btn"
      >
        {{ filter.name }}
      </BaseButton>
    </div>
  </div>
</template>

<script setup lang="ts">
import BaseButton from '@/components/UI/BaseButton.vue'

interface Filter {
  id: string
  name: string
}

interface Props {
  filters: Filter[]
  activeFilter: string
  searchQuery: string
  searchPlaceholder?: string
}

interface Emits {
  (e: 'update:searchQuery', value: string): void
  (e: 'update:activeFilter', value: string): void
  (e: 'search', value: string): void
  (e: 'filter', value: string): void
  (e: 'clear'): void
}

const props = withDefaults(defineProps<Props>(), {
  searchPlaceholder: 'Поиск маршрутов...'
})

const emit = defineEmits<Emits>()

const handleSearchInput = (event: Event) => {
  const target = event.target as HTMLInputElement
  const value = target.value
  emit('update:searchQuery', value)
  emit('search', value)
}

const handleFilterClick = (filterId: string) => {
  emit('update:activeFilter', filterId)
  emit('filter', filterId)
}

// Метод для очистки фильтров (можно вызывать из родителя через ref)
const clearFilters = () => {
  emit('update:searchQuery', '')
  emit('update:activeFilter', 'all')
  emit('clear')
}

// Экспортируем метод для использования в родительском компоненте
defineExpose({
  clearFilters
})
</script>

<style scoped>
.filters-section {
  margin-bottom: 40px;
}

.search-box {
  position: relative;
  max-width: 400px;
  margin: 0 auto 30px auto;
}

.search-input {
  width: 100%;
  padding: 15px 50px 15px 20px;
  border: 2px solid var(--border-green-medium);
  border-radius: 25px;
  font-size: 1rem;
  transition: all 0.3s ease;
  outline: none;
  background: var(--white);
  color: var(--text-dark);
  box-shadow: 0 2px 10px var(--shadow-default);
}

.search-input:focus {
  border-color: var(--green-primary);
  box-shadow: 0 0 0 3px var(--hover-green), 0 4px 15px var(--shadow-green-light);
}

.search-icon {
  position: absolute;
  right: 20px;
  top: 50%;
  transform: translateY(-50%);
  font-size: 1.2rem;
  color: var(--green-primary);
}

.filters {
  display: flex;
  justify-content: center;
  flex-wrap: wrap;
  gap: 10px;
}

:deep(.filter-btn.base-button) {
  border-radius: 25px;
  font-weight: 500;
  box-shadow: 0 2px 8px var(--shadow-default);
  border: 2px solid var(--border-green-medium);
}

:deep(.filter-btn.base-button.variant-secondary) {
  background: var(--white);
  color: var(--text-medium);
  border-color: var(--border-green-medium);
}

:deep(.filter-btn.base-button.variant-secondary:hover:not(.disabled)) {
  border-color: var(--green-light);
  color: var(--green-darker);
  background: var(--green-bg-light);
  transform: translateY(-2px);
}

:deep(.filter-btn.base-button.variant-primary) {
  box-shadow: 0 4px 15px var(--shadow-green);
}

/* Адаптивность */
@media (max-width: 768px) {
  .filters {
    justify-content: flex-start;
    overflow-x: auto;
    padding-bottom: 10px;
    padding-top: 10px;
  }
}

@media (max-width: 480px) {
  .search-box {
    max-width: 100%;
  }

  :deep(.filter-btn.base-button) {
    font-size: 0.8rem;
    padding: 8px 16px;
  }
}
</style>
