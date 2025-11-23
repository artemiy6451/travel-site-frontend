<template>
  <div class="cards-list">
    <!-- Статистика -->
    <StatsComponent
      :total="stats.total"
      :active="stats.active"
      :hidden="stats.hidden"
      :total-spots="stats.totalSpots"
    />

    <!-- Остальной код остается без изменений -->
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
            <!-- Строка 1: Фото -->
            <td class="image-cell">
              <div class="card-image-preview">
                <img :src="card.image_url" :alt="card.title" @error="handleImageError" />
              </div>
            </td>

            <!-- Строка 2: Описание -->
            <td class="title-cell">
              <strong class="card-title">{{ card.title }}</strong>
              <p class="card-description">{{ card.description }}</p>
            </td>

            <!-- Строка 3: Категория -->
            <td class="category-cell">
              <span class="category-badge" :class="card.category">
                {{ getCategoryName(card.category) }}
              </span>
            </td>

            <!-- Строка 3: Дата -->
            <td class="date-cell">
              <div class="date-container">
                <ExcursionDeparture :date="card.date" />
              </div>
            </td>

            <!-- Строка 3: Цена -->
            <td class="price-cell">
              <span class="card-price">{{ card.price }} ₽</span>
            </td>

            <!-- Строка 3: Места -->
            <td class="people-cell">
              <div class="people-info">
                <div class="people-progress">
                  <div class="progress-bar">
                    <div
                      class="progress-fill"
                      :class="getProgressClass(card)"
                      :style="{ width: getProgressPercentage(card) + '%' }"
                    ></div>
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

            <!-- Строка 4: Статус -->
            <td class="status-cell">
              <span
                class="status-badge"
                :class="{ active: card.is_active, hidden: !card.is_active }"
              >
                {{ card.is_active ? 'Активна' : 'Скрыта' }}
              </span>
            </td>

            <!-- Строка 5: Кнопки -->
            <td class="actions-cell">
              <div class="actions">
                <BaseButton
                  variant="primary"
                  size="sm"
                  icon="➕"
                  @click="openAddPeopleDialog(card)"
                  title="Добавить людей"
                  :disabled="loading"
                />
                <!-- Новая кнопка для изменения номера автобуса -->
                <BaseButton
                  variant="secondary"
                  size="sm"
                  icon="🚌"
                  @click="openBusNumberDialog(card)"
                  title="Изменить номер автобуса"
                  :disabled="loading"
                />
                <BaseButton
                  :variant="card.is_active ? 'warning' : 'success'"
                  size="sm"
                  :icon="card.is_active ? '👁️' : '👁️‍🗨️'"
                  @click="emit('toggle-visibility', card.id)"
                  :title="card.is_active ? 'Скрыть' : 'Показать'"
                  :disabled="loading"
                />
                <BaseButton
                  variant="info"
                  size="sm"
                  icon="✏️"
                  @click="emit('edit', card)"
                  title="Редактировать"
                  :disabled="loading"
                />
                <BaseButton
                  variant="danger"
                  size="sm"
                  icon="🗑️"
                  :loading="loading"
                  @click="emit('delete', card.id)"
                  title="Удалить"
                />
              </div>
            </td>
          </tr>
        </tbody>
      </table>

      <!-- Состояние загрузки -->
      <div v-if="loading" class="loading-state">
        <div class="loading-spinner"></div>
        <span>Загрузка экскурсий...</span>
      </div>

      <!-- Пустое состояние -->
      <div v-else-if="cards.length === 0" class="empty-state">
        <div class="empty-icon">📝</div>
        <h3>Экскурсии не найдены</h3>
        <p>Создайте первую экскурсию или измените параметры фильтрации</p>
      </div>
    </div>

    <!-- Диалог добавления мест -->
    <AddPeopleDialog
      :visible="showAddPeopleDialog"
      :card="selectedCard"
      :loading="addPeopleLoading"
      @update:visible="showAddPeopleDialog = $event"
      @confirm="handleAddPeopleConfirm"
      @close="handleDialogClose"
    />

    <!-- Диалог изменения номера автобуса -->
    <BusNumberDialog
      :visible="showBusNumberDialog"
      :card="selectedCard"
      :loading="busNumberLoading"
      @update:visible="showBusNumberDialog = $event"
      @confirm="handleBusNumberConfirm"
      @close="handleDialogClose"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, watchEffect } from 'vue'
