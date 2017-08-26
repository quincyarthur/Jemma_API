require('dotenv').config();
const JwtStrategy = require('passport-jwt').Strategy;
const ExtractJwt = require('passport-jwt').ExtractJwt;
const models = require('../models/db');
const passport = require('passport');

// Setup work and export for the JWT passport strategy
module.exports = function() {
  const opts = {
    jwtFromRequest: ExtractJwt.fromAuthHeaderWithScheme('jwt'), //defines where to look for token
    secretOrKey: process.env.JWT_SECRET
  };

  passport.use(new JwtStrategy(opts, function(jwt_payload, done) {
    const jwt_user_id = jwt_payload.data;
    models.user.findById(jwt_user_id)
    .then((user)=>{
        if (!user){
          return done(null,false)
        }else{
          return done(null,user)
        }
    })
    .catch((error)=>{
        return done(err, false);
    });
  }));

  return {
    initialize: () => {
      return passport.initialize();
    },
    authenticate: function() {
      return passport.authenticate("jwt", {session:false});
    }
  };

};