import { createServer } from 'http';
import { Server } from 'socket.io';
import { createClient } from 'redis';
import { createAdapter } from '@socket.io/redis-adapter';
import { MongoClient } from 'mongodb';
import { config } from '../config/index.js';
import { logger } from '../logger/index.js';

import { models } from '../database/index.js';

const ioEvents = (io) => {
  const nsp = io.of('/main');
  nsp.on('connection', (socket) => {
    logger.debug('Пользователь подключился к /main');
    socket.on('disconnect', () => {
      logger.debug('Пользователь отключился от /main');
    });
  });

  const csp = io.of('/card');
  csp.on('connection', (socket) => {
    logger.debug('Пользователь подключился к /card');
    
    // Кэш для хранения предыдущих данных
    let previousData = {
      cards: null,
      sensors: null
    };
    
    // Функция для сравнения данных
    const hasDataChanged = (newData, oldData) => {
      if (!oldData) return true;
      return JSON.stringify(newData) !== JSON.stringify(oldData);
    };

    // Функция для получения и отправки данных
    const fetchAndSendData = async () => {
      try {
        const client = new MongoClient(config.mongodb.uri);
        await client.connect();
        
        const db = client.db();
        
        // Получаем все карточки пациентов
        const cards = await db.collection('cards').find({}).toArray();
        
        // Получаем все данные датчиков
        const sensors = await db.collection('posts').find({}).toArray();
        
        await client.close();

        // Проверяем изменения данных
        const cardsChanged = hasDataChanged(cards, previousData.cards);
        const sensorsChanged = hasDataChanged(sensors, previousData.sensors);

        // Обновляем кэш
        previousData.cards = cards;
        previousData.sensors = sensors;

        // Отправляем данные только если они изменились
        if (cardsChanged || sensorsChanged) {
          socket.emit('patientsData', { cards, sensors });
        }
      } catch (error) {
        logger.error('Ошибка в Socket.io:', error);
      }
    };

    // Сразу загружаем данные при подключении
    fetchAndSendData();

    // Затем запускаем цикл обновлений
    const timer = setInterval(fetchAndSendData, 3000);

    socket.on('disconnect', () => {
      clearInterval(timer);
      logger.debug('Пользователь отключился от /card');
    });
  });

  // Страница управления датчиками
  const ssp = io.of('/sensors');
  ssp.on('connection', (socket) => {
    logger.debug('Пользователь подключился к /sensors');
    
    // Кэш для хранения предыдущих данных
    let previousSensorsData = null;
    
    // Функция для сравнения данных
    const hasDataChanged = (newData, oldData) => {
      if (!oldData) return true;
      return JSON.stringify(newData) !== JSON.stringify(oldData);
    };

    // Функция для получения и отправки данных датчиков
    const fetchAndSendSensorsData = async () => {
      try {
        const client = new MongoClient(config.mongodb.uri);
        await client.connect();
        
        const db = client.db();
        
        // Получаем все данные датчиков
        const sensors = await db.collection('posts').find({}).toArray();
        
        await client.close();

        // Проверяем изменения данных
        const sensorsChanged = hasDataChanged(sensors, previousSensorsData);

        // Обновляем кэш
        previousSensorsData = sensors;

        // Отправляем данные только если они изменились
        if (sensorsChanged) {
          socket.emit('sensorsData', { sensors });
        }
      } catch (error) {
        logger.error('Ошибка в Socket.io датчиков:', error);
      }
    };

    // Сразу загружаем данные при подключении
    fetchAndSendSensorsData();

    // Затем запускаем цикл обновлений
    const timer = setInterval(fetchAndSendSensorsData, 3000);

    socket.on('disconnect', () => {
      clearInterval(timer);
      logger.debug('Пользователь отключился от /sensors');
    });
  });

  // Страница работников
  const wsp = io.of('/worker');
  wsp.on('connection', (socket) => {
    logger.debug('Пользователь подключился к /worker');
    
    // Кэш для хранения предыдущих данных
    let previousWorkersData = null;
    
    // Функция для сравнения данных
    const hasDataChanged = (newData, oldData) => {
      if (!oldData) return true;
      return JSON.stringify(newData) !== JSON.stringify(oldData);
    };

    // Функция для получения и отправки данных работников
    const fetchAndSendWorkersData = async () => {
      try {
        const client = new MongoClient(config.mongodb.uri);
        await client.connect();
        
        const db = client.db();
        
        // Получаем всех работников
        const workers = await db.collection('users').find({}).toArray();
        
        await client.close();

        // Проверяем изменения данных
        const workersChanged = hasDataChanged(workers, previousWorkersData);

        // Обновляем кэш
        previousWorkersData = workers;

        // Отправляем данные только если они изменились
        if (workersChanged) {
          socket.emit('workersData', { workers });
        }
      } catch (error) {
        logger.error('Ошибка в Socket.io работников:', error);
      }
    };

                  // Сразу загружаем данные при подключении
              fetchAndSendWorkersData();
            
              // Затем запускаем цикл обновлений
              const timer = setInterval(fetchAndSendWorkersData, 3000);
              
              // Обработка запроса на обновление данных
              socket.on('requestWorkersData', () => {
                fetchAndSendWorkersData();
              });

    socket.on('disconnect', () => {
      clearInterval(timer);
      logger.debug('Пользователь отключился от /worker');
    });
  });
};

const init = (app) => {
  const server = createServer(app);
  const io = new Server(server);

  // Настройка Redis адаптера
  if (config.redis.host !== 'localhost') {
    const pubClient = createClient({
      url: `redis://${config.redis.host}:${config.redis.port}`,
      password: config.redis.password
    });
    const subClient = pubClient.duplicate();
    
    io.adapter(createAdapter(pubClient, subClient));
    
    pubClient.connect();
    subClient.connect();
  }

  // Разрешаем доступ к сессиям
  io.use((socket, next) => {
    import('../session/index.js').then(sessionModule => {
      sessionModule.default(socket.request, {}, next);
    });
  });

  // Определяем события
  ioEvents(io);

  return server;
};

export default init;