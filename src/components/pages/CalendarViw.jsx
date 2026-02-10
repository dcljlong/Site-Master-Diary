import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { format, isSameDay } from 'date-fns';

import { useTheme } from '../components/ui/ThemeContext';
import { TasksAPI, LogsAPI, JobsAPI } from '../components/db/database';
import MonthCalendar from '../components/calendar/MonthCalendar';
import TaskForm from '../components/forms/TaskForm';
import DailyLogForm from '../components/forms/DailyLogForm';

export default function CalendarView() {
  const { darkMode } = useTheme();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [logs, setLogs] = useState([]);
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);

  const [showTaskForm, setShowTaskForm] = useState(false);
  const [showLogForm, setShowLogForm] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    const [t, l, j] = await Promise.all([
      TasksAPI.getAll(),
      LogsAPI.getAll(),
      JobsAPI.getAll()
    ]);
    setTasks(t);
    setLogs(l);
    setJobs(j);
    setLoading(false);
  };

  const handleDayClick = (day) => {
    setSelectedDate(day);
  };

  const handleSaveTask = async (data) => {
    await TasksAPI.create(data);
    loadData();
  };

  const handleSaveLog = async (data) => {
    await LogsAPI.create(data);
    loadData();
  };

  const selectedDateTasks = selectedDate 
    ? tasks.filter(t => t.dueDate && isSameDay(new Date(t.dueDate), selectedDate))
    : [];

  const selectedDateLogs = selectedDate
    ? logs.filter(l => isSameDay(new Date(l.date), selectedDate))
    : [];

  const getJobName = (jobId) => {
    const job = jobs.find(j => j._id === jobId);
    return job?.name || 'Unknown Job';
  };

  const priorityColors = {
    urgent: 'bg-red-500',
    high: 'bg-orange-500',
    medium: 'bg-yellow-500',
    low: 'bg-green-500'
  };

  return (
    <div className={`min-h-screen ${darkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
      {/* Header */}
      <header className={`sticky top-0 z-20 ${darkMode ? 'bg-gray-800' : 'bg-white'} border-b ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <Link to={createPageUrl('Dashboard')}>
              <Button variant="ghost" size="icon">
                <ArrowLeft className="w-5 h-5" />
              </Button>
            </Link>
            <h1 className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
              Calendar
            </h1>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Calendar */}
          <div className="lg:col-span-2">
            {loading ? (
              <div className={`h-96 rounded-lg animate-pulse ${darkMode ? 'bg-gray-800' : 'bg-gray-200'}`} />
            ) : (
              <MonthCalendar
                currentDate={currentDate}
                setCurrentDate={setCurrentDate}
                tasks={tasks}
                logs={logs}
                onDayClick={handleDayClick}
              />
            )}
          </div>

          {/* Selected Day Details */}
          <div className="space-y-4">
            {selectedDate ? (
              <>
                <Card className="dark:bg-gray-800 dark:border-gray-700">
                  <CardHeader>
                    <CardTitle className="dark:text-white">
                      {format(selectedDate, 'EEEE, MMMM d, yyyy')}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex gap-2">
                      <Button 
                        size="sm" 
                        onClick={() => setShowTaskForm(true)}
                      >
                        Add Task
                      </Button>
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => setShowLogForm(true)}
                        className="dark:border-gray-600"
                      >
                        Add Log
                      </Button>
                    </div>
                  </CardContent>
                </Card>

                {/* Tasks for selected date */}
                <Card className="dark:bg-gray-800 dark:border-gray-700">
                  <CardHeader>
                    <CardTitle className="text-lg dark:text-white">
                      Tasks ({selectedDateTasks.length})
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {selectedDateTasks.length === 0 ? (
                      <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                        No tasks due on this date
                      </p>
                    ) : (
                      <div className="space-y-2">
                        {selectedDateTasks.map(task => (
                          <div 
                            key={task._id}
                            className={`p-3 rounded-lg border ${darkMode ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-200'}`}
                          >
                            <div className="flex items-center gap-2">
                              <div className={`w-2 h-2 rounded-full ${priorityColors[task.priority]}`} />
                              <span className={`font-medium ${darkMode ? 'text-white' : ''}`}>
                                {task.title}
                              </span>
                            </div>
                            <div className={`text-sm mt-1 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                              {getJobName(task.jobId)}
                            </div>
                            <Badge className="mt-2" variant="secondary">{task.status}</Badge>
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Logs for selected date */}
                <Card className="dark:bg-gray-800 dark:border-gray-700">
                  <CardHeader>
                    <CardTitle className="text-lg dark:text-white">
                      Daily Logs ({selectedDateLogs.length})
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {selectedDateLogs.length === 0 ? (
                      <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                        No logs for this date
                      </p>
                    ) : (
                      <div className="space-y-2">
                        {selectedDateLogs.map(log => (
                          <div 
                            key={log._id}
                            className={`p-3 rounded-lg border ${darkMode ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-200'}`}
                          >
                            <div className={`font-medium ${darkMode ? 'text-white' : ''}`}>
                              {getJobName(log.jobId)}
                            </div>
                            <div className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                              {log.weather && `${log.weather} • `}
                              {log.hoursWorked || 0} hours
                            </div>
                            {log.notes && (
                              <p className={`text-sm mt-1 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                                {log.notes.substring(0, 100)}...
                              </p>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </>
            ) : (
              <Card className="dark:bg-gray-800 dark:border-gray-700">
                <CardContent className="py-12 text-center">
                  <p className={`${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                    Click on a date to see details
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className={`py-6 text-center ${darkMode ? 'text-gray-500' : 'text-gray-400'}`}>
        <a 
          href="https://github.com/dcljlong" 
          target="_blank" 
          rel="noopener noreferrer"
          className="hover:text-cyan-500 transition-colors"
        >
          github.com/dcljlong
        </a>
      </footer>

      {/* Modals */}
      <TaskForm
        open={showTaskForm}
        onClose={() => setShowTaskForm(false)}
        onSave={handleSaveTask}
        initialData={selectedDate ? { dueDate: format(selectedDate, 'yyyy-MM-dd') } : null}
        jobs={jobs}
      />

      {jobs.length > 0 && (
        <DailyLogForm
          open={showLogForm}
          onClose={() => setShowLogForm(false)}
          onSave={handleSaveLog}
          initialData={selectedDate ? { date: format(selectedDate, 'yyyy-MM-dd') } : null}
          jobId={jobs[0]?._id}
          crew={[]}
        />
      )}
    </div>
  );
}