<template>
  <div class="cards-container">
    <h1 class="section-title">Экскурсионные маршруты</h1>
    <ExcursionFilters
      ref="filtersRef"
      :search-query="searchQuery"
      search-placeholder="Поиск маршрутов..."
      @update:search-query="handleSearchQueryUpdate"
      @search="handleSearch"
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
        </div>
      </div>
    </DataState>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { api } from '@/utils/api'
import type { Excursion } from '@/types/excursion'
import { useRouter } from 'vue-router'
import ExcursionCard from '@/components/Cards/ExcursionCard.vue'
import DataState from '@/components/UI/DataState.vue'
import ExcursionFilters from '@/components/Filters/ExcursionFilters.vue'

const router = useRouter()

// Состояние загрузки и ошибок
const loading = ref(false)
const error = ref('')

// Данные карточек с бекенда
const excursions = ref<Excursion[]>([])

// Функция для перехода на детальную страницу
const viewDetails = (excursionId: number) => {
  router.push(`/excursion/${excursionId}`)
}

const searchQuery = ref<string>('')

// Обработчики событий от компонента фильтров
const handleSearchQueryUpdate = (value: string) => {
  searchQuery.value = value
}

const handleSearch = (value: string) => {
  handleSearchDebounced(value)
}

// Загрузка экскурсий с бекенда
const loadExcursions = async () => {
  loading.value = true
  error.value = ''
  try {
    const response = await api.excursions.getExcursions()
    // Фильтруем активные экскурсии и сортируем по дате
    excursions.value = response
      .filter((excursion) => excursion.is_active)
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
  } catch (err: any) {
    error.value = err.message || 'Не удалось загрузить экскурсии'
    console.error('Error loading excursions:', err)
  } finally {
    loading.value = false
  }
}

// Дебаунс для поиска (опционально)
let searchTimeout = 0
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
      const results = await api.excursions.searchExcursions(value)
      excursions.value = results
        .filter((excursion) => excursion.is_active)
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
  result = result.filter((card: Excursion) => isFutureExcursion(card.date))

  // Дополнительная фильтрация по поисковому запросу
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    result = result.filter(
      (card: Excursion) =>
        card.title.toLowerCase().includes(query) || card.description.toLowerCase().includes(query),
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

@media (max-width: 480px) {
  .section-title {
    color: var(--text-dark);
  }

  .cards-container {
    padding-top: 10px;
  }
}
</style>
