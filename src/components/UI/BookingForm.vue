<template>
  <!-- Модальное окно -->
  <div v-if="visible" class="booking-modal-overlay" @click.self="closeModal">
    <div class="booking-modal">
      <div class="modal-header">
        <h2 class="modal-title">Забронировать экскурсию</h2>
        <button class="close-button" @click="closeModal">×</button>
      </div>

      <div class="modal-body">
        <div v-if="!bookingSuccess" class="booking-step">
          <!-- Информация об экскурсии -->
          <div v-if="excursion" class="excursion-info">
            <div class="excursion-header">
              <h3 class="excursion-title">{{ excursion.title }}</h3>
              <div class="excursion-price">{{ formatPrice(excursion.price) }}</div>
            </div>
            <div class="excursion-details">
              <div class="detail-item">
                <span class="detail-label">Дата:</span>
                <span class="detail-value">{{ formatDate(excursion.date) }}</span>
              </div>
              <div class="detail-item">
                <span class="detail-label">Свободно мест:</span>
                <span class="detail-value">{{ excursion.people_left }}</span>
              </div>
            </div>
          </div>

          <!-- Форма бронирования -->
          <form @submit.prevent="validateAndSubmit" class="booking-form">
            <!-- Блок с ошибками валидации -->
            <div v-if="validationErrors.length > 0" class="validation-errors">
              <div class="validation-title">⚠️ Пожалуйста, заполните следующие поля:</div>
              <ul class="validation-list">
                <li v-for="(error, index) in validationErrors" :key="index" class="validation-item">
                  {{ error }}
                </li>
              </ul>
            </div>

            <div class="form-section">
              <h3 class="section-title">Контактные данные</h3>

              <div class="form-row">
                <div class="form-group" :class="{ 'has-error': fieldErrors.last_name }">
                  <label for="lastName" class="form-label">Фамилия *</label>
                  <input
                    id="lastName"
                    v-model="formData.last_name"
                    type="text"
                    class="form-input"
                    :class="{ 'error': fieldErrors.last_name }"
                    required
                    placeholder="Введите вашу фамилию"
                    @blur="validateField('last_name')"
                    @input="clearFieldError('last_name')"
                  />
                  <div v-if="fieldErrors.last_name" class="field-error">
                    {{ fieldErrors.last_name }}
                  </div>
                </div>

                <div class="form-group" :class="{ 'has-error': fieldErrors.first_name }">
                  <label for="firstName" class="form-label">Имя *</label>
                  <input
                    id="firstName"
                    v-model="formData.first_name"
                    type="text"
                    class="form-input"
                    :class="{ 'error': fieldErrors.first_name }"
                    required
                    placeholder="Введите ваше имя"
                    @blur="validateField('first_name')"
                    @input="clearFieldError('first_name')"
                  />
                  <div v-if="fieldErrors.first_name" class="field-error">
                    {{ fieldErrors.first_name }}
                  </div>
                </div>
              </div>

              <!-- Блок выбора города -->
              <div class="form-group" :class="{ 'has-error': fieldErrors.city }">
                <label for="city" class="form-label">Город *</label>

                <!-- Варианты предустановленных городов -->
                <div class="city-options">
                  <button
                    v-for="city in excursion?.cities"
                    :key="city"
                    type="button"
                    class="city-option-btn"
                    :class="{
                      active: formData.city === city && !isCustomCity,
                      'error-border': fieldErrors.city && !formData.city
                    }"
                    @click="selectCity(city)"
                  >
                    {{ city }}
                  </button>
                  <button
                    type="button"
                    class="city-option-btn custom"
                    :class="{
                      active: isCustomCity,
                      'error-border': fieldErrors.city && !formData.city
                    }"
                    @click="enableCustomCity"
                  >
                    ✏️ Другой
                  </button>
                </div>

                <!-- Поле для своего варианта города -->
                <div v-if="isCustomCity" class="custom-city-input">
                  <input
                    id="customCity"
                    v-model="formData.city"
                    type="text"
                    class="form-input"
                    :class="{ 'error': fieldErrors.city }"
                    required
                    placeholder="Введите название вашего города"
                    @input="validateCustomCity"
                    @blur="validateField('city')"
                  />
                  <button
                    type="button"
                    class="clear-custom-btn"
                    @click="clearCustomCity"
                    title="Очистить"
                  >
                    ×
                  </button>
                </div>

                <!-- Подсказка для поля город -->
                <div class="input-hint">Выберите ваш город из списка или укажите свой вариант</div>
                <div v-if="fieldErrors.city" class="field-error">
                  {{ fieldErrors.city }}
                </div>
              </div>

              <div class="form-group" :class="{ 'has-error': fieldErrors.phone_number }">
                <label for="phone" class="form-label">Номер телефона *</label>
                <input
                  id="phone"
                  v-model="formData.phone_number"
                  type="tel"
                  class="form-input"
                  :class="{ 'error': fieldErrors.phone_number }"
                  required
                  placeholder="+7 (XXX) XXX-XX-XX"
                  @input="formatPhone"
                  @blur="validateField('phone_number')"
                />
                <div class="input-hint">Формат: +7 XXX XXX-XX-XX</div>
                <div v-if="fieldErrors.phone_number" class="field-error">
                  {{ fieldErrors.phone_number }}
                </div>
              </div>
            </div>

            <div class="form-section">
              <h3 class="section-title">Участники</h3>

              <div class="people-selector">
                <div class="people-group" :class="{ 'has-error': fieldErrors.total_people }">
                  <label class="people-label">Всего человек *</label>
                  <div class="people-counter">
                    <button type="button" class="counter-btn minus" @click="decrementTotal"
                      :disabled="formData.total_people <= 1">
                      −
                    </button>
                    <span class="people-count">{{ formData.total_people }}</span>
                    <button type="button" class="counter-btn plus" @click="incrementTotal"
                      :disabled="formData.total_people >= maxPeople">
                      +
                    </button>
                  </div>
                  <div class="people-hint">Максимум: {{ maxPeople }} человек</div>
                </div>
                <div v-if="fieldErrors.total_people" class="field-error">
                  {{ fieldErrors.total_people }}
                </div>
              </div>

              <!-- Итоговая стоимость -->
              <div class="price-summary">
                <!-- ... существующий код ... -->
              </div>
            </div>

            <!-- Кнопки -->
            <div class="form-actions">
              <button type="button" class="btn-secondary" @click="closeModal" :disabled="loading">
                Отмена
              </button>
              <button type="submit" class="btn-primary" :disabled="loading">
                <span v-if="loading">Отправка...</span>
                <span v-else>Забронировать</span>
              </button>
            </div>
          </form>
        </div>

        <div v-else class="success-step">
          <div class="success-header">
            <div class="success-icon">✅</div>
            <h2 class="success-title">Бронирование создано!</h2>
            <p class="success-subtitle">ID вашей брони: <strong>#{{ bookingId }}</strong></p>
          </div>

          <div class="telegram-confirmation">
            <h3 class="confirmation-title">Подтвердите бронирование в Telegram</h3>

            <div class="confirmation-steps">
              <div class="step">
                <div class="step-number">1</div>
                <div class="step-content">
                  <p class="step-title">Откройте Telegram</p>
                  <p class="step-description">Нажмите кнопку ниже</p>
                </div>
              </div>

              <div class="step">
                <div class="step-number">2</div>
                <div class="step-content">
                  <p class="step-title">Подтвердите бронирование</p>
                  <p class="step-description">Бот автоматически подтвердит ваше бронирование</p>
                </div>
              </div>
            </div>

            <div class="telegram-actions">
              <!-- Кнопка перехода в бота -->
              <a :href="telegramBotUrl" target="_blank" class="telegram-button">
                <span class="telegram-icon">📱</span>
                <span class="telegram-text">Перейти в Telegram-бота</span>
              </a>
            </div>
          </div>

          <div class="success-actions">
            <button class="btn-secondary" @click="closeModal">
              Закрыть
            </button>
            <button class="btn-primary" @click="copyBookingLink">
              {{ copyButtonText }}
            </button>
          </div>
        </div>

        <!-- Ошибка -->
        <div v-if="error" class="error-message">
          <div class="error-icon">⚠️</div>
          <p class="error-text">{{ error }}</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, nextTick } from 'vue'
