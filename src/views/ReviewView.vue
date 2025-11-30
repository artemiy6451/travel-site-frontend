<template>
  <div class="reviews-page">
    <div class="container">
      <!-- Хедер с кнопкой назад -->
      <div class="page-header">
        <div class="header-top">
          <button @click="goBack" class="back-button">
            <span class="back-icon">←</span>
            Назад
          </button>
        </div>

        <div class="header-content">
          <h1 class="page-title">Отзывы наших гостей</h1>
          <p class="page-subtitle">
            Что говорят путешественники о наших экскурсиях по Крыму
          </p>
        </div>
      </div>

      <!-- Остальной код остается без изменений -->
      <!-- Статистика -->
      <div v-if="stats" class="stats-section">
        <div class="stats-grid">
          <div class="stat-card">
            <div class="stat-value">{{ stats.total }}</div>
            <div class="stat-label">Всего отзывов</div>
          </div>
          <div class="stat-card">
            <div class="stat-value">{{ stats.average_rating.toFixed(1) }}</div>
            <div class="stat-label">Средний рейтинг</div>
          </div>
        </div>
      </div>

      <!-- Форма отзыва -->
      <ReviewForm class="form-section" />

      <!-- Список отзывов -->
      <div class="reviews-section">
        <div class="section-header">
          <h2 class="section-title">
            {{ isAdmin ? 'Все отзывы' : 'Отзывы путешественников' }}
          </h2>

          <div v-if="isAdmin" class="admin-tabs">
            <button
              @click="currentTab = 'all'"
              :class="{ active: currentTab === 'all' }"
              class="tab-btn"
            >
              Все ({{ allReviews.length }})
            </button>
            <button
              @click="currentTab = 'pending'"
              :class="{ active: currentTab === 'pending' }"
              class="tab-btn"
            >
              На модерации ({{ pendingReviews.length }})
            </button>
            <button
              @click="currentTab = 'approved'"
              :class="{ active: currentTab === 'approved' }"
              class="tab-btn"
            >
              Одобренные ({{ approvedReviews.length }})
            </button>
          </div>
        </div>

        <!-- Состояние загрузки -->
        <div v-if="loading" class="loading-state">
          <div class="loading-spinner"></div>
          <span>Загрузка отзывов...</span>
        </div>

        <!-- Пустое состояние -->
        <div v-else-if="displayedReviews.length === 0" class="empty-state">
          <div class="empty-icon">💬</div>
          <h3>Отзывов пока нет</h3>
          <p>Будьте первым, кто оставит отзыв!</p>
        </div>

        <!-- Список отзывов -->
        <div v-else class="reviews-grid">
          <ReviewCard
            v-for="review in displayedReviews"
            :key="review.id"
            :review="review"
            :is-admin="isAdmin"
            @approve="handleApproveReview"
            @hide="handleHideReview"
            @show="handleShowReview"
            @delete="handleDeleteReview"
          />
        </div>

        <!-- Пагинация -->
        <div v-if="displayedReviews.length > 0 && hasMore" class="pagination">
          <button
            @click="loadMore"
            :disabled="loading"
            class="load-more-btn"
          >
            <span v-if="loading">Загрузка...</span>
            <span v-else>Показать еще</span>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router' // Добавляем useRouter
import { api } from '@/utils/api'
import type { Review, ReviewStats } from '@/types/review'
import ReviewForm from '@/components/UI/ReviewForm.vue'
import ReviewCard from '@/components/UI/ReviewCard.vue'

// Добавляем router
const router = useRouter()

// Данные
const allReviews = ref<Review[]>([])
const pendingReviews = ref<Review[]>([])
const approvedReviews = ref<Review[]>([])
const stats = ref<ReviewStats | null>(null)
const loading = ref(false)
const isAdmin = ref(false)
const currentTab = ref<'all' | 'pending' | 'approved'>('all')

// Пагинация
const limit = 10
const skip = ref(0)
const hasMore = ref(true)

