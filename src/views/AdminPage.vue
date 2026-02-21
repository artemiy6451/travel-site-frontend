<template>
  <div class="admin-panel">
    <!-- Хедер -->
    <div class="admin-header">
      <div class="admin-info">
        <h1>Панель управления экскурсиями</h1>
        <div class="user-info">
          <span class="user-email">{{ currentUser?.email }}</span>
          <span v-if="currentUser?.is_superuser" class="admin-badge">👑 Администратор</span>
        </div>
      </div>
    </div>

    <!-- Уведомления -->
    <div v-if="notification.message" :class="['notification', notification.type]">
      {{ notification.message }}
    </div>

    <!-- Панель инструментов -->
    <div class="toolbar">
      <BaseButton
        variant="primary"
        @click="showAddForm = true"
        :disabled="loading"
        icon="+"
        class="add-btn"
        :size="isMobile ? 'md' : 'md'"
      >
        <span class="btn-text">Добавить экскурсию</span>
      </BaseButton>


      <div class="filters">
        <!-- Добавляем переключатель для типа экскурсий (экскурсия/тур) -->
        <div class="excursion-subtype-toggle">
          <button
            :class="['subtype-toggle-btn', { active: subtypeFilter === 'excursion' }]"
            @click="setSubtypeFilter('excursion')"
          >
            <span class="subtype-icon">🚶</span>
            Экскурсии
          </button>
          <button
            :class="['subtype-toggle-btn', { active: subtypeFilter === 'tour' }]"
            @click="setSubtypeFilter('tour')"
          >
            <span class="subtype-icon">🏕️</span>
            Туры
          </button>
        </div>

        <!-- Переключатель активных/неактивных -->
        <div class="excursion-type-toggle">
          <button
            :class="['type-toggle-btn', { active: excursionType === 'active' }]"
            @click="setExcursionType('active')"
          >
            Активные
          </button>
          <button
            :class="['type-toggle-btn', { active: excursionType === 'inactive' }]"
            @click="setExcursionType('inactive')"
          >
            Неактивные
          </button>
        </div>

        <div class="search-container">
          <input
            v-model="searchQuery"
            type="text"
            placeholder="Поиск экскурсий..."
            class="search-input"
            @input="handleSearch"
          />
        </div>
      </div>
    </div>

    <!-- Компонент формы -->
    <ExcursionForm
      :visible="showAddForm"
      :loading="formLoading"
      :editing-card="editingCard"
      :editing-details="editingDetails"
      @submit="saveCard"
      @duplicate="saveCard"
      @cancel="cancelForm"
      @update:visible="showAddForm = $event"
    />

    <!-- Компонент списка карточек -->
    <ExcursionList
      :cards="cards"
      :loading="loading"
      @toggle-visibility="toggleCardVisibility"
      @edit="editCard"
      @delete="deleteCard"
      @add-people="addPeopleToExcursion"
      @change-bus-number="changeBusNumber"
    />

    <!-- Пагинация -->
    <div v-if="totalPages > 1" class="pagination">
      <button
        @click="goToPage(currentPage - 1)"
        :disabled="currentPage === 1 || loading"
        class="pagination-btn prev"
      >
        ←
      </button>

      <div class="page-numbers">
        <button
          v-for="page in getVisiblePages()"
          :key="page"
          @click="goToPage(page)"
          :class="['page-btn', { active: page === currentPage }]"
          :disabled="page === '...' || loading"
        >
          {{ page }}
        </button>
      </div>

      <button
        @click="goToPage(currentPage + 1)"
        :disabled="currentPage === totalPages || loading"
        class="pagination-btn next"
      >
        →
      </button>

      <div class="page-info">
        Страница {{ currentPage }} из {{ totalPages }}
      </div>

      <div class="page-size-selector">
        <label>Показать:</label>
        <select
          v-model="pageSize"
          @change="onPageSizeChange"
          :disabled="loading"
          class="size-select"
        >
          <option value="5">5</option>
          <option value="10">10</option>
          <option value="20">20</option>
          <option value="50">50</option>
        </select>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, defineAsyncComponent } from 'vue'