import type { BookingCreate } from '@/types/booking'
import type { Excursion } from '@/types/excursion'
import { api } from '@/utils/api'

interface Props {
  visible: boolean
  excursion: Excursion | null
}

interface Emits {
  (e: 'update:visible', value: boolean): void
  (e: 'success', booking: any): void
  (e: 'close'): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

// Конфигурация Telegram бота
const telegramBotUsername = import.meta.env.PROD
  ? 'travelvv_booking_bot'
  : 'lokach_dev_bot'
const telegramBotBaseUrl = `https://t.me/${telegramBotUsername}`

// Состояние для кастомного города
const isCustomCity = ref(false)

const loading = ref(false)
const error = ref('')
const bookingSuccess = ref(false)
const bookingId = ref<number | null>(null)
const copyButtonText = ref('Скопировать ссылку')

// Данные формы
const formData = ref<BookingCreate>({
  excursion_id: 1,
  first_name: '',
  last_name: '',
  phone_number: '',
  total_people: 1,
  children: 0,
  city: '', // Добавляем поле city
})

// Состояние для ошибок валидации
const fieldErrors = ref<Record<string, string>>({
  first_name: '',
  last_name: '',
  city: '',
  phone_number: '',
  total_people: ''
})

const validationErrors = ref<string[]>([])

// Функция валидации отдельного поля
const validateField = (field: string) => {
  switch (field) {
    case 'first_name':
      if (!formData.value.first_name.trim()) {
        fieldErrors.value.first_name = 'Укажите ваше имя'
      } else if (formData.value.first_name.trim().length < 2) {
        fieldErrors.value.first_name = 'Имя должно содержать минимум 2 символа'
      } else {
        fieldErrors.value.first_name = ''
      }
      break

    case 'last_name':
      if (!formData.value.last_name.trim()) {
        fieldErrors.value.last_name = 'Укажите вашу фамилию'
      } else if (formData.value.last_name.trim().length < 2) {
        fieldErrors.value.last_name = 'Фамилия должна содержать минимум 2 символа'
      } else {
        fieldErrors.value.last_name = ''
      }
      break

    case 'city':
      if (!formData.value.city?.trim()) {
        fieldErrors.value.city = 'Выберите или укажите ваш город'
      } else if (formData.value.city.trim().length < 2) {
        fieldErrors.value.city = 'Название города должно содержать минимум 2 символа'
      } else {
        fieldErrors.value.city = ''
      }
      break

    case 'phone_number':
      const phoneDigits = formData.value.phone_number.replace(/\D/g, '')
      if (!phoneDigits) {
        fieldErrors.value.phone_number = 'Укажите номер телефона'
      } else if (phoneDigits.length < 11) {
        fieldErrors.value.phone_number = 'Номер телефона должен содержать 11 цифр'
      } else {
        fieldErrors.value.phone_number = ''
      }
      break

    case 'total_people':
      if (formData.value.total_people <= 0) {
        fieldErrors.value.total_people = 'Укажите количество человек'
      } else if (formData.value.total_people > maxPeople.value) {
        fieldErrors.value.total_people = `Максимум ${maxPeople.value} человек`
      } else {
        fieldErrors.value.total_people = ''
      }
      break
  }
}

// Очистка ошибки поля при вводе
const clearFieldError = (field: string) => {
  fieldErrors.value[field] = ''
}

// Полная валидация формы
const validateForm = (): boolean => {
  // Проверяем все поля
  validateField('first_name')
  validateField('last_name')
  validateField('city')
  validateField('phone_number')
  validateField('total_people')

  // Собираем все ошибки для общего списка
  const errors: string[] = []

  if (!formData.value.first_name.trim()) {
    errors.push('Укажите ваше имя')
  }
  if (!formData.value.last_name.trim()) {
    errors.push('Укажите вашу фамилию')
  }
  if (!formData.value.city?.trim()) {
    errors.push('Выберите или укажите ваш город')
  }

  const phoneDigits = formData.value.phone_number.replace(/\D/g, '')
  if (!phoneDigits) {
    errors.push('Укажите номер телефона')
  } else if (phoneDigits.length < 11) {
    errors.push('Номер телефона должен содержать 11 цифр')
  }

  if (formData.value.total_people <= 0) {
    errors.push('Укажите количество человек')
  } else if (formData.value.total_people > maxPeople.value) {
    errors.push(`Максимальное количество человек: ${maxPeople.value}`)
  }

  validationErrors.value = errors

  return errors.length === 0
}

// Скролл к первому полю с ошибкой
const scrollToFirstError = () => {
  const firstErrorField = document.querySelector('.form-group.has-error')
  if (firstErrorField) {
    firstErrorField.scrollIntoView({
      behavior: 'smooth',
      block: 'center'
    })
  }
}

// Обновленный метод отправки с валидацией
const validateAndSubmit = () => {
  if (validateForm()) {
    submitBooking(formData.value)
  } else {
    // Показываем ошибки и скроллим к первой
    scrollToFirstError()
  }
}

// Следим за изменением экскурсии
watch(
  () => props.excursion,
  (newExcursion) => {
    if (newExcursion) {
      formData.value.excursion_id = newExcursion.id
    }
  },
  { immediate: true },
)

// Очищаем ошибки при открытии формы
watch(() => props.visible, (visible) => {
  if (visible) {
    // Сбрасываем ошибки при открытии
    fieldErrors.value = {
      first_name: '',
      last_name: '',
      city: '',
      phone_number: '',
      total_people: ''
    }
    validationErrors.value = []
  }
})

// Генерация ссылки для Telegram бота
const telegramBotUrl = computed(() => {
  if (!bookingId.value) return telegramBotBaseUrl
  return `${telegramBotBaseUrl}?start=confirm_${bookingId.value}`
})

// Максимальное количество людей
const maxPeople = computed(() => {
  return props.excursion?.people_left || 10
})

// Валидация формы
const isFormValid = computed(() => {
  return (
    formData.value.first_name.trim() &&
    formData.value.last_name.trim() &&
    formData.value.city?.trim() &&
    formData.value.phone_number.replace(/\D/g, '').length >= 11 &&
    formData.value.total_people > 0 &&
    formData.value.total_people <= maxPeople.value
  )
})

// Методы для работы с городом
const selectCity = (city: string) => {
  formData.value.city = city
  isCustomCity.value = false
  validateField('city')
}

const enableCustomCity = () => {
  isCustomCity.value = true
  formData.value.city = ''
}

const clearCustomCity = () => {
  formData.value.city = ''
}

const validateCustomCity = () => {
  if (formData.value.city && formData.value.city.length < 2) {
    fieldErrors.value.city = 'Название города должно содержать минимум 2 символа'
  } else {
    fieldErrors.value.city = ''
  }
}

// Методы
const incrementTotal = () => {
  if (formData.value.total_people < maxPeople.value) {
    formData.value.total_people++
  }
}

const decrementTotal = () => {
  if (formData.value.total_people > 1) {
    formData.value.total_people--
  }
}

// Форматирование телефона
const formatPhone = (event: Event) => {
  const input = event.target as HTMLInputElement
  let value = input.value.replace(/\D/g, '')

  if (value.startsWith('8')) {
    value = '7' + value.slice(1)
  }

  if (!value.startsWith('7') && value.length > 0) {
    value = '7' + value
  }

  let formatted = ''
  if (value.length > 0) {
    formatted = '+7('
    if (value.length > 1) {
      formatted += value.slice(1, 4)
      if (value.length > 4) {
        formatted += ')' + value.slice(4, 7)
        if (value.length > 7) {
          formatted += '-' + value.slice(7, 9)
          if (value.length > 9) {
            formatted += '-' + value.slice(9, 11)
          }
        }
      }
    }
  }

  formData.value.phone_number = formatted
}

// Форматирование цены
const formatPrice = (price: number): string => {
  return `${price.toLocaleString('ru-RU')} ₽`
}

// Форматирование даты
const formatDate = (dateString: string | Date): string => {
  const date = new Date(dateString)
  return date.toLocaleDateString('ru-RU', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    weekday: 'long',
  })
}

