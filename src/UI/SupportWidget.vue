<template>
  <div class="support-bar">
    <span class="support-time">🕒 09:00–21:00 МСК</span>
    <a href="tel:+79787005862" class="support-link">📞 +7 (978) 700-58-62</a>
    <a href="https://vk.com/vvvectaa" target="_blank" class="btn vk">
      ВКонтакте
    </a>
    <a href="https://t.me/vvvectaa" target="_blank" class="btn telegram">
      Telegram
    </a>
  </div>
</template>

<script setup lang="ts">
</script>

<style scoped>
.support-bar {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 20px;
  padding: 10px 20px;
  background: #ededed;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0,0,0,0.08);
  font-family: 'Roboto', sans-serif;
  font-size: 14px;
  max-width: 100%;
}

.support-time {
  user-select: none; /* запрещает выделение текста */
  -webkit-user-select: none; /* для Safari */
  -moz-user-select: none; /* для Firefox */
  -ms-user-select: none; /* для старых версий IE */
}

.support-link {
  color: #333;
  text-decoration: none;
  transition: color 0.3s;
  white-space: nowrap; /* предотвращает перенос текста */
}

.support-link:hover {
  color: #42b983;
}

.btn {
  padding: 6px 14px;
  border-radius: 6px;
  text-decoration: none;
  font-weight: 500;
  transition: 0.3s;
  white-space: nowrap;
}

.btn.vk {
  background: #0077FF;
  color: #fff;
}

.btn.telegram {
  background: #0088cc;
  color: #fff;
}

.btn.telegram:hover {
  opacity: 0.9;
}

/* Мобильная адаптация */
@media (max-width: 800px) {
  .support-bar {
    flex-direction: column; /* меняем на вертикальное расположение */
    gap: 12px; /* отступы между строками */
    padding: 15px;
    width: 100%;
    box-sizing: border-box;
  }

  .support-time,
  .support-link,
  .btn.telegram,
  .btn.vk {
    width: 100%;
    text-align: center;
    padding: 8px 0;
    white-space: normal; /* разрешаем перенос текста */
    word-break: break-word; /* перенос длинных слов */
  }

  .btn.telegram, .btn.vk {
    margin-top: 5px;
  }
}

/* Для очень маленьких экранов */
@media (max-width: 480px) {
  .support-bar {
    padding: 12px;
    gap: 10px;
  }

  .support-time,
  .support-link,
  .btn.telegram, .btn.vk {
    font-size: 13px;
    padding: 6px 0;
  }
}
</style>
