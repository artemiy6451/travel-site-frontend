<template>
  <div class="cards-list">
    <!-- Статистика -->
    <div class="stats">
      <div class="stat-item">
        <span class="stat-number">{{ totalCards }}</span>
        <span class="stat-label">Всего экскурсий</span>
      </div>
      <div class="stat-item">
        <span class="stat-number">{{ activeCards }}</span>
        <span class="stat-label">Активных</span>
      </div>
      <div class="stat-item">
        <span class="stat-number">{{ hiddenCards }}</span>
        <span class="stat-label">Скрытых</span>
      </div>
      <div class="stat-item">
        <span class="stat-number">{{ totalAvailableSpots }}</span>
        <span class="stat-label">Всего мест доступно</span>
      </div>
    </div>

    <!-- Таблица -->
    <div class="table-container">
      <table class="cards-table">
        <thead>
          <tr>
            <th>Изображение</th>
            <th>Название</th>
            <th>Категория</th>
            <th>Дата отправления</th>
            <th>Цена</th>
            <th>Места</th>
            <th>Статус</th>
            <th>Действия</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="card in cards" :key="card.id" :class="{ 'hidden-card': !card.is_active }">
            <td>
              <div class="card-image-preview">
                <img :src="card.image_url" :alt="card.title" @error="handleImageError">
              </div>
            </td>
            <td class="card-title-cell">
              <strong>{{ card.title }}</strong>
              <p class="card-description-preview">{{ card.description }}</p>
            </td>
            <td>
              <span class="category-badge" :class="card.category">
                {{ getCategoryName(card.category) }}
              </span>
            </td>
            <td class="card-date">
              <div class="date-container">
                <ExcursionDeparture :date="card.date" class="departure-component" />
              </div>
            </td>
            <td class="card-price">{{ card.price }} ₽</td>
            <td class="card-people">
              <div class="people-info">
                <div class="people-progress">
                  <div class="progress-bar">
                    <div class="progress-fill" :class="getProgressClass(card)"
                      :style="{ width: getProgressPercentage(card) + '%' }"></div>
                  </div>
                  <div class="people-numbers">
                    <span class="people-left">{{ card.people_left }}</span>
                    <span class="people-separator">/</span>
                    <span class="people-total">{{ card.people_amount }}</span>
                  </div>
                </div>
                <div class="people-status" :class="getPeopleStatusClass(card)">
                  {{ getPeopleStatusText(card) }}
                </div>
              </div>
            </td>
            <td>
              <span class="status-badge" :class="{ active: card.is_active, hidden: !card.is_active }">
                {{ card.is_active ? 'Активна' : 'Скрыта' }}
              </span>
            </td>
            <td class="actions">
              <!-- Кнопка добавления мест -->
              <BaseButton variant="primary" size="sm" icon="➕" @click="openAddPeopleDialog(card)" title="Добавить людей"
                :disabled="loading" />

              <BaseButton :variant="card.is_active ? 'warning' : 'success'" size="sm"
                :icon="card.is_active ? '👁️' : '👁️‍🗨️'" @click="emit('toggle-visibility', card.id)"
                :title="card.is_active ? 'Скрыть' : 'Показать'" :disabled="loading" />

              <BaseButton variant="info" size="sm" icon="✏️" @click="emit('edit', card)" title="Редактировать"
                :disabled="loading" />

              <BaseButton variant="danger" size="sm" icon="🗑️" :loading="loading" @click="emit('delete', card.id)"
                title="Удалить" />
            </td>
          </tr>
        </tbody>
      </table>

      <!-- Состояние загрузки -->
      <div v-if="loading" class="loading-state">
        Загрузка экскурсий...
      </div>

      <!-- Пустое состояние -->
      <div v-else-if="cards.length === 0" class="empty-state">
        Экскурсии не найдены
      </div>
    </div>

    <!-- Диалог добавления мест -->
    <div v-if="showAddPeopleDialog" class="dialog-overlay">
      <div class="dialog-container">
        <div class="dialog-header">
          <h3>Добавить людей</h3>
          <button class="dialog-close" @click="closeAddPeopleDialog">×</button>
        </div>

        <div class="dialog-content">
          <p class="dialog-description">
            Добавить людей на экскурсию <strong>"{{ selectedCard?.title }}"</strong>
          </p>

          <div class="form-group">
            <label for="additional-people">Количество человек:</label>
            <input id="additional-people" v-model.number="additionalPeople" type="number" min="1" max="100"
              placeholder="Введите количество" class="number-input" @keyup.enter="confirmAddPeople" />
          </div>

          <div class="current-info">
            <p>Текущее состояние:</p>
            <ul>
              <li>Всего мест: <strong>{{ selectedCard?.people_amount }}</strong></li>
              <li>Свободно мест: <strong>{{ selectedCard?.people_left }}</strong></li>
              <li>После добавления: <strong>{{ (selectedCard?.people_left || 0) -
                additionalPeople }}</strong> свободных
                мест</li>
            </ul>
          </div>
        </div>

        <div class="dialog-actions">
          <BaseButton variant="secondary" @click="closeAddPeopleDialog" :disabled="addPeopleLoading">
            Отмена
          </BaseButton>
          <BaseButton
            variant="primary"
            @click="confirmAddPeople"
            :loading="addPeopleLoading"
            :disabled="!additionalPeople || additionalPeople == 0 || !selectedCard?.people_left || (selectedCard.people_left - additionalPeople) < 0"
          >
            Добавить места
          </BaseButton>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { type Excursion } from '@/types/excursion'