// Копирование ссылки
const copyBookingLink = async () => {
  try {
    await navigator.clipboard.writeText(telegramBotUrl.value)
    copyButtonText.value = 'Скопировано!'
    setTimeout(() => {
      copyButtonText.value = 'Скопировать ссылку'
    }, 2000)
  } catch (err) {
    console.error('Failed to copy:', err)
    copyButtonText.value = 'Ошибка копирования'
  }
}

// Отправка формы
const submitBooking = async (new_booking: BookingCreate) => {
  if (!isFormValid.value) return

  loading.value = true
  error.value = ''

  try {
    // Отправляем запрос на создание бронирования
    const response = await api.booking.createBooking(new_booking)

    // Предполагаем, что API возвращает объект с id
    bookingId.value = response.id || response.data?.id

    // Переключаемся на экран успеха
    bookingSuccess.value = true

    // Ждем обновления DOM и скроллим наверх
    await nextTick()
    scrollToTop()

    // Уведомляем родительский компонент
    emit('success', response)

  } catch (err: any) {
    error.value = err.message || 'Произошла ошибка при отправке заявки'
    console.error('Booking error:', err)
  } finally {
    loading.value = false
  }
}

// Функция скролла наверх
const scrollToTop = () => {
  const modalBody = document.querySelector('.booking-modal')
  if (modalBody) {
    modalBody.scrollTo({
      top: 0,
      behavior: 'smooth'
    })
  }
}

