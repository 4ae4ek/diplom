'use strict';


const nodemailer = require('nodemailer');
const xoauth2 = require('xoauth2');

var transporter = nodemailer.createTransport({
	service: 'gmail',
	auth : {
		xoauth2: xoauth2.createXOAuth2Generator({
			user : 'coderesponse200@gmail.com',
			clientId: '390771420202-l5jc4tkcdno1a2a05puk4pfcg9t16s4c.apps.googleusercontent.com',
			clientSecret: 'rcdkNKTXrO_q3GWViorhkOee',
			refreshToken: '1/XN3VDokXeU1MFhyRVVbsmJzWy5FgUbmFMKAOKkqRpes'
		})
	}
})

var mailOptions = {
	from: 'Tech-squad <coderesponse200@gmail.com>',
	to: 'coderesponse200@gmail.com',
	subject: 'nodemailer test',
	text: 'Hello bitch'
}


transporter.sendMail(mailOptions, function(err, res) {
  if(err){
  	console.log('Error');
  } else {
  	console.log('Email sent');
  }

})