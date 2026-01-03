import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import { FiUser, FiEdit2, FiSave, FiX } from 'react-icons/fi';
import { useAuth } from '../context/AuthContext';

const EmployeeProfile = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('resume');
  const [employee, setEmployee] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState({});

  useEffect(() => {
    fetchEmployee();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const fetchEmployee = async () => {
    try {
      // If viewing own profile, get from user context or fetch by user's employeeId
      if (!id) {
        // Get current user's employee data
        try {
          const userRes = await axios.get('http://localhost:5000/api/auth/me');
          const employeeId = userRes.data.user?.employee?._id || userRes.data.user?.employeeId;
          if (employeeId) {
            const response = await axios.get(`http://localhost:5000/api/employees/${employeeId}`);
            setEmployee(response.data);
            setFormData(response.data);
          }
        } catch (err) {
          console.error('Error fetching user employee:', err);
        }
      } else {
        // Viewing specific employee
        const response = await axios.get(`http://localhost:5000/api/employees/${id}`);
        setEmployee(response.data);
        setFormData(response.data);
      }
      setLoading(false);
    } catch (error) {
      console.error('Error fetching employee:', error);
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setFormData({
        ...formData,
        [parent]: {
          ...formData[parent],
          [child]: value,
        },
      });
    } else {
      setFormData({
        ...formData,
        [name]: value,
      });
    }
  };

  const handleSave = async () => {
    try {
      await axios.put(`http://localhost:5000/api/employees/${employee._id}`, formData);
      setEmployee(formData);
      setEditing(false);
    } catch (error) {
      alert('Error saving profile: ' + error.response?.data?.message);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!employee) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Employee not found</p>
      </div>
    );
  }

  const isAdmin = ['admin', 'hr'].includes(user?.role);
  const isOwnProfile = user?.employee?._id === employee._id || user?.employeeId === employee._id;
  const canEdit = isAdmin || (isOwnProfile && !editing);

  const tabs = [
    { id: 'resume', label: 'Resume' },
    { id: 'private', label: 'Private Info' },
    { id: 'salary', label: 'Salary Info' },
    { id: 'security', label: 'Security' },
  ];

  return (
    <div className="space-y-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-800">My Profile</h1>
        <p className="text-gray-600 mt-1">View and manage your profile</p>
      </div>

      {/* Profile Header */}
      <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
        <div className="flex items-start space-x-6">
          <div className="relative">
            <div className="w-24 h-24 bg-gray-200 rounded-full flex items-center justify-center">
              <FiUser className="text-gray-500" size={40} />
            </div>
            {canEdit && (
              <button className="absolute bottom-0 right-0 p-2 bg-blue-600 text-white rounded-full hover:bg-blue-700">
                <FiEdit2 size={16} />
              </button>
            )}
          </div>
          <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm text-gray-500">My Name</label>
              <input
                type="text"
                value={formData.firstName + ' ' + formData.lastName}
                disabled={!editing}
                className="w-full px-3 py-2 border-b border-gray-300 focus:border-blue-500 outline-none disabled:bg-transparent"
              />
            </div>
            <div>
              <label className="text-sm text-gray-500">Login ID</label>
              <input
                type="text"
                value={employee.loginId || employee.employeeId}
                disabled
                className="w-full px-3 py-2 border-b border-gray-300 outline-none disabled:bg-transparent"
              />
            </div>
            <div>
              <label className="text-sm text-gray-500">Email</label>
              <input
                type="email"
                name="email"
                value={formData.email || ''}
                onChange={handleChange}
                disabled={!editing}
                className="w-full px-3 py-2 border-b border-gray-300 focus:border-blue-500 outline-none disabled:bg-transparent"
              />
            </div>
            <div>
              <label className="text-sm text-gray-500">Mobile</label>
              <input
                type="tel"
                name="phone"
                value={formData.phone || ''}
                onChange={handleChange}
                disabled={!editing}
                className="w-full px-3 py-2 border-b border-gray-300 focus:border-blue-500 outline-none disabled:bg-transparent"
              />
            </div>
            <div>
              <label className="text-sm text-gray-500">Company</label>
              <input
                type="text"
                value={employee.companyName || 'N/A'}
                disabled
                className="w-full px-3 py-2 border-b border-gray-300 outline-none disabled:bg-transparent"
              />
            </div>
            <div>
              <label className="text-sm text-gray-500">Department</label>
              <input
                type="text"
                value={employee.department?.name || 'N/A'}
                disabled
                className="w-full px-3 py-2 border-b border-gray-300 outline-none disabled:bg-transparent"
              />
            </div>
            <div>
              <label className="text-sm text-gray-500">Manager</label>
              <input
                type="text"
                value="N/A"
                disabled
                className="w-full px-3 py-2 border-b border-gray-300 outline-none disabled:bg-transparent"
              />
            </div>
            <div>
              <label className="text-sm text-gray-500">Location</label>
              <input
                type="text"
                value="N/A"
                disabled
                className="w-full px-3 py-2 border-b border-gray-300 outline-none disabled:bg-transparent"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100">
        <div className="border-b border-gray-200">
          <nav className="flex -mb-px">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-6 py-4 text-sm font-medium border-b-2 transition ${
                  activeTab === tab.id
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        {/* Tab Content */}
        <div className="p-6">
          {activeTab === 'resume' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold text-gray-800">About</h3>
                  {canEdit && <FiEdit2 className="text-gray-400 cursor-pointer" size={18} />}
                </div>
                <p className="text-gray-600 text-sm">Lorem ipsum dolor sit amet, consectetur adipiscing elit.</p>
              </div>
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold text-gray-800">What I love about my job</h3>
                  {canEdit && <FiEdit2 className="text-gray-400 cursor-pointer" size={18} />}
                </div>
                <p className="text-gray-600 text-sm">Lorem ipsum dolor sit amet, consectetur adipiscing elit.</p>
              </div>
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold text-gray-800">My interests and hobbies</h3>
                  {canEdit && <FiEdit2 className="text-gray-400 cursor-pointer" size={18} />}
                </div>
                <p className="text-gray-600 text-sm">Lorem ipsum dolor sit amet, consectetur adipiscing elit.</p>
              </div>
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold text-gray-800">Skills</h3>
                  {canEdit && (
                    <button className="text-blue-600 text-sm">+ Add skills</button>
                  )}
                </div>
                <div className="space-y-2">
                  {employee.skills?.map((skill, idx) => (
                    <span key={idx} className="inline-block px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm mr-2">
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold text-gray-800">Certification</h3>
                  {canEdit && (
                    <button className="text-blue-600 text-sm">+ Add certification</button>
                  )}
                </div>
                <div className="space-y-2">
                  {employee.qualifications?.map((qual, idx) => (
                    <div key={idx} className="p-3 bg-gray-50 rounded-lg">
                      <p className="font-medium text-sm">{qual.degree}</p>
                      <p className="text-xs text-gray-500">{qual.institution} - {qual.year}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'private' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Date of Birth</label>
                <input
                  type="date"
                  name="dateOfBirth"
                  value={formData.dateOfBirth ? new Date(formData.dateOfBirth).toISOString().split('T')[0] : ''}
                  onChange={handleChange}
                  disabled={!editing}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none disabled:bg-gray-100"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Date of Joining</label>
                <input
                  type="date"
                  name="hireDate"
                  value={formData.hireDate ? new Date(formData.hireDate).toISOString().split('T')[0] : ''}
                  onChange={handleChange}
                  disabled={!editing}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none disabled:bg-gray-100"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Residing Address</label>
                <input
                  type="text"
                  name="address.street"
                  value={formData.address?.street || ''}
                  onChange={handleChange}
                  disabled={!editing}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none disabled:bg-gray-100"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Nationality</label>
                <input
                  type="text"
                  name="address.country"
                  value={formData.address?.country || ''}
                  onChange={handleChange}
                  disabled={!editing}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none disabled:bg-gray-100"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Personal Email</label>
                <input
                  type="email"
                  value={formData.email || ''}
                  disabled
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg outline-none disabled:bg-gray-100"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Gender</label>
                <select
                  disabled={!editing}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none disabled:bg-gray-100"
                >
                  <option>Select Gender</option>
                  <option>Male</option>
                  <option>Female</option>
                  <option>Other</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Marital Status</label>
                <select
                  disabled={!editing}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none disabled:bg-gray-100"
                >
                  <option>Select Status</option>
                  <option>Single</option>
                  <option>Married</option>
                  <option>Divorced</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Bank Details</label>
                <div className="space-y-2">
                  <input
                    type="text"
                    placeholder="Account Number"
                    disabled={!editing}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none disabled:bg-gray-100"
                  />
                  <input
                    type="text"
                    placeholder="Bank Name"
                    disabled={!editing}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none disabled:bg-gray-100"
                  />
                  <input
                    type="text"
                    placeholder="IFSC Code"
                    disabled={!editing}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none disabled:bg-gray-100"
                  />
                </div>
              </div>
            </div>
          )}

          {activeTab === 'salary' && (
            <div className="space-y-6">
              {!isAdmin && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                  <p className="text-sm text-blue-800">
                    <strong>Note:</strong> This is a read-only view of your salary information. Only administrators can modify salary details.
                  </p>
                </div>
              )}
              {isAdmin && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
                  <p className="text-sm text-yellow-800">
                    <strong>Note:</strong> This section allows you to define and manage all salary-related details for an employee, including wage type, working schedule, salary components, and benefits. Salary components should be calculated automatically based on the defined Wage.
                  </p>
                </div>
              )}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Month Wage</label>
                  <input
                    type="number"
                    value={employee.salary || 0}
                    disabled={!editing || !isAdmin}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none disabled:bg-gray-100"
                  />
                  <p className="text-xs text-gray-500 mt-1">/ Month</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Yearly wage</label>
                  <input
                    type="number"
                    value={(employee.salary || 0) * 12}
                    disabled
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg outline-none disabled:bg-gray-100"
                  />
                  <p className="text-xs text-gray-500 mt-1">/ Yearly</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">No of working days in a week</label>
                  <input
                    type="number"
                    defaultValue="5"
                    disabled={!editing || !isAdmin}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none disabled:bg-gray-100"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Break Time</label>
                  <input
                    type="number"
                    defaultValue="1"
                    disabled={!editing || !isAdmin}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none disabled:bg-gray-100"
                  />
                  <p className="text-xs text-gray-500 mt-1">/hrs</p>
                </div>
              </div>
              <div className="mt-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Salary Components</h3>
                <div className="space-y-4">
                  <div className="border border-gray-200 rounded-lg p-4">
                    <div className="flex justify-between items-center mb-2">
                      <div>
                        <h4 className="font-medium">Basic Salary</h4>
                        <p className="text-xs text-gray-500">Define Basic salary from company can't compute it based on monthly wages</p>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold">₹{((employee.salary || 0) * 0.6).toFixed(2)} / month</p>
                        <p className="text-xs text-gray-500">60.00%</p>
                      </div>
                    </div>
                  </div>
                  <div className="border border-gray-200 rounded-lg p-4">
                    <div className="flex justify-between items-center mb-2">
                      <div>
                        <h4 className="font-medium">House Rent Allowance</h4>
                        <p className="text-xs text-gray-500">HRA provided to employees 60% of the basic salary</p>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold">₹{((employee.salary || 0) * 0.36).toFixed(2)} / month</p>
                        <p className="text-xs text-gray-500">60.00%</p>
                      </div>
                    </div>
                  </div>
                  {/* Add more salary components as needed */}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'security' && (
            <div className="space-y-6">
              <div>
                <h3 className="font-semibold text-gray-800 mb-4">Change Password</h3>
                <div className="space-y-4 max-w-md">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Current Password</label>
                    <input
                      type="password"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">New Password</label>
                    <input
                      type="password"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Confirm New Password</label>
                    <input
                      type="password"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                    />
                  </div>
                  <button className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                    Change Password
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Edit Button */}
      {canEdit && (
        <div className="flex justify-end space-x-4">
          {editing ? (
            <>
              <button
                onClick={() => {
                  setEditing(false);
                  setFormData(employee);
                }}
                className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 flex items-center space-x-2"
              >
                <FiX size={18} />
                <span>Cancel</span>
              </button>
              <button
                onClick={handleSave}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center space-x-2"
              >
                <FiSave size={18} />
                <span>Save</span>
              </button>
            </>
          ) : (
            <button
              onClick={() => setEditing(true)}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center space-x-2"
            >
              <FiEdit2 size={18} />
              <span>Edit Profile</span>
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default EmployeeProfile;

