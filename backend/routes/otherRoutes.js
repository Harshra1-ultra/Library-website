const express = require('express');
const router = express.Router();
const {
  submitContactMessage,
  getContactMessages,
  updateMessageStatus,
  submitReview,
  getApprovedReviews,
  getAllReviews,
  moderateReview,
  getNotifications,
  markNotificationsRead
} = require('../controllers/otherController');
const { protect, admin } = require('../middleware/auth');

// Contact Message
router.route('/contact')
  .post(submitContactMessage)
  .get(protect, admin, getContactMessages);

router.put('/contact/:id', protect, admin, updateMessageStatus);

// Reviews
router.route('/reviews')
  .post(protect, submitReview)
  .get(protect, admin, getAllReviews);

router.get('/reviews/approved', getApprovedReviews);
router.put('/reviews/:id', protect, admin, moderateReview);

// Notifications
router.route('/notifications')
  .get(protect, getNotifications);

router.put('/notifications/read', protect, markNotificationsRead);

module.exports = router;
