const mongoose = require('mongoose');

const librarySettingSchema = new mongoose.Schema({
  libraryName: {
    type: String,
    default: 'The Study Point Library'
  },
  tagline: {
    type: String,
    default: 'Success is Dependent on Effort'
  },
  address: {
    type: String,
    default: 'Janki-Lalan Commercial Building, Khatangi Kothi, Gaya-Fatehpur State Highway, Bihar'
  },
  contactNumber: {
    type: String,
    default: '8210792095'
  },
  whatsAppNumber: {
    type: String,
    default: '8210792095'
  },
  email: {
    type: String,
    default: 'contact@thestudypointlibrary.com'
  },
  timings: {
    type: String,
    default: '06:00 AM - 10:00 PM'
  },
  logoUrl: {
    type: String,
    default: ''
  },
  totalSeats: {
    type: Number,
    default: 80
  },
  occupiedSeats: {
    type: Number,
    default: 62
  },
  socialLinks: {
    facebook: { type: String, default: '' },
    instagram: { type: String, default: '' },
    youtube: { type: String, default: '' }
  },
  announcements: {
    type: [String],
    default: [
      'Welcome to The Study Point Library! Get 10% off on yearly membership.',
      'Study cabin bookings must be made at least 1 hour in advance.'
    ]
  },
  gallery: {
    type: [String],
    default: [
      'https://images.unsplash.com/photo-1521587760476-6c12a4b040da?auto=format&fit=crop&q=80&w=600',
      'https://images.unsplash.com/photo-1497633762265-9d179a990aa6?auto=format&fit=crop&q=80&w=600',
      'https://images.unsplash.com/photo-1568667256549-094345857637?auto=format&fit=crop&q=80&w=600',
      'https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?auto=format&fit=crop&q=80&w=600'
    ]
  }
}, { timestamps: true });

module.exports = mongoose.model('LibrarySetting', librarySettingSchema);
