const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema({
  student: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Student is required']
  },
  cabin: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Cabin',
    required: [true, 'Cabin is required']
  },
  date: {
    type: String, // Store as YYYY-MM-DD for straightforward matching and timezone safety
    required: [true, 'Date is required']
  },
  timeSlot: {
    type: String, // e.g., "08:00-12:00" or "09:00-17:00"
    required: [true, 'Time slot is required']
  },
  durationHours: {
    type: Number,
    required: [true, 'Duration in hours is required'],
    min: [1, 'Minimum booking is 1 hour'],
    max: [8, 'Maximum booking duration is 8 hours per day']
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected', 'cancelled'],
    default: 'approved' // Automatically approve bookings by default, but allow admin manual changes
  }
}, { timestamps: true });

// Prevent index generation errors by exporting cleanly
module.exports = mongoose.model('Booking', bookingSchema);
