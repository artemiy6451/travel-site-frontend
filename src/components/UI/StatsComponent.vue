<template>
  <div class="stats-component">
    <!-- Кнопка сворачивания/разворачивания только на мобильных -->
    <div class="stats-toggle-mobile" @click="toggleStats" v-if="isMobile">
      <div class="toggle-content">
        <div class="toggle-icon">{{ isExpanded ? '📊' : '📈' }}</div>
        <span class="toggle-text">{{
          isExpanded ? 'Скрыть статистику' : 'Показать статистику'
        }}</span>
      </div>
      <div class="toggle-arrow" :class="{ expanded: isExpanded }">▼</div>
    </div>

    <!-- Статистика -->
    <div
      class="stats"
      :class="{ collapsed: !isExpanded && isMobile, expanded: isExpanded || !isMobile }"
    >
      <div class="stat-item">
        <div class="stat-icon">📊</div>
        <div class="stat-content">
          <span class="stat-number">{{ total }}</span>
          <span class="stat-label">Всего экскурсий</span>
        </div>
      </div>

      <div class="stat-item">
        <div class="stat-icon">✅</div>
        <div class="stat-content">
          <span class="stat-number">{{ active }}</span>
          <span class="stat-label">Активных</span>
        </div>
      </div>

      <div class="stat-item">
        <div class="stat-icon">👁️</div>
        <div class="stat-content">
          <span class="stat-number">{{ hidden }}</span>
          <span class="stat-label">Скрытых</span>
        </div>
      </div>

      <div class="stat-item">
        <div class="stat-icon">🎫</div>
        <div class="stat-content">
          <span class="stat-number">{{ totalSpots }}</span>
          <span class="stat-label">Всего мест доступно</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'

interface Props {
  total: number
  active: number
  hidden: number
  totalSpots: number
}

defineProps<Props>()

// Состояние для мобильных
const isMobile = ref(false)
const isExpanded = ref(true)

// Проверка размера экрана
const checkScreenSize = () => {
  isMobile.value = window.innerWidth <= 768
  // На мобильных по умолчанию свернуто
  if (isMobile.value) {
    isExpanded.value = false
  }
}

// Переключение состояния
const toggleStats = () => {
  if (isMobile.value) {
    isExpanded.value = !isExpanded.value
  }
}

// Обработчики ресайза
onMounted(() => {
  checkScreenSize()
  window.addEventListener('resize', checkScreenSize)
})

onUnmounted(() => {
  window.removeEventListener('resize', checkScreenSize)
})
</script>

<style scoped>
.stats-component {
  margin-bottom: 30px;
}

/* Кнопка переключения для мобильных */
.stats-toggle-mobile {
  display: none;
  background: white;
  padding: 16px 20px;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  border: 1px solid var(--border-green-light);
  cursor: pointer;
  user-select: none;
  transition: all 0.3s ease;
  margin-bottom: 12px;
}

.stats-toggle-mobile:hover {
  background: var(--green-bg-light);
  transform: translateY(-1px);
}

.toggle-content {
  display: flex;
  align-items: center;
  gap: 12px;
  flex: 1;
}

.toggle-icon {
  font-size: 1.5rem;
}

.toggle-text {
  font-weight: 600;
  color: var(--text-dark);
  font-size: 1rem;
}

.toggle-arrow {
  transition: transform 0.3s ease;
  font-size: 1rem;
  color: var(--text-light);
}

.toggle-arrow.expanded {
  transform: rotate(180deg);
}

/* Статистика */
.stats {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 20px;
  transition: all 0.3s ease;
  overflow: hidden;
}

/* Состояния для мобильных */
.stats.collapsed {
  max-height: 0;
  opacity: 0;
  margin: 0;
  gap: 0;
}

.stats.expanded {
  max-height: 500px;
  opacity: 1;
}

.stat-item {
  background: white;
  padding: 20px;
  border-radius: 12px;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
  border: 1px solid var(--border-green-light);
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 15px;
}

.stat-item:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.15);
}

.stat-icon {
  font-size: 2rem;
  opacity: 0.8;
}

.stat-content {
  display: flex;
  flex-direction: column;
  gap: 5px;
}

.stat-number {
  font-size: 2rem;
  font-weight: 700;
  color: var(--green-primary);
  line-height: 1;
}

.stat-label {
  color: var(--text-medium);
  font-size: 0.9rem;
  font-weight: 500;
}

/* Адаптивность */
@media (max-width: 1200px) {
  .stats {
    grid-template-columns: repeat(2, 1fr);
    gap: 15px;
  }

  .stat-item {
    padding: 18px;
  }

  .stat-number {
    font-size: 1.75rem;
  }

  .stat-icon {
    font-size: 1.75rem;
  }
}

@media (max-width: 768px) {
  .stats-component {
    margin-bottom: 25px;
  }

  /* Показываем кнопку переключения на мобильных */
  .stats-toggle-mobile {
    display: flex;
    align-items: center;
    justify-content: space-between;
  }

  .stats {
    grid-template-columns: 1fr;
    gap: 12px;
    transition: all 0.3s ease;
  }

  .stat-item {
    padding: 16px;
    gap: 12px;
    transition: all 0.3s ease;
  }

  /* Анимация появления элементов при разворачивании */
  .stats.expanded .stat-item {
    animation: slideIn 0.3s ease forwards;
  }

  .stats.expanded .stat-item:nth-child(1) {
    animation-delay: 0.05s;
  }
  .stats.expanded .stat-item:nth-child(2) {
    animation-delay: 0.1s;
  }
  .stats.expanded .stat-item:nth-child(3) {
    animation-delay: 0.15s;
  }
  .stats.expanded .stat-item:nth-child(4) {
    animation-delay: 0.2s;
  }

  .stat-number {
    font-size: 1.5rem;
  }

  .stat-label {
    font-size: 0.85rem;
  }

  .stat-icon {
    font-size: 1.5rem;
  }
}

@media (max-width: 480px) {
  .stats-toggle-mobile {
    padding: 14px 16px;
  }

  .toggle-icon {
    font-size: 1.3rem;
  }

  .toggle-text {
    font-size: 0.9rem;
  }

  .stats {
    gap: 10px;
  }

  .stat-item {
    padding: 14px;
    gap: 10px;
  }

  .stat-number {
    font-size: 1.4rem;
  }

  .stat-label {
    font-size: 0.8rem;
  }

  .stat-icon {
    font-size: 1.4rem;
  }
}

@media (max-width: 360px) {
  .stats-toggle-mobile {
    padding: 12px 14px;
  }

  .toggle-content {
    gap: 8px;
  }

  .toggle-icon {
    font-size: 1.2rem;
  }

  .toggle-text {
    font-size: 0.85rem;
  }

  .stat-item {
    padding: 12px;
    gap: 8px;
  }

  .stat-number {
    font-size: 1.3rem;
  }

  .stat-label {
    font-size: 0.75rem;
  }

  .stat-icon {
    font-size: 1.3rem;
  }
}

/* Анимации */
@keyframes slideIn {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* Плавные переходы */
.stats,
.stat-item,
.stats-toggle-mobile {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

/* Улучшенная доступность */
.stats-toggle-mobile:focus {
  outline: 2px solid var(--green-primary);
  outline-offset: 2px;
}

.stats-toggle-mobile:active {
  transform: scale(0.98);
}
</style>
