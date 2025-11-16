<template>
  <div class="dialog-overlay" @click.self="closeDialog" v-if="visible">
    <div class="dialog-container">
      <div class="dialog-header">
        <h3>Добавить людей</h3>
        <button class="dialog-close" @click="closeDialog" aria-label="Закрыть">×</button>
      </div>

      <div class="dialog-content">
        <p class="dialog-description">
          Добавить людей на экскурсию <strong>"{{ card?.title }}"</strong>
        </p>

        <div class="form-group">
          <label for="additional-people">Количество человек:</label>
          <input
            id="additional-people"
            v-model.number="localAdditionalPeople"
            type="number"
            min="1"
            max="100"
            placeholder="Введите количество"
            class="number-input"
            @keyup.enter="handleConfirm"
            ref="inputRef"
          />
        </div>

        <div class="current-info">
          <p>Текущее состояние:</p>
          <ul>
            <li>
              Всего мест: <strong>{{ card?.people_amount }}</strong>
            </li>
            <li>
              Свободно мест: <strong>{{ card?.people_left }}</strong>
            </li>
            <li>
              После добавления:
              <strong>{{ (card?.people_left || 0) - localAdditionalPeople }}</strong> свободных мест
            </li>
          </ul>
        </div>
      </div>

      <div class="dialog-actions">
        <BaseButton variant="secondary" @click="closeDialog" :disabled="loading">
          Отмена
        </BaseButton>
        <BaseButton
          variant="primary"
          @click="handleConfirm"
          :loading="loading"
          :disabled="!isFormValid"
        >
          Добавить места
        </BaseButton>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, nextTick } from 'vue'
import { type Excursion } from '@/types/excursion'
import BaseButton from '@/components/UI/BaseButton.vue'

interface Props {
  visible: boolean
  card: Excursion | null
  loading?: boolean
}

interface Emits {
  (e: 'update:visible', value: boolean): void
  (e: 'confirm', data: { id: number; additionalPeople: number }): void
  (e: 'close'): void
}

const props = withDefaults(defineProps<Props>(), {
  loading: false,
})

const emit = defineEmits<Emits>()

const localAdditionalPeople = ref(1)
const inputRef = ref<HTMLInputElement | null>(null)

// Валидация формы
const isFormValid = computed(() => {
  if (!props.card) return false
  return (
    localAdditionalPeople.value > 0 &&
    localAdditionalPeople.value <= 100 &&
    props.card.people_left - localAdditionalPeople.value >= 0
  )
})

// Обработка подтверждения
const handleConfirm = () => {
  if (!isFormValid.value || !props.card) return

  emit('confirm', {
    id: props.card.id,
    additionalPeople: localAdditionalPeople.value,
  })
}

// Закрытие диалога
const closeDialog = () => {
  emit('update:visible', false)
  emit('close')
}

// Сброс формы при закрытии
watch(
  () => props.visible,
  (newValue) => {
    if (!newValue) {
      localAdditionalPeople.value = 1
    } else {
      // Фокусируемся на поле ввода при открытии
      nextTick(() => {
        inputRef.value?.focus()
      })
    }
  },
)

// Автофокус при открытии
watch(
  () => props.visible,
  (newValue) => {
    if (newValue) {
      nextTick(() => {
        inputRef.value?.focus()
        inputRef.value?.select()
      })
    }
  },
)
</script>

<style scoped>
.dialog-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 20px;
  animation: fadeIn 0.2s ease;
}

.dialog-container {
  background: white;
  border-radius: 16px;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.2);
  max-width: 500px;
  width: 100%;
  max-height: 90vh;
  overflow-y: auto;
  animation: slideUp 0.3s ease;
}

.dialog-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 24px;
  border-bottom: 1px solid var(--border-green-light);
}

.dialog-header h3 {
  margin: 0;
  color: var(--text-dark);
  font-size: 1.3rem;
  font-weight: 600;
}

.dialog-close {
  background: none;
  border: none;
  font-size: 24px;
  cursor: pointer;
  color: var(--text-light);
  padding: 0;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  transition: all 0.2s ease;
}

.dialog-close:hover {
  background: #f8f9fa;
  color: var(--text-dark);
}

.dialog-close:focus {
  outline: 2px solid var(--green-primary);
  outline-offset: 2px;
}

.dialog-content {
  padding: 24px;
}

.dialog-description {
  margin-bottom: 20px;
  color: var(--text-medium);
  line-height: 1.5;
  font-size: 0.95rem;
}

.form-group {
  margin-bottom: 20px;
}

.form-group label {
  display: block;
  margin-bottom: 8px;
  font-weight: 600;
  color: var(--text-dark);
  font-size: 0.9rem;
}

.number-input {
  width: 100%;
  padding: 12px 16px;
  border: 2px solid var(--border-turquoise);
  border-radius: 8px;
  font-size: 1rem;
  transition: all 0.3s ease;
  background: var(--green-bg);
  font-family: inherit;
}

.number-input:focus {
  outline: none;
  border-color: var(--green-primary);
  box-shadow: 0 0 0 3px var(--hover-turquoise);
}

.number-input:invalid {
  border-color: var(--accent-error);
}

.current-info {
  background: #f8f9fa;
  padding: 16px;
  border-radius: 8px;
  border-left: 4px solid var(--green-primary);
}

.current-info p {
  margin: 0 0 12px 0;
  font-weight: 600;
  color: var(--text-dark);
  font-size: 0.9rem;
}

.current-info ul {
  margin: 0;
  padding-left: 20px;
}

.current-info li {
  margin-bottom: 4px;
  color: var(--text-medium);
  font-size: 0.9rem;
}

.dialog-actions {
  display: flex;
  gap: 12px;
  justify-content: flex-end;
  padding: 20px 24px;
  border-top: 1px solid var(--border-green-light);
}

/* Анимации */
@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* Адаптивность */
@media (max-width: 768px) {
  .dialog-overlay {
    padding: 10px;
    align-items: flex-end;
  }

  .dialog-container {
    margin: 0;
    max-height: 80vh;
    border-radius: 16px 16px 0 0;
    animation: slideUpMobile 0.3s ease;
  }

  .dialog-header {
    padding: 16px 20px;
  }

  .dialog-content {
    padding: 20px;
  }

  .dialog-actions {
    flex-direction: column;
    padding: 16px 20px;
  }

  .dialog-actions :deep(.base-button) {
    width: 100%;
  }

  @keyframes slideUpMobile {
    from {
      opacity: 0;
      transform: translateY(100%);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
}

@media (max-width: 480px) {
  .dialog-header h3 {
    font-size: 1.2rem;
  }

  .dialog-description {
    font-size: 0.9rem;
  }

  .number-input {
    font-size: 16px; /* Предотвращает зум на iOS */
    padding: 14px 16px;
  }
}

/* Предотвращение зума на мобильных устройствах */
@media (max-width: 768px) {
  .number-input {
    font-size: 16px;
    min-height: 44px;
  }

  /* Особенно для iOS */
  @supports (-webkit-touch-callout: none) {
    .number-input {
      font-size: 16px !important;
    }
  }
}
</style>
