import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';

import { useTheme } from '../components/ui/ThemeContext';
import { JobsAPI, TasksAPI, TimeEntriesAPI } from '../components/db/database';
import ProgressChart from '../components/charts/ProgressChart';

export default function Reports() {
  const { darkMode, settings } = useTheme();
  const [jobs, setJobs] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [timeEntries, setTimeEntries] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    const [j, t, te] = await Promise.all([
      JobsAPI.getAll(),
      TasksAPI.getAll(),
      TimeEntriesAPI.getAll()
    ]);
    setJobs(j);
    setTasks(t);
    setTimeEntries(te);
    setLoading(false);
  };

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
              <h1 className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                Reports & Analytics
              </h1>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-6">
        {loading ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {[1, 2, 3, 4].map(i => (
              <div 
                key={i}
                className={`h-80 rounded-lg animate-pulse ${darkMode ? 'bg-gray-800' : 'bg-gray-200'}`}
              />
            ))}
          </div>
        ) : (
          <ProgressChart
            jobs={jobs}
            tasks={tasks}
            timeEntries={timeEntries}
            darkMode={darkMode}
          />
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
  );
}