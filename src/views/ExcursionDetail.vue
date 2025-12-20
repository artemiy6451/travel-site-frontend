<template>
  <div class="excursion-detail-modern">
    <!-- Хедер с навигацией -->
    <header class="modern-header">
      <nav class="nav-container">
        <BaseButton variant="secondary" size="sm" @click="handleBack" class="nav-back" icon="‹">
          Назад
        </BaseButton>

        <div class="nav-actions">
          <BaseButton variant="secondary" size="sm" icon="📤" @click="handleShare" class="nav-btn" title="Поделиться" />
        </div>
      </nav>
    </header>

    <DataState :loading="loading" :error="error" loading-message="Загружаем детали экскурсии..."
      error-title="Что-то пошло не так" @retry="loadExcursion" :showRetry="showRetry">
      <!-- Контент экскурсии -->
      <div v-if="excursion" class="modern-content">
        <section class="title-section">
          <h1 class="hero-title">{{ excursion.title }}</h1>
        </section>

        <!-- Hero секция со скроллом фоток -->
        <section class="hero-section">
          <div class="hero-image-container">
            <ImageCarousel
              height="100%"
              :images="allImages"
              :alt-text="excursion.title"
              :show-indicators="hasMultipleImages"
              :show-navigation="hasMultipleImages"
              :initial-slide="currentImageIndex"
            />

          </div>
        </section>

        <!-- Остальной контент без изменений -->
        <main class="main-content">
          <!-- Быстрые факты -->
          <ExcursionFacts :excursion="excursion" />

          <!-- Полное описание маршрута -->
          <ExcursionDescription :description="getFullDescription(excursion)" title="О маршруте" />

          <!-- Место сбора -->
          <div v-if="excursion.details?.meeting_point" class="meeting-point-section">
            <h2 class="section-title">📍 Место сбора</h2>
            <div class="meeting-point-content">
              <p>{{ excursion.details.meeting_point }}</p>
            </div>
          </div>

          <!-- Что включено -->
          <ExcursionIncluded :items="getIncludedItems(excursion)" title="Что включено" />

          <!-- Требования к участникам -->
          <div v-if="hasRequirements(excursion)" class="requirements-section">
            <h2 class="section-title">🎯 Требования к участникам</h2>
            <div class="requirements-list">
              <div v-for="(requirement, index) in excursion.details?.requirements" :key="index"
                class="requirement-item">
                <span class="requirement-icon">✓</span>
                <span class="requirement-text">{{ requirement }}</span>
              </div>
            </div>
          </div>

          <!-- Рекомендации -->
          <div v-if="hasRecommendations(excursion)" class="recommendations-section">
            <h2 class="section-title">💡 Рекомендации</h2>
            <div class="recommendations-list">
              <div v-for="(recommendation, index) in excursion.details?.recommendations" :key="index"
                class="recommendation-item">
                <span class="recommendation-icon">💡</span>
                <span class="recommendation-text">{{ recommendation }}</span>
              </div>
            </div>
          </div>

          <!-- Программа тура -->
          <ExcursionItinerary :itinerary="getItinerary(excursion)" title="Программа тура" />
        </main>
      </div>
    </DataState>

    <!-- Floating Action Button -->
    <div v-if="excursion" class="fab-container">
      <div class="price-display">
        <div class="price-amount">{{ formatPrice(excursion.price) }}</div>
        <div class="price-label">за человека</div>
        <div v-if="excursion.people_left > 0" class="spots-left">
          Осталось {{ excursion.people_left }} {{ format_people_left_title(excursion.people_left) }}
        </div>
        <div v-else class="spots-left sold-out">Мест нет</div>
      </div>

      <BaseButton variant="primary" size="lg" @click="handleBooking" class="fab-button" icon="🎫" full-width
        :disabled="excursion.people_left === 0">
        {{ excursion.people_left > 0 ? 'Забронировать' : 'Мест нет' }}
      </BaseButton>

      <!-- Модальное окно -->
      <BookingForm :visible="showBookingModal" :excursion="excursion" @update:visible="showBookingModal = $event"
        @success="handleBookingSuccess" @close="handleBookingClose" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { api } from '@/utils/api'
import { type ExcursionFullInfo } from '@/types/excursion'
import BaseButton from '@/components/UI/BaseButton.vue'
import DataState from '@/components/UI/DataState.vue'
import ExcursionFacts from '@/components/Excursion/ExcursionFacts.vue'
import ExcursionDescription from '@/components/Excursion/ExcursionDescription.vue'
import ExcursionIncluded from '@/components/Excursion/ExcursionIncluded.vue'
import ExcursionItinerary from '@/components/Excursion/ExcursionItinerary.vue'
import BookingForm from '@/components/UI/BookingForm.vue'
import ImageCarousel from '@/components/UI/ImageCarousel.vue'
import type { BookingCreate } from '@/types/booking'
import { sendMetrik } from '@/utils/metrika'
import { format_people_left_title, formatPrice } from '@/utils/format'

