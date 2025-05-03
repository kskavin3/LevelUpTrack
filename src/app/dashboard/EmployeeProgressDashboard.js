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
  { name: 'John D.', tasks_completed: 12, goals_achieved: 3, progress: 78 },
  { name: 'Jane S.', tasks_completed: 20, goals_achieved: 5, progress: 92 },
  { name: 'Michael B.', tasks_completed: 8, goals_achieved: 2, progress: 45 },
  { name: 'Sarah J.', tasks_completed: 15, goals_achieved: 4, progress: 82 },
  { name: 'David W.', tasks_completed: 10, goals_achieved: 2, progress: 65 },
  { name: 'Emily D.', tasks_completed: 18, goals_achieved: 4, progress: 88 },
  { name: 'Robert M.', tasks_completed: 6, goals_achieved: 1, progress: 30 },
  { name: 'Jennifer W.', tasks_completed: 14, goals_achieved: 3, progress: 75 },
  { name: 'Thomas M.', tasks_completed: 9, goals_achieved: 2, progress: 50 },
  { name: 'Lisa T.', tasks_completed: 16, goals_achieved: 4, progress: 85 }
];

// Calculate summary metrics
const totalEmployees = employeeData.length;
const averageProgress = Math.round(employeeData.reduce((sum, emp) => sum + emp.progress, 0) / totalEmployees);
const totalTasksCompleted = employeeData.reduce((sum, emp) => sum + emp.tasks_completed, 0);
const totalGoalsAchieved = employeeData.reduce((sum, emp) => sum + emp.goals_achieved, 0);

// Card component for summary metrics
const SummaryCard = ({ title, value, description }) => (
  <div className="bg-white/50 backdrop-blur-sm p-5 rounded-xl border border-gray-100">
    <p className="text-sm font-medium text-gray-500">{title}</p>
    <h3 className="text-3xl font-bold mt-1">{value}</h3>
    <p className="text-xs text-gray-400 mt-1">{description}</p>
  </div>
);

const CustomTooltip = ({ active, payload }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white/90 backdrop-blur-sm p-3 rounded-md border border-gray-100 shadow-sm">
        <p className="text-sm font-medium">{payload[0].payload.name}</p>
        <p className="text-sm text-gray-600">
          <span className="font-medium text-indigo-500">{payload[0].value}%</span> progress
        </p>
      </div>
    );
  }
  return null;
};

export default function EmployeeProgressDashboard() {
  return (
    <div className="grid grid-cols-1 gap-6">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <SummaryCard 
          title="Employees" 
          value={totalEmployees} 
          description="Active team members"
        />
        <SummaryCard 
          title="Avg. Progress" 
          value={`${averageProgress}%`} 
          description="Team completion rate"
        />
        <SummaryCard 
          title="Tasks Done" 
          value={totalTasksCompleted} 
          description="Completed tasks"
        />
        <SummaryCard 
          title="Goals Met" 
          value={totalGoalsAchieved} 
          description="Achieved goals"
        />
      </div>

      <div className="bg-white/50 backdrop-blur-sm p-5 rounded-xl border border-gray-100">
        <h2 className="text-lg font-medium mb-4">Progress Overview</h2>
        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={employeeData}
              margin={{ top: 5, right: 10, left: 10, bottom: 50 }}
              barSize={28}
            >
              <CartesianGrid vertical={false} strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis 
                dataKey="name" 
                angle={-45} 
                textAnchor="end" 
                height={60} 
                tick={{ fontSize: 12 }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis 
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 12 }}
                domain={[0, 100]}
              />
              <Tooltip content={<CustomTooltip />} />
              <Bar 
                dataKey="progress" 
                fill="#6366f1" 
                radius={[4, 4, 0, 0]} 
                name="Progress" 
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="bg-white/50 backdrop-blur-sm p-5 rounded-xl border border-gray-100">
        <h2 className="text-lg font-medium mb-4">Team Members</h2>
        <div className="space-y-4">
          {employeeData.map((employee, index) => (
            <div key={index} className="flex flex-col">
              <div className="flex justify-between items-center mb-1">
                <span className="text-sm font-medium">{employee.name}</span>
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-indigo-400"></span>
                    <span className="text-xs text-gray-500">{employee.tasks_completed} tasks</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
                    <span className="text-xs text-gray-500">{employee.goals_achieved} goals</span>
                  </div>
                  <span className="text-xs font-medium">
                    {employee.progress}%
                  </span>
                </div>
              </div>
              <div className="w-full bg-gray-100 rounded-full h-1.5">
                <div 
                  className={`h-1.5 rounded-full ${
                    employee.progress >= 80 ? 'bg-emerald-500' : 
                    employee.progress >= 50 ? 'bg-amber-500' : 'bg-rose-500'
                  }`}
                  style={{ width: `${employee.progress}%` }}
                ></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
} 