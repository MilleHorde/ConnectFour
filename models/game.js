'use strict'

const mongoose = require('mongoose');
const schema = mongoose.Schema;
const bcrypt = require('bcrypt-nodejs');
const SALT_WORK_FACTOR = 11;

let GameSchema = new schema({
    id: {
        type: Number,
        unique: true
    },
    playerOne: {
        type: schema.Types.ObjectId,
        ref: "user",
        required: true
    },
    playerTwo: {
        type: schema.Types.ObjectId,
        ref: "user",
        required: true
    },
    moves: {
        type: Number
    },
    winner: {
        type: schema.Types.ObjectId,
        ref: "user",
        required: true
    },
    created_at: Date,
    updated_at: Date,
    deleted_at: Date
});

GameSchema.pre('save', function (next) {
    let Game = this;

    Game.updated_at = Date.now();
    if (!Game.created_at) {
        Game.created_at = Date.now();
    }

    if (Game.isNew) {
        GameModel.count({}, (err, count) => {
            Game.id = count;
            next();
        });
    }else{
        next();
    }

});

GameSchema.pre('update', function () {
    let Game = this;
    Game.update(Game._conditions, {
        $set: {
            updated_at: new Date()
        }
    });
});

GameSchema.pre('findOneAndUpdate', function () {
    let Game = this;
    Game.update(Game._conditions, {
        $set: {
            updated_at: new Date()
        }
    });
});

let GameModel = mongoose.model('Game', GameSchema);

module.exports = GameModel;