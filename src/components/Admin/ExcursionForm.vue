<template>
  <div v-if="visible" class="form-overlay">
    <div class="form-container">
      <h2>{{ editingCard ? 'Редактировать' : 'Добавить' }} экскурсию</h2>

      <form @submit.prevent="handleSubmit" class="card-form">
        <!-- Основная информация -->
        <div class="form-section">
          <h3 class="section-title">Основная информация</h3>

          <div class="form-row">
            <div class="form-group">
              <label>Название *</label>
              <input v-model="formData.title" type="text" required placeholder="Название экскурсии" :disabled="loading">
            </div>

            <div class="form-group">
              <label>Категория *</label>
              <select v-model="formData.category" required :disabled="loading">
                <option value="">Выберите категорию</option>
                <option value="горные">Горные</option>
                <option value="морские">Морские</option>
                <option value="исторические">Исторические</option>
                <option value="природа">Природа</option>
                <option value="городские">Городские</option>
              </select>
            </div>
          </div>

          <div class="form-group">
            <label>Краткое описание *</label>
            <textarea v-model="formData.description" required placeholder="Краткое описание для карточки" rows="3"
              :disabled="loading"></textarea>
          </div>

          <div class="form-row">
            <div class="form-group">
              <label>Дата отправления *</label>
              <input v-model="formData.date" type="datetime-local" required :disabled="loading">
            </div>

            <div class="form-group">
              <label>Цена (руб) *</label>
              <input v-model.number="formData.price" type="number" required min="0" placeholder="2500"
                :disabled="loading">
            </div>

            <div class="form-group">
              <label>Длительность (мин) *</label>
              <input v-model.number="formData.duration" type="number" required min="0" placeholder="180"
                :disabled="loading">
            </div>
          </div>

          <div class="form-row">
            <div class="form-group">
              <label>Количество человек *</label>
              <input v-model.number="formData.people_amount" type="number" required min="1" placeholder="8"
                :disabled="loading">
            </div>

            <div class="form-group">
              <label>URL изображения *</label>
              <input v-model="formData.image_url" type="text" required placeholder="https://example.com/image.jpg"
                :disabled="loading">
            </div>
          </div>

          <div class="form-group checkbox-group">
            <label class="checkbox-label">
              <input v-model="formData.is_active" type="checkbox" :disabled="loading">
              <span class="checkmark"></span>
              Активная экскурсия
            </label>
            <small>Если снята галочка, экскурсия будет скрыта из общего списка</small>
          </div>
        </div>

        <!-- Детальная информация -->
        <div class="form-section">
          <h3 class="section-title">Детальная информация</h3>

          <!-- Полное описание маршрута -->
          <div class="form-group">
            <label>Полное описание маршрута</label>
            <textarea v-model="formData.details.description" placeholder="Подробное описание маршрута, особенности, что увидят туристы..."
              rows="4" :disabled="loading"></textarea>
            <small>Это описание будет отображаться на странице экскурсии</small>
          </div>

          <!-- Место сбора -->
          <div class="form-group">
            <label>Место сбора</label>
            <input v-model="formData.details.meeting_point" type="text" placeholder="Например: Центральная площадь, у фонтана"
              :disabled="loading">
          </div>

          <!-- Что входит в экскурсию -->
          <div class="form-group">
            <label>Что входит в экскурсию</label>
            <div class="array-input">
              <div v-for="(item, index) in formData.details.inclusions" :key="index" class="array-item">
                <input v-model="formData.details.inclusions[index]" type="text"
                  :placeholder="`Пункт ${index + 1}`" :disabled="loading">
                <button type="button" class="remove-btn" @click="removeInclusion(index)" :disabled="loading">×</button>
              </div>
              <button type="button" class="add-btn" @click="addInclusion" :disabled="loading">
                + Добавить пункт
              </button>
            </div>
            <small>Перечислите что включено в стоимость (трансфер, питание, услуги гида и т.д.)</small>
          </div>

          <!-- Требования к участникам -->
          <div class="form-group">
            <label>Требования к участникам</label>
            <div class="array-input">
              <div v-for="(item, index) in formData.details.requirements" :key="index" class="array-item">
                <input v-model="formData.details.requirements[index]" type="text"
                  :placeholder="`Требование ${index + 1}`" :disabled="loading">
                <button type="button" class="remove-btn" @click="removeRequirement(index)" :disabled="loading">×</button>
              </div>
              <button type="button" class="add-btn" @click="addRequirement" :disabled="loading">
                + Добавить требование
              </button>
            </div>
            <small>Что нужно иметь с собой (удобная обувь, вода, документы и т.д.)</small>
          </div>

          <!-- Рекомендации -->
          <div class="form-group">
            <label>Рекомендации</label>
            <div class="array-input">
              <div v-for="(item, index) in formData.details.recommendations" :key="index" class="array-item">
                <input v-model="formData.details.recommendations[index]" type="text"
                  :placeholder="`Рекомендация ${index + 1}`" :disabled="loading">
                <button type="button" class="remove-btn" @click="removeRecommendation(index)" :disabled="loading">×</button>
              </div>
              <button type="button" class="add-btn" @click="addRecommendation" :disabled="loading">
                + Добавить рекомендацию
              </button>
            </div>
            <small>Что рекомендуется взять или учесть (фотоаппарат, теплая одежда и т.д.)</small>
          </div>

          <!-- Программа тура -->
          <div class="form-group">
            <label>Программа тура</label>
            <div class="itinerary-list">
              <div v-for="(item, index) in formData.details.itinerary" :key="index" class="itinerary-item">
                <div class="itinerary-header">
                  <h4>Пункт {{ index + 1 }}</h4>
                  <button type="button" class="remove-btn" @click="removeItineraryItem(index)" :disabled="loading">×</button>
                </div>
                <div class="form-row">
                  <div class="form-group">
                    <label>Время</label>
                    <input v-model="item.time" type="text" placeholder="09:00" :disabled="loading">
                  </div>
                  <div class="form-group">
                    <label>Заголовок *</label>
                    <input v-model="item.title" type="text" required placeholder="Сбор группы" :disabled="loading">
                  </div>
                </div>
                <div class="form-group">
                  <label>Описание</label>
                  <textarea v-model="item.description" placeholder="Подробное описание этапа..."
                    rows="2" :disabled="loading"></textarea>
                </div>
              </div>
              <button type="button" class="add-btn" @click="addItineraryItem" :disabled="loading">
                + Добавить этап программы
              </button>
            </div>
          </div>
        </div>

        <div class="form-actions">
          <BaseButton type="button" variant="secondary" @click="handleCancel" :disabled="loading">
            Отмена
          </BaseButton>

          <BaseButton type="submit" variant="primary" :loading="loading" loading-text="Загрузка...">
            {{ editingCard ? 'Сохранить' : 'Добавить' }}
          </BaseButton>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import { type Excursion, type ExcursionCreate } from '@/types/excursion'
