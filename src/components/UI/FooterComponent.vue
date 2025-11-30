<template>
  <footer class="footer_container">
    <div class="footer_content">
      <!-- Логотип и описание -->
      <div class="footer_section">
        <div class="footer_logo">
          <img src="@/assets/logo.png" alt="Логотип" class="logo" />
        </div>
        <p class="footer_description">
          Профессиональные экскурсии по самым красивым и удивительным уголкам Крыма
        </p>
        <div class="social_links">
          <a
            href="https://vk.com/vvvectaa"
            target="_blank"
            class="social_link"
            aria-label="Наша группа ВКонтакте"
          >
            <span class="social_icon">📱</span>
            ВКонтакте
          </a>
          <a
            href="https://t.me/vvvecta"
            target="_blank"
            class="social_link"
            aria-label="Наш канал в Телеграме"
          >
            <span class="social_icon">📱</span>
            Телеграм
          </a>
        </div>
      </div>

      <!-- Навигация -->
      <div class="footer_section">
        <h3 class="section_title">Навигация</h3>
        <nav class="footer_nav">
          <router-link to="/" class="nav_link">Главная</router-link>
          <router-link to="/about" class="nav_link">О нас</router-link>
          <router-link to="/reviews" class="nav_link">Отзывы</router-link>
        </nav>
      </div>

      <!-- Контакты -->
      <div class="footer_section">
        <h3 class="section_title">Контакты</h3>
        <div class="contact_info">
          <div class="contact_item">
            <span class="contact_icon">📞</span>
            <a href="tel:+79787005859" class="contact_link">+7 (978) 700-58-59</a>
          </div>
          <div class="contact_item">
            <span class="contact_icon">📍</span>
            <span class="contact_text">Крым</span>
          </div>
        </div>
      </div>

      <!-- О нас -->
      <div class="footer_section">
        <h3 class="section_title">О нас</h3>
        <p class="about_text">
          Мы — Вера и Виталий, профессиональные экскурсоводы.
          Показываем настоящий Крым с душой и любовью к полуострову.
        </p>
      </div>
    </div>

    <!-- Копирайт -->
    <div class="footer_bottom">
      <div class="copyright">
        © {{ currentYear }} Вера и Виталий. Экскурсии по Крыму. Все права защищены.
      </div>
    </div>
  </footer>
</template>

<script setup lang="ts">
import { ref } from 'vue'

const currentYear = ref(new Date().getFullYear())
</script>

<style scoped>
.footer_container {
  background: var(--green-bg);
  border-top: 1px solid var(--border-green);
  padding: 40px 20px 20px;
  margin-top: auto;
}

.footer_content {
  display: grid;
  grid-template-columns: 2fr 1fr 1fr 1.5fr;
  gap: 40px;
  max-width: 1200px;
  margin: 0 auto;
  align-items: start;
}

.footer_section {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.footer_logo .logo {
  width: 160px;
  height: auto;
  margin-bottom: 12px;
}

.footer_description {
  color: var(--text-medium);
  line-height: 1.5;
  font-size: 1.2rem;
  margin: 0;
}

.social_links {
  display: flex;
  gap: 12px;
  margin-top: 8px;
}

.social_link {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 16px;
  background: var(--white);
  border: 1px solid var(--border-green-medium);
  border-radius: 8px;
  color: var(--text-dark);
  text-decoration: none;
  font-size: 0.9rem;
  transition: all 0.3s ease;
}

.social_link:hover {
  background: var(--green-lightest);
  transform: translateY(-1px);
  box-shadow: 0 4px 12px var(--shadow-green-light);
}

.social_icon {
  font-size: 1.1rem;
}

.section_title {
  font-size: 1.1rem;
  font-weight: 600;
  color: var(--text-dark);
  margin: 0 0 12px 0;
}

.footer_nav {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.nav_link {
  color: var(--text-medium);
  text-decoration: none;
  transition: color 0.3s ease;
  font-size: 0.95rem;
}

.nav_link:hover {
  color: var(--green-primary);
}

.nav_link.router-link-active {
  color: var(--green-primary);
  font-weight: 500;
}

.contact_info {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.contact_item {
  display: flex;
  align-items: center;
  gap: 10px;
}

.contact_icon {
  font-size: 1.1rem;
  width: 20px;
  text-align: center;
}

.contact_link,
.contact_text {
  color: var(--text-medium);
  text-decoration: none;
  font-size: 0.95rem;
}

.contact_link:hover {
  color: var(--green-primary);
}

.about_text {
  color: var(--text-medium);
  line-height: 1.5;
  font-size: 0.9rem;
  margin: 0;
}

.footer_support {
  margin-top: 8px;
}

.footer_bottom {
  border-top: 1px solid var(--border-green-light);
  padding-top: 20px;
  margin-top: 40px;
  text-align: center;
}

.copyright {
  color: var(--text-light);
  font-size: 0.85rem;
}

/* Адаптивность */
@media (max-width: 1024px) {
  .footer_content {
    grid-template-columns: 1fr 1fr;
    gap: 30px;
  }
}

@media (max-width: 768px) {
  .footer_container {
    padding: 30px 16px 16px;
  }

  .footer_content {
    grid-template-columns: 1fr;
    gap: 30px;
    text-align: center;
  }

  .footer_section {
    align-items: center;
  }

  .footer_logo .logo {
    width: 140px;
  }

  .social_links {
    justify-content: center;
  }

  .contact_item {
    justify-content: center;
  }

  .footer_nav {
    align-items: center;
  }
}

@media (max-width: 480px) {
  .footer_container {
    padding: 25px 12px 12px;
  }

  .footer_content {
    gap: 25px;
  }

  .footer_logo .logo {
    width: 120px;
  }

  .footer_description {
    font-size: 1.2rem;
  }

  .section_title {
    font-size: 1.3rem;
  }

  .nav_link,
  .contact_link,
  .contact_text,
  .about_text {
    font-size: 1.2rem;
  }

  .social_link {
    padding: 6px 12px;
    font-size: 1rem;
  }

  .copyright {
    font-size: 0.8rem;
  }
}

/* Дополнительные улучшения для очень маленьких экранов */
@media (max-width: 360px) {
  .footer_container {
    padding: 20px 10px 10px;
  }

  .footer_content {
    gap: 20px;
  }

  .footer_logo .logo {
    width: 100px;
  }
}

/* Поддержка темной темы */
@media (prefers-color-scheme: dark) {
  .footer_container {
    background: var(--green-darker);
    border-top-color: var(--green-dark);
  }

  .footer_description,
  .nav_link,
  .contact_link,
  .contact_text,
  .about_text,
  .copyright {
    color: var(--green-lighter);
  }

  .section_title {
    color: var(--white);
  }

  .social_link {
    background: var(--green-dark);
    border-color: var(--green-primary);
    color: var(--white);
  }

  .social_link:hover {
    background: var(--green-primary);
  }

  .footer_bottom {
    border-top-color: var(--green-dark);
  }
}
</style>
