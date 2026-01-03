import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { FiPlus, FiEdit, FiTrash2, FiSearch, FiUsers, FiUser } from 'react-icons/fi';
import { useAuth } from '../context/AuthContext';

const Employees = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchEmployees();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchTerm]);

  const fetchEmployees = async () => {
    try {
      const params = {};
      if (searchTerm) params.search = searchTerm;

      const response = await axios.get('http://localhost:5000/api/employees', { params });
      setEmployees(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching employees:', error);
      setLoading(false);
    }
  };

  const handleDelete = async (id, e) => {
    e.stopPropagation();
    if (window.confirm('Are you sure you want to delete this employee?')) {
      try {
        await axios.delete(`http://localhost:5000/api/employees/${id}`);
        fetchEmployees();
      } catch (error) {
        alert('Error deleting employee: ' + error.response?.data?.message);
      }
    }
  };

  const getStatusIndicator = (employee) => {
    // This would need to check actual attendance/leave status
    // For now, using employee status
    if (employee.status === 'on-leave') {
      return (
        <div className="absolute top-2 right-2">
          <svg className="w-5 h-5 text-blue-500" fill="currentColor" viewBox="0 0 20 20">
            <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" />
          </svg>
        </div>
      );
    } else if (employee.status === 'active') {
      return (
        <div className="absolute top-2 right-2 w-3 h-3 bg-green-500 rounded-full"></div>
      );
    } else {
      return (
        <div className="absolute top-2 right-2 w-3 h-3 bg-yellow-500 rounded-full"></div>
      );
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const canManage = ['admin', 'hr'].includes(user?.role);

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Employees</h1>
          <p className="text-gray-600 mt-1">Manage your employees</p>
        </div>
        {canManage && (
          <Link
            to="/employees/new"
            className="mt-4 md:mt-0 inline-flex items-center space-x-2 bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition"
          >
            <FiPlus size={20} />
            <span>NEW</span>
          </Link>
        )}
      </div>

      {/* Search */}
      {canManage && (
        <div className="bg-white rounded-xl shadow-sm p-4 border border-gray-100">
          <div className="relative">
            <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Search employees..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
            />
          </div>
        </div>
      )}

      {/* Employee Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {employees.length === 0 ? (
          <div className="col-span-full bg-white rounded-xl shadow-sm p-12 border border-gray-100 text-center">
            <FiUsers className="mx-auto text-gray-400 mb-4" size={48} />
            <p className="text-gray-500">No employees found</p>
          </div>
        ) : (
          employees.map((employee) => (
            <div
              key={employee._id}
              className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 hover:shadow-md transition-shadow cursor-pointer relative"
              onClick={() => navigate(`/employees/${employee._id}`)}
            >
              {getStatusIndicator(employee)}
              <div className="flex flex-col items-center text-center">
                <div className="w-20 h-20 bg-gray-200 rounded-full flex items-center justify-center mb-4">
                  <FiUser className="text-gray-500" size={32} />
                </div>
                <h3 className="font-semibold text-gray-800 mb-1">
                  {employee.firstName} {employee.lastName}
                </h3>
                <p className="text-sm text-gray-500 mb-2">{employee.position}</p>
                <p className="text-xs text-gray-400">{employee.department?.name || 'No Department'}</p>
              </div>
              {canManage && (
                <div className="flex items-center justify-center space-x-2 mt-4 pt-4 border-t border-gray-200">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      navigate(`/employees/${employee._id}/edit`);
                    }}
                    className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition"
                  >
                    <FiEdit size={18} />
                  </button>
                  <button
                    onClick={(e) => handleDelete(employee._id, e)}
                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition"
                  >
                    <FiTrash2 size={18} />
                  </button>
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {/* Status Legend */}
      <div className="bg-white rounded-xl shadow-sm p-4 border border-gray-100">
        <h3 className="text-sm font-semibold text-gray-700 mb-2">Status Indicators:</h3>
        <div className="flex flex-wrap gap-4 text-sm">
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-green-500 rounded-full"></div>
            <span className="text-gray-600">Employee is present in the office</span>
          </div>
          <div className="flex items-center space-x-2">
            <svg className="w-5 h-5 text-blue-500" fill="currentColor" viewBox="0 0 20 20">
              <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" />
            </svg>
            <span className="text-gray-600">Employee is on leave</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
            <span className="text-gray-600">Employee is absent (not applied time off)</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Employees;
