<template>
  <div class="cards-list">
    <!-- Статистика -->
    <StatsComponent
      :total="stats.total"
      :active="stats.active"
      :hidden="stats.hidden"
      :total-spots="stats.totalSpots"
    />

    <!-- Контейнер для карточек - таблица на десктопе -->
    <div class="cards-desktop-view" v-if="!isMobile">
      <div class="table-header">
        <div class="header-cell image-cell">Фото</div>
        <div class="header-cell header-title-cell">Название</div>
        <div class="header-cell date-cell">Дата отправления</div>
        <div class="header-cell price-cell">Цена</div>
        <div class="header-cell people-cell">Места</div>
        <div class="header-cell status-cell">Статус</div>
        <div class="header-cell actions-cell">Действия</div>
      </div>

      <div class="table-body">
        <div
          v-for="card in cards"
          :key="card.id"
          class="table-row"
          :class="{ 'hidden-card': !card.is_active }"
        >
          <!-- Изображение -->
          <div class="cell image-cell">
            <div class="card-image-preview">
              <ImageCarousel
                height="120px"
                :images="getCardImages(card)"
                :alt-text="card.title"
                :show-indicators="hasMultipleImages(card)"
                :show-navigation="hasMultipleImages(card)"
                :fit="'cover'"
                class="card-carousel"
              />
            </div>
          </div>

          <!-- Название и описание -->
          <div class="cell title-cell">
            <strong class="card-title">{{ card.title }}</strong>
          </div>

          <!-- Дата отправления -->
          <div class="cell date-cell">
            <ExcursionDeparture :date="card.date" />
          </div>

          <!-- Цена -->
          <div class="cell price-cell">
            <span class="card-price">{{ card.price }} ₽</span>
          </div>

          <!-- Места -->
          <div class="cell people-cell">
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
                  <span class="people-left">{{ getBookingCountPeople(card) }}</span>
                  <span class="people-separator">/</span>
                  <span class="people-total">{{ card.people_amount }}</span>
                </div>
              </div>
              <div class="people-status" :class="getPeopleStatusClass(card)">
                {{ getPeopleStatusText(card) }}
              </div>
            </div>
          </div>

          <!-- Статус -->
          <div class="cell status-cell">
            <span
              class="status-badge"
              :class="{ active: card.is_active, hidden: !card.is_active }"
            >
              {{ card.is_active ? 'Активна' : 'Скрыта' }}
            </span>
          </div>

          <!-- Действия -->
          <div class="cell actions-cell">
            <div class="actions">
              <BaseButton
                variant="primary"
                size="sm"
                icon="➕"
                @click="openAddPeopleDialog(card)"
                title="Добавить людей"
                :disabled="loading"
              />
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
          </div>
        </div>
      </div>
    </div>

    <!-- Мобильный вид - вертикальные карточки -->
    <div class="cards-mobile-view" v-else>
      <div
        v-for="card in cards"
        :key="card.id"
        class="mobile-card"
        :class="{ 'hidden-card': !card.is_active }"
      >
        <!-- Изображение -->
        <div class="mobile-image">
          <ImageCarousel
            height="180px"
            :images="getCardImages(card)"
            :alt-text="card.title"
            :show-indicators="hasMultipleImages(card)"
            :show-navigation="hasMultipleImages(card)"
            :fit="'cover'"
          />
        </div>

        <!-- Основная информация -->
        <div class="mobile-content">
          <!-- Заголовок и статус -->
          <div class="mobile-header">
            <h3 class="mobile-title">{{ card.title }}</h3>
            <span
              class="mobile-status-badge"
              :class="{ active: card.is_active, hidden: !card.is_active }"
            >
              {{ card.is_active ? 'Активна' : 'Скрыта' }}
            </span>
          </div>

          <!-- Описание -->
          <p class="mobile-description" v-if="card.description">
            {{ card.description }}
          </p>

          <!-- Информация в 2 колонки -->
          <div class="mobile-info-grid">
            <div class="info-item">
              <span class="info-label">Дата:</span>
              <span class="info-value">
                <ExcursionDeparture :date="card.date" />
              </span>
            </div>

            <div class="info-item">
              <span class="info-label">Цена:</span>
              <span class="info-value card-price">{{ card.price }} ₽</span>
            </div>

            <div class="info-item full-width">
              <span class="info-label">Места:</span>
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
            </div>
          </div>

          <!-- Действия -->
          <div class="mobile-actions">
            <BaseButton
              variant="primary"
              size="sm"
              icon="➕"
              @click="openAddPeopleDialog(card)"
              title="Добавить людей"
              :disabled="loading"
              class="action-btn"
            />
            <BaseButton
              variant="secondary"
              size="sm"
              icon="🚌"
              @click="openBusNumberDialog(card)"
              title="Изменить номер автобуса"
              :disabled="loading"
              class="action-btn"
            />
            <BaseButton
              :variant="card.is_active ? 'warning' : 'success'"
              size="sm"
              :icon="card.is_active ? '👁️' : '👁️‍🗨️'"
              @click="emit('toggle-visibility', card.id)"
              :title="card.is_active ? 'Скрыть' : 'Показать'"
              :disabled="loading"
              class="action-btn"
            />
            <BaseButton
              variant="info"
              size="sm"
              icon="✏️"
              @click="emit('edit', card)"
              title="Редактировать"
              :disabled="loading"
              class="action-btn"
            />
            <BaseButton
              variant="danger"
              size="sm"
              icon="🗑️"
              :loading="loading"
              @click="emit('delete', card.id)"
              title="Удалить"
              class="action-btn"
            />
          </div>
        </div>
      </div>
    </div>

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

    <!-- Диалоги -->
    <AddPeopleDialog
      :visible="showAddPeopleDialog"
      :card="selectedCard"
      :loading="addPeopleLoading"
      @update:visible="showAddPeopleDialog = $event"
      @confirm="handleAddPeopleConfirm"
      @close="handleDialogClose"
    />

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
import { ref, watchEffect, onMounted, onUnmounted } from 'vue'
import { type Excursion } from '@/types/excursion'
import BaseButton from '@/components/UI/BaseButton.vue'
import ExcursionDeparture from '@/components/Excursion/ExcursionDeparture.vue'
import StatsComponent from '@/components/UI/StatsComponent.vue'
import AddPeopleDialog from '@/components/Admin/AddPeopleDialog.vue'
import BusNumberDialog from '@/components/Admin/BusNumberDialog.vue'
import { getBookingCountPeople, getPeopleStatusClass, getPeopleStatusText, getProgressClass, getProgressPercentage } from '@/utils/format'
import ImageCarousel from '../UI/ImageCarousel.vue'

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

