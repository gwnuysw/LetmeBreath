let express = require('express');
let router = express.Router();
let http = require('http');
var parser = require('xml2json');
let station = require('../schemas/station');
let promiseLimit = require('promise-limit');


/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express'});
});

module.exports = router;
