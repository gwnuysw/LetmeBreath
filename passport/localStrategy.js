const LocalStrategy = require('passport-local').Strategy;
const passport = require('passport');
const users = require('../schemas/user');

module.exports = (passport) => {
  passport.use(new LocalStrategy({
    usernameField: 'id',
    passwordField: 'pw'
  }, async (username, password, done)=>{
    try {
      const exUser = await users.findOne({id:username});

      if(exUser){
        if(exUser.pw === password){
          done(null, exUser);
        }
        else{
          done(null, false, { message:'비밀번호가 일치하지 않습니다.'});
        }
      }
      else {
        done(null, false, {message: '가입되지 않은 회원입니다.'});
      }
    }
    catch(error){
      console.error(error);
      done(error);
    }
  }));
};
