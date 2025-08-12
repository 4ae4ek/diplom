import { models } from '../database/index.js';

const create = async (data) => {
  const newPost = new models.post(data);
  return await newPost.save();
};

const findOne = async (data) => {
  return await models.post.findOne(data);
};

const findById = async (id) => {
  return await models.post.findById(id);
};

const findOneAndUpdate = async (ids, data) => {
  return await models.post.findOneAndUpdate(ids, data, { new: true });
};

const find = async (data) => {
  return await models.post.find(data);
};

const findBySensorId = async (sensorId) => {
  return await models.post.findOne({ ids: sensorId });
};

export {
  create,
  findOne,
  findById,
  findOneAndUpdate,
  find,
  findBySensorId
};