import BaseButton from '@/components/UI/BaseButton.vue'
import ExcursionDeparture from '@/components/Excursion/ExcursionDeparture.vue'

interface Props {
  cards: Excursion[]
  loading?: boolean
}

interface Emits {
  (e: 'toggle-visibility', id: number): void
  (e: 'edit', card: Excursion): void
  (e: 'delete', id: number): void
  (e: 'add-people', data: { id: number; additionalPeople: number }): void
}

const props = withDefaults(defineProps<Props>(), {
  loading: false
})

const emit = defineEmits<Emits>()

// Диалог добавления мест
const showAddPeopleDialog = ref(false)
const selectedCard = ref<Excursion | null>(null)
const additionalPeople = ref(1)
const addPeopleLoading = ref(false)

// Статистика
const totalCards = computed(() => props.cards.length)
const activeCards = computed(() => props.cards.filter(card => card.is_active).length)
const hiddenCards = computed(() => props.cards.filter(card => !card.is_active).length)
const totalAvailableSpots = computed(() =>
  props.cards.reduce((total, card) => total + card.people_left, 0)
)

// Получение названия категории
const getCategoryName = (category: string) => {
  const categories: { [key: string]: string } = {
    'горные': 'Горные',
    'морские': 'Морские',
    'исторические': 'Исторические',
    'природа': 'Природа',
    'городские': 'Городские'
  }
  return categories[category] || category
}

// Получение процента заполненности
const getProgressPercentage = (card: Excursion) => {
  if (card.people_amount === 0) return 0
  const occupied = card.people_amount - card.people_left
  return (occupied / card.people_amount) * 100
}

// Получение класса для прогресс-бара
const getProgressClass = (card: Excursion) => {
  const percentage = getProgressPercentage(card)
  if (percentage >= 90) return 'danger'
  if (percentage >= 70) return 'warning'
  return 'success'
}

// Получение класса статуса мест
const getPeopleStatusClass = (card: Excursion) => {
  if (card.people_left === 0) return 'sold-out'
  if (card.people_left <= card.people_amount * 0.2) return 'few-left'
  return 'available'
}

// Получение текста статуса мест
const getPeopleStatusText = (card: Excursion) => {
  if (card.people_left === 0) return 'Мест нет'
  if (card.people_left <= card.people_amount * 0.2) return 'Мало мест'
  return 'Есть места'
}

