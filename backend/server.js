const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

const app = express();

// Middlewares
app.use(cors());
app.use(express.json());

// Import Routes
const authRoutes = require('./routes/authRoutes');
const cabinRoutes = require('./routes/cabinRoutes');
const bookingRoutes = require('./routes/bookingRoutes');
const membershipRoutes = require('./routes/membershipRoutes');
const paymentRoutes = require('./routes/paymentRoutes');
const settingRoutes = require('./routes/settingRoutes');
const otherRoutes = require('./routes/otherRoutes');

// Mount Routes
app.use('/api/auth', authRoutes);
app.use('/api/cabins', cabinRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/memberships', membershipRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/settings', settingRoutes);
app.use('/api/other', otherRoutes);

// Base route
app.get('/', (req, res) => {
  res.json({ message: 'Welcome to The Study Point Library API' });
});

// Database Seed Function
const seedDatabase = async () => {
  try {
    const User = require('./models/User');
    const Cabin = require('./models/Cabin');
    const LibrarySetting = require('./models/LibrarySetting');

    // 1. Seed Library Settings
    let settings = await LibrarySetting.findOne();
    if (!settings) {
      await LibrarySetting.create({});
      console.log('Seeded: Library Settings initialized.');
    }

    // 2. Seed Default Cabins (C1 to C10)
    const cabinCount = await Cabin.countDocuments();
    if (cabinCount === 0) {
      const cabinsToSeed = [];
      for (let i = 1; i <= 10; i++) {
        cabinsToSeed.push({
          cabinNumber: `C${i}`,
          capacity: i <= 8 ? 1 : 2, // Cabins 1-8 are single study cabins, 9-10 are double
          status: 'available'
        });
      }
      await Cabin.insertMany(cabinsToSeed);
      console.log('Seeded: Cabins C1 to C10 initialized.');
    }

    // 3. Seed Default Admin User
    const adminExists = await User.findOne({ email: 'admin@thestudypointlibrary.com' });
    if (!adminExists) {
      await User.create({
        name: 'Mritunjay Kumar (Admin)',
        email: 'admin@thestudypointlibrary.com',
        password: 'adminpassword',
        phone: '8210792095',
        role: 'admin',
        isVerified: true
      });
      console.log('Seeded: Admin user created. Email: admin@thestudypointlibrary.com | Password: adminpassword');
    }

    // 4. Seed Default Student User
    const studentExists = await User.findOne({ email: 'student@thestudypointlibrary.com' });
    if (!studentExists) {
      await User.create({
        name: 'Aman Sharma',
        email: 'student@thestudypointlibrary.com',
        password: 'studentpassword',
        phone: '9876543210',
        role: 'student',
        isVerified: true
      });
      console.log('Seeded: Student user created. Email: student@thestudypointlibrary.com | Password: studentpassword');
    }
  } catch (error) {
    console.error('Error seeding database:', error.message);
  }
};

// Connect to MongoDB
const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/studypointlibrary';

mongoose.connect(MONGO_URI)
  .then(async () => {
    console.log('Connected to MongoDB successfully.');
    await seedDatabase();
    app.listen(PORT, () => {
      console.log(`Backend Server running on port ${PORT}`);
    });
  })
  .catch(err => {
    console.error('Database connection error:', err.message);
  });
