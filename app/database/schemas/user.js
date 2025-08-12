import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const SALT_WORK_FACTOR = 12;
const DEFAULT_USER_PICTURE = "https://st2.depositphotos.com/5266903/8486/v/450/depositphotos_84867024-stock-illustration-surgeon-icon.jpg";

const UserSchema = new mongoose.Schema({
  username: { 
    type: String, 
    required: true,
    unique: true,
    trim: true
  },
  password: { 
    type: String, 
    default: null 
  },
  picture: { 
    type: String, 
    default: DEFAULT_USER_PICTURE 
  },
  FIO: { 
    type: String, 
    default: null 
  },
  Rang: { 
    type: String, 
    default: null 
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

UserSchema.pre('save', async function(next) {
  const user = this;
  
  if (!user.picture) {
    user.picture = DEFAULT_USER_PICTURE;
  }
  
  if (!user.isModified('password')) return next();

  try {
    const salt = await bcrypt.genSalt(SALT_WORK_FACTOR);
    user.password = await bcrypt.hash(user.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

UserSchema.methods.validatePassword = async function(password) {
  try {
    return await bcrypt.compare(password, this.password);
  } catch (error) {
    throw error;
  }
};

const userModel = mongoose.model('user', UserSchema);

export default userModel;