import type { User } from '@/types/user'
import { api } from '@/utils/api'
import {
  type Excursion,
  type ExcursionCreate,
  type ExcursionDetailsCreate,
  type ExcursionDetails,
  type ExcursionImage,
} from '@/types/excursion'

const BaseButton = defineAsyncComponent(() => import('@/components/UI/BaseButton.vue'))
const ExcursionForm = defineAsyncComponent(() => import('@/components/Admin/ExcursionForm.vue'))
const ExcursionList = defineAsyncComponent(() => import('@/components/Admin/ExcursionList.vue'))

const currentUser = ref<User | null>(null)
const loading = ref(false)
const formLoading = ref(false)

// Адаптивность
const isMobile = ref(false)
const checkScreenSize = () => {
  isMobile.value = window.innerWidth <= 768
}

// Данные
const cards = ref<Excursion[]>([])
const searchQuery = ref('')
const excursionType = ref<'active' | 'inactive'>('active')
const subtypeFilter = ref<'excursion' | 'tour'>('excursion')

// Пагинация
const currentPage = ref(1)
const pageSize = ref(10) // Количество элементов на странице
const totalItems = ref(0) // Общее количество элементов
const totalPages = ref(0) // Общее количество страниц

// Форма
const showAddForm = ref(false)
const editingCard = ref<Excursion | null>(null)
const editingDetails = ref<ExcursionDetails | null>(null)

// Изображения
const imageUploading = ref(false)

// Уведомления
const notification = ref({ message: '', type: 'success' })

onMounted(() => {
  checkScreenSize()
  window.addEventListener('resize', checkScreenSize)
  loadCurrentUser()
  loadExcursions()
})

onUnmounted(() => {
  window.removeEventListener('resize', checkScreenSize)
})

// Загрузка текущего пользователя
const loadCurrentUser = async () => {
  try {
    currentUser.value = await api.auth.getCurrentUser()
  } catch {
    showNotification('Ошибка загрузки пользователя', 'error')
  }
}

// Загрузка экскурсий с пагинацией
const loadExcursions = async (page: number = currentPage.value) => {
  loading.value = true
  try {
    const skip = (page - 1) * pageSize.value
    const limit = pageSize.value
    const excursion_type: string = subtypeFilter.value ?? 'excursion'

    let response: Excursion[]

    // Выбираем нужный метод в зависимости от типа
    if (excursionType.value === 'active') {
      response = await api.excursions.getActiveExcursions({
        skip,
        limit,
        excursion_type,
      })
    } else {
      response = await api.excursions.getNotActiveExcursions({
        skip,
        limit,
        excursion_type,
      })
    }

    // TODO: Ваш API должен возвращать общее количество
    // Пока что будем считать, что если пришло меньше limit, значит это последняя страница
    // В реальности API должен возвращать { items: Excursion[], total: number }

    cards.value = response.sort((a, b) => {
      if (a.is_active !== b.is_active) {
        return a.is_active ? -1 : 1
      }
      const dateA = new Date(a.date).getTime()
      const dateB = new Date(b.date).getTime()
      return dateA - dateB
    })

    // Временная логика для подсчета общего количества
    // В реальности это должно приходить от API
    if (response.length < pageSize.value && page === currentPage.value) {
      totalItems.value = skip + response.length
    } else if (page === 1 && response.length === pageSize.value) {
      // Предположим, что есть еще элементы
      totalItems.value = pageSize.value * 2 // Примерное значение
    }

    totalPages.value = Math.ceil(totalItems.value / pageSize.value)
    currentPage.value = page

  } catch (error) {
    showNotification('Ошибка загрузки экскурсий', 'error')
    console.error('Error loading excursions:', error)
  } finally {
    loading.value = false
  }
}

// Метод для изменения подтипа (экскурсия/тур)
const setSubtypeFilter = (type: 'excursion' | 'tour') => {
  subtypeFilter.value = type
  loadExcursions()
}

// Метод для изменения типа экскурсий
const setExcursionType = async (type: 'active' | 'inactive') => {
  if (excursionType.value !== type) {
    excursionType.value = type
    await loadExcursions()
  }
}

