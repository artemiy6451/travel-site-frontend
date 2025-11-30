<template>
  <div class="review-card" :class="{
    'pending': !review.is_approved,
    'hidden': !review.is_active
  }">
    <div class="review-header">
      <div class="review-author">
        <div class="author-avatar">
          {{ review.author_name.charAt(0).toUpperCase() }}
        </div>
        <div class="author-info">
          <div class="author-name">{{ review.author_name }}</div>
          <div class="review-date">{{ formatDate(review.created_at) }}</div>
        </div>
      </div>

      <div class="review-rating">
        <span class="rating-stars">
          <span
            v-for="star in 5"
            :key="star"
            class="star"
            :class="{ active: star <= review.rating }"
          >
            ⭐
          </span>
        </span>
        <span class="rating-value">{{ review.rating }}/5</span>
      </div>
    </div>

    <div class="review-content">
      {{ review.text }}
    </div>

    <!-- Админские действия -->
    <div v-if="isAdmin" class="admin-actions">
      <div class="admin-status">
        <span v-if="!review.is_approved" class="status-badge pending">
          На модерации
        </span>
        <span v-if="!review.is_active" class="status-badge hidden">
          Скрыт
        </span>
        <span v-if="review.excursion_id" class="excursion-badge">
          Экскурсия #{{ review.excursion_id }}
        </span>
      </div>

      <div class="admin-buttons">
        <button
          v-if="!review.is_approved"
          @click="$emit('approve', review.id)"
          class="admin-btn approve-btn"
          title="Одобрить отзыв"
        >
          ✅ Одобрить
        </button>

        <button
          v-if="review.is_active && review.is_approved"
          @click="$emit('hide', review.id)"
          class="admin-btn hide-btn"
          title="Скрыть отзыв"
        >
          👁️ Скрыть
        </button>

        <button
          v-if="!review.is_active"
          @click="$emit('show', review.id)"
          class="admin-btn show-btn"
          title="Показать отзыв"
        >
          👁️‍🗨️ Показать
        </button>

        <button
          @click="$emit('delete', review.id)"
          class="admin-btn delete-btn"
          title="Удалить отзыв"
        >
          🗑️ Удалить
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { Review } from '@/types/review'

interface Props {
  review: Review
  isAdmin?: boolean
}

defineProps<Props>()
defineEmits<{
  approve: [id: number]
  hide: [id: number]
  show: [id: number]
  delete: [id: number]
}>()

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('ru-RU', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  })
}
</script>

<style scoped>
.review-card {
  background: var(--white);
  padding: 24px;
  border-radius: 12px;
  border: 1px solid var(--border-green);
  box-shadow: 0 2px 8px var(--shadow-green-light);
  transition: all 0.3s ease;
  max-width: 100%;
  box-sizing: border-box;
  word-wrap: break-word;
  overflow-wrap: break-word;
}

.review-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 16px var(--shadow-green);
}

.review-card.pending {
  border-left: 4px solid var(--accent-warning);
  background: var(--green-bg-lighter);
}

.review-card.hidden {
  border-left: 4px solid var(--accent-error);
  background: #fdf2f2;
  opacity: 0.7;
}

.review-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 16px;
  gap: 15px;
}

.review-author {
  display: flex;
  align-items: center;
  gap: 12px;
  min-width: 0; /* Важно для правильного обрезания длинных имен */
}

.author-avatar {
  width: 40px;
  height: 40px;
  background: var(--gradient-green);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--white);
  font-weight: 600;
  font-size: 1.1rem;
  flex-shrink: 0;
}

.author-info {
  display: flex;
  flex-direction: column;
  min-width: 0; /* Важно для правильного обрезания длинных имен */
}

.author-name {
  font-weight: 600;
  color: var(--text-dark);
  margin-bottom: 2px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.review-date {
  font-size: 0.8rem;
  color: var(--text-light);
}

.review-rating {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 4px;
  flex-shrink: 0;
}

.rating-stars {
  display: flex;
  gap: 2px;
}

.star {
  font-size: 1.1rem;
  opacity: 0.3;
  flex-shrink: 0;
}

.star.active {
  opacity: 1;
}

.rating-value {
  font-size: 0.8rem;
  color: var(--text-light);
  font-weight: 500;
}

.review-content {
  color: var(--text-medium);
  line-height: 1.6;
  margin-bottom: 16px;
  white-space: pre-wrap; /* Сохраняем переносы строк */
  word-wrap: break-word; /* Переносим длинные слова */
  overflow-wrap: break-word; /* Современная альтернатива word-wrap */
  word-break: break-word; /* Принудительный перенос слов */
  max-width: 100%; /* Ограничиваем ширину */
}

.admin-actions {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 15px;
  padding-top: 16px;
  border-top: 1px solid var(--border-green-light);
  flex-wrap: wrap;
}

.admin-status {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
  min-width: 0; /* Важно для правильного переноса */
}

.status-badge {
  padding: 4px 8px;
  border-radius: 12px;
  font-size: 0.7rem;
  font-weight: 600;
  white-space: nowrap;
  flex-shrink: 0;
}

.status-badge.pending {
  background: var(--accent-warning);
  color: #000;
}

.status-badge.hidden {
  background: var(--accent-error);
  color: white;
}

.excursion-badge {
  background: var(--green-light);
  color: var(--text-dark);
  padding: 4px 8px;
  border-radius: 12px;
  font-size: 0.7rem;
  font-weight: 600;
  white-space: nowrap;
  flex-shrink: 0;
}

.admin-buttons {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
  min-width: 0; /* Важно для правильного переноса */
}

.admin-btn {
  padding: 6px 12px;
  border: none;
  border-radius: 6px;
  font-size: 0.8rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  white-space: nowrap;
  flex-shrink: 0;
}

.approve-btn {
  background: var(--green-lightest);
  color: var(--green-darker);
}

.approve-btn:hover {
  background: var(--green-light);
}

.hide-btn, .show-btn {
  background: var(--green-bg-light);
  color: var(--text-medium);
}

.hide-btn:hover, .show-btn:hover {
  background: var(--green-light);
}

.delete-btn {
  background: #fdf2f2;
  color: var(--accent-error);
}

.delete-btn:hover {
  background: #f5c6cb;
}

/* Адаптивность */
@media (max-width: 768px) {
  .review-card {
    padding: 20px;
  }

  .review-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 12px;
  }

  .review-rating {
    align-self: flex-start;
    flex-direction: row;
    align-items: center;
    gap: 10px;
  }

  .admin-actions {
    flex-direction: column;
    align-items: flex-start;
    gap: 12px;
  }

  .admin-buttons {
    width: 100%;
    justify-content: flex-start;
  }

  .review-content {
    font-size: 0.95rem; /* Немного уменьшаем шрифт на мобильных */
  }
}

@media (max-width: 480px) {
  .review-card {
    padding: 16px;
  }

  .author-avatar {
    width: 35px;
    height: 35px;
    font-size: 1rem;
  }

  .review-content {
    font-size: 0.9rem;
    line-height: 1.5;
  }

  .admin-btn {
    padding: 5px 10px;
    font-size: 0.75rem;
  }

  .status-badge, .excursion-badge {
    font-size: 0.65rem;
    padding: 3px 6px;
  }
}

/* Дополнительные улучшения для очень длинного контента */
@media (max-width: 360px) {
  .review-content {
    font-size: 0.85rem;
  }

  .admin-buttons {
    gap: 6px;
  }

  .admin-btn {
    padding: 4px 8px;
    font-size: 0.7rem;
  }
}
</style>
