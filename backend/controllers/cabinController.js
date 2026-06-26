const Cabin = require('../models/Cabin');
const Booking = require('../models/Booking');

// Helper to convert time string (HH:MM) to minutes from midnight
const timeToMinutes = (timeStr) => {
  const [hours, minutes] = timeStr.split(':').map(Number);
  return hours * 60 + minutes;
};

// Helper to check if current time falls within a booking's slot
const isCurrentTimeInSlot = (timeSlot, currentMinutes) => {
  const [startStr, endStr] = timeSlot.split('-');
  const start = timeToMinutes(startStr);
  const end = timeToMinutes(endStr);
  return currentMinutes >= start && currentMinutes <= end;
};

// @desc    Get all cabins with calculated real-time statuses
// @route   GET /api/cabins
// @access  Public
exports.getAllCabins = async (req, res) => {
  try {
    const cabins = await Cabin.find();
    
    // Get current date and time details
    const now = new Date();
    // Format local date as YYYY-MM-DD
    const localYear = now.getFullYear();
    const localMonth = String(now.getMonth() + 1).padStart(2, '0');
    const localDateStr = String(now.getDate()).padStart(2, '0');
    const currentDateString = `${localYear}-${localMonth}-${localDateStr}`;
    
    const currentHours = String(now.getHours()).padStart(2, '0');
    const currentMins = String(now.getMinutes()).padStart(2, '0');
    const currentMinutesFromMidnight = timeToMinutes(`${currentHours}:${currentMins}`);

    // Fetch all active bookings for today
    const todayBookings = await Booking.find({
      date: currentDateString,
      status: { $in: ['approved', 'pending'] }
    });

    const cabinsWithStatus = cabins.map(cabin => {
      const cabinBookings = todayBookings.filter(b => b.cabin.toString() === cabin._id.toString());
      
      let computedStatus = 'available'; // Default is Green
      
      if (cabin.isBlocked) {
        computedStatus = 'occupied'; // Red if blocked by admin
      } else if (cabinBookings.length > 0) {
        // Check if any booking is happening right now
        const isOccupiedNow = cabinBookings.some(b => isCurrentTimeInSlot(b.timeSlot, currentMinutesFromMidnight));
        if (isOccupiedNow) {
          computedStatus = 'occupied'; // Red
        } else {
          computedStatus = 'reserved'; // Yellow (reserved for another slot today)
        }
      }

      return {
        _id: cabin._id,
        cabinNumber: cabin.cabinNumber,
        capacity: cabin.capacity,
        isBlocked: cabin.isBlocked,
        status: computedStatus
      };
    });

    res.json({ success: true, cabins: cabinsWithStatus });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Create a new cabin
// @route   POST /api/cabins
// @access  Private/Admin
exports.createCabin = async (req, res) => {
  const { cabinNumber, capacity } = req.body;
  try {
    const cabinExists = await Cabin.findOne({ cabinNumber });
    if (cabinExists) {
      return res.status(400).json({ success: false, message: 'Cabin number already exists' });
    }

    const cabin = await Cabin.create({ cabinNumber, capacity });
    res.status(201).json({ success: true, cabin });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Toggle cabin block status
// @route   PUT /api/cabins/:id/block
// @access  Private/Admin
exports.toggleCabinBlock = async (req, res) => {
  try {
    const cabin = await Cabin.findById(req.params.id);
    if (!cabin) {
      return res.status(404).json({ success: false, message: 'Cabin not found' });
    }

    cabin.isBlocked = !cabin.isBlocked;
    await cabin.save();

    res.json({ success: true, message: `Cabin ${cabin.isBlocked ? 'blocked' : 'unblocked'} successfully`, cabin });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Delete cabin
// @route   DELETE /api/cabins/:id
// @access  Private/Admin
exports.deleteCabin = async (req, res) => {
  try {
    const cabin = await Cabin.findById(req.params.id);
    if (!cabin) {
      return res.status(404).json({ success: false, message: 'Cabin not found' });
    }

    await Cabin.deleteOne({ _id: req.params.id });
    res.json({ success: true, message: 'Cabin deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