// Загрузка детальной информации для экскурсии
const loadExcursionDetails = async (excursionId: number): Promise<ExcursionDetails | null> => {
  try {
    return await api.excursions.getExcursionDetails(excursionId)
  } catch (error) {
    if (error instanceof Error && error.message.includes('404')) {
      return null
    }
    console.error('Error loading excursion details:', error)
    return null
  }
}

// Методы пагинации
const goToPage = (page: number | string) => {
  if (typeof page === 'string' || page < 1 || page > totalPages.value) {
    return
  }
  loadExcursions(page as number)
}

const onPageSizeChange = () => {
  currentPage.value = 1 // Сбрасываем на первую страницу при изменении размера
  loadExcursions()
}

// Метод для отображения номеров страниц с многоточием
const getVisiblePages = () => {
  const pages: (number | string)[] = []
  const maxVisible = isMobile.value ? 3 : 5

  if (totalPages.value <= maxVisible) {
    // Показать все страницы
    for (let i = 1; i <= totalPages.value; i++) {
      pages.push(i)
    }
  } else {
    // Показать первую страницу, последнюю и текущую с соседями
    pages.push(1)

    if (currentPage.value > 3) {
      pages.push('...')
    }

    // Добавляем страницы вокруг текущей
    const start = Math.max(2, currentPage.value - 1)
    const end = Math.min(totalPages.value - 1, currentPage.value + 1)

    for (let i = start; i <= end; i++) {
      pages.push(i)
    }

    if (currentPage.value < totalPages.value - 2) {
      pages.push('...')
    }

    pages.push(totalPages.value)
  }

  return pages
}

// Поиск
const handleSearch = async () => {
  if (searchQuery.value.trim()) {
    try {
      // При поиске сбрасываем пагинацию на первую страницу
      currentPage.value = 1

      const response = await api.excursions.searchExcursions(searchQuery.value)

      cards.value = response.sort((a, b) => {
        if (a.is_active !== b.is_active) {
          return a.is_active ? -1 : 1
        }
        const dateA = new Date(a.date).getTime()
        const dateB = new Date(b.date).getTime()
        return dateA - dateB
      })

      // TODO: Обновить totalItems на основе ответа от API

    } catch {
      showNotification('Ошибка поиска', 'error')
    }
  } else {
    // При очистке поиска загружаем обычные экскурсии
    currentPage.value = 1
    loadExcursions()
  }
}

// Показ уведомления
const showNotification = (message: string, type: 'success' | 'error' = 'success') => {
  notification.value = { message, type }
  setTimeout(() => {
    notification.value.message = ''
  }, 3000)
}

// Обновляем метод saveCard для обработки изображений
const saveCard = async (data: {
  new: boolean
  excursion: ExcursionCreate
  details: ExcursionDetailsCreate
  imagesToAdd: File[]
  imagesToDelete: number[]
  uploadedImages: ExcursionImage[]
}) => {
  formLoading.value = true

  try {
    let excursion: Excursion

    // 1. Сохраняем/обновляем экскурсию
    if (editingCard.value && data.new == false) {
      // Обновляем существующую экскурсию
      excursion = await api.excursions.updateExcursion(editingCard.value.id, data.excursion)

      // 2. Сохраняем детали
      if (editingDetails.value) {
        await api.excursions.updateExcursionDetails(editingCard.value.id, data.details)
      } else {
        await api.excursions.createExcursionDetails(editingCard.value.id, data.details)
      }

      // 3. Обрабатываем изображения для существующей экскурсии
      await handleExcursionImages(excursion.id, data.imagesToAdd, data.imagesToDelete)

      showNotification('Экскурсия успешно обновлена')
    } else {
      // Создаем новую экскурсию
      excursion = await api.excursions.createExcursion(data.excursion)

      // 2. Создаем детали если есть
      if (
        Object.values(data.details).some((value) =>
          Array.isArray(value) ? value.some((item) => item && item !== '') : value && value !== '',
        )
      ) {
        await api.excursions.createExcursionDetails(excursion.id, data.details)
      }

      // 3. Загружаем изображения для новой экскурсии
      if (data.imagesToAdd.length > 0) {
        await handleNewExcursionImages(excursion.id, data.imagesToAdd)
      }

      showNotification('Экскурсия успешно создана')
    }

    console.log('test')
    // 4. Перезагружаем список экскурсий
    await loadExcursions()

    // 5. Закрываем форму
    cancelForm()

  } catch (error: any) {
    const errorMessage = error.message || 'Ошибка сохранения экскурсии'
    showNotification(errorMessage, 'error')
    console.error('Error saving excursion:', error)
  } finally {
    formLoading.value = false
  }
}

