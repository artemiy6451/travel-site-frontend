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
      :loading="loading && isLoadingInitial"
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

          <!-- Индикатор загрузки дополнительных данных -->
          <div v-if="loadingMore" class="loading-more">
            <div class="loader"></div>
            <p>Загрузка дополнительных экскурсий...</p>
          </div>
        </div>

        <!-- Состояние когда нет результатов -->
        <div v-else-if="!loading && !loadingMore" class="no-results">
          <p>На ближайшее время экскурсий не запланировано</p>
        </div>
      </div>
    </DataState>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
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
const loadingMore = ref(false) // Для загрузки дополнительных данных

// Данные карточек с бекенда
const excursions = ref<Excursion[]>([])

// Пагинация
const currentPage = ref(1)
const pageSize = ref(10)
const hasMore = ref(true)
const totalLoaded = ref(0)
const isLoadingInitial = ref(true) // Флаг для первой загрузки

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

// Загрузка первой порции экскурсий
const loadExcursions = async (isSearch = false) => {
  if (isSearch) {
    // При поиске сбрасываем состояние
    excursions.value = []
    currentPage.value = 1
    hasMore.value = true
    totalLoaded.value = 0
  }

  if (loading.value || loadingMore.value) return

  loading.value = true
  error.value = ''

  try {
    const skip = (currentPage.value - 1) * pageSize.value
    const limit = pageSize.value

    let response: Excursion[]

    if (searchQuery.value.trim()) {
      // Поиск с пагинацией
      response = await api.excursions.searchExcursions(searchQuery.value, {
        skip,
        limit
      })
    } else {
      // Обычная загрузка с пагинацией
      response = await api.excursions.getActiveExcursions({
        skip,
        limit
      })
    }

    // Фильтруем активные экскурсии
    const activeExcursions = response.filter((excursion) => excursion.is_active)

    // Добавляем новые экскурсии
    if (isSearch) {
      excursions.value = activeExcursions
    } else {
      excursions.value = [...excursions.value, ...activeExcursions]
    }

    totalLoaded.value += activeExcursions.length

    // Проверяем, есть ли еще данные для загрузки
    hasMore.value = activeExcursions.length === pageSize.value

    // Увеличиваем номер страницы только если загрузили что-то
    if (activeExcursions.length > 0) {
      currentPage.value++
    }

  } catch (err: any) {
    error.value = err.message || 'Не удалось загрузить экскурсии'
    console.error('Error loading excursions:', err)
  } finally {
    loading.value = false
    isLoadingInitial.value = false
  }
}

// Загрузка дополнительных экскурсий при скролле
const loadMore = async () => {
  if (loading.value || loadingMore.value || !hasMore.value) return

  loadingMore.value = true

  try {
    const skip = (currentPage.value - 1) * pageSize.value
    const limit = pageSize.value

    let response: Excursion[]

    if (searchQuery.value.trim()) {
      response = await api.excursions.searchExcursions(searchQuery.value, {
        skip,
        limit
      })
    } else {
      response = await api.excursions.getActiveExcursions({
        skip,
        limit
      })
    }

    const activeExcursions = response.filter((excursion) => excursion.is_active)

    // Добавляем новые экскурсии
    excursions.value = [...excursions.value, ...activeExcursions]
    totalLoaded.value += activeExcursions.length

    // Проверяем, есть ли еще данные для загрузки
    hasMore.value = activeExcursions.length === pageSize.value

    // Увеличиваем номер страницы только если загрузили что-то
    if (activeExcursions.length > 0) {
      currentPage.value++
    }

  } catch (err: any) {
    console.error('Error loading more excursions:', err)
  } finally {
    loadingMore.value = false
  }
}

// Дебаунс для поиска
let searchTimeout = 0
const handleSearchDebounced = (value: string) => {
  clearTimeout(searchTimeout)
  searchTimeout = setTimeout(() => {
    handleSearchExecution(value)
  }, 300)
}

const handleSearchExecution = async (value: string) => {
  if (value.trim()) {
    // При поиске запускаем loadExcursions с флагом isSearch
    searchQuery.value = value
    await loadExcursions(true)
  } else {
    // Если поиск очищен, загружаем все экскурсии заново
    searchQuery.value = ''
    excursions.value = []
    currentPage.value = 1
    hasMore.value = true
    await loadExcursions(true)
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

  // Сортируем по дате (самые ближайшие сначала)
  return result.sort((a, b) => {
    const dateA = new Date(a.date).getTime()
    const dateB = new Date(b.date).getTime()
    return dateA - dateB
  })
})

// Бесконечный скролл
const checkScroll = () => {
  if (isLoadingInitial.value || loading.value || loadingMore.value || !hasMore.value) {
    return
  }

  const scrollTop = window.pageYOffset || document.documentElement.scrollTop
  const windowHeight = window.innerHeight
  const documentHeight = document.documentElement.scrollHeight

  // Загружаем новые данные, когда пользователь прокрутил до 80% страницы
  if (scrollTop + windowHeight >= documentHeight * 0.4) {
    loadMore()
  }
}

// Наблюдатель за скроллом
const observer = ref<IntersectionObserver | null>(null)

// Загрузка данных при монтировании компонента
onMounted(() => {
  loadExcursions()

  // Вариант 1: Обработчик скролла
  window.addEventListener('scroll', checkScroll)

  // Вариант 2: IntersectionObserver (закомментируйте, если используете вариант 1)
  // setupIntersectionObserver()
})

onUnmounted(() => {
  // Убираем обработчик скролла
  window.removeEventListener('scroll', checkScroll)

  // Отключаем observer
  if (observer.value) {
    observer.value.disconnect()
  }
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

/* Стили для индикатора загрузки */
.loading-more {
  grid-column: 1 / -1;
  text-align: center;
  padding: 40px 0;
  color: var(--text-light);
}

.loader {
  display: inline-block;
  width: 40px;
  height: 40px;
  border: 4px solid var(--border-green-medium);
  border-top: 4px solid var(--green-primary);
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 15px;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

/* Сентинел элемент (невидимый) */
.sentinel {
  height: 1px;
  width: 100%;
  grid-column: 1 / -1;
  opacity: 0;
}

/* Сообщение о конце списка */
.end-of-list {
  grid-column: 1 / -1;
  text-align: center;
  padding: 40px 0;
  color: var(--text-light);
  font-style: italic;
  border-top: 1px solid var(--border-green-medium);
  margin-top: 20px;
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

  .loader {
    width: 30px;
    height: 30px;
  }
}

@media (max-width: 480px) {
  .section-title {
    color: var(--text-dark);
  }

  .cards-container {
    padding-top: 10px;
  }

  .loading-more p,
  .end-of-list p {
    font-size: 0.9rem;
  }
}
</style>
