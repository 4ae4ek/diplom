'use strict';

var Mongoose = require('mongoose');

var PostSchema = new Mongoose.Schema({
    ids: {type: Number,},
    temp1: {type: String, default: null},
    pulse: {type: Number, default: null}
});

var postModel = Mongoose.model('post', PostSchema);

module.exports = postModel;