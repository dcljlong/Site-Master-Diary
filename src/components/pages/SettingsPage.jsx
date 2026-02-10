import React, { useState, useRef } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { ArrowLeft, Upload, Trash2, Image, Moon, Sun } from 'lucide-react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';

import { useTheme } from '../components/ui/ThemeContext';

export default function SettingsPage() {
  const { darkMode, toggleDarkMode, settings, updateSettings } = useTheme();
  const [companyName, setCompanyName] = useState(settings?.companyName || 'SiteMaster Diary');
  const [saving, setSaving] = useState(false);
  const logoInputRef = useRef(null);
  const bgInputRef = useRef(null);

  const handleLogoUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = async (event) => {
        await updateSettings({ companyLogo: event.target.result });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleBackgroundUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = async (event) => {
        await updateSettings({ panoramicBackground: event.target.result });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveLogo = async () => {
    await updateSettings({ companyLogo: null });
  };

  const handleRemoveBackground = async () => {
    await updateSettings({ panoramicBackground: null });
  };

  const handleSaveCompanyName = async () => {
    setSaving(true);
    await updateSettings({ companyName });
    setSaving(false);
  };

  return (
    <div className={`min-h-screen ${darkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
      {/* Header */}
      <header className={`sticky top-0 z-20 ${darkMode ? 'bg-gray-800' : 'bg-white'} border-b ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
        <div className="max-w-3xl mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <Link to={createPageUrl('Dashboard')}>
              <Button variant="ghost" size="icon">
                <ArrowLeft className="w-5 h-5" />
              </Button>
            </Link>
            <h1 className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
              Settings
            </h1>
          </div>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 py-6 space-y-6">
        {/* Appearance */}
        <Card className="dark:bg-gray-800 dark:border-gray-700">
          <CardHeader>
            <CardTitle className="dark:text-white">Appearance</CardTitle>
            <CardDescription className="dark:text-gray-400">
              Customize how the app looks
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Dark Mode Toggle */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                {darkMode ? <Moon className="w-5 h-5 text-gray-400" /> : <Sun className="w-5 h-5 text-yellow-500" />}
                <div>
                  <Label className="dark:text-white">Dark Mode</Label>
                  <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                    Toggle dark/light theme
                  </p>
                </div>
              </div>
              <Switch checked={darkMode} onCheckedChange={toggleDarkMode} />
            </div>
          </CardContent>
        </Card>

        {/* Branding */}
        <Card className="dark:bg-gray-800 dark:border-gray-700">
          <CardHeader>
            <CardTitle className="dark:text-white">Branding</CardTitle>
            <CardDescription className="dark:text-gray-400">
              Customize your company branding
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Company Name */}
            <div className="space-y-2">
              <Label className="dark:text-gray-300">Company Name</Label>
              <div className="flex gap-2">
                <Input
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  className="dark:bg-gray-700 dark:text-white"
                  placeholder="Your Company Name"
                />
                <Button onClick={handleSaveCompanyName} disabled={saving}>
                  {saving ? 'Saving...' : 'Save'}
                </Button>
              </div>
            </div>

            {/* Company Logo */}
            <div className="space-y-2">
              <Label className="dark:text-gray-300">Company Logo</Label>
              <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                Upload your company logo (recommended: 200x60px PNG)
              </p>
              <input
                ref={logoInputRef}
                type="file"
                accept="image/*"
                onChange={handleLogoUpload}
                className="hidden"
              />
              <div className="flex items-center gap-4">
                {settings?.companyLogo ? (
                  <div className="flex items-center gap-4">
                    <img 
                      src={settings.companyLogo} 
                      alt="Company Logo" 
                      className="h-12 w-auto rounded border dark:border-gray-600"
                    />
                    <Button variant="outline" onClick={handleRemoveLogo} className="dark:border-gray-600">
                      <Trash2 className="w-4 h-4 mr-2 text-red-500" />
                      Remove
                    </Button>
                  </div>
                ) : (
                  <Button variant="outline" onClick={() => logoInputRef.current?.click()} className="dark:border-gray-600">
                    <Upload className="w-4 h-4 mr-2" />
                    Upload Logo
                  </Button>
                )}
              </div>
            </div>

            {/* Panoramic Background */}
            <div className="space-y-2">
              <Label className="dark:text-gray-300">Dashboard Background</Label>
              <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                Upload a panoramic jobsite image for the dashboard background
              </p>
              <input
                ref={bgInputRef}
                type="file"
                accept="image/*"
                onChange={handleBackgroundUpload}
                className="hidden"
              />
              <div className="flex items-center gap-4">
                {settings?.panoramicBackground ? (
                  <div className="space-y-2 w-full">
                    <img 
                      src={settings.panoramicBackground} 
                      alt="Background" 
                      className="w-full h-32 object-cover rounded border dark:border-gray-600"
                    />
                    <Button variant="outline" onClick={handleRemoveBackground} className="dark:border-gray-600">
                      <Trash2 className="w-4 h-4 mr-2 text-red-500" />
                      Remove Background
                    </Button>
                  </div>
                ) : (
                  <Button variant="outline" onClick={() => bgInputRef.current?.click()} className="dark:border-gray-600">
                    <Image className="w-4 h-4 mr-2" />
                    Upload Background
                  </Button>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Data Management */}
        <Card className="dark:bg-gray-800 dark:border-gray-700">
          <CardHeader>
            <CardTitle className="dark:text-white">Data Management</CardTitle>
            <CardDescription className="dark:text-gray-400">
              Manage your local data storage
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className={`p-4 rounded-lg ${darkMode ? 'bg-gray-700' : 'bg-gray-100'}`}>
              <h4 className={`font-medium ${darkMode ? 'text-white' : ''}`}>Offline-First Architecture</h4>
              <p className={`text-sm mt-1 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                All your data is stored locally in your browser using PouchDB. 
                This means you can use the app offline and your data is always available.
              </p>
            </div>
            <div className={`p-4 rounded-lg ${darkMode ? 'bg-gray-700' : 'bg-gray-100'}`}>
              <h4 className={`font-medium ${darkMode ? 'text-white' : ''}`}>Future CouchDB Sync</h4>
              <p className={`text-sm mt-1 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                The app is designed to sync with CouchDB when you're ready to scale. 
                Simply configure your CouchDB server URL to enable real-time sync across devices.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* About */}
        <Card className="dark:bg-gray-800 dark:border-gray-700">
          <CardHeader>
            <CardTitle className="dark:text-white">About SiteMaster Diary</CardTitle>
          </CardHeader>
          <CardContent>
            <div className={`space-y-2 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              <p>Version 1.0.0</p>
              <p>A comprehensive construction site management application for supervisors.</p>
              <p>Features: Job tracking, daily logs, tasks, orders, tools, inventory, crew management, and safety checklists.</p>
              <div className="pt-4">
                <a 
                  href="https://github.com/dcljlong" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-cyan-500 hover:text-cyan-400"
                >
                  github.com/dcljlong
                </a>
              </div>
            </div>
          </CardContent>
        </Card>
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