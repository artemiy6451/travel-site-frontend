<template>
  <!-- Модальное окно -->
  <div v-if="visible" class="booking-modal-overlay" @click.self="closeModal">
    <div class="booking-modal">
      <div class="modal-header">
        <h2 class="modal-title">Забронировать экскурсию</h2>
        <button class="close-button" @click="closeModal">×</button>
      </div>

      <div class="modal-body">
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
        <form @submit.prevent="submitBooking(formData)" class="booking-form">
          <div class="form-section">
            <h3 class="section-title">Контактные данные</h3>

            <div class="form-row">
              <div class="form-group">
                <label for="firstName" class="form-label">Имя *</label>
                <input
                  id="firstName"
                  v-model="formData.first_name"
                  type="text"
                  class="form-input"
                  required
                  placeholder="Введите ваше имя"
                />
              </div>

              <div class="form-group">
                <label for="lastName" class="form-label">Фамилия *</label>
                <input
                  id="lastName"
                  v-model="formData.last_name"
                  type="text"
                  class="form-input"
                  required
                  placeholder="Введите вашу фамилию"
                />
              </div>
            </div>

            <div class="form-group">
              <label for="phone" class="form-label">Номер телефона *</label>
              <input
                id="phone"
                v-model="formData.phone_number"
                type="tel"
                class="form-input"
                required
                placeholder="+7 (XXX) XXX-XX-XX"
                @input="formatPhone"
              />
              <div class="input-hint">Формат: +7 XXX XXX-XX-XX</div>
            </div>
          </div>

          <div class="form-section">
            <h3 class="section-title">Участники</h3>

            <div class="people-selector">
              <div class="people-group">
                <label class="people-label">Всего человек *</label>
                <div class="people-counter">
                  <button
                    type="button"
                    class="counter-btn minus"
                    @click="decrementTotal"
                    :disabled="formData.total_people <= 1"
                  >
                    −
                  </button>
                  <span class="people-count">{{ formData.total_people }}</span>
                  <button
                    type="button"
                    class="counter-btn plus"
                    @click="incrementTotal"
                    :disabled="formData.total_people >= maxPeople"
                  >
                    +
                  </button>
                </div>
                <div class="people-hint">Максимум: {{ maxPeople }} человек</div>
              </div>
            </div>

            <!-- Итоговая стоимость -->
            <div class="price-summary">
              <div class="price-row">
                <span>Взрослые ({{ adultsCount }} × {{ formatPrice(excursion?.price || 0) }})</span>
              </div>
              <div class="price-total">
                <span>Итого:</span>
                <span class="total-amount">{{ formatPrice(totalPrice) }}</span>
              </div>
            </div>
          </div>

          <!-- Кнопки -->
          <div class="form-actions">
            <button type="button" class="btn-secondary" @click="closeModal" :disabled="loading">
              Отмена
            </button>
            <button type="submit" class="btn-primary" :disabled="loading || !isFormValid">
              <span v-if="loading">Отправка...</span>
              <span v-else>Забронировать</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
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

const loading = ref(false)
const error = ref('')

// Данные формы
const formData = ref<BookingCreate>({
  excursion_id: 1,
  first_name: '',
  last_name: '',
  phone_number: '',
  total_people: 1,
})

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

// Максимальное количество людей
const maxPeople = computed(() => {
  return props.excursion?.people_left || 10
})

// Валидация формы
const isFormValid = computed(() => {
  return (
    formData.value.first_name.trim() &&
    formData.value.last_name.trim() &&
    formData.value.phone_number.replace(/\D/g, '').length >= 11 &&
    formData.value.total_people > 0 &&
    formData.value.total_people <= maxPeople.value
  )
})

// Расчет стоимости
const adultsCount = computed(() => {
  return formData.value.total_people - (formData.value.children || 0)
})

const adultsPrice = computed(() => {
  return adultsCount.value * (props.excursion?.price || 0)
})

const totalPrice = computed(() => {
  return adultsPrice.value
})

// Методы
const incrementTotal = () => {
  if (formData.value.total_people < maxPeople.value) {
    formData.value.total_people++
  }
}

const decrementTotal = () => {
  if (formData.value.total_people > 1) {
    formData.value.total_people--
    // Если детей больше чем общее количество, уменьшаем детей
    if ((formData.value.children || 0) >= formData.value.total_people) {
      formData.value.children = formData.value.total_people - 1
    }
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

// Отправка формы
const submitBooking = async (new_booking: BookingCreate) => {
  if (!isFormValid.value) return

  loading.value = true
  error.value = ''

  try {
    await api.booking.createBooking(new_booking)

    const booking = true
    emit('success', booking)
    closeModal()

    // Сбрасываем форму
    resetForm()
  } catch (err: any) {
    error.value = err.message || 'Произошла ошибка при отправке заявки'
    console.error('Booking error:', err)
  } finally {
    loading.value = false
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
  }
}

// Закрытие модального окна
const closeModal = () => {
  emit('update:visible', false)
  emit('close')
  resetForm()
}
</script>

<style scoped>
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
