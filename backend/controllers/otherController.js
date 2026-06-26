const ContactMessage = require('../models/ContactMessage');
const Review = require('../models/Review');
const Notification = require('../models/Notification');

// --- CONTACT MESSAGES ---

// @desc    Submit a contact message
// @route   POST /api/other/contact
// @access  Public
exports.submitContactMessage = async (req, res) => {
  const { name, email, phone, message } = req.body;
  try {
    const contact = await ContactMessage.create({ name, email, phone, message });
    res.status(201).json({ success: true, message: 'Message sent successfully! We will get back to you soon.', contact });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get all contact messages (Admin)
// @route   GET /api/other/contact
// @access  Private/Admin
exports.getContactMessages = async (req, res) => {
  try {
    const messages = await ContactMessage.find().sort({ createdAt: -1 });
    res.json({ success: true, messages });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update contact message status (Admin)
// @route   PUT /api/other/contact/:id
// @access  Private/Admin
exports.updateMessageStatus = async (req, res) => {
  const { status } = req.body;
  try {
    const message = await ContactMessage.findById(req.params.id);
    if (!message) {
      return res.status(404).json({ success: false, message: 'Message not found' });
    }

    message.status = status;
    await message.save();
    res.json({ success: true, message: 'Message status updated', message });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};


// --- REVIEWS ---

// @desc    Submit review
// @route   POST /api/other/reviews
// @access  Private
exports.submitReview = async (req, res) => {
  const { rating, comment } = req.body;
  const studentId = req.user.id;

  try {
    const review = await Review.create({
      student: studentId,
      rating,
      comment,
      isApproved: false // Admin must approve
    });

    res.status(201).json({
      success: true,
      message: 'Review submitted successfully! It will show up once approved by the admin.',
      review
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get approved reviews for homepage
// @route   GET /api/other/reviews/approved
// @access  Public
exports.getApprovedReviews = async (req, res) => {
  try {
    const reviews = await Review.find({ isApproved: true })
      .populate('student', 'name')
      .sort({ createdAt: -1 });
    res.json({ success: true, reviews });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get all reviews (Admin)
// @route   GET /api/other/reviews
// @access  Private/Admin
exports.getAllReviews = async (req, res) => {
  try {
    const reviews = await Review.find()
      .populate('student', 'name email phone')
      .sort({ createdAt: -1 });
    res.json({ success: true, reviews });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Moderate review (approve/delete)
// @route   PUT /api/other/reviews/:id
// @access  Private/Admin
exports.moderateReview = async (req, res) => {
  const { isApproved, action } = req.body; // Action can be 'approve' or 'delete'
  try {
    const review = await Review.findById(req.params.id);
    if (!review) {
      return res.status(404).json({ success: false, message: 'Review not found' });
    }

    if (action === 'delete') {
      await Review.deleteOne({ _id: req.params.id });
      return res.json({ success: true, message: 'Review deleted successfully' });
    }

    review.isApproved = isApproved;
    await review.save();
    res.json({ success: true, message: `Review ${isApproved ? 'approved' : 'unapproved'} successfully`, review });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};


// --- NOTIFICATIONS ---

// @desc    Get student's notifications
// @route   GET /api/other/notifications
// @access  Private
exports.getNotifications = async (req, res) => {
  try {
    const notifications = await Notification.find({ user: req.user.id })
      .sort({ createdAt: -1 });
    res.json({ success: true, notifications });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Mark student notifications as read
// @route   PUT /api/other/notifications/read
// @access  Private
exports.markNotificationsRead = async (req, res) => {
  try {
    await Notification.updateMany(
      { user: req.user.id, isRead: false },
      { isRead: true }
    );
    res.json({ success: true, message: 'Notifications marked as read' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
