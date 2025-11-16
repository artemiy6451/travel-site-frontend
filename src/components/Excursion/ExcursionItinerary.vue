<template>
  <section class="itinerary-section">
    <h2 class="section-title">{{ title }}</h2>
    <div class="timeline">
      <div class="timeline-item" v-for="(step, index) in itinerary" :key="index">
        <div class="timeline-marker">{{ step.time }}</div>
        <div class="timeline-content">
          <h3>{{ step.title }}</h3>
          <p>{{ step.description }}</p>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
interface ItineraryStep {
  time: string
  title: string
  description: string
}

interface Props {
  itinerary: ItineraryStep[]
  title?: string
}

withDefaults(defineProps<Props>(), {
  title: 'Программа тура',
  itinerary: () => [],
})
</script>

<style scoped>
.itinerary-section {
  margin-bottom: 40px;
}

.section-title {
  font-size: 1.5rem;
  font-weight: 700;
  color: #1a1a1a;
  margin-bottom: 20px;
}

.timeline {
  position: relative;
}

.timeline::before {
  content: '';
  position: absolute;
  left: 30px;
  top: 0;
  bottom: 0;
  width: 2px;
  background: #e2e8f0;
}

.timeline-item {
  display: flex;
  gap: 20px;
  margin-bottom: 30px;
  position: relative;
}

.timeline-marker {
  width: 60px;
  height: 60px;
  background: #10b981;
  color: white;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  flex-shrink: 0;
  z-index: 0;
}

.timeline-content {
  flex: 1;
  background: white;
  padding: 20px;
  border-radius: 12px;
  border: 1px solid #e2e8f0;
  margin-top: 8px;
}

.timeline-content h3 {
  margin: 0 0 8px 0;
  color: #1e293b;
  font-size: 16px;
  font-weight: 600;
}

.timeline-content p {
  margin: 0;
  color: #64748b;
  font-size: 14px;
  line-height: 1.5;
}

/* Адаптивность */
@media (max-width: 768px) {
  .timeline::before {
    left: 25px;
  }

  .timeline-marker {
    width: 50px;
    height: 50px;
    font-size: 14px;
  }

  .timeline-content {
    padding: 16px;
  }
}

@media (max-width: 480px) {
  .section-title {
    font-size: 1.3rem;
  }

  .timeline-item {
    flex-direction: column;
    gap: 10px;
  }

  .timeline::before {
    left: 25px;
  }

  .timeline-marker {
    width: 50px;
    height: 50px;
    align-self: flex-start;
  }

  .timeline-content {
    margin-top: 0;
    margin-left: 0;
  }
}
</style>
