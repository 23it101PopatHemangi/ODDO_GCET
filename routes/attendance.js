const express = require('express');
const Attendance = require('../models/Attendance');
const Employee = require('../models/Employee');
const { auth, authorize } = require('../middleware/auth');
const router = express.Router();

// Get all attendance records
router.get('/', auth, async (req, res) => {
  try {
    const { employee, startDate, endDate, status } = req.query;
    let query = {};

    if (employee) query.employee = employee;
    if (status) query.status = status;
    if (startDate || endDate) {
      query.date = {};
      if (startDate) query.date.$gte = new Date(startDate);
      if (endDate) query.date.$lte = new Date(endDate);
    }

    const attendance = await Attendance.find(query)
      .populate('employee', 'firstName lastName employeeId')
      .sort({ date: -1 });

    res.json(attendance);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get single attendance record
router.get('/:id', auth, async (req, res) => {
  try {
    const attendance = await Attendance.findById(req.params.id).populate('employee');
    if (!attendance) {
      return res.status(404).json({ message: 'Attendance record not found' });
    }
    res.json(attendance);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Check in
router.post('/checkin', auth, async (req, res) => {
  try {
    const userId = req.user.employeeId || req.user._id;
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Check if already checked in today
    const existing = await Attendance.findOne({
      employee: userId,
      date: { $gte: today, $lt: new Date(today.getTime() + 24 * 60 * 60 * 1000) }
    });

    if (existing) {
      return res.status(400).json({ message: 'Already checked in today' });
    }

    const checkInTime = new Date();
    const attendance = new Attendance({
      employee: userId,
      date: today,
      checkIn: checkInTime,
      status: 'present'
    });

    await attendance.save();
    await attendance.populate('employee', 'firstName lastName employeeId');

    res.status(201).json(attendance);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Check out
router.post('/checkout', auth, async (req, res) => {
  try {
    const userId = req.user.employeeId || req.user._id;
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const attendance = await Attendance.findOne({
      employee: userId,
      date: { $gte: today, $lt: new Date(today.getTime() + 24 * 60 * 60 * 1000) }
    });

    if (!attendance) {
      return res.status(400).json({ message: 'Please check in first' });
    }

    if (attendance.checkOut) {
      return res.status(400).json({ message: 'Already checked out today' });
    }

    const checkOutTime = new Date();
    const workingHours = (checkOutTime - attendance.checkIn) / (1000 * 60 * 60);
    const overtime = workingHours > 8 ? workingHours - 8 : 0;

    attendance.checkOut = checkOutTime;
    attendance.workingHours = Math.round(workingHours * 100) / 100;
    attendance.overtime = Math.round(overtime * 100) / 100;

    await attendance.save();
    await attendance.populate('employee', 'firstName lastName employeeId');

    res.json(attendance);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Create attendance record (admin/hr)
router.post('/', auth, authorize('admin', 'hr'), async (req, res) => {
  try {
    const attendance = new Attendance(req.body);
    await attendance.save();
    await attendance.populate('employee', 'firstName lastName employeeId');
    res.status(201).json(attendance);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Update attendance
router.put('/:id', auth, authorize('admin', 'hr'), async (req, res) => {
  try {
    const attendance = await Attendance.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    ).populate('employee', 'firstName lastName employeeId');

    if (!attendance) {
      return res.status(404).json({ message: 'Attendance record not found' });
    }

    // Recalculate working hours if checkIn and checkOut are present
    if (attendance.checkIn && attendance.checkOut) {
      const workingHours = (attendance.checkOut - attendance.checkIn) / (1000 * 60 * 60);
      attendance.workingHours = Math.round(workingHours * 100) / 100;
      attendance.overtime = workingHours > 8 ? Math.round((workingHours - 8) * 100) / 100 : 0;
      await attendance.save();
    }

    res.json(attendance);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Delete attendance
router.delete('/:id', auth, authorize('admin', 'hr'), async (req, res) => {
  try {
    const attendance = await Attendance.findByIdAndDelete(req.params.id);
    if (!attendance) {
      return res.status(404).json({ message: 'Attendance record not found' });
    }
    res.json({ message: 'Attendance record deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;

