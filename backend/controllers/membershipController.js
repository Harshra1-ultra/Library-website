const Membership = require('../models/Membership');

// @desc    Get all membership plans
// @route   GET /api/memberships
// @access  Public
exports.getAllMemberships = async (req, res) => {
  try {
    const memberships = await Membership.find({ isActive: true });
    
    // Seed initial plans if they do not exist
    if (memberships.length === 0) {
      const defaultPlans = [
        { name: 'Daily Pass', price: 50, durationDays: 1, benefits: ['Study hall access', 'High speed Wi-Fi', 'Drinking RO water'] },
        { name: 'Weekly Pass', price: 250, durationDays: 7, benefits: ['Study hall access', 'High speed Wi-Fi', 'Power backup', 'Locker access (chargeable)'] },
        { name: 'Monthly Pass', price: 800, durationDays: 30, benefits: ['Allocated Cabin preference', 'High speed Wi-Fi', 'Locker facility', 'Power backup', 'Fully A/C'] },
        { name: 'Quarterly Pass', price: 2200, durationDays: 90, benefits: ['Allocated Cabin preference', 'High speed Wi-Fi', 'Locker facility', 'Power backup', 'Fully A/C', '1 Free Magazine'] },
        { name: 'Half-Yearly Pass', price: 4000, durationDays: 180, benefits: ['Allocated Cabin preference', 'High speed Wi-Fi', 'Locker facility', 'Power backup', 'Fully A/C', 'Monthly Magazines'] },
        { name: 'Yearly Pass', price: 7500, durationDays: 365, benefits: ['Permanent Study Cabin', 'High speed Wi-Fi', 'Locker facility', 'Power backup', 'Fully A/C', 'All Magazines', '10% Discount'] }
      ];
      await Membership.insertMany(defaultPlans);
      const seeded = await Membership.find({ isActive: true });
      return res.json({ success: true, memberships: seeded });
    }

    res.json({ success: true, memberships });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Create a new membership plan
// @route   POST /api/memberships
// @access  Private/Admin
exports.createMembership = async (req, res) => {
  const { name, price, durationDays, benefits } = req.body;
  try {
    const planExists = await Membership.findOne({ name });
    if (planExists) {
      return res.status(400).json({ success: false, message: 'Membership plan name already exists' });
    }

    const membership = await Membership.create({
      name,
      price,
      durationDays,
      benefits
    });

    res.status(201).json({ success: true, membership });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update membership plan
// @route   PUT /api/memberships/:id
// @access  Private/Admin
exports.updateMembership = async (req, res) => {
  try {
    const membership = await Membership.findById(req.params.id);
    if (!membership) {
      return res.status(404).json({ success: false, message: 'Membership plan not found' });
    }

    membership.name = req.body.name || membership.name;
    membership.price = req.body.price !== undefined ? req.body.price : membership.price;
    membership.durationDays = req.body.durationDays !== undefined ? req.body.durationDays : membership.durationDays;
    membership.benefits = req.body.benefits || membership.benefits;
    membership.isActive = req.body.isActive !== undefined ? req.body.isActive : membership.isActive;

    await membership.save();
    res.json({ success: true, message: 'Membership updated successfully', membership });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Delete membership plan
// @route   DELETE /api/memberships/:id
// @access  Private/Admin
exports.deleteMembership = async (req, res) => {
  try {
    const membership = await Membership.findById(req.params.id);
    if (!membership) {
      return res.status(404).json({ success: false, message: 'Membership plan not found' });
    }

    await Membership.deleteOne({ _id: req.params.id });
    res.json({ success: true, message: 'Membership plan deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
