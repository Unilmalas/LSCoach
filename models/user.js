var db = require('../db');

var user = db.Schema({
	username: 	{ type: String, required: true },
	password: 	{ type: String, required: true, select: false }, 	// prevent password from being selected (want to just send the hash)
	company:	{ type: String, required: false },					// company
	email:		{ type: String, required: false },					// preferred e-mail
	postinterq:	Boolean,											// check-questionnair after interaction-post (not yet implemented)
	objectives:	[String],											// placeholder: objectives I would like to reach as a leader
	badges:		[String],											// placeholder: badges I have earned
	intertime:	{ type: Number, min: 1, max: 24 },					// time period in months I would like to see my interactions for
	admin: Boolean 													// if this is set the user has admin privileges
});

module.exports = db.model('User', user);