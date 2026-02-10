import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { MapPin, Clock, AlertTriangle, Package, Wrench } from 'lucide-react';
import { format, differenceInDays } from 'date-fns';

const priorityColors = {
  urgent: 'bg-red-500 text-white',
  high: 'bg-orange-500 text-white',
  medium: 'bg-yellow-500 text-black',
  low: 'bg-green-500 text-white'
};

const getPriorityFromDueDate = (dueDate) => {
  if (!dueDate) return 'low';
  const days = differenceInDays(new Date(dueDate), new Date());
  if (days < 0) return 'urgent';
  if (days <= 2) return 'urgent';
  if (days <= 7) return 'high';
  if (days <= 14) return 'medium';
  return 'low';
};

export default function JobCard({ job, tasks, orders, tools, timeEntries, onClick }) {
  const jobTasks = tasks.filter(t => t.jobId === job._id);
  const activeTasks = jobTasks.filter(t => t.status !== 'completed');
  const highPriorityTasks = jobTasks.filter(t => t.priority === 'high' || t.priority === 'urgent');
  
  const jobOrders = orders.filter(o => o.jobId === job._id);
  const pendingOrders = jobOrders.filter(o => o.status === 'pending');
  
  const jobTools = tools.filter(t => t.assignedJobId === job._id);
  
  // Calculate hours this week
  const now = new Date();
  const weekStart = new Date(now);
  weekStart.setDate(now.getDate() - now.getDay());
  weekStart.setHours(0, 0, 0, 0);
  
  const jobTimeEntries = timeEntries.filter(te => te.jobId === job._id);
  const hoursThisWeek = jobTimeEntries
    .filter(te => new Date(te.date) >= weekStart)
    .reduce((sum, te) => sum + (te.hours || 0), 0);

  // Get nearest deadline
  const upcomingTasks = jobTasks
    .filter(t => t.dueDate && t.status !== 'completed')
    .sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate));
  
  const nearestDeadline = upcomingTasks[0];
  const deadlinePriority = nearestDeadline ? getPriorityFromDueDate(nearestDeadline.dueDate) : null;

  return (
    <Card 
      className="cursor-pointer hover:shadow-lg transition-all duration-300 hover:scale-[1.02] dark:bg-gray-800 dark:border-gray-700"
      onClick={() => onClick(job)}
    >
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <CardTitle className="text-lg font-semibold truncate dark:text-white">
            {job.name}
          </CardTitle>
          <Badge className={job.status === 'active' ? 'bg-green-500' : 'bg-gray-500'}>
            {job.status || 'active'}
          </Badge>
        </div>
        <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
          <MapPin className="w-4 h-4 mr-1" />
          <span className="truncate">{job.address}</span>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {/* Progress */}
        <div>
          <div className="flex justify-between text-sm mb-1">
            <span className="text-gray-600 dark:text-gray-400">Progress</span>
            <span className="font-medium dark:text-white">{job.progress || 0}%</span>
          </div>
          <Progress value={job.progress || 0} className="h-2" />
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-2 text-sm">
          <div className="flex items-center gap-1.5 p-2 bg-blue-50 dark:bg-blue-900/30 rounded">
            <AlertTriangle className="w-4 h-4 text-blue-600 dark:text-blue-400" />
            <span className="dark:text-gray-300">{activeTasks.length} tasks</span>
            {highPriorityTasks.length > 0 && (
              <Badge variant="destructive" className="ml-auto text-xs px-1">
                {highPriorityTasks.length}!
              </Badge>
            )}
          </div>
          <div className="flex items-center gap-1.5 p-2 bg-purple-50 dark:bg-purple-900/30 rounded">
            <Package className="w-4 h-4 text-purple-600 dark:text-purple-400" />
            <span className="dark:text-gray-300">{pendingOrders.length} orders</span>
          </div>
          <div className="flex items-center gap-1.5 p-2 bg-orange-50 dark:bg-orange-900/30 rounded">
            <Wrench className="w-4 h-4 text-orange-600 dark:text-orange-400" />
            <span className="dark:text-gray-300">{jobTools.length} tools</span>
          </div>
          <div className="flex items-center gap-1.5 p-2 bg-green-50 dark:bg-green-900/30 rounded">
            <Clock className="w-4 h-4 text-green-600 dark:text-green-400" />
            <span className="dark:text-gray-300">{hoursThisWeek}h/week</span>
          </div>
        </div>

        {/* Deadline */}
        {nearestDeadline && (
          <div className={`flex items-center justify-between p-2 rounded ${
            deadlinePriority === 'urgent' ? 'bg-red-100 dark:bg-red-900/30' :
            deadlinePriority === 'high' ? 'bg-orange-100 dark:bg-orange-900/30' :
            deadlinePriority === 'medium' ? 'bg-yellow-100 dark:bg-yellow-900/30' :
            'bg-green-100 dark:bg-green-900/30'
          }`}>
            <span className="text-sm truncate dark:text-gray-300">{nearestDeadline.title}</span>
            <Badge className={priorityColors[deadlinePriority]}>
              {format(new Date(nearestDeadline.dueDate), 'MMM d')}
            </Badge>
          </div>
        )}
      </CardContent>
    </Card>
  );
}