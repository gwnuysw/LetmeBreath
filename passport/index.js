const local = require('./localStrategy');

const users = require('../schemas/user');

module.exports = (passport) =>{
  passport.serializeUser((user, done)=>{
    done(null, user.id);
  });
  passport.deserializeUser(async (id, done)=>{
    let user = await users.find({id:id});
    done(null,user);
  });
  local(passport);
};
