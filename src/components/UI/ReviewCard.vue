<template>
  <div class="review-card" :class="{ pending: !review.is_active }">
    <div class="card-header">
      <div class="reviewer-info">
        <div class="avatar">
          {{ getInitials(review.author_name) }}
        </div>
        <div class="info">
          <h3 class="reviewer-name">{{ review.author_name }}</h3>
          <div class="review-meta">
            <div class="rating">
              <span class="star filled" v-for="n in review.rating" :key="n">★</span>
              <span class="star" v-for="n in 5 - review.rating" :key="'empty-' + n">☆</span>
            </div>
            <div class="review-date">
              {{ formatDate(review.created_at) }}
            </div>
          </div>
        </div>
      </div>

      <div v-if="isAdmin" class="admin-badges">
        <span
          class="status-badge"
          :class="{
            approved: review.is_active,
            pending: !review.is_active,
          }"
        >
          {{ review.is_active ? 'Одобрен' : 'На модерации' }}
        </span>
        <span v-if="!review.is_active" class="email-badge">
          {{ review.email }}
        </span>
      </div>
    </div>

    <div class="review-content">
      <p>{{ review.text }}</p>
    </div>

    <!-- Админские кнопки -->
    <div v-if="isAdmin" class="admin-actions">
      <button
        @click="$emit('toggle', review.id)"
        class="action-btn toggle-btn"
        :class="{ hide: review.is_active }"
      >
        {{ review.is_active ? 'Скрыть' : 'Одобрить' }}
      </button>
      <button @click="$emit('delete', review.id)" class="action-btn delete-btn">Удалить</button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { defineProps, defineEmits } from 'vue'
import type { Review } from '@/types/review'

defineProps<{
  review: Review
  isAdmin?: boolean
}>()

defineEmits<{
  toggle: [id: number]
  delete: [id: number]
}>()

const getInitials = (name: string): string => {
  return name
    .split(' ')
    .map((word) => word.charAt(0).toUpperCase())
    .join('')
    .substring(0, 2)
}

const formatDate = (dateString: string): string => {
  const date = new Date(dateString)
  return date.toLocaleDateString('ru-RU', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
}
</script>

<style scoped>
.review-card {
  background: var(--white);
  border-radius: 20px;
  padding: 28px;
  box-shadow: 0 8px 32px var(--shadow-green-light);
  border: 1px solid var(--border-green);
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
}

.review-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 12px 40px var(--shadow-green);
  border-color: var(--border-green-medium);
}

.review-card.pending {
  background: linear-gradient(135deg, var(--green-bg) 0%, var(--white) 100%);
  border: 2px solid var(--green-light);
  animation: pulse 2s infinite;
}

@keyframes pulse {
  0%,
  100% {
    border-color: var(--green-light);
  }
  50% {
    border-color: var(--green-primary);
  }
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 24px;
  flex-wrap: wrap;
  gap: 16px;
}

.reviewer-info {
  display: flex;
  gap: 16px;
  align-items: flex-start;
  flex: 1;
}

.avatar {
  width: 56px;
  height: 56px;
  background: var(--gradient-green);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--white);
  font-weight: 700;
  font-size: 1.2rem;
  flex-shrink: 0;
  box-shadow: 0 4px 12px var(--shadow-green);
}

.info {
  flex: 1;
}

.reviewer-name {
  font-size: 1.3rem;
  font-weight: 700;
  color: var(--text-dark);
  margin-bottom: 8px;
  line-height: 1.2;
}

.review-meta {
  display: flex;
  align-items: center;
  gap: 20px;
  flex-wrap: wrap;
}

.rating {
  display: flex;
  gap: 2px;
}

.star {
  font-size: 1.2rem;
}

.star.filled {
  color: var(--accent-warning);
}

.star:not(.filled) {
  color: var(--green-light);
}

.review-date {
  font-size: 0.95rem;
  color: var(--text-light);
  font-weight: 500;
}