import BaseButton from '@/components/UI/BaseButton.vue'

interface Props {
  visible: boolean
  loading?: boolean
  editingCard?: Excursion | null
  editingDetails?: any | null
}

interface Emits {
  (e: 'submit', data: { excursion: ExcursionCreate; details: any }): void
  (e: 'cancel'): void
  (e: 'update:visible', value: boolean): void
}

const props = withDefaults(defineProps<Props>(), {
  loading: false,
  editingCard: null,
  editingDetails: null
})

const emit = defineEmits<Emits>()

// Данные формы для основной информации
const formData = ref({
  // Основная информация
  title: '',
  category: '',
  description: '',
  date: new Date(),
  price: 0,
  duration: 0,
  people_amount: 0,
  people_left: 0,
  is_active: true,
  image_url: '',

  // Детальная информация
  details: {
    description: '',
    inclusions: [''],
    itinerary: [{
      time: '',
      title: '',
      description: ''
    }],
    meeting_point: '',
    requirements: [''],
    recommendations: ['']
  }
})

// Методы для работы с массивами
const addInclusion = () => {
  formData.value.details.inclusions.push('')
}

const removeInclusion = (index: number) => {
  if (formData.value.details.inclusions.length > 1) {
    formData.value.details.inclusions.splice(index, 1)
  }
}

