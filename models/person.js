var db = require('../db');
var mongoose = require('mongoose')
  , Schema = mongoose.Schema;

var Person = db.model('Person', {
	username: 		{ type: String, 			required: true },	// user who created interaction
	firstname:		{ type: String,   			required: true }, 	// person first name
	lastname:		{ type: String,   			required: true }, 	// person last name
	relationship:	{ type: String,				required: true }, 	// relationship I have with that person
	description: 	{ type: String, 			required: false }, 	// a few words, notes
	intercount:		{ type: Number, 			default: 0, required: false }, 	// number of interactions with person
	motivsum:		{ type: Number, 			default: 0, required: false }, 	// sum of motiv scores for person
	datelastint:	{ type: Date, 				default: Date('2014-12-08'), required: false }, 	// date of last interaction
	date:			{ type: Date, 				default: Date.now } // date added
});

module.exports = Person;