// Метод для обработки изображений существующей экскурсии
const handleExcursionImages = async (
  excursionId: number,
  imagesToAdd: File[],
  imagesToDelete: number[]
) => {
  if (imagesToDelete.length === 0 && imagesToAdd.length === 0) {
    return // Нет изменений в изображениях
  }

  imageUploading.value = true
  showNotification('Обработка изображений...', 'success')

  try {
    // Удаляем помеченные изображения
    if (imagesToDelete.length > 0) {
      await deleteExcursionImages(imagesToDelete)
    }

    // Добавляем новые изображения
    if (imagesToAdd.length > 0) {
      await addExcursionImages(excursionId, imagesToAdd)
    }

    showNotification('Изображения успешно обработаны', 'success')
  } catch (error: any) {
    showNotification(`Ошибка обработки изображений: ${error.message}`, 'error')
    console.error('Error handling excursion images:', error)
  } finally {
    imageUploading.value = false
    cancelForm()
  }
}

// Метод для обработки изображений новой экскурсии
const handleNewExcursionImages = async (excursionId: number, imagesToAdd: File[]) => {
  if (imagesToAdd.length === 0) return

  imageUploading.value = true
  showNotification('Загрузка изображений...', 'success')

  try {
    await addExcursionImages(excursionId, imagesToAdd)
    showNotification('Изображения успешно загружены', 'success')
  } catch (error: any) {
    showNotification(`Ошибка загрузки изображений: ${error.message}`, 'error')
    console.error('Error adding new excursion images:', error)
  } finally {
    imageUploading.value = false
  }
}

// Вспомогательный метод для добавления изображений
const addExcursionImages = async (excursionId: number, images: File[]): Promise<void> => {
  try {
    // Используем bulkAddExcursionImages для массовой загрузки
    if (images.length > 1) {
      await api.excursions.bulkAddExcursionImages(excursionId, images)
    } else if (images.length === 1) {
      // Для одного файла используем addExcursionImage
      await api.excursions.addExcursionImage(excursionId, images[0])
    }
  } catch (error) {
    console.error('Error adding excursion images:', error)
    throw error
  }
}

// Вспомогательный метод для удаления изображений
const deleteExcursionImages = async (imageIds: number[]): Promise<void> => {
  try {
    const deletePromises = imageIds.map(id =>
      api.excursions.deleteExcursionImage(id).catch(error => {
        console.error(`Error deleting image ${id}:`, error)
        return false
      })
    )

    await Promise.all(deletePromises)
  } catch (error) {
    console.error('Error deleting excursion images:', error)
    throw error
  }
}

// Добавления человек
const addPeopleToExcursion = async (data: { id: number; additionalPeople: number }) => {
  loading.value = true
  try {
    const updatedCard = await api.excursions.addPeopleToExcursion(data.id, data.additionalPeople)
    const index = cards.value.findIndex((card: Excursion) => card.id === data.id)
    if (index !== -1) {
      cards.value[index] = updatedCard
    }
    showNotification(`Добавлено ${data.additionalPeople} человек.`, 'success')
  } catch (error: any) {
    const errorMessage = error.message || 'Ошибка добавления мест'
    showNotification(errorMessage, 'error')
    console.error('Error adding people to excursion:', error)
  } finally {
    loading.value = false
  }
}

// Изменение номера автобуса
const changeBusNumber = async (data: { id: number; busNumber: number }) => {
  loading.value = true
  try {
    const updatedCard = await api.excursions.changeBusNumber(data.id, data.busNumber)
    const index = cards.value.findIndex((card: Excursion) => card.id === data.id)
    if (index !== -1) {
      cards.value[index] = updatedCard
    }
    showNotification(`Номер автобуса успешно изменен на ${data.busNumber}`, 'success')
  } catch (error: any) {
    const errorMessage = error.message || 'Ошибка изменения номера автобуса'
    showNotification(errorMessage, 'error')
    console.error('Error changing bus number:', error)
  } finally {
    loading.value = false
  }
}

