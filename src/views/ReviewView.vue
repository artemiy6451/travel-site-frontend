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
      <ReviewForm
        class="form-section"
        @review-created="handleReviewCreated"
      />

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
            @toggle="handleToggleReview"
            @delete="handleDeleteReview"
          />
        </div>

        <!-- Пагинация (только для публичных отзывов) -->
        <div v-if="!isAdmin && displayedReviews.length > 0 && hasMore" class="pagination">
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
import { useRouter } from 'vue-router'
import { api } from '@/utils/api'
import type { Review, ReviewStats, ReviewCreate } from '@/types/review'
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
const currentTab = ref<'all' | 'pending' | 'approved'>('approved')

// Пагинация (только для публичных отзывов)
const hasMore = ref(true)

// Computed
const displayedReviews = computed(() => {
  if (isAdmin.value) {
    switch (currentTab.value) {
      case 'all':
        return allReviews.value
      case 'pending':
        return pendingReviews.value.filter(r => !r.is_active)
      case 'approved':
        return approvedReviews.value.filter(r => r.is_active)
      default:
        return allReviews.value
    }
  } else {
    // Для не-админов показываем только одобренные активные отзывы
    return approvedReviews.value.filter(r => r.is_active)
  }
})

// Метод для возврата на главную
const goBack = () => {
  router.push('/')
}

// Загрузка статистики
const loadStats = async () => {
  try {
    stats.value = await api.reviews.getReviewsStats()
  } catch (error) {
    console.error('Error loading stats:', error)
  }
}

// Загрузка одобренных отзывов (публичных)
const loadApprovedReviews = async (reset = false) => {
  if (reset) {
    approvedReviews.value = []
    hasMore.value = true
  }

  if (!hasMore.value && !reset) return

  loading.value = true

  try {
    const reviews = await api.reviews.getApprovedReviews()

    if (reset) {
      approvedReviews.value = reviews
    } else {
      approvedReviews.value.push(...reviews)
    }

    hasMore.value = false

  } catch (error) {
    console.error('Error loading approved reviews:', error)
  } finally {
    loading.value = false
  }
}

// Загрузка всех админских отзывов
const loadAdminReviews = async () => {
  if (!isAdmin.value) return

  loading.value = true

  try {
    const [all, pending] = await Promise.all([
      api.reviews.getAllReviews(),
      api.reviews.getPendingReviews()
    ])

    allReviews.value = all
    pendingReviews.value = pending
    approvedReviews.value = all.filter(r => r.is_active)

  } catch (error) {
    console.error('Error loading admin reviews:', error)
  } finally {
    loading.value = false
  }
}

// Загрузка дополнительных отзывов (для пагинации)
const loadMore = () => {
  if (isAdmin.value) {
    loadAdminReviews()
  } else {
    loadApprovedReviews(false)
  }
}

// Обработчик создания отзыва
const handleReviewCreated = async (reviewData: ReviewCreate) => {
  try {
    const newReview = await api.reviews.createReview(reviewData)
    await loadStats()
    if (isAdmin.value) {
      await loadAdminReviews()
    }
    alert('Отзыв успешно отправлен на модерацию!')
  } catch (error) {
    console.error('Error creating review:', error)
    alert('Ошибка при отправке отзыва')
  }
}

// Обработчик переключения статуса отзыва
const handleToggleReview = async (reviewId: number) => {
  try {
    await api.reviews.toggleReview(reviewId)
    await loadStats()
    if (isAdmin.value) {
      await loadAdminReviews()
    } else {
      await loadApprovedReviews(true)
    }
  } catch (error) {
    console.error('Error toggling review:', error)
    alert('Ошибка при изменении статуса отзыва')
  }
}

// Обработчик удаления отзыва
const handleDeleteReview = async (reviewId: number) => {
  if (!confirm('Вы уверены, что хотите удалить этот отзыв?')) return

  try {
    await api.reviews.deleteReview(reviewId)
    await loadStats()
    if (isAdmin.value) {
      await loadAdminReviews()
    } else {
      await loadApprovedReviews(true)
    }
    alert('Отзыв успешно удален')
  } catch (error) {
    console.error('Error deleting review:', error)
    alert('Ошибка при удалении отзыва')
  }
}

// Проверка прав администратора
const checkAdminAccess = async () => {
  try {
    await api.reviews.getAllReviews()
    isAdmin.value = true
    currentTab.value = 'all'
  } catch (error: any) {
    if (error.response?.status === 401 || error.response?.status === 403) {
      isAdmin.value = false
      currentTab.value = 'approved'
    } else {
      console.error('Error checking admin access:', error)
      isAdmin.value = false
    }
  }
}

// Инициализация
onMounted(async () => {
  await checkAdminAccess()
  await loadStats()

  if (isAdmin.value) {
    await loadAdminReviews()
  } else {
    await loadApprovedReviews(true)
  }
})
</script>

<style scoped>
.reviews-page {
  padding: 40px 0;
  background: var(--green-bg);
  min-height: 100vh;
}

.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 20px;
}

.page-header {
  margin-bottom: 40px;
}

.header-top {
  margin-bottom: 20px;
}

.back-button {
  display: flex;
  align-items: center;
  gap: 8px;
  background: var(--green-bg-light);
  border: 1px solid var(--border-green);
  border-radius: 8px;
  color: var(--text-medium);
  font-size: 16px;
  cursor: pointer;
  padding: 10px 16px;
  transition: all 0.3s;
}

