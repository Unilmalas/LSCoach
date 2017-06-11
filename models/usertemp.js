var db = require('../db');

var usertemp = db.Schema({
	username: { type: String, required: true },
	email: { type: String, required: true },
	verified: { type: Boolean, default: false, required: true },
	token: { type: String, required: true },
	valid_till: { type: Date, required: true, default: Date.now, expires: '3.0h' }, // expires after 3 hours
});

module.exports = db.model('UserTemp', usertemp);