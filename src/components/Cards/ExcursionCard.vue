<template>
  <div class="card" @click="$emit('view-details', excursion.id)">
    <div class="card-image">
      <!-- Контейнер для скролла фоток -->
      <ImageCarousel
        :images="allImages"
        :alt-text="excursion.title"
        height="200px"
        fit="cover"
        :show-indicators="hasMultipleImages"
        :show-navigation="hasMultipleImages"
      />

      <div class="card-price">{{ formatPrice(excursion.price) }}</div>
      <!-- Бейдж для ближайших экскурсий -->
      <div v-if="isUpcomingSoon" class="card-soon-badge">На этой неделе</div>
    </div>
    <div class="card-content">
      <div class="content-top">
        <h3 class="card-title">{{ excursion.title }}</h3>
        <p class="card-description">{{ excursion.description }}</p>
      </div>

      <div class="card-details">
        <!-- НОВЫЙ БЛОК: Города отправления -->
        <div v-if="excursion.cities && excursion.cities.length > 0" class="cities-info">
          <div class="cities-header">
            <span class="cities-icon">🚩</span>
            <span class="cities-label" v-if="excursion.cities.length > 1">Города отправления:</span>
            <span class="cities-label" v-else>Город отправления:</span>
          </div>
          <div class="cities-list">
            <span
              v-for="(city, index) in visibleCities"
              :key="index"
              class="city-tag"
              :class="{ 'main-city': index === 0 }"
            >
              {{ city }}
            </span>
            <span v-if="excursion.cities.length > 3" class="more-cities">
              +{{ excursion.cities.length - 3 }}
            </span>
          </div>
        </div>

        <!-- Используем компонент отправления -->
        <ExcursionDeparture :date="excursion.date" />

        <!-- Красивое отображение оставшихся мест -->
        <div class="people-info" :class="getPeopleStatusClass(excursion)">
          <div class="people-icon">👥</div>
          <div class="people-count">
            <span class="people-left">{{ excursion.people_left }}</span>
            <span class="people-label">{{ format_people_left_title(excursion.people_left) }}</span>
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
import ImageCarousel from '@/components/UI/ImageCarousel.vue'
import { format_people_left_title, formatPrice, getPeopleStatusClass, getPeopleStatusText } from '@/utils/format'

interface Props {
  excursion: Excursion
}

interface Emits {
  (e: 'view-details', id: number): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

const allImages = computed(() => {
  return props.excursion.images || []
})

const hasMultipleImages = computed(() => allImages.value.length > 1)

const isUpcomingSoon = computed((): boolean => {
  const date = new Date(props.excursion.date)
  const now = new Date()
  const weekFromNow = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000)
  return date > now && date <= weekFromNow
})

const visibleCities = computed(() => {
return props.excursion.cities?.slice(0, 3) || []
})
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

  display: flex;
  flex-direction: column;
  height: 100%;
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
  flex-shrink: 0;
}

/* Стили для скролла фоток */
.image-scroll-container {
  position: relative;
  width: 100%;
  height: 100%;
  overflow: hidden;
}

.image-scroll-track {
  display: flex;
  height: 100%;
  transition: transform 0.3s ease;
  will-change: transform;
}

.scroll-image-item {
  flex: 0 0 100%;
  min-width: 100%;
  height: 100%;
}

.scroll-image-item img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

/* Стили для одиночного изображения */
.single-image-container {
  width: 100%;
  height: 100%;
}

.single-image-container img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.3s ease;
}

.card:hover .single-image-container img {
  transform: scale(1.05);
}

/* Индикаторы точек */
.image-indicators {
  position: absolute;
  bottom: 15px;
  left: 0;
  right: 0;
  display: flex;
  justify-content: center;
  gap: 6px;
  z-index: 2;
}

.indicator-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.5);
  border: none;
  cursor: pointer;
  padding: 0;
  transition: all 0.3s ease;
}

.indicator-dot:hover {
  background: rgba(255, 255, 255, 0.8);
  transform: scale(1.2);
}

.indicator-dot.active {
  background: white;
  transform: scale(1.2);
}

