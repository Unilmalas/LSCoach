var express    = require('express');
var bodyParser = require('body-parser');
//var logger     = require('morgan');

var app = express();
app.use(bodyParser.json({limit: '50mb'})); // to prevent request entity too large error
app.use(bodyParser.urlencoded({limit: '50mb', extended: true})); // to prevent request entity too large error
app.use(require('./auth')); // use the middleware
//app.use(logger('dev'))
//app.use(require('./controllers'));
app.use('/api/intell', require('./controllers/api/intell'));
app.use( require('./controllers/static'));
app.use('/api/sessions', require('./controllers/api/sessions'));
app.use('/api/users', require('./controllers/api/users'));
app.use('/api/settings', require('./controllers/api/settings')); // settings module

var server = app.listen(3000, function () {
  console.log('server listening on %d', server.address().port);
});