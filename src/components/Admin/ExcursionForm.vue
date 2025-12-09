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
              <input
                v-model="formData.title"
                type="text"
                required
                placeholder="Название экскурсии"
                :disabled="loading"
              />
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
            <textarea
              v-model="formData.description"
              required
              placeholder="Краткое описание для карточки"
              rows="3"
              :disabled="loading"
            ></textarea>
          </div>

          <div class="form-row">
            <div class="form-group">
              <label>Дата отправления *</label>
              <input v-model="formData.date" type="datetime-local" required :disabled="loading" />
            </div>

            <div class="form-group">
              <label>Цена (руб) *</label>
              <input
                v-model.number="formData.price"
                type="number"
                required
                min="0"
                placeholder="2500"
                :disabled="loading"
              />
            </div>

            <div class="form-group">
              <label>Длительность (мин) *</label>
              <input
                v-model.number="formData.duration"
                type="number"
                required
                min="0"
                placeholder="180"
                :disabled="loading"
              />
            </div>
          </div>

          <div class="form-row">
            <div class="form-group">
              <label>Количество человек *</label>
              <input
                v-model.number="formData.people_amount"
                type="number"
                required
                min="1"
                placeholder="8"
                :disabled="loading"
              />
            </div>

            <!-- Загрузка изображения -->
            <div class="form-group">
              <label>Изображение *</label>
              <div class="image-upload-section">
                <!-- Превью изображения -->
                <div v-if="imagePreview" class="image-preview">
                  <img :src="imagePreview" alt="Preview" class="preview-image" />
                  <button
                    type="button"
                    class="remove-image-btn"
                    @click="removeImage"
                    :disabled="loading"
                  >
                    ×
                  </button>
                </div>

                <!-- Кнопки загрузки -->
                <div class="upload-options">
                  <input
                    type="file"
                    ref="fileInput"
                    accept="image/*"
                    @change="handleFileSelect"
                    class="file-input"
                    :disabled="loading"
                  />

                  <div class="upload-buttons">
                    <button
                      type="button"
                      class="upload-btn primary"
                      @click="triggerFileInput"
                      :disabled="loading"
                    >
                      📁 Выбрать файл
                    </button>

                    <button
                      type="button"
                      class="upload-btn secondary"
                      @click="openCamera"
                      :disabled="!supportsCamera || loading"
                      :title="!supportsCamera ? 'Камера не поддерживается' : 'Сделать фото'"
                    >
                      📷 Сделать фото
                    </button>
                  </div>

                  <!-- Или URL -->
                  <div class="url-option">
                    <span class="url-divider">или введите URL</span>
                    <input
                      v-model="formData.image_url"
                      type="text"
                      placeholder="https://example.com/image.jpg"
                      :disabled="loading || !!uploadedImage"
                      class="url-input"
                    />
                  </div>
                </div>

                <!-- Информация о загрузке -->
                <div v-if="uploadStatus" class="upload-status" :class="uploadStatus.type">
                  {{ uploadStatus.message }}
                </div>

                <!-- Подсказки -->
                <div class="upload-hints">
                  <small>• Поддерживаемые форматы: JPG, PNG, WebP</small>
                  <small>• Максимальный размер: 5MB</small>
                  <small>• Рекомендуемое соотношение: 16:9</small>
                </div>
              </div>
            </div>
          </div>

          <div class="form-group checkbox-group">
            <label class="checkbox-label">
              <input v-model="formData.is_active" type="checkbox" :disabled="loading" />
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
            <textarea
              v-model="formData.details.description"
              placeholder="Подробное описание маршрута, особенности, что увидят туристы..."
              rows="4"
              :disabled="loading"
            ></textarea>
            <small>Это описание будет отображаться на странице экскурсии</small>
          </div>

          <!-- Место сбора -->
          <div class="form-group">
            <label>Место сбора</label>
            <input
              v-model="formData.details.meeting_point"
              type="text"
              placeholder="Например: Центральная площадь, у фонтана"
              :disabled="loading"
            />
          </div>

          <!-- Что входит в экскурсию -->
          <div class="form-group">
            <label>Что входит в экскурсию</label>
            <div class="array-input">
              <div
                v-for="(_, index) in formData.details.inclusions"
                :key="index"
                class="array-item"
              >
                <input
                  v-model="formData.details.inclusions[index]"
                  type="text"
                  :placeholder="`Пункт ${index + 1}`"
                  :disabled="loading"
                />
                <button
                  type="button"
                  class="remove-btn"
                  @click="removeInclusion(index)"
                  :disabled="loading"
                >
                  ×
                </button>
              </div>
              <button type="button" class="add-btn" @click="addInclusion" :disabled="loading">
                + Добавить пункт
              </button>
            </div>
            <small
              >Перечислите что включено в стоимость (трансфер, питание, услуги гида и т.д.)</small
            >
          </div>

          <!-- Требования к участникам -->
          <div class="form-group">
            <label>Требования к участникам</label>
            <div class="array-input">
              <div
                v-for="(_, index) in formData.details.requirements"
                :key="index"
                class="array-item"
              >
                <input
                  v-model="formData.details.requirements[index]"
                  type="text"
                  :placeholder="`Требование ${index + 1}`"
                  :disabled="loading"
                />
                <button
                  type="button"
                  class="remove-btn"
                  @click="removeRequirement(index)"
                  :disabled="loading"
                >
                  ×
                </button>
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
              <div
                v-for="(_, index) in formData.details.recommendations"
                :key="index"
                class="array-item"
              >
                <input
                  v-model="formData.details.recommendations[index]"
                  type="text"
                  :placeholder="`Рекомендация ${index + 1}`"
                  :disabled="loading"
                />
                <button
                  type="button"
                  class="remove-btn"
                  @click="removeRecommendation(index)"
                  :disabled="loading"
                >
                  ×
                </button>
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
              <div
                v-for="(item, index) in formData.details.itinerary"
                :key="index"
                class="itinerary-item"
              >
                <div class="itinerary-header">
                  <h4>Пункт {{ index + 1 }}</h4>
                  <button
                    type="button"
                    class="remove-btn"
                    @click="removeItineraryItem(index)"
                    :disabled="loading"
                  >
                    ×
                  </button>
                </div>
                <div class="form-row">
                  <div class="form-group">
                    <label>Время</label>
                    <input
                      v-model="item.time"
                      type="text"
                      placeholder="09:00"
                      :disabled="loading"
                    />
                  </div>
                  <div class="form-group">
                    <label>Заголовок</label>
                    <input
                      v-model="item.title"
                      type="text"
                      placeholder="Сбор группы"
                      :disabled="loading"
                    />
                  </div>
                </div>
                <div class="form-group">
                  <label>Описание</label>
                  <textarea
                    v-model="item.description"
                    placeholder="Подробное описание этапа..."
                    rows="2"
                    :disabled="loading"
                  ></textarea>
                </div>
              </div>
              <button type="button" class="add-btn" @click="addItineraryItem" :disabled="loading">
                + Добавить этап программы
              </button>
            </div>
          </div>
        </div>

        <div class="form-actions">
          <BaseButton
            type="button"
            variant="secondary"
            @click="handleCancel"
            :disabled="loading || imageUploading"
          >
            Отмена
          </BaseButton>

          <BaseButton
            type="submit"
            variant="primary"
            :loading="loading || imageUploading"
            :loading-text="getLoadingText"
          >
            {{ editingCard ? 'Сохранить' : 'Добавить' }}
          </BaseButton>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, computed, onMounted } from 'vue'
