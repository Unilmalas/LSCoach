var mongoose = require('mongoose');
mongoose.Promise = global.Promise; // mongoose mpromise-warning, see http://mongoosejs.com/docs/promises.html
mongoose.connect('mongodb://localhost/intelloquium', function () {
  console.log('mongodb connected');
});
module.exports = mongoose;