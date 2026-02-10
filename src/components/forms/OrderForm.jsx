import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { sanitizeInput } from '../db/database';

export default function OrderForm({ open, onClose, onSave, initialData, jobs }) {
  const [formData, setFormData] = useState(initialData || {
    item: '',
    quantity: 1,
    unit: 'units',
    jobId: '',
    status: 'pending',
    priority: 'medium',
    supplier: '',
    expectedDelivery: '',
    notes: '',
    cost: ''
  });
  const [errors, setErrors] = useState({});

  const validate = () => {
    const newErrors = {};
    if (!formData.item?.trim()) newErrors.item = 'Item name is required';
    if (!formData.jobId) newErrors.jobId = 'Job is required';
    if (!formData.quantity || formData.quantity < 1) newErrors.quantity = 'Valid quantity required';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;
    
    const sanitizedData = {
      ...formData,
      item: sanitizeInput(formData.item),
      supplier: sanitizeInput(formData.supplier),
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
            {initialData ? 'Edit Order' : 'Create Order'}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="item" className="dark:text-gray-300">Item *</Label>
            <Input
              id="item"
              value={formData.item}
              onChange={(e) => setFormData(prev => ({ ...prev, item: e.target.value }))}
              className={`dark:bg-gray-700 dark:text-white ${errors.item ? 'border-red-500' : ''}`}
              placeholder="Material or item name"
            />
            {errors.item && <p className="text-red-500 text-sm mt-1">{errors.item}</p>}
          </div>

          <div>
            <Label className="dark:text-gray-300">Job *</Label>
            <Select 
              value={formData.jobId} 
              onValueChange={(v) => setFormData(prev => ({ ...prev, jobId: v }))}
            >
              <SelectTrigger className={`dark:bg-gray-700 dark:text-white ${errors.jobId ? 'border-red-500' : ''}`}>
                <SelectValue placeholder="Select job" />
              </SelectTrigger>
              <SelectContent>
                {jobs.map(job => (
                  <SelectItem key={job._id} value={job._id}>{job.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.jobId && <p className="text-red-500 text-sm mt-1">{errors.jobId}</p>}
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <Label htmlFor="quantity" className="dark:text-gray-300">Quantity *</Label>
              <Input
                id="quantity"
                type="number"
                min="1"
                value={formData.quantity}
                onChange={(e) => setFormData(prev => ({ ...prev, quantity: parseInt(e.target.value) || 1 }))}
                className={`dark:bg-gray-700 dark:text-white ${errors.quantity ? 'border-red-500' : ''}`}
              />
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
                  <SelectItem value="bags">Bags</SelectItem>
                  <SelectItem value="boxes">Boxes</SelectItem>
                  <SelectItem value="pallets">Pallets</SelectItem>
                  <SelectItem value="tons">Tons</SelectItem>
                  <SelectItem value="yards">Cubic Yards</SelectItem>
                  <SelectItem value="feet">Linear Feet</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="cost" className="dark:text-gray-300">Est. Cost</Label>
              <Input
                id="cost"
                type="number"
                min="0"
                step="0.01"
                value={formData.cost}
                onChange={(e) => setFormData(prev => ({ ...prev, cost: e.target.value }))}
                className="dark:bg-gray-700 dark:text-white"
                placeholder="$"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label className="dark:text-gray-300">Status</Label>
              <Select 
                value={formData.status} 
                onValueChange={(v) => setFormData(prev => ({ ...prev, status: v }))}
              >
                <SelectTrigger className="dark:bg-gray-700 dark:text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="ordered">Ordered</SelectItem>
                  <SelectItem value="shipped">Shipped</SelectItem>
                  <SelectItem value="delivered">Delivered</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="dark:text-gray-300">Priority</Label>
              <Select 
                value={formData.priority} 
                onValueChange={(v) => setFormData(prev => ({ ...prev, priority: v }))}
              >
                <SelectTrigger className="dark:bg-gray-700 dark:text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Low</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="urgent">Urgent</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="supplier" className="dark:text-gray-300">Supplier</Label>
              <Input
                id="supplier"
                value={formData.supplier}
                onChange={(e) => setFormData(prev => ({ ...prev, supplier: e.target.value }))}
                className="dark:bg-gray-700 dark:text-white"
                placeholder="Supplier name"
              />
            </div>
            <div>
              <Label htmlFor="expectedDelivery" className="dark:text-gray-300">Expected Delivery</Label>
              <Input
                id="expectedDelivery"
                type="date"
                value={formData.expectedDelivery}
                onChange={(e) => setFormData(prev => ({ ...prev, expectedDelivery: e.target.value }))}
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
              {initialData ? 'Update' : 'Create'} Order
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}