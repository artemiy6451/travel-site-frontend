<template>
  <div class="cards-container">
    <h1 class="section-title">Экскурсионные маршруты</h1>
    <ExcursionFilters
      ref="filtersRef"
      :filters="filters"
      :active-filter="activeFilter"
      :search-query="searchQuery"
      search-placeholder="Поиск маршрутов..."
      @update:search-query="handleSearchQueryUpdate"
      @update:active-filter="handleActiveFilterUpdate"
      @search="handleSearch"
      @filter="handleFilter"
      @clear="handleFiltersClear"
    />

    <DataState
      :loading="loading"
      :error="error"
      loading-message="Загрузка экскурсий..."
      error-title="Ошибка загрузки"
      @retry="loadExcursions"
    >
      <!-- Контент когда нет загрузки и ошибки -->
      <div class="cards-content">
        <!-- Сетка карточек -->
        <div v-if="sortedAndFilteredCards.length > 0" class="cards-grid">
          <ExcursionCard
            v-for="card in sortedAndFilteredCards"
            :key="card.id"
            :excursion="card"
            @view-details="viewDetails"
          />
        </div>

        <!-- Состояние когда нет результатов -->
        <div v-else class="no-results">
          <p>На ближайшее время экскурсий не запланировано</p>
          <BaseButton v-if="activeFilter !== 'all' || searchQuery" variant="secondary" @click="clearFilters">
            Очистить фильтры
          </BaseButton>
        </div>
      </div>
    </DataState>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { api, type Excursion } from '@/utils/api'
import { useRouter } from 'vue-router'
import BaseButton from '@/components/UI/BaseButton.vue'
import ExcursionCard from '@/components/Cards/ExcursionCard.vue'
import DataState from '@/components/UI/DataState.vue'
import ExcursionFilters from '@/components/Filters/ExcursionFilters.vue'

const router = useRouter()
const filtersRef = ref()

interface Filter {
  id: string
  name: string
}

// Состояние загрузки и ошибок
const loading = ref(false)
const error = ref('')

// Данные карточек с бекенда
const excursions = ref<Excursion[]>([])

// Функция для перехода на детальную страницу
const viewDetails = (excursionId: number) => {
  router.push(`/excursion/${excursionId}`)
}

// Фильтры
const filters = ref<Filter[]>([
  { id: 'all', name: 'Все' },
  { id: 'горные', name: 'Горные' },
  { id: 'морские', name: 'Морские' },
  { id: 'исторические', name: 'Исторические' },
  { id: 'природа', name: 'Природа' },
  { id: 'городские', name: 'Городские' }
])

const activeFilter = ref<string>('all')
const searchQuery = ref<string>('')

// Обработчики событий от компонента фильтров
const handleSearchQueryUpdate = (value: string) => {
  searchQuery.value = value
}

const handleActiveFilterUpdate = (value: string) => {
  activeFilter.value = value
}

const handleSearch = (value: string) => {
  handleSearchDebounced(value)
}

const handleFilter = (filterId: string) => {
  setActiveFilter(filterId)
}

const handleFiltersClear = () => {
  loadExcursions()
}

// Загрузка экскурсий с бекенда
const loadExcursions = async () => {
  loading.value = true
  error.value = ''
  try {
    const response = await api.getExcursions()
    // Фильтруем активные экскурсии и сортируем по дате
    excursions.value = response
      .filter(excursion => excursion.is_active)
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
  } catch (err: any) {
    error.value = err.message || 'Не удалось загрузить экскурсии'
    console.error('Error loading excursions:', err)
  } finally {
    loading.value = false
  }
}

// Дебаунс для поиска (опционально)
let searchTimeout: NodeJS.Timeout
const handleSearchDebounced = (value: string) => {
  clearTimeout(searchTimeout)
  searchTimeout = setTimeout(() => {
    handleSearchExecution(value)
  }, 300)
}

const handleSearchExecution = async (value: string) => {
  if (value.trim()) {
    loading.value = true
    try {
      const results = await api.searchExcursions(value)
      excursions.value = results
        .filter(excursion => excursion.is_active)
        .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    } catch (err: any) {
      error.value = err.message || 'Ошибка поиска'
      console.error('Error searching excursions:', err)
    } finally {
      loading.value = false
    }
  } else {
    // Если поиск очищен, загружаем все экскурсии заново
    loadExcursions()
  }
}

// Фильтрация по категории
const setActiveFilter = async (filterId: string) => {
  activeFilter.value = filterId

  if (filterId === 'all') {
    loadExcursions()
  } else {
    loading.value = true
    try {
      const results = await api.getExcursionsByCategory(filterId)
      excursions.value = results
        .filter(excursion => excursion.is_active)
        .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    } catch (err: any) {
      error.value = err.message || 'Ошибка фильтрации'
      console.error('Error filtering by category:', err)
    } finally {
      loading.value = false
    }
  }
}

// Очистка фильтров
const clearFilters = () => {
  // Используем метод из компонента фильтров
  filtersRef.value?.clearFilters()
  loadExcursions()
}

// Проверка что экскурсия еще не прошла
const isFutureExcursion = (dateString: string | Date): boolean => {
  const excursionDate = new Date(dateString)
  const now = new Date()
  // Добавляем продолжительность экскурсии к дате начала
  const excursionEnd = new Date(excursionDate.getTime() + 60 * 60 * 1000) // +1 час для примера
  return excursionEnd > now
}

// Вычисляемое свойство для отсортированных и отфильтрованных карточек
const sortedAndFilteredCards = computed(() => {
  let result = excursions.value

  // Фильтруем только будущие экскурсии
  result = result.filter(card => isFutureExcursion(card.date))

  // Дополнительная фильтрация по поисковому запросу
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    result = result.filter(card =>
      card.title.toLowerCase().includes(query) ||
      card.description.toLowerCase().includes(query)
    )
  }

  // Сортируем по дате (самые ближайшие сначала)
  return result.sort((a, b) => {
    const dateA = new Date(a.date).getTime()
    const dateB = new Date(b.date).getTime()
    return dateA - dateB
  })
})

// Загрузка данных при монтировании компонента
onMounted(() => {
  loadExcursions()
})
</script>

<style scoped>
/* УДАЛЯЕМ старые стили для filters-section, они теперь в компоненте */

.cards-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 40px 20px;
}

.section-title {
  text-align: center;
  font-size: 2.5rem;
  margin-bottom: 40px;
  color: var(--text-white);
  font-weight: 700;
}

.cards-content {
  min-height: 200px;
}

.cards-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
  gap: 30px;
  justify-items: center;
}

.no-results {
  text-align: center;
  padding: 60px 20px;
  color: var(--text-light);
  font-size: 1.2rem;
  background: var(--white);
}

/* Адаптивность */
@media (max-width: 768px) {
  .cards-container {
    padding: 20px 25px;
  }

  .section-title {
    font-size: 2rem;
  }

  .cards-grid {
    grid-template-columns: 1fr;
    gap: 20px;
  }
}

@media(max-width: 480px) {
  .section-title {
    color: var(--text-dark);
  }

  .cards-container {
    padding-top: 10px;
  }
}
</style>
