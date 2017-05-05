const express = require('express');
const router = express.Router();
const configPassport = require('../config/passport')
const passport = require('passport');
const models = require('../models');
const utils = require('../util_connect4')

//Inscription d'un utilisateur
router.post('/signup', (req, res) => {
  models.user.create(req.body, (err, user) => {
    if (err) {
      res.status(500).json({
        code: 500,
        response: "error",
        user: null
      })
    } else {
      res.status(200).json({
        code: 200,
        repsonse: "user created",
        user: user
      })
    }
  });
});

//connexion d'un utilisateur
router.post('/signin', (req, res) => {
  //trouve l'utilisateur souhaitant se connecter
  models.user.findOne({
    email: req.body.email,
    deleted_at: null
  }, (err, user) => {
    if (err || user == null) {
      res.status(500).json({
        code: 500,
        response: "error",
        user: null
      })
    } else {
      //compare les password
      user.comparePassword(req.body.password, (err, result) => {
        if (err || !result) {
          res.status(500).json({
            code: 500,
            response: "error on check password",
            user: null
          })
        } else {
          //genere l'access_token de connexion
          user.connect(models, user, (err, userConnected) => {
            if (err) {
              res.status(500).json({
                code: 500,
                response: "error on connection",
                user: null
              })
            } else {
              res.status(200).json({
                code: 200,
                response: "user has been connected",
                user: userConnected
              });
            }
          });
        }
      })
    }
  });
})

//retourne les infos de l'utilisateur souhaiter si connecté
router.get('/:id', passport.authenticate("bearer", {
  session: false
}), (req, res) => {
  models.user.findOne({
    id: req.params.id
  }, (err, user) => {
    if (err || user == null) {
      res.status(500).json({
        code: 500,
        response: "error",
        user: null
      })
    } else {
      res.status(200).json({
        code: 200,
        response: "details of user loaded",
        user: user
      })
    }
  })
});

//récupère les historiques de jeu de l'utilisateur connecté
router.post('/scores', passport.authenticate("bearer", {
  session: false
}), (req, res) => {
  models.game.find({
      $or: [{
        playerOne: req.user._id
      }, {
        playerTwo: req.user._id
      }]
    }, "playerOne playerTwo moves winner created_at")
    .populate('playerOne', 'nickname')
    .populate('playerTwo', 'nickname')
    .populate('winner', 'nickname')
    .exec((err, games) => {
      if (err) {
        console.log(err)
        res.status(500).json({
          code: 500,
          response: "error occured"
        })
      } else {
        res.status(200).json({
          code: 200,
          response: "all is good",
          games: games.map(function (game) {
            return game.toJSON();
          })
        })
      }
    })
})

//récupère les parties en attentes de second joueur
router.post('/waitingGame', (req, res)=>{
  let result = [];
  for(game in utils.games){
    if(typeof utils.games[game].p2 === "undefined"){
      result.push({id: game, playerOne: utils.games[game].p1.nickname})
    }
  }
  res.status(200).json({code: 200, games: result});
})

module.exports = router;