var express = require('express');
var router  = express.Router();
var path = require("path");

//router.use(express.static(__dirname + '/../assets')); // __dirname is D:\Bernie\BSCDev\meantut\mean-sample\controllers
router.use(express.static(path.join(__dirname, '../assets')));
//router.use('/templates', express.static(__dirname + '/../templates')); // html templates
router.use('/templates', express.static(path.join(__dirname, '../templates')));

// get endpoint for general '/' requests: delivers the Angular app
router.get('/', function (req, res) {
  // render/ejs is now easier to use since
  // sendFile has security restrictions on relative pathing
  //res.render('app.html.ejs'); // for ejs
  res.sendFile('app.html', { root: path.join(__dirname, '../layouts') }); // Transfers the file at the given path
  //console.log(path.join(__dirname, '../', 'assets'));
});

module.exports = router;