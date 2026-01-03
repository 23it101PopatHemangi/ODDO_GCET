const express = require('express');
const Payroll = require('../models/Payroll');
const Employee = require('../models/Employee');
const { auth, authorize } = require('../middleware/auth');
const router = express.Router();

// Get all payroll records
router.get('/', auth, async (req, res) => {
  try {
    const { employee, month, year, status } = req.query;
    let query = {};

    // Employees can only see their own payroll unless admin/hr
    if (req.user.role === 'employee' && !employee) {
      query.employee = req.user.employeeId || req.user._id;
    } else if (employee) {
      query.employee = employee;
    }

    if (month) query.month = parseInt(month);
    if (year) query.year = parseInt(year);
    if (status) query.status = status;

    const payrolls = await Payroll.find(query)
      .populate('employee', 'firstName lastName employeeId email')
      .sort({ year: -1, month: -1 });

    res.json(payrolls);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get single payroll record
router.get('/:id', auth, async (req, res) => {
  try {
    const payroll = await Payroll.findById(req.params.id)
      .populate('employee', 'firstName lastName employeeId email');

    if (!payroll) {
      return res.status(404).json({ message: 'Payroll record not found' });
    }

    // Check if user has permission
    if (req.user.role === 'employee' && 
        payroll.employee._id.toString() !== (req.user.employeeId || req.user._id).toString()) {
      return res.status(403).json({ message: 'Access denied' });
    }

    res.json(payroll);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Create payroll record
router.post('/', auth, authorize('admin', 'hr'), async (req, res) => {
  try {
    const { employee, month, year, baseSalary, allowances, deductions, overtime, bonuses } = req.body;

    // Check if payroll already exists
    const existing = await Payroll.findOne({ employee, month, year });
    if (existing) {
      return res.status(400).json({ message: 'Payroll for this month already exists' });
    }

    // Calculate totals
    const totalAllowances = Object.values(allowances || {}).reduce((sum, val) => sum + (val || 0), 0);
    const totalDeductions = Object.values(deductions || {}).reduce((sum, val) => sum + (val || 0), 0);
    const overtimeAmount = (overtime?.hours || 0) * (overtime?.rate || 0);
    const grossSalary = baseSalary + totalAllowances + overtimeAmount + (bonuses || 0);
    const netSalary = grossSalary - totalDeductions;

    const payroll = new Payroll({
      employee,
      month,
      year,
      baseSalary,
      allowances: allowances || {},
      deductions: deductions || {},
      overtime: {
        hours: overtime?.hours || 0,
        rate: overtime?.rate || 0,
        amount: overtimeAmount
      },
      bonuses: bonuses || 0,
      grossSalary,
      netSalary
    });

    await payroll.save();
    await payroll.populate('employee', 'firstName lastName employeeId email');

    res.status(201).json(payroll);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Update payroll
router.put('/:id', auth, authorize('admin', 'hr'), async (req, res) => {
  try {
    const payroll = await Payroll.findById(req.params.id);
    if (!payroll) {
      return res.status(404).json({ message: 'Payroll record not found' });
    }

    // Update fields
    if (req.body.baseSalary) payroll.baseSalary = req.body.baseSalary;
    if (req.body.allowances) payroll.allowances = { ...payroll.allowances, ...req.body.allowances };
    if (req.body.deductions) payroll.deductions = { ...payroll.deductions, ...req.body.deductions };
    if (req.body.overtime) payroll.overtime = { ...payroll.overtime, ...req.body.overtime };
    if (req.body.bonuses !== undefined) payroll.bonuses = req.body.bonuses;
    if (req.body.status) payroll.status = req.body.status;
    if (req.body.paymentDate) payroll.paymentDate = req.body.paymentDate;

    // Recalculate
    const totalAllowances = Object.values(payroll.allowances).reduce((sum, val) => sum + (val || 0), 0);
    const totalDeductions = Object.values(payroll.deductions).reduce((sum, val) => sum + (val || 0), 0);
    const overtimeAmount = (payroll.overtime.hours || 0) * (payroll.overtime.rate || 0);
    payroll.grossSalary = payroll.baseSalary + totalAllowances + overtimeAmount + (payroll.bonuses || 0);
    payroll.netSalary = payroll.grossSalary - totalDeductions;

    await payroll.save();
    await payroll.populate('employee', 'firstName lastName employeeId email');

    res.json(payroll);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Delete payroll
router.delete('/:id', auth, authorize('admin', 'hr'), async (req, res) => {
  try {
    const payroll = await Payroll.findByIdAndDelete(req.params.id);
    if (!payroll) {
      return res.status(404).json({ message: 'Payroll record not found' });
    }
    res.json({ message: 'Payroll record deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;

