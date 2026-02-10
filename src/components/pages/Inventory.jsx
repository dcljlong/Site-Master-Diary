import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { ArrowLeft, Plus, Search, Edit, Trash2, AlertTriangle } from 'lucide-react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';

import { useTheme } from '../components/ui/ThemeContext';
import { InventoryAPI } from '../components/db/database';
import InventoryForm from '../components/forms/InventoryForm';

export default function Inventory() {
  const { darkMode } = useTheme();
  const [inventory, setInventory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingItem, setEditingItem] = useState(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    const items = await InventoryAPI.getAll();
    setInventory(items);
    setLoading(false);
  };

  const handleSave = async (data) => {
    if (editingItem) {
      await InventoryAPI.update(editingItem._id, data);
    } else {
      await InventoryAPI.create(data);
    }
    loadData();
    setEditingItem(null);
  };

  const handleDelete = async (id) => {
    if (confirm('Delete this item?')) {
      await InventoryAPI.delete(id);
      loadData();
    }
  };

  const filteredInventory = inventory.filter(item =>
    item.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.category?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const lowStockItems = inventory.filter(item => item.quantity <= (item.minStock || 10));

  const categoryColors = {
    materials: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300',
    fasteners: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300',
    electrical: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300',
    plumbing: 'bg-cyan-100 text-cyan-800 dark:bg-cyan-900 dark:text-cyan-300',
    safety: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300',
    consumables: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
    other: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300'
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
                Inventory
              </h1>
            </div>
            <Button onClick={() => { setEditingItem(null); setShowForm(true); }}>
              <Plus className="w-4 h-4 mr-2" />
              Add Item
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-6 space-y-6">
        {/* Low Stock Alert */}
        {lowStockItems.length > 0 && (
          <Card className="border-orange-500 dark:bg-orange-900/20">
            <CardContent className="py-4">
              <div className="flex items-center gap-2 text-orange-600 dark:text-orange-400">
                <AlertTriangle className="w-5 h-5" />
                <span className="font-medium">{lowStockItems.length} items are low on stock</span>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Search */}
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <Input
            placeholder="Search inventory..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 dark:bg-gray-800 dark:border-gray-700"
          />
        </div>

        {/* Inventory Grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1, 2, 3, 4, 5, 6].map(i => (
              <div 
                key={i}
                className={`h-40 rounded-lg animate-pulse ${darkMode ? 'bg-gray-800' : 'bg-gray-200'}`}
              />
            ))}
          </div>
        ) : filteredInventory.length === 0 ? (
          <Card className="dark:bg-gray-800 dark:border-gray-700">
            <CardContent className="py-12 text-center">
              <p className={darkMode ? 'text-gray-400' : 'text-gray-600'}>
                {searchTerm ? 'No items found' : 'No inventory items yet. Add your first item.'}
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredInventory.map(item => (
              <Card 
                key={item._id} 
                className={`dark:bg-gray-800 dark:border-gray-700 ${
                  item.quantity <= (item.minStock || 10) ? 'border-orange-500' : ''
                }`}
              >
                <CardHeader className="pb-2">
                  <div className="flex justify-between items-start">
                    <CardTitle className="text-lg dark:text-white">{item.name}</CardTitle>
                    <Badge className={categoryColors[item.category] || categoryColors.other}>
                      {item.category}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                        Quantity
                      </span>
                      <span className={`text-2xl font-bold ${
                        item.quantity <= (item.minStock || 10) ? 'text-orange-500' : darkMode ? 'text-white' : ''
                      }`}>
                        {item.quantity} {item.unit}
                      </span>
                    </div>
                    {item.location && (
                      <div className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                        Location: {item.location}
                      </div>
                    )}
                    {item.quantity <= (item.minStock || 10) && (
                      <div className="flex items-center gap-1 text-orange-500 text-sm">
                        <AlertTriangle className="w-4 h-4" />
                        Low stock (min: {item.minStock || 10})
                      </div>
                    )}
                  </div>
                  <div className="flex gap-2 mt-4">
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => { setEditingItem(item); setShowForm(true); }}
                      className="flex-1 dark:border-gray-600"
                    >
                      <Edit className="w-4 h-4 mr-1" />
                      Edit
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => handleDelete(item._id)}
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

      {/* Modal */}
      <InventoryForm
        open={showForm}
        onClose={() => { setShowForm(false); setEditingItem(null); }}
        onSave={handleSave}
        initialData={editingItem}
      />
    </div>
  );
}