const route = useRoute()
const router = useRouter()

const excursion = ref<ExcursionFullInfo>({
  id: 0,
  title: '',
  description: '',
  date: new Date(),
  price: 0,
  duration: 0,
  people_amount: 0,
  people_left: 0,
  is_active: true,
  images: [],
  details: undefined,
  bus_number: 0,
})

const loading = ref(false)
const error = ref('')
const showRetry = ref(false)

// Переменные для скролла фоток
const currentImageIndex = ref(0)

// Все изображения для скролла
const allImages = computed(() => {
  return excursion.value.images || []
})

const hasMultipleImages = computed(() => allImages.value.length > 1)

// Загрузка данных экскурсии
const loadExcursion = async () => {
  const excursionId = parseInt(route.params.id as string)

  if (isNaN(excursionId)) {
    error.value = 'Неверный ID экскурсии'
    return
  }

  loading.value = true
  error.value = ''
  showRetry.value = false

  try {
    // Используем новый метод для получения полной информации
    excursion.value = await api.excursions.getExcursion(excursionId)
    if (!excursion.value.is_active) {
      router.replace('/not-found')
    }

    try {
      excursion.value.details = await api.excursions.getExcursionDetails(excursionId)
    } catch (detailsErr: any) {
      console.warn('Детали экскурсии не найдены, используем базовую информацию:', detailsErr)
    }
  } catch (err: any) {
    if (err.message === 'Excursion not found' || err.response?.status === 404) {
      router.replace('/not-found')
    }
  } finally {
    loading.value = false
  }
}

// Обработка бронирования
const showBookingModal = ref(false)
const handleBooking = () => {
  if (!excursion.value || excursion.value.people_left === 0) return
  showBookingModal.value = true
  sendMetrik('booking-start')
}

const handleBookingSuccess = async (new_booking: BookingCreate) => {
  // Показываем уведомление
  alert('✅ Заявка успешно отправлена! Мы свяжемся с вами в ближайшее время.')
  sendMetrik('booking-end')
}

const handleBookingClose = () => {
  showBookingModal.value = false
}

// Дополнительные функции
const handleShare = () => {
  navigator.clipboard.writeText(window.location.href)
}

const handleBack = () => {
  if (window.history.length > 1) {
    router.back()
  } else {
    router.push('/')
  }
}

// Получение полного описания
const getFullDescription = (excursion: ExcursionFullInfo): string => {
  return excursion.details?.description || excursion.description
}

// Получение включенных услуг
const getIncludedItems = (excursion: ExcursionFullInfo): string[] => {
  if (excursion.details?.inclusions && excursion.details.inclusions.length > 0) {
    return excursion.details.inclusions
  }

  // Fallback базовые включения
  const baseItems = ['Хорошее настроение']
  return baseItems
}

// Получение программы тура
const getItinerary = (excursion: ExcursionFullInfo): any[] => {
  if (excursion.details?.itinerary && excursion.details.itinerary.length > 0) {
    return excursion.details.itinerary
  }

  // Fallback базовая программа
  const baseItinerary = [
    {
      title: 'Встреча группы',
      description: 'Знакомство с гидом и участниками, инструктаж по технике безопасности',
    },
    {
      title: 'Начало маршрута',
      description: 'Отправление по запланированному маршруту',
    },
    {
      title: 'Завершение тура',
      description: 'Возвращение к точке сбора, подведение итогов',
    },
  ]

  return baseItinerary
}

// Проверка наличия требований
const hasRequirements = (excursion: ExcursionFullInfo): boolean => {
  return !!(excursion.details?.requirements && excursion.details.requirements.length > 0)
}

// Проверка наличия рекомендаций
const hasRecommendations = (excursion: ExcursionFullInfo): boolean => {
  return !!(excursion.details?.recommendations && excursion.details.recommendations.length > 0)
}

// Загрузка при монтировании
onMounted(() => {
  loadExcursion()
})
</script>

<style scoped>
.excursion-detail-modern {
  min-height: 100vh;
  background: #ffffff;
  font-family:
    'Inter',
    -apple-system,
    BlinkMacSystemFont,
    sans-serif;
}

/* Хедер */
.modern-header {
  position: sticky;
  top: 0;
  background: rgba(255, 255, 255, 0.95);
  border-bottom: 1px solid #f0f0f0;
}

.nav-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 15px 20px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  z-index: 10;
}

