'use strict';

var config 	= require('../config');
var redis 	= require('redis').createClient;
var adapter = require('socket.io-redis');
var mongo = require('mongodb').MongoClient;
var url = 'mongodb://test:testtest1@ds061246.mlab.com:61246/diplomchik';



var User = require('../models/user');
var Card = require('../models/card');
var Post = require('../models/post');
 var assert = require('assert');


var ioEvents = function(io) {

 var nsp = io.of('/main');

	nsp.on('connection', function(socket) {

         console.log('someone connected');


		socket.on('disconnect', function() {

			
		});



	});



 var csp = io.of('/card');

	csp.on('connection', function(socket) {




	var resultArray = [];
	var resultDat =[];
	var resultArray2 = [];
	var resultDat2 =[];

	mongo.connect(url, function(err, db) {
		assert.equal(null, err);

    var cursor = db.collection('cards').find({ Datchik : 1 });

    assert.equal(null, err);

    var Dathiki = db.collection('posts').find({ ids : 1 });

    assert.equal(null, err);

    var cursor2 = db.collection('cards').find({ Datchik : 2 });

    assert.equal(null, err);

    var Dathiki2 = db.collection('posts').find({ ids : 2 }, { _id: false, ids:false, __v: false});


		   cursor.forEach(function(doc, err) {
     assert.equal(null, err);
       resultArray.push(doc);
    });


 cursor2.forEach(function(doc, err) {
     assert.equal(null, err);
       resultArray2.push(doc);
    });

    Dathiki.forEach(function(doc, err) {
      assert.equal(null, err);
       resultDat.push(doc);
    });


  Dathiki2.forEach(function(doc, err) {
      assert.equal(null, err);
      resultDat2 = (doc.temp1);
    }, function() {
      db.close();
    });



  });




		var timer = setInterval(function () {

        var temp1push = resultDat2;

		var datas = "Температура: " + temp1push;

        socket.emit ( 'news' , datas);

		socket.on('my other event', function (data) {
         	console.log(data);
         });


      }, 2000);

		

         console.log('connected to card');


		socket.on('disconnect', function() {

			
		});



	});




}



var init = function(app){

	var server 	= require('http').Server(app);
	var io 		= require('socket.io')(server);


	// Using Redis
	let port = config.redis.port;
	let host = config.redis.host;
	let password = config.redis.password;
	let pubClient = redis(port, host, { auth_pass: password });
	let subClient = redis(port, host, { auth_pass: password, return_buffers: true, });
	io.adapter(adapter({ pubClient, subClient }));

	// Allow sockets to access session data
	io.use((socket, next) => {
		require('../session')(socket.request, {}, next);
	});

	// Define all Events
	ioEvents(io);

	// The server object will be then used to list to a port number
	return server;
}

module.exports = init;