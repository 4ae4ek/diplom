'use strict';

var config 		= require('../config');
var Mongoose 	= require('mongoose');
var logger 		= require('../logger');
Mongoose.set('useFindAndModify', false);

var dbURI = "mongodb://test:testtest1@ds061246.mlab.com:61246/diplomchik";
Mongoose.connect(dbURI, { useNewUrlParser: true });


Mongoose.connection.on('error', function(err) {
	if(err) throw err;
});


Mongoose.Promise = global.Promise;

module.exports = { Mongoose, 
	models: {
		user: require('./schemas/user.js'),
		card: require('./schemas/card.js'),
		post: require('./schemas/post.js')
	}
};
