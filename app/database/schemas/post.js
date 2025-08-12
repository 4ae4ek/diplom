import mongoose from 'mongoose';

const PostSchema = new mongoose.Schema({
  ids: { 
    type: Number,
    required: true,
    unique: true
  },
  temp1: { 
    type: String, 
    default: null 
  },
  pulse: { 
    type: Number, 
    default: null,
    min: 0,
    max: 300
  },
  timestamp: {
    type: Date,
    default: Date.now
  }
});

const postModel = mongoose.model('post', PostSchema);

export default postModel;