// Определяем мобильное устройство
const isMobile = ref(false)

const checkMobile = () => {
  isMobile.value = window.innerWidth < 768
}

onMounted(() => {
  checkMobile()
  window.addEventListener('resize', checkMobile)
})

onUnmounted(() => {
  window.removeEventListener('resize', checkMobile)
})

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

// Функция для получения изображений карточки
const getCardImages = (card: Excursion): string[] => {
  if (card.images && Array.isArray(card.images)) {
    if (card.images.length > 0 && typeof card.images[0] === 'string') {
      return card.images
    }
    if (card.images.length > 0 && card.images[0].url) {
      return card.images.map((img: any) => img.url)
    }
    if (card.images.length > 0 && card.images[0].image) {
      return card.images.map((img: any) => img.image)
    }
  }
  return []
}

// Проверяем, есть ли несколько изображений у карточки
const hasMultipleImages = (card: Excursion): boolean => {
  const images = getCardImages(card)
  return images.length > 1
}

// Открытие диалогов
const openAddPeopleDialog = (card: Excursion) => {
  selectedCard.value = card
  showAddPeopleDialog.value = true
}

const openBusNumberDialog = (card: Excursion) => {
  selectedCard.value = card
  showBusNumberDialog.value = true
}

// Обработка подтверждения из диалогов
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

/* ========== ДЕСКТОПНЫЙ ВИД (ТАБЛИЦА) ========== */
.cards-desktop-view {
  background: white;
  border-radius: 15px;
  overflow: hidden;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
}

