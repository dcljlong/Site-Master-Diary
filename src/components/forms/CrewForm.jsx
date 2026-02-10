import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { sanitizeInput } from '../db/database';

export default function CrewForm({ open, onClose, onSave, initialData }) {
  const [formData, setFormData] = useState(initialData || {
    name: '',
    role: '',
    phone: '',
    email: '',
    emergencyContact: '',
    emergencyPhone: '',
    certifications: '',
    notes: ''
  });
  const [errors, setErrors] = useState({});

  const validate = () => {
    const newErrors = {};
    if (!formData.name?.trim()) newErrors.name = 'Name is required';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;
    
    const sanitizedData = {
      ...formData,
      name: sanitizeInput(formData.name),
      role: sanitizeInput(formData.role),
      phone: sanitizeInput(formData.phone),
      email: sanitizeInput(formData.email),
      emergencyContact: sanitizeInput(formData.emergencyContact),
      emergencyPhone: sanitizeInput(formData.emergencyPhone),
      certifications: sanitizeInput(formData.certifications),
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
            {initialData ? 'Edit Crew Member' : 'Add Crew Member'}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="name" className="dark:text-gray-300">Full Name *</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              className={`dark:bg-gray-700 dark:text-white ${errors.name ? 'border-red-500' : ''}`}
              placeholder="John Smith"
            />
            {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
          </div>

          <div>
            <Label className="dark:text-gray-300">Role</Label>
            <Select 
              value={formData.role} 
              onValueChange={(v) => setFormData(prev => ({ ...prev, role: v }))}
            >
              <SelectTrigger className="dark:bg-gray-700 dark:text-white">
                <SelectValue placeholder="Select role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="foreman">Foreman</SelectItem>
                <SelectItem value="carpenter">Carpenter</SelectItem>
                <SelectItem value="electrician">Electrician</SelectItem>
                <SelectItem value="plumber">Plumber</SelectItem>
                <SelectItem value="laborer">Laborer</SelectItem>
                <SelectItem value="operator">Equipment Operator</SelectItem>
                <SelectItem value="mason">Mason</SelectItem>
                <SelectItem value="welder">Welder</SelectItem>
                <SelectItem value="painter">Painter</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="phone" className="dark:text-gray-300">Phone</Label>
              <Input
                id="phone"
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                className="dark:bg-gray-700 dark:text-white"
                placeholder="(555) 123-4567"
              />
            </div>
            <div>
              <Label htmlFor="email" className="dark:text-gray-300">Email</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                className="dark:bg-gray-700 dark:text-white"
                placeholder="john@example.com"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="emergencyContact" className="dark:text-gray-300">Emergency Contact</Label>
              <Input
                id="emergencyContact"
                value={formData.emergencyContact}
                onChange={(e) => setFormData(prev => ({ ...prev, emergencyContact: e.target.value }))}
                className="dark:bg-gray-700 dark:text-white"
                placeholder="Contact name"
              />
            </div>
            <div>
              <Label htmlFor="emergencyPhone" className="dark:text-gray-300">Emergency Phone</Label>
              <Input
                id="emergencyPhone"
                type="tel"
                value={formData.emergencyPhone}
                onChange={(e) => setFormData(prev => ({ ...prev, emergencyPhone: e.target.value }))}
                className="dark:bg-gray-700 dark:text-white"
                placeholder="(555) 987-6543"
              />
            </div>
          </div>

          <div>
            <Label htmlFor="certifications" className="dark:text-gray-300">Certifications</Label>
            <Input
              id="certifications"
              value={formData.certifications}
              onChange={(e) => setFormData(prev => ({ ...prev, certifications: e.target.value }))}
              className="dark:bg-gray-700 dark:text-white"
              placeholder="OSHA 10, First Aid, etc."
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
              {initialData ? 'Update' : 'Add'} Member
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}