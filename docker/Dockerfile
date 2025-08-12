# Используем официальный образ Node.js
FROM node:18-alpine

# Устанавливаем рабочую директорию
WORKDIR /app

# Копируем файлы зависимостей
COPY package*.json ./

# Устанавливаем зависимости
RUN npm install --only=production

# Копируем исходный код (только необходимые файлы)
COPY app/ ./app/
COPY public/ ./public/
COPY server.js ./
COPY .env* ./

# Создаем пользователя для безопасности
RUN addgroup -g 1001 -S nodejs
RUN adduser -S biomark -u 1001

# Меняем владельца файлов
RUN chown -R biomark:nodejs /app
USER biomark

# Открываем порт
EXPOSE 3000

# Запускаем приложение
CMD ["npm", "start"]
