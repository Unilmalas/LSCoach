// API for admin of accounts, customers and questions
//var Type = require('../../models/type');	// typing event (collects user ans answers for a given date)
var User   = require('../../models/user');	// user
//var Acct = require('../../models/acct');	// account
//var Cust = require('../../models/cust');	// customer in account
//var Quest = require('../../models/quest');	// question and possible answers with points
//var Answer = require('../../models/answer');// answers to questions
var router = require('express').Router();

router.get('/', function (req, res, next) { // get endpoint: note namespace (.use in server.js)
  Quest.find({ 	module: req.query.module,
				type:	't' }) // access passed parameters via req.query.xxxxx; only typing questions for not (type = t)
  .exec( function (err, quests) {
    if (err) { return next(err); }
    res.json(quests); // render out the quests as JSON
  });
});

router.get('/acct_name', function (req, res, next) { // get endpoint to find account by name: note namespace (.use in server.js)
  var srchPattern = req.query.acct==null ? ".*" : ("/.*" + req.query.acct + "/");
  Acct.find({ 	module: req.query.module,
				name: { $regex: srchPattern, $options: 'i' } }) // find returns cursor to the result, pattern-match to regex
  .exec( function (err, accts) {
    if (err) { return next(err); }
	if(accts.length) {
		res.json(accts);
	}
  });
});

router.get('/acct_mixed', function (req, res, next) { // get endpoint to find account by zip and name: note namespace (.use in server.js)
  var srchName = req.query.name; // access passed parameters via req.query.xxxxx
  if(req.query.zip.match(/^\d+$/)) {
	var srchZip = parseInt(req.query.zip);
  } else {
	var srchZip = 0;
  }
  //console.log('mixed srch: ' + srchName + ' zip ' + srchZip + ' mod ' + req.query.module);
  Acct.find( { 	module: req.query.module,
				$or: [
					{ name: { $regex: srchName, $options: 'i' } },
					{ zip:  srchZip } 
			]}) // find returns cursor to the result, pattern-match to regex
  .exec( function (err, accts) {
    if (err) { return next(err); }
	if(accts.length) {
		//console.log(accts);
		res.json(accts);
	}
  });
});

router.get('/acct_zip', function (req, res, next) { // get endpoint to find account by zip: note namespace (.use in server.js)
  if(req.query.acct == "") {
	  Acct.find({ 	module: req.query.module,
					zip: { $gt: 0, $lt: 9999 }}) // find returns cursor to the result
	  .exec( function (err, accts) {
		if (err) { return next(err); }
		//console.log('acct zip find 1: ' + accts + ' err ' + err);
		if(accts.length) {
			res.json(accts);
		}
	  });
  } else {
	  if(req.query.acct.match(/^\d+$/)) {
		var srchZip = parseInt(req.query.acct);
	  } else {
		var srchZip = 0;
	  }
	  Acct.find({ 	module: req.query.module,
					zip: srchZip}) // find returns cursor to the result
	  .exec( function (err, accts) {
		if (err) { return next(err); }
		//console.log('acct zip find 2: ' + accts + ' err ' + err);
		if(accts.length) {
			res.json(accts);
		}
	  });	  
  }
});

router.get('/acct_id', function (req, res, next) { // get endpoint to find account by id: note namespace (.use in server.js)
  //var id = mongoose.Types.ObjectId(req.query._id);
  Acct.findOne({ 	module: req.query.module,
					_id: req.query._id }) // find returns cursor to the result
  .exec( function (err, acct) {
    if (err) { return next(err); }
	//console.log('api acct_id ' + req.query._id + ' err ' + err + ' acct ' + acct);
	res.json(acct);
  });
});

router.get('/cust_name', function (req, res, next) { // get endpoint to find customer: note namespace (.use in server.js)
  var srchStr = "" + req.query.lastname;  // $regex has to be a string
  //console.log('api ' + srchStr);
  var srchPattern = "";
  if(srchStr=="") srchPattern=".*";
  else srchPattern = srchStr;
  //console.log('get cust: ' + srchPattern + ' type ' + typeof srchPattern[0]);
  Cust.find( { 	module: req.query.module,
				$or: [
						{ firstname: 	{ $regex: srchPattern, $options: 'i' }}, // for $in only js-style /patterns/ work!
						{ lastname: 	{ $regex: srchPattern, $options: 'i' }}
					]}) // find returns cursor to the result, pattern-match to regex
  .exec( function (err, custs) {
    if (err) { return next(err); }
	//console.log('get cust find: ' + srchPattern + ' custs ' + custs + custs.length);
	if(custs.length) {
		res.json(custs);
	}
  });
});

