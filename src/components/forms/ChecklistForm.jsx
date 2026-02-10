import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Plus, Trash2, GripVertical } from 'lucide-react';
import { sanitizeInput } from '../db/database';

const defaultTemplates = {
  safety: [
    'PPE inspection completed',
    'Fire extinguishers accessible',
    'First aid kit stocked',
    'Emergency exits clear',
    'Safety signage visible',
    'Electrical cords inspected',
    'Scaffolding secured',
    'Fall protection in place'
  ],
  opening: [
    'Site secured overnight',
    'Equipment accounted for',
    'Weather conditions assessed',
    'Crew briefing completed',
    'Materials inventory checked',
    'Permits on display'
  ],
  closing: [
    'Tools secured',
    'Equipment shut down',
    'Site cleaned',
    'Hazards marked',
    'Security measures activated',
    'Daily log completed'
  ]
};

export default function ChecklistForm({ open, onClose, onSave, initialData }) {
  const [formData, setFormData] = useState(initialData || {
    name: '',
    type: 'custom',
    items: []
  });
  const [errors, setErrors] = useState({});
  const [newItem, setNewItem] = useState('');

  const validate = () => {
    const newErrors = {};
    if (!formData.name?.trim()) newErrors.name = 'Checklist name is required';
    if (formData.items.length === 0) newErrors.items = 'Add at least one item';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;
    
    const sanitizedData = {
      ...formData,
      name: sanitizeInput(formData.name),
      items: formData.items.map(item => sanitizeInput(item))
    };
    
    onSave(sanitizedData);
    onClose();
  };

  const addItem = () => {
    if (newItem.trim()) {
      setFormData(prev => ({
        ...prev,
        items: [...prev.items, newItem.trim()]
      }));
      setNewItem('');
      if (errors.items) {
        setErrors(prev => ({ ...prev, items: null }));
      }
    }
  };

  const removeItem = (index) => {
    setFormData(prev => ({
      ...prev,
      items: prev.items.filter((_, i) => i !== index)
    }));
  };

  const loadTemplate = (templateType) => {
    if (defaultTemplates[templateType]) {
      setFormData(prev => ({
        ...prev,
        type: templateType,
        items: [...defaultTemplates[templateType]]
      }));
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto dark:bg-gray-800">
        <DialogHeader>
          <DialogTitle className="dark:text-white">
            {initialData ? 'Edit Checklist Template' : 'Create Checklist Template'}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="name" className="dark:text-gray-300">Template Name *</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              className={`dark:bg-gray-700 dark:text-white ${errors.name ? 'border-red-500' : ''}`}
              placeholder="e.g., Morning Safety Checklist"
            />
            {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
          </div>

          <div>
            <Label className="dark:text-gray-300">Load Template</Label>
            <div className="flex gap-2 mt-2">
              <Button type="button" variant="outline" size="sm" onClick={() => loadTemplate('safety')}>
                Safety
              </Button>
              <Button type="button" variant="outline" size="sm" onClick={() => loadTemplate('opening')}>
                Site Opening
              </Button>
              <Button type="button" variant="outline" size="sm" onClick={() => loadTemplate('closing')}>
                Site Closing
              </Button>
            </div>
          </div>

          <div>
            <Label className="dark:text-gray-300">Checklist Items</Label>
            <div className="flex gap-2 mt-2">
              <Input
                value={newItem}
                onChange={(e) => setNewItem(e.target.value)}
                className="dark:bg-gray-700 dark:text-white"
                placeholder="Add new item..."
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addItem())}
              />
              <Button type="button" onClick={addItem}>
                <Plus className="w-4 h-4" />
              </Button>
            </div>
            {errors.items && <p className="text-red-500 text-sm mt-1">{errors.items}</p>}
          </div>

          <div className="space-y-2 max-h-[300px] overflow-y-auto">
            {formData.items.map((item, index) => (
              <div 
                key={index} 
                className="flex items-center gap-2 p-2 bg-gray-50 dark:bg-gray-700 rounded"
              >
                <GripVertical className="w-4 h-4 text-gray-400 cursor-move" />
                <span className="flex-1 text-sm dark:text-white">{item}</span>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                  onClick={() => removeItem(index)}
                >
                  <Trash2 className="w-4 h-4 text-red-500" />
                </Button>
              </div>
            ))}
            {formData.items.length === 0 && (
              <p className="text-sm text-gray-500 dark:text-gray-400 text-center py-4">
                No items added yet. Add items above or load a template.
              </p>
            )}
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit">
              {initialData ? 'Update' : 'Create'} Template
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}