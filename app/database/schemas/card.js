'use strict';

var Mongoose 	= require('mongoose');

var CardSchema = new Mongoose.Schema({
    FIO: { type: String, required: true},
    Datebirthday: { type: Date, default: null },
    Dategospital: { type: Date, default: null },
    Datchik:  { type: Number, required: true},
    History:  { type: String, default: null},
    Diagnoz: {type: String, default: null}
});


CardSchema.pre('save', function(next) {
    var user = this;
    next();
});



var cardModel = Mongoose.model('card', CardSchema);

module.exports = cardModel;