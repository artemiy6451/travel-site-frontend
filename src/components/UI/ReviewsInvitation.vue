<template>
  <section class="reviews-invitation">
    <div class="invitation-bg"></div>
    <div class="container">
      <div class="invitation-content">
        <!-- Левая часть - текст и статистика -->
        <div class="text-content">
          <div class="content-wrapper">
            <h2 class="title">Что говорят наши гости</h2>
            <p class="subtitle">
              Присоединяйтесь к сотням довольных путешественников, которые уже открыли для себя
              настоящий Крым вместе с нами
            </p>

            <!-- Статистика -->
            <div v-if="stats" class="stats">
              <div class="stat-item">
                <div class="stat-number">{{ stats.total }}+</div>
                <div class="stat-label">отзывов</div>
              </div>
              <div class="stat-item">
                <div class="stat-number">{{ stats.average_rating.toFixed(1) }}</div>
                <div class="stat-label">средний рейтинг</div>
              </div>
            </div>

            <!-- Призыв к действию -->
            <div class="cta-buttons">
              <button @click="scrollToReviews" class="cta-button primary">
                <span class="btn-icon">📝</span>
                <span class="btn-text">Читать все отзывы</span>
              </button>
              <button @click="scrollToForm" class="cta-button secondary">
                <span class="btn-icon">✍️</span>
                <span class="btn-text">Оставить отзыв</span>
              </button>
            </div>
          </div>
        </div>

        <!-- Правая часть - примеры отзывов -->
        <div class="reviews-preview" @click="handleRewievClick">
          <div class="preview-container">
            <div class="preview-header">
              <h3 class="preview-title">Последние отзывы</h3>
              <div class="rating-badge">
                <span class="rating-stars">⭐⭐⭐⭐⭐</span>
                <span class="rating-text">5.0</span>
              </div>
            </div>

            <div v-if="loading" class="loading-preview">
              <div class="loading-spinner"></div>
              <span class="loading-text">Загрузка отзывов...</span>
            </div>

            <div v-else-if="sampleReviews.length > 0" class="preview-cards">
              <div v-for="(review, index) in sampleReviews" :key="review.id" class="preview-card"
                :style="{ animationDelay: `${index * 0.1}s` }">
                <div class="review-header">
                  <div class="author-avatar">
                    {{ getInitials(review.author_name) }}
                  </div>
                  <div class="author-info">
                    <div class="author-name">{{ review.author_name }}</div>
                    <div class="review-rating">
                      <span class="stars">
                        <span v-for="star in 5" :key="star" class="star" :class="{ active: star <= review.rating }">
                          ★
                        </span>
                      </span>
                      <span class="rating-value">{{ review.rating }}.0</span>
                    </div>
                  </div>
                </div>
                <p class="review-excerpt">
                  {{ truncateText(review.text, 120) }}
                </p>
                <div class="review-footer">
                  <span class="review-date">{{ formatDate(review.created_at) }}</span>
                  <span class="review-status" v-if="!review.is_active">На модерации</span>
                </div>
              </div>
            </div>

            <div v-else class="no-reviews">
              <div class="no-reviews-icon">💬</div>
              <h4>Отзывов пока нет</h4>
              <p class="hint">Будьте первым, кто оставит отзыв!</p>
            </div>

            <div class="preview-footer">
              <router-link to="/reviews" class="view-all-link">
                Посмотреть все отзывы
                <span class="link-icon">→</span>
              </router-link>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { api } from '@/utils/api'
import type { Review, ReviewStats } from '@/types/review'
import { useRouter } from 'vue-router'

const stats = ref<ReviewStats | null>(null)
const sampleReviews = ref<Review[]>([])
const loading = ref(false)
const router = useRouter()

// Загрузка данных
const loadData = async () => {
  loading.value = true
  try {
    stats.value = await api.reviews.getReviewsStats()
    const reviews = await api.reviews.getApprovedReviews()
    sampleReviews.value = reviews.slice(0, 3)
  } catch (error) {
    console.error('Error loading reviews data:', error)
  } finally {
    loading.value = false
  }
}

// Вспомогательные функции
const getInitials = (name: string): string => {
  return name
    .split(' ')
    .map((word) => word.charAt(0).toUpperCase())
    .join('')
    .substring(0, 2)
}

const truncateText = (text: string, maxLength: number): string => {
  if (text.length <= maxLength) return text
  return text.substring(0, maxLength) + '...'
}

const formatDate = (dateString: string): string => {
  const date = new Date(dateString)
  return date.toLocaleDateString('ru-RU', {
    day: 'numeric',
    month: 'short',
  })
}

