import mongoose from 'mongoose';
import { config } from '../config/index.js';
import { logger } from '../logger/index.js';

import userModel from './schemas/user.js';
import cardModel from './schemas/card.js';
import postModel from './schemas/post.js';
import sensorModel from './schemas/sensor.js';

const connect = async () => {
  try {
    // Отключаем логи MongoDB
    mongoose.set('debug', false);
    
    await mongoose.connect(config.mongodb.uri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      // Отключаем логи подключения
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000
    });
    
    logger.debug('MongoDB подключена успешно');
  } catch (error) {
    logger.error('Ошибка подключения к MongoDB:', error);
    process.exit(1);
  }
};

const disconnect = async () => {
  try {
    await mongoose.disconnect();
    logger.debug('MongoDB отключена');
  } catch (error) {
    logger.error('Ошибка отключения от MongoDB:', error);
  }
};

const models = {
  user: userModel,
  card: cardModel,
  post: postModel,
  sensor: sensorModel
};

export { connect, disconnect, models };
export default { connect, disconnect, models };
