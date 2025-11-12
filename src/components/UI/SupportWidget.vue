<template>
  <div class="support-bar">
    <div class="header_logo">
      <img src="@/assets/logo.png" alt="header logo" class="logo">
    </div>

    <div class="support_info">
      <span class="support-time">🕒 09:00–21:00 МСК</span>
      <a href="tel:+79787005862" class="support-link">📞 +7 (978) 700-58-62</a>
      <div class="buttons">
        <a href="https://vk.com/vvvectaa" target="_blank" class="btn vk">
          ВКонтакте
        </a>
        <a href="https://t.me/vvvectaa" target="_blank" class="btn telegram">
          Telegram
        </a>
      </div>
    </div>

  </div>
</template>

<script setup lang="ts">
</script>

<style scoped>
.support-bar {
  display: flex;
  padding: 12px 24px;
  background: var(--white);
  border-radius: 12px;
  box-shadow: 0 4px 15px var(--shadow-default);
  font-family: 'Roboto', sans-serif;
  font-size: 14px;
  max-width: 100%;
  box-sizing: border-box;
  border: 1px solid var(--border-light);
}

.support_info {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 20px;
}

.support-time {
  user-select: none;
  color: var(--text-medium);
}

.support-link {
  color: var(--text-dark);
  text-decoration: none;
  transition: color 0.3s;
  white-space: nowrap;
}

.support-link:hover {
  color: var(--green-primary);
}

.buttons {
  display: flex;
  gap: 15px;
}

.btn.telegram, .btn.vk {
  padding: 8px 16px;
  color: var(--text-white);
  border-radius: 8px;
  text-decoration: none;
  font-weight: 500;
  transition: 0.3s;
  white-space: nowrap;
  border: none;
  cursor: pointer;
}

.btn.telegram {
  background: #24A1DE;
}

.btn.vk {
  background: #4C75A3
}

.btn.telegram:hover, .btn.vk:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 15px var(--shadow-green);
}

.header_logo {
  display: none;
}

/* Мобильная адаптация */
@media (max-width: 800px) {
  .support-bar {
    margin: 0 15px;
    width: 100%;
    display: flex;
    justify-content: center; /* Горизонтальное выравнивание */
    border-radius: none;
    box-shadow: none;
    box-sizing: none;
    border: none;
    background: none;
  }

  .support_info {
    display: flex;
    flex-direction: column;
    width: 100%;
    gap: 12px;
    padding: 16px;
    font-size: 10px;
  }

  .buttons {
    width: 80%;
  }

  .support-time,
  .support-link {
    font-size: 1.1rem;
  }

  .btn.telegram, .btn.vk {
    width: 50%;
    justify-content: center;
  }

  .header_logo {
    display: flex;
    align-items: center;
  }

  .header_logo img {
    max-height: 120px;
    width: auto;
  }
}
</style>
