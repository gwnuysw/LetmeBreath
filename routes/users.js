let express = require('express');
let router = express.Router();
let users = require('../schemas/user');
let breathIn = require('../schemas/breathIn');
let { isLoggedIn, isNotLoggedIn } = require('./logincheck');
let passport = require('passport');
let bcrypt = require('bcrypt');
const LocalStrategy = require('passport-local').Strategy;

/* GET users listing. */
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
router.get('/joinpage', isNotLoggedIn, function(req, res, next) {
  res.render('joinpage');
});
router.get('/loginpage',isNotLoggedIn, function(req, res, next){
  res.render('loginpage');
});
router.get('/logout',isLoggedIn,(req,res)=>{
  req.logout();
  req.session.destroy();
  res.redirect('/');
});
router.get('/update',isLoggedIn,(req,res)=>{
  res.render('update');
});
router.post('/update', isLoggedIn, async (req,res)=>{
  console.log(req.user);
  await users.updateOne({id:req.user[0].id}, {$set:{age:req.body.age, weight:req.body.weight}});
  res.redirect('/');
});
router.post('/join', async function(req,res,next){
  let user = {
    id: req.body.id,
    pw: req.body.pw,
    pwconfirm: req.body.pwconfirm,
    age: req.body.age,
    weight: req.body.weight
  };
  let getuser = await users.findOne({id:user.id});
  console.log(getuser);
  if(getuser == undefined){
    if(user.pw != user.pwconfirm){
      res.send('비밀번호를 확인해 주세요');
    }
    else{
      user.pw = await bcrypt.hash(user.pw, 12);
      let newUser = new users(user);
      await newUser.save();
      res.redirect('/users/loginpage');
    }
  }
  else{
    res.send('id가 이미 존재합니다.');
  }
});
router.post('/login', isNotLoggedIn, async function(req, res, next){
  passport.authenticate('local', (authError, user, info)=>{
    if(authError){
      console.error(authError);
      return next(authError);
    }
    if(!user){
      return res.send('loginError');
    }
    return req.login(user, (loginError)=>{
      if(loginError){
        console.error();
        return next(loginError);
      }
      return res.redirect('/');
    });
  })(req, res, next);
});

module.exports = router;
