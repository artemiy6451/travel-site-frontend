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
      <div class="header-actions-mobile" v-if="isMobile">
        <BaseButton
          variant="secondary"
          @click="refreshData"
          :loading="loading"
          icon="🔄"
          size="sm"
          class="mobile-action-btn"
          title="Обновить"
        />
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
        <div class="search-container">
          <input
            v-model="searchQuery"
            type="text"
            placeholder="Поиск экскурсий..."
            class="search-input"
            @input="handleSearch"
          />
        </div>
        <select v-model="selectedCategory" @change="handleCategoryFilter" class="category-filter">
          <option value="">Все категории</option>
          <option value="горные">Горные</option>
          <option value="морские">Морские</option>
          <option value="исторические">Исторические</option>
          <option value="природа">Природа</option>
          <option value="городские">Городские</option>
        </select>

        <!-- Кнопка обновления для десктопа -->
        <BaseButton
          v-if="!isMobile"
          variant="secondary"
          @click="refreshData"
          :loading="loading"
          icon="🔄"
          size="sm"
          class="refresh-btn"
          title="Обновить данные"
        >
          <span class="btn-text">Обновить</span>
        </BaseButton>
      </div>
    </div>

    <!-- Компонент формы -->
    <ExcursionForm
      :visible="showAddForm"
      :loading="formLoading"
      :editing-card="editingCard"
      :editing-details="editingDetails"
      @submit="saveCard"
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
    />
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
const selectedCategory = ref('')

// Форма
const showAddForm = ref(false)
const editingCard = ref<Excursion | null>(null)
const editingDetails = ref<ExcursionDetails | null>(null)

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

// Обновление данных
const refreshData = () => {
  loadExcursions()
}

// Загрузка текущего пользователя
const loadCurrentUser = async () => {
  try {
    currentUser.value = await api.getCurrentUser()
  } catch {
    showNotification('Ошибка загрузки пользователя', 'error')
  }
}

// Загрузка экскурсий
const loadExcursions = async () => {
  loading.value = true
  try {
    const params: any = {}
    if (selectedCategory.value) {
      params.category = selectedCategory.value
    }
    const response = await api.getExcursions(params)

    cards.value = response.sort((a, b) => {
      if (a.is_active !== b.is_active) {
        return a.is_active ? -1 : 1
      }
      const dateA = new Date(a.date).getTime()
      const dateB = new Date(b.date).getTime()
      return dateA - dateB
    })
  } catch (error) {
    showNotification('Ошибка загрузки экскурсий', 'error')
    console.error('Error loading excursions:', error)
  } finally {
    loading.value = false
  }
}

// Загрузка детальной информации для экскурсии
const loadExcursionDetails = async (excursionId: number): Promise<ExcursionDetails | null> => {
  try {
    return await api.getExcursionDetails(excursionId)
  } catch (error) {
    if (error instanceof Error && error.message.includes('404')) {
      return null
    }
    console.error('Error loading excursion details:', error)
    return null
  }
}

// Поиск
const handleSearch = async () => {
  if (searchQuery.value.trim()) {
    try {
      const response = await api.searchExcursions(searchQuery.value)
      cards.value = response.sort((a, b) => {
        if (a.is_active !== b.is_active) {
          return a.is_active ? -1 : 1
        }
        const dateA = new Date(a.date).getTime()
        const dateB = new Date(b.date).getTime()
        return dateA - dateB
      })
    } catch {
      showNotification('Ошибка поиска', 'error')
    }
  } else {
    loadExcursions()
  }
}

// Фильтр по категории
const handleCategoryFilter = () => {
  loadExcursions()
}

// Показ уведомления
const showNotification = (message: string, type: 'success' | 'error' = 'success') => {
  notification.value = { message, type }
  setTimeout(() => {
    notification.value.message = ''
  }, 3000)
}

// Добавление/сохранение карточки
const saveCard = async (data: { excursion: ExcursionCreate; details: ExcursionDetailsCreate }) => {
  formLoading.value = true
  try {
    let excursion: Excursion

    if (editingCard.value) {
      excursion = await api.updateExcursion(editingCard.value.id, data.excursion)
      if (editingDetails.value) {
        await api.updateExcursionDetails(editingCard.value.id, data.details)
      } else {
        await api.createExcursionDetails(editingCard.value.id, data.details)
      }
      showNotification('Экскурсия успешно обновлена')
    } else {
      excursion = await api.createExcursion(data.excursion)
      if (
        Object.values(data.details).some((value) =>
          Array.isArray(value) ? value.some((item) => item && item !== '') : value && value !== '',
        )
      ) {
        await api.createExcursionDetails(excursion.id, data.details)
      }
      showNotification('Экскурсия успешно создана')
    }

    await loadExcursions()
    cancelForm()
  } catch (error: any) {
    const errorMessage = error.message || 'Ошибка сохранения экскурсии'
    showNotification(errorMessage, 'error')
    console.error('Error saving excursion:', error)
  } finally {
    formLoading.value = false
  }
}

// Добавления человек
const addPeopleToExcursion = async (data: { id: number; additionalPeople: number }) => {
  loading.value = true
  try {
    const updatedCard = await api.addPeopleToExcursion(data.id, data.additionalPeople)
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

// Переключение видимости карточки
const toggleCardVisibility = async (id: number) => {
  loading.value = true
  try {
    const updatedCard = await api.toggleExcursionActive(id)
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
    await api.deleteExcursion(id)
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

.search-input,
.category-filter {
  padding: 10px 12px;
  border: 1px solid var(--border-green-medium);
  border-radius: 8px;
  font-size: 14px;
  transition: all 0.3s ease;
  background: var(--white);
  width: 100%;
}

.search-input:focus,
.category-filter:focus {
  outline: none;
  border-color: var(--green-primary);
  box-shadow: 0 0 0 3px var(--hover-green);
}

.category-filter {
  min-width: 150px;
  max-width: 300px;
  cursor: pointer;
}

.refresh-btn {
  flex-shrink: 0;
}

.btn-text {
  display: inline;
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

  .category-filter {
    min-width: 180px;
    max-width: 250px;
    cursor: pointer;
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

  .category-filter {
    min-width: auto;
    max-width: none;
    flex: 1;
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

  .category-filter {
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

  .search-input,
  .category-filter {
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
  .category-filter,
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
