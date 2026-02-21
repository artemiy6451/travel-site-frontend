<template>
  <div v-if="visible" class="form-overlay">
    <div class="form-container">
      <h2>{{ editingCard ? 'Редактировать' : 'Добавить' }} экскурсию</h2>

      <!-- Блок для создания копии с другой датой (только в режиме редактирования) -->
      <div v-if="editingCard" class="duplicate-section">
        <h3 class="section-title">Создать копию с другой датой</h3>
        <div class="duplicate-form">
          <div class="form-row">
            <div class="form-group">
              <label>Дополнительная дата отправления</label>
              <input
                v-model="duplicateDate"
                type="datetime-local"
                :disabled="duplicateLoading"
                class="duplicate-date-input"
              />
            </div>
            <div class="form-group duplicate-actions">
              <BaseButton
                type="button"
                variant="secondary"
                :loading="duplicateLoading"
                :disabled="!duplicateDate || duplicateLoading"
                @click="handleDuplicate"
                class="duplicate-btn"
              >
                {{ duplicateLoading ? 'Создание...' : 'Добавить копию' }}
              </BaseButton>
            </div>
          </div>
          <small class="duplicate-hint">
            Будет создана новая экскурсия со всеми текущими данными, но с указанной датой отправления
          </small>
        </div>
      </div>

      <form @submit.prevent="handleSubmit" class="card-form">
        <!-- Основная информация -->
        <div class="form-section">
          <h3 class="section-title">Основная информация</h3>

          <div class="form-row">
            <div class="form-group">
              <label>Название *</label>
              <input v-model="formData.title" type="text" required placeholder="Название экскурсии"
                :disabled="loading" />
            </div>
          </div>

          <!-- НОВЫЙ БЛОК: Тип экскурсии -->
          <div class="form-row">
            <div class="form-group">
              <label>Тип *</label>
              <div class="type-selector">
                <button
                  type="button"
                  class="type-btn"
                  :class="{ active: formData.type === 'excursion' }"
                  @click="formData.type = 'excursion'"
                  :disabled="loading"
                >
                  <span class="type-icon">🚶</span>
                  <span class="type-label">Экскурсия</span>
                  <span class="type-description">Однодневная экскурсия</span>
                </button>
                <button
                  type="button"
                  class="type-btn"
                  :class="{ active: formData.type === 'tour' }"
                  @click="formData.type = 'tour'"
                  :disabled="loading"
                >
                  <span class="type-icon">🏕️</span>
                  <span class="type-label">Тур</span>
                  <span class="type-description">Многодневный тур с проживанием</span>
                </button>
              </div>
            </div>
          </div>

          <!-- НОВЫЙ БЛОК: Города отправления -->
          <div class="form-group">
            <label>Города отправления *</label>
            <div class="cities-section">
              <!-- Список выбранных городов -->
              <div v-if="formData.cities.length > 0" class="selected-cities">
                <div v-for="(city, index) in formData.cities" :key="index" class="city-tag">
                  <span class="city-name">{{ city }}</span>
                  <button
                    type="button"
                    class="remove-city-btn"
                    @click="removeCity(index)"
                    :disabled="loading"
                    title="Удалить город"
                  >
                    ×
                  </button>
                </div>
              </div>

              <!-- Добавление нового города -->
              <div class="add-city-section">
                <!-- Предустановленные города -->
                <div class="preset-cities">
                  <span class="preset-label">Популярные:</span>
                  <div class="preset-buttons">
                    <button
                      v-for="city in cityPresets"
                      :key="city"
                      type="button"
                      class="preset-city-btn"
                      :class="{ disabled: isCitySelected(city) }"
                      @click="addPresetCity(city)"
                      :disabled="loading || isCitySelected(city)"
                    >
                      {{ city }}
                    </button>
                  </div>
                </div>

                <!-- Добавление своего города -->
                <div class="custom-city-add">
                  <div class="custom-city-input-group">
                    <input
                      v-model="newCity"
                      type="text"
                      placeholder="Введите свой город"
                      class="custom-city-input"
                      :disabled="loading"
                      @keyup.enter="addCustomCity"
                    />
                    <button
                      type="button"
                      class="add-city-btn"
                      @click="addCustomCity"
                      :disabled="loading || !newCity.trim()"
                    >
                      Добавить
                    </button>
                  </div>
                </div>
              </div>

              <!-- Подсказки -->
              <div class="cities-hints">
                <small>• Выберите город из списка или добавьте свой</small>
                <small>• Можно добавить несколько городов отправления</small>
                <small>• Первый город будет основным</small>
              </div>
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
              <input v-model="formData.date" type="datetime-local" required :disabled="loading" />
            </div>

            <div class="form-group">
              <label>Цена (руб) *</label>
              <input v-model.number="formData.price" type="number" required min="0" placeholder="2500"
                :disabled="loading" />
            </div>
          </div>

          <div class="form-row">
            <div class="form-group">
              <label>Количество человек *</label>
              <input v-model.number="formData.people_amount" type="number" required min="1" placeholder="8"
                :disabled="loading" />
            </div>
          </div>

          <!-- Раздел для фотографий -->
          <div class="form-group">
            <label>Фотографии экскурсии *</label>
            <div class="photos-section">
              <!-- Карусель для предпросмотра фоток -->
              <div v-if="uploadedImages.length > 0" class="photos-carousel">
                <h4>Загруженные фотографии ({{ uploadedImages.length }})</h4>

                <!-- Компонент карусели с возможностью удаления -->
                <div class="image-carousel-admin">
                  <div class="carousel-scroll-container">
                    <div class="carousel-scroll-track"
                      :style="{ transform: `translateX(-${currentImageIndex * 100}%)` }">
                      <div v-for="(image, index) in uploadedImages" :key="image.id" class="carousel-image-item">
                        <img :src="image.url" :alt="`Фото ${index + 1}`" class="carousel-image" />

                        <!-- Кнопка удаления -->
                        <button type="button" class="delete-image-btn" @click="removeUploadedImage(index)"
                          :disabled="uploadedImages.length <= 1" title="Удалить фото">
                          🗑️
                        </button>
                      </div>
                    </div>

                    <!-- Индикаторы -->
                    <div class="carousel-indicators" v-if="uploadedImages.length > 1">
                      <button v-for="(_, index) in uploadedImages" :key="index" class="indicator-dot" type="button"
                        :class="{ active: currentImageIndex === index }" @click.stop="goToImage(index)"></button>
                    </div>

                    <!-- Кнопки навигации -->
                    <button v-if="currentImageIndex > 0" class="carousel-nav-btn prev-btn" @click.stop="prevImage"
                      title="Предыдущее фото" type="button">
                      ‹
                    </button>
                    <button v-if="currentImageIndex < uploadedImages.length - 1" class="carousel-nav-btn next-btn"
                      @click.stop="nextImage" title="Следующее фото" type="button">
                      ›
                    </button>
                  </div>
                </div>
              </div>

              <!-- Загрузка новых фоток -->
              <div class="image-upload-section">
                <!-- Кнопки загрузки -->
                <div class="upload-options">
                  <input type="file" ref="fileInput" accept="image/*" @change="handleFileSelect" multiple
                    class="file-input" :disabled="loading" />

                  <div class="upload-buttons">
                    <button type="button" class="upload-btn primary" @click="triggerFileInput" :disabled="loading">
                      📁 Выбрать файлы
                    </button>
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
                  <small>• Первое фото будет главным</small>
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
            <textarea v-model="formData.details.description"
              placeholder="Подробное описание маршрута, особенности, что увидят туристы..." rows="4"
              :disabled="loading"></textarea>
            <small>Это описание будет отображаться на странице экскурсии</small>
          </div>

          <!-- Место сбора -->
          <div class="form-group">
            <label>Место сбора</label>
            <input v-model="formData.details.meeting_point" type="text"
              placeholder="Например: Центральная площадь, у фонтана" :disabled="loading" />
          </div>

          <!-- Что входит в экскурсию -->
          <div class="form-group">
            <label>Что входит в экскурсию</label>
            <div class="array-input">
              <div v-for="(_, index) in formData.details.inclusions" :key="index" class="array-item">
                <input v-model="formData.details.inclusions[index]" type="text" :placeholder="`Пункт ${index + 1}`"
                  :disabled="loading" />
                <button type="button" class="remove-btn" @click="removeInclusion(index)" :disabled="loading">
                  ×
                </button>
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
              <div v-for="(_, index) in formData.details.requirements" :key="index" class="array-item">
                <input v-model="formData.details.requirements[index]" type="text"
                  :placeholder="`Требование ${index + 1}`" :disabled="loading" />
                <button type="button" class="remove-btn" @click="removeRequirement(index)" :disabled="loading">
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
              <div v-for="(_, index) in formData.details.recommendations" :key="index" class="array-item">
                <input v-model="formData.details.recommendations[index]" type="text"
                  :placeholder="`Рекомендация ${index + 1}`" :disabled="loading" />
                <button type="button" class="remove-btn" @click="removeRecommendation(index)" :disabled="loading">
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
              <div v-for="(item, index) in formData.details.itinerary" :key="index" class="itinerary-item">
                <div class="itinerary-header">
                  <h4>Пункт {{ index + 1 }}</h4>
                  <button type="button" class="remove-btn" @click="removeItineraryItem(index)" :disabled="loading">
                    ×
                  </button>
                </div>
                <div class="form-row">
                  <div class="form-group">
                    <label>Время</label>
                    <input v-model="item.time" type="text" placeholder="09:00" :disabled="loading" />
                  </div>
                  <div class="form-group">
                    <label>Заголовок</label>
                    <input v-model="item.title" type="text" placeholder="Сбор группы" :disabled="loading" />
                  </div>
                </div>
                <div class="form-group">
                  <label>Описание</label>
                  <textarea v-model="item.description" placeholder="Подробное описание этапа..." rows="2"
                    :disabled="loading"></textarea>
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

          <BaseButton type="submit" variant="primary" :loading="loading" :loading-text="getLoadingText">
            {{ editingCard ? 'Сохранить' : 'Добавить' }}
          </BaseButton>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, computed } from 'vue'
