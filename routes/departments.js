const express = require('express');
const Department = require('../models/Department');
const Employee = require('../models/Employee');
const { auth, authorize } = require('../middleware/auth');
const router = express.Router();

// Get all departments
router.get('/', auth, async (req, res) => {
  try {
    const departments = await Department.find()
      .populate('manager')
      .sort({ name: 1 });

    // Get employee count for each department
    const departmentsWithCount = await Promise.all(
      departments.map(async (dept) => {
        const count = await Employee.countDocuments({ department: dept._id });
        return { ...dept.toObject(), employeeCount: count };
      })
    );

    res.json(departmentsWithCount);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get single department
router.get('/:id', auth, async (req, res) => {
  try {
    const department = await Department.findById(req.params.id).populate('manager');
    if (!department) {
      return res.status(404).json({ message: 'Department not found' });
    }

    const employees = await Employee.find({ department: department._id });
    res.json({ ...department.toObject(), employees });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Create department
router.post('/', auth, authorize('admin', 'hr'), async (req, res) => {
  try {
    const department = new Department(req.body);
    await department.save();
    await department.populate('manager');
    res.status(201).json(department);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Update department
router.put('/:id', auth, authorize('admin', 'hr'), async (req, res) => {
  try {
    const department = await Department.findByIdAndUpdate(
      req.params.id,
      { ...req.body, updatedAt: Date.now() },
      { new: true, runValidators: true }
    ).populate('manager');

    if (!department) {
      return res.status(404).json({ message: 'Department not found' });
    }

    res.json(department);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Delete department
router.delete('/:id', auth, authorize('admin'), async (req, res) => {
  try {
    const employeeCount = await Employee.countDocuments({ department: req.params.id });
    if (employeeCount > 0) {
      return res.status(400).json({ 
        message: 'Cannot delete department with employees. Please reassign employees first.' 
      });
    }

    const department = await Department.findByIdAndDelete(req.params.id);
    if (!department) {
      return res.status(404).json({ message: 'Department not found' });
    }
    res.json({ message: 'Department deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;

