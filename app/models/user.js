'use strict';

var userModel = require('../database').models.user;

var create = function (data, callback) {
    var newUser = new userModel(data);
    newUser.save(callback);
};

var findOne = function (data, callback) {
    userModel.findOne(data, callback);
};

var findById = function (id, callback) {
    userModel.findById(id, callback);
};


var findOrCreate = function (data, callback) {
    findOne({'socialId': data.id}, function (err, user) {
        if (err) {
            return callback(err);
        }
        if (user) {
            return callback(err, user);
        } else {
            var userData = {
                username: data.displayName,
                socialId: data.id,
                picture: data.photos[0].value || null
            };


            if (data.provider == "facebook" && userData.picture) {
                userData.picture = "http://graph.facebook.com/" + data.id + "/picture?type=large";
            }

            create(userData, function (err, newUser) {
                callback(err, newUser);
            });
        }
    });
}


var isAuthenticated = function (req, res, next) {
    if (req.isAuthenticated()) {
        next();
    } else {
        res.redirect('/');
    }
}

module.exports = {
    create,
    findOne,
    findById,
    findOrCreate,
    isAuthenticated
};
