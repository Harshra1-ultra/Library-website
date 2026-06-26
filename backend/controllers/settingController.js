const LibrarySetting = require('../models/LibrarySetting');
const User = require('../models/User');
const Booking = require('../models/Booking');
const Payment = require('../models/Payment');

// @desc    Get library settings (Initializes if none exists)
// @route   GET /api/settings
// @access  Public
exports.getSettings = async (req, res) => {
  try {
    let settings = await LibrarySetting.findOne();
    if (!settings) {
      settings = await LibrarySetting.create({});
    }
    res.json({ success: true, settings });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update library settings
// @route   PUT /api/settings
// @access  Private/Admin
exports.updateSettings = async (req, res) => {
  try {
    let settings = await LibrarySetting.findOne();
    if (!settings) {
      settings = await LibrarySetting.create({});
    }

    const {
      libraryName,
      tagline,
      address,
      contactNumber,
      whatsAppNumber,
      email,
      timings,
      totalSeats,
      occupiedSeats,
      socialLinks
    } = req.body;

    settings.libraryName = libraryName !== undefined ? libraryName : settings.libraryName;
    settings.tagline = tagline !== undefined ? tagline : settings.tagline;
    settings.address = address !== undefined ? address : settings.address;
    settings.contactNumber = contactNumber !== undefined ? contactNumber : settings.contactNumber;
    settings.whatsAppNumber = whatsAppNumber !== undefined ? whatsAppNumber : settings.whatsAppNumber;
    settings.email = email !== undefined ? email : settings.email;
    settings.timings = timings !== undefined ? timings : settings.timings;
    settings.totalSeats = totalSeats !== undefined ? totalSeats : settings.totalSeats;
    settings.occupiedSeats = occupiedSeats !== undefined ? occupiedSeats : settings.occupiedSeats;
    if (socialLinks) {
      settings.socialLinks = { ...settings.socialLinks, ...socialLinks };
    }

    await settings.save();
    res.json({ success: true, message: 'Settings updated successfully', settings });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get stats for Admin Dashboard
// @route   GET /api/settings/dashboard-stats
// @access  Private/Admin
exports.getDashboardStats = async (req, res) => {
  try {
    // Total Students (role: student)
    const totalStudents = await User.countDocuments({ role: 'student' });

    // Active Memberships
    const activeMemberships = await User.countDocuments({
      role: 'student',
      'membership.status': 'active'
    });

    // Available Seats
    let settings = await LibrarySetting.findOne();
    if (!settings) {
      settings = await LibrarySetting.create({});
    }
    const totalSeats = settings.totalSeats;
    const occupiedSeats = settings.occupiedSeats;
    const availableSeats = Math.max(0, totalSeats - occupiedSeats);

    // Bookings Today
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const date = String(today.getDate()).padStart(2, '0');
    const todayStr = `${year}-${month}-${date}`;

    const bookingsToday = await Booking.countDocuments({
      date: todayStr,
      status: { $in: ['approved', 'pending'] }
    });

    // Monthly Revenue (sum payments of current month)
    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    const successPayments = await Payment.find({
      paymentStatus: 'success',
      createdAt: { $gte: startOfMonth }
    });
    const monthlyRevenue = successPayments.reduce((sum, p) => sum + p.amount, 0);

    // New Registrations (last 7 days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    const newRegistrations = await User.countDocuments({
      role: 'student',
      createdAt: { $gte: sevenDaysAgo }
    });

    res.json({
      success: true,
      stats: {
        totalStudents,
        activeMemberships,
        totalSeats,
        occupiedSeats,
        availableSeats,
        bookingsToday,
        monthlyRevenue,
        newRegistrations
      }
    });

  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Add announcement
// @route   POST /api/settings/announcements
// @access  Private/Admin
exports.addAnnouncement = async (req, res) => {
  const { announcement } = req.body;
  try {
    let settings = await LibrarySetting.findOne();
    if (!settings) settings = await LibrarySetting.create({});

    settings.announcements.push(announcement);
    await settings.save();
    res.json({ success: true, announcements: settings.announcements });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Delete announcement
// @route   DELETE /api/settings/announcements/:index
// @access  Private/Admin
exports.deleteAnnouncement = async (req, res) => {
  const index = parseInt(req.params.index);
  try {
    let settings = await LibrarySetting.findOne();
    if (!settings) return res.status(404).json({ success: false, message: 'Settings not found' });

    if (index >= 0 && index < settings.announcements.length) {
      settings.announcements.splice(index, 1);
      await settings.save();
    }
    res.json({ success: true, announcements: settings.announcements });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Add image to gallery list
// @route   POST /api/settings/gallery
// @access  Private/Admin
exports.addToGallery = async (req, res) => {
  const { imageUrl } = req.body;
  try {
    let settings = await LibrarySetting.findOne();
    if (!settings) settings = await LibrarySetting.create({});

    settings.gallery.push(imageUrl);
    await settings.save();
    res.json({ success: true, gallery: settings.gallery });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Delete image from gallery list
// @route   DELETE /api/settings/gallery/:index
// @access  Private/Admin
exports.deleteFromGallery = async (req, res) => {
  const index = parseInt(req.params.index);
  try {
    let settings = await LibrarySetting.findOne();
    if (!settings) return res.status(404).json({ success: false, message: 'Settings not found' });

    if (index >= 0 && index < settings.gallery.length) {
      settings.gallery.splice(index, 1);
      await settings.save();
    }
    res.json({ success: true, gallery: settings.gallery });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
