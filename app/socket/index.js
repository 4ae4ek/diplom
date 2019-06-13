'use strict';

var config 	= require('../config');
var redis 	= require('redis').createClient;
var adapter = require('socket.io-redis');



var ioEvents = function(io) {

 var nsp = io.of('/main');

	nsp.on('connection', function(socket) {

         console.log('someone connected');


		socket.on('disconnect', function() {

			
		});



	});



 var csp = io.of('/card');

	csp.on('connection', function(socket) {


         socket.emit('getdata', {greed : '34,5'});
            
         socket.on('greed', function (jok) {
              console.log(jok);
         });
   


         console.log('connected to card');


		socket.on('disconnect', function() {

			
		});



	});




}



var init = function(app){

	var server 	= require('http').Server(app);
	var io 		= require('socket.io')(server);
     
     var http, options, proxy, url;

http = require("http");

url = require("url");

proxy = url.parse(process.env.QUOTAGUARDSTATIC_URL);

var target  = url.parse("mighty-sea-79953.herokuapp.com");

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


options = {
  hostname: proxy.hostname,
  port: proxy.port || 80,
  path: target.href,
  headers: {
    "Proxy-Authorization": "Basic " + (new Buffer.from(proxy.auth).toString("base64")),
    "Host" : target.hostname
  }
};

http.get(options, function(res) {
  res.pipe(process.stdout);
  return console.log("status code", res.statusCode);
});


var request = require('request');

var options = {
    proxy: process.env.QUOTAGUARDSTATIC_URL,
    url: 'https://api.github.com/repos/joyent/node',
    headers: {
        'User-Agent': 'node.js'
    }
};

function callback(error, response, body) {
    if (!error && response.statusCode == 200) {
        console.log(body);
    }
}

request(options, callback);

	// Define all Events
	ioEvents(io);

	// The server object will be then used to list to a port number
	return server;
}

module.exports = init;