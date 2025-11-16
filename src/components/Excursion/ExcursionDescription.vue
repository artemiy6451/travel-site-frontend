<template>
  <section class="description-section">
    <h2 class="section-title">{{ title }}</h2>
    <div class="description-card">
      <p class="description-text">{{ description }}</p>
    </div>
  </section>
</template>

<script setup lang="ts">
interface Props {
  description: string
  title?: string
}

withDefaults(defineProps<Props>(), {
  title: 'О маршруте',
})
</script>

<style scoped>
.description-section {
  margin-bottom: 40px;
}

.section-title {
  font-size: 1.5rem;
  font-weight: 700;
  color: #1a1a1a;
  margin-bottom: 20px;
}

.description-card {
  background: #f8fafc;
  padding: 30px;
  border-radius: 16px;
  border: 1px solid #e2e8f0;
}

.description-text {
  font-size: 16px;
  line-height: 1.7;
  color: #475569;
  margin: 0;
  white-space: pre-line;
}

/* Адаптивность */
@media (max-width: 768px) {
  .description-card {
    padding: 20px;
  }
}

@media (max-width: 480px) {
  .section-title {
    font-size: 1.3rem;
  }

  .description-card {
    padding: 16px;
  }

  .description-text {
    font-size: 15px;
    line-height: 1.6;
  }
}
</style>
