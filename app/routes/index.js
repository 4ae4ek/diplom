import express from 'express';
import passport from 'passport';
import { MongoClient, ObjectId } from 'mongodb';
import { config } from '../config/index.js';
import { logger } from '../logger/index.js';
import { isAuthenticated } from '../middleware/auth.js';
import { uploadSingle, handleUploadError } from '../middleware/upload.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import bcrypt from 'bcryptjs';

import { models } from '../database/index.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const router = express.Router();

// Главная страница
router.get('/', (req, res) => {
  if (req.isAuthenticated()) {
    res.redirect('/main');
  } else {
    res.render('login', {
      success: req.flash('success')[0],
      errors: req.flash('error'),
      showRegisterForm: req.flash('showRegisterForm')[0]
    });
  }
});

// Аутентификация
router.post('/login', passport.authenticate('local', {
  successRedirect: '/main',
  failureRedirect: '/',
  failureFlash: true
}));

// Регистрация
router.post('/register', async (req, res) => {
  try {
    const credentials = {
      username: req.body.username,
      password: req.body.password,
      FIO: req.body.FIO,
      Rang: req.body.Rang
    };

    if (!credentials.username || !credentials.password || !credentials.FIO) {
      req.flash('error', 'Вы что-то не заполнили');
      req.flash('showRegisterForm', true);
      return res.redirect('/');
    }

    const existingUser = await models.user.findOne({ 
      username: new RegExp('^' + req.body.username + '$', 'i') 
    });
    
    if (existingUser) {
      req.flash('error', 'Имя пользователя уже занято.');
      req.flash('showRegisterForm', true);
      return res.redirect('/');
    }

    await models.user.create(credentials);
    req.flash('success', 'Ваш аккаунт создан. Пожалуйста войдите.');
    res.redirect('/');
  } catch (error) {
    logger.error('Ошибка регистрации:', error);
    req.flash('error', 'Произошла ошибка при регистрации');
    res.redirect('/');
  }
});

// Получение данных с датчиков
router.get('/temp', async (req, res) => {
  try {
    const data = {
      temp1: req.query.temp1,
      pulse: req.query.pulse,
      ids: req.query.ids
    };

    const existingPost = await models.post.findOne({ ids: req.query.ids });
    
    if (existingPost) {
      await models.post.findOneAndUpdate(
        { ids: req.query.ids },
        {
          temp1: req.query.temp1,
          pulse: req.query.pulse,
          timestamp: new Date()
        }
      );
    } else {
      await models.post.create(data);
    }

    logger.debug('Данные датчика получены:', req.query);
    res.sendStatus(200);
  } catch (error) {
    logger.error('Ошибка получения данных датчика:', error);
    res.sendStatus(500);
  }
});

// Страница карточек
router.get('/card', [isAuthenticated, (req, res) => {
  res.render('card.ejs');
}]);

// Создание карточки пациента
router.post('/card', [isAuthenticated, async (req, res) => {
  try {
    if (!req.body) return res.json({ success: false, error: 'Нет данных' });

    const cardData = {
      FIO: req.body.FIO,
      Datebirthday: req.body.Datebirthday,
      Dategospital: req.body.Dategospital,
      Datchik: req.body.Datchik,
      History: req.body.History,
      Diagnoz: req.body.Diagnoz
    };

    const existingCard = await models.card.findOne({ 
      FIO: new RegExp('^' + req.body.FIO + '$', 'i') 
    });
    
    if (existingCard) {
      return res.json({ success: false, error: 'Карточка с данным ФИО уже была создана' });
    }

    const existingDatchik = await models.card.findOne({ Datchik: req.body.Datchik });
    if (existingDatchik) {
      return res.json({ success: false, error: 'Данный датчик уже занят' });
    }

    await models.card.create(cardData);
    res.json({ success: true, message: 'Карточка пациента успешно создана' });
  } catch (error) {
    logger.error('Ошибка создания карточки:', error);
    res.json({ success: false, error: 'Произошла ошибка при создании карточки' });
  }
}]);

