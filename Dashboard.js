import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import {
  FiUsers,
  FiClock,
  FiCalendar,
  FiUser,
  FiLogOut,
  FiCheckCircle,
  FiXCircle,
  FiBriefcase,
} from 'react-icons/fi';

const Dashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [employees, setEmployees] = useState([]);
  const [attendance, setAttendance] = useState([]);
  const [leaves, setLeaves] = useState([]);
  const [loading, setLoading] = useState(true);
  const [todayAttendance, setTodayAttendance] = useState(null);

  useEffect(() => {
    fetchDashboardData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchDashboardData = async () => {
    try {
      if (['admin', 'hr'].includes(user?.role)) {
        // Admin/HR Dashboard
        const [statsRes, employeesRes, attendanceRes, leavesRes] = await Promise.all([
          axios.get('http://localhost:5000/api/reports/dashboard'),
          axios.get('http://localhost:5000/api/employees?status=active'),
          axios.get('http://localhost:5000/api/attendance?startDate=' + new Date().toISOString().split('T')[0]),
          axios.get('http://localhost:5000/api/leaves?status=pending'),
        ]);
        setStats(statsRes.data);
        setEmployees(employeesRes.data.slice(0, 6));
        setAttendance(attendanceRes.data);
        setLeaves(leavesRes.data);
      } else {
        // Employee Dashboard - also fetch employees list
        const today = new Date().toISOString().split('T')[0];
        const [attendanceRes, employeesRes] = await Promise.all([
          axios.get(`http://localhost:5000/api/attendance?startDate=${today}&endDate=${today}`),
          axios.get('http://localhost:5000/api/employees?status=active')
        ]);
        if (attendanceRes.data.length > 0) {
          setTodayAttendance(attendanceRes.data[0]);
        }
        setEmployees(employeesRes.data.slice(0, 6));
      }
      setLoading(false);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      setLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  // Employee Dashboard
  if (user?.role === 'employee') {
    return (
      <div className="space-y-6">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-800">Dashboard</h1>
          <p className="text-gray-600 mt-1">Welcome to Dayflow HRMS</p>
        </div>

        {/* Quick Access Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Link
            to="/profile"
            className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 hover:shadow-md transition-shadow cursor-pointer"
          >
            <div className="flex items-center space-x-4">
              <div className="bg-blue-50 p-3 rounded-lg">
                <FiUser className="text-blue-600" size={24} />
              </div>
              <div>
                <h3 className="font-semibold text-gray-800">Profile</h3>
                <p className="text-sm text-gray-500">View your profile</p>
              </div>
            </div>
          </Link>

          <Link
            to="/attendance"
            className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 hover:shadow-md transition-shadow cursor-pointer"
          >
            <div className="flex items-center space-x-4">
              <div className="bg-green-50 p-3 rounded-lg">
                <FiClock className="text-green-600" size={24} />
              </div>
              <div>
                <h3 className="font-semibold text-gray-800">Attendance</h3>
                <p className="text-sm text-gray-500">Check in/out</p>
              </div>
            </div>
          </Link>

          <Link
            to="/leaves"
            className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 hover:shadow-md transition-shadow cursor-pointer"
          >
            <div className="flex items-center space-x-4">
              <div className="bg-orange-50 p-3 rounded-lg">
                <FiCalendar className="text-orange-600" size={24} />
              </div>
              <div>
                <h3 className="font-semibold text-gray-800">Leave Requests</h3>
                <p className="text-sm text-gray-500">Apply for leave</p>
              </div>
            </div>
          </Link>

          <button
            onClick={handleLogout}
            className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 hover:shadow-md transition-shadow cursor-pointer text-left"
          >
            <div className="flex items-center space-x-4">
              <div className="bg-red-50 p-3 rounded-lg">
                <FiLogOut className="text-red-600" size={24} />
              </div>
              <div>
                <h3 className="font-semibold text-gray-800">Logout</h3>
                <p className="text-sm text-gray-500">Sign out</p>
              </div>
            </div>
          </button>
        </div>

        {/* Employee List - Visible to all */}
        {employees.length > 0 && (
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-gray-800">Employees</h2>
              <Link
                to="/employees"
                className="text-blue-600 hover:text-blue-700 text-sm font-medium"
              >
                View All
              </Link>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {employees.slice(0, 6).map((emp) => (
                <div
                  key={emp._id}
                  className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer"
                  onClick={() => navigate(`/employees/${emp._id}`)}
                >
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center">
                      <FiUser className="text-gray-500" size={20} />
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-gray-800">
                        {emp.firstName} {emp.lastName}
                      </p>
                      <p className="text-sm text-gray-500">{emp.position}</p>
                    </div>
                    <div
                      className={`w-3 h-3 rounded-full ${
                        emp.status === 'active' ? 'bg-green-500' : 'bg-yellow-500'
                      }`}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Check In/Out Section */}
        {todayAttendance && (
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Today's Attendance</h2>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Check In</p>
                <p className="text-lg font-semibold text-gray-800">
                  {todayAttendance.checkIn
                    ? new Date(todayAttendance.checkIn).toLocaleTimeString()
                    : 'Not checked in'}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Check Out</p>
                <p className="text-lg font-semibold text-gray-800">
                  {todayAttendance.checkOut
                    ? new Date(todayAttendance.checkOut).toLocaleTimeString()
                    : 'Not checked out'}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Working Hours</p>
                <p className="text-lg font-semibold text-gray-800">
                  {todayAttendance.workingHours > 0
                    ? `${todayAttendance.workingHours.toFixed(2)}h`
                    : '-'}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  // Admin/HR Dashboard
  return (
    <div className="space-y-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-800">Dashboard</h1>
        <p className="text-gray-600 mt-1">Welcome to Dayflow HRMS</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Total Employees</p>
              <p className="text-2xl font-bold text-gray-800">{stats?.totalEmployees || 0}</p>
            </div>
            <div className="bg-blue-50 p-3 rounded-lg">
              <FiUsers className="text-blue-600" size={24} />
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Today Attendance</p>
              <p className="text-2xl font-bold text-gray-800">{stats?.todayAttendance || 0}</p>
            </div>
            <div className="bg-green-50 p-3 rounded-lg">
              <FiClock className="text-green-600" size={24} />
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Pending Leaves</p>
              <p className="text-2xl font-bold text-gray-800">{stats?.pendingLeaves || 0}</p>
            </div>
            <div className="bg-orange-50 p-3 rounded-lg">
              <FiCalendar className="text-orange-600" size={24} />
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Departments</p>
              <p className="text-2xl font-bold text-gray-800">{stats?.totalDepartments || 0}</p>
            </div>
            <div className="bg-purple-50 p-3 rounded-lg">
              <FiBriefcase className="text-purple-600" size={24} />
            </div>
          </div>
        </div>
      </div>

      {/* Employee List */}
      <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-gray-800">Employee List</h2>
          <Link
            to="/employees"
            className="text-blue-600 hover:text-blue-700 text-sm font-medium"
          >
            View All
          </Link>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {employees.slice(0, 6).map((emp) => (
            <div
              key={emp._id}
              className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer"
              onClick={() => navigate(`/employees/${emp._id}`)}
            >
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center">
                  <FiUser className="text-gray-500" size={20} />
                </div>
                <div className="flex-1">
                  <p className="font-medium text-gray-800">
                    {emp.firstName} {emp.lastName}
                  </p>
                  <p className="text-sm text-gray-500">{emp.position}</p>
                </div>
                <div
                  className={`w-3 h-3 rounded-full ${
                    emp.status === 'active' ? 'bg-green-500' : 'bg-yellow-500'
                  }`}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Attendance Records */}
      <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-gray-800">Today's Attendance Records</h2>
          <Link
            to="/attendance"
            className="text-blue-600 hover:text-blue-700 text-sm font-medium"
          >
            View All
          </Link>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-2 text-left">Name</th>
                <th className="px-4 py-2 text-left">Check In</th>
                <th className="px-4 py-2 text-left">Check Out</th>
                <th className="px-4 py-2 text-left">Work Hours</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {attendance.slice(0, 5).map((att) => (
                <tr key={att._id}>
                  <td className="px-4 py-2">
                    {att.employee?.firstName} {att.employee?.lastName}
                  </td>
                  <td className="px-4 py-2">
                    {att.checkIn ? new Date(att.checkIn).toLocaleTimeString() : '-'}
                  </td>
                  <td className="px-4 py-2">
                    {att.checkOut ? new Date(att.checkOut).toLocaleTimeString() : '-'}
                  </td>
                  <td className="px-4 py-2">{att.workingHours?.toFixed(2) || '-'}h</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Leave Approvals */}
      <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-gray-800">Leave Approvals</h2>
          <Link
            to="/leaves"
            className="text-blue-600 hover:text-blue-700 text-sm font-medium"
          >
            View All
          </Link>
        </div>
        <div className="space-y-3">
          {leaves.slice(0, 5).map((leave) => (
            <div
              key={leave._id}
              className="flex items-center justify-between p-3 border border-gray-200 rounded-lg"
            >
              <div>
                <p className="font-medium text-gray-800">
                  {leave.employee?.firstName} {leave.employee?.lastName}
                </p>
                <p className="text-sm text-gray-500">
                  {new Date(leave.startDate).toLocaleDateString()} -{' '}
                  {new Date(leave.endDate).toLocaleDateString()}
                </p>
              </div>
              <div className="flex items-center space-x-2">
                <button className="p-2 bg-green-100 text-green-700 rounded-lg hover:bg-green-200">
                  <FiCheckCircle size={18} />
                </button>
                <button className="p-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200">
                  <FiXCircle size={18} />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
