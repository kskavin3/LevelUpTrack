import React from 'react';
import EmployeeProgressDashboard from './EmployeeProgressDashboard';

export default function DashboardPage() {
  return (
    <div className="container mx-auto py-8 px-4">
      <h1 className="text-3xl font-bold mb-6">Employee Progress Dashboard</h1>
      <EmployeeProgressDashboard />
    </div>
  );
} 