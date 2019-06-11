'use strict';

var Mongoose 	= require('mongoose');
var bcrypt      = require('bcrypt-nodejs');

const SALT_WORK_FACTOR = 12;
const DEFAULT_USER_PICTURE = "https://st2.depositphotos.com/5266903/8486/v/450/depositphotos_84867024-stock-illustration-surgeon-icon.jpg";


var UserSchema = new Mongoose.Schema({
    username: { type: String, required: true},
    password: { type: String, default: null },
    picture:  { type: String, default:  DEFAULT_USER_PICTURE},
    FIO: { type: String, default: null},
    Rang: { type: String, default: null},
});


UserSchema.pre('save', function(next) {
    var user = this;


    if(!user.picture){
        user.picture = DEFAULT_USER_PICTURE;
    }

    if (!user.isModified('password')) return next();

    
    bcrypt.genSalt(SALT_WORK_FACTOR, function(err, salt) {
        if (err) return next(err);

        
        bcrypt.hash(user.password, salt, null, function(err, hash) {
            if (err) return next(err);

           
            user.password = hash;
            next();
        });
    });
});


UserSchema.methods.validatePassword = function(password, callback) {
    bcrypt.compare(password, this.password, function(err, isMatch) {
        if (err) return callback(err);
        callback(null, isMatch);
    });
};

var userModel = Mongoose.model('user', UserSchema);

module.exports = userModel;