// Открытие диалога добавления мест
const openAddPeopleDialog = (card: Excursion) => {
  selectedCard.value = card
  additionalPeople.value = 1
  showAddPeopleDialog.value = true
}

// Закрытие диалога
const closeAddPeopleDialog = () => {
  showAddPeopleDialog.value = false
  selectedCard.value = null
  additionalPeople.value = 1
  addPeopleLoading.value = false
}

// Подтверждение добавления мест
const confirmAddPeople = async () => {
  if (!selectedCard.value || !additionalPeople.value || additionalPeople.value == 0 ||
    selectedCard.value.people_left - additionalPeople.value < 0) {
    return
  }

  addPeopleLoading.value = true
  try {
    emit('add-people', {
      id: selectedCard.value.id,
      additionalPeople: additionalPeople.value
    })
    closeAddPeopleDialog()
  } catch (error) {
    console.error('Error adding people:', error)
  } finally {
    addPeopleLoading.value = false
  }
}

// Обработчик ошибки загрузки изображения
const handleImageError = (event: Event) => {
  const target = event.target as HTMLImageElement
  target.src = ''
}
</script>

<style scoped>
/* Стили остаются такими же как в предыдущем ответе */
.cards-list {
  margin-top: 20px;
}

.stats {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 20px;
  margin-bottom: 30px;
}

.stat-item {
  background: white;
  padding: 20px;
  border-radius: 10px;
  text-align: center;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
  border: 1px solid var(--border-green-light);
}

.stat-number {
  display: block;
  font-size: 2rem;
  font-weight: 700;
  color: var(--green-primary);
  margin-bottom: 5px;
}

.stat-label {
  color: var(--text-medium);
  font-size: 0.9rem;
}

.table-container {
  background: white;
  border-radius: 15px;
  overflow: hidden;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
  position: relative;
  min-height: 200px;
}

.cards-table {
  width: 100%;
  border-collapse: collapse;
}

.cards-table th {
  background: var(--green-bg);
  padding: 15px;
  text-align: left;
  font-weight: 600;
  color: var(--text-dark);
  border-bottom: 2px solid var(--border-turquoise);
}

.cards-table td {
  padding: 15px;
  border-bottom: 1px solid var(--border-green-light);
}

.cards-table tr.hidden-card {
  background-color: #f8f9fa;
  opacity: 0.7;
}

.cards-table tr.hidden-card:hover {
  opacity: 1;
}

.cards-table tr:last-child td {
  border-bottom: none;
}

.card-image-preview {
  width: 60px;
  height: 40px;
  border-radius: 6px;
  overflow: hidden;
}

.card-image-preview img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.card-title-cell strong {
  color: var(--text-dark);
  display: block;
  margin-bottom: 5px;
}

