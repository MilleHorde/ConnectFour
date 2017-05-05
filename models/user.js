'use strict'

const mongoose = require('mongoose');
const schema = mongoose.Schema;
const bcrypt = require('bcrypt-nodejs');
const SALT_WORK_FACTOR = 11;

let UserSchema = new schema({
    id: { type: Number, unique: true },
    nickname: { type: String, unique: true, required: true },
    email: {
        type: String,
        unique: true,
        trim: true,
        lowercase: true,
        required: true,
        match: [/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/, 'Please fill a valid email address']
    },
    password: { type: String, required: true },
    access_token: String,
    created_at: Date,
    updated_at: Date,
    deleted_at: Date
});

UserSchema.pre('save', function (next) {
    let user = this;

    user.updated_at = Date.now();
    if (!user.created_at) {
        user.created_at = Date.now();
    }

    // only hash the password if it has been modified (or is new)
    if (!user.isModified('password')) {
        return next();
    }
    // generate a salt
    bcrypt.genSalt(SALT_WORK_FACTOR, (err, salt) => {
        if (err) {
            return next(err);
        } else {
            // hash the password using our new salt
            bcrypt.hash(user.password, salt, null, (err, hash) => {
                if (err) {
                    return next(err);
                } else {
                    // override the cleartext password with the hashed one
                    user.password = hash;
                    if (user.isNew) {
                        UserModel.count({}, (err, count) => {
                            user.id = count;
                            next();
                        });
                    } else {
                        next();
                    }
                }
            });
        }
    });

});

UserSchema.pre('update', function () {
    let user = this;
    if (user._update.password != null) {
        bcrypt.genSalt(SALT_WORK_FACTOR, (err, salt) => {
            if (err) throw err;
            // hash the password using our new salt
            bcrypt.hash(user._update.password, salt, null, (err, hash) => {
                if (err) throw err;
                user._update.password = hash;
                // override the cleartext password with the hashed one
                user.update(user._conditions, { $set: { updated_at: new Date() } });
            });
        });
    } else {
        user.update(user._conditions, { $set: { updated_at: new Date() } });
    }
});

UserSchema.pre('findOneAndUpdate', function () {
    let user = this;
    if (user._update.password != null) {
        bcrypt.genSalt(SALT_WORK_FACTOR, (err, salt) => {
            if (err) throw err;
            // hash the password using our new salt
            bcrypt.hash(user._update.password, salt, null, (err, hash) => {
                if (err) throw err;
                user._update.password = hash;
                // override the cleartext password with the hashed one
                user.update(user._conditions, { $set: { updated_at: new Date() } });
            });
        });
    } else {
        user.update(user._conditions, { $set: { updated_at: new Date() } });
    }
});

UserSchema.methods.comparePassword = function(candidatePassword, cb){
    bcrypt.compare(candidatePassword, this.password, (err, isMatch) => {
        if (err) {
            return cb(err, null);
        } else {
            return cb(null, isMatch);
        }
    });
};

UserSchema.methods.connect = (models, user, cb) => {
    bcrypt.genSalt(SALT_WORK_FACTOR, (err, salt) => {
        bcrypt.hash(user._id + Date.now(), salt, null, (err, hash) => {
            if (err) {
                return next(err);
            } else {
                models.user.findByIdAndUpdate(user._id, { access_token: hash }, (err, user) => {
                    user.access_token = hash;
                    return cb(null, user);
                });
            }
        });
    });
};

UserSchema.methods.disconnect = (models, user, cb) => {
    models.user.update({ id: user.id }, { access_token: "" });
    user.access_token = "";
    return cb(null, user)
}

let UserModel = mongoose.model('user', UserSchema);

module.exports = UserModel;