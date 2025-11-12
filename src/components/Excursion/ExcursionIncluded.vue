<template>
  <section class="included-section">
    <h2 class="section-title">{{ title }}</h2>
    <div class="included-grid">
      <div class="included-item" v-for="item in items" :key="item">
        <div class="included-check">✓</div>
        <span>{{ item }}</span>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
interface Props {
  items: string[]
  title?: string
}

withDefaults(defineProps<Props>(), {
  title: 'Что включено',
  items: () => []
})
</script>

<style scoped>
.included-section {
  margin-bottom: 40px;
}

.section-title {
  font-size: 1.5rem;
  font-weight: 700;
  color: #1a1a1a;
  margin-bottom: 20px;
}

.included-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 12px;
}

.included-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 16px;
  background: white;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  transition: all 0.2s ease;
}

.included-item:hover {
  border-color: #10b981;
  transform: translateX(4px);
}

.included-check {
  width: 24px;
  height: 24px;
  background: #10b981;
  color: white;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  font-weight: bold;
  flex-shrink: 0;
}

/* Адаптивность */
@media (max-width: 768px) {
  .included-grid {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 480px) {
  .section-title {
    font-size: 1.3rem;
  }

  .included-item {
    padding: 12px;
  }

  .included-check {
    width: 20px;
    height: 20px;
    font-size: 10px;
  }
}
</style>
