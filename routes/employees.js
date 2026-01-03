const express = require('express');
const crypto = require('crypto');
const Employee = require('../models/Employee');
const Department = require('../models/Department');
const User = require('../models/User');
const { auth, authorize } = require('../middleware/auth');
const { generateLoginId } = require('../utils/loginIdGenerator');
const router = express.Router();

// Generate random password
const generatePassword = () => {
  return crypto.randomBytes(8).toString('hex');
};

// Get all employees
router.get('/', auth, async (req, res) => {
  try {
    const { status, department, search } = req.query;
    let query = {};

    if (status) query.status = status;
    if (department) query.department = department;
    if (search) {
      query.$or = [
        { firstName: { $regex: search, $options: 'i' } },
        { lastName: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { employeeId: { $regex: search, $options: 'i' } },
        { loginId: { $regex: search, $options: 'i' } }
      ];
    }

    const employees = await Employee.find(query)
      .populate('department')
      .sort({ createdAt: -1 });

    res.json(employees);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get single employee
router.get('/:id', auth, async (req, res) => {
  try {
    const employee = await Employee.findById(req.params.id).populate('department');
    if (!employee) {
      return res.status(404).json({ message: 'Employee not found' });
    }
    res.json(employee);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Create employee
router.post('/', auth, authorize('admin', 'hr'), async (req, res) => {
  try {
    // Generate employee ID
    const count = await Employee.countDocuments();
    const employeeId = `EMP${String(count + 1).padStart(4, '0')}`;

    // Generate Login ID
    const loginId = await generateLoginId(
      req.body.firstName,
      req.body.lastName,
      req.body.companyName || 'Company',
      req.body.hireDate || new Date()
    );

    // Generate auto password
    const autoPassword = generatePassword();

    // Create employee
    const employee = new Employee({
      ...req.body,
      employeeId,
      loginId,
      companyName: req.body.companyName || 'Company'
    });

    await employee.save();

    // Create user account with auto-generated password
    const user = new User({
      email: req.body.email.toLowerCase(),
      password: autoPassword,
      loginId: loginId,
      role: req.body.role || 'employee',
      employeeId: employee._id
    });

    await user.save();
    await employee.populate('department');

    res.status(201).json({
      ...employee.toObject(),
      loginId: loginId,
      autoPassword: autoPassword, // Return password so admin can share it
      message: 'Employee created successfully. Login ID and password generated.'
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Update employee
router.put('/:id', auth, authorize('admin', 'hr'), async (req, res) => {
  try {
    const employee = await Employee.findByIdAndUpdate(
      req.params.id,
      { ...req.body, updatedAt: Date.now() },
      { new: true, runValidators: true }
    ).populate('department');

    if (!employee) {
      return res.status(404).json({ message: 'Employee not found' });
    }

    res.json(employee);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Delete employee
router.delete('/:id', auth, authorize('admin', 'hr'), async (req, res) => {
  try {
    const employee = await Employee.findByIdAndDelete(req.params.id);
    if (!employee) {
      return res.status(404).json({ message: 'Employee not found' });
    }
    res.json({ message: 'Employee deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;

