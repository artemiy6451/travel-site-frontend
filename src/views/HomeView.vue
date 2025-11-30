<template>
  <div class="home-page">
    <HeaderComponent />
    <main class="main-content">
      <CardsGrid />
      <ReviewsInvitation />
    </main>
  </div>
</template>

<script lang="ts" setup>
import HeaderComponent from '@/components/UI/HeaderComponent.vue'
import CardsGrid from '@/components/Cards/CardsGrid.vue'
import ReviewsInvitation from '@/components/UI/ReviewsInvitation.vue'
</script>

<style scoped>
.main-content {
  padding-top: 20px; /* Отступ от header */
}
</style>
