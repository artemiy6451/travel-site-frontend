<template>
  <div class="card-departure">
    <span class="departure-icon">📅</span>
    <span class="departure-date">{{ formattedDate }}</span>
    <span v-if="isToday" class="departure-badge today">Сегодня</span>
    <span v-else-if="isTomorrow" class="departure-badge tomorrow">Завтра</span>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

interface Props {
  date: string | Date
}

const props = defineProps<Props>()

// Проверка что экскурсия сегодня
const isToday = computed((): boolean => {
  const date = new Date(props.date)
  const now = new Date()
  return date.toDateString() === now.toDateString()
})

// Проверка что экскурсия завтра
const isTomorrow = computed((): boolean => {
  const date = new Date(props.date)
  const tomorrow = new Date()
  tomorrow.setDate(tomorrow.getDate() + 1)
  return date.toDateString() === tomorrow.toDateString()
})

// Форматирование даты отправления
const formattedDate = computed((): string => {
  const date = new Date(props.date)

  // Если дата сегодня
  if (isToday.value) {
    return `в ${date.toLocaleTimeString('ru-RU', {
      hour: '2-digit',
      minute: '2-digit',
    })}`
  }

  // Если дата завтра
  if (isTomorrow.value) {
    return `в ${date.toLocaleTimeString('ru-RU', {
      hour: '2-digit',
      minute: '2-digit',
    })}`
  }

  // Для остальных дат
  return date.toLocaleDateString('ru-RU', {
    day: 'numeric',
    month: 'long',
    hour: '2-digit',
    minute: '2-digit',
  })
})
</script>

<style scoped>
.card-departure {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 15px;
  padding: 8px 12px;
  background: var(--green-bg-light);
  border-radius: 8px;
  border: 1px solid var(--shadow-green);
  flex-wrap: wrap;
  width: 100%;
}

.departure-icon {
  font-size: 1rem;
}

.departure-date {
  font-size: 0.9rem;
  font-weight: 600;
  color: var(--green-darker);
}

.departure-badge {
  padding: 2px 6px;
  border-radius: 4px;
  font-size: 0.7rem;
  font-weight: 600;
  text-transform: uppercase;
}

.departure-badge.today {
  background: #28a745;
  color: white;
}

.departure-badge.tomorrow {
  background: #17a2b8;
  color: white;
}

/* Адаптивность */
@media (max-width: 768px) {
  .card-departure {
    justify-content: center;
    gap: 10px;
  }
}
</style>
