// API for user settings
var User   = require('../../models/user');	// user
var router = require('express').Router();

router.get('/', function (req, res, next) { // get endpoint: note namespace (.use in server.js)
  User.find({ 	username: req.query.username }) // access passed parameters via req.query.xxxxx; only typing questions for not (type = t)
  .exec( function (err, user) {
    if (err) { return next(err); }
	// blank password already here? NO: select: false!
	//console.log("settings api: fetch user " + user);
    res.json( user ); // render out the user as JSON
  });
});

router.post('/upduser', function (req, res, next) { // user update post endpoint: note namespace (.use in server.js)
	//console.log('api post user upd ' + JSON.stringify( req.body ));
	User.findOneAndUpdate({	username: 		req.body.username },
						  {	company: 		req.body.company,
							email:			req.body.email,
							postinterq:		req.body.postinterq,
							intertime:		req.body.intertime },
							{ upsert: false }, function(err, doc) {
		if (err) return res.send(500, { error: err });
		return res.status(200).send("settings api: user succesfully updated");
	});
});

module.exports = router;