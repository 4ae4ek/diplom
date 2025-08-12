import mongoose from 'mongoose';

const CardSchema = new mongoose.Schema({
  FIO: { 
    type: String, 
    required: true,
    trim: true
  },
  Datebirthday: { 
    type: Date, 
    default: null 
  },
  Dategospital: { 
    type: Date, 
    default: null 
  },
  Datchik: { 
    type: Number, 
    required: true,
    unique: true,
    min: 1
  },
  History: { 
    type: String, 
    default: null 
  },
  Diagnoz: { 
    type: String, 
    default: null 
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

CardSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

const cardModel = mongoose.model('card', CardSchema);

export default cardModel;