const scrollToForm = () => {
  router.push('/reviews')
  setTimeout(() => {
    const formElement = document.querySelector('.review-form')
    if (formElement) {
      formElement.scrollIntoView({ behavior: 'smooth', block: 'center' })
    }
  }, 300)
}

const scrollToReviews = () => {
  router.push('/reviews')
  setTimeout(() => {
    const formElement = document.querySelector('.reviews-section')
    if (formElement) {
      formElement.scrollIntoView({ behavior: 'smooth', block: 'center' })
    }
  }, 300)
}

const handleRewievClick = (): void => {
  router.push(`/reviews`)
}

onMounted(() => {
  loadData()
})
</script>

<style scoped>
.reviews-invitation {
  padding: 80px 0;
  background: var(--green-bg);
  position: relative;
  overflow: hidden;
}

.invitation-bg {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(135deg, var(--green-bg) 0%, var(--green-bg-light) 100%);
  opacity: 0.9;
  z-index: 1;
}

.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 20px;
  position: relative;
  z-index: 2;
}

.invitation-content {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 60px;
  align-items: center;
}

@media (max-width: 968px) {
  .invitation-content {
    grid-template-columns: 1fr;
    gap: 40px;
  }
}

/* Левая часть - текст */
.text-content {
  padding-right: 20px;
}

@media (max-width: 968px) {
  .text-content {
    padding-right: 0;
    text-align: center;
  }
}

.content-wrapper {
  max-width: 500px;
}

@media (max-width: 968px) {
  .content-wrapper {
    max-width: 100%;
    margin: 0 auto;
  }
}

.title {
  font-size: 2.8rem;
  font-weight: 800;
  color: var(--text-dark);
  line-height: 1.1;
  margin-bottom: 24px;
  background: var(--gradient-green);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

@media (max-width: 768px) {
  .title {
    font-size: 2.2rem;
  }
}

.subtitle {
  font-size: 1.2rem;
  color: var(--text-medium);
  line-height: 1.6;
  margin-bottom: 40px;
}

@media (max-width: 768px) {
  .subtitle {
    font-size: 1.1rem;
    margin-bottom: 32px;
  }
}

/* Статистика */
.stats {
  display: flex;
  justify-content: center;
  grid-template-columns: repeat(3, 1fr);
  gap: 24px;
  margin: 40px 0;
}

@media (max-width: 768px) {
  .stats {
    grid-template-columns: repeat(3, 1fr);
    gap: 16px;
    margin: 32px 0;
  }
}

@media (max-width: 480px) {
  .stats {
    grid-template-columns: repeat(2, 1fr);
  }
}

.stat-item {
  background: var(--white);
  border-radius: 16px;
  padding: 20px;
  text-align: center;
  box-shadow: 0 8px 32px var(--shadow-green-light);
  border: 1px solid var(--border-green);
  transition: all 0.3s;
}

.stat-item:hover {
  transform: translateY(-4px);
  box-shadow: 0 12px 40px var(--shadow-green);
}

.stat-number {
  font-size: 2.2rem;
  font-weight: 800;
  color: var(--green-primary);
  line-height: 1;
  margin-bottom: 8px;
}

@media (max-width: 768px) {
  .stat-number {
    font-size: 1.8rem;
  }
}

.stat-label {
  font-size: 0.9rem;
  color: var(--text-medium);
  text-transform: uppercase;
  letter-spacing: 1px;
  font-weight: 600;
}

/* Кнопки */
.cta-buttons {
  display: flex;
  gap: 16px;
  margin-top: 40px;
  flex-wrap: wrap;
}

@media (max-width: 968px) {
  .cta-buttons {
    justify-content: center;
  }
}

@media (max-width: 480px) {
  .cta-buttons {
    flex-direction: column;
    gap: 12px;
  }
}

.cta-button {
  padding: 18px 32px;
  border-radius: 16px;
  font-weight: 700;
  text-decoration: none;
  transition: all 0.3s;
  font-size: 1.1rem;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  border: 2px solid transparent;
  min-width: 200px;
}

@media (max-width: 480px) {
  .cta-button {
    width: 100%;
    padding: 16px 24px;
  }
}

.cta-button.primary {
  background: var(--gradient-green);
  color: var(--white);
  box-shadow: 0 8px 24px var(--shadow-green);
}

.cta-button.primary:hover {
  background: var(--gradient-green-hover);
  transform: translateY(-2px);
  box-shadow: 0 12px 32px var(--shadow-green-strong);
}

.cta-button.secondary {
  background: var(--white);
  color: var(--text-dark);
  border-color: var(--green-primary);
}

.cta-button.secondary:hover {
  background: var(--hover-green);
  transform: translateY(-2px);
  border-color: var(--green-dark);
}

.btn-icon {
  font-size: 1.3rem;
}

.btn-text {
  flex: 1;
  text-align: center;
}

/* Правая часть - превью отзывов */
.reviews-preview {
  background: var(--white);
  border-radius: 24px;
  padding: 40px;
  box-shadow: 0 20px 60px var(--shadow-green);
  border: 1px solid var(--border-green);
  position: relative;
  overflow: hidden;
}

.reviews-preview::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 6px;
  background: var(--gradient-green);
}