import { type Excursion, type ExcursionCreate } from '@/types/excursion'
import BaseButton from '@/components/UI/BaseButton.vue'
import { api } from '@/utils/api'

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
  editingDetails: null,
})

const emit = defineEmits<Emits>()

// Рефы
const fileInput = ref<HTMLInputElement | null>(null)

// Состояния загрузки изображений
const uploadedImage = ref<File | null>(null)
const imagePreview = ref<string>('')
const uploadStatus = ref<{ type: 'success' | 'error' | 'info'; message: string } | null>(null)
const supportsCamera = ref(false)
const imageUploading = ref(false) // Новое состояние для загрузки изображения

// Вычисляемое свойство для текста загрузки
const getLoadingText = computed(() => {
  if (imageUploading.value) return 'Загрузка изображения...'
  if (props.loading) return 'Сохранение...'
  return 'Загрузка...'
})

// Проверка поддержки камеры
onMounted(() => {
  supportsCamera.value = !!navigator.mediaDevices && !!navigator.mediaDevices.getUserMedia
})

// Данные формы
const formData = ref({
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
  bus_number: 0,

  details: {
    description: '',
    inclusions: [''],
    itinerary: [
      {
        time: '',
        title: '',
        description: '',
      },
    ],
    meeting_point: '',
    requirements: [''],
    recommendations: [''],
  },
})

