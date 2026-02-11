import React, { useState, useEffect } from "react";
import { Button } from "../ui/button";
import { Card, CardContent } from "../ui/card";
import { Badge } from "../ui/badge";
import { Input } from "../ui/input";
import { ArrowLeft, Plus, Search, Edit, Trash2, Phone, Mail, User } from "lucide-react";
import { Link } from "react-router-dom";
import { createPageUrl } from "../utils";

import { useTheme } from "../ui/ThemeContent";
import { CrewAPI } from "../db/database";
import CrewForm from "../forms/CrewForm";

export default function Crew() {
  const { darkMode } = useTheme();
  const [crew, setCrew] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editingMember, setEditingMember] = useState(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    const members = await CrewAPI.getAll();
    setCrew(members);
    setLoading(false);
  };

  const handleSave = async (data) => {
    if (editingMember) {
      await CrewAPI.update(editingMember._id, data);
    } else {
      await CrewAPI.create(data);
    }
    loadData();
    setEditingMember(null);
  };

  const handleDelete = async (id) => {
    if (confirm("Delete this crew member?")) {
      await CrewAPI.delete(id);
      loadData();
    }
  };

  const filteredCrew = crew.filter(
    (member) =>
      member.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      member.role?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const roleColors = {
    foreman: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300",
    carpenter: "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300",
    electrician: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300",
    plumber: "bg-cyan-100 text-cyan-800 dark:bg-cyan-900 dark:text-cyan-300",
    laborer: "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300",
    operator: "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300",
    mason: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300",
    welder: "bg-pink-100 text-pink-800 dark:bg-pink-900 dark:text-pink-300",
    painter: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300",
    other: "bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-300",
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
              <h1 className={`text-2xl font-bold ${darkMode ? "text-white" : "text-gray-900"}`}>Crew List</h1>
            </div>
            <Button
              onClick={() => {
                setEditingMember(null);
                setShowForm(true);
              }}
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Member
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-6 space-y-6">
        {/* Search */}
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <Input
            placeholder="Search crew..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 dark:bg-gray-800 dark:border-gray-700"
          />
        </div>

        {/* Crew Grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div
                key={i}
                className={`h-48 rounded-lg animate-pulse ${darkMode ? "bg-gray-800" : "bg-gray-200"}`}
              />
            ))}
          </div>
        ) : filteredCrew.length === 0 ? (
          <Card className="dark:bg-gray-800 dark:border-gray-700">
            <CardContent className="py-12 text-center">
              <User className="w-16 h-16 mx-auto mb-4 opacity-50 text-gray-400" />
              <p className={darkMode ? "text-gray-400" : "text-gray-600"}>
                {searchTerm ? "No crew members found" : "No crew members yet. Add your first member."}
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredCrew.map((member) => (
              <Card key={member._id} className="dark:bg-gray-800 dark:border-gray-700">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-12 h-12 rounded-full ${
                          darkMode ? "bg-gray-700" : "bg-gray-200"
                        } flex items-center justify-center`}
                      >
                        <User className={`w-6 h-6 ${darkMode ? "text-gray-400" : "text-gray-500"}`} />
                      </div>
                      <div>
                        <h3 className={`font-semibold ${darkMode ? "text-white" : ""}`}>{member.name}</h3>
                        <Badge className={roleColors[member.role] || roleColors.other}>
                          {member.role || "Unassigned"}
                        </Badge>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    {member.phone && (
                      <a
                        href={`tel:${member.phone}`}
                        className={`flex items-center gap-2 text-sm ${
                          darkMode ? "text-gray-400 hover:text-blue-400" : "text-gray-600 hover:text-blue-600"
                        }`}
                      >
                        <Phone className="w-4 h-4" />
                        {member.phone}
                      </a>
                    )}
                    {member.email && (
                      <a
                        href={`mailto:${member.email}`}
                        className={`flex items-center gap-2 text-sm ${
                          darkMode ? "text-gray-400 hover:text-blue-400" : "text-gray-600 hover:text-blue-600"
                        }`}
                      >
                        <Mail className="w-4 h-4" />
                        {member.email}
                      </a>
                    )}
                    {member.certifications && (
                      <div className={`text-sm ${darkMode ? "text-gray-400" : "text-gray-600"}`}>
                        <span className="font-medium">Certifications:</span> {member.certifications}
                      </div>
                    )}
                    {member.emergencyContact && (
                      <div className={`text-sm ${darkMode ? "text-gray-400" : "text-gray-600"}`}>
                        <span className="font-medium">Emergency:</span> {member.emergencyContact}
                        {member.emergencyPhone && ` (${member.emergencyPhone})`}
                      </div>
                    )}
                  </div>

                  <div className="flex gap-2 mt-4">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setEditingMember(member);
                        setShowForm(true);
                      }}
                      className="flex-1 dark:border-gray-600"
                    >
                      <Edit className="w-4 h-4 mr-1" />
                      Edit
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDelete(member._id)}
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
      <CrewForm
        open={showForm}
        onClose={() => {
          setShowForm(false);
          setEditingMember(null);
        }}
        onSave={handleSave}
        initialData={editingMember}
      />
    </div>
  );
}
