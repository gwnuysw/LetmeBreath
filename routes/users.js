let express = require('express');
let router = express.Router();
let users = require('../schemas/user');
let { isLoggedIn, isNotLoggedIn } = require('./logincheck');
let passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
/* GET users listing. */
router.get('/joinpage', isNotLoggedIn, function(req, res, next) {
  console.log(req.isAuthenticated());
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
  let getuser = await users.find({id:req.body.id});
  getuser.age = req.body.age;
  getuser.weight = req.body.weight;
  await getuser.save();
  res.redirect('/');
});
router.post('/join', async function(req,res,next){
  let user = {
    id: req.body.id,
    pw: req.body.pw,
    age: req.body.age,
    weight: req.body.weight
  };
  let getuser = await users.find({id:user.id});
  console.log(getuser);
  if(getuser.length() < 1){
    let newUser = new users(user);
    await newUser.save();
    res.send('로그인 되었습니다.');
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
