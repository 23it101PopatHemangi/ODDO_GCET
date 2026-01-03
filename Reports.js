import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';

const Reports = () => {
  const [activeTab, setActiveTab] = useState('attendance');
  const [attendanceReport, setAttendanceReport] = useState([]);
  const [leaveReport, setLeaveReport] = useState([]);
  const [payrollReport, setPayrollReport] = useState([]);
  const [departmentReport, setDepartmentReport] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState({
    startDate: '',
    endDate: '',
    month: new Date().getMonth() + 1,
    year: new Date().getFullYear(),
    department: '',
  });

  useEffect(() => {
    fetchReports();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab, filters]);

  const fetchReports = async () => {
    setLoading(true);
    try {
      switch (activeTab) {
        case 'attendance':
          const attRes = await axios.get('http://localhost:5000/api/reports/attendance', {
            params: {
              startDate: filters.startDate,
              endDate: filters.endDate,
              department: filters.department,
            },
          });
          setAttendanceReport(attRes.data);
          break;
        case 'leaves':
          const leaveRes = await axios.get('http://localhost:5000/api/reports/leaves', {
            params: {
              startDate: filters.startDate,
              endDate: filters.endDate,
            },
          });
          setLeaveReport(leaveRes.data);
          break;
        case 'payroll':
          const payrollRes = await axios.get('http://localhost:5000/api/reports/payroll', {
            params: {
              month: filters.month,
              year: filters.year,
              department: filters.department,
            },
          });
          setPayrollReport(payrollRes.data);
          break;
        case 'departments':
          const deptRes = await axios.get('http://localhost:5000/api/reports/departments');
          setDepartmentReport(deptRes.data);
          break;
        default:
          break;
      }
    } catch (error) {
      console.error('Error fetching reports:', error);
    } finally {
      setLoading(false);
    }
  };

  const tabs = [
    { id: 'attendance', label: 'Attendance Report' },
    { id: 'leaves', label: 'Leave Report' },
    { id: 'payroll', label: 'Payroll Report' },
    { id: 'departments', label: 'Department Report' },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-800">Reports</h1>
        <p className="text-gray-600 mt-1">View and analyze HR data</p>
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

        {/* Filters */}
        <div className="p-4 border-b border-gray-200">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {activeTab === 'attendance' || activeTab === 'leaves' ? (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Start Date</label>
                  <input
                    type="date"
                    value={filters.startDate}
                    onChange={(e) => setFilters({ ...filters, startDate: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">End Date</label>
                  <input
                    type="date"
                    value={filters.endDate}
                    onChange={(e) => setFilters({ ...filters, endDate: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                  />
                </div>
              </>
            ) : activeTab === 'payroll' ? (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Month</label>
                  <select
                    value={filters.month}
                    onChange={(e) => setFilters({ ...filters, month: parseInt(e.target.value) })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                  >
                    {Array.from({ length: 12 }, (_, i) => i + 1).map((m) => (
                      <option key={m} value={m}>
                        {new Date(2000, m - 1).toLocaleString('default', { month: 'long' })}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Year</label>
                  <input
                    type="number"
                    value={filters.year}
                    onChange={(e) => setFilters({ ...filters, year: parseInt(e.target.value) })}
                    min="2020"
                    max="2100"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                  />
                </div>
              </>
            ) : null}
          </div>
        </div>

        {/* Report Content */}
        <div className="p-6">
          {loading ? (
            <div className="flex items-center justify-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
          ) : (
            <>
              {activeTab === 'attendance' && (
                <div className="space-y-6">
                  <div className="bg-white rounded-lg p-4 border border-gray-200">
                    <ResponsiveContainer width="100%" height={400}>
                      <BarChart data={attendanceReport}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        <Bar dataKey="presentDays" fill="#10b981" name="Present Days" />
                        <Bar dataKey="absentDays" fill="#ef4444" name="Absent Days" />
                        <Bar dataKey="lateDays" fill="#f59e0b" name="Late Days" />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-4 py-2 text-left">Employee</th>
                          <th className="px-4 py-2 text-left">Present</th>
                          <th className="px-4 py-2 text-left">Absent</th>
                          <th className="px-4 py-2 text-left">Late</th>
                          <th className="px-4 py-2 text-left">Total Hours</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200">
                        {attendanceReport.map((item, idx) => (
                          <tr key={idx}>
                            <td className="px-4 py-2">{item.name}</td>
                            <td className="px-4 py-2">{item.presentDays}</td>
                            <td className="px-4 py-2">{item.absentDays}</td>
                            <td className="px-4 py-2">{item.lateDays}</td>
                            <td className="px-4 py-2">{item.totalHours.toFixed(2)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {activeTab === 'leaves' && (
                <div className="space-y-6">
                  <div className="bg-white rounded-lg p-4 border border-gray-200">
                    <ResponsiveContainer width="100%" height={400}>
                      <BarChart data={leaveReport}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        <Bar dataKey="approvedLeaves" fill="#10b981" name="Approved" />
                        <Bar dataKey="pendingLeaves" fill="#f59e0b" name="Pending" />
                        <Bar dataKey="rejectedLeaves" fill="#ef4444" name="Rejected" />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-4 py-2 text-left">Employee</th>
                          <th className="px-4 py-2 text-left">Total</th>
                          <th className="px-4 py-2 text-left">Approved</th>
                          <th className="px-4 py-2 text-left">Pending</th>
                          <th className="px-4 py-2 text-left">Rejected</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200">
                        {leaveReport.map((item, idx) => (
                          <tr key={idx}>
                            <td className="px-4 py-2">{item.name}</td>
                            <td className="px-4 py-2">{item.totalLeaves}</td>
                            <td className="px-4 py-2">{item.approvedLeaves}</td>
                            <td className="px-4 py-2">{item.pendingLeaves}</td>
                            <td className="px-4 py-2">{item.rejectedLeaves}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {activeTab === 'payroll' && (
                <div className="space-y-6">
                  <div className="bg-white rounded-lg p-4 border border-gray-200">
                    <ResponsiveContainer width="100%" height={400}>
                      <BarChart data={payrollReport}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        <Bar dataKey="grossSalary" fill="#3b82f6" name="Gross Salary" />
                        <Bar dataKey="netSalary" fill="#10b981" name="Net Salary" />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-4 py-2 text-left">Employee</th>
                          <th className="px-4 py-2 text-left">Base Salary</th>
                          <th className="px-4 py-2 text-left">Gross Salary</th>
                          <th className="px-4 py-2 text-left">Net Salary</th>
                          <th className="px-4 py-2 text-left">Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200">
                        {payrollReport.map((item, idx) => (
                          <tr key={idx}>
                            <td className="px-4 py-2">{item.name}</td>
                            <td className="px-4 py-2">${item.baseSalary.toLocaleString()}</td>
                            <td className="px-4 py-2">${item.grossSalary.toLocaleString()}</td>
                            <td className="px-4 py-2">${item.netSalary.toLocaleString()}</td>
                            <td className="px-4 py-2">
                              <span className="px-2 py-1 text-xs rounded-full bg-blue-100 text-blue-800">
                                {item.status}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {activeTab === 'departments' && (
                <div className="space-y-6">
                  <div className="bg-white rounded-lg p-4 border border-gray-200">
                    <ResponsiveContainer width="100%" height={400}>
                      <BarChart data={departmentReport}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        <Bar dataKey="employeeCount" fill="#3b82f6" name="Total Employees" />
                        <Bar dataKey="activeEmployees" fill="#10b981" name="Active Employees" />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {departmentReport.map((dept, idx) => (
                      <div key={idx} className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                        <h3 className="font-semibold text-gray-800 mb-2">{dept.name}</h3>
                        <div className="space-y-1 text-sm">
                          <div className="flex justify-between">
                            <span className="text-gray-600">Total Employees:</span>
                            <span className="font-medium">{dept.employeeCount}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Active:</span>
                            <span className="font-medium text-green-600">{dept.activeEmployees}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default Reports;