// Сброс формы
const resetForm = () => {
  formData.value = {
    excursion_id: props.excursion?.id || 0,
    first_name: '',
    last_name: '',
    phone_number: '',
    total_people: 1,
    children: 0,
    city: '',
  }
  isCustomCity.value = false
  bookingSuccess.value = false
  bookingId.value = null
  copyButtonText.value = 'Скопировать ссылку'
  error.value = ''
}

// Закрытие модального окна
const closeModal = () => {
  emit('update:visible', false)
  emit('close')
  resetForm()
}
</script>

<style scoped>
/* Добавляем новые стили для валидации */
.validation-errors {
  background: #fff3f3;
  border: 2px solid #ff6b6b;
  border-radius: 12px;
  padding: 16px 20px;
  margin-bottom: 25px;
  animation: shake 0.5s ease;
}

@keyframes shake {
  0%, 100% { transform: translateX(0); }
  10%, 30%, 50%, 70%, 90% { transform: translateX(-5px); }
  20%, 40%, 60%, 80% { transform: translateX(5px); }
}

.validation-title {
  font-weight: 700;
  color: #d32f2f;
  margin-bottom: 10px;
  font-size: 1rem;
}

.validation-list {
  margin: 0;
  padding-left: 20px;
  color: #d32f2f;
}

