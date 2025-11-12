<template>
  <button
    :class="buttonClasses"
    :disabled="disabled || loading"
    :type="type"
    @click="handleClick"
  >
    <!-- Состояние загрузки -->
    <div v-if="loading" class="button-loading">
      <div class="button-spinner"></div>
      <span v-if="loadingText">{{ loadingText }}</span>
    </div>

    <!-- Обычное состояние -->
    <div v-else class="button-content" :class="{ 'icon-only': isIconOnly }">
      <!-- Иконка слева -->
      <span v-if="$slots.icon || icon" class="button-icon">
        <slot name="icon">{{ icon }}</slot>
      </span>

      <!-- Основной контент -->
      <span v-if="hasTextContent" class="button-text">
        <slot></slot>
      </span>

      <!-- Иконка справа -->
      <span v-if="$slots['icon-right']" class="button-icon-right">
        <slot name="icon-right"></slot>
      </span>
    </div>
  </button>
</template>

<script setup lang="ts">
import { computed, useSlots } from 'vue'

interface Props {
  variant?: 'primary' | 'secondary' | 'success' | 'warning' | 'danger' | 'info'
  size?: 'sm' | 'md' | 'lg'
  loading?: boolean
  disabled?: boolean
  loadingText?: string
  type?: 'button' | 'submit' | 'reset'
  icon?: string
  fullWidth?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  variant: 'primary',
  size: 'md',
  type: 'button',
  loading: false,
  disabled: false,
  fullWidth: false
})

const slots = useSlots()
const emit = defineEmits<{
  click: [event: MouseEvent]
}>()

// Проверяем есть ли текстовый контент
const hasTextContent = computed(() => {
  const defaultSlot = slots.default?.()
  return defaultSlot && defaultSlot.some(node => {
    if (typeof node.children === 'string') {
      return node.children.trim().length > 0
    }
    return false
  })
})

// Проверяем является ли кнопка только с иконкой
const isIconOnly = computed(() => {
  const hasIcon = props.icon || slots.icon
  const hasIconRight = slots['icon-right']
  return (hasIcon || hasIconRight) && !hasTextContent.value
})

const handleClick = (event: MouseEvent) => {
  if (!props.loading && !props.disabled) {
    emit('click', event)
  }
}

// Динамические классы
const buttonClasses = computed(() => [
  'base-button',
  `variant-${props.variant}`,
  `size-${props.size}`,
  {
    'loading': props.loading,
    'disabled': props.disabled,
    'full-width': props.fullWidth,
    'has-icon': props.icon || !!slots.icon,
    'icon-only': isIconOnly.value
  }
])
</script>

<style scoped>
.base-button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border: none;
  border-radius: 10px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  text-decoration: none;
  font-family: inherit;
  position: relative;
  gap: 8px;
}

/* Варианты */
.base-button.variant-primary {
  background: var(--gradient-green-soft);
  color: var(--text-white);
}

.base-button.variant-primary:hover:not(.disabled) {
  background: var(--gradient-green);
  transform: translateY(-2px);
  box-shadow: 0 6px 20px var(--shadow-green);
}

.base-button.variant-secondary {
  background: #6c757d;
  color: white;
}

.base-button.variant-secondary:hover:not(.disabled) {
  background: #5a6268;
  transform: translateY(-1px);
}

.base-button.variant-success {
  background: #28a745;
  color: white;
}

.base-button.variant-success:hover:not(.disabled) {
  background: #218838;
}

.base-button.variant-warning {
  background: #ffc107;
  color: #212529;
}

.base-button.variant-warning:hover:not(.disabled) {
  background: #e0a800;
}

.base-button.variant-danger {
  background: #dc3545;
  color: white;
}

.base-button.variant-danger:hover:not(.disabled) {
  background: #c82333;
}

.base-button.variant-info {
  background: #17a2b8;
  color: white;
}

.base-button.variant-info:hover:not(.disabled) {
  background: #138496;
}

/* Размеры */
.base-button.size-sm {
  padding: 6px 12px;
  font-size: 0.8rem;
  min-height: 32px;
  min-width: 32px; /* Добавляем минимальную ширину для иконок */
}

.base-button.size-md {
  padding: 10px 20px;
  font-size: 1rem;
  min-height: 44px;
  min-width: 44px; /* Добавляем минимальную ширину для иконок */
}

.base-button.size-lg {
  padding: 14px 24px;
  font-size: 1.1rem;
  min-height: 52px;
  min-width: 52px; /* Добавляем минимальную ширину для иконок */
}

/* Состояния */
.base-button.loading {
  cursor: not-allowed;
  opacity: 0.7;
}

.base-button.disabled {
  cursor: not-allowed;
  opacity: 0.6;
  transform: none !important;
}

.base-button.full-width {
  width: 100%;
  min-width: auto; /* Отменяем минимальную ширину при full-width */
}

/* Контент кнопки */
.button-content {
  display: flex;
  align-items: center;
  gap: 8px;
}

/* Специальные стили для кнопок только с иконкой */
.button-content.icon-only {
  gap: 0; /* Убираем отступы между элементами */
}

.base-button.icon-only {
  padding: 0; /* Убираем паддинг для идеального центрирования */
  aspect-ratio: 1 / 1; /* Делаем кнопку квадратной */
}

/* Центрирование иконок в кнопках только с иконкой */
.base-button.icon-only .button-icon,
.base-button.icon-only .button-icon-right {
  margin: 0; /* Убираем внешние отступы */
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
}

/* Размеры иконок для разных размеров кнопок */
.base-button.icon-only.size-sm .button-icon,
.base-button.icon-only.size-sm .button-icon-right {
  font-size: 1rem;
}

.base-button.icon-only.size-md .button-icon,
.base-button.icon-only.size-md .button-icon-right {
  font-size: 1.2rem;
}

.base-button.icon-only.size-lg .button-icon,
.base-button.icon-only.size-lg .button-icon-right {
  font-size: 1.4rem;
}

.button-loading {
  display: flex;
  align-items: center;
  gap: 8px;
}

/* Спиннер загрузки */
.button-spinner {
  width: 16px;
  height: 16px;
  border: 2px solid transparent;
  border-top: 2px solid currentColor;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

/* Иконки */
.button-icon,
.button-icon-right {
  display: flex;
  align-items: center;
  font-size: 1.1em;
  flex-shrink: 0; /* Предотвращаем сжатие иконок */
}

/* Скрываем текстовый контент когда его нет */
.button-text:empty {
  display: none;
}

/* Анимации */
@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

/* Адаптивность */
@media (max-width: 480px) {
  .base-button.size-md {
    padding: 12px 16px;
    font-size: 0.9rem;
  }

  .base-button.full-width {
    width: 100%;
  }

  /* Адаптивность для иконок */
  .base-button.icon-only.size-md {
    min-width: 40px;
    min-height: 40px;
  }
}
</style>
