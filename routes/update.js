let express = require('express');
let router = express.Router();
let users = require('../schemas/user');
let breathIn = require('../schemas/breathIn');
let { isLoggedIn, isNotLoggedIn } = require('./logincheck');
let passport = require('passport');
let bcrypt = require('bcrypt');
const LocalStrategy = require('passport-local').Strategy;
router.get('/:id?/:dust?/:finedust', async function(req,res,next){
  let breathData = {
    userid : req.params.id,
    dust: req.params.dust,
    finedust: req.params.finedust
  };
  let breathing = new breathIn(breathData);
  let checkinsert;
  await breathing.save();
  await breathIn.find({userid:req.params.id},
    (err, docs)=>{
    checkinsert = docs;
  });
  res.send(checkinsert);
});