const addRequirement = () => {
  formData.value.details.requirements.push('')
}

const removeRequirement = (index: number) => {
  if (formData.value.details.requirements.length > 1) {
    formData.value.details.requirements.splice(index, 1)
  }
}

const addRecommendation = () => {
  formData.value.details.recommendations.push('')
}

const removeRecommendation = (index: number) => {
  if (formData.value.details.recommendations.length > 1) {
    formData.value.details.recommendations.splice(index, 1)
  }
}

const addItineraryItem = () => {
  formData.value.details.itinerary.push({
    time: '',
    title: '',
    description: ''
  })
}

const removeItineraryItem = (index: number) => {
  if (formData.value.details.itinerary.length > 1) {
    formData.value.details.itinerary.splice(index, 1)
  }
}

// Сброс формы
const resetForm = () => {
  formData.value = {
    title: '',
    category: '',
    description: '',
    date: new Date(),
    price: 0,
    duration: 0,
    people_amount: 0,
    people_left: 0,
    is_active: true,
    image_url: '',
    details: {
      description: '',
      inclusions: [''],
      itinerary: [{
        time: '',
        title: '',
        description: ''
      }],
      meeting_point: '',
      requirements: [''],
      recommendations: ['']
    }
  }
}

// Наблюдаем за изменениями редактируемой карточки
watch(() => props.editingCard, (card) => {
  if (card) {
    formData.value = {
      title: card.title,
      category: card.category,
      description: card.description,
      date: new Date(card.date),
      price: card.price,
      duration: card.duration,
      people_amount: card.people_amount,
      people_left: card.people_amount,
      image_url: card.image_url,
      is_active: card.is_active,
      details: props.editingDetails || {
        description: '',
        inclusions: [''],
        itinerary: [{
          time: '',
          title: '',
          description: ''
        }],
        meeting_point: '',
        requirements: [''],
        recommendations: ['']
      }
    }
  } else {
    resetForm()
  }
}, { immediate: true })

// Наблюдаем за изменениями детальной информации
watch(() => props.editingDetails, (details) => {
  if (details && props.editingCard) {
    formData.value.details = {
      description: details.description || '',
      inclusions: details.inclusions?.length ? details.inclusions : [''],
      itinerary: details.itinerary?.length ? details.itinerary : [{
        time: '',
        title: '',
        description: ''
      }],
      meeting_point: details.meeting_point || '',
      requirements: details.requirements?.length ? details.requirements : [''],
      recommendations: details.recommendations?.length ? details.recommendations : ['']
    }
  }
})

// Наблюдаем за видимостью формы
watch(() => props.visible, (visible) => {
  if (!visible) {
    resetForm()
  }
})

// Обработчик отправки формы
const handleSubmit = () => {
  // Валидация обязательных полей основной информации
  if (!formData.value.title || !formData.value.category || !formData.value.description ||
    !formData.value.image_url || !formData.value.date || formData.value.price <= 0 ||
    formData.value.duration <= 0 || formData.value.people_amount <= 0) {
    return
  }

  // Валидация программы тура
  const validItinerary = formData.value.details.itinerary.every(item =>
    item.title.trim() !== '' // Заголовок обязателен
  )

  if (!validItinerary) {
    return
  }

  // Очистка пустых значений из массивов
  const cleanedDetails = {
    ...formData.value.details,
    inclusions: formData.value.details.inclusions.filter(item => item.trim() !== ''),
    requirements: formData.value.details.requirements.filter(item => item.trim() !== ''),
    recommendations: formData.value.details.recommendations.filter(item => item.trim() !== ''),
    itinerary: formData.value.details.itinerary.filter(item => item.title.trim() !== '')
  }

  const submitData = {
    excursion: {
      ...formData.value,
      people_left: formData.value.people_amount,
    },
    details: cleanedDetails
  }

  emit('submit', submitData)
}