// Переключение видимости карточки
const toggleCardVisibility = async (id: number) => {
  loading.value = true
  try {
    const updatedCard = await api.excursions.toggleExcursionActive(id)
    const index = cards.value.findIndex((card: Excursion) => card.id === id)
    if (index !== -1) {
      cards.value[index] = updatedCard
    }
    showNotification(`Экскурсия ${updatedCard.is_active ? 'активирована' : 'скрыта'}`, 'success')
  } catch (error) {
    showNotification('Ошибка переключения статуса', 'error')
    console.error('Error toggling excursion activity:', error)
  } finally {
    loading.value = false
  }
}

// Редактирование карточки
const editCard = async (card: Excursion) => {
  loading.value = true
  try {
    const details = await loadExcursionDetails(card.id)
    editingCard.value = card
    editingDetails.value = details
    showAddForm.value = true
  } catch (error) {
    showNotification('Ошибка загрузки детальной информации', 'error')
    console.error('Error loading excursion details:', error)
  } finally {
    loading.value = false
  }
}

// Удаление карточки
const deleteCard = async (id: number) => {
  loading.value = true
  try {
    await api.excursions.deleteExcursion(id)
    showNotification('Экскурсия успешно удалена')
    await loadExcursions()
  } catch (error) {
    showNotification('Ошибка удаления экскурсии', 'error')
    console.error('Error deleting excursion:', error)
  } finally {
    loading.value = false
  }
}

// Отмена формы
const cancelForm = () => {
  showAddForm.value = false
  editingCard.value = null
  editingDetails.value = null
}
</script>

<style scoped>
/* Добавляем стили для нового переключателя подтипов */
.excursion-subtype-toggle {
  display: flex;
  background: var(--border-green-medium);
  border-radius: 8px;
  padding: 4px;
  gap: 4px;
  margin-right: 10px;
}

.subtype-toggle-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 16px;
  border: none;
  border-radius: 6px;
  background: transparent;
  color: var(--text-light);
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
  white-space: nowrap;
}

.subtype-toggle-btn:hover {
  background: rgba(0, 0, 0, 0.05);
}

.subtype-toggle-btn.active {
  background: var(--green-primary);
  color: white;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.subtype-icon {
  font-size: 1.1rem;
}

/* Адаптивные стили для переключателей */
@media (max-width: 768px) {
  .excursion-subtype-toggle {
    order: -2;
    width: 100%;
    justify-content: center;
    margin-right: 0;
    margin-bottom: 10px;
  }

  .subtype-toggle-btn {
    flex: 1;
    justify-content: center;
  }

  .excursion-type-toggle {
    order: -1;
    width: 100%;
    justify-content: center;
    margin-right: 0;
    margin-bottom: 10px;
  }

  .type-toggle-btn {
    flex: 1;
    text-align: center;
  }

  .filters {
    flex-direction: column;
    gap: 10px;
  }
}

@media (max-width: 576px) {
  .subtype-toggle-btn {
    padding: 6px 12px;
    font-size: 13px;
  }

  .subtype-icon {
    font-size: 1rem;
  }
}

@media (max-width: 380px) {
  .subtype-toggle-btn {
    flex-direction: column;
    gap: 2px;
    padding: 6px 8px;
  }

  .subtype-icon {
    font-size: 1.2rem;
  }
}

.admin-panel {
  max-width: 1300px;
  margin: 0 auto;
  padding: 20px;
  min-height: 100vh;
}

/* Хедер */
.admin-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  border-bottom: 2px solid var(--border-turquoise);
  gap: 20px;
}

.admin-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.admin-header h1 {
  font-size: 30px;
  color: var(--text-dark);
  margin: 0;
  line-height: 1.2;
}

.user-info {
  display: flex;
  flex-direction: column;
  gap: 5px;
}

.user-email {
  color: var(--text-light);
  font-size: 0.9rem;
  font-weight: 500;
}

.admin-badge {
  background: #ffd700;
  color: #000;
  padding: 4px 8px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 600;
  align-self: flex-start;
}

.header-actions-mobile {
  display: none;
  flex-shrink: 0;
}