.validation-item {
  font-size: 0.9rem;
  margin-bottom: 5px;
  line-height: 1.4;
}

/* Стили для полей с ошибками */
.form-group.has-error .form-label {
  color: #d32f2f;
}

.form-input.error {
  border-color: #d32f2f;
  background-color: #fff8f8;
}

.form-input.error:focus {
  border-color: #d32f2f;
  box-shadow: 0 0 0 3px rgba(211, 47, 47, 0.1);
}

.city-option-btn.error-border {
  border-color: #d32f2f;
  background-color: #fff8f8;
}

.field-error {
  color: #d32f2f;
  font-size: 0.8rem;
  margin-top: 5px;
  font-weight: 500;
  display: flex;
  align-items: center;
  gap: 4px;
}

.field-error::before {
  content: '⚠️';
  font-size: 0.8rem;
}

/* Стили для группы людей с ошибкой */
.people-group.has-error {
  border-color: #d32f2f;
  background-color: #fff8f8;
}

/* Анимация для привлечения внимания */
@keyframes pulse-error {
  0% {
    box-shadow: 0 0 0 0 rgba(211, 47, 47, 0.4);
  }
  70% {
    box-shadow: 0 0 0 10px rgba(211, 47, 47, 0);
  }
  100% {
    box-shadow: 0 0 0 0 rgba(211, 47, 47, 0);
  }
}

.form-group.has-error {
  animation: pulse-error 1.5s infinite;
}

/* Добавляем новые стили для выбора города */
.city-options {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  margin-bottom: 15px;
}

.city-option-btn {
  padding: 10px 16px;
  background: var(--white);
  border: 2px solid var(--border-green-light);
  border-radius: 30px;
  font-size: 0.95rem;
  color: var(--text-dark);
  cursor: pointer;
  transition: all 0.3s ease;
  font-weight: 500;
}

.city-option-btn:hover:not(.custom) {
  background: var(--green-bg-light);
  border-color: var(--green-primary);
  transform: translateY(-2px);
}

.city-option-btn.active {
  background: var(--green-primary);
  border-color: var(--green-primary);
  color: var(--white);
  box-shadow: 0 4px 12px var(--shadow-green-light);
}

