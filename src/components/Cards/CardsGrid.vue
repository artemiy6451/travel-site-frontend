<template>
  <div class="cards-container">
    <h1 class="section-title">Экскурсионные маршруты</h1>

    <!-- НОВЫЙ БЛОК: Переключатель типа контента -->
    <div class="type-toggle">
      <button
        class="type-toggle-btn"
        :class="{ active: contentType === 'excursion' }"
        @click="switchContentType('excursion')"
        :disabled="loading"
      >
        <span class="type-icon">🚶</span>
        <span class="type-label">Экскурсии по Крыму</span>
      </button>
      <button
        class="type-toggle-btn"
        :class="{ active: contentType === 'tour' }"
        @click="switchContentType('tour')"
        :disabled="loading"
      >
        <span class="type-icon">🏕️</span>
        <span class="type-label">Туры на материк</span>
      </button>
    </div>

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
      loading-message="Загрузка маршрутов..."
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
            <p>Загрузка дополнительных {{ contentType === 'excursion' ? 'экскурсий' : 'туров' }}...</p>
          </div>
        </div>

        <!-- Состояние когда нет результатов -->
        <div v-else-if="!loading && !loadingMore" class="no-results">
          <p v-if="contentType === 'excursion'">На ближайшее время экскурсий не запланировано</p>
          <p v-else>На ближайшее время туров не запланировано</p>
        </div>
      </div>
    </DataState>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'
import { api } from '@/utils/api'
import type { Excursion } from '@/types/excursion'
import { useRouter } from 'vue-router'
import ExcursionCard from '@/components/Cards/ExcursionCard.vue'
import DataState from '@/components/UI/DataState.vue'
import ExcursionFilters from '@/components/Filters/ExcursionFilters.vue'

// Тип контента
type ContentType = 'excursion' | 'tour'

const router = useRouter()

// Состояние загрузки и ошибок
const loading = ref(false)
const error = ref('')
const loadingMore = ref(false)

// Данные карточек с бекенда
const excursions = ref<Excursion[]>([])
const tours = ref<Excursion[]>([])

// Текущий тип контента
const contentType = ref<ContentType>('excursion')

// Пагинация
const currentPage = ref(1)
const pageSize = ref(10)
const hasMore = ref(true)
const totalLoaded = ref(0)
const isLoadingInitial = ref(true)

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

// Переключение типа контента
const switchContentType = async (type: ContentType) => {
  if (contentType.value === type || loading.value) return

  contentType.value = type
  await loadExcursions(true)
}

// Загрузка данных в зависимости от типа
const loadDataByType = async (skip: number, limit: number, isSearch: boolean = false) => {
  if (searchQuery.value.trim()) {
    // Поиск с пагинацией
    return await api.excursions.searchExcursions(searchQuery.value, {
      skip,
      limit
    })
  } else {
    // Обычная загрузка в зависимости от типа контента
    if (contentType.value === 'excursion') {
      return await api.excursions.getActiveExcursions({
        skip,
        limit,
        excursion_type: 'excursion'
      })
    } else {
      return await api.excursions.getActiveExcursions({
        skip,
        limit,
        excursion_type: 'tour'
      })
    }
  }
}

// Загрузка первой порции
const loadExcursions = async (isSearch = false) => {
  if (isSearch) {
    // При поиске или смене типа сбрасываем состояние
    if (contentType.value === 'excursion') {
      excursions.value = []
    } else {
      tours.value = []
    }
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

    const response = await loadDataByType(skip, limit, isSearch)

    const activeItems = response.filter((item) => item.is_active && isFutureExcursion(item.date))

    // Сохраняем в соответствующий массив
    if (contentType.value === 'excursion') {
      if (isSearch) {
        excursions.value = activeItems
      } else {
        excursions.value = [...excursions.value, ...activeItems]
      }
    } else {
      if (isSearch) {
        tours.value = activeItems
      } else {
        tours.value = [...tours.value, ...activeItems]
      }
    }

    totalLoaded.value += activeItems.length

    // Проверяем, есть ли еще данные для загрузки
    hasMore.value = activeItems.length === pageSize.value

    // Увеличиваем номер страницы только если загрузили что-то
    if (activeItems.length > 0) {
      currentPage.value++
    }

  } catch (err: any) {
    error.value = err.message || `Не удалось загрузить ${contentType.value === 'excursion' ? 'экскурсии' : 'туры'}`
    console.error('Error loading data:', err)
  } finally {
    loading.value = false
    isLoadingInitial.value = false
  }
}

