const express = require('express');
const router = express.Router();
const {
  purchaseMembership,
  simulatePaymentSuccess,
  getMyPayments,
  getAllPayments
} = require('../controllers/paymentController');
const { protect, admin } = require('../middleware/auth');

router.post('/purchase', protect, purchaseMembership);
router.post('/:id/simulate-success', protect, simulatePaymentSuccess);
router.get('/my-payments', protect, getMyPayments);
router.get('/', protect, admin, getAllPayments);

module.exports = router;
