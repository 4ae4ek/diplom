import passport from 'passport';
import LocalStrategy from 'passport-local';
import { models } from '../database/index.js';

passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
  try {
    const user = await models.user.findById(id);
    done(null, user);
  } catch (error) {
    done(error, null);
  }
});

passport.use(new LocalStrategy(async (username, password, done) => {
  try {
    const user = await models.user.findOne({ 
      username: new RegExp('^' + username + '$', 'i') 
    });
    
    if (!user) {
      return done(null, false, { message: 'Неверное имя пользователя.' });
    }
    
    const isValidPassword = await user.validatePassword(password);
    if (!isValidPassword) {
      return done(null, false, { message: 'Неверный пароль.' });
    }
    
    return done(null, user);
  } catch (error) {
    return done(error);
  }
}));

export default passport;