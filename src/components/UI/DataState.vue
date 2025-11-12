<template>
  <!-- Состояние загрузки -->
  <LoadingState
    v-if="loading"
    :message="loadingMessage"
  />

  <!-- Состояние ошибки -->
  <ErrorState
    v-else-if="error"
    :message="error"
    :title="errorTitle"
    :show-retry="showRetry"
    :retry-text="retryText"
    @retry="$emit('retry')"
  >
    <slot name="error-content"></slot>
  </ErrorState>

  <!-- Контент когда нет загрузки и ошибки -->
  <slot v-else></slot>
</template>

<script setup lang="ts">
import LoadingState from '@/components/UI/LoadingState.vue'
import ErrorState from '@/components/UI/ErrorState.vue'

interface Props {
  loading?: boolean
  error?: string
  loadingMessage?: string
  errorTitle?: string
  showRetry?: boolean
  retryText?: string
}

interface Emits {
  (e: 'retry'): void
}

withDefaults(defineProps<Props>(), {
  loading: false,
  loadingMessage: 'Загрузка...',
  showRetry: true,
  retryText: 'Попробовать снова'
})

defineEmits<Emits>()
</script>
