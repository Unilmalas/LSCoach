var db = require('../db');
var mongoose = require('mongoose')
  , Schema = mongoose.Schema;

var Interaction = db.model('Interaction', {
	username: 		{ type: String, 			required: true },	// user who created interaction
	_person:		{ type: Schema.ObjectId, 	ref: 'Person' }, 	// link to person
	date:			{ type: Date, 				default: Date.now }, // timestamp added
	interaction:	{ type: String,   			required: true }, 	// interaction type (meeting, phone call,...)
	observation:	{ type: String,   			required: false }, 	// what I saw
	motivator:		{ type: String,   			required: false }, 	// motivator type (autonomy, freedom, mastery,...)
	motivatordesc:	{ type: String,   			required: false }, 	// what I did to halp it along (or against)
	motivatorpm:	{ type: String,   			required: false } 	// helped the motivator or not (+1,-1 or 0 for neutral)
});

module.exports = Interaction;