// Computed
const displayedReviews = computed(() => {
  switch (currentTab.value) {
    case 'all':
      return allReviews.value
    case 'pending':
      return pendingReviews.value
    case 'approved':
      return approvedReviews.value
    default:
      return allReviews.value
  }
})

// Метод для возврата на главную
const goBack = () => {
  router.push('/')
}

// Остальные методы остаются без изменений
const loadStats = async () => {
  try {
    stats.value = await api.getReviewsStats()
  } catch (error) {
    console.error('Error loading stats:', error)
  }
}

const loadReviews = async (reset = false) => {
  if (reset) {
    allReviews.value = []
    skip.value = 0
    hasMore.value = true
  }

  if (!hasMore.value && !reset) return

  loading.value = true

  try {
    const params = { limit, skip: skip.value }
    const reviews = await api.getReviews(params)

    if (reset) {
      allReviews.value = reviews
    } else {
      allReviews.value.push(...reviews)
    }

    hasMore.value = reviews.length === limit
    skip.value += reviews.length

    // Фильтруем для админских вкладок
    if (isAdmin.value) {
      pendingReviews.value = allReviews.value.filter(r => !r.is_approved)
      approvedReviews.value = allReviews.value.filter(r => r.is_approved && r.is_active)
    }

  } catch (error) {
    console.error('Error loading reviews:', error)
  } finally {
    loading.value = false
  }
}

const loadAdminReviews = async () => {
  if (!isAdmin.value) return

  try {
    const [all, pending] = await Promise.all([
      api.getAllReviews(),
      api.getPendingReviews()
    ])

    allReviews.value = all
    pendingReviews.value = pending
    approvedReviews.value = all.filter(r => r.is_approved && r.is_active)

  } catch (error) {
    console.error('Error loading admin reviews:', error)
  }
}

const loadMore = () => {
  loadReviews(false)
}

const handleApproveReview = async (reviewId: number) => {
  try {
    await api.approveReview(reviewId)
    await Promise.all([loadStats(), loadAdminReviews()])
  } catch (error) {
    console.error('Error approving review:', error)
    alert('Ошибка при одобрении отзыва')
  }
}

const handleHideReview = async (reviewId: number) => {
  try {
    await api.hideReview(reviewId)
    await Promise.all([loadStats(), loadAdminReviews()])
  } catch (error) {
    console.error('Error hiding review:', error)
    alert('Ошибка при скрытии отзыва')
  }
}

const handleShowReview = async (reviewId: number) => {
  try {
    await api.showReview(reviewId)
    await Promise.all([loadStats(), loadAdminReviews()])
  } catch (error) {
    console.error('Error showing review:', error)
    alert('Ошибка при показе отзыва')
  }
}

const handleDeleteReview = async (reviewId: number) => {
  if (!confirm('Вы уверены, что хотите удалить этот отзыв?')) return

  try {
    await api.deleteReview(reviewId)
    await Promise.all([loadStats(), loadAdminReviews()])
  } catch (error) {
    console.error('Error deleting review:', error)
    alert('Ошибка при удалении отзыва')
  }
}

const checkAdminAccess = async () => {
  try {
    isAdmin.value = await api.checkAdminAccess()
  } catch {
    isAdmin.value = false
  }
}

// Инициализация
onMounted(async () => {
  await checkAdminAccess()
  await loadStats()

  if (isAdmin.value) {
    await loadAdminReviews()
  } else {
    await loadReviews(true)
  }
})
</script>

<style scoped>
.reviews-page {
  min-height: 100vh;
  background: var(--green-bg);
  padding: 40px 0;
}

.container {
  max-width: 1000px;
  margin: 0 auto;
  padding: 0 20px;
}

/* Новые стили для хедера с кнопкой назад */
.page-header {
  margin-bottom: 50px;
}

.header-top {
  margin-bottom: 20px;
}

.back-button {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 10px 16px;
  background: var(--white);
  border: 1px solid var(--border-green);
  border-radius: 8px;
  color: var(--text-dark);
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
  text-decoration: none;
  font-size: 0.95rem;
}