import { handleImageError } from '@/utils/image'
import { type Excursion } from '@/types/excursion'
import BaseButton from '@/components/UI/BaseButton.vue'
import ExcursionDeparture from '@/components/Excursion/ExcursionDeparture.vue'
import StatsComponent from '@/components/UI/StatsComponent.vue'
import AddPeopleDialog from '@/components/Admin/AddPeopleDialog.vue'
import BusNumberDialog from '@/components/Admin/BusNumberDialog.vue'

interface Props {
  cards: Excursion[]
  loading?: boolean
}

interface Emits {
  (e: 'toggle-visibility', id: number): void
  (e: 'edit', card: Excursion): void
  (e: 'delete', id: number): void
  (e: 'add-people', data: { id: number; additionalPeople: number }): void
  (e: 'change-bus-number', data: { id: number; busNumber: number }): void
}

const props = withDefaults(defineProps<Props>(), {
  loading: false,
})

const emit = defineEmits<Emits>()

// Диалог добавления мест
const showAddPeopleDialog = ref(false)
const selectedCard = ref<Excursion | null>(null)
const addPeopleLoading = ref(false)

// Диалог изменения номера автобуса
const showBusNumberDialog = ref(false)
const busNumberLoading = ref(false)

// Статистика
const stats = ref({
  total: 0,
  active: 0,
  hidden: 0,
  totalSpots: 0,
})

watchEffect(() => {
  const cards = props.cards
  stats.value = {
    total: cards.length,
    active: cards.filter((card) => card.is_active).length,
    hidden: cards.filter((card) => !card.is_active).length,
    totalSpots: cards.reduce((total, card) => total + card.people_left, 0),
  }
})

// Получение названия категории
const getCategoryName = (category: string) => {
  const categories: { [key: string]: string } = {
    горные: 'Горные',
    морские: 'Морские',
    исторические: 'Исторические',
    природа: 'Природа',
    городские: 'Городские',
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
  showAddPeopleDialog.value = true
}

// Открытие диалога изменения номера автобуса
const openBusNumberDialog = (card: Excursion) => {
  selectedCard.value = card
  showBusNumberDialog.value = true
}

// Обработка подтверждения из диалога добавления мест
const handleAddPeopleConfirm = (data: { id: number; additionalPeople: number }) => {
  addPeopleLoading.value = true
  try {
    emit('add-people', data)
    showAddPeopleDialog.value = false
  } catch (error) {
    console.error('Error adding people:', error)
  } finally {
    addPeopleLoading.value = false
  }
}

// Обработка подтверждения из диалога номера автобуса
const handleBusNumberConfirm = (data: { id: number; busNumber: number }) => {
  busNumberLoading.value = true
  try {
    emit('change-bus-number', data)
    showBusNumberDialog.value = false
  } catch (error) {
    console.error('Error changing bus number:', error)
  } finally {
    busNumberLoading.value = false
  }
}

// Обработка закрытия диалогов
const handleDialogClose = () => {
  selectedCard.value = null
}
</script>

<style scoped>
.cards-list {
  margin-top: 20px;
}

/* Статистика */
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
  transition: transform 0.2s ease;
}

