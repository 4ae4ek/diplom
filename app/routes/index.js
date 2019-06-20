'use strict';

var express	 	= require('express');
var router 		= express.Router();
var passport 	= require('passport');
var mongo = require('mongodb').MongoClient;
var url = 'mongodb://test:testtest1@ds061246.mlab.com:61246/diplomchik';




var User = require('../models/user');
var Card = require('../models/card');
var Post = require('../models/post');
 var assert = require('assert');

router.get('/', function(req, res, next) {

	if(req.isAuthenticated()){
		res.redirect('/main');
	}
	else{
		res.render('login', {
			success: req.flash('success')[0],
			errors: req.flash('error'), 
			showRegisterForm: req.flash('showRegisterForm')[0]
		});
	}
});


router.post('/login', passport.authenticate('local', { 
	successRedirect: '/main', 
	failureRedirect: '/',
	failureFlash: true
}));


router.post('/register', function(req, res, next) {

	var credentials = {'username': req.body.username, 'password': req.body.password, 'FIO' : req.body.FIO, 'Rang' : req.body.Rang };

	if(credentials.username === '' || credentials.password === '' || credentials.FIO === ''){
		req.flash('error', 'Вы что-то не заполнили');
		req.flash('showRegisterForm', true);
		res.redirect('/');
	}else{

		User.findOne({'username': new RegExp('^' + req.body.username + '$', 'i')}, function(err, user){
			if(err) throw err;
			if(user){
				req.flash('error', 'Имя пользователя уже занято.');
				req.flash('showRegisterForm', true);
				res.redirect('/');
			}else{
				User.create(credentials, function(err, newUser){
					if(err) throw err;
					req.flash('success', 'Ваш аккаунт создан. Пожалуйста войдите.');
					res.redirect('/');
				});
			}
		});
	}
});


router.get('/temp',  function(req, res) {
   
 
   var dat = {'temp1': req.query.temp1, 'pulse': req.query.pulse , 'ids': req.query.ids };
          
              Post.findOne({ 'ids' : req.query.ids},  function(err,  havePost){
              if(err) throw err;
			  if(havePost){

                   	 Post.findOneAndUpdate({'ids' : req.query.ids}, {$set:{ temp1: req.query.temp1, pulse : req.query.pulse}},function(err, posto){
                      if(err) throw err;
                      console.log(req.query);
                      res.sendStatus(200);
			     	 });

			}else{
                 Post.create(dat, function(err, newPosts){
    		     if(err) throw err;
    		     res.sendStatus(200);
    	          	});
			     }
              });   
});

router.get('/card',  [User.isAuthenticated, function(req, res, next) {

    res.render('card.hbs');
}]);


router.post('/card',  [User.isAuthenticated, function(req, res) {
	if(!req.body) return res.sendStatus(400);
	console.log(req.body);
 
 var dani = {'FIO': req.body.FIO, 'Datebirthday': req.body.Datebirthday,
    'Dategospital': req.body.Dategospital, 'Datchik': req.body.Datchik, 
    'History': req.body.History, 'Diagnoz': req.body.Diagnoz  };
     
    Card.findOne({'FIO': new RegExp('^' + req.body.FIO + '$', 'i')},  function(err,  card){
  			if(err) throw err;
  			if(card){
  				res.send('Карточка с данным ФИО уже была создана');
  				res.redirect('/card');
  			}else{
  				Card.findOne({'Datchik': (req.body.Datchik)},  function(err,  dat){
                  if(err) throw err;
  			 if(dat){
  				res.send('Данный датчик уже занят');
  				res.redirect('/card');
  			}else{
  				Card.create(dani, function(err, newCard){
  					if(err) throw err;
  					res.redirect('/card');
  				});
  			} 
  				})
  			    }
  		});
}]);


router.post('/mail',  [User.isAuthenticated, function(req, res) {
    	if(!req.body) return res.sendStatus(400);
    	console.log(req.body);
     
      const nodemailer = require('nodemailer'); 


        const transporter = nodemailer.createTransport({
        host: 'smtp.ethereal.email',
        port: 587,
        auth: {
            user: 'janelle.schoen76@ethereal.email',
            pass: 'n6efe7PaHucwUQ6aMu'
        }
          });

       var message = {
             
            from: req.body.mail,

            to: 'Служба поддержки <popka.dj@gmail.com>',

            subject: req.body.theme,

            text: req.body.FIOmail,
             
            html: req.body.gltext,
        };

      var info =  transporter.sendMail(message);

        console.log('Message sent successfully!');
        console.log(nodemailer.getTestMessageUrl(info));

        transporter.close();

        res.redirect('/card');

}]);

router.get('/main',  [User.isAuthenticated, function(req, res, next) {
    res.render('main');
}]);

router.get('/graf',  [User.isAuthenticated, function(req, res, next) {
    res.render('graf.hbs');
}]);


router.get('/worker',  [User.isAuthenticated, function(req, res, next) {
    var resultUsersddf = [];
    var resultUsers4aek = [];
	   mongo.connect(url, function(err, db) {
		assert.equal(null, err);
    var cursorUsersddf = db.collection('users').find({ username : "ddf" });
    var cursorUsers4aek = db.collection('users').find({ username : "4aek" });
    assert.equal(null, err);

     cursorUsers4aek.forEach(function(doc, err) {
     assert.equal(null, err);
       resultUsers4aek.push(doc);
    });

  	cursorUsersddf.forEach(function(doc, err) {
       assert.equal(null, err);
         resultUsersddf.push(doc);
      }, function() {
        db.close();
        res.render('worker.hbs', { us : resultUsersddf, us2 : resultUsers4aek });
      });
    });
}]);


router.get('/logout', function(req, res, next) {
	
	req.logout();

	
	req.session = null;

	
	res.redirect('/');
});

module.exports = router;