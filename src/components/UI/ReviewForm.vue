<template>
  <div class="review-form">
    <h3 class="form-title">Оставить отзыв</h3>

    <form @submit.prevent="submitReview" class="form">
      <div class="form-row">
        <div class="form-group">
          <label for="author_name" class="label">Ваше имя *</label>
          <input
            id="author_name"
            v-model="formData.author_name"
            type="text"
            class="input"
            required
            maxlength="100"
            placeholder="Как к вам обращаться?"
          >
        </div>

        <div class="form-group">
          <label for="email" class="label">Email *</label>
          <input
            id="email"
            v-model="formData.email"
            type="email"
            class="input"
            required
            maxlength="100"
            placeholder="your@email.com"
          >
        </div>
      </div>

      <div class="form-group">
        <label class="label">Оценка *</label>
        <div class="rating-stars">
          <button
            v-for="star in 5"
            :key="star"
            type="button"
            class="star-button"
            :class="{ active: star <= formData.rating }"
            @click="formData.rating = star"
          >
            ⭐
          </button>
        </div>
        <div class="rating-text">
          {{ getRatingText(formData.rating) }}
        </div>
      </div>

      <div class="form-group">
        <label for="text" class="label">Ваш отзыв *</label>
        <textarea
          id="text"
          v-model="formData.text"
          class="textarea"
          required
          rows="5"
          maxlength="2000"
          placeholder="Поделитесь своими впечатлениями о экскурсии..."
        ></textarea>
        <div class="char-count">{{ formData.text.length }}/2000</div>
      </div>

      <button
        type="submit"
        class="submit-button"
        :disabled="loading || !isFormValid"
      >
        <span v-if="loading">Отправка...</span>
        <span v-else>Отправить отзыв</span>
      </button>
    </form>

    <!-- Уведомления -->
    <div v-if="success" class="success-message">
      ✅ Спасибо! Ваш отзыв отправлен на модерацию.
    </div>

    <div v-if="error" class="error-message">
      ❌ {{ error }}
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed } from 'vue'
import { api } from '@/utils/api'
import type { ReviewCreate } from '@/types/review'

interface Props {
  excursionId?: number
}

const props = defineProps<Props>()

const loading = ref(false)
const success = ref(false)
const error = ref('')

const formData = reactive<ReviewCreate>({
  author_name: '',
  email: '',
  rating: 5,
  text: '',
  excursion_id: props.excursionId
})

const isFormValid = computed(() => {
  return formData.author_name.trim() &&
         formData.email.trim() &&
         formData.text.trim() &&
         formData.rating > 0
})

const getRatingText = (rating: number) => {
  const texts = ['', 'Ужасно', 'Плохо', 'Нормально', 'Хорошо', 'Отлично']
  return texts[rating] || ''
}

const submitReview = async () => {
  if (!isFormValid.value) return

  loading.value = true
  error.value = ''

  try {
    await api.createReview({
      author_name: formData.author_name.trim(),
      email: formData.email.trim(),
      text: formData.text.trim(),
      rating: formData.rating,
      excursion_id: props.excursionId
    })

    success.value = true
    // Сбрасываем форму
    Object.assign(formData, {
      author_name: '',
      email: '',
      text: '',
      rating: 5,
      excursion_id: props.excursionId
    })

    // Через 5 секунд скрываем сообщение об успехе
    setTimeout(() => {
      success.value = false
    }, 5000)

  } catch (err: any) {
    error.value = err.message || 'Произошла ошибка при отправке отзыва'
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.review-form {
  background: var(--white);
  padding: 30px;
  border-radius: 16px;
  border: 1px solid var(--border-green);
  box-shadow: 0 4px 20px var(--shadow-green-light);
}

.form-title {
  font-size: 1.5rem;
  font-weight: 600;
  color: var(--text-dark);
  margin-bottom: 25px;
  text-align: center;
}

.form {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.label {
  font-weight: 600;
  color: var(--text-dark);
  font-size: 0.9rem;
}

.input, .textarea {
  padding: 12px 16px;
  border: 1px solid var(--border-light);
  border-radius: 8px;
  font-size: 1rem;
  transition: all 0.3s ease;
  background: var(--white);
}

.input:focus, .textarea:focus {
  outline: none;
  border-color: var(--green-primary);
  box-shadow: 0 0 0 3px var(--shadow-green-light);
}

.textarea {
  resize: vertical;
  min-height: 120px;
  font-family: inherit;
}

.char-count {
  text-align: right;
  font-size: 0.8rem;
  color: var(--text-light);
  margin-top: 4px;
}

.rating-stars {
  display: flex;
  gap: 8px;
}

.star-button {
  background: none;
  border: none;
  font-size: 2rem;
  cursor: pointer;
  transition: transform 0.2s ease;
  opacity: 0.3;
}

.star-button.active {
  opacity: 1;
}

.star-button:hover {
  transform: scale(1.2);
}

.rating-text {
  font-size: 0.9rem;
  color: var(--text-medium);
  font-weight: 500;
  margin-top: 4px;
}

.submit-button {
  background: var(--gradient-green);
  color: var(--white);
  border: none;
  padding: 14px 28px;
  border-radius: 8px;
  font-weight: 600;
  font-size: 1rem;
  cursor: pointer;
  transition: all 0.3s ease;
  margin-top: 10px;
}

.submit-button:hover:not(:disabled) {
  background: var(--gradient-green-hover);
  transform: translateY(-2px);
  box-shadow: 0 8px 25px var(--shadow-green-strong);
}

.submit-button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  transform: none;
}

.success-message {
  background: var(--green-bg-light);
  border: 1px solid var(--green-light);
  color: var(--green-darker);
  padding: 16px;
  border-radius: 8px;
  margin-top: 20px;
  text-align: center;
  font-weight: 500;
}

.error-message {
  background: #fdf2f2;
  border: 1px solid #f5c6cb;
  color: #dc3545;
  padding: 16px;
  border-radius: 8px;
  margin-top: 20px;
  text-align: center;
  font-weight: 500;
}

/* Адаптивность */
@media (max-width: 768px) {
  .review-form {
    padding: 20px;
  }

  .form-row {
    grid-template-columns: 1fr;
    gap: 15px;
  }

  .star-button {
    font-size: 1.7rem;
  }
}
</style>
