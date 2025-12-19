<template>
  <div class="image-carousel" ref="carouselContainer" :style="{ height: height }">
    <!-- Контейнер для скролла фоток -->
    <div class="carousel-scroll-container" v-if="hasMultipleImages">
      <div
        class="carousel-scroll-track"
        :style="{ transform: `translateX(-${currentIndex * 100}%)` }"
      >
        <div v-for="(image, index) in images" :key="getKey(image, index)" class="carousel-image-item">
          <img
            :src="getImageUrl(image)"
            :alt="altText || `Изображение ${index + 1}`"
            @error="handleImageError"
            loading="lazy"
            class="carousel-image"
          />
        </div>
      </div>

      <!-- Индикаторы/точки -->
      <div class="carousel-indicators" v-if="showIndicators && hasMultipleImages">
        <button
          v-for="(_, index) in images"
          :key="index"
          class="carousel-indicator-dot"
          :class="{ active: currentIndex === index }"
          @click.stop="goToSlide(index)"
          :aria-label="`Перейти к изображению ${index + 1}`"
        ></button>
      </div>

      <!-- Кнопки навигации -->
      <button
        v-if="showNavigation && hasMultipleImages && currentIndex > 0"
        class="carousel-nav-btn carousel-prev-btn"
        @click.stop="prevSlide"
        aria-label="Предыдущее фото"
      >
        ‹
      </button>
      <button
        v-if="showNavigation && hasMultipleImages && currentIndex < images.length - 1"
        class="carousel-nav-btn carousel-next-btn"
        @click.stop="nextSlide"
        aria-label="Следующее фото"
      >
        ›
      </button>

    </div>

    <!-- Одно изображение если нет массива или только одно -->
    <div v-else class="carousel-single-image">
      <img
        v-if="images.length > 0"
        :src="getImageUrl(images[0])"
        :alt="altText"
        @error="handleImageError"
        loading="lazy"
        class="carousel-image"
      />
      <div v-else class="carousel-placeholder">
        <slot name="placeholder">
          <span class="placeholder-text">Нет изображения</span>
        </slot>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { handleImageError } from '@/utils/image'

interface Props {
  // Массив изображений (строки или объекты)
  images: any[]
  // Высота карусели
  height?: string
  // Текст для alt атрибута
  altText?: string
  // Показывать индикаторы
  showIndicators?: boolean
  // Показывать навигационные кнопки
  showNavigation?: boolean
  // Автоматическое перелистывание (в миллисекундах)
  autoPlay?: number
  // Начальный слайд
  initialSlide?: number
  // Ключ для идентификации изображений в массиве объектов
  imageKey?: string
}

const props = withDefaults(defineProps<Props>(), {
  height: '300px',
  showIndicators: true,
  showNavigation: true,
  autoPlay: 0,
  initialSlide: 0,
  imageKey: 'url'
})

const emit = defineEmits<{
  'slide-change': [index: number]
  'slide-click': [index: number]
}>()

const currentIndex = ref(props.initialSlide)
const carouselContainer = ref<HTMLElement | null>(null)

// Проверяем, есть ли несколько изображений
const hasMultipleImages = computed(() => props.images.length > 1)

// Получаем URL изображения (поддержка строк и объектов)
const getImageUrl = (image: any): string => {
  if (typeof image === 'string') return image
  if (image && typeof image === 'object') return image[props.imageKey] || image.url || ''
  return ''
}

// Генерируем уникальный ключ для изображения
const getKey = (image: any, index: number): string => {
  if (typeof image === 'string') return image
  if (image && image.id) return image.id.toString()
  return index.toString()
}

// Навигация по слайдам
const nextSlide = () => {
  if (currentIndex.value < props.images.length - 1) {
    currentIndex.value++
  } else {
    currentIndex.value = 0
  }
  emit('slide-change', currentIndex.value)
}

const prevSlide = () => {
  if (currentIndex.value > 0) {
    currentIndex.value--
  } else {
    currentIndex.value = props.images.length - 1
  }
  emit('slide-change', currentIndex.value)
}

const goToSlide = (index: number) => {
  currentIndex.value = index
  emit('slide-change', currentIndex.value)
}

// Обработка клика по изображению
const handleImageClick = (index: number) => {
  emit('slide-click', index)
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

  const diffX = Math.abs(touchX - touchStartX.value)
  const diffY = Math.abs(touchY - touchStartY.value)

  // Если движение в основном горизонтальное - предотвращаем скролл страницы
  if (diffX > diffY && diffX > 5) {
    e.preventDefault()
    isSwiping.value = true
  }
}

const handleTouchEnd = (e: TouchEvent) => {
  if (!touchStartX.value || !isSwiping.value) return

  const touchEndX = e.changedTouches[0].clientX
  const diffX = touchStartX.value - touchEndX
  const minSwipeDistance = 30

  if (Math.abs(diffX) > minSwipeDistance) {
    if (diffX > 0) {
      nextSlide() // Свайп влево
    } else {
      prevSlide() // Свайп вправо
    }
  }

  // Сброс
  touchStartX.value = 0
  touchStartY.value = 0
  isSwiping.value = false
}

