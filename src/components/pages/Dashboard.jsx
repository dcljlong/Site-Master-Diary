import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Button } from "@/components/ui/button";
import { 
  Plus, Search, Moon, Sun, FileDown, RefreshCw, 
  Briefcase, Calendar, BarChart3, Settings
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';

import { useTheme } from '../components/ui/ThemeContext';
import { JobsAPI, TasksAPI, OrdersAPI, ToolsAPI, TimeEntriesAPI, LogsAPI, InventoryAPI, CrewAPI } from '../components/db/database';
import DashboardStats from '../components/dashboard/DashboardStats';
import JobCard from '../components/dashboard/JobCard';
import JobForm from '../components/forms/JobForm';
import GlobalSearch from '../components/search/GlobalSearch';
import { generateFullReport, downloadPDF } from '../components/export/PDFExport';

export default function Dashboard() {
  const { darkMode, toggleDarkMode, settings } = useTheme();
  const [jobs, setJobs] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [orders, setOrders] = useState([]);
  const [tools, setTools] = useState([]);
  const [timeEntries, setTimeEntries] = useState([]);
  const [logs, setLogs] = useState([]);
  const [inventory, setInventory] = useState([]);
  const [crew, setCrew] = useState([]);
  
  const [loading, setLoading] = useState(true);
  const [showJobForm, setShowJobForm] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const [filterStatus, setFilterStatus] = useState('all');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    const [j, t, o, tl, te, l, i, c] = await Promise.all([
      JobsAPI.getAll(),
      TasksAPI.getAll(),
      OrdersAPI.getAll(),
      ToolsAPI.getAll(),
      TimeEntriesAPI.getAll(),
      LogsAPI.getAll(),
      InventoryAPI.getAll(),
      CrewAPI.getAll()
    ]);
    setJobs(j);
    setTasks(t);
    setOrders(o);
    setTools(tl);
    setTimeEntries(te);
    setLogs(l);
    setInventory(i);
    setCrew(c);
    setLoading(false);
  };

  const handleCreateJob = async (data) => {
    await JobsAPI.create(data);
    loadData();
  };

  const handleExportAll = () => {
    const doc = generateFullReport(jobs, logs, tasks, orders, tools, inventory, crew, timeEntries, settings);
    downloadPDF(doc, `SiteMaster_Report_${new Date().toISOString().split('T')[0]}.pdf`);
  };

  const handleSearchResult = (category, item) => {
    if (category === 'jobs') {
      window.location.href = createPageUrl(`JobDetail?id=${item._id}`);
    }
  };

  const filteredJobs = jobs.filter(job => {
    if (filterStatus === 'all') return true;
    return job.status === filterStatus || (!job.status && filterStatus === 'active');
  });

  const backgroundStyle = settings?.panoramicBackground ? {
    backgroundImage: `url(${settings.panoramicBackground})`,
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    backgroundAttachment: 'fixed'
  } : {};

  return (
    <div 
      className={`min-h-screen ${darkMode ? 'bg-gray-900' : 'bg-gray-50'} transition-colors duration-300`}
      style={backgroundStyle}
    >
      {settings?.panoramicBackground && (
        <div className={`fixed inset-0 ${darkMode ? 'bg-gray-900/80' : 'bg-white/70'}`} />
      )}
      
      <div className="relative z-10">
        {/* Header */}
        <header className={`sticky top-0 z-20 ${darkMode ? 'bg-gray-800/95' : 'bg-white/95'} backdrop-blur border-b ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
          <div className="max-w-7xl mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                {settings?.companyLogo ? (
                  <img src={settings.companyLogo} alt="Logo" className="h-10 w-auto" />
                ) : (
                  <h1 className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                    SiteMaster Diary
                  </h1>
                )}
              </div>
              
              <div className="flex items-center gap-2">
                <Button 
                  variant="outline" 
                  size="icon"
                  onClick={() => setShowSearch(true)}
                  className="dark:border-gray-600"
                >
                  <Search className="w-4 h-4" />
                </Button>
                <Button 
                  variant="outline" 
                  size="icon"
                  onClick={toggleDarkMode}
                  className="dark:border-gray-600"
                >
                  {darkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
                </Button>
                <Button 
                  variant="outline" 
                  size="icon"
                  onClick={loadData}
                  className="dark:border-gray-600"
                >
                  <RefreshCw className="w-4 h-4" />
                </Button>
                <Button 
                  variant="outline"
                  onClick={handleExportAll}
                  className="dark:border-gray-600"
                >
                  <FileDown className="w-4 h-4 mr-2" />
                  Export PDF
                </Button>
                <Button onClick={() => setShowJobForm(true)}>
                  <Plus className="w-4 h-4 mr-2" />
                  New Job
                </Button>
              </div>
            </div>

            {/* Navigation */}
            <nav className="flex gap-2 mt-4 overflow-x-auto pb-2">
              <Link to={createPageUrl('Dashboard')}>
                <Button variant="ghost" size="sm" className={darkMode ? 'text-gray-300' : ''}>
                  <Briefcase className="w-4 h-4 mr-2" />
                  Dashboard
                </Button>
              </Link>
              <Link to={createPageUrl('CalendarView')}>
                <Button variant="ghost" size="sm" className={darkMode ? 'text-gray-300' : ''}>
                  <Calendar className="w-4 h-4 mr-2" />
                  Calendar
                </Button>
              </Link>
              <Link to={createPageUrl('Reports')}>
                <Button variant="ghost" size="sm" className={darkMode ? 'text-gray-300' : ''}>
                  <BarChart3 className="w-4 h-4 mr-2" />
                  Reports
                </Button>
              </Link>
              <Link to={createPageUrl('Inventory')}>
                <Button variant="ghost" size="sm" className={darkMode ? 'text-gray-300' : ''}>
                  Inventory
                </Button>
              </Link>
              <Link to={createPageUrl('Crew')}>
                <Button variant="ghost" size="sm" className={darkMode ? 'text-gray-300' : ''}>
                  Crew
                </Button>
              </Link>
              <Link to={createPageUrl('SafetyChecklists')}>
                <Button variant="ghost" size="sm" className={darkMode ? 'text-gray-300' : ''}>
                  Safety
                </Button>
              </Link>
              <Link to={createPageUrl('SettingsPage')}>
                <Button variant="ghost" size="sm" className={darkMode ? 'text-gray-300' : ''}>
                  <Settings className="w-4 h-4 mr-2" />
                  Settings
                </Button>
              </Link>
            </nav>
          </div>
        </header>

        {/* Main Content */}
        <main className="max-w-7xl mx-auto px-4 py-6 space-y-6">
          {/* Stats */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <DashboardStats 
              jobs={jobs}
              tasks={tasks}
              orders={orders}
              tools={tools}
              timeEntries={timeEntries}
            />
          </motion.div>

          {/* Filter */}
          <div className="flex items-center gap-4">
            <span className={`text-sm font-medium ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              Filter:
            </span>
            <div className="flex gap-2">
              {['all', 'active', 'on-hold', 'completed'].map(status => (
                <Button
                  key={status}
                  variant={filterStatus === status ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setFilterStatus(status)}
                  className="capitalize dark:border-gray-600"
                >
                  {status}
                </Button>
              ))}
            </div>
          </div>

          {/* Jobs Grid */}
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {[1, 2, 3, 4, 5, 6].map(i => (
                <div 
                  key={i}
                  className={`h-64 rounded-lg animate-pulse ${darkMode ? 'bg-gray-800' : 'bg-gray-200'}`}
                />
              ))}
            </div>
          ) : filteredJobs.length === 0 ? (
            <div className={`text-center py-12 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              <Briefcase className="w-16 h-16 mx-auto mb-4 opacity-50" />
              <h3 className="text-xl font-medium mb-2">No jobs found</h3>
              <p className="mb-4">Get started by creating your first job</p>
              <Button onClick={() => setShowJobForm(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Create Job
              </Button>
            </div>
          ) : (
            <motion.div 
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3, staggerChildren: 0.1 }}
            >
              {filteredJobs.map((job, index) => (
                <motion.div
                  key={job._id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <JobCard
                    job={job}
                    tasks={tasks}
                    orders={orders}
                    tools={tools}
                    timeEntries={timeEntries}
                    onClick={(j) => window.location.href = createPageUrl(`JobDetail?id=${j._id}`)}
                  />
                </motion.div>
              ))}
            </motion.div>
          )}
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
      </div>

      {/* Modals */}
      <JobForm
        open={showJobForm}
        onClose={() => setShowJobForm(false)}
        onSave={handleCreateJob}
      />

      <GlobalSearch
        open={showSearch}
        onClose={() => setShowSearch(false)}
        onResultClick={handleSearchResult}
      />
    </div>
  );
}