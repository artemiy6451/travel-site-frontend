<template>
  <div class="about-page">
    <!-- Герой секция -->
    <section class="hero-section">
      <div class="hero-background">
        <div class="hero-overlay"></div>
      </div>
      <div class="hero-content">
        <router-link to="/" class="hero-badge">
          Вера и Виталий | Экскурсии по Крыму
        </router-link>
        <h1 class="hero-title">Откройте настоящий Крым вместе с нами</h1>
        <p class="hero-subtitle">
          Профессиональные экскурсии по самым красивым и удивительным уголкам полуострова
        </p>
        <div class="hero-features">
          <div class="feature-item">
            <span class="feature-icon">📍</span>
            Авторские маршруты
          </div>
          <div class="feature-item">
            <span class="feature-icon">🚗</span>
            Комфортные поездки
          </div>
          <div class="feature-item">
            <span class="feature-icon">📸</span>
            Лучшие виды и впечатления
          </div>
        </div>
      </div>
    </section>

    <!-- О нас -->
    <section class="about-section">
      <div class="container">
        <div class="about-content">
          <h2 class="section-title">Наша история</h2>
          <div class="about-text">
            <p>
              Мы — Вера и Виталий, профессиональные экскурсоводы и настоящие влюбленные в Крым.
              Наш путь начался с простой идеи — показать полуостров таким, каким мы его знаем и любим:
              наполненным историями, легендами и неповторимой атмосферой.
            </p>
            <p>
              За годы работы мы провели сотни экскурсий и поняли главное: каждый гость ищет в Крыме
              что-то свое. Кто-то — захватывающие панорамы гор и моря, кто-то — древние истории и тайны,
              а кто-то — уединенные уголки природы. И мы знаем, где найти всё это!
            </p>
          </div>
        </div>
      </div>
    </section>

    <!-- Наши ценности -->
    <section class="values-section">
      <div class="container">
        <h2 class="section-title">Почему выбирают нас</h2>
        <div class="values-grid">
          <div class="value-card">
            <div class="value-icon">❤️</div>
            <h3>Любовь к Крыму</h3>
            <p>Показываем полуостров с душой, делимся личными открытиями и любимыми местами</p>
          </div>
          <div class="value-card">
            <div class="value-icon">🎯</div>
            <h3>Индивидуальный подход</h3>
            <p>Подбираем маршрут под ваши интересы и предпочтения, создаем комфортную атмосферу</p>
          </div>
          <div class="value-card">
            <div class="value-icon">📚</div>
            <h3>Профессионализм</h3>
            <p>Глубокие знания истории, географии и культуры Крыма, интересные рассказы и факты</p>
          </div>
          <div class="value-card">
            <div class="value-icon">🛡️</div>
            <h3>Надежность</h3>
            <p>Пунктуальность, безопасность и забота о каждом участнике экскурсии</p>
          </div>
        </div>
      </div>
    </section>

    <!-- Что мы предлагаем -->
    <section class="offer-section">
      <div class="container">
        <h2 class="section-title">Что вас ждет</h2>
        <div class="offer-content">
          <div class="offer-list">
            <div class="offer-item">
              <span class="offer-number">01</span>
              <div class="offer-text">
                <h3>Авторские маршруты</h3>
                <p>Разработанные нами уникальные программы, которые включают как популярные достопримечательности, так и
                  малоизвестные уголки Крыма</p>
              </div>
            </div>
            <div class="offer-item">
              <span class="offer-number">02</span>
              <div class="offer-text">
                <h3>Комфортные условия</h3>
                <p>Удобный транспорт, продуманное расписание, остановки в самых живописных местах для фото и отдыха</p>
              </div>
            </div>
            <div class="offer-item">
              <span class="offer-number">03</span>
              <div class="offer-text">
                <h3>Живые эмоции</h3>
                <p>Не просто экскурсия, а настоящее путешествие, которое останется в памяти навсегда</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- География -->
    <section class="geography-section">
      <div class="container">
        <h2 class="section-title">Мы покажем вам весь Крым</h2>
        <div class="geography-grid">
          <div class="location-card">
            <div class="location-icon">🏛️</div>
            <h3>Легендарный Севастополь</h3>
            <p>Исторические памятники, военная слава и морские пейзажи</p>
          </div>
          <div class="location-card">
            <div class="location-icon">🏔️</div>
            <h3>Волшебный Демерджи</h3>
            <p>Загадочные долины, каменные изваяния и горные тропы</p>
          </div>
          <div class="location-card">
            <div class="location-icon">🌊</div>
            <h3>Южный берег Крыма</h3>
            <p>Лазурное море, дворцы и парки, живописные набережные</p>
          </div>
          <div class="location-card">
            <div class="location-icon">⛰️</div>
            <h3>Горный Крым</h3>
            <p>Каньоны, водопады, пещеры и смотровые площадки</p>
          </div>
        </div>
      </div>
    </section>

    <!-- Призыв к действию -->
    <section class="cta-section">
      <div class="container">
        <div class="cta-content">
          <h2 class="cta-title">Хочешь увидеть настоящий Крым?</h2>
          <p class="cta-subtitle">Поехали с нами! Выберите экскурсию по душе и забронируйте место</p>
          <div class="cta-buttons">
            <router-link to="/" class="cta-button primary">
              Смотреть экскурсии
            </router-link>
            <a href="https://vk.com/vvvectaa" target="_blank" class="cta-button secondary">
              Написать в VK
            </a>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
