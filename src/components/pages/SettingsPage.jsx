import React, { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { ArrowLeft, Upload, Trash2, Image, Moon, Sun } from "lucide-react";
import { Link } from "react-router-dom";
import { createPageUrl } from "../utils";

import { useTheme } from "../ui/ThemeContent";

export default function SettingsPage() {
  const { darkMode, toggleDarkMode, settings, updateSettings } = useTheme();
  const [companyName, setCompanyName] = useState(settings?.companyName || "SiteMaster Diary");
  const [saving, setSaving] = useState(false);
  const logoInputRef = useRef(null);
  const bgInputRef = useRef(null);

  const handleLogoUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
      await updateSettings({ companyLogo: event.target.result });
    };
    reader.readAsDataURL(file);
  };

  const handleBackgroundUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
      await updateSettings({ panoramicBackground: event.target.result });
    };
    reader.readAsDataURL(file);
  };

  const handleSaveCompanyName = async () => {
    setSaving(true);
    await updateSettings({ companyName });
    setSaving(false);
  };

  return (
    <div className={`min-h-screen ${darkMode ? "bg-gray-900" : "bg-gray-50"}`}>
      <header
        className={`sticky top-0 z-20 ${darkMode ? "bg-gray-800" : "bg-white"} border-b ${
          darkMode ? "border-gray-700" : "border-gray-200"
        }`}
      >
        <div className="max-w-3xl mx-auto px-4 py-4 flex items-center gap-4">
          <Link to={createPageUrl("Dashboard")}>
            <Button variant="ghost" size="icon">
              <ArrowLeft className="w-5 h-5" />
            </Button>
          </Link>
          <h1 className={`text-2xl font-bold ${darkMode ? "text-white" : "text-gray-900"}`}>
            Settings
          </h1>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 py-6 space-y-6">
        <Card className="dark:bg-gray-800 dark:border-gray-700">
          <CardHeader>
            <CardTitle className="dark:text-white">Appearance</CardTitle>
            <CardDescription className="dark:text-gray-400">
              Customize how the app looks
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                {darkMode ? <Moon /> : <Sun />}
                <Label>Dark Mode</Label>
              </div>
              <Switch checked={darkMode} onCheckedChange={toggleDarkMode} />
            </div>
          </CardContent>
        </Card>

        <Card className="dark:bg-gray-800 dark:border-gray-700">
          <CardHeader>
            <CardTitle className="dark:text-white">Branding</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Input value={companyName} onChange={(e) => setCompanyName(e.target.value)} />
            <Button onClick={handleSaveCompanyName} disabled={saving}>
              {saving ? "Saving..." : "Save"}
            </Button>

            <input ref={logoInputRef} type="file" hidden onChange={handleLogoUpload} />
            <input ref={bgInputRef} type="file" hidden onChange={handleBackgroundUpload} />

            <Button variant="outline" onClick={() => logoInputRef.current?.click()}>
              <Upload className="mr-2" /> Upload Logo
            </Button>
            <Button variant="outline" onClick={() => bgInputRef.current?.click()}>
              <Image className="mr-2" /> Upload Background
            </Button>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}

