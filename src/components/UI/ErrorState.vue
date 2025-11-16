<template>
  <div class="error-state">
    <div class="error-icon">⚠️</div>
    <h3 class="error-title" v-if="title">{{ title }}</h3>
    <p class="error-message">{{ message }}</p>
    <div class="error-actions" v-if="showRetry">
      <BaseButton variant="primary" @click="$emit('retry')" icon="🔄">
        {{ retryText }}
      </BaseButton>
    </div>
    <slot></slot>
  </div>
</template>

<script setup lang="ts">
import BaseButton from '@/components/UI/BaseButton.vue'

interface Props {
  message: string
  title?: string
  showRetry?: boolean
  retryText?: string
}

interface Emits {
  (e: 'retry'): void
}

withDefaults(defineProps<Props>(), {
  showRetry: true,
  retryText: 'Попробовать снова',
})

defineEmits<Emits>()
</script>

<style scoped>
.error-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 20px;
  text-align: center;
}

.error-icon {
  font-size: 48px;
  margin-bottom: 20px;
}

.error-title {
  color: var(--text-dark);
  font-size: 1.5rem;
  margin-bottom: 10px;
  font-weight: 600;
}

.error-message {
  color: var(--text-light);
  font-size: 1.2rem;
  margin-bottom: 25px;
  max-width: 500px;
  line-height: 1.5;
}

.error-actions {
  margin-top: 10px;
}
</style>
