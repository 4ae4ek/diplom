'use strict';

var postModel = require('../database').models.post;

var create = function (data, callback){
	var newPost = new postModel(data);
	newPost.save(callback);
};

var findOne = function (data, callback){
	postModel.findOne(data, callback);
}

var findById = function (id, callback){
	postModel.findById(id, callback);
} 

var findOneAndUpdate = function(ids, data, callback){
	postModel.findOneAndUpdate(ids, data, { new: true }, callback);
}

var find = function (data, callback){
	postModel.find(data, callback);
}


module.exports = { 
	create, 
	findOne, 
	findById,
	findOneAndUpdate,
	find
};