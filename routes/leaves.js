const express = require('express');
const Leave = require('../models/Leave');
const { auth, authorize } = require('../middleware/auth');
const router = express.Router();

// Get all leaves
router.get('/', auth, async (req, res) => {
  try {
    const { employee, status, leaveType, startDate, endDate } = req.query;
    let query = {};

    // Employees can only see their own leaves unless admin/hr
    if (req.user.role === 'employee' && !employee) {
      query.employee = req.user.employeeId || req.user._id;
    } else if (employee) {
      query.employee = employee;
    }

    if (status) query.status = status;
    if (leaveType) query.leaveType = leaveType;
    if (startDate || endDate) {
      query.$or = [
        { startDate: { $gte: new Date(startDate || 0), $lte: new Date(endDate || Date.now()) } },
        { endDate: { $gte: new Date(startDate || 0), $lte: new Date(endDate || Date.now()) } }
      ];
    }

    const leaves = await Leave.find(query)
      .populate('employee', 'firstName lastName employeeId email')
      .populate('approvedBy', 'firstName lastName')
      .sort({ createdAt: -1 });

    res.json(leaves);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get single leave
router.get('/:id', auth, async (req, res) => {
  try {
    const leave = await Leave.findById(req.params.id)
      .populate('employee', 'firstName lastName employeeId email')
      .populate('approvedBy', 'firstName lastName');

    if (!leave) {
      return res.status(404).json({ message: 'Leave request not found' });
    }

    // Check if user has permission to view this leave
    if (req.user.role === 'employee' && 
        leave.employee._id.toString() !== (req.user.employeeId || req.user._id).toString()) {
      return res.status(403).json({ message: 'Access denied' });
    }

    res.json(leave);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Create leave request
router.post('/', auth, async (req, res) => {
  try {
    const { startDate, endDate, leaveType, reason } = req.body;

    // Calculate days
    const start = new Date(startDate);
    const end = new Date(endDate);
    const days = Math.ceil((end - start) / (1000 * 60 * 60 * 24)) + 1;

    const leave = new Leave({
      employee: req.user.employeeId || req.user._id,
      startDate,
      endDate,
      leaveType,
      reason,
      days
    });

    await leave.save();
    await leave.populate('employee', 'firstName lastName employeeId email');

    res.status(201).json(leave);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Update leave (approve/reject)
router.put('/:id', auth, authorize('admin', 'hr', 'manager'), async (req, res) => {
  try {
    const { status, comments } = req.body;

    const leave = await Leave.findById(req.params.id);
    if (!leave) {
      return res.status(404).json({ message: 'Leave request not found' });
    }

    leave.status = status || leave.status;
    leave.comments = comments || leave.comments;
    leave.approvedBy = req.user.employeeId || req.user._id;
    leave.updatedAt = Date.now();

    await leave.save();
    await leave.populate('employee', 'firstName lastName employeeId email');
    await leave.populate('approvedBy', 'firstName lastName');

    res.json(leave);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Delete leave
router.delete('/:id', auth, async (req, res) => {
  try {
    const leave = await Leave.findById(req.params.id);
    if (!leave) {
      return res.status(404).json({ message: 'Leave request not found' });
    }

    // Only allow deletion if pending or if user is admin/hr
    if (leave.status !== 'pending' && !['admin', 'hr'].includes(req.user.role)) {
      return res.status(403).json({ message: 'Cannot delete processed leave request' });
    }

    // Check if user owns the leave or is admin/hr
    if (leave.employee.toString() !== (req.user.employeeId || req.user._id).toString() &&
        !['admin', 'hr'].includes(req.user.role)) {
      return res.status(403).json({ message: 'Access denied' });
    }

    await Leave.findByIdAndDelete(req.params.id);
    res.json({ message: 'Leave request deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;

