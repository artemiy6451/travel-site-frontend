<template>
  <div class="admin-panel">
    <!-- Хедер -->
    <div class="admin-header">
      <div class="admin-info">
        <h1>Панель управления экскурсиями</h1>
        <span class="user-email">{{ currentUser?.email }}</span>
        <span v-if="currentUser?.is_superuser" class="admin-badge">👑 Администратор</span>
      </div>
      <div class="header-actions">
        <BaseButton variant="secondary" @click="refreshData" :loading="loading" icon="🔄">
          Обновить
        </BaseButton>

        <BaseButton variant="secondary" @click="handleLogoutClick" icon="🚪">
          Выйти
        </BaseButton>
      </div>
    </div>

    <!-- Уведомления -->
    <div v-if="notification.message" :class="['notification', notification.type]">
      {{ notification.message }}
    </div>

    <!-- Панель инструментов -->
    <div class="toolbar">
      <BaseButton variant="primary" @click="showAddForm = true" :disabled="loading" icon="+">
        Добавить экскурсию
      </BaseButton>

      <div class="filters">
        <input v-model="searchQuery" type="text" placeholder="Поиск экскурсий..." class="search-input"
          @input="handleSearch">
        <select v-model="selectedCategory" @change="handleCategoryFilter" class="category-filter">
          <option value="">Все категории</option>
          <option value="горные">Горные</option>
          <option value="морские">Морские</option>
          <option value="исторические">Исторические</option>
          <option value="природа">Природа</option>
          <option value="городские">Городские</option>
        </select>
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
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import type { User } from '@/types/user'
import { api } from '@/utils/api'
import {
  type Excursion,
  type ExcursionCreate,
  type ExcursionDetailsCreate,
  type ExcursionDetails
} from "@/types/excursion"
import BaseButton from '@/components/UI/BaseButton.vue'
import ExcursionForm from '@/components/Admin/ExcursionForm.vue'
import ExcursionList from '@/components/Admin/ExcursionList.vue'

const router = useRouter()
const currentUser = ref<User | null>(null)
const loading = ref(false)
const formLoading = ref(false)

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
  loadCurrentUser()
  loadExcursions()
})

// Загрузка текущего пользователя
const loadCurrentUser = async () => {
  try {
    currentUser.value = await api.getCurrentUser()
  } catch (error) {
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

    // Сортируем экскурсии: сначала активные по дате, потом скрытые по дате
    cards.value = response.sort((a, b) => {
      // Сначала сравниваем по статусу активности (активные первыми)
      if (a.is_active !== b.is_active) {
        return a.is_active ? -1 : 1
      }

      // Если статус одинаковый, сортируем по дате (ближайшие первыми)
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
    // Если детальная информация не найдена, возвращаем null
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

      // Применяем ту же логику сортировки к результатам поиска
      cards.value = response.sort((a, b) => {
        if (a.is_active !== b.is_active) {
          return a.is_active ? -1 : 1
        }
        const dateA = new Date(a.date).getTime()
        const dateB = new Date(b.date).getTime()
        return dateA - dateB
      })
    } catch (error) {
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

// Обновление данных
const refreshData = () => {
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
      // Редактирование существующей экскурсии
      excursion = await api.updateExcursion(editingCard.value.id, data.excursion)

      // Сохраняем детальную информацию
      if (editingDetails.value) {
        // Обновляем существующую детальную информацию
        await api.updateExcursionDetails(editingCard.value.id, data.details)
      } else {
        // Создаем новую детальную информацию
        await api.createExcursionDetails(editingCard.value.id, data.details)
      }

      showNotification('Экскурсия успешно обновлена')
    } else {
      // Создание новой экскурсии
      excursion = await api.createExcursion(data.excursion)

      // Создаем детальную информацию для новой экскурсии
      if (Object.values(data.details).some(value =>
        Array.isArray(value) ? value.some(item => item && item !== '') : value && value !== ''
      )) {
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

    // Обновляем карточку в локальном списке
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

    // Обновляем карточку в локальном списке
    const index = cards.value.findIndex((card: Excursion) => card.id === id)
    if (index !== -1) {
      cards.value[index] = updatedCard
    }

    showNotification(
      `Экскурсия ${updatedCard.is_active ? 'активирована' : 'скрыта'}`,
      'success'
    )
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
    // Загружаем детальную информацию для редактирования
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
    // При удалении экскурсии автоматически удалятся и детали благодаря CASCADE
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

// Выход
const handleLogoutClick = async () => {
  localStorage.removeItem('access_token')
  localStorage.removeItem('token_type')
  router.push('/login')
}
</script>

<style scoped>
.admin-panel {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
}

.admin-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 30px;
  padding-bottom: 20px;
  border-bottom: 2px solid var(--border-turquoise);
}

.admin-header h1 {
  font-size: 30px;
  color: var(--text-dark);
  margin: 0;
}

.admin-info {
  display: flex;
  flex-direction: column;
  gap: 5px;
}

.user-email {
  color: var(--text-light);
  font-size: 0.9rem;
}

.admin-badge {
  background: #ffd700;
  color: #000;
  padding: 2px 8px;
  border-radius: 12px;
  font-size: 12px;
  margin-left: 10px;
}

.header-actions {
  display: flex;
  gap: 10px;
}

/* Уведомления */
.notification {
  padding: 12px;
  margin: 10px 0;
  border-radius: 4px;
  text-align: center;
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
}

.filters {
  display: flex;
  gap: 10px;
  align-items: center;
}

.search-input,
.category-filter {
  padding: 8px 12px;
  border: 1px solid #ddd;
  border-radius: 4px;
}

/* Адаптивность */
@media (max-width: 768px) {
  .admin-header {
    flex-direction: column;
    gap: 15px;
    align-items: stretch;
  }

  .toolbar {
    flex-direction: column;
    align-items: stretch;
  }

  .filters {
    justify-content: space-between;
  }
}

@media (max-width: 480px) {
  .admin-panel {
    padding: 15px;
  }
}
</style>
