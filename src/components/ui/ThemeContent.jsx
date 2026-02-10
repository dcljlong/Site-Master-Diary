import React, { createContext, useContext, useState, useEffect } from 'react';
import { SettingsAPI } from '../db/database';

const ThemeContext = createContext();

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

export const ThemeProvider = ({ children }) => {
  const [darkMode, setDarkMode] = useState(false);
  const [settings, setSettings] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    const s = await SettingsAPI.get();
    setSettings(s);
    setDarkMode(s.darkMode || false);
    setLoading(false);
  };

  const toggleDarkMode = async () => {
    const newMode = !darkMode;
    setDarkMode(newMode);
    await SettingsAPI.update({ darkMode: newMode });
    setSettings(prev => ({ ...prev, darkMode: newMode }));
  };

  const updateSettings = async (newSettings) => {
    const updated = await SettingsAPI.update(newSettings);
    setSettings(updated);
    if (newSettings.darkMode !== undefined) {
      setDarkMode(newSettings.darkMode);
    }
  };

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center bg-gray-900 text-white">Loading...</div>;
  }

  return (
    <ThemeContext.Provider value={{ darkMode, toggleDarkMode, settings, updateSettings, loadSettings }}>
      <div className={darkMode ? 'dark' : ''}>
        {children}
      </div>
    </ThemeContext.Provider>
  );
};