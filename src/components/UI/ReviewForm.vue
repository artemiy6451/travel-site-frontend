<template>
  <form @submit.prevent="handleSubmit" class="review-form">
    <div class="form-header">
      <h3 class="form-title">Оставьте свой отзыв</h3>
      <p class="form-subtitle">Поделитесь своими впечатлениями о нашей экскурсии</p>
    </div>

    <div class="form-content">
      <div class="form-row">
        <div class="form-group">
          <label for="name" class="form-label">
            Ваше имя *
            <span class="required-dot"></span>
          </label>
          <input
            id="name"
            v-model="form.author_name"
            type="text"
            required
            maxlength="100"
            placeholder="Как вас зовут?"
            :disabled="loading"
            class="form-input"
          />
          <div class="input-hint">Максимум 100 символов</div>
        </div>

        <div class="form-group">
          <label for="email" class="form-label">
            Email *
            <span class="required-dot"></span>
          </label>
          <input
            id="email"
            v-model="form.email"
            type="email"
            required
            placeholder="Ваш email"
            :disabled="loading"
            class="form-input"
          />
          <div class="input-hint">Email не будет опубликован</div>
        </div>
      </div>

      <div class="form-group">
        <label class="form-label">
          Ваша оценка *
          <span class="required-dot"></span>
        </label>
        <div class="rating-container">
          <div class="rating-input">
            <button
              v-for="n in 5"
              :key="n"
              type="button"
              @click="form.rating = n"
              class="star-btn"
              :class="{ active: n <= form.rating }"
              :disabled="loading"
              :aria-label="`Оценка ${n} звезд`"
            >
              <span class="star-icon">{{ n <= form.rating ? '★' : '☆' }}</span>
              <span class="star-number">{{ n }}</span>
            </button>
          </div>
          <div class="rating-hint">Кликните на звезду для выбора оценки</div>
        </div>
      </div>

      <div class="form-group">
        <label for="text" class="form-label">
          Текст отзыва *
          <span class="required-dot"></span>
        </label>
        <textarea
          id="text"
          v-model="form.text"
          required
          rows="6"
          maxlength="2000"
          placeholder="Расскажите о своих впечатлениях, что понравилось больше всего, какие были эмоции..."
          :disabled="loading"
          class="form-textarea"
        ></textarea>
        <div class="textarea-footer">
          <div class="char-counter">
            {{ form.text.length }}/2000
          </div>
          <div class="text-hint">Минимум 10 символов</div>
        </div>
      </div>

      <button
        type="submit"
        class="submit-btn"
        :disabled="loading || !isFormValid"
        :class="{ 'loading': loading }"
      >
        <span v-if="loading" class="btn-loading">
          <span class="loading-dots"></span>
          Отправка...
        </span>
        <span v-else class="btn-text">
          <span class="btn-icon">📝</span>
          Отправить отзыв
        </span>
      </button>
    </div>

    <div class="form-footer">
      <p class="privacy-note">
        Отправляя отзыв, вы соглашаетесь с обработкой ваших персональных данных.
        Отзывы проходят модерацию перед публикацией.
      </p>
    </div>
  </form>
</template>

<script setup lang="ts">
import { ref, computed, defineEmits } from 'vue'
import type { ReviewCreate } from '@/types/review'

const emit = defineEmits<{
  reviewCreated: [review: ReviewCreate]
}>()

const loading = ref(false)

const form = ref<ReviewCreate>({
  author_name: '',
  email: '',
  rating: 5,
  text: '',
})

const isFormValid = computed(() => {
  return (
    form.value.author_name.trim().length > 0 &&
    form.value.email.includes('@') &&
    form.value.rating >= 1 &&
    form.value.rating <= 5 &&
    form.value.text.trim().length >= 10
  )
})

