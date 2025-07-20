# 🚀 Руководство по Деплою VetFormuLab MVP

## 📋 Быстрый старт для демонстрации

### 🌟 Вариант 1: Railway (Рекомендуется)

**Самый простой способ для MVP демо:**

1. **Подготовка:**
   ```bash
   git init
   git add .
   git commit -m "VetFormuLab MVP ready for deploy"
   ```

2. **GitHub:**
   - Создать репозиторий на GitHub
   - Пушнуть код: `git push origin main`

3. **Railway деплой:**
   - Перейти на [railway.app](https://railway.app)
   - "Deploy from GitHub repo"
   - Выбрать репозиторий
   - Railway автоматически определит Node.js проект
   - Ждем деплой (~5 минут)

4. **Настройка переменных:**
   - В Railway Dashboard → Variables
   - Добавить: `NODE_ENV=production`
   - Добавить: `PORT=3001`

**Готово! Ссылка будет вида: `https://your-app.railway.app`**

---

### 🔥 Вариант 2: Render.com (Бесплатно)

1. **Создать Render аккаунт**
2. **New Web Service → Connect GitHub**
3. **Настройки:**
   - Build Command: `npm run deploy:build`
   - Start Command: `npm run deploy:start`
   - Environment: `Node`

---

### 💎 Вариант 3: Vercel + Railway (Гибрид)

**Фронтенд на Vercel:**
1. Перейти на [vercel.com](https://vercel.com)
2. Import Project → GitHub
3. Framework: React
4. Build settings: автоматические

**Бэкенд на Railway:**
1. То же что в варианте 1
2. В фронтенде изменить API URL

---

## 🛠️ Локальная подготовка перед деплоем

### 1. Проверить работоспособность:
```bash
npm run install-deps
npm run build
npm start
```

### 2. Создать production build:
```bash
cd frontend
npm run build
cd ..
```

### 3. Тестировать production локально:
```bash
cd backend
NODE_ENV=production npm start
# Открыть http://localhost:3001
```

---

## 🔧 Переменные окружения для продакшена

Добавить в Railway/Render:
```
NODE_ENV=production
PORT=3001
JWT_SECRET=your-super-secret-key-here
```

---

## 📊 Мониторинг и логи

### Railway:
- Dashboard → Deployments → View Logs
- Metrics и мониторинг встроены

### Render:
- Dashboard → Logs
- Automatic SSL и CDN

---

## 🎯 Для презентации заказчику

### Готовая ссылка будет содержать:
- ✅ Полнофункциональный калькулятор питания
- ✅ Базу данных с 5 кормами
- ✅ Сравнение кормов с графиками
- ✅ Управление базой кормов
- ✅ Современный UI/UX
- ✅ Мобильную адаптивность

### Демо-данные для тестирования:
- **Животное:** Собака, 15 кг, взрослый, кастрированный
- **Активность:** Нормальная
- **Результат:** ~580 ккал МЭ в день

---

## 🚨 Важные замечания

1. **SQLite файл:** Создается автоматически при первом запуске
2. **Статичные файлы:** Frontend build обслуживается backend'ом
3. **CORS:** Настроен для production URL
4. **Логи:** Все ошибки логируются в консоль платформы

---

## ⭐ Рекомендация

**Для быстрой демонстрации заказчику используйте Railway:**
- 1 клик деплой
- Автоматический HTTPS
- Быстрая настройка
- Стабильная работа

**Время деплоя: 10-15 минут от нуля до готовой ссылки!** 