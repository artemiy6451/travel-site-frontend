<template>
  <div class="login-page">
    <div class="login-container">
      <div class="login-card">
        <div class="login-header">
          <h1>Вход в админ-панель</h1>
        </div>

        <form @submit.prevent="handleLogin" class="login-form">
          <div class="form-group">
            <label for="email">Email</label>
            <input id="email" v-model="form.email" type="email" placeholder="admin@example.com" required
              :class="{ error: errors.email }">
            <span v-if="errors.email" class="error-message">{{ errors.email }}</span>
          </div>

          <div class="form-group">
            <label for="password">Пароль</label>
            <input id="password" v-model="form.password" type="password" placeholder="Введите пароль" required
              :class="{ error: errors.password }">
            <span v-if="errors.password" class="error-message">{{ errors.password }}</span>
          </div>

          <BaseButton type="submit" :loading="loading" loading-text="Вход..." full-width size="lg">
            Войти
          </BaseButton>
        </form>

        <div v-if="error" class="error-alert">
          {{ error }}
        </div>

        <div class="login-footer">
          <p>Только для администраторов</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { login } from '@/utils/auth.ts'
import BaseButton from '@/components/UI/BaseButton.vue'

interface LoginForm {
  email: string
  password: string
}

interface FormErrors {
  email?: string
  password?: string
}

const router = useRouter()

const form = reactive<LoginForm>({
  email: '',
  password: ''
})

const errors = reactive<FormErrors>({})
const loading = ref(false)
const error = ref('')

const validateForm = (): boolean => {
  let isValid = true
  errors.email = ''
  errors.password = ''

  if (!form.email) {
    errors.email = 'Email обязателен'
    isValid = false
  } else if (!/\S+@\S+\.\S+/.test(form.email)) {
    errors.email = 'Некорректный email'
    isValid = false
  }

  if (!form.password) {
    errors.password = 'Пароль обязателен'
    isValid = false
  } else if (form.password.length < 6) {
    errors.password = 'Пароль должен быть не менее 6 символов'
    isValid = false
  }

  return isValid
}

const handleLogin = async () => {
  if (!validateForm()) return;

  loading.value = true;
  error.value = '';

  try {
    await login(form.email, form.password);

    router.push('/admin');
  } catch (err) {
    error.value = err instanceof Error ? err.message : 'Ошибка при входе. Попробуйте снова.';
  } finally {
    loading.value = false;
  }
};

</script>

<style scoped>
.login-page {
  min-height: 100vh;
  background: var(--green-bg);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
}

.login-container {
  width: 100%;
  max-width: 400px;
}

.login-card {
  background: var(--white);
  padding: 40px 30px;
  border-radius: 20px;
  box-shadow: 0 15px 35px var(--shadow-green-light);
  border: 1px solid var(--border-green);
}

.login-header {
  text-align: center;
  margin-bottom: 30px;
}

.login-header h1 {
  color: var(--text-dark);
  font-size: 1.8rem;
  margin-bottom: 8px;
  font-weight: 700;
}

.login-header p {
  color: var(--text-light);
  font-size: 1rem;
}

.login-form {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.form-group label {
  font-weight: 600;
  color: var(--text-dark);
  font-size: 0.9rem;
}

.form-group input {
  padding: 12px 16px;
  border: 2px solid var(--border-green-medium);
  border-radius: 10px;
  font-size: 1rem;
  transition: all 0.3s ease;
  background: var(--white);
  color: var(--text-dark);
}

.form-group input:focus {
  outline: none;
  border-color: var(--green-primary);
  box-shadow: 0 0 0 3px var(--hover-green);
}

.form-group input.error {
  border-color: var(--accent-error);
}

.form-group input.error:focus {
  box-shadow: 0 0 0 3px rgba(235, 87, 87, 0.1);
}

.error-message {
  color: var(--accent-error);
  font-size: 0.8rem;
  margin-top: 4px;
}

.error-alert {
  background: #fee;
  color: var(--accent-error);
  padding: 12px 16px;
  border-radius: 8px;
  border: 1px solid #fcc;
  margin-top: 20px;
  text-align: center;
  font-size: 0.9rem;
}

.login-footer {
  text-align: center;
  margin-top: 30px;
  padding-top: 20px;
  border-top: 1px solid var(--border-green);
}

.login-footer p {
  color: var(--text-light);
  font-size: 0.8rem;
}

/* Адаптивность */
@media (max-width: 480px) {
  .login-card {
    padding: 30px 20px;
  }

  .login-header h1 {
    font-size: 1.5rem;
  }
}
</style>
