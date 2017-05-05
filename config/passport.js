'use strict'
let passport = require('passport')
    , BearerStrategy = require('passport-http-bearer').Strategy
    , db = require('../models');

// Serialize Sessions
passport.serializeUser((user, done)=>{
    done(null, user);
});

//Deserialize Sessions
passport.deserializeUser((user, done)=>{
    db.user.findOne({id: user.id}, (err, user)=>{
        if (err) {
            done(err, null);
        } else {
            done(null, user);
        }
    });
});

// For Authentication Purposes
passport.use(new BearerStrategy(
    function(token, done) {
        db.user.findOne({access_token: token}, (err, user)=>{
            if(err) return done(err, null);
            return done(null, user, {scope: 'read'});
        });
    }
));
