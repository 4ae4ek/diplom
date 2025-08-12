# 🐳 BioMark - Docker инструкции

## 🚀 Быстрый старт

### 1. Установка Docker Desktop
- Скачайте [Docker Desktop для Windows](https://www.docker.com/products/docker-desktop)
- Установите и запустите Docker Desktop
- Дождитесь, пока Docker Engine запустится (значок в трее станет зеленым)

### 2. Запуск проекта
```cmd
# Клонируйте репозиторий
git clone <repository-url>
cd biomark-monitoring

# Запустите проект
docker-compose -f docker/docker-compose.yml up -d --build
```

### 3. Откройте приложение
- Перейдите по адресу: http://localhost:3000
- Используйте тестовые данные для входа

## 📋 Доступные команды

### Основные команды
```cmd
docker-compose -f docker/docker-compose.yml up -d --build    # Полная установка и запуск
docker-compose -f docker/docker-compose.yml down             # Остановка приложения
docker-compose -f docker/docker-compose.yml logs -f          # Просмотр логов
```

## 🌐 Доступные сервисы

| Сервис | URL | Описание |
|--------|-----|----------|
| **BioMark** | http://localhost:3000 | Основное приложение |
| **MongoDB Express** | http://localhost:8081 | Веб-интерфейс MongoDB |
| **Redis Commander** | http://localhost:8082 | Веб-интерфейс Redis |

### Тестовые данные

#### Пользователи для входа:
| Логин | Пароль | ФИО | Должность |
|-------|--------|-----|-----------|
| `admin` | `admin123` | Администратор системы | Главный администратор |
| `doctor1` | `admin123` | Иванов Иван Иванович | Врач-терапевт |
| `nurse1` | `admin123` | Петрова Анна Сергеевна | Медсестра |
| `ddf` | `admin123` | Смирнов Дмитрий Федорович | Врач-кардиолог |
| `4aek` | `admin123` | Кузнецова Елена Александровна | Старшая медсестра |

#### Пациенты в системе:
- **Сидоров Алексей Петрович** (Датчик №1) - Пневмония
- **Козлова Мария Александровна** (Датчик №2) - Гипертонический криз

## 🔧 Режим разработки

### Запуск
```cmd
docker-compose -f docker/docker-compose.yml up -d --build
```

### Особенности
- ✅ Hot reload (автоматическая перезагрузка при изменении кода)
- ✅ Отладка через порт 9229
- ✅ Монтирование кода в контейнер
- ✅ Инструменты разработки (MongoDB Express, Redis Commander)

### Структура файлов
```
biomark-monitoring/
├── app/                    # Код приложения
├── public/                 # Статические файлы
├── scripts/                # Скрипты инициализации
├── logs/                   # Логи (создается автоматически)
├── docker/
│   ├── docker-compose.yml      # Конфигурация сервисов
│   ├── Dockerfile              # Образ для продакшена
│   └── Dockerfile.dev          # Образ для разработки
├── scripts/
│   └── init-mongo.js           # Инициализация MongoDB
```

## 🐛 Отладка



### Доступ к контейнерам
```cmd
# Войти в контейнер приложения
docker-compose -f docker/docker-compose.yml exec app sh

# Войти в MongoDB
docker-compose -f docker/docker-compose.yml exec mongo mongosh

# Войти в Redis
docker-compose -f docker/docker-compose.yml exec redis redis-cli
```

## 🧹 Очистка



## ⚠️ Устранение неполадок

### Docker не запускается
1. Проверьте, что Docker Desktop запущен
2. Перезапустите Docker Desktop
3. Проверьте системные требования

### Порт занят
```cmd
# Проверьте, что использует порт
netstat -ano | findstr :3000

# Остановите процесс или измените порт в docker-compose.yml
```

### Проблемы с образами
```cmd
# Пересоберите образы
docker-compose -f docker/docker-compose.yml build --no-cache
```

### Проблемы с базой данных
```cmd
# Проверьте статус MongoDB
docker-compose -f docker/docker-compose.yml exec mongo mongosh --eval "db.runCommand('ping')"

# Пересоздайте базу данных
docker-compose -f docker/docker-compose.yml down -v
docker-compose -f docker/docker-compose.yml up -d
```

## 📞 Поддержка

При возникновении проблем:
1. Перезапустите Docker Desktop
2. Выполните полную очистку: `docker-compose -f docker/docker-compose.yml down -v && docker system prune -f`

---

**BioMark Monitoring System** - Система мониторинга медицинских показателей
