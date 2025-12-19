<template>
  <div class="card" @click="$emit('view-details', excursion.id)">
    <div class="card-image">
      <!-- Контейнер для скролла фоток -->
      <ImageCarousel
        :images="allImages"
        :alt-text="excursion.title"
        height="200px"
        :show-indicators="hasMultipleImages"
        :show-navigation="hasMultipleImages"
      />

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
import { computed, ref } from 'vue'
import { onMounted, onUnmounted } from 'vue'
import type { Excursion } from '@/types/excursion'
import BaseButton from '@/components/UI/BaseButton.vue'
import ExcursionDeparture from '@/components/Excursion/ExcursionDeparture.vue'
import ImageCarousel from '@/components/UI/ImageCarousel.vue'

interface Props {
  excursion: Excursion
}

interface Emits {
  (e: 'view-details', id: number): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

const currentImageIndex = ref(0)

// Все изображения для скролла
const allImages = computed(() => {
  return props.excursion.images || []
})

const hasMultipleImages = computed(() => allImages.value.length > 1)

// Навигация по изображениям
const nextImage = () => {
  if (currentImageIndex.value < allImages.value.length - 1) {
    currentImageIndex.value++
  } else {
    currentImageIndex.value = 0
  }
}

const prevImage = () => {
  if (currentImageIndex.value > 0) {
    currentImageIndex.value--
  } else {
    currentImageIndex.value = allImages.value.length - 1
  }
}

const scrollToImage = (index: number) => {
  currentImageIndex.value = index
}

// Переменные для обработки свайпа
const touchStartX = ref(0)
const touchStartY = ref(0)
const isSwiping = ref(false)

// Обработчики тач-событий
const handleTouchStart = (e: TouchEvent) => {
  touchStartX.value = e.touches[0].clientX
  touchStartY.value = e.touches[0].clientY
  isSwiping.value = false
}

const handleTouchMove = (e: TouchEvent) => {
  if (!touchStartX.value || !touchStartY.value) return

  const touchX = e.touches[0].clientX
  const touchY = e.touches[0].clientY

  // Вычисляем разницу
  const diffX = Math.abs(touchX - touchStartX.value)
  const diffY = Math.abs(touchY - touchStartY.value)

  // Если движение в основном горизонтальное - предотвращаем скролл страницы
  if (diffX > diffY && diffX > 5) {
    e.preventDefault() // Предотвращаем скролл страницы
    isSwiping.value = true
  }
}

const handleTouchEnd = (e: TouchEvent) => {
  if (!touchStartX.value || !isSwiping.value) return

  const touchEndX = e.changedTouches[0].clientX
  const touchEndY = e.changedTouches[0].clientY

  const diffX = touchStartX.value - touchEndX
  const minSwipeDistance = 30

  if (Math.abs(diffX) > minSwipeDistance) {
    if (diffX > 0) {
      nextImage() // Свайп влево
    } else {
      prevImage() // Свайп вправо
    }
  }

  // Сброс
  touchStartX.value = 0
  touchStartY.value = 0
  isSwiping.value = false
}

// Привязать события к контейнеру
let scrollContainer: HTMLElement | null = null

onMounted(() => {
  scrollContainer = document.querySelector('.image-scroll-container')
  if (scrollContainer) {
    scrollContainer.addEventListener('touchstart', handleTouchStart, { passive: false })
    scrollContainer.addEventListener('touchmove', handleTouchMove, { passive: false })
    scrollContainer.addEventListener('touchend', handleTouchEnd, { passive: true })
  }
})

onUnmounted(() => {
  if (scrollContainer) {
    scrollContainer.removeEventListener('touchstart', handleTouchStart)
    scrollContainer.removeEventListener('touchmove', handleTouchMove)
    scrollContainer.removeEventListener('touchend', handleTouchEnd)
  }
})

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
    горные: 'Горные',
    морские: 'Морские',
    исторические: 'Исторические',
    природа: 'Природа',
    городские: 'Городские',
  }
  return categories[category] || category
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

  .card-category {
    font-size: 0.7rem;
    padding: 4px 10px;
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