</script>

<style scoped>
.about-page {
  min-height: 100vh;
}

/* Герой секция */
.hero-section {
  position: relative;
  min-height: 70vh;
  display: flex;
  align-items: center;
  justify-content: center;
  text-align: center;
  padding: 80px 20px;
  background: var(--gradient-green-soft);
  overflow: hidden;
}

.hero-background {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(135deg, var(--green-primary) 0%, var(--green-light) 50%, var(--green-lighter) 100%);
}

.hero-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(255, 255, 255, 0.1);
}

.hero-content {
  position: relative;
  z-index: 2;
  max-width: 800px;
}

.hero-badge {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  background: var(--white);
  padding: 12px 24px;
  border-radius: 50px;
  font-weight: 600;
  color: var(--text-dark);
  margin-bottom: 30px;
  box-shadow: 0 8px 32px var(--shadow-green-light);
  text-decoration: none;
}

.badge-icon {
  font-size: 1.2em;
}

.hero-title {
  font-size: 3.5rem;
  font-weight: 700;
  color: var(--text-dark);
  margin-bottom: 20px;
  line-height: 1.2;
}

.hero-subtitle {
  font-size: 1.3rem;
  color: var(--text-medium);
  margin-bottom: 40px;
  line-height: 1.6;
}

.hero-features {
  display: flex;
  justify-content: center;
  gap: 30px;
  flex-wrap: wrap;
}

.feature-item {
  display: flex;
  align-items: center;
  gap: 8px;
  background: var(--white);
  padding: 12px 20px;
  border-radius: 12px;
  font-weight: 600;
  color: var(--text-dark);
  box-shadow: 0 4px 16px var(--shadow-green-light);
}

.feature-icon {
  font-size: 1.2em;
}

/* Общие стили */
.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 20px;
}

.section-title {
  font-size: 2.5rem;
  font-weight: 700;
  color: var(--text-dark);
  text-align: center;
  margin-bottom: 60px;
}

/* О нас */
.about-section {
  padding: 100px 0;
  background: var(--green-bg);
}

.about-content {
  margin: 0 auto;
  max-width: 750px;
  text-align: justify;
}

.about-text p {
  font-size: 1.1rem;
  line-height: 1.8;
  color: var(--text-medium);
  margin-bottom: 20px;
}

.image-placeholder {
  width: 300px;
  height: 400px;
  background: var(--gradient-green-light);
  border-radius: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 20px 40px var(--shadow-green-soft);
}

.image-icon {
  font-size: 4rem;
  opacity: 0.7;
}

/* Ценности */
.values-section {
  padding: 100px 0;
  background: var(--white);
}

.values-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 40px;
}

.value-card {
  text-align: center;
  padding: 40px 30px;
  background: var(--green-bg-light);
  border-radius: 20px;
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.value-card:hover {
  transform: translateY(-10px);
  box-shadow: 0 20px 40px var(--shadow-green-light);
}

.value-icon {
  font-size: 3rem;
  margin-bottom: 20px;
}

.value-card h3 {
  font-size: 1.5rem;
  font-weight: 600;
  color: var(--text-dark);
  margin-bottom: 15px;
}

.value-card p {
  color: var(--text-medium);
  line-height: 1.6;
}

/* Предложения */
.offer-section {
  padding: 100px 0;
  background: var(--green-bg);
}

.offer-list {
  max-width: 800px;
  margin: 0 auto;
}

.offer-item {
  display: flex;
  align-items: flex-start;
  gap: 30px;
  margin-bottom: 50px;
}

.offer-number {
  font-size: 3rem;
  font-weight: 700;
  color: var(--green-primary);
  line-height: 1;
}

.offer-text h3 {
  font-size: 1.5rem;
  font-weight: 600;
  color: var(--text-dark);
  margin-bottom: 10px;
}

.offer-text p {
  color: var(--text-medium);
  line-height: 1.7;
}

/* География */
.geography-section {
  padding: 100px 0;
  background: var(--white);
}

.geography-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 30px;
}

