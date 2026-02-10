import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { sanitizeInput } from '../db/database';

export default function ToolForm({ open, onClose, onSave, initialData, jobs }) {
  const [formData, setFormData] = useState(initialData || {
    name: '',
    serialNumber: '',
    category: 'power-tools',
    condition: 'good',
    assignedJobId: '',
    lastMaintenance: '',
    nextMaintenance: '',
    notes: ''
  });
  const [errors, setErrors] = useState({});

  const validate = () => {
    const newErrors = {};
    if (!formData.name?.trim()) newErrors.name = 'Tool name is required';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;
    
    const sanitizedData = {
      ...formData,
      name: sanitizeInput(formData.name),
      serialNumber: sanitizeInput(formData.serialNumber),
      notes: sanitizeInput(formData.notes)
    };
    
    onSave(sanitizedData);
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-lg dark:bg-gray-800">
        <DialogHeader>
          <DialogTitle className="dark:text-white">
            {initialData ? 'Edit Tool' : 'Add Tool'}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="name" className="dark:text-gray-300">Tool Name *</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              className={`dark:bg-gray-700 dark:text-white ${errors.name ? 'border-red-500' : ''}`}
              placeholder="e.g., DeWalt Circular Saw"
            />
            {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="serialNumber" className="dark:text-gray-300">Serial Number</Label>
              <Input
                id="serialNumber"
                value={formData.serialNumber}
                onChange={(e) => setFormData(prev => ({ ...prev, serialNumber: e.target.value }))}
                className="dark:bg-gray-700 dark:text-white"
                placeholder="SN123456"
              />
            </div>
            <div>
              <Label className="dark:text-gray-300">Category</Label>
              <Select 
                value={formData.category} 
                onValueChange={(v) => setFormData(prev => ({ ...prev, category: v }))}
              >
                <SelectTrigger className="dark:bg-gray-700 dark:text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="power-tools">Power Tools</SelectItem>
                  <SelectItem value="hand-tools">Hand Tools</SelectItem>
                  <SelectItem value="measuring">Measuring</SelectItem>
                  <SelectItem value="safety">Safety Equipment</SelectItem>
                  <SelectItem value="heavy-equipment">Heavy Equipment</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label className="dark:text-gray-300">Condition</Label>
              <Select 
                value={formData.condition} 
                onValueChange={(v) => setFormData(prev => ({ ...prev, condition: v }))}
              >
                <SelectTrigger className="dark:bg-gray-700 dark:text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="new">New</SelectItem>
                  <SelectItem value="good">Good</SelectItem>
                  <SelectItem value="fair">Fair</SelectItem>
                  <SelectItem value="needs-repair">Needs Repair</SelectItem>
                  <SelectItem value="out-of-service">Out of Service</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="dark:text-gray-300">Assigned to Job</Label>
              <Select 
                value={formData.assignedJobId || 'none'} 
                onValueChange={(v) => setFormData(prev => ({ ...prev, assignedJobId: v === 'none' ? '' : v }))}
              >
                <SelectTrigger className="dark:bg-gray-700 dark:text-white">
                  <SelectValue placeholder="Not assigned" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Not Assigned</SelectItem>
                  {jobs.map(job => (
                    <SelectItem key={job._id} value={job._id}>{job.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="lastMaintenance" className="dark:text-gray-300">Last Maintenance</Label>
              <Input
                id="lastMaintenance"
                type="date"
                value={formData.lastMaintenance}
                onChange={(e) => setFormData(prev => ({ ...prev, lastMaintenance: e.target.value }))}
                className="dark:bg-gray-700 dark:text-white"
              />
            </div>
            <div>
              <Label htmlFor="nextMaintenance" className="dark:text-gray-300">Next Maintenance</Label>
              <Input
                id="nextMaintenance"
                type="date"
                value={formData.nextMaintenance}
                onChange={(e) => setFormData(prev => ({ ...prev, nextMaintenance: e.target.value }))}
                className="dark:bg-gray-700 dark:text-white"
              />
            </div>
          </div>

          <div>
            <Label htmlFor="notes" className="dark:text-gray-300">Notes</Label>
            <Textarea
              id="notes"
              value={formData.notes}
              onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
              className="dark:bg-gray-700 dark:text-white"
              rows={2}
              placeholder="Additional notes..."
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit">
              {initialData ? 'Update' : 'Add'} Tool
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}