.mobile-action-btn {
  min-height: 44px;
}

/* Уведомления */
.notification {
  padding: 12px 16px;
  margin: 10px 0;
  border-radius: 8px;
  text-align: center;
  font-weight: 500;
}

.notification.success {
  background-color: #d4edda;
  color: #155724;
  border: 1px solid #c3e6cb;
}

.notification.error {
  background-color: #f8d7da;
  color: #721c24;
  border: 1px solid #f5c6cb;
}

/* Панель инструментов */
.toolbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  gap: 15px;
  flex-wrap: wrap;
}

.add-btn {
  flex-shrink: 0;
}

.filters {
  display: flex;
  gap: 10px;
  align-items: center;
  flex-wrap: wrap;
  flex: 1;
  justify-content: flex-end;
}

.search-container {
  position: relative;
  flex: 1;
  min-width: 200px;
  max-width: 300px;
}

.search-input {
  padding: 10px 12px;
  border: 1px solid var(--border-green-medium);
  border-radius: 8px;
  font-size: 14px;
  transition: all 0.3s ease;
  background: var(--white);
  width: 100%;
}

.search-input:focus {
  outline: none;
  border-color: var(--green-primary);
  box-shadow: 0 0 0 3px var(--hover-green);
}

.refresh-btn {
  flex-shrink: 0;
}

.btn-text {
  display: inline;
}

/* Стили для переключателя типа экскурсий */
.excursion-type-toggle {
  display: flex;
  background: var(--border-green-medium);
  border-radius: 8px;
  padding: 4px;
  gap: 4px;
  margin-right: 10px;
}

.type-toggle-btn {
  padding: 8px 16px;
  border: none;
  border-radius: 6px;
  background: transparent;
  color: var(--text-light);
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
  white-space: nowrap;
}

.type-toggle-btn:hover {
  background: rgba(0, 0, 0, 0.05);
}

