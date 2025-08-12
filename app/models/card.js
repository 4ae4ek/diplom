import { models } from '../database/index.js';

const create = async (data) => {
  const newCard = new models.card(data);
  return await newCard.save();
};

const findOne = async (data) => {
  return await models.card.findOne(data);
};

const findByDatchik = async (datchik) => {
  return await models.card.findOne({ Datchik: datchik });
};

const findByFIOAndUpdate = async (fio, data) => {
  return await models.card.findOneAndUpdate(
    { FIO: new RegExp('^' + fio + '$', 'i') }, 
    data, 
    { new: true }
  );
};

const findAll = async () => {
  return await models.card.find({}).sort({ createdAt: -1 });
};

export {
  create,
  findOne,
  findByDatchik,
  findByFIOAndUpdate,
  findAll
};