/* Кнопки навигации */
.scroll-nav-btn {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.9);
  border: 1px solid rgba(0, 0, 0, 0.1);
  color: #333;
  font-size: 18px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 3;
  transition: all 0.3s ease;
  opacity: 0;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.card:hover .scroll-nav-btn {
  opacity: 1;
}

.scroll-nav-btn:hover {
  background: white;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
}

.scroll-nav-btn:active {
  transform: translateY(-50%) scale(0.95);
}

.prev-btn {
  left: 10px;
}

.next-btn {
  right: 10px;
}

/* Улучшенные стили для существующих элементов */
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
  z-index: 2;
}

.card-soon-badge {
  position: absolute;
  bottom: 15px;
  left: 15px;
  background: rgba(255, 193, 7, 0.9);
  color: #000;
  padding: 4px 8px;
  border-radius: 8px;
  font-size: 0.7rem;
  font-weight: 500;
  z-index: 2;
}

.card-content {
  display: flex;
  flex-direction: column;
  flex: 1;
  padding: 25px;
  min-height: 0;
}

.content-top {
  flex: 1;
  min-height: 0;
  overflow: hidden;
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

  display: -webkit-box;
  -webkit-line-clamp: 5;
  -webkit-box-orient: vertical;
  overflow: hidden;
  max-height: none;
}

.card-details {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  margin-bottom: 10px;
  gap: 10px;
}

.cities-info {
  width: 100%;
  background: var(--green-bg-light);
  border: 1px solid var(--shadow-green);
  border-radius: 12px;
  padding: 10px 12px;
  transition: all 0.3s ease;
}

.cities-header {
  display: flex;
  align-items: center;
  gap: 6px;
  margin-bottom: 8px;
}

.cities-icon {
  font-size: 1rem;
}

.cities-label {
  font-size: 0.8rem;
  font-weight: 600;
  color: var(--text-medium);
  text-transform: uppercase;
  letter-spacing: 0.3px;
}

.cities-list {
  display: flex;
  flex-wrap: wrap;
  gap: 5px;
  align-items: center;
}

.city-tag {
  padding: 4px 10px;
  background: var(--white);
  border: 1px solid var(--border-green);
  border-radius: 20px;
  font-size: 0.8rem;
  font-weight: 500;
  color: var(--text-dark);
  transition: all 0.2s ease;
}

.city-tag.main-city {
  background: var(--green-primary);
  border-color: var(--green-primary);
  color: var(--white);
  font-weight: 600;
}

.more-cities {
  padding: 4px 8px;
  background: var(--green-bg-light);
  border-radius: 20px;
  font-size: 0.75rem;
  font-weight: 600;
  color: var(--text-medium);
}

/* Стили для информации о местах */
.people-info {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 8px;
  padding: 6px 10px;
  border-radius: 12px;
  background: var(--green-bg-light);
  border: 1px solid var(--border-green-light);
  transition: all 0.3s ease;
  width: 100%;
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

  /* На мобильных всегда показываем кнопки навигации */
  .scroll-nav-btn {
    opacity: 0.7;
    width: 32px;
    height: 32px;
    font-size: 16px;
  }

  .image-indicators {
    bottom: 10px;
  }

  .indicator-dot {
    width: 6px;
    height: 6px;
  }

  /* Адаптивность для городов */
  .city-tag {
    padding: 3px 8px;
    font-size: 0.75rem;
  }

  .cities-header {
    margin-bottom: 5px;
  }

  .cities-label {
    font-size: 0.7rem;
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

  .scroll-nav-btn {
    width: 28px;
    height: 28px;
    font-size: 14px;
  }

  .card-price {
    font-size: 1rem;
    padding: 6px 12px;
  }

  .city-tag {
    padding: 2px 6px;
    font-size: 0.7rem;
  }

  .more-cities {
    font-size: 0.7rem;
    padding: 3px 6px;
  }
}

/* Поддержка touch-свайпа */
@media (hover: none) and (pointer: coarse) {
  .image-scroll-container {
    -webkit-overflow-scrolling: touch;
  }

  .scroll-nav-btn {
    opacity: 0.7; /* Всегда показываем на тач-устройствах */
  }
}
</style>