// Триггер выбора файла
const triggerFileInput = () => {
  fileInput.value?.click()
}

// Обработка выбора файла
const handleFileSelect = (event: Event) => {
  const target = event.target as HTMLInputElement
  const file = target.files?.[0]

  if (file) {
    validateAndSetImage(file)
  }
}

// Валидация и установка изображения
const validateAndSetImage = (file: File) => {
  // Проверка типа файла
  const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
  if (!validTypes.includes(file.type)) {
    showUploadStatus('error', 'Неподдерживаемый формат файла. Используйте JPG, PNG или WebP.')
    return
  }

  // Проверка размера файла (5MB)
  const maxSize = 5 * 1024 * 1024
  if (file.size > maxSize) {
    showUploadStatus('error', 'Файл слишком большой. Максимальный размер: 5MB.')
    return
  }

  // Создание превью
  const reader = new FileReader()
  reader.onload = (e) => {
    imagePreview.value = e.target?.result as string
    uploadedImage.value = file
    formData.value.image_url = '' // Очищаем URL при загрузке файла
    showUploadStatus('success', 'Изображение готово к загрузке')
  }
  reader.onerror = () => {
    showUploadStatus('error', 'Ошибка при чтении файла')
  }
  reader.readAsDataURL(file)
}

// Открытие камеры
const openCamera = async () => {
  if (!supportsCamera.value) {
    showUploadStatus('error', 'Ваше устройство не поддерживает камеру')
    return
  }

  try {
    const stream = await navigator.mediaDevices.getUserMedia({ video: true })

    // Здесь можно реализовать интерфейс для съемки фото
    // Для простоты используем input с capture
    if (fileInput.value) {
      fileInput.value.setAttribute('capture', 'environment')
      fileInput.value.click()
      // Сбрасываем атрибут после использования
      setTimeout(() => {
        if (fileInput.value) {
          fileInput.value.removeAttribute('capture')
        }
      }, 100)
    }

    // Останавливаем поток
    stream.getTracks().forEach((track) => track.stop())
  } catch (error) {
    console.error('Camera error:', error)
    showUploadStatus('error', 'Не удалось получить доступ к камере')
  }
}

// Удаление изображения
const removeImage = () => {
  uploadedImage.value = null
  imagePreview.value = ''
  if (fileInput.value) {
    fileInput.value.value = ''
  }
  showUploadStatus('info', 'Изображение удалено')
}

// Показать статус загрузки
const showUploadStatus = (type: 'success' | 'error' | 'info', message: string) => {
  uploadStatus.value = { type, message }
  setTimeout(() => {
    uploadStatus.value = null
  }, 3000)
}

// Загрузка изображения на сервер
const uploadImage = async (file: File): Promise<string> => {
  try {
    imageUploading.value = true
    showUploadStatus('info', 'Загрузка изображения...')

    const imageUrl = await api.excursions.saveImage(file)

    showUploadStatus('success', 'Изображение успешно загружено')
    return imageUrl
  } catch (error) {
    console.error('Image upload error:', error)
    showUploadStatus('error', 'Ошибка загрузки изображения')
    throw error
  } finally {
    imageUploading.value = false
  }
}

