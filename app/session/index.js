import session from 'express-session';
import MongoStore from 'connect-mongo';
import { config } from '../config/index.js';

const sessionConfig = session({
  secret: config.session.secret,
  resave: config.session.resave,
  saveUninitialized: config.session.saveUninitialized,
  cookie: config.session.cookie,
  store: MongoStore.create({
    mongoUrl: config.mongodb.uri,
    ttl: 24 * 60 * 60 // 24 часа
  })
});

export default sessionConfig;