<template>
  <section class="facts-section">
    <div class="facts-grid">
      <div class="fact-card">
        <div class="fact-icon">📅</div>
        <div class="fact-content">
          <div class="fact-label">Дата</div>
          <div class="fact-value">{{ formatDate(excursion.date) }}</div>
        </div>
      </div>

      <div class="fact-card">
        <div class="fact-icon">⏱️</div>
        <div class="fact-content">
          <div class="fact-label">Длительность</div>
          <div class="fact-value">{{ formatDuration(excursion.duration) }}</div>
        </div>
      </div>

      <!-- Обновленная карточка с оставшимися местами -->
      <div class="fact-card">
        <div class="fact-icon">👥</div>
        <div class="fact-content">
          <div class="fact-label">Свободные места</div>
          <div class="people-info" :class="getPeopleStatusClass(excursion)">
            <div class="people-count">
              <span class="people-left">{{ excursion.people_left }}</span>
              <span class="people-label">мест</span>
            </div>
            <div class="people-status-badge" :class="getPeopleStatusClass(excursion)">
              {{ getPeopleStatusText(excursion) }}
            </div>
          </div>
        </div>
      </div>

      <div class="fact-card">
        <div class="fact-icon">💰</div>
        <div class="fact-content">
          <div class="fact-label">Стоимость</div>
          <div class="fact-value price-tag">{{ formatPrice(excursion.price) }}</div>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import type { Excursion } from '@/types/excursion'

interface Props {
  excursion: Excursion
}

withDefaults(defineProps<Props>(), {})

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
  return `${price.toLocaleString('ru-RU')} ₽`
}

const formatDuration = (minutes: number): string => {
  const hours = Math.floor(minutes / 60)
  const mins = minutes % 60
  if (hours > 0) {
    return mins > 0 ? `${hours} ч ${mins} мин` : `${hours} ч`
  }
  return `${mins} мин`
}

const formatDate = (dateString: string | Date): string => {
  const date = new Date(dateString)
  return date.toLocaleDateString('ru-RU', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}
</script>

<style scoped>
.facts-section {
  margin-bottom: 40px;
}

.section-title {
  font-size: 1.5rem;
  font-weight: 700;
  color: #1a1a1a;
  margin-bottom: 20px;
}

.facts-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 16px;
}

.fact-card {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 20px;
  background: #f8fafc;
  border-radius: 16px;
  border: 1px solid #e2e8f0;
  transition: all 0.2s ease;
}

.fact-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.fact-icon {
  font-size: 24px;
  width: 50px;
  height: 50px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.fact-content {
  flex: 1;
}

.fact-label {
  font-size: 12px;
  color: #64748b;
  text-transform: uppercase;
  font-weight: 600;
  margin-bottom: 4px;
}

.fact-value {
  font-size: 16px;
  font-weight: 600;
  color: #1e293b;
}

.price-tag {
  color: #10b981;
  font-size: 18px;
}

/* Стили для информации о местах в фактах */
.people-info {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 6px 10px;
  border-radius: 12px;
  background: var(--green-bg-light);
  border: 1px solid var(--border-green-light);
  transition: all 0.3s ease;
  max-width: 140px;
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

.people-count {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2px;
  flex: 1;
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
  padding: 3px 6px;
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
  .facts-grid {
    grid-template-columns: 1fr;
  }

  .fact-card {
    padding: 16px;
  }

  .people-info {
    max-width: 120px;
    padding: 5px 8px;
  }

  .people-left {
    font-size: 1rem;
  }

  .people-status-badge {
    font-size: 0.6rem;
  }
}

@media (max-width: 480px) {
  .section-title {
    font-size: 1.3rem;
  }

  .fact-card {
    flex-direction: column;
    text-align: center;
    gap: 12px;
  }

  .fact-icon {
    width: 40px;
    height: 40px;
    font-size: 20px;
  }

  .people-info {
    justify-content: center;
    max-width: none;
  }
}
</style>
