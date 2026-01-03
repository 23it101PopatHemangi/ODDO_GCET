import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FiClock, FiCheckCircle, FiXCircle } from 'react-icons/fi';
import { useAuth } from '../context/AuthContext';

const Attendance = () => {
  const { user } = useAuth();
  const [attendance, setAttendance] = useState([]);
  const [loading, setLoading] = useState(true);
  const [todayAttendance, setTodayAttendance] = useState(null);
  const [checkInLoading, setCheckInLoading] = useState(false);
  const [checkOutLoading, setCheckOutLoading] = useState(false);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  useEffect(() => {
    fetchTodayAttendance();
    fetchAttendance();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [startDate, endDate, user]);

  const fetchTodayAttendance = async () => {
    try {
      const today = new Date().toISOString().split('T')[0];
      const params = { startDate: today, endDate: today };
      if (user?.role === 'employee') {
        params.employee = user.employeeId || user.id || user._id;
      }
      const response = await axios.get('http://localhost:5000/api/attendance', { params });
      if (response.data.length > 0) {
        setTodayAttendance(response.data[0]);
      } else {
        setTodayAttendance(null);
      }
    } catch (error) {
      console.error('Error fetching today attendance:', error);
    }
  };

  const fetchAttendance = async () => {
    try {
      const params = {};
      if (startDate) params.startDate = startDate;
      if (endDate) params.endDate = endDate;
      if (user?.role === 'employee') {
        params.employee = user.employeeId || user.id;
      }

      const response = await axios.get('http://localhost:5000/api/attendance', { params });
      setAttendance(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching attendance:', error);
      setLoading(false);
    }
  };

  const handleCheckIn = async () => {
    setCheckInLoading(true);
    try {
      await axios.post('http://localhost:5000/api/attendance/checkin');
      fetchTodayAttendance();
      fetchAttendance();
    } catch (error) {
      alert('Error checking in: ' + error.response?.data?.message);
    } finally {
      setCheckInLoading(false);
    }
  };

  const handleCheckOut = async () => {
    setCheckOutLoading(true);
    try {
      await axios.post('http://localhost:5000/api/attendance/checkout');
      fetchTodayAttendance();
      fetchAttendance();
    } catch (error) {
      alert('Error checking out: ' + error.response?.data?.message);
    } finally {
      setCheckOutLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const canCheckIn = !todayAttendance || !todayAttendance.checkIn;
  const canCheckOut = todayAttendance && todayAttendance.checkIn && !todayAttendance.checkOut;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-800">Attendance</h1>
        <p className="text-gray-600 mt-1">Track your attendance</p>
      </div>

      {/* Check In/Out Card */}
      <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold text-gray-800 mb-2">Today's Attendance</h2>
            <p className="text-sm text-gray-600">
              {new Date().toLocaleDateString('en-US', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })}
            </p>
          </div>
          <div className="flex items-center space-x-4">
            {todayAttendance?.checkIn && (
              <div className="text-right">
                <p className="text-sm text-gray-600">Check In</p>
                <p className="text-lg font-semibold text-gray-800">
                  {new Date(todayAttendance.checkIn).toLocaleTimeString()}
                </p>
              </div>
            )}
            {todayAttendance?.checkOut && (
              <div className="text-right">
                <p className="text-sm text-gray-600">Check Out</p>
                <p className="text-lg font-semibold text-gray-800">
                  {new Date(todayAttendance.checkOut).toLocaleTimeString()}
                </p>
              </div>
            )}
            {canCheckIn && (
              <button
                onClick={handleCheckIn}
                disabled={checkInLoading}
                className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition disabled:opacity-50 flex items-center space-x-2"
              >
                <FiCheckCircle size={20} />
                <span>{checkInLoading ? 'Checking In...' : 'Check In'}</span>
              </button>
            )}
            {canCheckOut && (
              <button
                onClick={handleCheckOut}
                disabled={checkOutLoading}
                className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:opacity-50 flex items-center space-x-2"
              >
                <FiXCircle size={20} />
                <span>{checkOutLoading ? 'Checking Out...' : 'Check Out'}</span>
              </button>
            )}
          </div>
        </div>
        {todayAttendance?.workingHours > 0 && (
          <div className="mt-4 pt-4 border-t border-gray-200">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Working Hours</span>
              <span className="text-lg font-semibold text-gray-800">
                {todayAttendance.workingHours.toFixed(2)} hours
              </span>
            </div>
            {todayAttendance.overtime > 0 && (
              <div className="flex items-center justify-between mt-2">
                <span className="text-sm text-gray-600">Overtime</span>
                <span className="text-lg font-semibold text-orange-600">
                  {todayAttendance.overtime.toFixed(2)} hours
                </span>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm p-4 border border-gray-100">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Start Date</label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">End Date</label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
            />
          </div>
        </div>
      </div>

      {/* Attendance Records */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Employee
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Check In
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Check Out
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Hours
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {attendance.length === 0 ? (
                <tr>
                  <td colSpan="6" className="px-6 py-12 text-center">
                    <FiClock className="mx-auto text-gray-400 mb-2" size={48} />
                    <p className="text-gray-500">No attendance records found</p>
                  </td>
                </tr>
              ) : (
                attendance.map((record) => (
                  <tr key={record._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {new Date(record.date).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {record.employee?.firstName} {record.employee?.lastName}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {record.checkIn ? new Date(record.checkIn).toLocaleTimeString() : '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {record.checkOut ? new Date(record.checkOut).toLocaleTimeString() : '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {record.workingHours > 0 ? `${record.workingHours.toFixed(2)}h` : '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-2 py-1 text-xs font-medium rounded-full ${
                          record.status === 'present'
                            ? 'bg-green-100 text-green-800'
                            : record.status === 'late'
                            ? 'bg-yellow-100 text-yellow-800'
                            : 'bg-red-100 text-red-800'
                        }`}
                      >
                        {record.status}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Attendance;

