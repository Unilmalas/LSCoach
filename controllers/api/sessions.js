var router = require('express').Router();
var bcrypt = require('bcrypt-nodejs');
var jwt    = require('jwt-simple');
var config = require('../../config');
var User   = require('../../models/user'); // require models after express

router.post('/', function (req, res, next) { // just / instead of /sessions - note namespacing in server.js
  var username = req.body.username;
  User.findOne({username: username}) // get the user from the DB
  .select('password')
  .select('username')
  .exec(function (err, user) {
    if (err) { return next(err); }
    if (!user) { return res.sendStatus(401); } // 401: unauthorized
    bcrypt.compare(req.body.password, user.password, function (err, valid) { // compare pw-hash
      if (err) { return next(err); }
      if (!valid) { return res.sendStatus(401); } // 401: unauthorized
      var token = jwt.encode({username: username}, config.secret);
      res.send(token); // return a new JWT for that user
    });
  });
});

module.exports = router;