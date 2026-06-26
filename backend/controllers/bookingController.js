const Booking = require('../models/Booking');
const Cabin = require('../models/Cabin');
const User = require('../models/User');
const Notification = require('../models/Notification');

// Helper to convert time string (HH:MM) to minutes from midnight
const timeToMinutes = (timeStr) => {
  const [hours, minutes] = timeStr.split(':').map(Number);
  return hours * 60 + minutes;
};

// Helper to check if two time slots overlap
const checkOverlap = (slot1, slot2) => {
  const [start1Str, end1Str] = slot1.split('-');
  const [start2Str, end2Str] = slot2.split('-');
  
  const start1 = timeToMinutes(start1Str);
  const end1 = timeToMinutes(end1Str);
  const start2 = timeToMinutes(start2Str);
  const end2 = timeToMinutes(end2Str);
  
  return (start1 < end2) && (end1 > start2);
};

// Helper to get today's date formatted as YYYY-MM-DD
const getTodayDateString = () => {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const date = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${date}`;
};

// @desc    Create a new cabin booking
// @route   POST /api/bookings
// @access  Private
exports.createBooking = async (req, res) => {
  const { cabinId, date, timeSlot, durationHours } = req.body;
  const studentId = req.user.id;

  try {
    // 1. Verify User has active membership
    const user = await User.findById(studentId);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    if (!user.membership || user.membership.status !== 'active') {
      return res.status(400).json({
        success: false,
        message: 'Active membership required to book a study cabin. Please buy/renew a membership plan first.'
      });
    }

    // 2. Validate duration
    if (durationHours > 8) {
      return res.status(400).json({ success: false, message: 'Maximum booking duration is 8 hours per day.' });
    }

    // 3. Verify the cabin exists and is not blocked
    const cabin = await Cabin.findById(cabinId);
    if (!cabin) {
      return res.status(404).json({ success: false, message: 'Cabin not found' });
    }
    if (cabin.isBlocked) {
      return res.status(400).json({ success: false, message: 'This cabin is currently out of service.' });
    }

    const todayStr = getTodayDateString();

    // 4. One active booking limit (active = date is today or in future and status is approved/pending)
    const activeBooking = await Booking.findOne({
      student: studentId,
      date: { $gte: todayStr },
      status: { $in: ['approved', 'pending'] }
    });

    if (activeBooking) {
      return res.status(400).json({
        success: false,
        message: `You already have an active reservation on ${activeBooking.date} at slot ${activeBooking.timeSlot}. Only one active booking is allowed at a time.`
      });
    }

    // 5. Maximum booking duration of 8 hours per day overall
    const studentBookingsOnDate = await Booking.find({
      student: studentId,
      date: date,
      status: { $in: ['approved', 'pending'] }
    });

    const totalHoursToday = studentBookingsOnDate.reduce((sum, b) => sum + b.durationHours, 0);
    if (totalHoursToday + Number(durationHours) > 8) {
      return res.status(400).json({
        success: false,
        message: `Booking exceeds daily limit of 8 hours. You have already booked ${totalHoursToday} hours for this date.`
      });
    }

    // 6. Prevent overlapping bookings for the same cabin
    const existingCabinsBookings = await Booking.find({
      cabin: cabinId,
      date: date,
      status: { $in: ['approved', 'pending'] }
    });

    const isOverlapping = existingCabinsBookings.some(b => checkOverlap(b.timeSlot, timeSlot));
    if (isOverlapping) {
      return res.status(400).json({
        success: false,
        message: 'This cabin is already reserved during your chosen time slot. Please choose another cabin or slot.'
      });
    }

    // Create the booking
    const booking = await Booking.create({
      student: studentId,
      cabin: cabinId,
      date,
      timeSlot,
      durationHours,
      status: 'approved' // Automatically approve
    });

    // Update user's active cabin number
    user.cabinNumber = cabin.cabinNumber;
    await user.save();

    // Create system notification
    await Notification.create({
      user: studentId,
      type: 'booking_confirmation',
      message: `Your booking for Cabin ${cabin.cabinNumber} on ${date} (${timeSlot}) has been confirmed successfully!`
    });

    res.status(201).json({
      success: true,
      message: 'Booking confirmed immediately!',
      booking
    });

  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get logged in student's bookings
// @route   GET /api/bookings/my-bookings
// @access  Private
exports.getMyBookings = async (req, res) => {
  try {
    const bookings = await Booking.find({ student: req.user.id })
      .populate('cabin')
      .sort({ createdAt: -1 });
    res.json({ success: true, bookings });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Cancel a booking
// @route   PUT /api/bookings/:id/cancel
// @access  Private
exports.cancelBooking = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id).populate('cabin');
    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking not found' });
    }

    // Verify ownership
    if (booking.student.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized to cancel this booking' });
    }

    booking.status = 'cancelled';
    await booking.save();

    // Reset user's active cabin if it was this cabin
    const user = await User.findById(booking.student);
    if (user && user.cabinNumber === booking.cabin.cabinNumber) {
      user.cabinNumber = undefined;
      await user.save();
    }

    // Notification
    await Notification.create({
      user: booking.student,
      type: 'booking_cancellation',
      message: `Your booking for Cabin ${booking.cabin.cabinNumber} on ${booking.date} has been cancelled.`
    });

    res.json({ success: true, message: 'Booking cancelled successfully', booking });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get all bookings (Admin)
// @route   GET /api/bookings
// @access  Private/Admin
exports.getAllBookings = async (req, res) => {
  try {
    const bookings = await Booking.find()
      .populate('student', 'name email phone')
      .populate('cabin')
      .sort({ createdAt: -1 });
    res.json({ success: true, bookings });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update booking status (Admin manual approval/rejection)
// @route   PUT /api/bookings/:id/status
// @access  Private/Admin
exports.updateBookingStatus = async (req, res) => {
  const { status } = req.body; // approved, rejected, cancelled
  try {
    const booking = await Booking.findById(req.params.id).populate('cabin');
    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking not found' });
    }

    booking.status = status;
    await booking.save();

    // Update student cabin number if status changed
    const user = await User.findById(booking.student);
    if (user) {
      if (status === 'approved') {
        user.cabinNumber = booking.cabin.cabinNumber;
      } else if (status === 'rejected' || status === 'cancelled') {
        if (user.cabinNumber === booking.cabin.cabinNumber) {
          user.cabinNumber = undefined;
        }
      }
      await user.save();
    }

    // Notification
    let type = 'booking_confirmation';
    if (status === 'rejected' || status === 'cancelled') {
      type = 'booking_cancellation';
    }

    await Notification.create({
      user: booking.student,
      type: type,
      message: `Admin has updated your Cabin ${booking.cabin.cabinNumber} booking status to: ${status.toUpperCase()}.`
    });

    res.json({ success: true, message: `Booking status updated to ${status}`, booking });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Check cabin availability for a given date and time slot
// @route   POST /api/bookings/check-availability
// @access  Public
exports.checkAvailability = async (req, res) => {
  const { date, timeSlot } = req.body;
  try {
    const cabins = await Cabin.find({ isBlocked: false });
    
    // Fetch all active bookings for this date
    const dateBookings = await Booking.find({
      date,
      status: { $in: ['approved', 'pending'] }
    });

    const cabinsAvailability = cabins.map(cabin => {
      const cabinBookings = dateBookings.filter(b => b.cabin.toString() === cabin._id.toString());
      
      // Check if any booking overlaps with checked timeSlot
      const isBooked = cabinBookings.some(b => checkOverlap(b.timeSlot, timeSlot));
      
      return {
        _id: cabin._id,
        cabinNumber: cabin.cabinNumber,
        capacity: cabin.capacity,
        isAvailable: !isBooked
      };
    });

    res.json({ success: true, cabins: cabinsAvailability });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