:deep(.nav-back.base-button) {
  background: none;
  border: 1px solid #e2e8f0;
  color: #666;
  font-weight: normal;
}

:deep(.nav-back.base-button:hover:not(.disabled)) {
  background: #f5f5f5;
  color: #333;
  border-color: #d1d5db;
}

.nav-actions {
  display: flex;
  gap: 8px;
}

:deep(.nav-btn.base-button) {
  width: 40px;
  height: 40px;
  padding: 0;
  min-width: auto;
  border-radius: 10px;
  background: #f8f9fa;
  border: 1px solid #e2e8f0;
}

:deep(.nav-btn.base-button:hover:not(.disabled)) {
  background: #e9ecef;
  transform: scale(1.05);
  border-color: #d1d5db;
}

.title-section {
  max-width: 1200px;
  margin: 0 auto;
  padding: 30px 20px 20px; /* Отступы сверху/снизу */
  z-index: 10;
  position: relative;
  background: white; /* Белый фон для заголовка */
}

.hero-title {
  font-size: 2.5rem;
  font-weight: 700;
  line-height: 1.2;
  color: var(--text-dark); /* Темный цвет текста */
  text-align: center;
}

.hero-image-container {
  height: 70vh;
  max-width: 1200px;
  min-height: 400px;
  margin: 0 auto;
}

/* Основной контент */
.main-content {
  max-width: 1200px;
  margin: 0 auto;
  padding: 40px 20px 40px;
}

/* Секция места сбора */
.meeting-point-section {
  margin-bottom: 40px;
}

.meeting-point-content {
  background: #f8f9fa;
  padding: 20px;
  border-radius: 12px;
  border-left: 4px solid #10b981;
}

.meeting-point-content p {
  margin: 0;
  color: #374151;
  line-height: 1.6;
}

/* Секция требований */
.requirements-section {
  margin-bottom: 40px;
}

.requirements-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.requirement-item {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  padding: 12px;
  background: #fff7ed;
  border-radius: 8px;
  border: 1px solid #fed7aa;
}

.requirement-icon {
  color: #ea580c;
  font-weight: bold;
  font-size: 14px;
  min-width: 20px;
}

.requirement-text {
  color: #7c2d12;
  line-height: 1.5;
}

/* Секция рекомендаций */
.recommendations-section {
  margin-bottom: 40px;
}

.recommendations-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.recommendation-item {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  padding: 12px;
  background: #f0f9ff;
  border-radius: 8px;
  border: 1px solid #bae6fd;
}

.recommendation-icon {
  color: #0369a1;
  font-size: 14px;
  min-width: 20px;
}

.recommendation-text {
  color: #0c4a6e;
  line-height: 1.5;
}

/* Общие стили для секций */
.section-title {
  font-size: 1.5rem;
  font-weight: 700;
  margin-bottom: 20px;
  color: #1f2937;
}

/* Floating Action Button */
.fab-container {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  background: white;
  border-top: 1px solid #e2e8f0;
  padding: 16px 20px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  z-index: 5;
}

.price-display {
  text-align: left;
}

.price-amount {
  font-size: 24px;
  font-weight: 700;
  color: #10b981;
}

.price-label {
  font-size: 12px;
  color: #64748b;
  margin-bottom: 4px;
}

.spots-left {
  font-size: 11px;
  color: #059669;
  font-weight: 500;
}

.spots-left.sold-out {
  color: #dc2626;
}

:deep(.fab-button.base-button) {
  flex: 1;
  max-width: 200px;
  border-radius: 12px;
  font-weight: 600;
  padding: 16px 24px;
}

:deep(.fab-button.base-button:hover:not(.disabled)) {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(16, 185, 129, 0.3);
}

:deep(.fab-button.base-button.disabled) {
  background: #9ca3af;
  cursor: not-allowed;
}

/* Адаптивность */
@media (max-width: 768px) {
  .hero-title {
    font-size: 2rem;
  }

  .hero-image-container {
    min-height: 300px;
  }

  .fab-container {
    padding: 12px 16px;
  }

  .price-amount {
    font-size: 20px;
  }

  :deep(.fab-button.base-button) {
    padding: 14px 20px;
  }

  .section-title {
    font-size: 1.3rem;
  }
}

@media (max-width: 480px) {
  .hero-title {
    font-size: 1.75rem;
  }

  .hero-image-container {
    min-height: 250px;
  }

  .main-content {
    padding: 20px 16px 100px;
  }

  :deep(.nav-back.base-button) {
    font-size: 14px;
    padding: 6px 10px;
  }

  :deep(.nav-btn.base-button) {
    width: 36px;
    height: 36px;
  }

  .meeting-point-content,
  .requirement-item,
  .recommendation-item {
    padding: 16px;
  }
}
</style>
