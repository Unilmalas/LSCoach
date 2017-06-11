'use strict';

// API for persons and interactions
var Person = require('../../models/person');	// persons
var User   = require('../../models/user');	// user
var Interaction = require('../../models/interaction');	// interaction
var router = require('express').Router();

router.get('/', function (req, res, next) { // get endpoint: note namespace (.use in server.js)
  Person.find() // access passed parameters via req.query.xxxxx
  // will need to add username here: Person.find({ username: req.query.username  }) - actually username should be available everywhere in $scope.currentUser
  .exec( function (err, persons) {
    if (err) { return next(err); }
	//console.log(persons);
    res.json(persons); // render out the persons as JSON
  });
});

router.get('/pid', function (req, res, next) { // get endpoint: note namespace (.use in server.js) - get one person by id
  Person.find({ 	_id: req.query._id  }) // access passed parameters via req.query.xxxxx
  .exec( function (err, person) {
    if (err) { return next(err); }
	//console.log('API PID: ' + person + ' for ID ' + req.query._id);
    res.json(person); // render out the person as JSON
  });
});

router.get('/inter_id', function (req, res, next) { // get endpoint: note namespace (.use in server.js)
  Interaction.find({ 	_person: req.query._id  }) // access passed parameters via req.query.xxxxx
  .exec( function (err, interactions) {
    if (err) { return next(err); }
	//console.log(interactions);
    res.json(interactions); // render out the interactions as JSON
  });
});

router.post('/addpers', function (req, res, next) { // person post endpoint: note namespace (.use in server.js)
	var pers = new Person({
							firstname:		req.body.firstname,
							lastname:		req.body.lastname,
							relationship:	req.body.relationship,
							description:	req.body.description });
	pers.save( function (err, pers) {
		if (err) { return next(err); }
		res.status(201).json(pers);
	});
});

router.post('/updpers', function (req, res, next) { // person post endpoint: note namespace (.use in server.js)
	Person.findById( req.body._id, function (err, pers) {
		if (err) { return next(err); }
			pers.firstname = req.body.firstname;
			pers.lastname = req.body.lastname;
			pers.relationship = req.body.relationship;
			pers.description = req.body.description;
			pers.save();
		res.status(201).json(pers);
	});
});

router.post('/delpers', function (req, res, next) { // person post endpoint: note namespace (.use in server.js)
	Person.findById( req.body._id )
	.remove()
	.exec( function (err, pers) {
		if (err) { return next(err); }
		//console.log(pers);
		// need to deep-delete the interactions
		Interaction.find( { _person: req.body._id } )
			.remove()
			.exec( function (err, inter) {
			if (err) { return next(err); }
			res.status(201).json(pers);
		});
	});
});

router.post('/int', function (req, res, next) { // interaction post endpoint: note namespace (.use in server.js)
	var inter = new Interaction({
							_person:		req.body._person,
							interaction:	req.body.interaction,
							observation:	req.body.observation,
							motivatorpm:	req.body.motivatorpm
							});
	//console.log('post interaction: ' + JSON.stringify(inter));
	inter.save( function (err, inter) {
		if (err) { return next(err); }
		// update interaction counter on person
		//inter.find({ _person: req.body._person })
		//.exec( function (err, results) {
			//var count = results.length;
			Person.findOne({ _id: req.body._person }, function (err, person) {
				//person.intercount = count;
				person.intercount++;
				person.motivsum += req.body.motivatorpm;
				person.datelastint = Date.now();
				person.save();
			});
			res.status(201).json(inter);
		//});
	});
});

module.exports = router;