.type-toggle-btn.active {
  background: var(--green-primary);
  color: white;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

/* Стили пагинации */
.pagination {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  margin-top: 30px;
  padding: 20px;
  flex-wrap: wrap;
}

.pagination-btn {
  padding: 8px 16px;
  border: 1px solid var(--border-green-medium);
  background: var(--white);
  border-radius: 6px;
  cursor: pointer;
  font-weight: 600;
  transition: all 0.3s ease;
  min-width: 44px;
  height: 44px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.pagination-btn:hover:not(:disabled) {
  background: var(--hover-green);
  border-color: var(--green-primary);
}

.pagination-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.page-numbers {
  display: flex;
  gap: 5px;
  align-items: center;
}

.page-btn {
  padding: 8px 14px;
  border: 1px solid var(--border-green-medium);
  background: var(--white);
  border-radius: 6px;
  cursor: pointer;
  min-width: 44px;
  height: 44px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
}

.page-btn:hover:not(:disabled):not(.active) {
  background: var(--hover-green);
  border-color: var(--green-primary);
}

.page-btn.active {
  background: var(--green-primary);
  color: white;
  border-color: var(--green-primary);
}

.page-btn:disabled {
  cursor: default;
  background: transparent;
  border: none;
}

.page-info {
  margin: 0 15px;
  color: var(--text-light);
  font-size: 14px;
  white-space: nowrap;
}

.page-size-selector {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-left: 15px;
}

.page-size-selector label {
  color: var(--text-light);
  font-size: 14px;
}

.size-select {
  padding: 8px 12px;
  border: 1px solid var(--border-green-medium);
  border-radius: 6px;
  background: var(--white);
  cursor: pointer;
  transition: border-color 0.3s ease;
}

.size-select:focus {
  outline: none;
  border-color: var(--green-primary);
}

/* Адаптивность пагинации */
@media (max-width: 768px) {
  .pagination {
    flex-direction: column;
    gap: 15px;
  }

  .page-numbers {
    order: 1;
  }

  .page-info {
    order: 2;
  }

  .page-size-selector {
    order: 3;
    margin-left: 0;
  }

  .pagination-btn {
    order: 0;
  }

  .page-btn {
    min-width: 40px;
    height: 40px;
    padding: 6px 10px;
  }
}

@media (max-width: 480px) {
  .page-numbers {
    gap: 3px;
  }

  .page-btn {
    min-width: 36px;
    height: 36px;
    padding: 4px 8px;
    font-size: 13px;
  }

  .page-info {
    font-size: 13px;
  }

  .page-size-selector {
    font-size: 13px;
  }

  .size-select {
    padding: 6px 10px;
    font-size: 13px;
  }
}

/* Адаптивные стили */
@media (max-width: 768px) {
  .excursion-type-toggle {
    order: -1;
    width: 100%;
    justify-content: center;
    margin-right: 0;
    margin-bottom: 10px;
  }

  .type-toggle-btn {
    flex: 1;
    text-align: center;
  }

  .filters {
    flex-direction: column;
    gap: 10px;
  }
}

@media (max-width: 576px) {
  .type-toggle-btn {
    padding: 6px 12px;
    font-size: 13px;
  }
}

/* Адаптивность для планшетов (768px - 1024px) */
@media (max-width: 1024px) {
  .admin-panel {
    padding: 15px;
  }

  .admin-header h1 {
    font-size: 26px;
  }

  .toolbar {
    gap: 12px;
  }

  .filters {
    gap: 8px;
  }

  .search-container {
    min-width: 180px;
    max-width: 250px;
  }
}

/* Мобильные устройства (576px - 768px) */
@media (max-width: 768px) {
  .admin-header {
    flex-direction: column;
    gap: 15px;
    align-items: stretch;
    text-align: center;
  }

  .admin-info {
    align-items: center;
  }

  .admin-badge {
    align-self: center;
  }

  .header-actions-mobile {
    display: flex;
    justify-content: center;
  }

  .toolbar {
    flex-direction: column;
    align-items: stretch;
    gap: 15px;
  }

  .filters {
    justify-content: stretch;
    gap: 10px;
  }

  .search-container {
    max-width: none;
    min-width: auto;
  }

  .refresh-btn {
    display: none;
  }
}

/* Маленькие мобильные (до 576px) */
@media (max-width: 576px) {
  .admin-panel {
    padding: 12px;
  }

  .admin-header h1 {
    font-size: 22px;
  }

  .user-info {
    align-items: center;
  }

  .user-email {
    font-size: 0.85rem;
    text-align: center;
  }

  .toolbar {
    margin-bottom: 15px;
  }

  .filters {
    flex-direction: column;
    gap: 8px;
  }

  .search-container {
    width: 100%;
  }

  .notification {
    padding: 10px 12px;
    font-size: 0.9rem;
  }

  /* Скрываем текст в кнопках на очень маленьких экранах */
  @media (max-width: 380px) {
    .btn-text {
      display: none;
    }

    .add-btn {
      min-width: auto;
      padding-left: 12px;
      padding-right: 12px;
    }

    .mobile-action-btn {
      min-width: auto;
    }
  }
}

/* Очень маленькие экраны (до 320px) */
@media (max-width: 320px) {
  .admin-panel {
    padding: 8px;
  }

  .admin-header h1 {
    font-size: 20px;
  }

  .admin-badge {
    font-size: 10px;
    padding: 3px 6px;
  }

  .search-input {
    padding: 8px 10px;
    font-size: 13px;
  }
}

/* Портретная ориентация мобильных */
@media (max-width: 768px) and (orientation: portrait) {
  .admin-header {
    margin-bottom: 20px;
    padding-bottom: 15px;
  }

  .toolbar {
    margin-bottom: 15px;
  }
}

/* Ландшафтная ориентация мобильных */
@media (max-width: 768px) and (orientation: landscape) {
  .admin-header {
    flex-direction: row;
    text-align: left;
  }

  .admin-info {
    align-items: flex-start;
  }

  .admin-badge {
    align-self: flex-start;
  }

  .toolbar {
    flex-direction: row;
  }

  .filters {
    flex-direction: row;
  }
}

/* Улучшения для доступности */
@media (max-width: 768px) {
  .search-input,
  .add-btn :deep(.base-button),
  .mobile-action-btn :deep(.base-button) {
    min-height: 44px;
  }
}

/* Плавные переходы */
.admin-header,
.toolbar,
.filters {
  transition: all 0.3s ease;
}
</style>
