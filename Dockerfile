# Используем официальный Node.js образ
FROM node:18-alpine

# Устанавливаем рабочую директорию
WORKDIR /app

# Копируем package.json файлы
COPY package*.json ./
COPY backend/package*.json ./backend/
COPY frontend/package*.json ./frontend/

# Устанавливаем зависимости
RUN npm run install-deps

# Копируем весь код
COPY . .

# Создаем директорию для базы данных
RUN mkdir -p /app/backend/data

# Собираем фронтенд
RUN npm run build

# Экспонируем порт
EXPOSE 3001

# Запускаем приложение
CMD ["npm", "run", "deploy:start"] 