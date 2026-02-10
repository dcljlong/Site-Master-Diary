import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { sanitizeInput } from '../db/database';

export default function JobForm({ open, onClose, onSave, initialData }) {
  const [formData, setFormData] = useState(initialData || {
    name: '',
    address: '',
    client: '',
    status: 'active',
    progress: 0,
    startDate: '',
    expectedEndDate: '',
    notes: ''
  });
  const [errors, setErrors] = useState({});

  const validate = () => {
    const newErrors = {};
    if (!formData.name?.trim()) newErrors.name = 'Job name is required';
    if (!formData.address?.trim()) newErrors.address = 'Address is required';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;
    
    const sanitizedData = {
      ...formData,
      name: sanitizeInput(formData.name),
      address: sanitizeInput(formData.address),
      client: sanitizeInput(formData.client),
      notes: sanitizeInput(formData.notes)
    };
    
    onSave(sanitizedData);
    onClose();
  };

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: null }));
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto dark:bg-gray-800">
        <DialogHeader>
          <DialogTitle className="dark:text-white">
            {initialData ? 'Edit Job' : 'Create New Job'}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="name" className="dark:text-gray-300">Job Name *</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => handleChange('name', e.target.value)}
              className={`dark:bg-gray-700 dark:text-white ${errors.name ? 'border-red-500' : ''}`}
              placeholder="e.g., Downtown Office Building"
            />
            {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
          </div>

          <div>
            <Label htmlFor="address" className="dark:text-gray-300">Address *</Label>
            <Input
              id="address"
              value={formData.address}
              onChange={(e) => handleChange('address', e.target.value)}
              className={`dark:bg-gray-700 dark:text-white ${errors.address ? 'border-red-500' : ''}`}
              placeholder="123 Main St, City, State"
            />
            {errors.address && <p className="text-red-500 text-sm mt-1">{errors.address}</p>}
          </div>

          <div>
            <Label htmlFor="client" className="dark:text-gray-300">Client</Label>
            <Input
              id="client"
              value={formData.client}
              onChange={(e) => handleChange('client', e.target.value)}
              className="dark:bg-gray-700 dark:text-white"
              placeholder="Client name"
            />
          </div>

          <div>
            <Label className="dark:text-gray-300">Status</Label>
            <Select value={formData.status} onValueChange={(v) => handleChange('status', v)}>
              <SelectTrigger className="dark:bg-gray-700 dark:text-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="on-hold">On Hold</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label className="dark:text-gray-300">Progress: {formData.progress}%</Label>
            <Slider
              value={[formData.progress]}
              onValueChange={([v]) => handleChange('progress', v)}
              max={100}
              step={5}
              className="mt-2"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="startDate" className="dark:text-gray-300">Start Date</Label>
              <Input
                id="startDate"
                type="date"
                value={formData.startDate}
                onChange={(e) => handleChange('startDate', e.target.value)}
                className="dark:bg-gray-700 dark:text-white"
              />
            </div>
            <div>
              <Label htmlFor="expectedEndDate" className="dark:text-gray-300">Expected End</Label>
              <Input
                id="expectedEndDate"
                type="date"
                value={formData.expectedEndDate}
                onChange={(e) => handleChange('expectedEndDate', e.target.value)}
                className="dark:bg-gray-700 dark:text-white"
              />
            </div>
          </div>

          <div>
            <Label htmlFor="notes" className="dark:text-gray-300">Notes</Label>
            <Textarea
              id="notes"
              value={formData.notes}
              onChange={(e) => handleChange('notes', e.target.value)}
              className="dark:bg-gray-700 dark:text-white"
              rows={3}
              placeholder="Additional notes..."
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit">
              {initialData ? 'Update' : 'Create'} Job
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}