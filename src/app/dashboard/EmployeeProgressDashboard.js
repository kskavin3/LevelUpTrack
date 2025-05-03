'use client';

import React from 'react';
import { 
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';

// Dummy data for 10 employees
const employeeData = [
  { name: 'John Doe', tasks_completed: 12, goals_achieved: 3, progress: 78 },
  { name: 'Jane Smith', tasks_completed: 20, goals_achieved: 5, progress: 92 },
  { name: 'Michael Brown', tasks_completed: 8, goals_achieved: 2, progress: 45 },
  { name: 'Sarah Johnson', tasks_completed: 15, goals_achieved: 4, progress: 82 },
  { name: 'David Williams', tasks_completed: 10, goals_achieved: 2, progress: 65 },
  { name: 'Emily Davis', tasks_completed: 18, goals_achieved: 4, progress: 88 },
  { name: 'Robert Miller', tasks_completed: 6, goals_achieved: 1, progress: 30 },
  { name: 'Jennifer Wilson', tasks_completed: 14, goals_achieved: 3, progress: 75 },
  { name: 'Thomas Moore', tasks_completed: 9, goals_achieved: 2, progress: 50 },
  { name: 'Lisa Taylor', tasks_completed: 16, goals_achieved: 4, progress: 85 }
];

// Calculate summary metrics
const totalEmployees = employeeData.length;
const averageProgress = Math.round(employeeData.reduce((sum, emp) => sum + emp.progress, 0) / totalEmployees);
const totalTasksCompleted = employeeData.reduce((sum, emp) => sum + emp.tasks_completed, 0);
const totalGoalsAchieved = employeeData.reduce((sum, emp) => sum + emp.goals_achieved, 0);

// Card component for summary metrics
const SummaryCard = ({ title, value, description, icon }) => (
  <div className="bg-white p-6 rounded-lg shadow-md">
    <div className="flex items-center justify-between">
      <div>
        <p className="text-sm text-gray-500">{title}</p>
        <h3 className="text-2xl font-bold">{value}</h3>
        <p className="text-xs text-gray-400 mt-1">{description}</p>
      </div>
      <div className="text-3xl text-indigo-500">{icon}</div>
    </div>
  </div>
);

export default function EmployeeProgressDashboard() {
  return (
    <div className="grid grid-cols-1 gap-8">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <SummaryCard 
          title="Total Employees" 
          value={totalEmployees} 
          description="Active employees tracked" 
          icon="👥"
        />
        <SummaryCard 
          title="Average Progress" 
          value={`${averageProgress}%`} 
          description="Overall completion rate" 
          icon="📊"
        />
        <SummaryCard 
          title="Tasks Completed" 
          value={totalTasksCompleted} 
          description="Total tasks finished" 
          icon="✅"
        />
        <SummaryCard 
          title="Goals Achieved" 
          value={totalGoalsAchieved} 
          description="Total goals reached" 
          icon="🎯"
        />
      </div>

      <div className="bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-xl font-semibold mb-4">Employee Progress Overview</h2>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={employeeData}
              margin={{ top: 20, right: 30, left: 20, bottom: 70 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" angle={-45} textAnchor="end" height={70} />
              <YAxis label={{ value: 'Progress (%)', angle: -90, position: 'insideLeft' }} />
              <Tooltip />
              <Legend />
              <Bar dataKey="progress" fill="#4F46E5" name="Progress (%)" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-xl font-semibold mb-4">Employee Details</h2>
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white">
            <thead className="bg-gray-100 border-b">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tasks Completed</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Goals Achieved</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Progress</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {employeeData.map((employee, index) => (
                <tr key={index}>
                  <td className="px-6 py-4 whitespace-nowrap">{employee.name}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{employee.tasks_completed}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{employee.goals_achieved}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="w-full bg-gray-200 rounded-full h-2.5">
                      <div 
                        className={`h-2.5 rounded-full ${
                          employee.progress >= 80 ? 'bg-green-500' : 
                          employee.progress >= 50 ? 'bg-yellow-500' : 'bg-red-500'
                        }`}
                        style={{ width: `${employee.progress}%` }}
                      ></div>
                    </div>
                    <span className="text-sm ml-2">{employee.progress}%</span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      employee.progress >= 80 ? 'bg-green-100 text-green-800' : 
                      employee.progress >= 50 ? 'bg-yellow-100 text-yellow-800' : 'bg-red-100 text-red-800'
                    }`}>
                      {employee.progress >= 80 ? 'On Track' : 
                       employee.progress >= 50 ? 'In Progress' : 'Needs Improvement'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
} 