.city-option-btn.custom {
  border-style: dashed;
  background: var(--green-bg-light);
}

.city-option-btn.custom.active {
  background: var(--green-primary);
  border-style: solid;
}

.custom-city-input {
  position: relative;
  margin-top: 10px;
  animation: slideDown 0.3s ease;
}

@keyframes slideDown {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.custom-city-input .form-input {
  padding-right: 40px;
  border-color: var(--green-primary);
  box-shadow: 0 0 0 3px var(--shadow-green-light);
}

.clear-custom-btn {
  position: absolute;
  right: 10px;
  top: 50%;
  transform: translateY(-50%);
  background: none;
  border: none;
  font-size: 1.5rem;
  color: var(--text-light);
  cursor: pointer;
  width: 30px;
  height: 30px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  transition: all 0.2s ease;
}

.clear-custom-btn:hover {
  background: var(--green-bg-light);
  color: var(--text-dark);
}

/* Адаптивность для выбора города */
@media (max-width: 768px) {
  .city-options {
    gap: 8px;
  }

  .city-option-btn {
    padding: 8px 14px;
    font-size: 0.9rem;
  }
}

@media (max-width: 480px) {
  .city-options {
    flex-direction: column;
  }

  .city-option-btn {
    width: 100%;
    text-align: center;
  }
}
.booking-modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
  padding: 20px;
}

.booking-modal {
  background: var(--white);
  border-radius: 20px;
  width: 100%;
  max-width: 500px;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
  animation: modalAppear 0.3s ease;
}

@keyframes modalAppear {
  from {
    opacity: 0;
    transform: translateY(-20px);
  }

  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 24px 30px;
  border-bottom: 1px solid var(--border-green);
  background: var(--green-bg);
  border-radius: 20px 20px 0 0;
  position: sticky;
  top: 0;
  z-index: 1000;
}

.modal-title {
  font-size: 1.5rem;
  font-weight: 700;
  color: var(--text-dark);
  margin: 0;
}

.close-button {
  background: none;
  border: none;
  font-size: 1.8rem;
  cursor: pointer;
  color: var(--text-light);
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  transition: all 0.2s ease;
}

.close-button:hover {
  background: var(--green-bg-light);
  color: var(--text-dark);
}

.modal-body {
  padding: 30px;
}

/* Информация об экскурсии */
.excursion-info {
  background: var(--green-bg-light);
  padding: 20px;
  border-radius: 12px;
  border: 1px solid var(--border-green);
  margin-bottom: 30px;
}

.excursion-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 15px;
  gap: 15px;
}

.excursion-title {
  font-size: 1.2rem;
  font-weight: 600;
  color: var(--text-dark);
  margin: 0;
  flex: 1;
}

.excursion-price {
  font-size: 1.3rem;
  font-weight: 700;
  color: var(--green-primary);
  white-space: nowrap;
}

.excursion-details {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.detail-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 0.9rem;
}

.detail-label {
  color: var(--text-medium);
  font-weight: 500;
}

.detail-value {
  color: var(--text-dark);
  font-weight: 600;
}

/* Форма */
.form-section {
  margin-bottom: 30px;
}

.section-title {
  font-size: 1.1rem;
  font-weight: 600;
  color: var(--text-dark);
  margin-bottom: 20px;
  padding-bottom: 10px;
  border-bottom: 1px solid var(--border-green-light);
}

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
  margin-bottom: 20px;
}

.form-group {
  margin-bottom: 20px;
}

.form-label {
  display: block;
  font-weight: 600;
  color: var(--text-dark);
  margin-bottom: 8px;
  font-size: 0.9rem;
}

.form-input {
  width: 100%;
  padding: 12px 16px;
  border: 1px solid var(--border-light);
  border-radius: 8px;
  font-size: 1rem;
  transition: all 0.3s ease;
  background: var(--white);
}

.form-input:focus {
  outline: none;
  border-color: var(--green-primary);
  box-shadow: 0 0 0 3px var(--shadow-green-light);
}

.input-hint {
  font-size: 0.8rem;
  color: var(--text-light);
  margin-top: 4px;
}

/* Счетчики людей */
.people-selector {
  display: flex;
  flex-direction: column;
  gap: 25px;
}

