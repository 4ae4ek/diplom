'use strict';

var cardModel = require('../database').models.card;

var create = function (data, callback){
	var newCard = new cardModel(data);
	newCard.save(callback);
};

var findOne = function (data, callback){
	cardModel.findOne(data, callback);
}

var findByDatchik = function (Datchik, callback){
	cardModel.findByDatchik(Datchik, callback);
} 

var findByFIOAndUpdate = function(FIO, data, callback){
	cardModel.findByFIOAndUpdate(FIO, data, { new: true }, callback);
}

module.exports = { 
	create, 
	findOne, 
	findByDatchik,
	findByFIOAndUpdate
};
