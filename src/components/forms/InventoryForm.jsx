import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { sanitizeInput } from '../db/database';

export default function InventoryForm({ open, onClose, onSave, initialData }) {
  const [formData, setFormData] = useState(initialData || {
    name: '',
    category: 'materials',
    quantity: 0,
    unit: 'units',
    minStock: 10,
    location: '',
    notes: ''
  });
  const [errors, setErrors] = useState({});

  const validate = () => {
    const newErrors = {};
    if (!formData.name?.trim()) newErrors.name = 'Item name is required';
    if (formData.quantity < 0) newErrors.quantity = 'Quantity cannot be negative';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;
    
    const sanitizedData = {
      ...formData,
      name: sanitizeInput(formData.name),
      location: sanitizeInput(formData.location),
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
            {initialData ? 'Edit Inventory Item' : 'Add Inventory Item'}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="name" className="dark:text-gray-300">Item Name *</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              className={`dark:bg-gray-700 dark:text-white ${errors.name ? 'border-red-500' : ''}`}
              placeholder="e.g., 2x4 Lumber"
            />
            {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
          </div>

          <div className="grid grid-cols-2 gap-4">
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
                  <SelectItem value="materials">Materials</SelectItem>
                  <SelectItem value="fasteners">Fasteners</SelectItem>
                  <SelectItem value="electrical">Electrical</SelectItem>
                  <SelectItem value="plumbing">Plumbing</SelectItem>
                  <SelectItem value="safety">Safety Gear</SelectItem>
                  <SelectItem value="consumables">Consumables</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="dark:text-gray-300">Unit</Label>
              <Select 
                value={formData.unit} 
                onValueChange={(v) => setFormData(prev => ({ ...prev, unit: v }))}
              >
                <SelectTrigger className="dark:bg-gray-700 dark:text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="units">Units</SelectItem>
                  <SelectItem value="pieces">Pieces</SelectItem>
                  <SelectItem value="boxes">Boxes</SelectItem>
                  <SelectItem value="bags">Bags</SelectItem>
                  <SelectItem value="feet">Feet</SelectItem>
                  <SelectItem value="yards">Yards</SelectItem>
                  <SelectItem value="gallons">Gallons</SelectItem>
                  <SelectItem value="lbs">Pounds</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="quantity" className="dark:text-gray-300">Quantity *</Label>
              <Input
                id="quantity"
                type="number"
                min="0"
                value={formData.quantity}
                onChange={(e) => setFormData(prev => ({ ...prev, quantity: parseInt(e.target.value) || 0 }))}
                className={`dark:bg-gray-700 dark:text-white ${errors.quantity ? 'border-red-500' : ''}`}
              />
              {errors.quantity && <p className="text-red-500 text-sm mt-1">{errors.quantity}</p>}
            </div>
            <div>
              <Label htmlFor="minStock" className="dark:text-gray-300">Min Stock Level</Label>
              <Input
                id="minStock"
                type="number"
                min="0"
                value={formData.minStock}
                onChange={(e) => setFormData(prev => ({ ...prev, minStock: parseInt(e.target.value) || 0 }))}
                className="dark:bg-gray-700 dark:text-white"
              />
            </div>
          </div>

          <div>
            <Label htmlFor="location" className="dark:text-gray-300">Storage Location</Label>
            <Input
              id="location"
              value={formData.location}
              onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
              className="dark:bg-gray-700 dark:text-white"
              placeholder="e.g., Warehouse A, Shelf 3"
            />
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
              {initialData ? 'Update' : 'Add'} Item
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}