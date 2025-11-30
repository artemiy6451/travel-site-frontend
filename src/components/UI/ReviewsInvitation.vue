<template>
  <section class="reviews-invitation">
    <div class="container">
      <div class="invitation-content">
        <!-- Левая часть - текст и статистика -->
        <div class="text-content">
          <h2 class="title">Что говорят наши гости</h2>
          <p class="subtitle">
            Присоединяйтесь к сотням довольных путешественников, которые уже открыли
            для себя настоящий Крым вместе с нами
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
            <router-link to="/reviews" class="cta-button primary">
              📝 Читать все отзывы
            </router-link>
            <router-link to="/reviews" class="cta-button secondary" @click="scrollToForm">
              ✍️ Оставить отзыв
            </router-link>
          </div>
        </div>

        <!-- Правая часть - примеры отзывов -->
        <div class="reviews-preview">
          <div class="preview-title">Последние отзывы</div>

          <div v-if="loading" class="loading-preview">
            <div class="loading-spinner"></div>
          </div>

          <div v-else-if="sampleReviews.length > 0" class="preview-cards">
            <div
              v-for="review in sampleReviews"
              :key="review.id"
              class="preview-card"
            >
              <div class="review-header">
                <div class="author-avatar">
                  {{ review.author_name.charAt(0).toUpperCase() }}
                </div>
                <div class="author-info">
                  <div class="author-name">{{ review.author_name }}</div>
                  <div class="review-rating">
                    <span class="stars">
                      <span
                        v-for="star in 5"
                        :key="star"
                        class="star"
                        :class="{ active: star <= review.rating }"
                      >
                        ⭐
                      </span>
                    </span>
                  </div>
                </div>
              </div>
              <p class="review-excerpt">
                {{ truncateText(review.text, 120) }}
              </p>
            </div>
          </div>

          <div v-else class="no-reviews">
            <div class="no-reviews-icon">💬</div>
            <p>Отзывов пока нет</p>
            <p class="hint">Будьте первым!</p>
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


const stats = ref<ReviewStats | null>(null)
const sampleReviews = ref<Review[]>([])
const loading = ref(false)

// Загрузка статистики и примеров отзывов
const loadData = async () => {
  loading.value = true
  try {
    // Загружаем статистику
    stats.value = await api.getReviewsStats()

    // Загружаем несколько последних одобренных отзывов
    const reviews = await api.getReviews({
      limit: 3,
      skip: 0
    })
    sampleReviews.value = reviews.slice(0, 3) // Берем первые 3

  } catch (error) {
    console.error('Error loading reviews data:', error)
  } finally {
    loading.value = false
  }
}

// Обрезание текста для превью
const truncateText = (text: string, maxLength: number): string => {
  if (text.length <= maxLength) return text
  return text.substring(0, maxLength) + '...'
}

// Прокрутка к форме отзывов (на странице отзывов)
const scrollToForm = () => {
  // При переходе на страницу отзывов, скроллим к форме
  setTimeout(() => {
    const formElement = document.querySelector('.review-form')
    if (formElement) {
      formElement.scrollIntoView({
        behavior: 'smooth',
        block: 'center'
      })
    }
  }, 100)
}

onMounted(() => {
  loadData()
})
</script>

<style scoped>
.reviews-invitation {
  background: var(--gradient-green-soft);
  padding: 60px 0;
}

.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 20px;
}

.invitation-content {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 60px;
  align-items: center;
}