/* Заголовок таблицы */
.table-header {
  display: grid;
  grid-template-columns: 80px 2fr 1fr 1fr 1.5fr 1fr 2fr;
  background: var(--green-bg);
  padding: 15px;
  border-bottom: 2px solid var(--border-turquoise);
  font-weight: 600;
  color: var(--text-dark);
  gap: 10px;
}

.header-cell {
  padding: 0 5px;
  font-size: 0.9rem;
  text-align: center;
}

/* Тело таблицы */
.table-body {
  min-height: 200px;
}

/* Строки таблицы */
.table-row {
  display: grid;
  grid-template-columns: 80px 2fr 1fr 1fr 1.5fr 1fr 2fr;
  padding: 15px;
  gap: 10px;
  align-items: center;
  border-bottom: 1px solid var(--border-green-light);
  transition: background-color 0.2s ease;
}

.table-row:last-child {
  border-bottom: none;
}

.table-row:hover {
  background-color: var(--green-bg-light);
}

.table-row.hidden-card {
  background-color: #f8f9fa;
  opacity: 0.7;
}

.table-row.hidden-card:hover {
  opacity: 1;
}

/* Ячейки таблицы */
.cell {
  padding: 0 5px;
  display: flex;
  justify-content: center;
}

/* Изображение */
.card-image-preview {
  width: 70px;
  height: 50px;
  border-radius: 6px;
  overflow: hidden;
}

/* Название и описание */

.title-cell {
  display: flex;
  justify-content: start;
}

.card-title {
  color: var(--text-dark);
}

/* Дата */
.date-cell :deep(.excursion-departure) {
  font-size: 0.9rem;
}

/* Цена */
.card-price {
  font-weight: 600;
  color: var(--green-dark);
  font-size: 0.95rem;
}

/* Места */
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

/* Статус */
.status-badge {
  display: inline-block;
  padding: 6px 12px;
  border-radius: 15px;
  font-size: 0.8rem;
  font-weight: 500;
  min-width: 80px;
  text-align: center;
}

.status-badge.active {
  background: #d4edda;
  color: #155724;
}

.status-badge.hidden {
  background: #f8d7da;
  color: #721c24;
}

/* Действия */
.actions {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
  justify-content: center;
}

.actions .base-button {
  flex: 1;
  min-width: 40px;
  max-width: 45px;
  min-height: 36px;
}

/* ========== МОБИЛЬНЫЙ ВИД (КАРТОЧКИ) ========== */
.cards-mobile-view {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.mobile-card {
  background: white;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
  border: 1px solid var(--border-green-light);
}

.mobile-card.hidden-card {
  background-color: #f8f9fa;
  opacity: 0.7;
}

.mobile-card.hidden-card:hover {
  opacity: 1;
}

/* Изображение */
.mobile-image {
  width: 100%;
  overflow: hidden;
}

/* Контент */
.mobile-content {
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

/* Заголовок и статус */
.mobile-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 10px;
}

.mobile-title {
  color: var(--text-dark);
  font-size: 1.1rem;
  font-weight: 600;
  margin: 0;
  flex: 1;
}

.mobile-status-badge {
  display: inline-block;
  padding: 4px 10px;
  border-radius: 12px;
  font-size: 0.75rem;
  font-weight: 500;
  white-space: nowrap;
}

.mobile-status-badge.active {
  background: #d4edda;
  color: #155724;
}

.mobile-status-badge.hidden {
  background: #f8d7da;
  color: #721c24;
}

/* Описание */
.mobile-description {
  color: var(--text-medium);
  font-size: 0.9rem;
  margin: 0;
  line-height: 1.4;
}

/* Информационная сетка */
.mobile-info-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
}

