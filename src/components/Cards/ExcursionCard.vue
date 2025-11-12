<template>
  <div class="card" @click="$emit('click', excursion)">
    <div class="card-image">
      <img :src="excursion.image_url" :alt="excursion.title" @error="handleImageError" />
      <div class="card-price">{{ formatPrice(excursion.price) }}</div>
      <span class="card-category">{{ getCategoryName(excursion.category) }}</span>
      <!-- Бейдж для ближайших экскурсий -->
      <div v-if="isUpcomingSoon" class="card-soon-badge">На этой неделе</div>
    </div>
    <div class="card-content">
      <h3 class="card-title">{{ excursion.title }}</h3>
      <p class="card-description">{{ excursion.description }}</p>

      <!-- Используем компонент отправления -->
      <ExcursionDeparture :date="excursion.date" />

      <div class="card-details">
        <span class="card-duration">⏱ {{ formatDuration(excursion.duration) }}</span>

        <!-- Красивое отображение оставшихся мест -->
        <div class="people-info" :class="getPeopleStatusClass(excursion)">
          <div class="people-icon">👥</div>
          <div class="people-count">
            <span class="people-left">{{ excursion.people_left }}</span>
            <span class="people-label">мест</span>
          </div>
          <div class="people-status-badge" :class="getPeopleStatusClass(excursion)">
            {{ getPeopleStatusText(excursion) }}
          </div>
        </div>
      </div>

      <BaseButton
        variant="primary"
        size="md"
        full-width
        @click.stop="$emit('view-details', excursion.id)"
      >
        Подробнее
      </BaseButton>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { Excursion } from '@/types/excursion'
import BaseButton from '@/components/UI/BaseButton.vue'
import ExcursionDeparture from '@/components/Excursion/ExcursionDeparture.vue'

interface Props {
  excursion: Excursion
}

interface Emits {
  (e: 'click', excursion: Excursion): void
  (e: 'view-details', id: number): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

// Проверка что экскурсия скоро (в течение недели)
const isUpcomingSoon = computed((): boolean => {
  const date = new Date(props.excursion.date)
  const now = new Date()
  const weekFromNow = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000)
  return date > now && date <= weekFromNow
})

// Получение класса статуса мест
const getPeopleStatusClass = (excursion: Excursion) => {
  if (excursion.people_left === 0) return 'sold-out'
  if (excursion.people_left <= excursion.people_amount * 0.2) return 'few-left'
  return 'available'
}

// Получение текста статуса мест
const getPeopleStatusText = (excursion: Excursion) => {
  if (excursion.people_left === 0) return 'Мест нет'
  if (excursion.people_left <= excursion.people_amount * 0.2) return 'Мало мест'
  return 'Есть места'
}

// Вспомогательные функции форматирования
const formatPrice = (price: number): string => {
  return `от ${price.toLocaleString('ru-RU')} ₽`
}

const formatDuration = (minutes: number): string => {
  const hours = Math.floor(minutes / 60)
  const mins = minutes % 60
  if (hours > 0) {
    return mins > 0 ? `${hours} ч ${mins} мин` : `${hours} ч`
  }
  return `${mins} мин`
}

const getCategoryName = (category: string): string => {
  const categories: { [key: string]: string } = {
    'горные': 'Горные',
    'морские': 'Морские',
    'исторические': 'Исторические',
    'природа': 'Природа',
    'городские': 'Городские'
  }
  return categories[category] || category
}

const handleImageError = (event: Event) => {
  const target = event.target as HTMLImageElement
  target.src = 'https://images.unsplash.com/photo-1501555088652-021faa106b9b?ixlib=rb-4.0.3&w=800&h=400&fit=crop'
}
</script>

<style scoped>
.card {
  background: var(--white);
  border-radius: 15px;
  box-shadow: 0 8px 25px var(--shadow-default);
  overflow: hidden;
  transition: all 0.3s ease;
  cursor: pointer;
  max-width: 380px;
  width: 100%;
  border: 1px solid var(--border-light);
  position: relative;
}

.card:hover {
  transform: translateY(-8px);
  box-shadow: 0 15px 35px var(--shadow-medium);
  border-color: var(--border-green-strong);
}

.card-image {
  position: relative;
  height: 200px;
  overflow: hidden;
}

.card-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.3s ease;
}

.card:hover .card-image img {
  transform: scale(1.05);
}

.card-price {
  position: absolute;
  top: 15px;
  right: 15px;
  background: var(--white);
  padding: 8px 15px;
  border-radius: 20px;
  font-weight: 700;
  color: var(--green-darker);
  font-size: 1.1rem;
  border: 1px solid var(--green-light);
  box-shadow: 0 2px 8px var(--shadow-default);
}

.card-category {
  position: absolute;
  top: 15px;
  left: 15px;
  background: var(--green-primary);
  color: var(--text-white);
  padding: 5px 12px;
  border-radius: 15px;
  font-size: 0.8rem;
  font-weight: 500;
}

.card-soon-badge {
  position: absolute;
  bottom: 10px;
  left: 10px;
  background: rgba(255, 193, 7, 0.9);
  color: #000;
  padding: 4px 8px;
  border-radius: 8px;
  font-size: 0.7rem;
  font-weight: 500;
}

.card-content {
  padding: 25px;
}

.card-title {
  font-size: 1.4rem;
  margin-bottom: 10px;
  color: var(--text-dark);
  font-weight: 600;
}

.card-description {
  color: var(--text-light);
  line-height: 1.5;
  margin-bottom: 15px;
  font-size: 0.95rem;
}

.card-details {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  gap: 15px;
}

.card-duration {
  font-size: 0.9rem;
  color: var(--text-medium);
  white-space: nowrap;
}

/* Стили для информации о местах */
.people-info {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 6px 10px;
  border-radius: 12px;
  background: var(--green-bg-light);
  border: 1px solid var(--border-green-light);
  transition: all 0.3s ease;
}

.people-info.available {
  background: #f0f9f4;
  border-color: #c8e6c9;
}

.people-info.few-left {
  background: #fff9e6;
  border-color: #ffeeba;
}

.people-info.sold-out {
  background: #fdf2f2;
  border-color: #f5c6cb;
}

.people-icon {
  font-size: 1rem;
}

.people-count {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2px;
}

.people-left {
  font-size: 1.1rem;
  font-weight: 700;
  color: var(--text-dark);
  line-height: 1;
}

.people-label {
  font-size: 0.7rem;
  color: var(--text-light);
  font-weight: 500;
  line-height: 1;
}

.people-status-badge {
  padding: 2px 6px;
  border-radius: 8px;
  font-size: 0.65rem;
  font-weight: 600;
  white-space: nowrap;
}

.people-info.available .people-status-badge {
  background: #28a745;
  color: white;
}

.people-info.few-left .people-status-badge {
  background: #ffc107;
  color: #000;
}

.people-info.sold-out .people-status-badge {
  background: #dc3545;
  color: white;
}

/* Адаптивность */
@media (max-width: 768px) {
  .card {
    max-width: none;
  }

  .card-content {
    padding: 20px;
  }

  .card-details {
    flex-direction: column;
    align-items: stretch;
    gap: 10px;
  }

  .people-info {
    justify-content: center;
  }
}

@media (max-width: 480px) {
  .people-info {
    padding: 5px 8px;
  }

  .people-left {
    font-size: 1rem;
  }

  .people-status-badge {
    font-size: 0.6rem;
  }
}
</style>