import { type Excursion, type ExcursionCreate, type ExcursionImage } from '@/types/excursion'
import BaseButton from '@/components/UI/BaseButton.vue'
import { api } from '@/utils/api'

// Тип экскурсии
type ExcursionType = 'excursion' | 'tour'

interface Props {
  visible: boolean
  loading?: boolean
  editingCard?: Excursion | null
  editingDetails?: any | null
}

interface Emits {
  (e: 'submit', data: {
    new: boolean
    excursion: ExcursionCreate
    details: any
    imagesToAdd: File[]
    imagesToDelete: number[]
    uploadedImages: ExcursionImage[]
  }): void
  (e: 'cancel'): void
  (e: 'update:visible', value: boolean): void
  (e: 'duplicate', data: {
    excursion: ExcursionCreate
    details: any
    imagesToAdd: File[]
    date: string
  }): void // Новый emit для дублирования
}

const props = withDefaults(defineProps<Props>(), {
  loading: false,
  editingCard: null,
  editingDetails: null,
})

const emit = defineEmits<Emits>()

// Рефы
const fileInput = ref<HTMLInputElement | null>(null)

// Данные для фотографий
const uploadedImages = ref<ExcursionImage[]>([]) // Массив загруженных изображений
const currentImageIndex = ref(0)
const uploadStatus = ref<{ type: 'success' | 'error' | 'info'; message: string } | null>(null)