// Отправка email
router.post('/mail', [isAuthenticated, async (req, res) => {
  try {
    if (!req.body) return res.sendStatus(400);

    const nodemailer = await import('nodemailer');
    const transporter = nodemailer.default.createTransport({
      host: config.email.host,
      port: config.email.port,
      auth: {
        user: config.email.user,
        pass: config.email.pass
      }
    });

    const message = {
      from: req.body.mail,
      to: 'Служба поддержки <popka.dj@gmail.com>',
      subject: req.body.theme,
      text: req.body.FIOmail,
      html: req.body.gltext,
    };

    await transporter.sendMail(message);
    logger.debug('Email отправлен успешно');
    res.redirect('/card');
  } catch (error) {
    logger.error('Ошибка отправки email:', error);
    res.redirect('/card');
  }
}]);

// Главная страница после входа
router.get('/main', [isAuthenticated, (req, res) => {
  res.render('main');
}]);

// Страница графиков


// Страница работников
router.get('/worker', [isAuthenticated, (req, res) => {
  res.render('worker.ejs');
}]);

// Страница управления датчиками
router.get('/sensors', [isAuthenticated, (req, res) => {
  res.render('sensors.ejs');
}]);

// Загрузка фото пользователя
router.post('/upload-photo/:userId', [isAuthenticated, uploadSingle, handleUploadError], async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'Файл не был загружен' });
    }

    const userId = req.params.userId;
    const photoPath = '/uploads/' + req.file.filename;

    const client = new MongoClient(config.mongodb.uri);
    await client.connect();
    
    const db = client.db();
    
    // Получаем старую фотографию для удаления
    const oldUser = await db.collection('users').findOne({ _id: new ObjectId(userId) });
    
    // Обновляем пользователя с новой фотографией
    await db.collection('users').updateOne(
      { _id: new ObjectId(userId) },
      { $set: { photo: photoPath } }
    );
    
    await client.close();

    // Удаляем старую фотографию, если она существует и не является дефолтной
    if (oldUser && oldUser.photo && oldUser.photo !== '/uploads/default-avatar.png') {
      const oldPhotoPath = path.join(__dirname, '../../public', oldUser.photo);
      if (fs.existsSync(oldPhotoPath)) {
        fs.unlinkSync(oldPhotoPath);
      }
    }

    res.json({ success: true, photo: photoPath });
  } catch (error) {
    logger.error('Ошибка загрузки фото:', error);
    res.status(500).json({ error: 'Ошибка загрузки фото' });
  }
});

// Удаление фото пользователя
router.delete('/delete-photo/:userId', [isAuthenticated], async (req, res) => {
  try {
    const userId = req.params.userId;

    const client = new MongoClient(config.mongodb.uri);
    await client.connect();
    
    const db = client.db();
    
    // Получаем пользователя
    const user = await db.collection('users').findOne({ _id: new ObjectId(userId) });
    
    if (!user) {
      await client.close();
      return res.status(404).json({ error: 'Пользователь не найден' });
    }

    // Удаляем старую фотографию, если она существует и не является дефолтной
    if (user.photo && user.photo !== '/uploads/default-avatar.png') {
      const photoPath = path.join(__dirname, '../../public', user.photo);
      if (fs.existsSync(photoPath)) {
        fs.unlinkSync(photoPath);
      }
    }

    // Устанавливаем дефолтную фотографию
    await db.collection('users').updateOne(
      { _id: new ObjectId(userId) },
      { $set: { photo: '/uploads/default-avatar.png' } }
    );
    
    await client.close();

    res.json({ success: true, photo: '/uploads/default-avatar.png' });
  } catch (error) {
    logger.error('Ошибка удаления фото:', error);
    res.status(500).json({ error: 'Ошибка удаления фото' });
  }
});

