<template>
  <div class="filters-section">
    <div class="search-box">
      <input
        type="text"
        :placeholder="searchPlaceholder"
        :value="searchQuery"
        @input="handleSearchInput"
        class="search-input"
      />
      <span class="search-icon">🔍</span>
    </div>
  </div>
</template>

<script setup lang="ts">
interface Props {
  searchQuery: string
  searchPlaceholder?: string
}

interface Emits {
  (e: 'update:searchQuery', value: string): void
  (e: 'search', value: string): void
  (e: 'clear'): void
}

const props = withDefaults(defineProps<Props>(), {
  searchPlaceholder: 'Поиск маршрутов...',
})

const emit = defineEmits<Emits>()

const handleSearchInput = (event: Event) => {
  const target = event.target as HTMLInputElement
  const value = target.value
  emit('update:searchQuery', value)
  emit('search', value)
}
</script>

<style scoped>
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
  box-shadow:
    0 0 0 3px var(--hover-green),
    0 4px 15px var(--shadow-green-light);
}

.search-icon {
  position: absolute;
  right: 20px;
  top: 50%;
  transform: translateY(-50%);
  font-size: 1.2rem;
  color: var(--green-primary);
}

/* Адаптивность */
@media (max-width: 480px) {
  .search-box {
    max-width: 100%;
  }
}
</style>
