'use strict';

var config = require('../config');
var redis = require('redis').createClient;
var adapter = require('socket.io-redis');
var mongo = require('mongodb').MongoClient;
var url = 'mongodb://test:testtest1@ds061246.mlab.com:61246/diplomchik';


var User = require('../models/user');
var Card = require('../models/card');
var Post = require('../models/post');
var assert = require('assert');


var ioEvents = function (io) {
    var nsp = io.of('/main');
    nsp.on('connection', function (socket) {
        console.log('someone connected');
        socket.on('disconnect', function () {
        });
    });

    var csp = io.of('/card');
    csp.on('connection', function (socket) {
        var resultArray = [];
        var resultArrayDatebirthday = [];
        var resultArrayDategospital = [];
        var resultArrayDatchik = [];
        var resultArrayHistory = [];
        var resultArrayDiagnoz = [];
        var resultDat = [];
        var resultDatpulse = [];
        var resultArray2 = [];
        var resultArrayDatebirthday2 = [];
        var resultArrayDategospital2 = [];
        var resultArrayDatchik2 = [];
        var resultArrayHistory2 = [];
        var resultArrayDiagnoz2 = [];
        var resultDat2 = [];
        var resultDat2pulse = [];


        var timer = setInterval(function () {
            mongo.connect(url, function (err, db) {
                var cursor = db.collection('cards').find({Datchik: 1});
                assert.equal(null, err);

                var Dathiki = db.collection('posts').find({ids: 1});
                assert.equal(null, err);

                var cursor2 = db.collection('cards').find({Datchik: 2});
                assert.equal(null, err);

                var Dathiki2 = db.collection('posts').find({ids: 2}, {_id: false, ids: false, __v: false});
                assert.equal(null, err);

                cursor.forEach(function (doc, err) {
                    assert.equal(null, err);
                    resultArray = (doc.FIO);
                    resultArrayDatebirthday = (doc.Datebirthday);
                    resultArrayDategospital = (doc.Dategospital);
                    resultArrayDatchik = (doc.Datchik);
                    resultArrayHistory = (doc.History);
                    resultArrayDiagnoz = (doc.Diagnoz);
                });

                cursor2.forEach(function (doc, err) {
                    assert.equal(null, err);
                    resultArray2 = (doc.FIO);
                    resultArrayDatebirthday2 = (doc.Datebirthday);
                    resultArrayDategospital2 = (doc.Dategospital);
                    resultArrayDatchik2 = (doc.Datchik);
                    resultArrayHistory2 = (doc.History);
                    resultArrayDiagnoz2 = (doc.Diagnoz);
                });

                Dathiki.forEach(function (doc, err) {
                    assert.equal(null, err);
                    resultDat = (doc.temp1);
                    resultDatpulse = (doc.pulse)
                });

                Dathiki2.forEach(function (doc, err) {
                    assert.equal(null, err);
                    resultDat2 = (doc.temp1);
                    resultDat2pulse = (doc.pulse);
                }, function () {
                    db.close();
                });
            });

            if (resultArrayDatchik == 1) {
                var datas4 =
                    '<div class="col">' +
                    '<div class="h-50 d-inline-block" style=" background-color: rgba(0,0,255,.1)">' +
                    '<div class="card" style="border-radius: 15px; margin-bottom: 50px;">' +
                    '<div class="card-body">' +
                    '<img src="https://st.depositphotos.com/1008939/1880/i/450/depositphotos_18807295-stock-photo-portrait-of-handsome-man.jpg" width="100%" height="100%" alt="..." style="border-radius: 15px;">' +
                    '<button type="button"  data-toggle="modal" data-target="#exampleModal4" style="border: 10px; border-color: rgb(128,137,158); border-radius: 15px; margin-top: 1.5rem; display: flex; align-items: center">' +
                    'Открыть карточку пациента ' + resultArray +
                    '</button>' +
                    '</div>' +
                    '</div>' +
                    '</div>' +
                    '</div>';
            } else {
                var datas4 = '<div></div>';
            }

            socket.emit('carto', datas4);


            var datas5 =
                '<div class="modal-dialog" role="document">' +
                '<div class="modal-content">' +
                '<div class="modal-header">' +
                '<h5 style="margin-top: 30px;">ФИО: ' + resultArray + '</h5>' +
                '<button type="button" class="close" data-dismiss="modal" aria-label="Close">' +
                '<span aria-hidden="true">&times;</span>' +
                '</button>' +
                '</div>' +
                '<div class="modal-body">' +
                '<section class="get">' +
                '<article class="items" style="">' +
                '<div  style="color:Black;">ФИО: ' + resultArray + '</div>' +
                '<div  style="color:Black;">Дата рождения: ' + resultArrayDatebirthday + '</div>' +
                '<div  style="color:Black;">Дата госпитализации: ' + resultArrayDategospital + '</div>' +
                '<div  style="color:Black;">Номер датчика: ' + resultArrayDatchik + '</div>' +
                '<div  style="color:Black;">История болезни: ' + resultArrayHistory + '</div>' +
                '<div  style="color:Black;">Диагноз: ' + resultArrayDiagnoz + '</div>' +
                '<br>' +
                '</article>' +
                '<article class="good" style="align-self: left;">' +
                '<div class="alert alert-success" style="color:Black; margin-top: -16px;  margin-right: 3px;">Температура: ' + resultDat2 + '</div>' +
                '<div class="alert alert-success" style="color:Black; margin-top: -16px;  margin-right: 3px;">Пульс: ' + resultDat2pulse + '</div>' +
                '</article>' +
                '</section>' +
                '<div>' +
                '<canvas id="myChart4"></canvas>' +
                '</div>' +
                '</div>' +
                '<div class="modal-footer">' +
                '<button type="button" class="btn btn-secondary" data-dismiss="modal">Закрыть</button>' +
                '</div>' +
                '</div>' +
                '</div>';
            socket.emit('cartomodal', datas5);

            if (resultArrayDatchik2 == 2) {
                var datas =
                    '<div class="col">' +
                    '<div class="h-50 d-inline-block" style=" background-color: rgba(0,0,255,.1)">' +
                    '<div class="card" style="border-radius: 15px; margin-bottom: 50px;">' +
                    '<div class="card-body">' +
                    '<img src="https://st.depositphotos.com/1424188/1365/i/450/depositphotos_13653328-stock-photo-handsome-caucasian-man-blue-eyes.jpg" width="100%" height="100%" alt="..." style="border-radius: 15px;">' +
                    '<button type="button"  data-toggle="modal" data-target="#exampleModal3" style="border: 10px; border-color: rgb(128,137,158); border-radius: 15px; margin-top: 1.5rem;display: flex; align-items: center">' +
                    'Открыть карточку пациента ' + resultArray2 +
                    '</button>' +
                    '</div>' +
                    '</div>' +
                    '</div>' +
                    '</div>';
            } else {
                var datas = '';
            }

            socket.emit('carto2', datas);

            var datas1 =
                '<div class="modal-dialog" role="document">' +
                '<div class="modal-content">' +
                '<div class="modal-header">' +
                '<h5 style="margin-top: 30px;">ФИО: ' + resultArray2 + '</h5>' +
                '<button type="button" class="close" data-dismiss="modal" aria-label="Close">' +
                '<span aria-hidden="true">&times;</span>' +
                '</button>' +
                '</div>' +
                '<div class="modal-body">' +
                '<section class="get">' +
                '<article class="items" style="">' +
                '<div  style="color:Black;">ФИО: ' + resultArray2 + '</div>' +
                '<div  style="color:Black;">Дата рождения: ' + resultArrayDatebirthday2 + '</div>' +
                '<div  style="color:Black;">Дата госпитализации: ' + resultArrayDategospital2 + '</div>' +
                '<div  style="color:Black;">Номер датчика: ' + resultArrayDatchik2 + '</div>' +
                '<div  style="color:Black;">История болезни: ' + resultArrayHistory2 + '</div>' +
                '<div  style="color:Black;">Диагноз: ' + resultArrayDiagnoz2 + '</div>' +
                '<br>' +
                '</article>' +
                '<article class="good" style="align-self: left;">' +
                '<div class="alert alert-success" style="color:Black; margin-top: -16px;  margin-right: 3px;">Температура: ' + resultDat + '</div>' +
                '<div class="alert alert-success" style="color:Black; margin-top: -16px;  margin-right: 3px;">Пульс: ' + resultDatpulse + '</div>' +
                '</article>' +
                '</section>' +
                '<div>' +
                '<canvas id="myChart4"></canvas>' +
                '</div>' +
                '</div>' +
                '<div class="modal-footer">' +
                '<button type="button" class="btn btn-secondary" data-dismiss="modal">Закрыть</button>' +
                '</div>' +
                '</div>' +
                '</div>';
            socket.emit('cartomodal2', datas1);
        }, 500);

        console.log('connected to card');
        socket.on('disconnect', function () {
        });
    });
};


var init = function (app) {
    var server = require('http').Server(app);
    var io = require('socket.io')(server);


    // Using Redis
    let port = config.redis.port;
    let host = config.redis.host;
    let password = config.redis.password;
    let pubClient = redis(port, host, {auth_pass: password});
    let subClient = redis(port, host, {auth_pass: password, return_buffers: true,});
    io.adapter(adapter({pubClient, subClient}));

    // Allow sockets to access session data
    io.use((socket, next) => {
        require('../session')(socket.request, {}, next);
    });

    // Define all Events
    ioEvents(io);

    // The server object will be then used to list to a port number
    return server;
};

module.exports = init;