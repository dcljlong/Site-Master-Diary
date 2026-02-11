import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Button } from "../ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Badge } from "../ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import { Progress } from "../ui/progress";
import { 
  ArrowLeft, Edit, Trash2, Plus, FileDown, MapPin, Calendar,
  Clock, CheckSquare, Package, Wrench, FileText
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { createPageUrl } from "../utils";
import { format } from 'date-fns';

import { useTheme } from "../ui/ThemeContent";
import { 
  JobsAPI, TasksAPI, OrdersAPI, ToolsAPI, LogsAPI, TimeEntriesAPI, CrewAPI 
} from '../db/database';
import JobForm from '../forms/JobForm';
import TaskForm from '../forms/TaskForm';
import OrderForm from '../forms/OrderForm';
import ToolForm from '../forms/ToolForm';
import DailyLogForm from '../forms/DailyLogForm';
import { generateJobReport, downloadPDF } from '../export/PDFExport';

export default function JobDetail() {
  const { darkMode, settings } = useTheme();
  const [job, setJob] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [orders, setOrders] = useState([]);
  const [tools, setTools] = useState([]);
  const [logs, setLogs] = useState([]);
  const [timeEntries, setTimeEntries] = useState([]);
  const [allJobs, setAllJobs] = useState([]);
  const [allTools, setAllTools] = useState([]);
  const [crew, setCrew] = useState([]);
  const [loading, setLoading] = useState(true);

  const [showJobForm, setShowJobForm] = useState(false);
  const [showTaskForm, setShowTaskForm] = useState(false);
  const [showOrderForm, setShowOrderForm] = useState(false);
  const [showToolForm, setShowToolForm] = useState(false);
  const [showLogForm, setShowLogForm] = useState(false);
  const [editingItem, setEditingItem] = useState(null);

  const urlParams = new URLSearchParams(window.location.search);
  const jobId = urlParams.get('id');

  useEffect(() => {
    if (jobId) loadData();
  }, [jobId]);

  const loadData = async () => {
    setLoading(true);
    const [j, allJ, t, o, allT, l, te, c] = await Promise.all([
      JobsAPI.get(jobId),
      JobsAPI.getAll(),
      TasksAPI.getByJob(jobId),
      OrdersAPI.getByJob(jobId),
      ToolsAPI.getAll(),
      LogsAPI.getByJob(jobId),
      TimeEntriesAPI.getByJob(jobId),
      CrewAPI.getAll()
    ]);
    setJob(j);
    setAllJobs(allJ);
    setTasks(t);
    setOrders(o);
    setAllTools(allT);
    setTools(allT.filter(tool => tool.assignedJobId === jobId));
    setLogs(l.sort((a, b) => new Date(b.date) - new Date(a.date)));
    setTimeEntries(te);
    setCrew(c);
    setLoading(false);
  };

  const handleUpdateJob = async (data) => {
    await JobsAPI.update(jobId, data);
    loadData();
    setShowJobForm(false);
  };

  const handleDeleteJob = async () => {
    if (confirm('Delete this job and all associated data?')) {
      await JobsAPI.delete(jobId);
      window.location.href = createPageUrl('Dashboard');
    }
  };

  const handleSaveTask = async (data) => {
    if (editingItem) {
      await TasksAPI.update(editingItem._id, data);
    } else {
      await TasksAPI.create({ ...data, jobId });
    }
    loadData();
    setEditingItem(null);
  };

  const handleDeleteTask = async (id) => {
    if (confirm('Delete this task?')) {
      await TasksAPI.delete(id);
      loadData();
    }
  };

  const handleSaveOrder = async (data) => {
    if (editingItem) {
      await OrdersAPI.update(editingItem._id, data);
    } else {
      await OrdersAPI.create({ ...data, jobId });
    }
    loadData();
    setEditingItem(null);
  };

  const handleDeleteOrder = async (id) => {
    if (confirm('Delete this order?')) {
      await OrdersAPI.delete(id);
      loadData();
    }
  };

  const handleSaveTool = async (data) => {
    if (editingItem) {
      await ToolsAPI.update(editingItem._id, data);
    } else {
      await ToolsAPI.create({ ...data, assignedJobId: jobId });
    }
    loadData();
    setEditingItem(null);
  };

  const handleSaveLog = async (data) => {
    if (editingItem) {
      await LogsAPI.update(editingItem._id, data);
    } else {
      const newLog = await LogsAPI.create({ ...data, jobId });
      // Also create time entry
      if (data.hoursWorked > 0) {
        await TimeEntriesAPI.create({
          jobId,
          date: data.date,
          hours: data.hoursWorked,
          logId: newLog._id
        });
      }
    }
    loadData();
    setEditingItem(null);
  };

  const handleDeleteLog = async (id) => {
    if (confirm('Delete this log?')) {
      await LogsAPI.delete(id);
      loadData();
    }
  };

  const handleExport = () => {
    const allTasks = tasks;
    const allOrders = orders;
    const doc = generateJobReport(job, logs, allTasks, allOrders, tools, timeEntries, settings);
    downloadPDF(doc, `${job.name.replace(/\s+/g, '_')}_Report.pdf`);
  };

  const priorityColors = {
    urgent: 'bg-red-500',
    high: 'bg-orange-500',
    medium: 'bg-yellow-500',
    low: 'bg-green-500'
  };

  const statusColors = {
    pending: 'bg-gray-500',
    'in-progress': 'bg-blue-500',
    completed: 'bg-green-500',
    blocked: 'bg-red-500',
    ordered: 'bg-blue-500',
    shipped: 'bg-purple-500',
    delivered: 'bg-green-500',
    cancelled: 'bg-gray-500'
  };

  if (loading) {
    return (
      <div className={`min-h-screen ${darkMode ? 'bg-gray-900' : 'bg-gray-50'} flex items-center justify-center`}>
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500" />
      </div>
    );
  }

  if (!job) {
    return (
      <div className={`min-h-screen ${darkMode ? 'bg-gray-900 text-white' : 'bg-gray-50'} flex items-center justify-center`}>
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Job not found</h2>
          <Link to={createPageUrl('Dashboard')}>
            <Button>Back to Dashboard</Button>
          </Link>
        </div>
      </div>
    );
  }

  const totalHours = timeEntries.reduce((sum, te) => sum + (te.hours || 0), 0);

  return (
    <div className={`min-h-screen ${darkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
      {/* Header */}
      <header className={`sticky top-0 z-20 ${darkMode ? 'bg-gray-800' : 'bg-white'} border-b ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link to={createPageUrl('Dashboard')}>
                <Button variant="ghost" size="icon">
                  <ArrowLeft className="w-5 h-5" />
                </Button>
              </Link>
              <div>
                <h1 className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                  {job.name}
                </h1>
                <div className={`flex items-center gap-2 text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  <MapPin className="w-4 h-4" />
                  {job.address}
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" onClick={handleExport} className="dark:border-gray-600">
                <FileDown className="w-4 h-4 mr-2" />
                Export PDF
              </Button>
              <Button variant="outline" onClick={() => setShowJobForm(true)} className="dark:border-gray-600">
                <Edit className="w-4 h-4 mr-2" />
                Edit
              </Button>
              <Button variant="destructive" onClick={handleDeleteJob}>
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-6 space-y-6">
        {/* Job Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="dark:bg-gray-800 dark:border-gray-700">
            <CardContent className="p-4">
              <div className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Progress</div>
              <div className={`text-3xl font-bold ${darkMode ? 'text-white' : ''}`}>{job.progress || 0}%</div>
              <Progress value={job.progress || 0} className="mt-2" />
            </CardContent>
          </Card>
          <Card className="dark:bg-gray-800 dark:border-gray-700">
            <CardContent className="p-4">
              <div className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Total Hours</div>
              <div className={`text-3xl font-bold ${darkMode ? 'text-white' : ''}`}>{totalHours.toFixed(1)}</div>
              <div className="flex items-center mt-2">
                <Clock className="w-4 h-4 text-blue-500 mr-1" />
                <span className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>hours logged</span>
              </div>
            </CardContent>
          </Card>
          <Card className="dark:bg-gray-800 dark:border-gray-700">
            <CardContent className="p-4">
              <div className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Active Tasks</div>
              <div className={`text-3xl font-bold ${darkMode ? 'text-white' : ''}`}>
                {tasks.filter(t => t.status !== 'completed').length}
              </div>
              <div className="flex items-center mt-2">
                <CheckSquare className="w-4 h-4 text-green-500 mr-1" />
                <span className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  {tasks.filter(t => t.status === 'completed').length} completed
                </span>
              </div>
            </CardContent>
          </Card>
          <Card className="dark:bg-gray-800 dark:border-gray-700">
            <CardContent className="p-4">
              <div className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Status</div>
              <Badge className={`mt-2 ${job.status === 'active' || !job.status ? 'bg-green-500' : job.status === 'completed' ? 'bg-blue-500' : 'bg-yellow-500'}`}>
                {job.status || 'Active'}
              </Badge>
              {job.expectedEndDate && (
                <div className={`flex items-center mt-2 text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  <Calendar className="w-4 h-4 mr-1" />
                  Due: {format(new Date(job.expectedEndDate), 'MMM d, yyyy')}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="logs" className="space-y-4">
          <TabsList className={`${darkMode ? 'bg-gray-800' : ''}`}>
            <TabsTrigger value="logs">
              <FileText className="w-4 h-4 mr-2" />
              Daily Logs ({logs.length})
            </TabsTrigger>
            <TabsTrigger value="tasks">
              <CheckSquare className="w-4 h-4 mr-2" />
              Tasks ({tasks.length})
            </TabsTrigger>
            <TabsTrigger value="orders">
              <Package className="w-4 h-4 mr-2" />
              Orders ({orders.length})
            </TabsTrigger>
            <TabsTrigger value="tools">
              <Wrench className="w-4 h-4 mr-2" />
              Tools ({tools.length})
            </TabsTrigger>
          </TabsList>

          {/* Daily Logs Tab */}
          <TabsContent value="logs">
            <Card className="dark:bg-gray-800 dark:border-gray-700">
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="dark:text-white">Daily Logs</CardTitle>
                <Button onClick={() => { setEditingItem(null); setShowLogForm(true); }}>
                  <Plus className="w-4 h-4 mr-2" />
                  Add Log
                </Button>
              </CardHeader>
              <CardContent>
                {logs.length === 0 ? (
                  <p className={`text-center py-8 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                    No logs yet. Add your first daily log.
                  </p>
                ) : (
                  <div className="space-y-4">
                    {logs.map(log => (
                      <motion.div
                        key={log._id}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className={`p-4 rounded-lg border ${darkMode ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-200'}`}
                      >
                        <div className="flex justify-between items-start">
                          <div>
                            <div className={`font-medium ${darkMode ? 'text-white' : ''}`}>
                              {format(new Date(log.date), 'EEEE, MMMM d, yyyy')}
                            </div>
                            <div className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                              Weather: {log.weather || 'N/A'} | Temp: {log.temperature || 'N/A'}Â°F | Hours: {log.hoursWorked || 0}
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <Button 
                              variant="ghost" 
                              size="sm"
                              onClick={() => { setEditingItem(log); setShowLogForm(true); }}
                            >
                              <Edit className="w-4 h-4" />
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="sm"
                              onClick={() => handleDeleteLog(log._id)}
                            >
                              <Trash2 className="w-4 h-4 text-red-500" />
                            </Button>
                          </div>
                        </div>
                        {log.notes && (
                          <p className={`mt-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>{log.notes}</p>
                        )}
                        {log.safetyObservations && (
                          <div className="mt-2 p-2 bg-yellow-50 dark:bg-yellow-900/20 rounded text-sm">
                            <strong>Safety:</strong> {log.safetyObservations}
                          </div>
                        )}
                        {log.photos && log.photos.length > 0 && (
                          <div className="flex gap-2 mt-2">
                            {log.photos.map((photo, i) => (
                              <img 
                                key={i} 
                                src={photo.data} 
                                alt="" 
                                className="w-20 h-20 object-cover rounded cursor-pointer hover:opacity-80"
                                onClick={() => window.open(photo.data, '_blank')}
                              />
                            ))}
                          </div>
                        )}
                      </motion.div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Tasks Tab */}
          <TabsContent value="tasks">
            <Card className="dark:bg-gray-800 dark:border-gray-700">
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="dark:text-white">Tasks</CardTitle>
                <Button onClick={() => { setEditingItem(null); setShowTaskForm(true); }}>
                  <Plus className="w-4 h-4 mr-2" />
                  Add Task
                </Button>
              </CardHeader>
              <CardContent>
                {tasks.length === 0 ? (
                  <p className={`text-center py-8 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                    No tasks yet. Create your first task.
                  </p>
                ) : (
                  <div className="space-y-2">
                    {tasks.map(task => (
                      <div 
                        key={task._id}
                        className={`p-3 rounded-lg border flex items-center justify-between ${darkMode ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-200'}`}
                      >
                        <div className="flex items-center gap-3">
                          <div className={`w-3 h-3 rounded-full ${priorityColors[task.priority]}`} />
                          <div>
                            <div className={`font-medium ${darkMode ? 'text-white' : ''} ${task.status === 'completed' ? 'line-through opacity-60' : ''}`}>
                              {task.title}
                            </div>
                            <div className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                              {task.dueDate && `Due: ${format(new Date(task.dueDate), 'MMM d')}`}
                              {task.assignedTo && ` â€¢ ${task.assignedTo}`}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge className={statusColors[task.status]}>{task.status}</Badge>
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => { setEditingItem(task); setShowTaskForm(true); }}
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => handleDeleteTask(task._id)}
                          >
                            <Trash2 className="w-4 h-4 text-red-500" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Orders Tab */}
          <TabsContent value="orders">
            <Card className="dark:bg-gray-800 dark:border-gray-700">
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="dark:text-white">Orders</CardTitle>
                <Button onClick={() => { setEditingItem(null); setShowOrderForm(true); }}>
                  <Plus className="w-4 h-4 mr-2" />
                  Add Order
                </Button>
              </CardHeader>
              <CardContent>
                {orders.length === 0 ? (
                  <p className={`text-center py-8 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                    No orders yet. Create your first order.
                  </p>
                ) : (
                  <div className="space-y-2">
                    {orders.map(order => (
                      <div 
                        key={order._id}
                        className={`p-3 rounded-lg border flex items-center justify-between ${darkMode ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-200'}`}
                      >
                        <div>
                          <div className={`font-medium ${darkMode ? 'text-white' : ''}`}>{order.item}</div>
                          <div className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                            Qty: {order.quantity} {order.unit}
                            {order.supplier && ` â€¢ ${order.supplier}`}
                            {order.expectedDelivery && ` â€¢ Expected: ${format(new Date(order.expectedDelivery), 'MMM d')}`}
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge className={`${priorityColors[order.priority]} mr-1`}>{order.priority}</Badge>
                          <Badge className={statusColors[order.status]}>{order.status}</Badge>
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => { setEditingItem(order); setShowOrderForm(true); }}
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => handleDeleteOrder(order._id)}
                          >
                            <Trash2 className="w-4 h-4 text-red-500" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Tools Tab */}
          <TabsContent value="tools">
            <Card className="dark:bg-gray-800 dark:border-gray-700">
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="dark:text-white">Assigned Tools</CardTitle>
                <Button onClick={() => { setEditingItem(null); setShowToolForm(true); }}>
                  <Plus className="w-4 h-4 mr-2" />
                  Add Tool
                </Button>
              </CardHeader>
              <CardContent>
                {tools.length === 0 ? (
                  <p className={`text-center py-8 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                    No tools assigned to this job.
                  </p>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {tools.map(tool => (
                      <div 
                        key={tool._id}
                        className={`p-3 rounded-lg border ${darkMode ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-200'}`}
                      >
                        <div className="flex justify-between items-start">
                          <div>
                            <div className={`font-medium ${darkMode ? 'text-white' : ''}`}>{tool.name}</div>
                            <div className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                              {tool.serialNumber && `SN: ${tool.serialNumber} â€¢ `}
                              {tool.category}
                            </div>
                          </div>
                          <Badge className={
                            tool.condition === 'good' || tool.condition === 'new' ? 'bg-green-500' :
                            tool.condition === 'fair' ? 'bg-yellow-500' : 'bg-red-500'
                          }>
                            {tool.condition}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
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
      <JobForm
        open={showJobForm}
        onClose={() => setShowJobForm(false)}
        onSave={handleUpdateJob}
        initialData={job}
      />

      <TaskForm
        open={showTaskForm}
        onClose={() => { setShowTaskForm(false); setEditingItem(null); }}
        onSave={handleSaveTask}
        initialData={editingItem}
        jobs={allJobs}
      />

      <OrderForm
        open={showOrderForm}
        onClose={() => { setShowOrderForm(false); setEditingItem(null); }}
        onSave={handleSaveOrder}
        initialData={editingItem}
        jobs={allJobs}
      />

      <ToolForm
        open={showToolForm}
        onClose={() => { setShowToolForm(false); setEditingItem(null); }}
        onSave={handleSaveTool}
        initialData={editingItem}
        jobs={allJobs}
      />

      <DailyLogForm
        open={showLogForm}
        onClose={() => { setShowLogForm(false); setEditingItem(null); }}
        onSave={handleSaveLog}
        initialData={editingItem}
        jobId={jobId}
        crew={crew}
      />
    </div>
  );
}



