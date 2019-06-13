'use strict';


var express     = require('express');
var app         = express();
var path        = require('path');
var bodyParser  = require('body-parser');
var flash       = require('connect-flash');


var routes      = require('./app/routes');
var session     = require('./app/session');
var passport    = require('./app/auth');
var ioServer    = require('./app/socket')(app);
var logger      = require('./app/logger');
var mailer      = require('./app/mailer');


var port = process.env.PORT || 3000;





var http = require("http");

var url = require("url");

var proxy = url.parse(process.env.QUOTAGUARDSTATIC_URL);

var target  = url.parse("http://ip.quotaguard.com/");


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


app.set('views', path.join(__dirname, 'app/views'));
app.set('view engine', 'ejs');


app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static('public'));

app.use(session);
app.use(passport.initialize());
app.use(passport.session());
app.use(flash());

app.use('/', routes);


app.use(function(req, res, next) {
  res.status(404).sendFile(process.cwd() + '/app/views/404.htm');
});

ioServer.listen(port);