let express = require('express');
let router = express.Router();
let http = require('http');
let station = require('../schemas/station');
let promiseLimit = require('promise-limit');
let {isLoggedIn, isNotLoggedIn} = require('./logincheck');

/* GET home page. */
router.get('/',isLoggedIn, function(req, res, next) {
  console.log(req.user[0].id);
  res.render('index', { title: 'Express', user: req.user[0]});
});

module.exports = router;
