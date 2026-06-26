const Payment = require('../models/Payment');
const Membership = require('../models/Membership');
const User = require('../models/User');
const Notification = require('../models/Notification');

// @desc    Initiate membership purchase (Generates UPI QR or Razorpay simulated object)
// @route   POST /api/payments/purchase
// @access  Private
exports.purchaseMembership = async (req, res) => {
  const { planId, paymentMethod } = req.body;
  const studentId = req.user.id;

  try {
    const plan = await Membership.findById(planId);
    if (!plan || !plan.isActive) {
      return res.status(404).json({ success: false, message: 'Membership plan not found or inactive' });
    }

    const txId = `TXN_${Date.now()}_${Math.floor(1000 + Math.random() * 9000)}`;
    const invNo = `INV-${new Date().getFullYear()}${String(new Date().getMonth() + 1).padStart(2, '0')}-${Math.floor(10000 + Math.random() * 90000)}`;

    const payment = await Payment.create({
      student: studentId,
      membershipPlan: planId,
      amount: plan.price,
      paymentMethod,
      paymentStatus: 'pending',
      transactionId: txId,
      invoiceNumber: invNo
    });

    let qrCodeUrl = '';
    let razorpayOrderId = '';

    if (paymentMethod === 'QR_Code' || paymentMethod === 'UPI') {
      // Create standard UPI payment URL
      const upiUrl = `upi://pay?pa=8210792095@ybl&pn=The%20Study%20Point%20Library&am=${plan.price}&cu=INR&tn=Plan_${plan.name.replace(/\s+/g, '')}`;
      // Generate QR Code URL using QR code API
      qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(upiUrl)}`;
    } else if (paymentMethod === 'Razorpay') {
      razorpayOrderId = `order_${Date.now()}_${Math.floor(100 + Math.random() * 900)}`;
    }

    res.status(201).json({
      success: true,
      message: 'Payment checkout initiated. Use simulation endpoints to confirm success.',
      paymentId: payment._id,
      paymentMethod,
      amount: plan.price,
      transactionId: txId,
      invoiceNumber: invNo,
      qrCodeUrl,
      razorpayOrderId
    });

  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Simulate or complete payment success (Activates Membership)
// @route   POST /api/payments/:id/simulate-success
// @access  Private
exports.simulatePaymentSuccess = async (req, res) => {
  try {
    const payment = await Payment.findById(req.params.id).populate('membershipPlan');
    if (!payment) {
      return res.status(404).json({ success: false, message: 'Payment log not found' });
    }

    if (payment.paymentStatus === 'success') {
      return res.status(400).json({ success: false, message: 'Payment has already been processed successfully' });
    }

    // Update payment log status
    payment.paymentStatus = 'success';
    await payment.save();

    // Update User's membership
    const user = await User.findById(payment.student);
    if (!user) {
      return res.status(404).json({ success: false, message: 'Student user not found' });
    }

    const durationDays = payment.membershipPlan.durationDays;
    
    // Calculate new expiry date (extend if membership is already active)
    let startDate = new Date();
    if (user.membership && user.membership.status === 'active' && user.membership.expiryDate) {
      const currentExpiry = new Date(user.membership.expiryDate);
      if (currentExpiry > startDate) {
        startDate = currentExpiry;
      }
    }

    const expiryDate = new Date(startDate);
    expiryDate.setDate(expiryDate.getDate() + durationDays);

    user.membership = {
      status: 'active',
      planId: payment.membershipPlan._id,
      expiryDate: expiryDate
    };
    await user.save();

    // Create a notification
    await Notification.create({
      user: user._id,
      type: 'payment_success',
      message: `Payment of ₹${payment.amount} for ${payment.membershipPlan.name} was successful. Invoice: ${payment.invoiceNumber}. Active till: ${expiryDate.toLocaleDateString()}`
    });

    res.json({
      success: true,
      message: 'Membership activated successfully!',
      userMembership: user.membership
    });

  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get student's payment history
// @route   GET /api/payments/my-payments
// @access  Private
exports.getMyPayments = async (req, res) => {
  try {
    const payments = await Payment.find({ student: req.user.id })
      .populate('membershipPlan')
      .sort({ createdAt: -1 });
    res.json({ success: true, payments });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get all payment records (Admin)
// @route   GET /api/payments
// @access  Private/Admin
exports.getAllPayments = async (req, res) => {
  try {
    const payments = await Payment.find()
      .populate('student', 'name email phone')
      .populate('membershipPlan')
      .sort({ createdAt: -1 });
    res.json({ success: true, payments });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
