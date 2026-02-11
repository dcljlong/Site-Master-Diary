import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Plus, Edit, Trash2, ClipboardList, Copy } from "lucide-react";
import { Link } from "react-router-dom";
import { createPageUrl } from "../utils";

import { useTheme } from "../ui/ThemeContent";
import { ChecklistsAPI } from "../db/database";
import ChecklistForm from "../forms/ChecklistForm";

export default function SafetyChecklists() {
  const { darkMode } = useTheme();
  const [checklists, setChecklists] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingChecklist, setEditingChecklist] = useState(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    const items = await ChecklistsAPI.getAll();
    setChecklists(items);
    setLoading(false);
  };

  const handleSave = async (data) => {
    if (editingChecklist) {
      await ChecklistsAPI.update(editingChecklist._id, data);
    } else {
      await ChecklistsAPI.create(data);
    }
    loadData();
    setEditingChecklist(null);
  };

  const handleDelete = async (id) => {
    if (confirm("Delete this checklist template?")) {
      await ChecklistsAPI.delete(id);
      loadData();
    }
  };

  const handleDuplicate = async (checklist) => {
    const newChecklist = {
      name: `${checklist.name} (Copy)`,
      type: checklist.type,
      items: [...checklist.items],
    };
    await ChecklistsAPI.create(newChecklist);
    loadData();
  };

  const typeColors = {
    safety: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300",
    opening: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300",
    closing: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300",
    custom: "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300",
  };

  return (
    <div className={`min-h-screen ${darkMode ? "bg-gray-900" : "bg-gray-50"}`}>
      {/* Header */}
      <header
        className={`sticky top-0 z-20 ${darkMode ? "bg-gray-800" : "bg-white"} border-b ${
          darkMode ? "border-gray-700" : "border-gray-200"
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link to={createPageUrl("Dashboard")}>
                <Button variant="ghost" size="icon">
                  <ArrowLeft className="w-5 h-5" />
                </Button>
              </Link>
              <h1 className={`text-2xl font-bold ${darkMode ? "text-white" : "text-gray-900"}`}>
                Safety Checklists
              </h1>
            </div>
            <Button
              onClick={() => {
                setEditingChecklist(null);
                setShowForm(true);
              }}
            >
              <Plus className="w-4 h-4 mr-2" />
              New Template
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-6 space-y-6">
        {/* Info Card */}
        <Card className={`border-blue-500 ${darkMode ? "bg-blue-900/20" : "bg-blue-50"}`}>
          <CardContent className="py-4">
            <p className={darkMode ? "text-blue-300" : "text-blue-800"}>
              Create checklist templates here. They can be used when creating daily logs for consistent safety tracking.
            </p>
          </CardContent>
        </Card>

        {/* Checklists Grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className={`h-64 rounded-lg animate-pulse ${darkMode ? "bg-gray-800" : "bg-gray-200"}`}
              />
            ))}
          </div>
        ) : checklists.length === 0 ? (
          <Card className="dark:bg-gray-800 dark:border-gray-700">
            <CardContent className="py-12 text-center">
              <ClipboardList className="w-16 h-16 mx-auto mb-4 opacity-50 text-gray-400" />
              <p className={darkMode ? "text-gray-400" : "text-gray-600"}>
                No checklist templates yet. Create your first template.
              </p>
              <Button
                className="mt-4"
                onClick={() => {
                  setEditingChecklist(null);
                  setShowForm(true);
                }}
              >
                <Plus className="w-4 h-4 mr-2" />
                Create Template
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {checklists.map((checklist) => (
              <Card key={checklist._id} className="dark:bg-gray-800 dark:border-gray-700">
                <CardHeader className="pb-2">
                  <div className="flex justify-between items-start">
                    <CardTitle className="text-lg dark:text-white">{checklist.name}</CardTitle>
                    <Badge className={typeColors[checklist.type] || typeColors.custom}>{checklist.type}</Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className={`text-sm mb-4 ${darkMode ? "text-gray-400" : "text-gray-600"}`}>
                    {checklist.items?.length || 0} items
                  </div>

                  <div
                    className={`max-h-40 overflow-y-auto space-y-1 mb-4 ${darkMode ? "text-gray-300" : "text-gray-700"}`}
                  >
                    {checklist.items?.slice(0, 6).map((item, i) => (
                      <div key={i} className="flex items-center gap-2 text-sm">
                        <div className={`w-4 h-4 rounded border ${darkMode ? "border-gray-600" : "border-gray-300"}`} />
                        <span className="truncate">{item}</span>
                      </div>
                    ))}
                    {(checklist.items?.length || 0) > 6 && (
                      <div className={`text-sm ${darkMode ? "text-gray-500" : "text-gray-400"}`}>
                        +{checklist.items.length - 6} more items
                      </div>
                    )}
                  </div>

                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setEditingChecklist(checklist);
                        setShowForm(true);
                      }}
                      className="flex-1 dark:border-gray-600"
                    >
                      <Edit className="w-4 h-4 mr-1" />
                      Edit
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => handleDuplicate(checklist)} className="dark:border-gray-600">
                      <Copy className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDelete(checklist._id)}
                      className="dark:border-gray-600"
                    >
                      <Trash2 className="w-4 h-4 text-red-500" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className={`py-6 text-center ${darkMode ? "text-gray-500" : "text-gray-400"}`}>
        <a
          href="https://github.com/dcljlong"
          target="_blank"
          rel="noopener noreferrer"
          className="hover:text-cyan-500 transition-colors"
        >
          github.com/dcljlong
        </a>
      </footer>

      {/* Modal */}
      <ChecklistForm
        open={showForm}
        onClose={() => {
          setShowForm(false);
          setEditingChecklist(null);
        }}
        onSave={handleSave}
        initialData={editingChecklist}
      />
    </div>
  );
}

