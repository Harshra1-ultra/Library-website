const express = require('express');
const router = express.Router();
const {
  getSettings,
  updateSettings,
  getDashboardStats,
  addAnnouncement,
  deleteAnnouncement,
  addToGallery,
  deleteFromGallery
} = require('../controllers/settingController');
const { protect, admin } = require('../middleware/auth');

router.route('/')
  .get(getSettings)
  .put(protect, admin, updateSettings);

router.get('/dashboard-stats', protect, admin, getDashboardStats);

router.route('/announcements')
  .post(protect, admin, addAnnouncement);

router.route('/announcements/:index')
  .delete(protect, admin, deleteAnnouncement);

router.route('/gallery')
  .post(protect, admin, addToGallery);

router.route('/gallery/:index')
  .delete(protect, admin, deleteFromGallery);

module.exports = router;