.stat-item:hover {
  transform: translateY(-2px);
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

/* Таблица */
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
  vertical-align: middle;
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

/* Ячейки таблицы */
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

.card-title {
  color: var(--text-dark);
  display: block;
  margin-bottom: 5px;
  font-size: 0.95rem;
}

.card-description {
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

.date-container {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.card-price {
  font-weight: 600;
  color: var(--green-dark);
  font-size: 0.95rem;
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
  flex-wrap: wrap;
}

/* Состояния загрузки и пустого состояния */
.loading-state {
  padding: 40px 20px;
  text-align: center;
  color: var(--text-light);
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
}

.loading-spinner {
  width: 32px;
  height: 32px;
  border: 3px solid #f3f3f3;
  border-top: 3px solid var(--green-primary);
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

.empty-state {
  padding: 50px 20px;
  text-align: center;
  color: var(--text-light);
}

.empty-icon {
  font-size: 3rem;
  margin-bottom: 16px;
  opacity: 0.5;
}

.empty-state h3 {
  margin: 0 0 8px 0;
  color: var(--text-medium);
  font-size: 1.2rem;
}

.empty-state p {
  margin: 0;
  font-size: 0.9rem;
}

.number-input {
  width: 100%;
  padding: 12px 16px;
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
  padding: 16px;
  border-radius: 8px;
  border-left: 4px solid var(--green-primary);
}

.current-info p {
  margin: 0 0 12px 0;
  font-weight: 600;
  color: var(--text-dark);
  font-size: 0.9rem;
}

.current-info ul {
  margin: 0;
  padding-left: 20px;
}

.current-info li {
  margin-bottom: 4px;
  color: var(--text-medium);
  font-size: 0.9rem;
}

.dialog-actions {
  display: flex;
  gap: 12px;
  justify-content: flex-end;
  padding: 20px 24px;
  border-top: 1px solid var(--border-green-light);
}

/* Анимации */
@keyframes spin {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}

/* Адаптивность */
@media (max-width: 1200px) {
  .stats {
    grid-template-columns: repeat(2, 1fr);
    gap: 12px;
  }

  .stat-item {
    padding: 16px;
  }

  .stat-number {
    font-size: 1.75rem;
  }
}

@media (max-width: 968px) {
  .table-container {
    display: block;
    overflow-x: visible;
  }

  .cards-table {
    min-width: auto;
    display: block;
  }

  .cards-table thead {
    display: none;
  }

  .cards-table tbody {
    display: flex;
    flex-direction: column;
    gap: 16px;
  }

  .cards-table tr {
    display: flex;
    flex-direction: column;
    background: white;
    border-radius: 12px;
    padding: 0;
    box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
    border: 1px solid var(--border-green-light);
    overflow: hidden;
  }

  .cards-table td {
    display: flex;
    padding: 12px 16px;
    border-bottom: 1px solid var(--border-green-light);
    align-items: center;
  }

  .cards-table td:last-child {
    border-bottom: none;
  }

  /* Строка 1: Фото */
  .image-cell {
    padding: 0 !important;
    border-bottom: none;
    justify-content: center;
  }

  .card-image-preview {
    width: 100%;
    height: 160px;
    border-radius: 0;
  }

  /* Строка 2: Описание */
  .title-cell {
    flex-direction: column;
    align-items: center;
    gap: 8px;
    padding-top: 16px;
    padding-bottom: 16px;
    text-align: center;
  }

  .card-title {
    font-size: 1.1rem;
    margin-bottom: 6px;
  }

  .card-description {
    font-size: 0.9rem;
    line-height: 1.4;
    max-width: none;
    white-space: normal;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
    color: var(--text-medium);
  }

  /* Строка 3: Вся информация в одной строке */
  .category-cell,
  .date-cell,
  .price-cell,
  .people-cell {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 16px;
    padding: 12px 16px;
    border-bottom: none;
    flex-wrap: wrap;
  }

  /* Строка 4: Статус */
  .status-cell {
    padding: 8px 16px;
    border-bottom: 1px solid var(--border-green-light);
    justify-content: center;
  }

  /* Строка 5: Кнопки действий */
  .actions-cell {
    padding: 16px;
    justify-content: center;
  }

  .actions {
    display: flex;
    gap: 8px;
    width: 100%;
    justify-content: center;
  }

  .actions :deep(.base-button) {
    flex: 1;
    min-width: 60px;
    max-width: 80px;
    min-height: 40px;
  }
}

@media (max-width: 768px) {
  .stats {
    grid-template-columns: repeat(2, 1fr);
    gap: 10px;
  }

  .stat-item {
    padding: 14px;
  }

  .stat-number {
    font-size: 1.5rem;
  }

  .stat-label {
    font-size: 0.8rem;
  }

  .cards-table tr {
    border-radius: 10px;
  }

  .card-image-preview {
    height: 140px;
  }

  .category-cell,
  .date-cell,
  .price-cell,
  .people-cell {
    gap: 12px;
    padding: 10px 16px;
  }

  .actions :deep(.base-button) {
    min-width: 55px;
    max-width: 70px;
    min-height: 38px;
    font-size: 0.85rem;
  }

  .dialog-container {
    margin: 10px;
    max-height: 95vh;
  }

  .dialog-actions {
    flex-direction: column;
  }

  .dialog-actions :deep(.base-button) {
    width: 100%;
  }
}

@media (max-width: 480px) {
  .cards-list {
    margin-top: 15px;
  }

  .stats {
    grid-template-columns: 1fr;
    gap: 8px;
  }

  .stat-item {
    padding: 12px;
  }

  .stat-number {
    font-size: 1.4rem;
  }

  .stat-label {
    font-size: 0.75rem;
  }

  .cards-table tr {
    border-radius: 8px;
    margin-bottom: 12px;
  }

  .card-image-preview {
    height: 120px;
  }

  .card-title {
    font-size: 1rem;
  }

  .card-description {
    font-size: 0.85rem;
  }

  .category-cell,
  .date-cell,
  .price-cell,
  .people-cell {
    gap: 10px;
    padding: 8px 12px;
  }

  .category-badge {
    font-size: 0.7rem;
    padding: 2px 8px;
  }

  .status-badge {
    font-size: 0.75rem;
    padding: 4px 10px;
  }

  .actions {
    gap: 6px;
  }

  .actions :deep(.base-button) {
    min-width: 50px;
    max-width: 65px;
    min-height: 36px;
    font-size: 0.8rem;
  }

  .dialog-header {
    padding: 16px 20px;
  }

  .dialog-content {
    padding: 20px;
  }

  .dialog-header h3 {
    font-size: 1.2rem;
  }
}

@media (max-width: 360px) {
  .stat-item {
    padding: 10px;
  }

  .stat-number {
    font-size: 1.3rem;
  }

  .cards-table tr {
    margin-bottom: 10px;
  }

  .card-image-preview {
    height: 100px;
  }

  .category-cell,
  .date-cell,
  .price-cell,
  .people-cell {
    gap: 8px;
    padding: 6px 10px;
  }

  .actions {
    gap: 4px;
  }

  .actions :deep(.base-button) {
    min-width: 45px;
    max-width: 55px;
    min-height: 34px;
    font-size: 0.75rem;
    padding: 6px 4px;
  }
}

/* Ховер эффекты для десктопа */
@media (hover: hover) and (pointer: fine) {
  .cards-table tr:not(.hidden-card):hover {
    background-color: var(--green-bg-light);
  }
}

/* Особые стили для горизонтальной ориентации на мобильных */
@media (max-width: 768px) and (orientation: landscape) {
  .stats {
    grid-template-columns: repeat(2, 1fr);
  }

  .card-image-preview {
    height: 100px;
  }

  .category-cell,
  .date-cell,
  .price-cell,
  .people-cell {
    flex-wrap: nowrap;
    justify-content: space-between;
  }
}

/* Очень маленькие экраны */
@media (max-width: 320px) {
  .stats {
    gap: 6px;
  }

  .stat-item {
    padding: 8px;
  }

  .stat-number {
    font-size: 1.2rem;
  }

  .stat-label {
    font-size: 0.7rem;
  }

  .cards-table tr {
    margin-bottom: 8px;
  }

  .card-image-preview {
    height: 90px;
  }

  .category-cell,
  .date-cell,
  .price-cell,
  .people-cell {
    flex-wrap: wrap;
    gap: 6px;
  }

  .actions :deep(.base-button) {
    min-width: 40px;
    max-width: 50px;
    min-height: 32px;
    font-size: 0.7rem;
  }
}

/* Улучшения для прогресс-бара на мобильных */
@media (max-width: 968px) {
  .people-info {
    align-items: center;
  }

  .people-progress {
    width: 100%;
    max-width: 120px;
  }

  .progress-bar {
    height: 4px;
  }

  .people-numbers {
    font-size: 0.75rem;
  }
}
</style>