.info-item {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.info-item.full-width {
  grid-column: 1 / -1;
}

.info-label {
  font-size: 0.8rem;
  color: var(--text-light);
  font-weight: 500;
}

.info-value {
  font-size: 0.9rem;
  color: var(--text-dark);
  font-weight: 500;
}

/* Места в мобильном виде */
.mobile-content .people-info {
  margin-top: 4px;
}

.mobile-content .people-progress {
  margin-bottom: 6px;
}

/* Действия в мобильном виде */
.mobile-actions {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
  justify-content: center;
}

.mobile-actions .action-btn {
  flex: 1;
  min-width: calc(50% - 4px);
  max-width: calc(50% - 4px);
  min-height: 40px;
}

/* ========== ОБЩИЕ СТИЛИ ========== */
/* Состояния загрузки и пустого состояния */
.loading-state,
.empty-state {
  background: white;
  border-radius: 15px;
  padding: 50px 20px;
  text-align: center;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
  margin-top: 20px;
}

.loading-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  color: var(--text-light);
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

/* Анимации */
@keyframes spin {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}

/* ========== АДАПТИВНОСТЬ ========== */
@media (max-width: 1200px) {
  .table-header,
  .table-row {
    grid-template-columns: 70px 1.5fr 1fr 1fr 1.2fr 0.8fr 1.8fr;
    padding: 12px;
    gap: 8px;
  }

  .card-description {
    display: none;
  }
}

@media (max-width: 992px) {
  .table-header,
  .table-row {
    grid-template-columns: 60px 1fr 0.9fr 0.8fr 1fr 0.8fr 1.5fr;
    padding: 10px;
    gap: 6px;
  }

  .header-cell {
    font-size: 0.85rem;
  }

  .card-title {
    font-size: 0.9rem;
  }

  .actions .base-button {
    min-width: 36px;
    max-width: 40px;
    min-height: 34px;
  }
}

/* Переключаемся на мобильный вид */
@media (max-width: 768px) {
  .cards-desktop-view {
    display: none;
  }

  .cards-mobile-view {
    display: flex;
  }
}

@media (min-width: 769px) {
  .cards-desktop-view {
    display: block;
  }

  .cards-mobile-view {
    display: none;
  }
}

/* Мобильная адаптивность */
@media (max-width: 576px) {
  .mobile-content {
    padding: 12px;
    gap: 12px;
  }

  .mobile-title {
    font-size: 1rem;
  }

  .mobile-description {
    font-size: 0.85rem;
  }

  .mobile-info-grid {
    grid-template-columns: 1fr;
    gap: 10px;
  }

  .mobile-actions .action-btn {
    min-width: calc(33.333% - 6px);
    max-width: calc(33.333% - 6px);
    min-height: 38px;
    font-size: 0.85rem;
  }
}

@media (max-width: 480px) {
  .cards-list {
    margin-top: 15px;
  }

  .cards-mobile-view {
    gap: 12px;
  }

  .mobile-card {
    border-radius: 10px;
  }

  .mobile-image {
    height: 180px;
  }

  .mobile-actions .action-btn {
    min-width: calc(10% - 4px);
    max-width: calc(50% - 4px);
    min-height: 36px;
    font-size: 0.8rem;
    padding: 8px 4px;
  }
}

@media (max-width: 360px) {
  .mobile-image {
    height: 140px;
  }

  .mobile-title {
    font-size: 0.95rem;
  }

  .mobile-description {
    font-size: 0.8rem;
  }

  .info-label {
    font-size: 0.75rem;
  }

  .info-value {
    font-size: 0.85rem;
  }

  .mobile-actions .action-btn {
    min-width: 100%;
    max-width: 100%;
    min-height: 34px;
    font-size: 0.75rem;
  }
}

/* Ховер эффекты только для десктопа */
@media (hover: hover) and (pointer: fine) {
  .table-row:not(.hidden-card):hover {
    background-color: var(--green-bg-light);
  }

  .mobile-card:not(.hidden-card):hover {
    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15);
  }
}

/* Горизонтальная ориентация на мобильных */
@media (max-width: 768px) and (orientation: landscape) {
  .mobile-card {
    display: flex;
  }

  .mobile-image {
    width: 40%;
    height: auto;
  }

  .mobile-content {
    width: 60%;
    padding: 12px;
  }

  .mobile-info-grid {
    grid-template-columns: repeat(2, 1fr);
  }

  .mobile-actions .action-btn {
    min-width: calc(25% - 6px);
    max-width: calc(25% - 6px);
  }
}
</style>
