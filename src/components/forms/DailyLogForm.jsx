import React, { useState, useRef } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent } from "@/components/ui/card";
import { Camera, X, Plus } from 'lucide-react';
import { sanitizeInput } from '../db/database';
import { format } from 'date-fns';

const weatherOptions = ['Sunny', 'Cloudy', 'Rainy', 'Windy', 'Stormy', 'Snow', 'Foggy'];

export default function DailyLogForm({ open, onClose, onSave, initialData, jobId, crew }) {
  const [formData, setFormData] = useState(initialData || {
    jobId,
    date: format(new Date(), 'yyyy-MM-dd'),
    weather: '',
    temperature: '',
    crewPresent: [],
    notes: '',
    safetyObservations: '',
    photos: [],
    checklist: [
      { item: 'Site secured', checked: false },
      { item: 'Safety equipment available', checked: false },
      { item: 'Materials delivered', checked: false },
      { item: 'Equipment operational', checked: false },
      { item: 'Permits on site', checked: false }
    ],
    hoursWorked: 8
  });
  const [errors, setErrors] = useState({});
  const fileInputRef = useRef(null);

  const validate = () => {
    const newErrors = {};
    if (!formData.date) newErrors.date = 'Date is required';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handlePhotoUpload = (e) => {
    const files = Array.from(e.target.files);
    files.forEach(file => {
      const reader = new FileReader();
      reader.onload = (event) => {
        setFormData(prev => ({
          ...prev,
          photos: [...prev.photos, {
            data: event.target.result,
            name: file.name,
            timestamp: new Date().toISOString()
          }]
        }));
      };
      reader.readAsDataURL(file);
    });
  };

  const removePhoto = (index) => {
    setFormData(prev => ({
      ...prev,
      photos: prev.photos.filter((_, i) => i !== index)
    }));
  };

  const toggleCrewMember = (crewId) => {
    setFormData(prev => ({
      ...prev,
      crewPresent: prev.crewPresent.includes(crewId)
        ? prev.crewPresent.filter(id => id !== crewId)
        : [...prev.crewPresent, crewId]
    }));
  };

  const toggleChecklistItem = (index) => {
    setFormData(prev => ({
      ...prev,
      checklist: prev.checklist.map((item, i) => 
        i === index ? { ...item, checked: !item.checked } : item
      )
    }));
  };

  const addChecklistItem = () => {
    setFormData(prev => ({
      ...prev,
      checklist: [...prev.checklist, { item: '', checked: false }]
    }));
  };

  const updateChecklistItem = (index, value) => {
    setFormData(prev => ({
      ...prev,
      checklist: prev.checklist.map((item, i) => 
        i === index ? { ...item, item: value } : item
      )
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;
    
    const sanitizedData = {
      ...formData,
      notes: sanitizeInput(formData.notes),
      safetyObservations: sanitizeInput(formData.safetyObservations)
    };
    
    onSave(sanitizedData);
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto dark:bg-gray-800">
        <DialogHeader>
          <DialogTitle className="dark:text-white">
            {initialData ? 'Edit Daily Log' : 'New Daily Log'}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="date" className="dark:text-gray-300">Date *</Label>
              <Input
                id="date"
                type="date"
                value={formData.date}
                onChange={(e) => setFormData(prev => ({ ...prev, date: e.target.value }))}
                className={`dark:bg-gray-700 dark:text-white ${errors.date ? 'border-red-500' : ''}`}
              />
              {errors.date && <p className="text-red-500 text-sm mt-1">{errors.date}</p>}
            </div>
            <div>
              <Label htmlFor="hoursWorked" className="dark:text-gray-300">Hours Worked</Label>
              <Input
                id="hoursWorked"
                type="number"
                min="0"
                max="24"
                step="0.5"
                value={formData.hoursWorked}
                onChange={(e) => setFormData(prev => ({ ...prev, hoursWorked: parseFloat(e.target.value) || 0 }))}
                className="dark:bg-gray-700 dark:text-white"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label className="dark:text-gray-300">Weather</Label>
              <Select 
                value={formData.weather} 
                onValueChange={(v) => setFormData(prev => ({ ...prev, weather: v }))}
              >
                <SelectTrigger className="dark:bg-gray-700 dark:text-white">
                  <SelectValue placeholder="Select weather" />
                </SelectTrigger>
                <SelectContent>
                  {weatherOptions.map(w => (
                    <SelectItem key={w} value={w}>{w}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="temperature" className="dark:text-gray-300">Temperature (°F)</Label>
              <Input
                id="temperature"
                type="number"
                value={formData.temperature}
                onChange={(e) => setFormData(prev => ({ ...prev, temperature: e.target.value }))}
                className="dark:bg-gray-700 dark:text-white"
                placeholder="75"
              />
            </div>
          </div>

          {/* Crew Present */}
          {crew && crew.length > 0 && (
            <div>
              <Label className="dark:text-gray-300">Crew Present</Label>
              <div className="flex flex-wrap gap-2 mt-2">
                {crew.map(member => (
                  <Button
                    key={member._id}
                    type="button"
                    variant={formData.crewPresent.includes(member._id) ? "default" : "outline"}
                    size="sm"
                    onClick={() => toggleCrewMember(member._id)}
                    className="text-sm"
                  >
                    {member.name}
                  </Button>
                ))}
              </div>
            </div>
          )}

          <div>
            <Label htmlFor="notes" className="dark:text-gray-300">Work Notes</Label>
            <Textarea
              id="notes"
              value={formData.notes}
              onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
              className="dark:bg-gray-700 dark:text-white"
              rows={3}
              placeholder="Describe work completed today..."
            />
          </div>

          <div>
            <Label htmlFor="safetyObservations" className="dark:text-gray-300">Safety Observations</Label>
            <Textarea
              id="safetyObservations"
              value={formData.safetyObservations}
              onChange={(e) => setFormData(prev => ({ ...prev, safetyObservations: e.target.value }))}
              className="dark:bg-gray-700 dark:text-white"
              rows={2}
              placeholder="Any safety concerns or incidents..."
            />
          </div>

          {/* Checklist */}
          <div>
            <div className="flex justify-between items-center">
              <Label className="dark:text-gray-300">Daily Checklist</Label>
              <Button type="button" size="sm" variant="outline" onClick={addChecklistItem}>
                <Plus className="w-4 h-4 mr-1" /> Add Item
              </Button>
            </div>
            <div className="space-y-2 mt-2">
              {formData.checklist.map((item, index) => (
                <div key={index} className="flex items-center gap-2">
                  <Checkbox
                    checked={item.checked}
                    onCheckedChange={() => toggleChecklistItem(index)}
                  />
                  <Input
                    value={item.item}
                    onChange={(e) => updateChecklistItem(index, e.target.value)}
                    className="flex-1 dark:bg-gray-700 dark:text-white"
                    placeholder="Checklist item..."
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Photos */}
          <div>
            <Label className="dark:text-gray-300">Photos</Label>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              multiple
              onChange={handlePhotoUpload}
              className="hidden"
            />
            <div className="flex flex-wrap gap-2 mt-2">
              {formData.photos.map((photo, index) => (
                <Card key={index} className="relative w-24 h-24">
                  <CardContent className="p-0">
                    <img 
                      src={photo.data} 
                      alt={photo.name}
                      className="w-full h-full object-cover rounded"
                    />
                    <Button
                      type="button"
                      size="icon"
                      variant="destructive"
                      className="absolute -top-2 -right-2 w-6 h-6"
                      onClick={() => removePhoto(index)}
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </CardContent>
                </Card>
              ))}
              <Button
                type="button"
                variant="outline"
                className="w-24 h-24"
                onClick={() => fileInputRef.current?.click()}
              >
                <Camera className="w-8 h-8" />
              </Button>
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit">
              {initialData ? 'Update' : 'Save'} Log
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}