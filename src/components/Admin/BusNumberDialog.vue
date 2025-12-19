<template>
  <div v-if="visible" class="dialog-overlay">
    <div class="dialog-content">
      <div class="dialog-header">
        <h3>Изменение номера автобуса</h3>
        <button class="close-button" @click="closeDialog">×</button>
      </div>

      <div class="dialog-body">
        <div v-if="card" class="card-info">
          <p><strong>Экскурсия:</strong> {{ card.title }}</p>
          <p><strong>Текущий номер автобуса:</strong> {{ card.bus_number || 'Не указан' }}</p>
        </div>

        <div class="form-group">
          <label for="busNumber">Новый номер автобуса:</label>
          <input
            id="busNumber"
            v-model.number="busNumber"
            type="number"
            min="1"
            class="input"
            placeholder="Введите номер автобуса"
            :disabled="loading"
          />
        </div>
      </div>

      <div class="dialog-footer">
        <button class="btn btn-secondary" @click="closeDialog" :disabled="loading">Отмена</button>
        <button class="btn btn-primary" @click="confirmDialog" :disabled="!isValid || loading">
          <span v-if="loading">Сохранение...</span>
          <span v-else>Сохранить</span>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, computed } from 'vue'
import { type Excursion } from '@/types/excursion'

interface Props {
  visible: boolean
  card: Excursion | null
  loading?: boolean
}

interface Emits {
  (e: 'update:visible', value: boolean): void
  (e: 'confirm', data: { id: number; busNumber: number }): void
  (e: 'close'): void
}

const props = withDefaults(defineProps<Props>(), {
  loading: false,
})

const emit = defineEmits<Emits>()

const busNumber = ref<number>(0)

// Валидация формы
const isValid = computed(() => {
  return busNumber.value >= 0
})

// Сброс формы при открытии/закрытии диалога
watch(
  () => props.visible,
  (newVal) => {
    if (newVal && props.card) {
      busNumber.value = props.card.bus_number || 0
    } else {
      busNumber.value = 0
    }
  },
)

const closeDialog = () => {
  emit('update:visible', false)
  emit('close')
}

const confirmDialog = () => {
  if (props.card && isValid.value) {
    emit('confirm', {
      id: props.card.id,
      busNumber: busNumber.value,
    })
  }
}
</script>

<style scoped>
.dialog-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.dialog-content {
  background: white;
  border-radius: 8px;
  padding: 0;
  min-width: 400px;
  max-width: 500px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.dialog-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.5rem;
  border-bottom: 1px solid #e5e7eb;
}

.dialog-header h3 {
  margin: 0;
  font-size: 1.25rem;
  font-weight: 600;
}

.close-button {
  background: none;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
  color: #6b7280;
}

.close-button:hover {
  color: #374151;
}

.dialog-body {
  padding: 1.5rem;
}

.card-info {
  background-color: #f9fafb;
  padding: 1rem;
  border-radius: 6px;
  margin-bottom: 1.5rem;
}

.card-info p {
  margin: 0.5rem 0;
}

.form-group {
  margin-bottom: 1rem;
}

.form-group label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 500;
}

.input {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  font-size: 1rem;
}

.input:focus {
  outline: none;
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.input:disabled {
  background-color: #f3f4f6;
  cursor: not-allowed;
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 0.75rem;
  padding: 1.5rem;
  border-top: 1px solid #e5e7eb;
}

.btn {
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 6px;
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
}

.btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.btn-secondary {
  background-color: #6b7280;
  color: white;
}

.btn-secondary:hover:not(:disabled) {
  background-color: #4b5563;
}

.btn-primary {
  background-color: #3b82f6;
  color: white;
}

.btn-primary:hover:not(:disabled) {
  background-color: #2563eb;
}
</style>