// Автопрокрутка
let autoPlayInterval: number | null = null

const startAutoPlay = () => {
  if (props.autoPlay > 0 && hasMultipleImages.value) {
    autoPlayInterval = window.setInterval(() => {
      nextSlide()
    }, props.autoPlay)
  }
}

const stopAutoPlay = () => {
  if (autoPlayInterval) {
    clearInterval(autoPlayInterval)
    autoPlayInterval = null
  }
}

// Привязать события к контейнеру
onMounted(() => {
  if (carouselContainer.value && hasMultipleImages.value) {
    carouselContainer.value.addEventListener('touchstart', handleTouchStart, { passive: false })
    carouselContainer.value.addEventListener('touchmove', handleTouchMove, { passive: false })
    carouselContainer.value.addEventListener('touchend', handleTouchEnd, { passive: true })
  }

  if (props.autoPlay > 0) {
    startAutoPlay()
  }
})

onUnmounted(() => {
  if (carouselContainer.value) {
    carouselContainer.value.removeEventListener('touchstart', handleTouchStart)
    carouselContainer.value.removeEventListener('touchmove', handleTouchMove)
    carouselContainer.value.removeEventListener('touchend', handleTouchEnd)
  }

  stopAutoPlay()
})

// Останавливаем автопрокрутку при наведении
const pauseAutoPlay = () => {
  if (props.autoPlay > 0) {
    stopAutoPlay()
  }
}

const resumeAutoPlay = () => {
  if (props.autoPlay > 0) {
    startAutoPlay()
  }
}
</script>

<style scoped>
.image-carousel {
  position: relative;
  width: 100%;
  overflow: hidden;
  border-radius: 8px;
}

.carousel-scroll-container {
  position: relative;
  width: 100%;
  height: 100%;
  overflow: hidden;
}

.carousel-scroll-track {
  display: flex;
  height: 100%;
  transition: transform 0.5s cubic-bezier(0.25, 0.46, 0.45, 0.94);
  will-change: transform;
}

.carousel-image-item {
  flex: 0 0 100%;
  min-width: 100%;
  height: 100%;
  cursor: pointer;
}

.carousel-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.3s ease;
}

.carousel-single-image {
  width: 100%;
  height: 100%;
}

.carousel-placeholder {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f5f5f5;
  color: #999;
  font-size: 14px;
}

.placeholder-text {
  opacity: 0.7;
}

/* Индикаторы точек */
.carousel-indicators {
  position: absolute;
  bottom: 15px;
  left: 0;
  right: 0;
  display: flex;
  justify-content: center;
  gap: 8px;
  z-index: 2;
}

.carousel-indicator-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.6);
  border: none;
  cursor: pointer;
  padding: 0;
  transition: all 0.3s ease;
}

.carousel-indicator-dot:hover {
  background: rgba(255, 255, 255, 0.9);
  transform: scale(1.2);
}

.carousel-indicator-dot.active {
  background: white;
  transform: scale(1.2);
  box-shadow: 0 0 10px rgba(255, 255, 255, 0.8);
}

/* Кнопки навигации */
.carousel-nav-btn {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  width: 40px;
  height: 40px;
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
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.2);
}

.image-carousel:hover .carousel-nav-btn {
  opacity: 1;
}

.carousel-nav-btn:hover {
  background: white;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.3);
  transform: translateY(-50%) scale(1.1);
}

.carousel-nav-btn:active {
  transform: translateY(-50%) scale(0.95);
}

.carousel-prev-btn {
  left: 15px;
}

.carousel-next-btn {
  right: 15px;
}

/* Счетчик фоток */
.carousel-counter {
  position: absolute;
  top: 15px;
  right: 15px;
  background: rgba(0, 0, 0, 0.6);
  color: white;
  padding: 6px 12px;
  border-radius: 20px;
  font-size: 14px;
  font-weight: 500;
  z-index: 2;
  backdrop-filter: blur(4px);
}

/* Адаптивность */
@media (max-width: 768px) {
  .carousel-nav-btn {
    opacity: 0.7;
    width: 36px;
    height: 36px;
    font-size: 16px;
  }

  .carousel-prev-btn {
    left: 10px;
  }

  .carousel-next-btn {
    right: 10px;
  }

  .carousel-counter {
    font-size: 12px;
    padding: 4px 10px;
  }

  .carousel-indicators {
    bottom: 10px;
  }

  .carousel-indicator-dot {
    width: 6px;
    height: 6px;
  }
}

@media (max-width: 480px) {
  .carousel-nav-btn {
    width: 32px;
    height: 32px;
    font-size: 14px;
    opacity: 0.8; /* Всегда показываем на мобильных */
  }

  .carousel-counter {
    top: 10px;
    right: 10px;
    font-size: 11px;
    padding: 3px 8px;
  }
}

/* Поддержка touch-свайпа */
@media (hover: none) and (pointer: coarse) {
  .carousel-nav-btn {
    opacity: 0.7; /* Всегда показываем на тач-устройствах */
  }
}
</style>
