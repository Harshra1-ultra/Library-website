const mongoose = require('mongoose');

const cabinSchema = new mongoose.Schema({
  cabinNumber: {
    type: String,
    required: [true, 'Cabin number is required'],
    unique: true,
    trim: true
  },
  status: {
    type: String,
    enum: ['available', 'reserved', 'occupied'],
    default: 'available'
  },
  capacity: {
    type: Number,
    default: 1
  },
  isBlocked: {
    type: Boolean,
    default: false
  }
}, { timestamps: true });

module.exports = mongoose.model('Cabin', cabinSchema);