.admin-badges {
  display: flex;
  flex-direction: column;
  gap: 8px;
  align-items: flex-end;
  flex-shrink: 0;
}

.status-badge {
  padding: 6px 14px;
  border-radius: 20px;
  font-size: 0.85rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  white-space: nowrap;
  box-shadow: 0 2px 8px var(--shadow-green-light);
}

.status-badge.approved {
  background: linear-gradient(135deg, var(--accent-success) 0%, #2ecc71 100%);
  color: var(--white);
}

.status-badge.pending {
  background: linear-gradient(135deg, var(--accent-warning) 0%, #f39c12 100%);
  color: var(--white);
}

.email-badge {
  font-size: 0.85rem;
  color: var(--text-medium);
  background: var(--green-bg-light);
  padding: 4px 10px;
  border-radius: 12px;
  font-family: 'Menlo', 'Monaco', 'Courier New', monospace;
  border: 1px solid var(--border-green);
}

.review-content {
  margin-bottom: 24px;
  padding: 20px;
  background: var(--green-bg);
  border-radius: 16px;
  border: 1px solid var(--border-green);
}

.review-content p {
  font-size: 1.05rem;
  line-height: 1.7;
  color: var(--text-medium);
  margin: 0;
}

.admin-actions {
  display: flex;
  gap: 12px;
  margin-top: 24px;
  padding-top: 24px;
  border-top: 1px solid var(--border-green);
}

.action-btn {
  padding: 12px 24px;
  border: none;
  border-radius: 12px;
  font-size: 0.95rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s;
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.toggle-btn {
  background: linear-gradient(135deg, var(--green-primary) 0%, var(--green-dark) 100%);
  color: var(--white);
  box-shadow: 0 4px 12px var(--shadow-green);
}

.toggle-btn:hover {
  background: linear-gradient(135deg, var(--green-dark) 0%, var(--green-darker) 100%);
  transform: translateY(-2px);
  box-shadow: 0 6px 16px var(--shadow-green-strong);
}

.toggle-btn.hide {
  background: linear-gradient(135deg, var(--accent-warning) 0%, #e67e22 100%);
}

.toggle-btn.hide:hover {
  background: linear-gradient(135deg, #e67e22 0%, #d35400 100%);
}

.delete-btn {
  background: linear-gradient(135deg, var(--accent-error) 0%, #c0392b 100%);
  color: var(--white);
  box-shadow: 0 4px 12px rgba(235, 87, 87, 0.2);
}

.delete-btn:hover {
  background: linear-gradient(135deg, #c0392b 0%, #a93226 100%);
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(235, 87, 87, 0.3);
}

@media (max-width: 768px) {
  .review-card {
    padding: 24px;
  }

  .card-header {
    flex-direction: column;
    gap: 16px;
  }

  .reviewer-info {
    width: 100%;
  }

  .admin-badges {
    width: 100%;
    flex-direction: row;
    justify-content: flex-start;
    align-items: center;
    flex-wrap: wrap;
    gap: 8px;
  }

  .avatar {
    width: 48px;
    height: 48px;
    font-size: 1.1rem;
  }

  .reviewer-name {
    font-size: 1.2rem;
  }

  .review-content {
    padding: 16px;
  }

  .review-content p {
    font-size: 1rem;
  }

  .admin-actions {
    flex-direction: column;
    gap: 10px;
  }

  .action-btn {
    width: 100%;
    padding: 14px 20px;
  }
}

@media (max-width: 480px) {
  .review-card {
    padding: 20px;
    border-radius: 16px;
  }

  .avatar {
    width: 44px;
    height: 44px;
    font-size: 1rem;
  }

  .reviewer-name {
    font-size: 1.1rem;
  }

  .review-meta {
    flex-direction: column;
    align-items: flex-start;
    gap: 8px;
  }

  .review-content {
    padding: 14px;
    border-radius: 12px;
  }

  .review-content p {
    font-size: 0.95rem;
  }

  .action-btn {
    padding: 12px 16px;
    font-size: 0.9rem;
  }
}
</style>