// Загрузка дополнительных данных при скролле
const loadMore = async () => {
  if (loading.value || loadingMore.value || !hasMore.value) return

  loadingMore.value = true

  try {
    const skip = (currentPage.value - 1) * pageSize.value
    const limit = pageSize.value

    const response = await loadDataByType(skip, limit)

    const activeItems = response.filter((item) => item.is_active && isFutureExcursion(item.date))

    // Добавляем в соответствующий массив
    if (contentType.value === 'excursion') {
      excursions.value = [...excursions.value, ...activeItems]
    } else {
      tours.value = [...tours.value, ...activeItems]
    }

    totalLoaded.value += activeItems.length

    // Проверяем, есть ли еще данные для загрузки
    hasMore.value = activeItems.length === pageSize.value

    // Увеличиваем номер страницы только если загрузили что-то
    if (activeItems.length > 0) {
      currentPage.value++
    }

  } catch (err: any) {
    console.error('Error loading more data:', err)
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
    // Если поиск очищен, загружаем все заново
    searchQuery.value = ''
    if (contentType.value === 'excursion') {
      excursions.value = []
    } else {
      tours.value = []
    }
    currentPage.value = 1
    hasMore.value = true
    await loadExcursions(true)
  }
}

// Проверка что экскурсия еще не прошла
const isFutureExcursion = (dateString: string | Date): boolean => {
  const excursionDate = new Date(dateString)
  const now = new Date()
  const excursionEnd = new Date(excursionDate.getTime() + 60 * 60 * 1000)
  return excursionEnd > now
}

// Вычисляемое свойство для отсортированных и отфильтрованных карточек
const sortedAndFilteredCards = computed(() => {
  // Выбираем нужный массив в зависимости от типа контента
  const sourceArray = contentType.value === 'excursion' ? excursions.value : tours.value

  let result = sourceArray

  // Фильтруем только будущие
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

  if (scrollTop + windowHeight >= documentHeight * 0.4) {
    loadMore()
  }
}

// Наблюдатель за скроллом
const observer = ref<IntersectionObserver | null>(null)

// Следим за изменением типа контента
watch(contentType, () => {
  // Сбрасываем пагинацию при смене типа
  currentPage.value = 1
  hasMore.value = true
})

// Загрузка данных при монтировании компонента
onMounted(() => {
  loadExcursions()
  window.addEventListener('scroll', checkScroll)
})

onUnmounted(() => {
  window.removeEventListener('scroll', checkScroll)
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
  margin-bottom: 20px;
  color: var(--text-white);
  font-weight: 700;
}

/* Стили для переключателя типа */
.type-toggle {
  display: flex;
  justify-content: center;
  gap: 15px;
  margin-bottom: 30px;
}

.type-toggle-btn {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 12px 30px;
  background: var(--white);
  border: 2px solid var(--border-green-light);
  border-radius: 50px;
  cursor: pointer;
  transition: all 0.3s ease;
  font-size: 1.1rem;
  min-width: 180px;
  justify-content: center;
  position: relative;
}

.type-toggle-btn:hover:not(:disabled) {
  border-color: var(--green-primary);
  background: var(--green-bg-light);
  transform: translateY(-2px);
  box-shadow: 0 4px 12px var(--shadow-green-light);
}

.type-toggle-btn.active {
  border-color: var(--green-primary);
  background: var(--green-primary);
  color: var(--white);
  box-shadow: 0 4px 15px var(--shadow-green-strong);
}

.type-toggle-btn.active .type-icon {
  filter: brightness(0) invert(1);
}

.type-toggle-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.type-icon {
  font-size: 1.3rem;
  transition: filter 0.3s ease;
}

.type-label {
  font-weight: 600;
}

.type-count {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 24px;
  height: 24px;
  padding: 0 6px;
  background: var(--green-bg-light);
  border-radius: 12px;
  font-size: 0.8rem;
  font-weight: 600;
  color: var(--text-dark);
}

.type-toggle-btn.active .type-count {
  background: var(--white);
  color: var(--green-primary);
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

/* Сентинел элемент */
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
    color: var(--text-dark);
  }

  .type-toggle {
    flex-direction: column;
    gap: 10px;
  }

  .type-toggle-btn {
    width: 100%;
    min-width: auto;
    padding: 12px 20px;
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
    font-size: 1.8rem;
  }

  .type-toggle-btn {
    font-size: 1rem;
    padding: 10px 15px;
  }

  .type-icon {
    font-size: 1.1rem;
  }

  .loading-more p,
  .end-of-list p {
    font-size: 0.9rem;
  }
}
</style>
