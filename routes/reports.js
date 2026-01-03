const express = require('express');
const Employee = require('../models/Employee');
const Attendance = require('../models/Attendance');
const Leave = require('../models/Leave');
const Payroll = require('../models/Payroll');
const Department = require('../models/Department');
const { auth, authorize } = require('../middleware/auth');
const router = express.Router();

// Dashboard statistics
router.get('/dashboard', auth, async (req, res) => {
  try {
    const totalEmployees = await Employee.countDocuments({ status: 'active' });
    const totalDepartments = await Department.countDocuments();
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayAttendance = await Attendance.countDocuments({
      date: { $gte: today, $lt: new Date(today.getTime() + 24 * 60 * 60 * 1000) },
      status: 'present'
    });

    const pendingLeaves = await Leave.countDocuments({ status: 'pending' });

    const currentMonth = new Date().getMonth() + 1;
    const currentYear = new Date().getFullYear();
    const monthlyPayroll = await Payroll.aggregate([
      { $match: { month: currentMonth, year: currentYear } },
      { $group: { _id: null, total: { $sum: '$netSalary' } } }
    ]);

    res.json({
      totalEmployees,
      totalDepartments,
      todayAttendance,
      pendingLeaves,
      monthlyPayrollTotal: monthlyPayroll[0]?.total || 0
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Attendance report
router.get('/attendance', auth, authorize('admin', 'hr', 'manager'), async (req, res) => {
  try {
    const { startDate, endDate, department } = req.query;
    let matchQuery = {};

    if (startDate || endDate) {
      matchQuery.date = {};
      if (startDate) matchQuery.date.$gte = new Date(startDate);
      if (endDate) matchQuery.date.$lte = new Date(endDate);
    }

    if (department) {
      const employees = await Employee.find({ department }).select('_id');
      matchQuery.employee = { $in: employees.map(e => e._id) };
    }

    const report = await Attendance.aggregate([
      { $match: matchQuery },
      {
        $group: {
          _id: '$employee',
          totalDays: { $sum: 1 },
          presentDays: { $sum: { $cond: [{ $eq: ['$status', 'present'] }, 1, 0] } },
          absentDays: { $sum: { $cond: [{ $eq: ['$status', 'absent'] }, 1, 0] } },
          lateDays: { $sum: { $cond: [{ $eq: ['$status', 'late'] }, 1, 0] } },
          totalHours: { $sum: '$workingHours' },
          totalOvertime: { $sum: '$overtime' }
        }
      },
      {
        $lookup: {
          from: 'employees',
          localField: '_id',
          foreignField: '_id',
          as: 'employee'
        }
      },
      { $unwind: '$employee' },
      {
        $project: {
          employeeId: '$employee.employeeId',
          name: { $concat: ['$employee.firstName', ' ', '$employee.lastName'] },
          totalDays: 1,
          presentDays: 1,
          absentDays: 1,
          lateDays: 1,
          totalHours: 1,
          totalOvertime: 1
        }
      }
    ]);

    res.json(report);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Leave report
router.get('/leaves', auth, authorize('admin', 'hr', 'manager'), async (req, res) => {
  try {
    const { startDate, endDate, leaveType, status } = req.query;
    let matchQuery = {};

    if (startDate || endDate) {
      matchQuery.$or = [
        { startDate: { $gte: new Date(startDate || 0), $lte: new Date(endDate || Date.now()) } },
        { endDate: { $gte: new Date(startDate || 0), $lte: new Date(endDate || Date.now()) } }
      ];
    }
    if (leaveType) matchQuery.leaveType = leaveType;
    if (status) matchQuery.status = status;

    const report = await Leave.aggregate([
      { $match: matchQuery },
      {
        $group: {
          _id: '$employee',
          totalLeaves: { $sum: '$days' },
          approvedLeaves: { $sum: { $cond: [{ $eq: ['$status', 'approved'] }, '$days', 0] } },
          pendingLeaves: { $sum: { $cond: [{ $eq: ['$status', 'pending'] }, '$days', 0] } },
          rejectedLeaves: { $sum: { $cond: [{ $eq: ['$status', 'rejected'] }, '$days', 0] } }
        }
      },
      {
        $lookup: {
          from: 'employees',
          localField: '_id',
          foreignField: '_id',
          as: 'employee'
        }
      },
      { $unwind: '$employee' },
      {
        $project: {
          employeeId: '$employee.employeeId',
          name: { $concat: ['$employee.firstName', ' ', '$employee.lastName'] },
          totalLeaves: 1,
          approvedLeaves: 1,
          pendingLeaves: 1,
          rejectedLeaves: 1
        }
      }
    ]);

    res.json(report);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Payroll report
router.get('/payroll', auth, authorize('admin', 'hr'), async (req, res) => {
  try {
    const { month, year, department } = req.query;
    let matchQuery = {};

    if (month) matchQuery.month = parseInt(month);
    if (year) matchQuery.year = parseInt(year);

    let employees = [];
    if (department) {
      employees = await Employee.find({ department }).select('_id');
      matchQuery.employee = { $in: employees.map(e => e._id) };
    }

    const report = await Payroll.aggregate([
      { $match: matchQuery },
      {
        $lookup: {
          from: 'employees',
          localField: 'employee',
          foreignField: '_id',
          as: 'employee'
        }
      },
      { $unwind: '$employee' },
      {
        $project: {
          employeeId: '$employee.employeeId',
          name: { $concat: ['$employee.firstName', ' ', '$employee.lastName'] },
          month: 1,
          year: 1,
          baseSalary: 1,
          grossSalary: 1,
          netSalary: 1,
          status: 1
        }
      },
      { $sort: { year: -1, month: -1 } }
    ]);

    res.json(report);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Department-wise employee count
router.get('/departments', auth, async (req, res) => {
  try {
    const report = await Department.aggregate([
      {
        $lookup: {
          from: 'employees',
          localField: '_id',
          foreignField: 'department',
          as: 'employees'
        }
      },
      {
        $project: {
          name: 1,
          employeeCount: { $size: '$employees' },
          activeEmployees: {
            $size: {
              $filter: {
                input: '$employees',
                as: 'emp',
                cond: { $eq: ['$$emp.status', 'active'] }
              }
            }
          }
        }
      }
    ]);

    res.json(report);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;

