import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { FiPlus, FiCalendar, FiCheckCircle, FiXCircle } from 'react-icons/fi';
import { useAuth } from '../context/AuthContext';

const Leaves = () => {
  const { user } = useAuth();
  const [leaves, setLeaves] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState('');

  useEffect(() => {
    fetchLeaves();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filterStatus]);

  const fetchLeaves = async () => {
    try {
      const params = {};
      if (filterStatus) params.status = filterStatus;

      const response = await axios.get('http://localhost:5000/api/leaves', { params });
      setLeaves(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching leaves:', error);
      setLoading(false);
    }
  };

  const handleApprove = async (id) => {
    try {
      await axios.put(`http://localhost:5000/api/leaves/${id}`, { status: 'approved' });
      fetchLeaves();
    } catch (error) {
      alert('Error approving leave: ' + error.response?.data?.message);
    }
  };

  const handleReject = async (id) => {
    try {
      await axios.put(`http://localhost:5000/api/leaves/${id}`, { status: 'rejected' });
      fetchLeaves();
    } catch (error) {
      alert('Error rejecting leave: ' + error.response?.data?.message);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const canManage = ['admin', 'hr', 'manager'].includes(user?.role);

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Leave Requests</h1>
          <p className="text-gray-600 mt-1">Manage leave requests</p>
        </div>
        <Link
          to="/leaves/new"
          className="mt-4 md:mt-0 inline-flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
        >
          <FiPlus size={20} />
          <span>Request Leave</span>
        </Link>
      </div>

      {/* Filter */}
      <div className="bg-white rounded-xl shadow-sm p-4 border border-gray-100">
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="w-full md:w-auto px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
        >
          <option value="">All Status</option>
          <option value="pending">Pending</option>
          <option value="approved">Approved</option>
          <option value="rejected">Rejected</option>
          <option value="cancelled">Cancelled</option>
        </select>
      </div>

      {/* Leaves List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {leaves.length === 0 ? (
          <div className="col-span-full bg-white rounded-xl shadow-sm p-12 border border-gray-100 text-center">
            <FiCalendar className="mx-auto text-gray-400 mb-4" size={48} />
            <p className="text-gray-500">No leave requests found</p>
          </div>
        ) : (
          leaves.map((leave) => (
            <div
              key={leave._id}
              className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="text-lg font-semibold text-gray-800">
                    {leave.employee?.firstName} {leave.employee?.lastName}
                  </h3>
                  <p className="text-sm text-gray-500">{leave.employee?.employeeId}</p>
                </div>
                <span
                  className={`px-2 py-1 text-xs font-medium rounded-full ${
                    leave.status === 'approved'
                      ? 'bg-green-100 text-green-800'
                      : leave.status === 'rejected'
                      ? 'bg-red-100 text-red-800'
                      : leave.status === 'pending'
                      ? 'bg-yellow-100 text-yellow-800'
                      : 'bg-gray-100 text-gray-800'
                  }`}
                >
                  {leave.status}
                </span>
              </div>
              <div className="space-y-2 mb-4">
                <div className="flex items-center text-sm text-gray-600">
                  <FiCalendar className="mr-2" size={16} />
                  <span>
                    {new Date(leave.startDate).toLocaleDateString()} -{' '}
                    {new Date(leave.endDate).toLocaleDateString()}
                  </span>
                </div>
                <div className="text-sm">
                  <span className="text-gray-600">Type: </span>
                  <span className="font-medium text-gray-800 capitalize">{leave.leaveType}</span>
                </div>
                <div className="text-sm">
                  <span className="text-gray-600">Days: </span>
                  <span className="font-medium text-gray-800">{leave.days}</span>
                </div>
                <p className="text-sm text-gray-600 mt-2">{leave.reason}</p>
              </div>
              {canManage && leave.status === 'pending' && (
                <div className="flex items-center space-x-2 pt-4 border-t border-gray-200">
                  <button
                    onClick={() => handleApprove(leave._id)}
                    className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition flex items-center justify-center space-x-2"
                  >
                    <FiCheckCircle size={18} />
                    <span>Approve</span>
                  </button>
                  <button
                    onClick={() => handleReject(leave._id)}
                    className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition flex items-center justify-center space-x-2"
                  >
                    <FiXCircle size={18} />
                    <span>Reject</span>
                  </button>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default Leaves;

