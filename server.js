import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import bodyParser from 'body-parser';
import flash from 'connect-flash';

import routes from './app/routes/index.js';
import session from './app/session/index.js';
import passport from './app/auth/index.js';
import ioServer from './app/socket/index.js';
import logger from './app/logger/index.js';
import mailer from './app/mailer/index.js';
import { connect } from './app/database/index.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = process.env.PORT || 3000;

// Настройка view engine
app.set('views', path.join(__dirname, 'app/views'));
app.set('view engine', 'ejs');

// Middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static('public'));

// Session и аутентификация
app.use(session);
app.use(passport.initialize());
app.use(passport.session());
app.use(flash());

// Маршруты
app.use('/', routes);

// Обработка 404
app.use((req, res) => {
  res.status(404).sendFile(path.join(__dirname, 'app/views/404.htm'));
});

// Обработка ошибок
app.use((err, req, res, next) => {
  logger.error(err.stack);
  res.status(500).send('Что-то пошло не так!');
});

// Запуск сервера
const startServer = async () => {
  try {
    // Подключаемся к базе данных
    await connect();
    
    // Запускаем сервер
    const server = ioServer(app);
    server.listen(port, () => {
      logger.info(`🚀 BioMark сервер запущен на порту ${port}`);
    });
  } catch (error) {
    logger.error('Ошибка запуска сервера:', error);
    process.exit(1);
  }
};

startServer();