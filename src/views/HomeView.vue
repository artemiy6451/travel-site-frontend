<template>
<div class="home-page">
    <HeaderComponent />
    <main class="main-content">
      <CardsGrid />
    </main>
  </div>
</template>

<script lang="ts" setup>
import HeaderComponent from '@/components/UI/HeaderComponent.vue'
import CardsGrid from '@/components/Cards/CardsGrid.vue'
</script>

<style scoped>
.home-page {
  min-height: 100vh;
}

.main-content {
  padding-top: 20px; /* Отступ от header */
}
</style>
