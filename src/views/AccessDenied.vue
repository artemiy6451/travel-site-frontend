<template>
  <div class="access-denied-page">
    <div class="access-denied-container">
      <div class="access-denied-card">
        <div class="icon">🚫</div>
        <h1>Доступ запрещен</h1>
        <p>У вас недостаточно прав для доступа к этой странице.</p>
        <p class="subtext">Требуются права администратора.</p>
        <div class="actions">
          <BaseButton @click="goToLogin" variant="primary" size="lg" full-width class="action-btn">
            Войти под другим пользователем
          </BaseButton>

          <BaseButton @click="goBack" variant="secondary" size="lg" full-width class="action-btn">
            Назад
          </BaseButton>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router'
import { logout } from '@/utils/auth'
import BaseButton from '@/components/UI/BaseButton.vue' // Убедитесь что путь правильный

const router = useRouter()

const goToLogin = () => {
  logout()
}

const goBack = () => {
  router.back()
}
</script>

<style scoped>
.access-denied-page {
  min-height: 100vh;
  background: var(--green-bg);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
}

.access-denied-container {
  width: 100%;
  max-width: 500px;
}

.access-denied-card {
  background: var(--white);
  padding: 50px 40px;
  border-radius: 20px;
  box-shadow: 0 15px 35px var(--shadow-green-light);
  border: 1px solid var(--border-green);
  text-align: center;
}

.icon {
  font-size: 4rem;
  margin-bottom: 20px;
}

h1 {
  color: var(--text-dark);
  font-size: 2rem;
  margin-bottom: 15px;
  font-weight: 700;
}

p {
  color: var(--text-medium);
  font-size: 1.1rem;
  margin-bottom: 10px;
}

.subtext {
  color: var(--text-light);
  font-size: 0.9rem;
}

.actions {
  display: flex;
  gap: 15px;
  justify-content: center;
  margin-top: 30px;
  flex-wrap: wrap;
}

:deep(.action-btn.base-button) {
  border-radius: 10px;
  font-weight: 600;
}

/* Убедимся что кнопки выглядят как нужно */
:deep(.action-btn.base-button.size-lg) {
  padding: 12px 24px;
  font-size: 1rem;
}

@media (max-width: 480px) {
  .access-denied-card {
    padding: 30px 20px;
  }

  .actions {
    flex-direction: column;
  }

  /* BaseButton с full-width уже занимает всю ширину */
  :deep(.action-btn.base-button.full-width) {
    width: 100%;
    justify-content: center;
  }
}
</style>