.back-button:hover {
  background: var(--green-bg-light);
  transform: translateY(-1px);
  box-shadow: 0 4px 12px var(--shadow-green-light);
}

.back-icon {
  font-size: 1.1rem;
  font-weight: 600;
}

.header-content {
  text-align: center;
}

.page-title {
  font-size: 3rem;
  font-weight: 700;
  color: var(--text-dark);
  margin-bottom: 16px;
}

.page-subtitle {
  font-size: 1.2rem;
  color: var(--text-medium);
  max-width: 600px;
  margin: 0 auto;
  line-height: 1.6;
}

/* Статистика */
.stats-section {
  margin-bottom: 50px;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 20px;
}

.stat-card {
  background: var(--white);
  padding: 25px;
  border-radius: 12px;
  text-align: center;
  border: 1px solid var(--border-green);
  box-shadow: 0 2px 8px var(--shadow-green-light);
}

.stat-value {
  font-size: 2.5rem;
  font-weight: 700;
  color: var(--green-primary);
  margin-bottom: 8px;
}

.stat-label {
  color: var(--text-medium);
  font-weight: 500;
}

/* Форма */
.form-section {
  margin-bottom: 60px;
}

/* Секция отзывов */
.reviews-section {
  margin-bottom: 40px;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 30px;
  flex-wrap: wrap;
  gap: 20px;
}

.section-title {
  font-size: 2rem;
  font-weight: 600;
  color: var(--text-dark);
  margin: 0;
}

.admin-tabs {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
}

.tab-btn {
  padding: 8px 16px;
  border: 1px solid var(--border-green);
  background: var(--white);
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.3s ease;
  font-size: 0.9rem;
}

.tab-btn.active {
  background: var(--green-primary);
  color: var(--white);
  border-color: var(--green-primary);
}

.tab-btn:hover:not(.active) {
  background: var(--green-bg-light);
}

/* Состояния */
.loading-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
  padding: 60px 20px;
  color: var(--text-light);
}

.loading-spinner {
  width: 40px;
  height: 40px;
  border: 3px solid var(--green-light);
  border-top: 3px solid var(--green-primary);
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.empty-state {
  text-align: center;
  padding: 60px 20px;
  color: var(--text-light);
}

.empty-icon {
  font-size: 4rem;
  margin-bottom: 20px;
}

.empty-state h3 {
  color: var(--text-medium);
  margin-bottom: 10px;
}

/* Сетка отзывов */
.reviews-grid {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

/* Пагинация */
.pagination {
  display: flex;
  justify-content: center;
  margin-top: 40px;
}

.load-more-btn {
  background: var(--green-bg-light);
  border: 1px solid var(--border-green);
  color: var(--text-dark);
  padding: 12px 24px;
  border-radius: 8px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
}

.load-more-btn:hover:not(:disabled) {
  background: var(--green-lightest);
  transform: translateY(-2px);
}

.load-more-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  transform: none;
}

/* Адаптивность */
@media (max-width: 768px) {
  .reviews-page {
    padding: 30px 0;
  }

  .page-title {
    font-size: 2.2rem;
  }

  .page-subtitle {
    font-size: 1.1rem;
  }

  .stats-grid {
    grid-template-columns: repeat(2, 1fr);
  }

  .stat-card {
    padding: 20px;
  }

  .stat-value {
    font-size: 2rem;
  }

  .section-header {
    flex-direction: column;
    align-items: flex-start;
  }

  .admin-tabs {
    width: 100%;
    justify-content: center;
  }

  .back-button {
    padding: 8px 14px;
    font-size: 0.9rem;
  }
}

@media (max-width: 480px) {
  .reviews-page {
    padding: 20px 0;
  }

  .page-title {
    font-size: 1.8rem;
  }

  .stats-grid {
    grid-template-columns: 1fr;
  }

  .container {
    padding: 0 16px;
  }

  .back-button {
    width: 100%;
    justify-content: center;
  }
}
</style>