// Обработчик отмены
const handleCancel = () => {
  emit('cancel')
  emit('update:visible', false)
}

</script>

<style scoped>
.form-overlay {
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
}

.form-container {
  background: white;
  padding: 30px;
  border-radius: 15px;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.2);
  max-width: 800px;
  width: 100%;
  max-height: 95vh;
  overflow-y: auto;
}

.form-container h2 {
  margin-bottom: 25px;
  color: var(--text-dark);
  text-align: center;
}

.card-form {
  display: flex;
  flex-direction: column;
  gap: 30px;
}

.form-section {
  border: 1px solid var(--border-green-light);
  border-radius: 12px;
  padding: 20px;
  background: var(--green-bg-light);
}

.section-title {
  font-size: 1.2rem;
  color: var(--text-dark);
  margin-bottom: 20px;
  padding-bottom: 10px;
  border-bottom: 2px solid var(--border-turquoise);
}

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 15px;
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

.form-group input,
.form-group select,
.form-group textarea {
  padding: 12px;
  border: 2px solid var(--border-turquoise);
  border-radius: 8px;
  font-size: 1rem;
  transition: all 0.3s ease;
  background: white;
}

.form-group input:focus,
.form-group select:focus,
.form-group textarea:focus {
  outline: none;
  border-color: var(--green-primary);
  box-shadow: 0 0 0 3px var(--hover-turquoise);
}

.form-group small {
  color: var(--text-light);
  font-size: 0.8rem;
}

.form-actions {
  display: flex;
  gap: 15px;
  justify-content: flex-end;
  margin-top: 20px;
  padding-top: 20px;
  border-top: 1px solid var(--border-green-light);
}

/* Стили для работы с массивами */
.array-input {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.array-item {
  display: flex;
  gap: 10px;
  align-items: center;
}

.array-item input {
  flex: 1;
}

.remove-btn {
  background: #dc3545;
  color: white;
  border: none;
  border-radius: 50%;
  width: 30px;
  height: 30px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  font-size: 16px;
  transition: background 0.3s ease;
}

.remove-btn:hover:not(:disabled) {
  background: #c82333;
}

.remove-btn:disabled {
  background: #6c757d;
  cursor: not-allowed;
}

.add-btn {
  background: var(--green-primary);
  color: white;
  border: none;
  border-radius: 8px;
  padding: 10px 15px;
  cursor: pointer;
  font-size: 0.9rem;
  transition: background 0.3s ease;
  align-self: flex-start;
}

.add-btn:hover:not(:disabled) {
  background: var(--green-dark);
}

.add-btn:disabled {
  background: #6c757d;
  cursor: not-allowed;
}

/* Стили для программы тура */
.itinerary-list {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.itinerary-item {
  border: 1px solid var(--border-green-light);
  border-radius: 8px;
  padding: 15px;
  background: white;
}

.itinerary-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
  padding-bottom: 10px;
  border-bottom: 1px solid var(--border-green-light);
}

.itinerary-header h4 {
  margin: 0;
  color: var(--text-dark);
  font-size: 1rem;
}

/* Адаптивность */
@media (max-width: 768px) {
  .form-row {
    grid-template-columns: 1fr;
  }

  .form-actions {
    flex-direction: column;
  }

  .array-item {
    flex-direction: column;
    align-items: stretch;
  }

  .remove-btn {
    align-self: flex-end;
    width: 40px;
  }

  .form-container {
    max-width: 95%;
    padding: 20px;
  }
}

@media (max-width: 480px) {
  .form-container {
    padding: 15px;
  }

  .form-section {
    padding: 15px;
  }
}
</style>
