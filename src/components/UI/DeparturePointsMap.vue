<template>
  <div class="map-container">
    <yandex-map v-model="map" :settings="{
      location: {
        center: mapCenter,
        zoom: mapZoom,
      },
      showScaleInCopyrights: true,
    }" width="100%" height="100%" >

      <yandex-map-default-scheme-layer />
      <yandex-map-default-features-layer />

      <!-- Маркеры для каждой точки отправления -->
      <yandex-map-default-marker
        v-for="point in props.points"
        :key="point.id"
        :settings="{
        coordinates: point.coordinates,
        title: point.city,
        color: 'red',
        onClick: () => onMarkerClick(),
        popup: { position: 'top', show },
      }">
        <template #popup>
          <div class="marker-popup">
            {{ point.description }}
            <button @click="selectPoint(point)" type="button">
              Выбрать
            </button>
          </div>
        </template>
      </yandex-map-default-marker>

    </yandex-map>

    <!-- Загрузчик -->
    <div v-if="loading" class="map-loader">
      <div class="loader"></div>
      <p>Загрузка карты...</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import {
  YandexMap,
  YandexMapDefaultSchemeLayer,
  YandexMapDefaultFeaturesLayer,
  YandexMapDefaultMarker,
} from 'vue-yandex-maps'

interface Props {
  points: DeparturePoint[]
  initialZoom?: number
  clusterize?: boolean
  selectedPoint?: DeparturePoint | null
}

export interface DeparturePoint {
  id: string | number
  city: string
  address: string
  coordinates: [number, number] // [широта, долгота]
  description?: string
}

const props = withDefaults(defineProps<Props>(), {
  initialZoom: 9,
  clusterize: true,
  selectedPoint: null
})

const emit = defineEmits<{
  (e: 'point-select', point: DeparturePoint): void
}>()

const map = ref<any>(null)
const loading = ref(true)
const selectedPoint = ref(props.selectedPoint)
const show = ref(false);

// Вычисляем центр карты на основе точек
const mapCenter = computed(() => {
  if (props.points.length === 1) {
    return props.points[0].coordinates
  }
  if (props.points.length <= 3) {
    return [33.883513, 44.753709]
  }
})

// Вычисляем зум в зависимости от количества точек
const mapZoom = computed(() => {
  if (props.points.length === 1) return 16
  if (props.points.length <= 3) return 9
  return 10
})

// Обработчик клика по маркеру
const onMarkerClick = () => {
  show.value = !show.value
}

const selectPoint = (point: DeparturePoint) => {
  selectedPoint.value = point
  emit("point-select", point)
  console.log(point)
}

// Следим за загрузкой карты
watch(map, (newMap) => {
  if (newMap) {
    loading.value = false
  }
})
</script>

<style scoped>
.map-container {
  position: relative;
  width: 100%;
  height: 500px;
  border-radius: 16px;
  overflow: hidden;
  border: 2px solid var(--border-green-light);
  box-shadow: 0 4px 20px var(--shadow-default);
}


.marker-popup {
  background: white;
  padding: 10px 5px;
  max-width: 250px;
  position: relative;
  text-align: center;
}
.marker-popup button {
  width: 100%;
  margin-top: 10px;
  padding: 10px 16px;
  background: linear-gradient(135deg, #00a86b 0%, #00875a 100%);
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.marker-popup button:hover {
  background: linear-gradient(135deg, #00875a 0%, #006644 100%);
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(0, 168, 107, 0.3);
}

.marker-popup button:active {
  transform: translateY(0);
  box-shadow: none;
}

/* Загрузчик */
.map-loader {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(255, 255, 255, 0.9);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 15px;
  z-index: 20;
}

.loader {
  width: 40px;
  height: 40px;
  border: 4px solid var(--border-green-light);
  border-top-color: var(--green-primary);
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

/* Адаптивность */
@media (max-width: 768px) {
  .map-container {
    height: 400px;
  }
}
</style>
