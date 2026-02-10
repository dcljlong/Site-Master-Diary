import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Briefcase, CheckSquare, Package, Wrench, Clock, AlertTriangle } from 'lucide-react';

export default function DashboardStats({ jobs, tasks, orders, tools, timeEntries }) {
  const activeJobs = jobs.filter(j => j.status === 'active' || !j.status).length;
  const totalTasks = tasks.length;
  const completedTasks = tasks.filter(t => t.status === 'completed').length;
  const pendingOrders = orders.filter(o => o.status === 'pending').length;
  const availableTools = tools.filter(t => !t.assignedJobId).length;
  
  // Hours this week
  const now = new Date();
  const weekStart = new Date(now);
  weekStart.setDate(now.getDate() - now.getDay());
  weekStart.setHours(0, 0, 0, 0);
  
  const hoursThisWeek = timeEntries
    .filter(te => new Date(te.date) >= weekStart)
    .reduce((sum, te) => sum + (te.hours || 0), 0);

  // Urgent tasks (due within 2 days)
  const urgentTasks = tasks.filter(t => {
    if (!t.dueDate || t.status === 'completed') return false;
    const daysUntil = Math.ceil((new Date(t.dueDate) - now) / (1000 * 60 * 60 * 24));
    return daysUntil <= 2;
  }).length;

  const stats = [
    { label: 'Active Jobs', value: activeJobs, icon: Briefcase, color: 'bg-blue-500' },
    { label: 'Tasks Done', value: `${completedTasks}/${totalTasks}`, icon: CheckSquare, color: 'bg-green-500' },
    { label: 'Pending Orders', value: pendingOrders, icon: Package, color: 'bg-purple-500' },
    { label: 'Tools Available', value: availableTools, icon: Wrench, color: 'bg-orange-500' },
    { label: 'Hours/Week', value: hoursThisWeek.toFixed(1), icon: Clock, color: 'bg-cyan-500' },
    { label: 'Urgent', value: urgentTasks, icon: AlertTriangle, color: urgentTasks > 0 ? 'bg-red-500' : 'bg-gray-400' },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
      {stats.map((stat, i) => (
        <Card key={i} className="dark:bg-gray-800 dark:border-gray-700">
          <CardContent className="p-4 flex items-center gap-3">
            <div className={`p-2 rounded-lg ${stat.color}`}>
              <stat.icon className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="text-2xl font-bold dark:text-white">{stat.value}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">{stat.label}</p>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}