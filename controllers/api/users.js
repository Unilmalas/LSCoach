// API for users
// this controller has various actions: get an existing user, create a new temporary user, confirm a temporary user (and make that user permanent)
'use strict';
var router = require('express').Router();
var bcrypt = require('bcrypt-nodejs');
var jwt    = require('jwt-simple');
var User   = require('../../models/user'); // final user db
var UserTemp = require('../../models/usertemp'); // temp user till confirmation of e-mail
var config = require('../../config');
var nodemailer = require('nodemailer');
var smtpTransport = require('nodemailer-smtp-transport');
var crypto = require ('crypto') // registration token . no separate npm install required

router.get('/', function (req, res, next) { // get an existing user; /users instead of / - note namespacing in server.js
  if (!req.headers['x-auth']) {
	return res.sendStatus(401); // 401: unauthorized
  }
  var auth = jwt.decode(req.headers['x-auth'], config.secret); // pass a JWT-token and decode
  User.findOne({ username: auth.username }, function (err, user) { // get user from db
	if (err) { return next(err); }
	res.json(user);
  });
});

router.post('/prereg', function (req, res, next) { // create a new temporary user and send confirmation e-mail
	// first check if user is already registered (either final or pre)
	User.findOne({ username: req.body.username }, function (err, user) { // get user from final user db
		if (err) { return next(err); }
		if (user) {
			// we have found a user -> tell user so and go to login (todo)
			res.sendStatus(501);  // 501: Not Implemented
		} else {
			// no user found in final collection -> check in temp
			//console.log('uname prereq: ' + req.body.username);
			UserTemp.findOne({ 	username: req.body.username,
								verified: false }, function (err, user) { // get user from temp user db
				if (err) { return next(err); }
				if (user) {
					// we have found a user -> todo: change to confreq
					//console.log('user found');
					res.sendStatus(501);  // 501: Not Implemented
				} else {
					// user not in temp storage: proceed with prereg
					// user not yet registered: create a registration token, see if that token not yet in the db
					var ctoken = '';
					crypto.randomBytes(48, function(err, buffer) { // this is url-save
						ctoken = buffer.toString('hex');
					});
					// see if token in db
					//console.log('token prereq: ' + ctoken);
					UserTemp.findOne({ token: ctoken }, function (err, user) {
						if (err) { return next(err); }
						if (user) {
							// we have found a token, try recreate (not entirely safe, might fail another time... todo...)
							crypto.randomBytes(48, function(err, buffer) { // this is url-save
								ctoken = buffer.toString('hex');
							});
						} else {
							// token not found: create usertemp entry and send mail to user
							var usertemp = new UserTemp({ 	username: 	req.body.username,
															email: 		req.body.uemail,
															verified:	false,
															token:		ctoken });
							//console.log('email prereq: ' + req.body.uemail);
							usertemp.save(function (err) { // save user to temp db
								if (err) { return next(err); }
								// send registration e-mail
								// gmail setup: http://masashi-k.blogspot.co.at/2013/06/sending-mail-with-gmail-using-xoauth2.html
								// alos in: https://medium.com/@pandeysoni/nodemailer-service-in-node-js-using-smtp-and-xoauth2-7c638a39a37e
								var generator = require('xoauth2').createXOAuth2Generator({
									user: 'bschoss00@gmail.com',
									clientId: '1067274556021-8f76h86jtfj7u93m3v6ell55ml23c2cp.apps.googleusercontent.com',
									clientSecret: 'S8PMvNkSw6BWbAKEsp6vLkND',
									refreshToken: '1/9qAJEpS6jjAo1vhURL9Ze5fp3fWqa-bLxuvcMNy5p9k'
								});
							 
								// listen for token updates 
								// you probably want to store these to a db 
								generator.on('etoken', function(etoken){
									console.log('New etoken for %s: %s', etoken.user, etoken.accessToken);
									// will store this token in db and use it to complete registration (todo)
								});

								// e-mail service login 
								var transporter = nodemailer.createTransport(({
									service: 'gmail',
									/*auth: {
										xoauth2: generator
									}*/
									auth: {
										type: 'OAuth2',
										user: 'bschoss00@gmail.com',
										clientId: '1067274556021-8f76h86jtfj7u93m3v6ell55ml23c2cp.apps.googleusercontent.com',
										clientSecret: 'S8PMvNkSw6BWbAKEsp6vLkND',
										refreshToken: '1/9qAJEpS6jjAo1vhURL9Ze5fp3fWqa-bLxuvcMNy5p9k'
										//accessToken: 'accesstoken',
										//expires: 12345
									}
								}));
								
								// conf link handling see https://stackoverflow.com/questions/27248379/how-can-i-handle-email-confirmation-urls-in-an-identity-2-1-spa-angular-js-appli
								// construct confirmation link
								var conflinkplain = 'http://localhost:3000/#/confmail/email/' + req.body.uemail + '/token/' + ctoken; // this link is now clickable in yahoo!!!
								var conflinkhtml = '<a href="//localhost:3000/#/confmail?email=' + req.body.uemail + '&token=' + ctoken + '">confirm registration</a>';
								
								// setup e-mail data with unicode symbols
								var mailOptions = {
									from: '"Intelloquium Admin" <bschoss00@gmail.com>', // sender address
									to: 'bschoss@yahoo.com', // list of receivers todo: change this to req.body.uemail
									subject: 'Please confirm your e-mail by following the link given', // Subject line
									//generateTextFromHTML: true,
									text: conflinkplain // plaintext body
									//html: conflinkhtml // html body; see https://stackoverflow.com/questions/17650174/node-mailer-cant-click-link-in-yahoo-mail
									//html: <b>Signup Confirmation ✔</b><br />
									//	+ '<a href=\"' + conflinkplain.toString() + '\">confirm registration</a>'
								};

								// send mail with defined transport object
								transporter.sendMail(mailOptions, function(error, response){
									if(error){
										return console.log(error);
									}
									console.log('Message sent: ' + response.response);
								});
								
								res.sendStatus(201);  // 201: user temp created
							});
						}
					});
				}
			});
		}
	});

});

