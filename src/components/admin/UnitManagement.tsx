import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { useUnits, Unit } from '@/hooks/use-units';
import { Plus, Edit, Trash2, MapPin } from 'lucide-react';
import { toast } from 'sonner';

interface UnitFormData {
  unit_number: string;
  owner_name: string;
  unit_type: 'residential' | 'commercial' | 'facility';
  address: string;
  coordinates_x: number;
  coordinates_y: number;
  width: number;
  height: number;
  phone_number: string;
  email: string;
  occupancy_status: string;
  notes: string;
}

const UnitManagement: React.FC = () => {
  const { units, loading, createUnit, updateUnit, deleteUnit } = useUnits();
  const [editingUnit, setEditingUnit] = useState<Unit | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  
  const [formData, setFormData] = useState<UnitFormData>({
    unit_number: '',
    owner_name: '',
    unit_type: 'residential',
    address: '',
    coordinates_x: 50,
    coordinates_y: 50,
    width: 8,
    height: 6,
    phone_number: '',
    email: '',
    occupancy_status: 'occupied',
    notes: ''
  });

  const resetForm = () => {
    setFormData({
      unit_number: '',
      owner_name: '',
      unit_type: 'residential',
      address: '',
      coordinates_x: 50,
      coordinates_y: 50,
      width: 8,
      height: 6,
      phone_number: '',
      email: '',
      occupancy_status: 'occupied',
      notes: ''
    });
    setEditingUnit(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.unit_number || !formData.owner_name) {
      toast.error('Please fill in required fields');
      return;
    }

    const success = editingUnit 
      ? await updateUnit(editingUnit.id, formData)
      : await createUnit(formData);

    if (success) {
      setIsDialogOpen(false);
      resetForm();
    }
  };

  const handleEdit = (unit: Unit) => {
    setEditingUnit(unit);
    setFormData({
      unit_number: unit.unit_number,
      owner_name: unit.owner_name,
      unit_type: unit.unit_type,
      address: unit.address || '',
      coordinates_x: unit.coordinates_x,
      coordinates_y: unit.coordinates_y,
      width: unit.width || 8,
      height: unit.height || 6,
      phone_number: unit.phone_number || '',
      email: unit.email || '',
      occupancy_status: unit.occupancy_status || 'occupied',
      notes: unit.notes || ''
    });
    setIsDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this unit?')) {
      await deleteUnit(id);
    }
  };

  const getUnitTypeColor = (type: string) => {
    switch (type) {
      case 'residential': return 'bg-blue-500';
      case 'commercial': return 'bg-green-500';
      case 'facility': return 'bg-purple-500';
      default: return 'bg-gray-500';
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <MapPin className="h-5 w-5" />
            Unit Management
          </CardTitle>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={resetForm}>
                <Plus className="h-4 w-4 mr-2" />
                Add Unit
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>
                  {editingUnit ? 'Edit Unit' : 'Add New Unit'}
                </DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="unit_number">Unit Number *</Label>
                    <Input
                      id="unit_number"
                      value={formData.unit_number}
                      onChange={(e) => setFormData(prev => ({ ...prev, unit_number: e.target.value }))}
                      placeholder="e.g., A-101"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="owner_name">Owner Name *</Label>
                    <Input
                      id="owner_name"
                      value={formData.owner_name}
                      onChange={(e) => setFormData(prev => ({ ...prev, owner_name: e.target.value }))}
                      placeholder="e.g., Ahmad Rahman"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="unit_type">Unit Type</Label>
                    <Select value={formData.unit_type} onValueChange={(value) => setFormData(prev => ({ ...prev, unit_type: value as any }))}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="residential">Residential</SelectItem>
                        <SelectItem value="commercial">Commercial</SelectItem>
                        <SelectItem value="facility">Facility</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="occupancy_status">Occupancy Status</Label>
                    <Select value={formData.occupancy_status} onValueChange={(value) => setFormData(prev => ({ ...prev, occupancy_status: value }))}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="occupied">Occupied</SelectItem>
                        <SelectItem value="vacant">Vacant</SelectItem>
                        <SelectItem value="maintenance">Under Maintenance</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div>
                  <Label htmlFor="address">Address</Label>
                  <Input
                    id="address"
                    value={formData.address}
                    onChange={(e) => setFormData(prev => ({ ...prev, address: e.target.value }))}
                    placeholder="Full address"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="phone_number">Phone Number</Label>
                    <Input
                      id="phone_number"
                      value={formData.phone_number}
                      onChange={(e) => setFormData(prev => ({ ...prev, phone_number: e.target.value }))}
                      placeholder="+60123456789"
                    />
                  </div>
                  <div>
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                      placeholder="owner@example.com"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-4 gap-4">
                  <div>
                    <Label htmlFor="coordinates_x">X Position (%)</Label>
                    <Input
                      id="coordinates_x"
                      type="number"
                      min="0"
                      max="100"
                      value={formData.coordinates_x}
                      onChange={(e) => setFormData(prev => ({ ...prev, coordinates_x: parseFloat(e.target.value) }))}
                    />
                  </div>
                  <div>
                    <Label htmlFor="coordinates_y">Y Position (%)</Label>
                    <Input
                      id="coordinates_y"
                      type="number"
                      min="0"
                      max="100"
                      value={formData.coordinates_y}
                      onChange={(e) => setFormData(prev => ({ ...prev, coordinates_y: parseFloat(e.target.value) }))}
                    />
                  </div>
                  <div>
                    <Label htmlFor="width">Width (%)</Label>
                    <Input
                      id="width"
                      type="number"
                      min="1"
                      max="20"
                      value={formData.width}
                      onChange={(e) => setFormData(prev => ({ ...prev, width: parseFloat(e.target.value) }))}
                    />
                  </div>
                  <div>
                    <Label htmlFor="height">Height (%)</Label>
                    <Input
                      id="height"
                      type="number"
                      min="1"
                      max="20"
                      value={formData.height}
                      onChange={(e) => setFormData(prev => ({ ...prev, height: parseFloat(e.target.value) }))}
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="notes">Notes</Label>
                  <Textarea
                    id="notes"
                    value={formData.notes}
                    onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                    placeholder="Additional notes about the unit"
                    rows={3}
                  />
                </div>

                <div className="flex justify-end gap-2">
                  <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="submit">
                    {editingUnit ? 'Update Unit' : 'Create Unit'}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Unit Number</TableHead>
                  <TableHead>Owner</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Position</TableHead>
                  <TableHead>Contact</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {units.map((unit) => (
                  <TableRow key={unit.id}>
                    <TableCell className="font-medium">{unit.unit_number}</TableCell>
                    <TableCell>{unit.owner_name}</TableCell>
                    <TableCell>
                      <Badge className={getUnitTypeColor(unit.unit_type)}>
                        {unit.unit_type}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant={unit.occupancy_status === 'occupied' ? 'default' : 'secondary'}>
                        {unit.occupancy_status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <span className="text-sm text-gray-500">
                        ({unit.coordinates_x}%, {unit.coordinates_y}%)
                      </span>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        {unit.phone_number && <div>{unit.phone_number}</div>}
                        {unit.email && <div className="text-gray-500">{unit.email}</div>}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEdit(unit)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDelete(unit.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            {units.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                No units found. Click "Add Unit" to create your first unit.
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default UnitManagement;