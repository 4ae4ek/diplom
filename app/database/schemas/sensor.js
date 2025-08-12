import mongoose from 'mongoose';

const SensorSchema = new mongoose.Schema({
  sensorId: { 
    type: Number,
    required: true,
    unique: true
  },
  name: { 
    type: String, 
    default: 'Датчик'
  },
  type: { 
    type: String, 
    enum: ['temperature', 'pulse', 'combined'],
    default: 'combined'
  },
  description: { 
    type: String, 
    default: ''
  },
  isActive: {
    type: Boolean,
    default: true
  },
  location: {
    type: String,
    default: 'Не указано'
  },
  lastReading: {
    temperature: { 
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

// Обновляем updatedAt при каждом изменении
SensorSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

const sensorModel = mongoose.model('sensor', SensorSchema);

export default sensorModel;
