const express = require('express');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const User = require('../models/User');
const Employee = require('../models/Employee');
const { auth } = require('../middleware/auth');
const { generateLoginId } = require('../utils/loginIdGenerator');
const router = express.Router();

const JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret_key_here';

// Generate random password
const generatePassword = () => {
  return crypto.randomBytes(8).toString('hex');
};

// Register - Auto-generates Login ID and Password
router.post('/register', async (req, res) => {
  try {
    const { email, password, role, name, phone, companyName } = req.body;

    // Check if user exists
    const existingUser = await User.findOne({ 
      $or: [{ email: email.toLowerCase() }, { email }] 
    });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // Auto-generate password if not provided
    const autoPassword = password || generatePassword();

    // Parse name
    const nameParts = name.split(' ');
    const firstName = nameParts[0] || 'User';
    const lastName = nameParts.slice(1).join(' ') || 'Name';
    const companyPrefix = companyName ? companyName.substring(0, 2).toUpperCase().replace(/\s/g, '') : 'CO';
    const namePrefix = (firstName.substring(0, 2) + lastName.substring(0, 2)).toUpperCase();
    const year = new Date().getFullYear();
    
    // Get serial number for Login ID
    const lastUser = await User.findOne({
      loginId: new RegExp(`^${companyPrefix}${namePrefix}${year}`)
    }).sort({ loginId: -1 });

    let serialNumber = 1;
    if (lastUser && lastUser.loginId) {
      const lastSerial = parseInt(lastUser.loginId.slice(-4));
      serialNumber = lastSerial + 1;
    }
    const serialStr = String(serialNumber).padStart(4, '0');
    const loginId = `${companyPrefix}${namePrefix}${year}${serialStr}`;

    // Generate Employee ID
    const empCount = await Employee.countDocuments();
    const employeeId = `EMP${String(empCount + 1).padStart(4, '0')}`;

    // Create Employee record first
    const employee = new Employee({
      loginId: loginId,
      employeeId: employeeId,
      firstName: firstName,
      lastName: lastName,
      email: email.toLowerCase(),
      phone: phone,
      companyName: companyName || 'Company',
      position: role === 'admin' || role === 'hr' ? role.toUpperCase() : 'Employee',
      status: 'active',
      hireDate: new Date()
    });

    await employee.save();

    // Create user and link to employee
    const user = new User({
      email: email.toLowerCase(),
      password: autoPassword,
      loginId: loginId,
      role: role || 'employee',
      employeeId: employee._id
    });

    await user.save();

    // Generate token
    const token = jwt.sign({ userId: user._id }, JWT_SECRET, { expiresIn: '7d' });

    res.status(201).json({
      token,
      user: {
        id: user._id,
        email: user.email,
        loginId: loginId,
        role: user.role,
        employee: employee
      },
      loginId: loginId,
      autoPassword: autoPassword,
      message: 'Registration successful. Login ID and password generated.'
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Login - accepts Login ID or Email
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body; // email field can contain loginId or email

    // Try to find user by loginId first, then by email
    let user = await User.findOne({ loginId: email }).populate('employeeId');
    if (!user) {
      user = await User.findOne({ email: email.toLowerCase() }).populate('employeeId');
    }

    if (!user) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // Check password
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // Generate token
    const token = jwt.sign({ userId: user._id }, JWT_SECRET, { expiresIn: '7d' });

    // Fetch employee data if linked
    let employee = null;
    if (user.employeeId) {
      employee = await Employee.findById(user.employeeId);
    }

    res.json({
      token,
      user: {
        id: user._id,
        email: user.email,
        loginId: user.loginId,
        role: user.role,
        employeeId: user.employeeId,
        employee: employee
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get current user
router.get('/me', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user._id).populate('employeeId');
    
    // Get full employee data if linked
    let employee = null;
    if (user.employeeId) {
      employee = await Employee.findById(user.employeeId);
    }
    
    res.json({
      user: {
        id: user._id,
        email: user.email,
        loginId: user.loginId,
        role: user.role,
        employeeId: user.employeeId,
        employee: employee
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;

