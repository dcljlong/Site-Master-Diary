import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';
import { Line, Bar, Doughnut } from 'react-chartjs-2';
import { format, subDays, eachDayOfInterval } from 'date-fns';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

export default function ProgressChart({ jobs, timeEntries, tasks, darkMode }) {
  const textColor = darkMode ? '#e5e7eb' : '#374151';
  const gridColor = darkMode ? '#374151' : '#e5e7eb';

  // Hours worked over last 14 days
  const last14Days = eachDayOfInterval({
    start: subDays(new Date(), 13),
    end: new Date()
  });

  const hoursData = {
    labels: last14Days.map(d => format(d, 'MMM d')),
    datasets: [{
      label: 'Hours Worked',
      data: last14Days.map(day => {
        const dayStr = format(day, 'yyyy-MM-dd');
        return timeEntries
          .filter(te => te.date === dayStr)
          .reduce((sum, te) => sum + (te.hours || 0), 0);
      }),
      fill: true,
      backgroundColor: 'rgba(59, 130, 246, 0.2)',
      borderColor: 'rgb(59, 130, 246)',
      tension: 0.4
    }]
  };

  // Job progress bar chart
  const progressData = {
    labels: jobs.slice(0, 8).map(j => j.name.substring(0, 15)),
    datasets: [{
      label: 'Progress %',
      data: jobs.slice(0, 8).map(j => j.progress || 0),
      backgroundColor: [
        'rgba(59, 130, 246, 0.8)',
        'rgba(16, 185, 129, 0.8)',
        'rgba(245, 158, 11, 0.8)',
        'rgba(239, 68, 68, 0.8)',
        'rgba(139, 92, 246, 0.8)',
        'rgba(236, 72, 153, 0.8)',
        'rgba(20, 184, 166, 0.8)',
        'rgba(249, 115, 22, 0.8)'
      ]
    }]
  };

  // Task status doughnut
  const taskStatusCounts = {
    pending: tasks.filter(t => t.status === 'pending').length,
    'in-progress': tasks.filter(t => t.status === 'in-progress').length,
    completed: tasks.filter(t => t.status === 'completed').length,
    blocked: tasks.filter(t => t.status === 'blocked').length
  };

  const taskStatusData = {
    labels: ['Pending', 'In Progress', 'Completed', 'Blocked'],
    datasets: [{
      data: [
        taskStatusCounts.pending,
        taskStatusCounts['in-progress'],
        taskStatusCounts.completed,
        taskStatusCounts.blocked
      ],
      backgroundColor: [
        'rgba(245, 158, 11, 0.8)',
        'rgba(59, 130, 246, 0.8)',
        'rgba(16, 185, 129, 0.8)',
        'rgba(239, 68, 68, 0.8)'
      ],
      borderWidth: 0
    }]
  };

  const commonOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        labels: { color: textColor }
      }
    },
    scales: {
      x: {
        ticks: { color: textColor },
        grid: { color: gridColor }
      },
      y: {
        ticks: { color: textColor },
        grid: { color: gridColor }
      }
    }
  };

  const doughnutOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom',
        labels: { color: textColor }
      }
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Hours Worked Trend */}
      <Card className="dark:bg-gray-800 dark:border-gray-700">
        <CardHeader>
          <CardTitle className="text-lg dark:text-white">Hours Worked (14 Days)</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[250px]">
            <Line data={hoursData} options={commonOptions} />
          </div>
        </CardContent>
      </Card>

      {/* Job Progress */}
      <Card className="dark:bg-gray-800 dark:border-gray-700">
        <CardHeader>
          <CardTitle className="text-lg dark:text-white">Job Progress</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[250px]">
            <Bar data={progressData} options={{
              ...commonOptions,
              scales: {
                ...commonOptions.scales,
                y: { ...commonOptions.scales.y, max: 100 }
              }
            }} />
          </div>
        </CardContent>
      </Card>

      {/* Task Status */}
      <Card className="dark:bg-gray-800 dark:border-gray-700">
        <CardHeader>
          <CardTitle className="text-lg dark:text-white">Task Status Distribution</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[250px]">
            <Doughnut data={taskStatusData} options={doughnutOptions} />
          </div>
        </CardContent>
      </Card>

      {/* Summary Stats */}
      <Card className="dark:bg-gray-800 dark:border-gray-700">
        <CardHeader>
          <CardTitle className="text-lg dark:text-white">Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 bg-blue-50 dark:bg-blue-900/30 rounded-lg">
              <p className="text-3xl font-bold text-blue-600 dark:text-blue-400">
                {timeEntries.reduce((sum, te) => sum + (te.hours || 0), 0).toFixed(1)}
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400">Total Hours Logged</p>
            </div>
            <div className="p-4 bg-green-50 dark:bg-green-900/30 rounded-lg">
              <p className="text-3xl font-bold text-green-600 dark:text-green-400">
                {jobs.length > 0 ? Math.round(jobs.reduce((sum, j) => sum + (j.progress || 0), 0) / jobs.length) : 0}%
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400">Avg. Job Progress</p>
            </div>
            <div className="p-4 bg-purple-50 dark:bg-purple-900/30 rounded-lg">
              <p className="text-3xl font-bold text-purple-600 dark:text-purple-400">
                {tasks.filter(t => t.status === 'completed').length}
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400">Tasks Completed</p>
            </div>
            <div className="p-4 bg-orange-50 dark:bg-orange-900/30 rounded-lg">
              <p className="text-3xl font-bold text-orange-600 dark:text-orange-400">
                {tasks.filter(t => t.priority === 'urgent' || t.priority === 'high').length}
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400">High Priority Tasks</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}