import { models } from '../database/index.js';

const create = async (data) => {
  const newUser = new models.user(data);
  return await newUser.save();
};

const findOne = async (data) => {
  return await models.user.findOne(data);
};

const findById = async (id) => {
  return await models.user.findById(id);
};

const findOrCreate = async (data) => {
  const user = await findOne({ socialId: data.id });
  
  if (user) {
    return user;
  }
  
  const userData = {
    username: data.displayName,
    socialId: data.id,
    picture: data.photos?.[0]?.value || null
  };

  if (data.provider === "facebook" && userData.picture) {
    userData.picture = `http://graph.facebook.com/${data.id}/picture?type=large`;
  }

  return await create(userData);
};

const isAuthenticated = (req, res, next) => {
  if (req.isAuthenticated()) {
    next();
  } else {
    res.redirect('/');
  }
};

export {
  create,
  findOne,
  findById,
  findOrCreate,
  isAuthenticated
};
