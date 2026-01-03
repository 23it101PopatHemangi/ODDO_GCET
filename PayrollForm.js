import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import axios from 'axios';
import { FiArrowLeft, FiSave } from 'react-icons/fi';

const PayrollForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [employees, setEmployees] = useState([]);
  const [formData, setFormData] = useState({
    employee: '',
    month: new Date().getMonth() + 1,
    year: new Date().getFullYear(),
    baseSalary: '',
    allowances: {
      housing: '',
      transport: '',
      medical: '',
      other: '',
    },
    deductions: {
      tax: '',
      insurance: '',
      loan: '',
      other: '',
    },
    overtime: {
      hours: '',
      rate: '',
    },
    bonuses: '',
    status: 'pending',
  });

  useEffect(() => {
    fetchEmployees();
    if (id) {
      fetchPayroll();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const fetchEmployees = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/employees');
      setEmployees(response.data);
    } catch (error) {
      console.error('Error fetching employees:', error);
    }
  };

  const fetchPayroll = async () => {
    try {
      const response = await axios.get(`http://localhost:5000/api/payroll/${id}`);
      const payroll = response.data;
      setFormData({
        employee: payroll.employee._id,
        month: payroll.month,
        year: payroll.year,
        baseSalary: payroll.baseSalary,
        allowances: {
          housing: payroll.allowances.housing || '',
          transport: payroll.allowances.transport || '',
          medical: payroll.allowances.medical || '',
          other: payroll.allowances.other || '',
        },
        deductions: {
          tax: payroll.deductions.tax || '',
          insurance: payroll.deductions.insurance || '',
          loan: payroll.deductions.loan || '',
          other: payroll.deductions.other || '',
        },
        overtime: {
          hours: payroll.overtime.hours || '',
          rate: payroll.overtime.rate || '',
        },
        bonuses: payroll.bonuses || '',
        status: payroll.status,
      });
    } catch (error) {
      console.error('Error fetching payroll:', error);
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
          [child]: value ? parseFloat(value) : '',
        },
      });
    } else {
      setFormData({
        ...formData,
        [name]: name === 'month' || name === 'year' ? parseInt(value) : value,
      });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const payload = {
        ...formData,
        allowances: {
          housing: parseFloat(formData.allowances.housing) || 0,
          transport: parseFloat(formData.allowances.transport) || 0,
          medical: parseFloat(formData.allowances.medical) || 0,
          other: parseFloat(formData.allowances.other) || 0,
        },
        deductions: {
          tax: parseFloat(formData.deductions.tax) || 0,
          insurance: parseFloat(formData.deductions.insurance) || 0,
          loan: parseFloat(formData.deductions.loan) || 0,
          other: parseFloat(formData.deductions.other) || 0,
        },
        overtime: {
          hours: parseFloat(formData.overtime.hours) || 0,
          rate: parseFloat(formData.overtime.rate) || 0,
        },
        bonuses: parseFloat(formData.bonuses) || 0,
        baseSalary: parseFloat(formData.baseSalary),
      };

      if (id) {
        await axios.put(`http://localhost:5000/api/payroll/${id}`, payload);
      } else {
        await axios.post('http://localhost:5000/api/payroll', payload);
      }
      navigate('/payroll');
    } catch (error) {
      alert('Error saving payroll: ' + error.response?.data?.message);
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-4">
        <Link
          to="/payroll"
          className="p-2 hover:bg-gray-100 rounded-lg transition"
        >
          <FiArrowLeft size={24} />
        </Link>
        <div>
          <h1 className="text-3xl font-bold text-gray-800">
            {id ? 'Edit Payroll' : 'Add New Payroll'}
          </h1>
          <p className="text-gray-600 mt-1">
            {id ? 'Update payroll information' : 'Create a new payroll record'}
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Employee *
            </label>
            <select
              name="employee"
              value={formData.employee}
              onChange={handleChange}
              required
              disabled={!!id}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none disabled:bg-gray-100"
            >
              <option value="">Select Employee</option>
              {employees.map((emp) => (
                <option key={emp._id} value={emp._id}>
                  {emp.firstName} {emp.lastName} - {emp.employeeId}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Month *
            </label>
            <select
              name="month"
              value={formData.month}
              onChange={handleChange}
              required
              disabled={!!id}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none disabled:bg-gray-100"
            >
              {Array.from({ length: 12 }, (_, i) => i + 1).map((m) => (
                <option key={m} value={m}>
                  {new Date(2000, m - 1).toLocaleString('default', { month: 'long' })}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Year *
            </label>
            <input
              type="number"
              name="year"
              value={formData.year}
              onChange={handleChange}
              required
              min="2020"
              max="2100"
              disabled={!!id}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none disabled:bg-gray-100"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Base Salary *
            </label>
            <input
              type="number"
              name="baseSalary"
              value={formData.baseSalary}
              onChange={handleChange}
              required
              min="0"
              step="0.01"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Status
            </label>
            <select
              name="status"
              value={formData.status}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
            >
              <option value="pending">Pending</option>
              <option value="processed">Processed</option>
              <option value="paid">Paid</option>
            </select>
          </div>
        </div>

        <div className="border-t border-gray-200 pt-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Allowances</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Housing</label>
              <input
                type="number"
                name="allowances.housing"
                value={formData.allowances.housing}
                onChange={handleChange}
                min="0"
                step="0.01"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Transport</label>
              <input
                type="number"
                name="allowances.transport"
                value={formData.allowances.transport}
                onChange={handleChange}
                min="0"
                step="0.01"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Medical</label>
              <input
                type="number"
                name="allowances.medical"
                value={formData.allowances.medical}
                onChange={handleChange}
                min="0"
                step="0.01"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Other</label>
              <input
                type="number"
                name="allowances.other"
                value={formData.allowances.other}
                onChange={handleChange}
                min="0"
                step="0.01"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
              />
            </div>
          </div>
        </div>

        <div className="border-t border-gray-200 pt-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Deductions</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Tax</label>
              <input
                type="number"
                name="deductions.tax"
                value={formData.deductions.tax}
                onChange={handleChange}
                min="0"
                step="0.01"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Insurance</label>
              <input
                type="number"
                name="deductions.insurance"
                value={formData.deductions.insurance}
                onChange={handleChange}
                min="0"
                step="0.01"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Loan</label>
              <input
                type="number"
                name="deductions.loan"
                value={formData.deductions.loan}
                onChange={handleChange}
                min="0"
                step="0.01"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Other</label>
              <input
                type="number"
                name="deductions.other"
                value={formData.deductions.other}
                onChange={handleChange}
                min="0"
                step="0.01"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
              />
            </div>
          </div>
        </div>

        <div className="border-t border-gray-200 pt-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Overtime & Bonuses</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Overtime Hours</label>
              <input
                type="number"
                name="overtime.hours"
                value={formData.overtime.hours}
                onChange={handleChange}
                min="0"
                step="0.01"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Overtime Rate</label>
              <input
                type="number"
                name="overtime.rate"
                value={formData.overtime.rate}
                onChange={handleChange}
                min="0"
                step="0.01"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Bonuses</label>
              <input
                type="number"
                name="bonuses"
                value={formData.bonuses}
                onChange={handleChange}
                min="0"
                step="0.01"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
              />
            </div>
          </div>
        </div>

        <div className="flex items-center justify-end space-x-4 pt-6 border-t border-gray-200">
          <Link
            to="/payroll"
            className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition"
          >
            Cancel
          </Link>
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:opacity-50 flex items-center space-x-2"
          >
            <FiSave size={18} />
            <span>{loading ? 'Saving...' : 'Save Payroll'}</span>
          </button>
        </div>
      </form>
    </div>
  );
};

export default PayrollForm;