// Обработчик отправки формы
const handleSubmit = async () => {
  // Валидация
  if (
    !formData.value.title ||
    !formData.value.category ||
    !formData.value.description ||
    !formData.value.date ||
    formData.value.price <= 0 ||
    formData.value.duration <= 0 ||
    formData.value.people_amount <= 0
  ) {
    showUploadStatus('error', 'Заполните все обязательные поля')
    return
  }

  // Проверка изображения
  if (!uploadedImage.value && !formData.value.image_url) {
    showUploadStatus('error', 'Добавьте изображение экскурсии')
    return
  }

  let finalImageUrl = formData.value.image_url

  // Если есть загруженный файл, сначала загружаем его
  if (uploadedImage.value) {
    try {
      finalImageUrl = await uploadImage(uploadedImage.value)
    } catch (error) {
      // Ошибка уже обработана в uploadImage
      return
    }
  }

  // Очистка детальной информации
  const cleanedDetails = {
    ...formData.value.details,
    inclusions: formData.value.details.inclusions.filter((item) => item.trim() !== ''),
    requirements: formData.value.details.requirements.filter((item) => item.trim() !== ''),
    recommendations: formData.value.details.recommendations.filter((item) => item.trim() !== ''),
    itinerary: formData.value.details.itinerary.filter((item) => item.title.trim() !== ''),
  }

  // Подготовка данных экскурсии
  const excursionData: ExcursionCreate = {
    title: formData.value.title,
    category: formData.value.category,
    description: formData.value.description,
    date: formData.value.date,
    price: formData.value.price,
    duration: formData.value.duration,
    people_amount: formData.value.people_amount,
    people_left: formData.value.people_amount,
    is_active: formData.value.is_active,
    image_url: finalImageUrl,
    bus_number: formData.value.bus_number,
  }

  // Отправка данных через emit
  emit('submit', {
    excursion: excursionData,
    details: cleanedDetails,
  })
}

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
    description: '',
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
    bus_number: 0,
    details: {
      description: '',
      inclusions: [''],
      itinerary: [
        {
          time: '',
          title: '',
          description: '',
        },
      ],
      meeting_point: '',
      requirements: [''],
      recommendations: [''],
    },
  }
  uploadedImage.value = null
  imagePreview.value = ''
  imageUploading.value = false
}

// Наблюдаем за изменениями редактируемой карточки
watch(
  () => props.editingCard,
  (card) => {
    if (card) {
      formData.value = {
        title: card.title,
        category: card.category,
        description: card.description,
        date: card.date,
        price: card.price,
        duration: card.duration,
        people_amount: card.people_amount,
        people_left: card.people_left,
        image_url: card.image_url,
        is_active: card.is_active,
        bus_number: card.bus_number,
        details: props.editingDetails || {
          description: '',
          inclusions: [''],
          itinerary: [
            {
              time: '',
              title: '',
              description: '',
            },
          ],
          meeting_point: '',
          requirements: [''],
          recommendations: [''],
        },
      }

      // Если есть изображение, показываем его как превью
      if (card.image_url) {
        imagePreview.value = card.image_url
      }
    } else {
      resetForm()
    }
  },
  { immediate: true },
)

// Наблюдаем за изменениями детальной информации
watch(
  () => props.editingDetails,
  (details) => {
    if (details && props.editingCard) {
      formData.value.details = {
        description: details.description || '',
        inclusions: details.inclusions?.length ? details.inclusions : [''],
        itinerary: details.itinerary?.length
          ? details.itinerary
          : [
              {
                time: '',
                title: '',
                description: '',
              },
            ],
        meeting_point: details.meeting_point || '',
        requirements: details.requirements?.length ? details.requirements : [''],
        recommendations: details.recommendations?.length ? details.recommendations : [''],
      }
    }
  },
)