.back-button:hover {
  background: var(--hover-green);
  color: var(--text-dark);
  border-color: var(--border-green-medium);
  transform: translateX(-2px);
}

.back-icon {
  font-size: 20px;
}

.header-content {
  text-align: center;
  padding: 20px 0;
}

.page-title {
  font-size: 2.5rem;
  font-weight: 700;
  margin-bottom: 16px;
  color: var(--text-dark);
  background: var(--gradient-green);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.page-subtitle {
  font-size: 1.2rem;
  color: var(--text-medium);
  max-width: 600px;
  margin: 0 auto;
  line-height: 1.6;
}

.stats-section {
  margin: 40px 0;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 20px;
  max-width: 900px;
  margin: 0 auto;
}

.stat-card {
  background: var(--white);
  border-radius: 16px;
  padding: 30px 20px;
  text-align: center;
  box-shadow: 0 8px 32px var(--shadow-green-light);
  border: 1px solid var(--border-green);
  transition: all 0.3s;
  position: relative;
  overflow: hidden;
}

.stat-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 4px;
  background: var(--gradient-green);
}

.stat-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 12px 40px var(--shadow-green);
}

.stat-value {
  font-size: 3rem;
  font-weight: 700;
  color: var(--green-primary);
  margin-bottom: 8px;
  line-height: 1;
}

.stat-label {
  font-size: 15px;
  color: var(--text-medium);
  text-transform: uppercase;
  letter-spacing: 1px;
  font-weight: 600;
}

.form-section {
  margin: 50px 0;
  max-width: 800px;
  margin-left: auto;
  margin-right: auto;
}

.reviews-section {
  margin: 60px 0;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 40px;
  flex-wrap: wrap;
  gap: 20px;
  padding-bottom: 20px;
  border-bottom: 2px solid var(--border-green);
}

.section-title {
  font-size: 1.8rem;
  font-weight: 700;
  color: var(--text-dark);
  margin: 0;
  padding: 0;
}

.admin-tabs {
  display: flex;
  gap: 8px;
  background: var(--green-bg-light);
  padding: 6px;
  border-radius: 12px;
  border: 1px solid var(--border-green);
}

.tab-btn {
  padding: 10px 20px;
  border: none;
  background: transparent;
  border-radius: 8px;
  cursor: pointer;
  font-size: 15px;
  font-weight: 600;
  color: var(--text-medium);
  transition: all 0.3s;
  white-space: nowrap;
}

.tab-btn:hover {
  background: var(--hover-green);
  color: var(--text-dark);
}

.tab-btn.active {
  background: var(--white);
  color: var(--green-primary);
  box-shadow: 0 4px 12px var(--shadow-green-light);
  border: 1px solid var(--border-green);
}

.loading-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 80px 20px;
  color: var(--text-medium);
}

.loading-spinner {
  width: 50px;
  height: 50px;
  border: 4px solid var(--green-bg-light);
  border-top: 4px solid var(--green-primary);
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 24px;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.empty-state {
  text-align: center;
  padding: 80px 20px;
  color: var(--text-light);
  background: var(--white);
  border-radius: 20px;
  border: 2px dashed var(--border-green);
  max-width: 500px;
  margin: 0 auto;
}

.empty-icon {
  font-size: 64px;
  margin-bottom: 24px;
  opacity: 0.7;
}

.empty-state h3 {
  font-size: 1.5rem;
  font-weight: 700;
  margin-bottom: 16px;
  color: var(--text-dark);
}

.empty-state p {
  font-size: 1.1rem;
  color: var(--text-medium);
  margin: 0;
}

.reviews-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(380px, 1fr));
  gap: 30px;
  margin-bottom: 50px;
}

.pagination {
  text-align: center;
  padding: 30px 0;
}

.load-more-btn {
  padding: 16px 40px;
  background: var(--gradient-green);
  color: var(--white);
  border: none;
  border-radius: 12px;
  font-size: 1.1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s;
  box-shadow: 0 6px 20px var(--shadow-green);
}

.load-more-btn:hover:not(:disabled) {
  background: var(--gradient-green-hover);
  transform: translateY(-2px);
  box-shadow: 0 8px 25px var(--shadow-green-strong);
}

.load-more-btn:active:not(:disabled) {
  transform: translateY(0);
}

.load-more-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  transform: none !important;
}

@media (max-width: 768px) {
  .reviews-page {
    padding: 20px 0;
  }

  .page-title {
    font-size: 2rem;
  }

  .page-subtitle {
    font-size: 1.1rem;
    padding: 0 10px;
  }

  .section-header {
    flex-direction: column;
    align-items: stretch;
  }

  .admin-tabs {
    width: 100%;
    overflow-x: auto;
    padding: 4px;
  }

  .tab-btn {
    padding: 8px 16px;
    font-size: 14px;
    flex: 1;
    min-width: fit-content;
  }

  .reviews-grid {
    grid-template-columns: 1fr;
    gap: 20px;
  }

  .stat-card {
    padding: 24px 16px;
  }

  .stat-value {
    font-size: 2.5rem;
  }
}

@media (max-width: 480px) {
  .container {
    padding: 0 16px;
  }

  .page-title {
    font-size: 1.8rem;
  }

  .section-title {
    font-size: 1.5rem;
  }

  .stats-grid {
    grid-template-columns: repeat(2, 1fr);
    gap: 16px;
  }

  .stat-value {
    font-size: 2rem;
  }

  .stat-label {
    font-size: 13px;
  }
}
</style>
