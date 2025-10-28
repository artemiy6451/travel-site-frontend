<template>
  <div class="header_container">
    <div class="header_logo">
      <img src="../assets/header_logo.svg" alt="header logo" class="logo">
    </div>

    <div class="header_center">
      <SupportWidget />
    </div>

    <div class="header_spacer"></div>
  </div>
</template>

<script setup lang="ts">
import SupportWidget from "@/UI/SupportWidget.vue"
</script>

<style scoped>
.header_container {
  display: flex;
  align-items: center;
  width: 100%;
  max-width: 100%;
  padding: 20px;
  box-sizing: border-box;
  overflow-x: hidden;
}

.header_logo {
  flex-shrink: 0; /* предотвращает сжатие логотипа */
}

.header_center {
  flex: 1; /* занимает все доступное пространство */
  display: flex;
  justify-content: center; /* центрирует SupportWidget */
}

.header_spacer {
  flex-shrink: 0;
  width: calc(100px + 5%); /* ширина равна ширине логотипа + небольшой отступ */
  visibility: hidden; /* скрываем, но сохраняем место */
}

/* Мобильная адаптация header */
@media (max-width: 800px) {
  .header_container {
    padding: 15px;
    flex-direction: column;
    gap: 15px;
    align-items: center;
  }

  .header_logo {
    margin-bottom: 0;
  }

  .header_center {
    width: 100%;
    justify-content: stretch; /* растягиваем на всю ширину */
  }

  .header_spacer {
    display: none;
  }

  .header_logo img {
    max-height: 30px;
    width: auto;
  }
}

@media (max-width: 480px) {
  .header_container {
    padding: 12px;
    gap: 12px;
  }

  .header_logo img {
    max-height: 25px;
  }
}
</style>