/* Левая часть - текст */
.text-content {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.title {
  font-size: 2.5rem;
  font-weight: 700;
  color: var(--text-dark);
  line-height: 1.2;
  margin: 0;
}

.subtitle {
  font-size: 1.1rem;
  color: var(--text-medium);
  line-height: 1.6;
  margin: 0;
}

/* Статистика */
.stats {
  display: flex;
  gap: 30px;
  margin: 10px 0;
}

.stat-item {
  text-align: center;
}

.stat-number {
  font-size: 2rem;
  font-weight: 700;
  color: var(--green-lightest);
  line-height: 1;
  margin-bottom: 4px;
}

.stat-label {
  font-size: 0.9rem;
  color: var(--text-dark);
  text-transform: lowercase;
}

/* Кнопки */
.cta-buttons {
  display: flex;
  gap: 16px;
  flex-wrap: wrap;
  margin-top: 10px;
}

.cta-button {
  padding: 14px 28px;
  border-radius: 8px;
  font-weight: 600;
  text-decoration: none;
  transition: all 0.3s ease;
  font-size: 1rem;
  text-align: center;
  border: 2px solid transparent;
}

.cta-button.primary {
  background: var(--gradient-green);
  color: var(--white);
}

.cta-button.primary:hover {
  background: var(--gradient-green-hover);
  transform: translateY(-2px);
  box-shadow: 0 8px 25px var(--shadow-green-strong);
}

.cta-button.secondary {
  background: transparent;
  color: var(--text-dark);
  border-color: var(--green-primary);
}

.cta-button.secondary:hover {
  background: var(--green-primary);
  color: var(--white);
  transform: translateY(-2px);
}

/* Правая часть - превью отзывов */
.reviews-preview {
  background: var(--white);
  padding: 30px;
  border-radius: 16px;
  box-shadow: 0 8px 32px var(--shadow-green);
  border: 1px solid var(--border-green);
}

.preview-title {
  font-size: 1.3rem;
  font-weight: 600;
  color: var(--text-dark);
  margin-bottom: 20px;
  text-align: center;
}

.loading-preview {
  display: flex;
  justify-content: center;
  padding: 40px;
}

.loading-spinner {
  width: 30px;
  height: 30px;
  border: 3px solid var(--green-light);
  border-top: 3px solid var(--green-primary);
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.preview-cards {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.preview-card {
  padding: 20px;
  background: var(--green-bg-light);
  border-radius: 12px;
  border: 1px solid var(--border-green-light);
  transition: transform 0.2s ease;
}

.preview-card:hover {
  transform: translateY(-2px);
}

.review-header {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 12px;
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
  font-size: 1rem;
  flex-shrink: 0;
}

.author-info {
  flex: 1;
}

.author-name {
  font-weight: 600;
  color: var(--text-dark);
  margin-bottom: 4px;
  font-size: 0.95rem;
}

.stars {
  display: flex;
  gap: 1px;
}

.star {
  font-size: 0.9rem;
  opacity: 0.3;
}

.star.active {
  opacity: 1;
}

.review-excerpt {
  color: var(--text-medium);
  font-size: 0.9rem;
  line-height: 1.5;
  margin: 0;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.no-reviews {
  text-align: center;
  padding: 40px 20px;
  color: var(--text-light);
}

.no-reviews-icon {
  font-size: 3rem;
  margin-bottom: 16px;
}

.no-reviews p {
  margin: 0;
  font-size: 1rem;
}

.no-reviews .hint {
  font-size: 0.9rem;
  margin-top: 4px;
}

/* Адаптивность */
@media (max-width: 1200px) {
  .container {
    max-width: 1000px;
    padding: 0 30px;
  }

  .invitation-content {
    gap: 50px;
  }

  .title {
    font-size: 2.3rem;
  }

  .stats {
    gap: 25px;
  }
}

@media (max-width: 1024px) {
  .container {
    max-width: 900px;
  }

  .invitation-content {
    gap: 40px;
  }

  .title {
    font-size: 2.1rem;
  }

  .subtitle {
    font-size: 1.05rem;
  }

  .stat-number {
    font-size: 1.8rem;
  }
}

@media (max-width: 968px) {
  .invitation-content {
    grid-template-columns: 1fr;
    gap: 40px;
  }

  .title {
    font-size: 2.2rem;
    text-align: center;
  }

  .subtitle {
    text-align: center;
  }

  .stats {
    justify-content: center;
    gap: 30px;
  }

  .cta-buttons {
    justify-content: center;
  }

  .reviews-preview {
    max-width: 600px;
    margin: 0 auto;
  }
}

@media (max-width: 768px) {
  .reviews-invitation {
    padding: 40px 0;
  }

  .container {
    padding: 0 25px;
  }

  .title {
    font-size: 2rem;
  }

  .subtitle {
    font-size: 1rem;
  }

  .stats {
    gap: 25px;
  }

  .stat-number {
    font-size: 1.7rem;
  }

  .stat-label {
    font-size: 0.85rem;
  }

  .cta-buttons {
    justify-content: center;
    gap: 12px;
  }

  .cta-button {
    flex: 1;
    min-width: 180px;
    padding: 12px 24px;
    font-size: 0.95rem;
  }

  .reviews-preview {
    padding: 25px;
  }

  .preview-title {
    font-size: 1.2rem;
    margin-bottom: 18px;
  }

  .preview-cards {
    gap: 16px;
  }

  .preview-card {
    padding: 18px;
  }
}

@media (max-width: 640px) {
  .reviews-invitation {
    padding: 35px 0;
  }

  .container {
    padding: 0 20px;
  }

  .text-content {
    gap: 20px;
  }

  .title {
    font-size: 1.9rem;
  }

  .stats {
    gap: 20px;
  }

  .stat-number {
    font-size: 1.6rem;
  }

  .cta-buttons {
    gap: 10px;
  }

  .cta-button {
    min-width: 160px;
    padding: 11px 20px;
    font-size: 0.9rem;
  }

  .reviews-preview {
    padding: 22px;
  }
}

@media (max-width: 480px) {
  .reviews-invitation {
    padding: 30px 0;
  }

  .container {
    padding: 0 16px;
  }

  .title {
    font-size: 1.8rem;
  }

  .subtitle {
    font-size: 0.95rem;
    line-height: 1.5;
  }

  .stats {
    flex-direction: column;
    gap: 15px;
    margin: 5px 0;
  }

  .stat-item {
    display: flex;
    justify-content: center;
    align-items: center;
    text-align: left;
    padding: 12px 0;
    border-bottom: 1px solid var(--border-green-light);
  }

  .stat-item:last-child {
    border-bottom: none;
  }

  .stat-number {
    font-size: 1.5rem;
    margin-bottom: 0;
    margin-right: 5px;
  }

  .stat-label {
    font-size: 0.85rem;
    text-align: right;
  }

  .cta-buttons {
    flex-direction: column;
    gap: 12px;
    margin-top: 15px;
  }

  .cta-button {
    width: 100%;
    padding: 14px 20px;
    font-size: 0.95rem;
  }

  .reviews-preview {
    padding: 20px;
    border-radius: 12px;
  }

  .preview-title {
    font-size: 1.1rem;
    margin-bottom: 16px;
  }

  .preview-card {
    padding: 16px;
  }

  .review-header {
    gap: 10px;
    margin-bottom: 10px;
  }

  .author-avatar {
    width: 36px;
    height: 36px;
    font-size: 0.9rem;
  }

  .author-name {
    font-size: 0.9rem;
  }

  .star {
    font-size: 0.85rem;
  }

  .review-excerpt {
    font-size: 0.85rem;
    line-height: 1.4;
    -webkit-line-clamp: 2;
  }

  .no-reviews {
    padding: 30px 15px;
  }

  .no-reviews-icon {
    font-size: 2.5rem;
    margin-bottom: 12px;
  }

  .no-reviews p {
    font-size: 0.9rem;
  }

  .no-reviews .hint {
    font-size: 0.8rem;
  }
}

@media (max-width: 375px) {
  .reviews-invitation {
    padding: 25px 0;
  }

  .container {
    padding: 0 12px;
  }

  .title {
    font-size: 1.7rem;
  }

  .subtitle {
    font-size: 0.9rem;
  }

  .stat-number {
    font-size: 1.4rem;
  }

  .stat-label {
    font-size: 0.8rem;
  }

  .cta-button {
    padding: 12px 18px;
    font-size: 0.9rem;
  }

  .reviews-preview {
    padding: 18px;
  }

  .preview-card {
    padding: 14px;
  }

  .author-avatar {
    width: 32px;
    height: 32px;
    font-size: 0.85rem;
  }

  .review-excerpt {
    font-size: 0.82rem;
  }
}

@media (max-width: 320px) {
  .title {
    font-size: 1.6rem;
  }

  .stat-item {
    padding: 10px 0;
  }

  .stat-number {
    font-size: 1.3rem;
  }

  .reviews-preview {
    padding: 16px;
  }

  .preview-card {
    padding: 12px;
  }
}

/* Дополнительные улучшения для очень маленьких экранов */
@media (max-height: 600px) and (orientation: landscape) {
  .reviews-invitation {
    padding: 25px 0;
  }

  .invitation-content {
    gap: 30px;
  }

  .title {
    font-size: 1.8rem;
    margin-bottom: 8px;
  }

  .subtitle {
    font-size: 0.9rem;
    margin-bottom: 15px;
  }

  .stats {
    margin: 5px 0;
  }

  .preview-cards {
    gap: 12px;
  }

  .preview-card {
    padding: 12px;
  }
}

/* Поддержка темной темы */
@media (prefers-color-scheme: dark) {
  @media (max-width: 768px) {
    .reviews-preview {
      background: var(--green-bg);
      border-color: var(--green-dark);
    }

    .preview-card {
      background: var(--green-bg-light);
      border-color: var(--border-green);
    }
  }
}

/* Улучшение читаемости на мобильных устройствах */
@media (max-width: 768px) {
  .review-excerpt {
    word-break: break-word;
    overflow-wrap: break-word;
  }
}

/* Плавные переходы для респонсивных изменений */
.invitation-content,
.stats,
.cta-buttons,
.reviews-preview {
  transition: all 0.3s ease;
}

/* Отключение hover-эффектов на тач-устройствах */
@media (hover: none) {
  .cta-button:hover,
  .preview-card:hover {
    transform: none;
  }

  .cta-button.primary:hover {
    background: var(--gradient-green);
  }

  .cta-button.secondary:hover {
    background: transparent;
    color: var(--text-dark);
  }
}
</style>
