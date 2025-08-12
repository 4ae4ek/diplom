// Скрипт инициализации MongoDB для Docker
db = db.getSiblingDB('biomark');

print('Начинаем инициализацию базы данных...');

// Создаем коллекции
db.createCollection('users');
db.createCollection('cards');
db.createCollection('posts');
db.createCollection('sensors');

// Создаем индексы
db.users.createIndex({ "username": 1 }, { unique: true });
db.cards.createIndex({ "FIO": 1 });
db.cards.createIndex({ "Datchik": 1 }, { unique: true });
db.posts.createIndex({ "ids": 1 }, { unique: true });
db.sensors.createIndex({ "sensorId": 1 }, { unique: true });

print('MongoDB инициализирована успешно!');
