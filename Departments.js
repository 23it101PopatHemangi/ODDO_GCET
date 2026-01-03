import React from 'react';
import { Link } from 'react-router-dom';

const Departments = () => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-800">Departments (Removed)</h1>
        <p className="text-gray-600 mt-1">The Departments page has been removed. Use the dashboard or employees pages instead.</p>
      </div>
      <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
        <p className="text-gray-700">If you need department management, please contact the administrator.</p>
        <div className="mt-4">
          <Link to="/dashboard" className="inline-block px-4 py-2 bg-blue-600 text-white rounded-lg">Go to Dashboard</Link>
        </div>
      </div>
    </div>
  );
};

export default Departments;