.card-description-preview {
  color: var(--text-light);
  font-size: 0.8rem;
  margin: 0;
  max-width: 200px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.category-badge {
  padding: 4px 12px;
  border-radius: 20px;
  font-size: 0.8rem;
  font-weight: 500;
  background: var(--green-bg-light);
  color: var(--green-dark);
}

.card-date {
  font-size: 0.9rem;
  color: var(--text-medium);
  white-space: nowrap;
}

.date-container {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.card-price {
  font-weight: 600;
  color: var(--green-dark);
}

.card-people {
  min-width: 120px;
}

.people-info {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.people-progress {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.progress-bar {
  width: 100%;
  height: 6px;
  background-color: #e9ecef;
  border-radius: 3px;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  border-radius: 3px;
  transition: width 0.3s ease;
}

.progress-fill.success {
  background-color: #28a745;
}

.progress-fill.warning {
  background-color: #ffc107;
}

.progress-fill.danger {
  background-color: #dc3545;
}

.people-numbers {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 2px;
  font-size: 0.8rem;
  font-weight: 500;
}

.people-left {
  color: var(--text-dark);
  font-weight: 600;
}

.people-separator {
  color: var(--text-light);
}

.people-total {
  color: var(--text-light);
}

.people-status {
  font-size: 0.75rem;
  font-weight: 500;
  text-align: center;
  padding: 2px 6px;
  border-radius: 10px;
}

.people-status.available {
  background-color: #d4edda;
  color: #155724;
}

.people-status.few-left {
  background-color: #fff3cd;
  color: #856404;
}

.people-status.sold-out {
  background-color: #f8d7da;
  color: #721c24;
}

.status-badge {
  padding: 6px 12px;
  border-radius: 15px;
  font-size: 0.8rem;
  font-weight: 500;
}

.status-badge.active {
  background: #d4edda;
  color: #155724;
}

.status-badge.hidden {
  background: #f8d7da;
  color: #721c24;
}

.actions {
  display: flex;
  gap: 8px;
}

.loading-state {
  padding: 40px;
  text-align: center;
  font-style: italic;
  color: #666;
}

.empty-state {
  padding: 40px;
  text-align: center;
  color: #666;
  font-style: italic;
}

/* Стили для диалога добавления мест */
.dialog-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 20px;
}

.dialog-container {
  background: white;
  border-radius: 15px;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.2);
  max-width: 500px;
  width: 100%;
  max-height: 90vh;
  overflow-y: auto;
}

.dialog-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 25px;
  border-bottom: 1px solid var(--border-green-light);
}

.dialog-header h3 {
  margin: 0;
  color: var(--text-dark);
}

.dialog-close {
  background: none;
  border: none;
  font-size: 24px;
  cursor: pointer;
  color: var(--text-light);
  padding: 0;
  width: 30px;
  height: 30px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
}

.dialog-close:hover {
  background: #f8f9fa;
  color: var(--text-dark);
}

.dialog-content {
  padding: 25px;
}

.dialog-description {
  margin-bottom: 20px;
  color: var(--text-medium);
  line-height: 1.5;
}

.form-group {
  margin-bottom: 20px;
}

.form-group label {
  display: block;
  margin-bottom: 8px;
  font-weight: 600;
  color: var(--text-dark);
}

.number-input {
  width: 100%;
  padding: 12px;
  border: 2px solid var(--border-turquoise);
  border-radius: 8px;
  font-size: 1rem;
  transition: all 0.3s ease;
  background: var(--green-bg);
}

.number-input:focus {
  outline: none;
  border-color: var(--green-primary);
  box-shadow: 0 0 0 3px var(--hover-turquoise);
}

.current-info {
  background: #f8f9fa;
  padding: 15px;
  border-radius: 8px;
  border-left: 4px solid var(--green-primary);
}

.current-info p {
  margin: 0 0 10px 0;
  font-weight: 600;
  color: var(--text-dark);
}

.current-info ul {
  margin: 0;
  padding-left: 20px;
}

.current-info li {
  margin-bottom: 5px;
  color: var(--text-medium);
}

.dialog-actions {
  display: flex;
  gap: 15px;
  justify-content: flex-end;
  padding: 20px 25px;
  border-top: 1px solid var(--border-green-light);
}

/* Адаптивность */
@media (max-width: 1024px) {
  .stats {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 768px) {
  .stats {
    grid-template-columns: 1fr;
  }

  .table-container {
    overflow-x: auto;
  }

  .cards-table {
    min-width: 900px;
  }

  .actions {
    flex-direction: column;
  }

  .date-container {
    gap: 4px;
  }

  .card-people {
    min-width: 100px;
  }

  .dialog-container {
    margin: 20px;
  }

  .dialog-actions {
    flex-direction: column;
  }
}

@media (max-width: 480px) {
  .stat-item {
    padding: 15px;
  }

  .stat-number {
    font-size: 1.5rem;
  }

  .people-info {
    gap: 6px;
  }

  .people-numbers {
    font-size: 0.75rem;
  }

  .people-status {
    font-size: 0.7rem;
  }
}
</style>
