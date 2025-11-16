<template>
  <div class="not-found-page">
    <div class="not-found-container">
      <div class="not-found-card">
        <!-- Анимированная иконка -->
        <div class="not-found-icon">
          <div class="icon-animation">🔍</div>
        </div>

        <!-- Основной контент -->
        <div class="not-found-content">
          <h1 class="not-found-title">Страница не найдена</h1>
          <p class="not-found-description">
            К сожалению, запрашиваемая страница не существует или была перемещена.
          </p>
          <p class="not-found-subtext">Ошибка 404</p>
        </div>

        <!-- Действия -->
        <div class="not-found-actions">
          <BaseButton @click="goHome" variant="primary" size="lg" icon="🏠" class="action-btn">
            На главную
          </BaseButton>

          <BaseButton @click="goBack" variant="secondary" size="lg" icon="↩️" class="action-btn">
            Вернуться назад
          </BaseButton>

          <BaseButton
            v-if="showExcursions"
            @click="goToExcursions"
            variant="success"
            size="lg"
            icon="🗺️"
            class="action-btn"
          >
            Смотреть экскурсии
          </BaseButton>
        </div>

        <!-- Дополнительная информация -->
        <div class="not-found-help">
          <p>
            Нужна помощь? <a href="#" @click.prevent="contactSupport">Свяжитесь с поддержкой</a>
          </p>
        </div>
      </div>

      <!-- Декоративные элементы -->
      <div class="decoration decoration-1">🌿</div>
      <div class="decoration decoration-2">🍃</div>
      <div class="decoration decoration-3">🌱</div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import BaseButton from '@/components/UI/BaseButton.vue'

const router = useRouter()
const route = useRoute()

// Показывать ли кнопку экскурсий (можно определить по текущему маршруту)
const showExcursions = ref(true)

// Переход на главную
const goHome = () => {
  router.push('/')
}

// Возврат назад
const goBack = () => {
  if (window.history.length > 1) {
    router.back()
  } else {
    router.push('/')
  }
}

// Переход к экскурсиям
const goToExcursions = () => {
  router.push('/')
}

// Связь с поддержкой
const contactSupport = () => {
  // Можно открыть модальное окно, отправить email или перейти на страницу контактов
  window.open('https://vk.com/vvvectaa', '_blank')
}

// Логирование 404 ошибки для аналитики
onMounted(() => {
  console.warn(`404 Page Not Found: ${route.fullPath}`)
})
</script>

<style scoped>
.not-found-page {
  min-height: 100vh;
  background: linear-gradient(135deg, var(--green-bg) 0%, var(--green-bg-light) 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
  position: relative;
  overflow: hidden;
}

.not-found-container {
  width: 100%;
  max-width: 600px;
  position: relative;
  z-index: 2;
}

.not-found-card {
  background: var(--white);
  padding: 60px 40px;
  border-radius: 24px;
  box-shadow:
    0 20px 60px var(--shadow-green-light),
    0 8px 20px var(--shadow-default);
  border: 1px solid var(--border-green);
  text-align: center;
  position: relative;
  backdrop-filter: blur(10px);
}

/* Анимированная иконка */
.not-found-icon {
  margin-bottom: 30px;
}

.icon-animation {
  font-size: 5rem;
  animation:
    float 3s ease-in-out infinite,
    glow 2s ease-in-out infinite alternate;
}

@keyframes float {
  0%,
  100% {
    transform: translateY(0px) rotate(0deg);
  }
  50% {
    transform: translateY(-10px) rotate(5deg);
  }
}

@keyframes glow {
  0% {
    filter: drop-shadow(0 0 10px var(--shadow-green-light));
  }
  100% {
    filter: drop-shadow(0 0 20px var(--shadow-green));
  }
}

/* Контент */
.not-found-content {
  margin-bottom: 40px;
}

.not-found-title {
  color: var(--text-dark);
  font-size: 2.5rem;
  font-weight: 700;
  margin-bottom: 16px;
  line-height: 1.2;
}

.not-found-description {
  color: var(--text-medium);
  font-size: 1.2rem;
  line-height: 1.6;
  margin-bottom: 12px;
}

.not-found-subtext {
  color: var(--text-light);
  font-size: 1rem;
  font-weight: 500;
}

/* Действия */
.not-found-actions {
  display: flex;
  gap: 16px;
  justify-content: center;
  margin-bottom: 30px;
  flex-wrap: wrap;
}

:deep(.action-btn.base-button) {
  border-radius: 12px;
  font-weight: 600;
  transition: all 0.3s ease;
}

:deep(.action-btn.base-button:hover:not(.disabled)) {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px var(--shadow-green);
}

/* Помощь */
.not-found-help {
  padding-top: 20px;
  border-top: 1px solid var(--border-green-light);
}

.not-found-help p {
  color: var(--text-light);
  font-size: 0.9rem;
  margin: 0;
}

.not-found-help a {
  color: var(--green-primary);
  text-decoration: none;
  font-weight: 600;
  transition: color 0.3s ease;
}

.not-found-help a:hover {
  color: var(--green-dark);
  text-decoration: underline;
}

/* Декоративные элементы */
.decoration {
  position: absolute;
  font-size: 2rem;
  opacity: 0.1;
  z-index: 1;
  animation: float-slow 6s ease-in-out infinite;
}

.decoration-1 {
  top: 10%;
  left: 10%;
  animation-delay: 0s;
}

.decoration-2 {
  top: 20%;
  right: 15%;
  animation-delay: 2s;
}

.decoration-3 {
  bottom: 15%;
  left: 20%;
  animation-delay: 4s;
}

@keyframes float-slow {
  0%,
  100% {
    transform: translateY(0px) rotate(0deg) scale(1);
  }
  33% {
    transform: translateY(-20px) rotate(120deg) scale(1.1);
  }
  66% {
    transform: translateY(10px) rotate(240deg) scale(0.9);
  }
}

/* Адаптивность */
@media (max-width: 768px) {
  .not-found-card {
    padding: 40px 24px;
    margin: 0 10px;
  }

  .not-found-title {
    font-size: 2rem;
  }

  .not-found-description {
    font-size: 1.1rem;
  }

  .not-found-actions {
    flex-direction: column;
    align-items: stretch;
  }

  :deep(.action-btn.base-button) {
    width: 100%;
    justify-content: center;
  }

  .icon-animation {
    font-size: 4rem;
  }
}

@media (max-width: 480px) {
  .not-found-page {
    padding: 10px;
  }

  .not-found-card {
    padding: 30px 20px;
    border-radius: 20px;
  }

  .not-found-title {
    font-size: 1.75rem;
  }

  .not-found-description {
    font-size: 1rem;
  }

  .decoration {
    font-size: 1.5rem;
  }
}

/* Темная тема поддержка (если добавите в будущем) */
@media (prefers-color-scheme: dark) {
  .not-found-page {
    background: linear-gradient(135deg, #1a2f1a 0%, #2d4a2d 100%);
  }

  .not-found-card {
    background: #2d3748;
    border-color: #4a5568;
    color: #e2e8f0;
  }

  .not-found-title {
    color: #f7fafc;
  }

  .not-found-description {
    color: #cbd5e0;
  }

  .not-found-subtext {
    color: #a0aec0;
  }

  .not-found-help p {
    color: #a0aec0;
  }
}
</style>