.people-group {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 20px;
  padding: 15px;
  background: var(--green-bg-light);
  border-radius: 12px;
  border: 1px solid var(--border-green);
}

.people-label {
  font-weight: 600;
  color: var(--text-dark);
  min-width: 120px;
}

.people-counter {
  display: flex;
  align-items: center;
  gap: 12px;
}

.counter-btn {
  width: 36px;
  height: 36px;
  border: 1px solid var(--border-green);
  background: var(--white);
  border-radius: 8px;
  font-size: 1.2rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
}

.counter-btn:hover:not(:disabled) {
  background: var(--green-lightest);
  border-color: var(--green-primary);
}

.counter-btn:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

.people-count {
  font-size: 1.3rem;
  font-weight: 700;
  color: var(--text-dark);
  min-width: 30px;
  text-align: center;
}

.people-hint {
  font-size: 0.8rem;
  color: var(--text-light);
  text-align: right;
  flex: 1;
}

/* Стоимость */
.price-summary {
  background: var(--white);
  border: 1px solid var(--border-green);
  border-radius: 12px;
  padding: 20px;
  margin-top: 25px;
}

.price-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 0;
  color: var(--text-medium);
  font-size: 0.95rem;
}

.children-price {
  color: var(--text-light);
  font-size: 0.9rem;
}

.price-total {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: 15px;
  margin-top: 15px;
  border-top: 2px solid var(--border-green);
  font-weight: 600;
  color: var(--text-dark);
  font-size: 1.1rem;
}

.total-amount {
  color: var(--green-primary);
  font-size: 1.3rem;
}

/* Предупреждение */
.warning-message {
  background: #fff9e6;
  border: 1px solid #ffeeba;
  color: #856404;
  padding: 16px;
  border-radius: 8px;
  margin: 20px 0;
  font-size: 0.9rem;
  line-height: 1.4;
}

/* Кнопки */
.form-actions {
  display: flex;
  gap: 15px;
  margin-top: 30px;
  padding-top: 20px;
  border-top: 1px solid var(--border-green-light);
}

.btn-primary,
.btn-secondary {
  flex: 1;
  padding: 14px 24px;
  border-radius: 8px;
  font-weight: 600;
  font-size: 1rem;
  cursor: pointer;
  transition: all 0.3s ease;
  border: 2px solid transparent;
}

.btn-primary {
  background: var(--gradient-green);
  color: var(--white);
}

.btn-primary:hover:not(:disabled) {
  background: var(--gradient-green-hover);
  transform: translateY(-2px);
  box-shadow: 0 8px 25px var(--shadow-green-strong);
}

.btn-secondary {
  background: transparent;
  color: var(--text-dark);
  border-color: var(--border-green);
}

.btn-secondary:hover:not(:disabled) {
  background: var(--green-bg-light);
  border-color: var(--green-primary);
}

.btn-primary:disabled,
.btn-secondary:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  transform: none;
}

/* Стили для шага успешного бронирования */
.success-step {
  animation: fadeIn 0.5s ease;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }

  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.success-header {
  text-align: center;
  margin-bottom: 30px;
  padding-bottom: 20px;
  border-bottom: 1px solid var(--border-green);
}

.success-icon {
  font-size: 3rem;
  margin-bottom: 15px;
  animation: bounce 0.5s ease;
}

@keyframes bounce {

  0%,
  100% {
    transform: translateY(0);
  }

  50% {
    transform: translateY(-10px);
  }
}

.success-title {
  font-size: 1.5rem;
  font-weight: 700;
  color: var(--text-dark);
  margin-bottom: 10px;
}

.success-subtitle {
  font-size: 1.1rem;
  color: var(--text-medium);
}

/* Telegram подтверждение */
.telegram-confirmation {
  background: var(--green-bg-light);
  border-radius: 16px;
  padding: 25px;
  margin-bottom: 25px;
  border: 1px solid var(--border-green);
}

.confirmation-title {
  font-size: 1.2rem;
  font-weight: 600;
  color: var(--text-dark);
  margin-bottom: 20px;
  text-align: center;
}

.confirmation-steps {
  display: flex;
  flex-direction: column;
  gap: 15px;
  margin-bottom: 25px;
}

.step {
  display: flex;
  align-items: flex-start;
  gap: 15px;
  padding: 15px;
  background: var(--white);
  border-radius: 12px;
  border: 1px solid var(--border-green);
}