router.get('/confmail', function (req, res, next) { // confirm registration (following the link from registration e-mail)
	var uemail = req.query.uemail; // readout e-mail parameter of GET-request from conf link
	var etoken = req.query.etoken; // readout token parameter of GET-request from conf link
	//console.log('confmail: ' + uemail + ' token ' + etoken);
	// check if e-mail and token in temp user collection
	UserTemp.findOne({ 	email: uemail,
						verified: false,
						token: etoken }, function (err, user) { // get user from temp user db
		if (err) { return next(err); }
		if (user) {
			// we have found a user
			//console.log('user found ' + user.username);
			res.json(user);
		} else {
			//console.log('no user found');
			// no user found: reg token expired
		}
	});
});

router.post('/confreg', function (req, res, next) { // confirm registration and create user
	var user = new User({ username: req.body.username });
	var salt = bcrypt.genSalt(10, function (err, reply) { // generate salt with 10 rounds (bcrypt-nodejs)
		if (err) { return next(err); }
		return reply;
	});
	//bcrypt.hash(req.body.password, 10, function (err, hash) { // hash user password
	bcrypt.hash(req.body.password, salt, null, function (err, hash) { // hash user password (bcrypt-nodejs)
		if (err) { return next(err); }
		user.password = hash;
		user.save(function (err) { // save user to db (just hashed password)
			if (err) { return next(err); }
			// set verified to true in usertemp
			UserTemp.update({ 	username: req.body.username,
								verified: false }, 
							{	verified: true }, function (err, tuser) { // get user from temp user db
			if (err) { return next(err); }
			res.sendStatus(201);  // 201: created
		});
	});
  });
});

router.post('/', function (req, res, next) { // create a new user - no longer used with e-mail conf registration
	var user = new User({ username: req.body.username });
	var salt = bcrypt.genSalt(10, function (err, reply) { // generate salt with 10 rounds (bcrypt-nodejs)
		if (err) { return next(err); }
		return reply;
	});
	//bcrypt.hash(req.body.password, 10, function (err, hash) { // hash user password
	bcrypt.hash(req.body.password, salt, null, function (err, hash) { // hash user password (bcrypt-nodejs)
		if (err) { return next(err); }
		user.password = hash;
		user.save(function (err) { // save user to db (just hashed password)
			if (err) { return next(err); }
			res.sendStatus(201);  // 201: created
		});
	});
});

module.exports = router;