router.get('/cust_acct', function (req, res, next) { // get endpoint to find customer in acct: note namespace (.use in server.js)
  var srchStr = "" + req.query.lastname; // fetch lastname from parameters, $regex has to be a string
  var acctid = req.query._acct; // acct id from parameters
  var srchPattern = "";
  if(srchStr=="") srchPattern=".*";
  else srchPattern = ".*" + srchStr + ".*";
  //console.log('get cust: ' + srchPattern + ' type ' + typeof srchPattern[0] + ' acctid: ' + acctid);
  Cust.find( {
			$and: [
				{ $or: [
						{ firstname: 	{ $regex: srchPattern, $options: 'i' }}, // for $in only js-style /patterns/ work!
						{ lastname: 	{ $regex: srchPattern, $options: 'i' }}
					]},
				{ 	module: req.query.module,
					_acct: acctid }]}) // fmatch to account id of the current account chosen (show only those customers in that account)
  .exec( function (err, custs) {
    if (err) { return next(err); }
	//console.log('get cust find: ' + srchPattern + ' custs ' + custs + custs.length);
	if(custs.length) {
		res.json(custs);
	}
  });
});

router.post('/acct', function (req, res, next) { // post endpoint: note namespace (.use in server.js)
	var acct = new Acct({ 	module: req.body.module,
							name:	req.body.name,
							zip:	req.body.zip});
	acct.save( function (err, acct) {
		if (err) { return next(err); }
		//console.log(post.img);
		res.status(201).json(acct);
	});
	/*var type = new Type({	body:     	req.body.body,
							link:		req.body.link,
							img:		req.body.img});
	//post.username = req.auth.username;
	User.findOne({ username: req.auth.username }) // find user
	.exec(function (err, user) {
		if (err) { return next(err); }
		type._user = user._id; // set the post user_id
		type.save(function (err, post) {
			if (err) { return next(err); }
			//console.log(post.img);
			res.status(201).json(type);
		});
	});*/
});

router.post('/acct_upd', function (req, res, next) { // update post endpoint: note namespace (.use in server.js) - upsert account
	//console.log('api post acct upd ' + req.body.name);
	Acct.findOneAndUpdate({	module: req.body.module,
							name:	req.body.name },
						  {	module: req.body.module,
							name:	req.body.name,
							zip:	req.body.zip },
							{ upsert:true }, function(err, doc) {
		if (err) return res.send(500, { error: err });
		return res.send("succesfully updated");
	});
	/*acct.save( function (err, acct) {
		if (err) { return next(err); }
		//console.log(post.img);
		res.status(201).json(acct);
	});*/
	/*var type = new Type({	body:     	req.body.body,
							link:		req.body.link,
							img:		req.body.img});
	//post.username = req.auth.username;
	User.findOne({ username: req.auth.username }) // find user
	.exec(function (err, user) {
		if (err) { return next(err); }
		type._user = user._id; // set the post user_id
		type.save(function (err, post) {
			if (err) { return next(err); }
			//console.log(post.img);
			res.status(201).json(type);
		});
	});*/
});

router.post('/cust', function (req, res, next) { // customer post endpoint: note namespace (.use in server.js)
	var cust = new Cust({ 	module: req.body.module,
							firstname:	req.body.firstname,
							lastname:	req.body.lastname});
	cust.save( function (err, cust) {
		if (err) { return next(err); }
		res.status(201).json(cust);
	});
});

router.post('/cust_upd', function (req, res, next) { // customer update post endpoint: note namespace (.use in server.js)
	console.log('api post cust upd ' + JSON.stringify(req.body));
	Cust.findOneAndUpdate({	module: 	req.body.module,
							firstname:	req.body.firstname,
							lastname:	req.body.lastname },
						  {	module: 	req.body.module,
							firstname:	req.body.firstname,
							lastname:	req.body.lastname,
							_acct:		req.body._acct },
							{ upsert: true }, function(err, doc) {
		if (err) return res.send(500, { error: err });
		return res.send("cust succesfully updated");
	});
});