const handleSubmit = async () => {
  if (!isFormValid.value) return

  loading.value = true

  try {
    emit('reviewCreated', { ...form.value })
    form.value = {
      author_name: '',
      email: '',
      rating: 5,
      text: '',
    }
  } catch (error) {
    console.error('Error in form:', error)
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.review-form {
  background: var(--white);
  border-radius: 24px;
  padding: 40px;
  box-shadow: 0 16px 48px var(--shadow-green-light);
  border: 1px solid var(--border-green);
  max-width: 800px;
  margin: 0 auto;
  position: relative;
  overflow: hidden;
}

.review-form::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 6px;
  background: var(--gradient-green);
}

.form-header {
  text-align: center;
  margin-bottom: 40px;
  padding-bottom: 20px;
  border-bottom: 1px solid var(--border-green);
}

.form-title {
  font-size: 2rem;
  font-weight: 700;
  color: var(--text-dark);
  margin-bottom: 12px;
  background: var(--gradient-green);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.form-subtitle {
  font-size: 1.1rem;
  color: var(--text-medium);
  margin: 0;
  line-height: 1.5;
}

.form-content {
  display: flex;
  flex-direction: column;
  gap: 32px;
}

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 24px;
}

@media (max-width: 768px) {
  .form-row {
    grid-template-columns: 1fr;
    gap: 20px;
  }
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.form-label {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 1rem;
  font-weight: 600;
  color: var(--text-dark);
  margin: 0;
}

.required-dot {
  width: 6px;
  height: 6px;
  background: var(--accent-error);
  border-radius: 50%;
  display: inline-block;
}

.form-input,
.form-textarea {
  width: 100%;
  padding: 16px;
  background: var(--green-bg);
  border: 2px solid var(--border-green);
  border-radius: 12px;
  font-size: 1rem;
  font-family: inherit;
  color: var(--text-dark);
  transition: all 0.3s;
}

.form-input:focus,
.form-textarea:focus {
  outline: none;
  border-color: var(--green-primary);
  background: var(--white);
  box-shadow: 0 0 0 4px var(--hover-green);
}

.form-input:disabled,
.form-textarea:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  background: var(--green-bg-light);
}

.input-hint {
  font-size: 0.85rem;
  color: var(--text-light);
  margin-top: 4px;
}

.rating-container {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.rating-input {
  display: flex;
  gap: 4px;
  justify-content: center;
}

.star-btn {
  background: var(--green-bg);
  border: 2px solid var(--border-green);
  border-radius: 12px;
  padding: 16px;
  cursor: pointer;
  transition: all 0.3s;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  min-width: 70px;
}

.star-btn:hover:not(:disabled) {
  background: var(--hover-green);
  border-color: var(--green-light);
  transform: translateY(-2px);
}

.star-btn.active {
  background: linear-gradient(135deg, var(--green-bg) 0%, var(--green-lightest) 100%);
  border-color: var(--green-primary);
  box-shadow: 0 4px 12px var(--shadow-green-light);
}

.star-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.star-icon {
  font-size: 2.5rem;
  color: var(--text-light);
  transition: all 0.3s;
}

.star-btn.active .star-icon {
  color: var(--accent-warning);
  text-shadow: 0 0 10px rgba(242, 201, 76, 0.3);
}

.star-number {
  font-size: 0.9rem;
  font-weight: 600;
  color: var(--text-medium);
  transition: all 0.3s;
}

.star-btn.active .star-number {
  color: var(--green-primary);
}

.rating-hint {
  font-size: 0.9rem;
  color: var(--text-light);
  text-align: center;
  font-style: italic;
}

.form-textarea {
  resize: vertical;
  min-height: 150px;
  line-height: 1.6;
}

.textarea-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 8px;
}

.char-counter {
  font-size: 0.9rem;
  font-weight: 600;
  color: var(--text-light);
}

.text-hint {
  font-size: 0.85rem;
  color: var(--text-light);
  font-style: italic;
}

.submit-btn {
  padding: 20px 40px;
  background: var(--gradient-green);
  color: var(--white);
  border: none;
  border-radius: 16px;
  font-size: 1.1rem;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.3s;
  margin-top: 20px;
  box-shadow: 0 8px 24px var(--shadow-green);
  position: relative;
  overflow: hidden;
}

.submit-btn::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
  transition: 0.5s;
}

.submit-btn:hover:not(:disabled)::before {
  left: 100%;
}

.submit-btn:hover:not(:disabled) {
  background: var(--gradient-green-hover);
  transform: translateY(-2px);
  box-shadow: 0 12px 32px var(--shadow-green-strong);
}

.submit-btn:active:not(:disabled) {
  transform: translateY(0);
}

.submit-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  transform: none !important;
}

.submit-btn.loading {
  background: var(--green-bg);
  color: var(--text-medium);
}

.btn-text {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
}

.btn-icon {
  font-size: 1.2rem;
}

.btn-loading {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
}

.loading-dots {
  display: inline-block;
  width: 20px;
  height: 20px;
  position: relative;
}

.loading-dots::after {
  content: '';
  position: absolute;
  width: 8px;
  height: 8px;
  background: var(--green-primary);
  border-radius: 50%;
  animation: loadingDots 1.4s infinite;
}

@keyframes loadingDots {
  0%, 100% { transform: translateX(-12px); }
  50% { transform: translateX(12px); }
}

.form-footer {
  margin-top: 40px;
  padding-top: 20px;
  border-top: 1px solid var(--border-green);
  text-align: center;
}

.privacy-note {
  font-size: 0.85rem;
  color: var(--text-light);
  line-height: 1.6;
  margin: 0;
  font-style: italic;
}

@media (max-width: 768px) {
  .review-form {
    padding: 30px 24px;
    border-radius: 20px;
  }

  .form-title {
    font-size: 1.7rem;
  }

  .form-subtitle {
    font-size: 1rem;
  }

  .form-content {
    gap: 28px;
  }

  .star-btn {
    padding: 14px;
    min-width: 60px;
  }

  .star-icon {
    font-size: 2rem;
  }

  .submit-btn {
    padding: 18px 32px;
    font-size: 1rem;
  }
}

@media (max-width: 480px) {
  .review-form {
    padding: 24px 20px;
    border-radius: 16px;
  }

  .form-title {
    font-size: 1.5rem;
  }

  .form-subtitle {
    font-size: 0.95rem;
  }

  .rating-input {
    flex-wrap: wrap;
    justify-content: space-between;
  }

  .star-btn {
    flex: 1;
    min-width: calc(20% - 4px);
    padding: 12px 8px;
  }

  .star-icon {
    font-size: 1.8rem;
  }

  .star-number {
    font-size: 0.8rem;
  }

  .submit-btn {
    padding: 16px 24px;
    font-size: 1rem;
  }
}
</style>
