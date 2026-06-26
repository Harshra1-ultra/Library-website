const express = require('express');
const router = express.Router();
const {
  getAllMemberships,
  createMembership,
  updateMembership,
  deleteMembership
} = require('../controllers/membershipController');
const { protect, admin } = require('../middleware/auth');

router.route('/')
  .get(getAllMemberships)
  .post(protect, admin, createMembership);

router.route('/:id')
  .put(protect, admin, updateMembership)
  .delete(protect, admin, deleteMembership);

module.exports = router;