// Массивы для отслеживания изменений
const imagesToDelete = ref<number[]>([]) // ID изображений для удаления
const imagesToAdd = ref<File[]>([]) // Новые файлы для загрузки

// Данные для дублирования
const duplicateDate = ref<Date>()
const duplicateLoading = ref(false)

// Данные для городов
const cityPresets = ref<string[]>([
  'Симферополь',
  'Бахчисарай',
  'Севастополь',
])
const newCity = ref('')


// Вычисляемое свойство для текста загрузки
const getLoadingText = computed(() => {
  if (props.loading) return 'Сохранение...'
  return 'Загрузка...'
})

// Данные формы
const formData = ref({
  type: 'excursion' as ExcursionType,
  title: '',
  description: '',
  date: new Date(),
  price: 0,
  people_amount: 0,
  people_left: 0,
  is_active: true,
  bus_number: 0,
  cities: [] as string[],

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

// Методы для работы с городами
const isCitySelected = (city: string): boolean => {
  return formData.value.cities.includes(city)
}

const addPresetCity = (city: string) => {
  if (!isCitySelected(city)) {
    formData.value.cities.push(city)
  }
}

const addCustomCity = () => {
  const trimmedCity = newCity.value.trim()
  if (trimmedCity && !isCitySelected(trimmedCity)) {
    formData.value.cities.push(trimmedCity)
    newCity.value = '' // Очищаем поле ввода
  } else if (isCitySelected(trimmedCity)) {
    showUploadStatus('info', 'Этот город уже добавлен')
  }
}

const removeCity = (index: number) => {
  if (formData.value.cities.length > 1) {
    formData.value.cities.splice(index, 1)
  } else {
    showUploadStatus('error', 'Должен быть хотя бы один город отправления')
  }
}

// Триггер выбора файла
const triggerFileInput = () => {
  fileInput.value?.click()
}

// Обработка выбора файлов
const handleFileSelect = async (event: Event) => {
  const target = event.target as HTMLInputElement
  const files = Array.from(target.files || [])

  if (files.length === 0) return

  let successfulValidations = 0

  for (const file of files) {
    try {
      // Валидация файла
      if (!validateImageFile(file)) continue

      // Создаем временный URL для предпросмотра
      const previewUrl = URL.createObjectURL(file)

      // Добавляем во временный массив для предпросмотра
      uploadedImages.value.push({
        id: -Date.now() - successfulValidations, // Отрицательный ID для временных изображений
        url: previewUrl,
        excursion_id: props.editingCard?.id || 0,
        file: file
      })

      // Добавляем в массив для загрузки
      imagesToAdd.value.push(file)

      successfulValidations++

    } catch (error) {
      console.error('File validation error:', error)
      showUploadStatus('error', `Ошибка валидации файла ${file.name}`)
    }
  }

  if (successfulValidations > 0) {
    showUploadStatus('success', `Добавлено ${successfulValidations} изображений для загрузки`)
  }

  // Сброс input файла
  if (target) {
    target.value = ''
  }
}

// Валидация изображения
const validateImageFile = (file: File): boolean => {
  const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp']

  if (!validTypes.includes(file.type)) {
    showUploadStatus('error', `Неподдерживаемый формат файла: ${file.name}. Используйте JPG, PNG или WebP.`)
    return false
  }

  // Проверка размера файла (5MB)
  const maxSize = 5 * 1024 * 1024
  if (file.size > maxSize) {
    showUploadStatus('error', `Файл слишком большой: ${file.name} (${(file.size / 1024 / 1024).toFixed(2)} MB). Максимум: 5MB`)
    return false
  }

  return true
}

// Удаление загруженного изображения
const removeUploadedImage = async (index: number) => {
  const image = uploadedImages.value[index]

  // Проверяем, можно ли удалить
  if (uploadedImages.value.length <= 1) {
    showUploadStatus('error', 'Необходимо хотя бы одно изображение')
    return
  }

  // Если это существующее изображение (имеет положительный ID)
  if (image.id > 0) {
    // Добавляем в список для удаления
    imagesToDelete.value.push(image.id)
  }

  // Если это временное изображение (отрицательный ID)
  if (image.id < 0) {
    // Находим и удаляем соответствующий файл из массива для загрузки
    const fileIndex = imagesToAdd.value.findIndex((_, i) => {
      const tempImage = uploadedImages.value.find(img => img.id < 0 && img.file)
      return tempImage?.id === image.id
    })
    if (fileIndex !== -1) {
      imagesToAdd.value.splice(fileIndex, 1)
    }
  }

  // Удаляем из отображаемого массива
  uploadedImages.value.splice(index, 1)

  // Корректируем текущий индекс если нужно
  if (currentImageIndex.value >= uploadedImages.value.length && uploadedImages.value.length > 0) {
    currentImageIndex.value = uploadedImages.value.length - 1
  } else if (uploadedImages.value.length === 0) {
    currentImageIndex.value = 0
  }


  showUploadStatus('info', 'Изображение помечено для удаления')
}

// Навигация по карусели
const nextImage = () => {
  if (currentImageIndex.value < uploadedImages.value.length - 1) {
    currentImageIndex.value++
  }
}

const prevImage = () => {
  if (currentImageIndex.value > 0) {
    currentImageIndex.value--
  }
}

const goToImage = (index: number) => {
  currentImageIndex.value = index
}

// Показать статус загрузки
const showUploadStatus = (type: 'success' | 'error' | 'info', message: string) => {
  uploadStatus.value = { type, message }
  setTimeout(() => {
    uploadStatus.value = null
  }, 3000)
}

// Обработчик дублирования экскурсии
const handleDuplicate = async () => {
  if (!duplicateDate.value) {
    showUploadStatus('error', 'Выберите дату для новой экскурсии')
    return
  }

  duplicateLoading.value = true

  try {
    // Подготовка данных экскурсии (берем текущие данные из формы)
    const excursionData: ExcursionCreate = {
      type: formData.value.type,
      title: formData.value.title,
      description: formData.value.description,
      date: duplicateDate.value, // Используем новую дату
      price: formData.value.price,
      people_amount: formData.value.people_amount,
      people_left: formData.value.people_amount, // people_left = people_amount для новой экскурсии
      is_active: formData.value.is_active,
      bus_number: formData.value.bus_number,
      cities: formData.value.cities,
    }

    // Очистка детальной информации
    const cleanedDetails = {
      ...formData.value.details,
      inclusions: formData.value.details.inclusions.filter((item) => item.trim() !== ''),
      requirements: formData.value.details.requirements.filter((item) => item.trim() !== ''),
      recommendations: formData.value.details.recommendations.filter((item) => item.trim() !== ''),
      itinerary: formData.value.details.itinerary.filter((item) => item.title.trim() !== ''),
    }

    // Отправляем событие на создание дубликата
    emit('duplicate', {
      new: true,
      excursion: excursionData,
      details: cleanedDetails,
      imagesToAdd: imagesToAdd.value,
      imagesToDelete: imagesToDelete.value,
      uploadedImages: uploadedImages.value,
    })

    // Очищаем поле даты после успешной отправки
    duplicateDate.value = ''

    showUploadStatus('success', 'Запрос на создание копии отправлен')

  } catch (error) {
    console.error('Error duplicating excursion:', error)
    showUploadStatus('error', 'Ошибка при создании копии')
  } finally {
    duplicateLoading.value = false
  }
}

// Обработчик отправки формы
const handleSubmit = async () => {
  // Валидация
  if (
    !formData.value.title ||
    !formData.value.description ||
    !formData.value.date ||
    formData.value.price <= 0 ||
    formData.value.people_amount <= 0 ||
    formData.value.cities.length === 0
  ) {
    showUploadStatus('error', 'Заполните все обязательные поля')
    return
  }

  // Проверка изображений
  if (uploadedImages.value.length === 0) {
    showUploadStatus('error', 'Добавьте хотя бы одно изображение экскурсии')
    return
  }

  // Подготовка данных экскурсии
  const excursionData: ExcursionCreate = {
    type: formData.value.type,
    title: formData.value.title,
    description: formData.value.description,
    date: formData.value.date,
    price: formData.value.price,
    people_amount: formData.value.people_amount,
    people_left: formData.value.people_left,
    is_active: formData.value.is_active,
    bus_number: formData.value.bus_number,
    cities: formData.value.cities,
  }

  // Очистка детальной информации
  const cleanedDetails = {
    ...formData.value.details,
    inclusions: formData.value.details.inclusions.filter((item) => item.trim() !== ''),
    requirements: formData.value.details.requirements.filter((item) => item.trim() !== ''),
    recommendations: formData.value.details.recommendations.filter((item) => item.trim() !== ''),
    itinerary: formData.value.details.itinerary.filter((item) => item.title.trim() !== ''),
  }

  // Отправка данных через emit
  emit('submit', {
    new: false,
    excursion: excursionData,
    details: cleanedDetails,
    imagesToAdd: imagesToAdd.value,
    imagesToDelete: imagesToDelete.value,
    uploadedImages: uploadedImages.value
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
    type: 'excursion',
    title: '',
    description: '',
    date: new Date(),
    price: 0,
    people_amount: 0,
    people_left: 0,
    is_active: true,
    bus_number: 0,
    cities: [],
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

  uploadedImages.value = []
  currentImageIndex.value = 0
  imagesToDelete.value = []
  imagesToAdd.value = []
  duplicateDate.value = '' // Сбрасываем дату дублирования
  newCity.value = ''
}

// Загрузка изображений существующей экскурсии
const loadExistingImages = async (excursionId: number) => {
  try {
    const images = await api.excursions.getExcursionImages(excursionId)
    uploadedImages.value = images

  } catch (error) {
    console.error('Error loading existing images:', error)
  }
}

// Наблюдаем за изменениями редактируемой карточки
watch(
  () => props.editingCard,
  async (card) => {
    if (card) {
      formData.value = {
        type: card.type || "excursion",
        title: card.title,
        description: card.description,
        date: card.date,
        price: card.price,
        people_amount: card.people_amount,
        people_left: card.people_left,
        is_active: card.is_active,
        bus_number: card.bus_number,
        cities: card.cities || [],
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
      // Загружаем существующие изображения
      await loadExistingImages(card.id)

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
/* Новые стили для выбора типа */
.type-selector {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 15px;
  margin-top: 5px;
}

.type-btn {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  padding: 20px 15px;
  background: var(--white);
  border: 2px solid var(--border-green-light);
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.3s ease;
  width: 100%;
}

.type-btn:hover:not(:disabled) {
  border-color: var(--green-primary);
  background: var(--green-bg-light);
  transform: translateY(-2px);
  box-shadow: 0 4px 12px var(--shadow-green-light);
}

.type-btn.active {
  border-color: var(--green-primary);
  background: var(--green-bg-light);
  box-shadow: 0 4px 12px var(--shadow-green-light);
  position: relative;
}

.type-btn.active::before {
  content: '✓';
  position: absolute;
  top: 10px;
  right: 10px;
  width: 20px;
  height: 20px;
  background: var(--green-primary);
  color: white;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  font-weight: bold;
}

.type-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.type-icon {
  font-size: 2rem;
  margin-bottom: 10px;
}

.type-label {
  font-size: 1.1rem;
  font-weight: 600;
  color: var(--text-dark);
  margin-bottom: 5px;
}

.type-description {
  font-size: 0.8rem;
  color: var(--text-light);
  line-height: 1.3;
}

/* Адаптивность для выбора типа */
@media (max-width: 768px) {
  .type-selector {
    grid-template-columns: 1fr;
    gap: 10px;
  }

  .type-btn {
    flex-direction: row;
    text-align: left;
    gap: 15px;
    padding: 15px;
  }

  .type-icon {
    font-size: 1.5rem;
    margin-bottom: 0;
  }

  .type-btn.active::before {
    top: 50%;
    transform: translateY(-50%);
    right: 15px;
  }
}

@media (max-width: 480px) {
  .type-btn {
    padding: 12px;
    gap: 10px;
  }

  .type-icon {
    font-size: 1.3rem;
  }

  .type-label {
    font-size: 1rem;
  }

  .type-description {
    font-size: 0.75rem;
  }
}
/* Новые стили для городов */
.cities-section {
  display: flex;
  flex-direction: column;
  gap: 15px;
  background: white;
  padding: 15px;
  border-radius: 8px;
  border: 2px solid var(--border-turquoise);
}

.selected-cities {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  min-height: 40px;
}

.city-tag {
  display: flex;
  align-items: center;
  gap: 5px;
  background: var(--green-primary);
  color: white;
  padding: 5px 10px;
  border-radius: 20px;
  font-size: 0.9rem;
  transition: all 0.3s ease;
}

.city-name {
  max-width: 150px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.remove-city-btn {
  background: none;
  border: none;
  color: white;
  font-size: 1.2rem;
  cursor: pointer;
  width: 20px;
  height: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  transition: background 0.3s ease;
  padding: 0;
}

.remove-city-btn:hover:not(:disabled) {
  background: rgba(255, 255, 255, 0.2);
}

.remove-city-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.add-city-section {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.preset-cities {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 10px;
}

.preset-label {
  font-size: 0.9rem;
  color: var(--text-medium);
  font-weight: 500;
  min-width: 80px;
}

.preset-buttons {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  flex: 1;
}

.preset-city-btn {
  padding: 8px 16px;
  background: var(--white);
  border: 2px solid var(--border-green-light);
  border-radius: 20px;
  font-size: 0.9rem;
  color: var(--text-dark);
  cursor: pointer;
  transition: all 0.3s ease;
}

.preset-city-btn:hover:not(:disabled) {
  background: var(--green-bg-light);
  border-color: var(--green-primary);
  transform: translateY(-2px);
}

.preset-city-btn.disabled {
  opacity: 0.5;
  cursor: not-allowed;
  background: var(--border-green-light);
}

.custom-city-add {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.custom-city-input-group {
  display: flex;
  gap: 10px;
}

.custom-city-input {
  flex: 1;
  padding: 10px 12px;
  border: 2px solid var(--border-turquoise);
  border-radius: 8px;
  font-size: 1rem;
  transition: all 0.3s ease;
}

.custom-city-input:focus {
  outline: none;
  border-color: var(--green-primary);
  box-shadow: 0 0 0 3px var(--hover-turquoise);
}

.custom-city-input:disabled {
  background: #f8f9fa;
  cursor: not-allowed;
}

.add-city-btn {
  padding: 10px 20px;
  background: var(--green-primary);
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 0.9rem;
  cursor: pointer;
  transition: background 0.3s ease;
  white-space: nowrap;
}

.add-city-btn:hover:not(:disabled) {
  background: var(--green-dark);
}

.add-city-btn:disabled {
  background: #6c757d;
  cursor: not-allowed;
}

.cities-hints {
  display: flex;
  flex-direction: column;
  gap: 5px;
  margin-top: 10px;
  padding-top: 10px;
  border-top: 1px dashed var(--border-green-light);
}

.cities-hints small {
  color: var(--text-light);
  font-size: 0.8rem;
}

/* Адаптивность для блока городов */
@media (max-width: 768px) {
  .preset-cities {
    flex-direction: column;
    align-items: flex-start;
  }

  .preset-buttons {
    width: 100%;
  }

  .custom-city-input-group {
    flex-direction: column;
  }

  .add-city-btn {
    width: 100%;
  }

  .city-tag {
    max-width: calc(50% - 5px);
  }

  .city-name {
    max-width: 120px;
  }
}

@media (max-width: 480px) {
  .city-tag {
    max-width: 100%;
  }

  .city-name {
    max-width: none;
  }

  .preset-buttons {
    gap: 5px;
  }

  .preset-city-btn {
    padding: 6px 12px;
    font-size: 0.85rem;
  }
}
/* Добавляем новые стили для блока дублирования */
.duplicate-section {
  border: 2px dashed var(--green-primary);
  border-radius: 12px;
  padding: 20px;
  margin-bottom: 30px;
  background: var(--green-bg-light);
}

.duplicate-form {
  margin-top: 15px;
}

.duplicate-actions {
  display: flex;
  align-items: flex-end;
}

.duplicate-date-input {
  width: 100%;
  padding: 12px;
  border: 2px solid var(--border-turquoise);
  border-radius: 8px;
  font-size: 1rem;
  transition: all 0.3s ease;
  background: white;
}

.duplicate-date-input:focus {
  outline: none;
  border-color: var(--green-primary);
  box-shadow: 0 0 0 3px var(--hover-turquoise);
}

.duplicate-btn {
  width: 100%;
  background: var(--green-primary);
  color: white;
  border: none;
  border-radius: 8px;
  padding: 12px 20px;
  font-size: 1rem;
  cursor: pointer;
  transition: background 0.3s ease;
}

.duplicate-btn:hover:not(:disabled) {
  background: var(--green-dark);
}

.duplicate-btn:disabled {
  background: #6c757d;
  cursor: not-allowed;
  opacity: 0.7;
}

.duplicate-hint {
  display: block;
  margin-top: 10px;
  color: var(--text-light);
  font-size: 0.85rem;
  font-style: italic;
}

/* Адаптивность для блока дублирования */
@media (max-width: 768px) {
  .duplicate-section .form-row {
    grid-template-columns: 1fr;
    gap: 10px;
  }

  .duplicate-actions {
    align-items: stretch;
  }

  .duplicate-btn {
    width: 100%;
  }
}

@media (max-width: 480px) {
  .duplicate-section {
    padding: 15px;
  }

  .duplicate-section .section-title {
    font-size: 1rem;
  }
}
/* Основные стили формы остаются без изменений */
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

/* Стили для раздела фотографий */
.photos-section {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.photos-carousel h4 {
  margin-bottom: 15px;
  color: var(--text-dark);
  font-size: 1.1rem;
}

/* Карусель для админки */
.image-carousel-admin {
  position: relative;
  width: 100%;
  height: 300px;
  border-radius: 10px;
  overflow: hidden;
  border: 2px solid var(--border-green-light);
  background: #f8f9fa;
}

.carousel-scroll-container {
  position: relative;
  width: 100%;
  height: 100%;
  overflow: hidden;
}

.carousel-scroll-track {
  display: flex;
  height: 100%;
  transition: transform 0.3s ease;
}

.carousel-image-item {
  flex: 0 0 100%;
  min-width: 100%;
  height: 100%;
  position: relative;
}

.carousel-image {
  width: 100%;
  height: 100%;
  object-fit: contain;
  background: white;
}

/* Кнопка удаления на изображении */
.delete-image-btn {
  position: absolute;
  top: 10px;
  right: 10px;
  background: rgba(220, 53, 69, 0.9);
  color: white;
  border: none;
  border-radius: 50%;
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  font-size: 18px;
  transition: all 0.3s ease;
  z-index: 10;
}

.delete-image-btn:hover:not(:disabled) {
  background: #c82333;
  transform: scale(1.1);
}

.delete-image-btn:disabled {
  background: #6c757d;
  cursor: not-allowed;
  opacity: 0.7;
}

/* Одно изображение */
.single-image-admin {
  width: 100%;
  height: 100%;
}

.single-image-wrapper {
  position: relative;
  width: 100%;
  height: 100%;
}

/* Индикаторы точек */
.carousel-indicators {
  position: absolute;
  bottom: 15px;
  left: 0;
  right: 0;
  display: flex;
  justify-content: center;
  gap: 8px;
  z-index: 5;
}

.indicator-dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.6);
  border: none;
  cursor: pointer;
  padding: 0;
  transition: all 0.3s ease;
}

.indicator-dot:hover {
  background: rgba(255, 255, 255, 0.9);
  transform: scale(1.2);
}

.indicator-dot.active {
  background: white;
  transform: scale(1.2);
  box-shadow: 0 0 10px rgba(255, 255, 255, 0.8);
}

/* Кнопки навигации карусели */
.carousel-nav-btn {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.9);
  border: 1px solid rgba(0, 0, 0, 0.1);
  color: #333;
  font-size: 20px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 5;
  transition: all 0.3s ease;
  opacity: 0.8;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
}

.carousel-nav-btn:hover {
  background: white;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
  transform: translateY(-50%) scale(1.1);
  opacity: 1;
}

.carousel-nav-btn:disabled {
  opacity: 0.3;
  cursor: not-allowed;
  transform: translateY(-50%) !important;
}

.prev-btn {
  left: 15px;
}

.next-btn {
  right: 15px;
}

/* Загрузка изображений */
.upload-options {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.file-input {
  display: none;
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
  width: 100%;
}

.upload-btn.primary {
  background: var(--green-primary);
  color: white;
  border-color: var(--green-primary);
}

.url-inputs {
  display: flex;
  gap: 10px;
  align-items: center;
}

.url-input {
  flex: 1;
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

.add-url-btn {
  padding: 12px 20px;
  background: var(--green-primary);
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-size: 1.2rem;
  transition: background 0.3s ease;
  min-width: 60px;
}

.add-url-btn:hover:not(:disabled) {
  background: var(--green-dark);
}

.add-url-btn:disabled {
  background: #6c757d;
  cursor: not-allowed;
}

/* Адаптивность карусели */
@media (max-width: 768px) {
  .image-carousel-admin {
    height: 250px;
  }

  .carousel-nav-btn {
    width: 36px;
    height: 36px;
    font-size: 16px;
  }

  .delete-image-btn {
    width: 36px;
    height: 36px;
    font-size: 16px;
  }

  .order-buttons {
    flex-direction: column;
  }
}

@media (max-width: 480px) {
  .image-carousel-admin {
    height: 200px;
  }

  .carousel-nav-btn {
    width: 32px;
    height: 32px;
    font-size: 14px;
  }

  .delete-image-btn {
    width: 32px;
    height: 32px;
    font-size: 14px;
  }

  .url-inputs {
    flex-direction: column;
  }

  .add-url-btn {
    width: 100%;
  }
}

/* Остальные стили остаются без изменений */
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
