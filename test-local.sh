#!/bin/bash

echo "🚀 Тестирование VetFormuLab локально в production режиме..."

# Остановить процессы на портах
echo "📦 Останавливаю процессы на портах..."
lsof -ti:3000 | xargs kill -9 2>/dev/null || true
lsof -ti:3001 | xargs kill -9 2>/dev/null || true

# Установка зависимостей
echo "📦 Устанавливаю зависимости..."
npm run install-deps

# Сборка
echo "🔨 Собираю приложение..."
npm run build

# Запуск в production режиме
echo "🌟 Запускаю в production режиме на http://localhost:3001..."
NODE_ENV=production npm start 