.location-card {
  padding: 40px 30px;
  background: var(--green-bg-light);
  border-radius: 20px;
  text-align: center;
  transition: all 0.3s ease;
}

.location-card:hover {
  background: var(--gradient-green-light);
  transform: translateY(-5px);
}

.location-icon {
  font-size: 3rem;
  margin-bottom: 20px;
}

.location-card h3 {
  font-size: 1.3rem;
  font-weight: 600;
  color: var(--text-dark);
  margin-bottom: 15px;
}

.location-card p {
  color: var(--text-medium);
  line-height: 1.6;
}

/* CTA секция */
.cta-section {
  padding: 100px 0;
  background: var(--gradient-green);
}

.cta-content {
  text-align: center;
  max-width: 600px;
  margin: 0 auto;
}

.cta-title {
  font-size: 2.5rem;
  font-weight: 700;
  color: var(--white);
  margin-bottom: 20px;
  line-height: 1.2;
}

.cta-subtitle {
  font-size: 1.2rem;
  color: var(--green-lighter);
  margin-bottom: 40px;
  line-height: 1.6;
}

.cta-buttons {
  display: flex;
  gap: 20px;
  justify-content: center;
  flex-wrap: wrap;
}

.cta-button {
  padding: 16px 32px;
  border-radius: 12px;
  font-weight: 600;
  text-decoration: none;
  transition: all 0.3s ease;
}

.cta-button.primary {
  background: var(--white);
  color: var(--green-primary);
}

.cta-button.primary:hover {
  background: var(--green-bg-light);
  transform: translateY(-2px);
  box-shadow: 0 8px 25px var(--shadow-green-strong);
}

.cta-button.secondary {
  background: transparent;
  color: var(--white);
  border: 2px solid var(--white);
}

.cta-button.secondary:hover {
  background: var(--white);
  color: var(--green-primary);
  transform: translateY(-2px);
}

/* Адаптивность */
@media (max-width: 1200px) {
  .container {
    max-width: 1000px;
    padding: 0 40px;
  }

  .hero-title {
    font-size: 3rem;
  }

  .section-title {
    font-size: 2.2rem;
  }
}

@media (max-width: 992px) {
  .container {
    max-width: 900px;
    padding: 0 30px;
  }

  .hero-section {
    min-height: 60vh;
    padding: 60px 20px;
  }

  .hero-title {
    font-size: 2.7rem;
  }

  .hero-subtitle {
    font-size: 1.2rem;
  }

  .about-section,
  .values-section,
  .offer-section,
  .geography-section,
  .cta-section {
    padding: 80px 0;
  }

  .values-grid {
    grid-template-columns: repeat(2, 1fr);
    gap: 30px;
  }

  .geography-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 768px) {
  .container {
    padding: 0 20px;
  }

  .hero-section {
    min-height: 50vh;
    padding: 50px 20px;
  }

  .hero-title {
    font-size: 2.2rem;
    margin-bottom: 15px;
  }

  .hero-subtitle {
    font-size: 1.1rem;
    margin-bottom: 30px;
  }

  .hero-badge {
    padding: 10px 20px;
    font-size: 0.9rem;
    margin-bottom: 25px;
  }

  .hero-features {
    gap: 15px;
  }

  .feature-item {
    padding: 10px 16px;
    font-size: 0.9rem;
  }

  .section-title {
    font-size: 1.8rem;
    margin-bottom: 40px;
  }

  .about-section,
  .values-section,
  .offer-section,
  .geography-section,
  .cta-section {
    padding: 60px 0;
  }

  .about-content {
    text-align: justify;
    max-width: 100%;
    margin: 0 15px;
  }

  .about-text p {
    font-size: 1rem;
    line-height: 1.7;
  }

  .values-grid {
    grid-template-columns: 1fr;
    gap: 25px;
  }

  .value-card {
    padding: 30px 25px;
  }

  .value-icon {
    font-size: 2.5rem;
    margin-bottom: 15px;
  }

  .value-card h3 {
    font-size: 1.3rem;
    margin-bottom: 12px;
  }

  .offer-item {
    flex-direction: column;
    text-align: center;
    gap: 15px;
    margin-bottom: 40px;
  }

  .offer-number {
    font-size: 2.5rem;
  }

  .offer-text h3 {
    font-size: 1.3rem;
  }

  .geography-grid {
    grid-template-columns: 1fr;
    gap: 25px;
  }

  .location-card {
    padding: 30px 25px;
  }

  .location-icon {
    font-size: 2.5rem;
  }

  .cta-title {
    font-size: 2rem;
  }

  .cta-subtitle {
    font-size: 1.1rem;
    margin-bottom: 30px;
  }

  .cta-buttons {
    flex-direction: column;
    align-items: center;
    gap: 15px;
  }

  .cta-button {
    width: 100%;
    max-width: 280px;
    padding: 14px 28px;
    font-size: 0.95rem;
  }
}