// Добавление тестовых данных
router.post('/add-test-data', async (req, res) => {
  try {
    const client = new MongoClient(config.mongodb.uri);
    await client.connect();
    
    const db = client.db();
    
    // Создаем индексы если их нет
    await db.collection('users').createIndex({ "username": 1 }, { unique: true });
    await db.collection('cards').createIndex({ "FIO": 1 });
    await db.collection('cards').createIndex({ "Datchik": 1 }, { unique: true });
    await db.collection('posts').createIndex({ "ids": 1 }, { unique: true });
    await db.collection('sensors').createIndex({ "sensorId": 1 }, { unique: true });
    
    // Тестовые пользователи (только 2 основных)
    const users = [
      {
        username: "admin",
        password: "admin123",
        FIO: "Администратор системы",
        Rang: "Главный администратор"
      },
      {
        username: "doctor1",
        password: "admin123",
        FIO: "Иванов Иван Иванович",
        Rang: "Врач-терапевт"
      }
    ];

    // Тестовые карточки пациентов
    const cards = [
      {
        FIO: "Сидоров Алексей Петрович",
        Datebirthday: "15.03.1985",
        Dategospital: "10.08.2024",
        Datchik: 1,
        History: "ОРВИ, легкая форма",
        Diagnoz: "Пневмония",
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        FIO: "Козлова Мария Александровна",
        Datebirthday: "22.07.1992",
        Dategospital: "12.08.2024",
        Datchik: 2,
        History: "Гипертония, сахарный диабет",
        Diagnoz: "Гипертонический криз",
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ];

    // Тестовые данные датчиков (базовые)
    const posts = [
      {
        ids: 1,
        temp1: "36.6",
        pulse: 72,
        timestamp: new Date()
      },
      {
        ids: 2,
        temp1: "37.2",
        pulse: 85,
        timestamp: new Date()
      }
    ];

    // Генерируем дополнительные данные датчиков (50 показаний на каждый датчик)
    const additionalSensorData = [];
    
    for (let sensorId = 1; sensorId <= 2; sensorId++) {
      const now = new Date();
      for (let i = 49; i >= 0; i--) {
        const timestamp = new Date(now.getTime() - i * 30 * 60 * 1000); // каждые 30 минут
        
        // Генерируем реалистичные данные
        const baseTemp = 36.6 + (Math.random() - 0.5) * 2; // 35.6 - 37.6
        const basePulse = 70 + (Math.random() - 0.5) * 20; // 60 - 80
        
        additionalSensorData.push({
          ids: sensorId,
          temp1: baseTemp.toFixed(1),
          pulse: Math.round(basePulse),
          timestamp: timestamp
        });
      }
    }

    // Тестовые датчики
    const sensors = [
      {
        sensorId: 1,
        name: "Датчик температуры №1",
        type: "combined",
        description: "Основной датчик для палаты №1",
        isActive: true,
        location: "Палата №1",
        lastReading: {
          temperature: "36.6",
          pulse: 72,
          timestamp: new Date()
        },
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        sensorId: 2,
        name: "Датчик пульса №2",
        type: "combined",
        description: "Основной датчик для палаты №2",
        isActive: true,
        location: "Палата №2",
        lastReading: {
          temperature: "37.2",
          pulse: 85,
          timestamp: new Date()
        },
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        sensorId: 3,
        name: "Резервный датчик",
        type: "temperature",
        description: "Резервный датчик температуры",
        isActive: false,
        location: "Склад",
        lastReading: {
          temperature: null,
          pulse: null,
          timestamp: new Date()
        },
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ];

    let addedUsers = 0;
    let addedCards = 0;
    let addedPosts = 0;
    let addedSensors = 0;
    let existingUsers = 0;
    let existingCards = 0;
    let existingPosts = 0;
    let existingSensors = 0;

    // Добавляем пользователей через функцию регистрации
    for (const user of users) {
      const existingUser = await models.user.findOne({ username: user.username });
      if (!existingUser) {
        // Хешируем пароль
        const hashedPassword = await bcrypt.hash(user.password, 12);
        
        // Создаем пользователя с правильной структурой
        await models.user.create({
          username: user.username,
          password: hashedPassword,
          FIO: user.FIO,
          Rang: user.Rang,
          photo: "/uploads/default-avatar.png",
          createdAt: new Date()
        });
        addedUsers++;
      } else {
        existingUsers++;
      }
    }

    // Добавляем карточки
    for (const card of cards) {
      const existingCard = await db.collection('cards').findOne({ FIO: card.FIO });
      if (!existingCard) {
        await db.collection('cards').insertOne(card);
        addedCards++;
      } else {
        existingCards++;
      }
    }

    // Добавляем данные датчиков (базовые + дополнительные)
    const allSensorData = [...posts, ...additionalSensorData];
    for (const post of allSensorData) {
      const existingPost = await db.collection('posts').findOne({ ids: post.ids });
      if (!existingPost) {
        await db.collection('posts').insertOne(post);
        addedPosts++;
      } else {
        existingPosts++;
      }
    }

    // Добавляем датчики
    for (const sensor of sensors) {
      const existingSensor = await db.collection('sensors').findOne({ sensorId: sensor.sensorId });
      if (!existingSensor) {
        await db.collection('sensors').insertOne(sensor);
        addedSensors++;
      } else {
        existingSensors++;
      }
    }
    
    await client.close();

    res.json({ 
      success: true, 
      message: `Тестовые данные обработаны успешно!`,
      details: {
        users: addedUsers,
        cards: addedCards,
        posts: addedPosts,
        sensors: addedSensors,
        existingUsers: existingUsers,
        existingCards: existingCards,
        existingPosts: existingPosts,
        existingSensors: existingSensors
      }
    });
  } catch (error) {
    logger.error('Ошибка добавления тестовых данных:', error);
    res.status(500).json({ error: 'Ошибка добавления тестовых данных' });
  }
});

// Пересоздание тестовых данных (удаление и добавление заново)
router.post('/reset-test-data', async (req, res) => {
  try {
    const client = new MongoClient(config.mongodb.uri);
    await client.connect();
    
    const db = client.db();
    
    // Очищаем существующие данные
    await db.collection('users').deleteMany({});
    await db.collection('cards').deleteMany({});
    await db.collection('posts').deleteMany({});
    await db.collection('sensors').deleteMany({});
    
    // Создаем индексы
    await db.collection('users').createIndex({ "username": 1 }, { unique: true });
    await db.collection('cards').createIndex({ "FIO": 1 });
    await db.collection('cards').createIndex({ "Datchik": 1 }, { unique: true });
    await db.collection('posts').createIndex({ "ids": 1 }, { unique: true });
    await db.collection('sensors').createIndex({ "sensorId": 1 }, { unique: true });
    
    // Тестовые пользователи (только 2 основных)
    const users = [
      {
        username: "admin",
        password: "admin123",
        FIO: "Администратор системы",
        Rang: "Главный администратор"
      },
      {
        username: "doctor1",
        password: "admin123",
        FIO: "Иванов Иван Иванович",
        Rang: "Врач-терапевт"
      }
    ];

    // Тестовые карточки пациентов
    const cards = [
      {
        FIO: "Сидоров Алексей Петрович",
        Datebirthday: "15.03.1985",
        Dategospital: "10.08.2024",
        Datchik: 1,
        History: "ОРВИ, легкая форма",
        Diagnoz: "Пневмония",
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        FIO: "Козлова Мария Александровна",
        Datebirthday: "22.07.1992",
        Dategospital: "12.08.2024",
        Datchik: 2,
        History: "Гипертония, сахарный диабет",
        Diagnoz: "Гипертонический криз",
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ];

    // Тестовые данные датчиков (базовые)
    const posts = [
      {
        ids: 1,
        temp1: "36.6",
        pulse: 72,
        timestamp: new Date()
      },
      {
        ids: 2,
        temp1: "37.2",
        pulse: 85,
        timestamp: new Date()
      }
    ];

    // Генерируем дополнительные данные датчиков (50 показаний на каждый датчик)
    const additionalSensorData = [];
    
    for (let sensorId = 1; sensorId <= 2; sensorId++) {
      const now = new Date();
      for (let i = 49; i >= 0; i--) {
        const timestamp = new Date(now.getTime() - i * 30 * 60 * 1000); // каждые 30 минут
        
        // Генерируем реалистичные данные
        const baseTemp = 36.6 + (Math.random() - 0.5) * 2; // 35.6 - 37.6
        const basePulse = 70 + (Math.random() - 0.5) * 20; // 60 - 80
        
        additionalSensorData.push({
          ids: sensorId,
          temp1: baseTemp.toFixed(1),
          pulse: Math.round(basePulse),
          timestamp: timestamp
        });
      }
    }

    // Тестовые датчики
    const sensors = [
      {
        sensorId: 1,
        name: "Датчик температуры №1",
        type: "combined",
        description: "Основной датчик для палаты №1",
        isActive: true,
        location: "Палата №1",
        lastReading: {
          temperature: "36.6",
          pulse: 72,
          timestamp: new Date()
        },
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        sensorId: 2,
        name: "Датчик пульса №2",
        type: "combined",
        description: "Основной датчик для палаты №2",
        isActive: true,
        location: "Палата №2",
        lastReading: {
          temperature: "37.2",
          pulse: 85,
          timestamp: new Date()
        },
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        sensorId: 3,
        name: "Резервный датчик",
        type: "temperature",
        description: "Резервный датчик температуры",
        isActive: false,
        location: "Склад",
        lastReading: {
          temperature: null,
          pulse: null,
          timestamp: new Date()
        },
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ];

    // Добавляем пользователей через функцию регистрации (без хеширования, как в /register)
    for (const user of users) {
      await models.user.create({
        username: user.username,
        password: user.password, // Пароль без хеширования, как в /register
        FIO: user.FIO,
        Rang: user.Rang
      });
    }

    // Добавляем остальные данные
    await db.collection('cards').insertMany(cards);
    await db.collection('sensors').insertMany(sensors);
    
    // Добавляем все данные датчиков (базовые + дополнительные)
    const allSensorData = [...posts, ...additionalSensorData];
    await db.collection('posts').insertMany(allSensorData);
    
    await client.close();

    res.json({ 
      success: true, 
      message: `Тестовые данные пересозданы успешно!`,
      details: {
        users: users.length,
        cards: cards.length,
        posts: posts.length + additionalSensorData.length,
        sensors: sensors.length
      }
    });
  } catch (error) {
    logger.error('Ошибка пересоздания тестовых данных:', error);
    res.status(500).json({ error: 'Ошибка пересоздания тестовых данных' });
  }
});

// Маршрут для добавления датчика
router.post('/add-sensor', isAuthenticated, async (req, res) => {
  try {
    const { sensorId, name, type, description } = req.body;
    
    // Проверяем, что все обязательные поля заполнены
    if (!sensorId || !type) {
      return res.json({ success: false, error: 'ID датчика и тип обязательны для заполнения' });
    }
    
    // Проверяем, что датчик с таким ID не существует
    const existingSensor = await models.sensor.findOne({ sensorId: parseInt(sensorId) });
    if (existingSensor) {
      return res.json({ success: false, error: 'Датчик с таким ID уже существует' });
    }
    
    // Создаем новый датчик
    const newSensor = new models.sensor({
      sensorId: parseInt(sensorId),
      name: name || `Датчик №${sensorId}`,
      type: type,
      description: description || '',
      isActive: true,
      location: 'Не указано',
      lastReading: {
        temperature: null,
        pulse: null,
        timestamp: new Date()
      },
      createdAt: new Date(),
      updatedAt: new Date()
    });
    
    await newSensor.save();
    
    res.json({ success: true, message: 'Датчик успешно добавлен' });
  } catch (error) {
    console.error('Ошибка добавления датчика:', error);
    res.json({ success: false, error: 'Ошибка добавления датчика' });
  }
});



// Выход
router.get('/logout', (req, res) => {
  req.logout((err) => {
    if (err) {
      logger.error('Ошибка выхода:', err);
    }
    req.session = null;
    res.redirect('/');
  });
});

export default router;