.step-number {
  background: var(--green-primary);
  color: var(--white);
  width: 28px;
  height: 28px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  font-size: 0.9rem;
  flex-shrink: 0;
}

.step-content {
  flex: 1;
}

.step-title {
  font-weight: 600;
  color: var(--text-dark);
  margin-bottom: 5px;
}

.step-description {
  font-size: 0.9rem;
  color: var(--text-medium);
  line-height: 1.4;
}

/* Telegram действия */
.telegram-actions {
  display: block;
}

@media (max-width: 768px) {
  .telegram-actions {
    grid-template-columns: 1fr;
  }
}

.telegram-button {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  padding: 18px 24px;
  background: linear-gradient(135deg, #0088cc 0%, #006699 100%);
  color: white;
  text-decoration: none;
  border-radius: 12px;
  font-weight: 600;
  font-size: 1rem;
  transition: all 0.3s ease;
  border: none;
  cursor: pointer;
  margin-bottom: 20px;
}

.telegram-button:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(0, 136, 204, 0.3);
  background: linear-gradient(135deg, #0099e6 0%, #0077b3 100%);
}

.telegram-icon {
  font-size: 1.3rem;
}

.telegram-text {
  flex: 1;
  text-align: center;
}

.qr-code-section {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 20px;
  background: var(--white);
  border-radius: 12px;
  border: 1px solid var(--border-green);
}

.qr-code-container {
  width: 200px;
  height: 200px;
  padding: 15px;
  background: var(--white);
  border-radius: 8px;
  border: 1px solid var(--border-light);
  margin-bottom: 15px;
}

.qr-code {
  width: 100%;
  height: 100%;
  object-fit: contain;
}

.qr-code-hint {
  font-size: 0.9rem;
  color: var(--text-medium);
  text-align: center;
  max-width: 180px;
}

/* Примечание */
.confirmation-note {
  display: flex;
  align-items: flex-start;
  gap: 15px;
  padding: 15px;
  background: #fff9e6;
  border-radius: 12px;
  border: 1px solid #ffeeba;
}

.note-icon {
  font-size: 1.5rem;
  flex-shrink: 0;
}

.note-content {
  flex: 1;
}

.note-content p {
  margin: 5px 0;
  font-size: 0.9rem;
  line-height: 1.4;
}

.note-content a {
  color: var(--green-primary);
  text-decoration: none;
  font-weight: 600;
}

.note-content a:hover {
  text-decoration: underline;
}

/* Кнопки после успеха */
.success-actions {
  display: flex;
  gap: 15px;
  margin-top: 20px;
}

/* Сообщение об ошибке */
.error-message {
  display: flex;
  align-items: flex-start;
  gap: 10px;
  padding: 15px;
  background: #fff2f2;
  border-radius: 12px;
  border: 1px solid #ffcccc;
  margin-top: 20px;
}

.error-icon {
  font-size: 1.2rem;
  flex-shrink: 0;
}

.error-text {
  color: #d32f2f;
  font-size: 0.9rem;
  line-height: 1.4;
  margin: 0;
}

/* Адаптивность */
@media (max-width: 768px) {
  .booking-modal {
    max-width: 100%;
    max-height: 95vh;
  }

  .modal-header {
    padding: 20px;
  }

  .modal-body {
    padding: 20px;
  }

  .form-row {
    grid-template-columns: 1fr;
    gap: 15px;
  }

  .people-group {
    flex-direction: column;
    align-items: flex-start;
    gap: 10px;
  }

  .people-label {
    min-width: auto;
  }

  .people-hint {
    text-align: left;
  }

  .form-actions {
    flex-direction: column;
  }
}

@media (max-width: 480px) {
  .booking-modal-overlay {
    padding: 10px;
  }

  .modal-header {
    padding: 16px;
  }

  .modal-title {
    font-size: 1.3rem;
  }

  .close-button {
    width: 32px;
    height: 32px;
    font-size: 1.5rem;
  }

  .excursion-header {
    flex-direction: column;
    gap: 10px;
  }

  .excursion-title {
    font-size: 1.1rem;
  }

  .section-title {
    font-size: 1rem;
  }

  .form-input {
    padding: 10px 14px;
  }

  .counter-btn {
    width: 32px;
    height: 32px;
  }
}
</style>