@media (max-width: 576px) {
  .container {
    padding: 0 16px;
  }

  .hero-section {
    min-height: 45vh;
    padding: 40px 16px;
  }

  .hero-title {
    font-size: 1.8rem;
    margin-bottom: 12px;
  }

  .hero-subtitle {
    font-size: 1rem;
    margin-bottom: 25px;
  }

  .hero-badge {
    padding: 8px 16px;
    font-size: 0.85rem;
    margin-bottom: 20px;
  }

  .hero-features {
    flex-direction: column;
    align-items: center;
    gap: 12px;
  }

  .feature-item {
    width: 100%;
    max-width: 250px;
    justify-content: center;
    padding: 12px 16px;
  }

  .section-title {
    font-size: 1.6rem;
    margin-bottom: 30px;
  }

  .about-section,
  .values-section,
  .offer-section,
  .geography-section,
  .cta-section {
    padding: 50px 0;
  }

  .about-text p {
    font-size: 0.95rem;
    line-height: 1.6;
  }

  .value-card {
    padding: 25px 20px;
  }

  .value-icon {
    font-size: 2.2rem;
  }

  .value-card h3 {
    font-size: 1.2rem;
  }

  .value-card p {
    font-size: 0.9rem;
  }

  .offer-item {
    margin-bottom: 35px;
  }

  .offer-number {
    font-size: 2.2rem;
  }

  .offer-text h3 {
    font-size: 1.2rem;
  }

  .offer-text p {
    font-size: 0.9rem;
  }

  .location-card {
    padding: 25px 20px;
  }

  .location-icon {
    font-size: 2.2rem;
  }

  .location-card h3 {
    font-size: 1.2rem;
  }

  .location-card p {
    font-size: 0.9rem;
  }

  .cta-title {
    font-size: 1.7rem;
  }

  .cta-subtitle {
    font-size: 1rem;
  }

  .cta-button {
    padding: 12px 24px;
    font-size: 0.9rem;
  }
}

@media (max-width: 400px) {
  .hero-title {
    font-size: 1.6rem;
  }

  .hero-subtitle {
    font-size: 0.95rem;
  }

  .section-title {
    font-size: 1.4rem;
  }

  .cta-title {
    font-size: 1.5rem;
  }

  .container {
    padding: 0 12px;
  }

  .value-card,
  .location-card {
    padding: 20px 16px;
  }
}

/* Дополнительные улучшения для очень маленьких экранов */
@media (max-height: 600px) and (orientation: landscape) {
  .hero-section {
    min-height: 80vh;
    padding: 30px 20px;
  }

  .hero-title {
    font-size: 1.8rem;
    margin-bottom: 10px;
  }

  .hero-subtitle {
    font-size: 0.9rem;
    margin-bottom: 20px;
  }

  .hero-features {
    gap: 10px;
  }

  .feature-item {
    padding: 8px 12px;
    font-size: 0.8rem;
  }
}

/* Плавные переходы для всех интерактивных элементов */
@media (hover: hover) {

  .value-card,
  .location-card,
  .cta-button {
    transition: all 0.3s ease;
  }
}

/* Отключение hover-эффектов на тач-устройствах */
@media (hover: none) {

  .value-card:hover,
  .location-card:hover {
    transform: none;
  }
}
</style>