@media (max-width: 768px) {
  .reviews-preview {
    padding: 30px 24px;
  }
}

.preview-container {
  display: flex;
  flex-direction: column;
  gap: 32px;
}

.preview-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 16px;
}

.preview-title {
  font-size: 1.5rem;
  font-weight: 700;
  color: var(--text-dark);
  margin: 0;
}

.rating-badge {
  background: var(--green-bg);
  border-radius: 20px;
  padding: 8px 16px;
  display: flex;
  align-items: center;
  gap: 8px;
  border: 1px solid var(--border-green);
}

.rating-stars {
  font-size: 1.2rem;
  color: var(--accent-warning);
}

.rating-text {
  font-size: 1.1rem;
  font-weight: 700;
  color: var(--green-primary);
}

.loading-preview {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 20px;
  gap: 20px;
}

.loading-spinner {
  width: 40px;
  height: 40px;
  border: 4px solid var(--green-bg-light);
  border-top: 4px solid var(--green-primary);
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% {
    transform: rotate(0deg);
  }

  100% {
    transform: rotate(360deg);
  }
}

.loading-text {
  font-size: 1rem;
  color: var(--text-medium);
}

.preview-cards {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.preview-card {
  background: var(--green-bg);
  border-radius: 16px;
  padding: 24px;
  border: 1px solid var(--border-green);
  transition: all 0.3s;
  animation: slideIn 0.5s ease forwards;
  opacity: 0;
  transform: translateY(20px);
}

@keyframes slideIn {
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.preview-card:hover {
  background: var(--white);
  transform: translateY(-4px);
  box-shadow: 0 8px 24px var(--shadow-green-light);
}

.review-header {
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 16px;
}

.author-avatar {
  width: 48px;
  height: 48px;
  background: var(--gradient-green);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--white);
  font-weight: 700;
  font-size: 1rem;
  flex-shrink: 0;
  box-shadow: 0 4px 12px var(--shadow-green);
}

.author-info {
  flex: 1;
}

.author-name {
  font-weight: 700;
  color: var(--text-dark);
  margin-bottom: 6px;
  font-size: 1.1rem;
}

.review-rating {
  display: flex;
  align-items: center;
  gap: 12px;
}

.stars {
  display: flex;
  gap: 1px;
}

.star {
  font-size: 1rem;
  color: var(--green-light);
}

.star.active {
  color: var(--accent-warning);
}

.rating-value {
  font-size: 0.9rem;
  font-weight: 600;
  color: var(--text-light);
}

.review-excerpt {
  color: var(--text-medium);
  font-size: 1rem;
  line-height: 1.6;
  margin: 0 0 16px 0;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.review-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: 16px;
  border-top: 1px solid var(--border-green);
}

.review-date {
  font-size: 0.85rem;
  color: var(--text-light);
  font-weight: 500;
}

.review-status {
  font-size: 0.8rem;
  color: var(--accent-warning);
  background: var(--green-bg-light);
  padding: 4px 10px;
  border-radius: 12px;
  font-weight: 600;
}

.no-reviews {
  text-align: center;
  padding: 40px 20px;
  color: var(--text-light);
}

.no-reviews-icon {
  font-size: 3rem;
  margin-bottom: 16px;
  opacity: 0.5;
}

.no-reviews h4 {
  font-size: 1.2rem;
  font-weight: 700;
  color: var(--text-dark);
  margin-bottom: 8px;
}

.no-reviews .hint {
  font-size: 0.95rem;
  margin: 0;
}

.preview-footer {
  text-align: center;
  padding-top: 20px;
  border-top: 1px solid var(--border-green);
}

.view-all-link {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  color: var(--green-primary);
  text-decoration: none;
  font-weight: 600;
  font-size: 1rem;
  transition: all 0.3s;
  padding: 12px 24px;
  border-radius: 12px;
}

.view-all-link:hover {
  background: var(--hover-green);
  color: var(--green-dark);
  transform: translateX(4px);
}

.link-icon {
  font-size: 1.2rem;
  transition: transform 0.3s;
}

.view-all-link:hover .link-icon {
  transform: translateX(4px);
}
</style>