// Наблюдаем за видимостью формы
watch(
  () => props.visible,
  (visible) => {
    if (!visible) {
      resetForm()
    }
  },
)

// Обработчик отмены
const handleCancel = () => {
  emit('cancel')
  emit('update:visible', false)
}
</script>

<style scoped>
/* Стили для загрузки изображений */
.image-upload-section {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.image-preview {
  position: relative;
  width: 100%;
  max-width: 300px;
  border-radius: 8px;
  overflow: hidden;
  border: 2px solid var(--border-green-light);
}

.preview-image {
  width: 100%;
  height: 200px;
  object-fit: cover;
  display: block;
}

.remove-image-btn {
  position: absolute;
  top: 8px;
  right: 8px;
  background: rgba(220, 53, 69, 0.9);
  color: white;
  border: none;
  border-radius: 50%;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  font-size: 18px;
  transition: all 0.3s ease;
}

.remove-image-btn:hover:not(:disabled) {
  background: #c82333;
  transform: scale(1.1);
}

.upload-options {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.file-input {
  display: none;
}

.upload-buttons {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
}

.upload-btn {
  flex: 1;
  padding: 12px 16px;
  border: 2px solid var(--border-green-light);
  border-radius: 8px;
  background: white;
  cursor: pointer;
  font-size: 0.9rem;
  transition: all 0.3s ease;
  min-width: 140px;
}

.upload-btn.primary {
  background: var(--green-primary);
  color: white;
  border-color: var(--green-primary);
}

.upload-btn.primary:hover:not(:disabled) {
  background: var(--green-dark);
  border-color: var(--green-dark);
}

.upload-btn.secondary {
  background: white;
  color: var(--text-dark);
  border-color: var(--border-green-medium);
}

.upload-btn.secondary:hover:not(:disabled) {
  background: var(--green-bg-light);
  border-color: var(--green-primary);
}

.upload-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  transform: none !important;
}

.url-option {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.url-divider {
  text-align: center;
  color: var(--text-light);
  font-size: 0.8rem;
  position: relative;
}

.url-divider::before,
.url-divider::after {
  content: '';
  position: absolute;
  top: 50%;
  width: 30%;
  height: 1px;
  background: var(--border-green-light);
}

.url-divider::before {
  left: 0;
}

.url-divider::after {
  right: 0;
}

.url-input {
  width: 100%;
  padding: 12px;
  border: 2px solid var(--border-turquoise);
  border-radius: 8px;
  font-size: 1rem;
  transition: all 0.3s ease;
  background: white;
}

.url-input:focus {
  outline: none;
  border-color: var(--green-primary);
  box-shadow: 0 0 0 3px var(--hover-turquoise);
}

.url-input:disabled {
  background: #f8f9fa;
  color: #6c757d;
}

.upload-status {
  padding: 10px 12px;
  border-radius: 6px;
  font-size: 0.9rem;
  font-weight: 500;
}

.upload-status.success {
  background: #d4edda;
  color: #155724;
  border: 1px solid #c3e6cb;
}

.upload-status.error {
  background: #f8d7da;
  color: #721c24;
  border: 1px solid #f5c6cb;
}

.upload-status.info {
  background: #d1ecf1;
  color: #0c5460;
  border: 1px solid #bee5eb;
}

.upload-hints {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.upload-hints small {
  color: var(--text-light);
  font-size: 0.75rem;
}

/* Адаптивность */
@media (max-width: 768px) {
  .upload-buttons {
    flex-direction: column;
  }

  .upload-btn {
    min-width: auto;
  }

  .image-preview {
    max-width: 100%;
  }

  .preview-image {
    height: 150px;
  }
}

@media (max-width: 480px) {
  .upload-options {
    gap: 8px;
  }

  .upload-btn {
    padding: 10px 12px;
    font-size: 0.85rem;
  }
}

/* Предотвращение зума на мобильных */
@media (max-width: 768px) {
  .url-input,
  .upload-btn {
    font-size: 16px;
    min-height: 44px;
  }
}

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
