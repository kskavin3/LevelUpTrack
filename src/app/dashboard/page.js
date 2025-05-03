import React from 'react';
import EmployeeProgressDashboard from './EmployeeProgressDashboard';

export default function DashboardPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-8 px-4 sm:px-6 md:px-8">
      <h1 className="text-3xl font-semibold text-gray-800 mb-6">Team Progress</h1>
      <EmployeeProgressDashboard />
    </div>
  );
} 