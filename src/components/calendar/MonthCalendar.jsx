import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isToday, isSameDay, startOfWeek, endOfWeek } from 'date-fns';

const priorityColors = {
  urgent: 'bg-red-500',
  high: 'bg-orange-500',
  medium: 'bg-yellow-500',
  low: 'bg-green-500'
};

export default function MonthCalendar({ currentDate, setCurrentDate, tasks, logs, onDayClick }) {
  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const calendarStart = startOfWeek(monthStart);
  const calendarEnd = endOfWeek(monthEnd);
  
  const days = eachDayOfInterval({ start: calendarStart, end: calendarEnd });

  const getTasksForDay = (day) => {
    return tasks.filter(task => task.dueDate && isSameDay(new Date(task.dueDate), day));
  };

  const getLogsForDay = (day) => {
    return logs.filter(log => isSameDay(new Date(log.date), day));
  };

  const previousMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const nextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  return (
    <Card className="dark:bg-gray-800 dark:border-gray-700">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <Button variant="ghost" size="icon" onClick={previousMonth}>
            <ChevronLeft className="w-5 h-5" />
          </Button>
          <CardTitle className="text-xl dark:text-white">
            {format(currentDate, 'MMMM yyyy')}
          </CardTitle>
          <Button variant="ghost" size="icon" onClick={nextMonth}>
            <ChevronRight className="w-5 h-5" />
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {/* Week days header */}
        <div className="grid grid-cols-7 gap-1 mb-2">
          {weekDays.map(day => (
            <div key={day} className="text-center text-sm font-medium text-gray-500 dark:text-gray-400 py-2">
              {day}
            </div>
          ))}
        </div>

        {/* Calendar grid */}
        <div className="grid grid-cols-7 gap-1">
          {days.map((day, idx) => {
            const dayTasks = getTasksForDay(day);
            const dayLogs = getLogsForDay(day);
            const isCurrentMonth = isSameMonth(day, currentDate);
            const isCurrentDay = isToday(day);

            return (
              <div
                key={idx}
                className={`min-h-[80px] md:min-h-[100px] p-1 border rounded cursor-pointer transition-colors
                  ${isCurrentMonth ? 'bg-white dark:bg-gray-700' : 'bg-gray-50 dark:bg-gray-800'}
                  ${isCurrentDay ? 'border-blue-500 border-2' : 'border-gray-200 dark:border-gray-600'}
                  hover:bg-gray-100 dark:hover:bg-gray-600
                `}
                onClick={() => onDayClick(day)}
              >
                <div className={`text-sm font-medium mb-1 ${
                  isCurrentMonth ? 'text-gray-900 dark:text-white' : 'text-gray-400 dark:text-gray-500'
                } ${isCurrentDay ? 'text-blue-600 dark:text-blue-400' : ''}`}>
                  {format(day, 'd')}
                </div>
                
                {/* Task indicators */}
                <div className="space-y-0.5">
                  {dayTasks.slice(0, 3).map((task, i) => (
                    <div
                      key={i}
                      className={`text-xs px-1 py-0.5 rounded truncate text-white ${priorityColors[task.priority] || 'bg-gray-500'}`}
                    >
                      {task.title}
                    </div>
                  ))}
                  {dayTasks.length > 3 && (
                    <div className="text-xs text-gray-500 dark:text-gray-400">
                      +{dayTasks.length - 3} more
                    </div>
                  )}
                </div>

                {/* Log indicator */}
                {dayLogs.length > 0 && (
                  <Badge variant="outline" className="text-xs mt-1">
                    {dayLogs.length} log{dayLogs.length > 1 ? 's' : ''}
                  </Badge>
                )}
              </div>
            );
          })}
        </div>

        {/* Legend */}
        <div className="flex flex-wrap gap-3 mt-4 text-sm">
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 rounded bg-red-500"></div>
            <span className="dark:text-gray-300">Urgent</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 rounded bg-orange-500"></div>
            <span className="dark:text-gray-300">High</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 rounded bg-yellow-500"></div>
            <span className="dark:text-gray-300">Medium</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 rounded bg-green-500"></div>
            <span className="dark:text-gray-300">Low</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}