router.post('/cust_del', function (req, res, next) { // customer delete post endpoint: note namespace (.use in server.js)
	console.log('api post cust del ' + JSON.stringify(req.body));
	Cust.find({	module: 	req.body.module,
					firstname:	req.body.firstname,
					lastname:	req.body.lastname })
		.remove ( function(err, doc) {
		if (err) return res.send(500, { error: err });
		return res.send("cust succesfully deleted");
	});
});

router.get('/quest', function (req, res, next) { // get endpoint to find question by question text: note namespace (.use in server.js)
  var srchModule = "" + req.query.module; // $regex has to be a string
  console.log('api ' + srchModule + ' typeof ' + typeof srchModule);
  srchModule = ( srchModule == "" || srchModule == "undefined" ) ? ".*" : srchModule;
  var srchType = "" + req.query.type;
  srchType = ( srchType == "" || srchType == "undefined" ) ? ".*" : srchType;
  var srchStr = "" + req.query.question;
  if(srchStr=="") srchStr=".*";
  console.log('api querying questions with ' + srchModule + ' : ' + srchType + ' : ' + srchStr);
  Quest.findOne({ 	module: 	{ $regex: srchModule, $options: 'i' },
					type: 		{ $regex: srchType, $options: 'i' },
					question: 	{ $regex: srchStr, $options: 'i' } }) // find returns cursor to the result
  .exec( function (err, quest) {
    if (err) { return next(err); }
	console.log('api question found ' + JSON.stringify(quest));
	res.json(quest);
  });
});

router.post('/quest_upd', function (req, res, next) { // question update post endpoint: note namespace (.use in server.js)
	Quest.findOneAndUpdate({ 	module: 	req.body.module,
								type: 		req.body.type,
								question:	req.body.question },
							{ 	module: 	req.body.module,
								type: 		req.body.type,
								question:	req.body.question,
								answers:	req.body.answers,
								points:		req.body.points },
							{ upsert: true }, function (err, quest) {
		if (err) { return next(err); }
		res.send('question succesfully updated');
	});
});

router.post('/quest_del', function (req, res, next) { // question delete post endpoint: note namespace (.use in server.js)
	Quest.find({ 	module: 	req.body.module,
					type: 		req.body.type,
					question:	req.body.question })
		.remove( function (err, quest) {
		if (err) { return next(err); }
		res.send('question succesfully deleted');
	});
});

router.post('/quest', function (req, res, next) { // question add post endpoint: note namespace (.use in server.js)
	var quest = new Quest({ 	module: 	req.body.module,
								type: 		req.body.type,
								question:	req.body.question,
								answers:	req.body.answers,
								points:		req.body.points});
	quest.save( function (err, quest) {
		if (err) { return next(err); }
		res.status(201).json(quest);
	});
});

router.post('/answers', function (req, res, next) { // answer post endpoint: note namespace (.use in server.js)
	//console.log('api post ' + req.body.module);
	Cust.findOne({ 	module: 	req.body.module,
					firstname:	req.body.firstname,
					lastname:	req.body.lastname})
	.exec( function (err, cust) {	// find customer by name to get index
		if (err) { return next(err); }
		// todo: check if cust is filled!
		//console.log('api post cust: ' + cust._id);
		var type = new Type({	module:		req.body.module,
								_cust:		cust._id}); // create type document with customer index, date autofilled
		type.save( function (err, type) {
			if (err) { return next(err); }
			var i=0;
			for (quest in req.body.quests) {	// loop through all questions
				//console.log('API answer post: ' + req.body.tanswers[i] + ' quest: ' + req.body.quests[0].question);
				var answer = new Answer({	module: 	req.body.quests[i].module, // module
											_type:		type._id,	// link answer to current typing event
											_quest:		req.body.quests[i]._id,	// add link to question of the answer
											answer:		req.body.quests[i].answers[req.body.tanswers[i]],	// store answer chosen (choice is stored in tanswers)
											answerpt:	req.body.quests[i].points[req.body.tanswers[i]]});	// add point value of the answer
				i++; // index counting questions, used to retrieve the answer chosen for i-th question
				answer.save( function (err, answer) {
					if (err) { return next(err); }
					// res ? - inside loop results in multiple res sends, this causes a "can't send headers" error
				});
			}
			res.status(201).json(type);
		});
	});
});

module.exports = router;