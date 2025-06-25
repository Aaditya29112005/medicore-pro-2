import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { supabase } from '@/integrations/supabase/client';

interface Doctor {
  id: string;
  full_name: string;
  specialization: string;
  license_number: string;
  email: string;
  phone: string;
}

const DoctorDirectory = () => {
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [loading, setLoading] = useState(true);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [selectedDoctor, setSelectedDoctor] = useState<Doctor | null>(null);
  const [editForm, setEditForm] = useState({ specialization: '', license_number: '', phone: '' });
  const [saving, setSaving] = useState(false);
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [addForm, setAddForm] = useState({ full_name: '', email: '', specialization: '', license_number: '', phone: '', username: '', password: '' });
  const [addError, setAddError] = useState('');
  const [adding, setAdding] = useState(false);

  useEffect(() => {
    fetchDoctors();
  }, []);

  const fetchDoctors = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('profiles')
      .select('id, full_name, specialization, license_number, email, phone')
      .eq('role', 'doctor')
      .order('full_name', { ascending: true });
    if (error) {
      setDoctors([]);
    } else {
      setDoctors(data as Doctor[]);
    }
    setLoading(false);
  };

  const openEditModal = (doctor: Doctor) => {
    setSelectedDoctor(doctor);
    setEditForm({
      specialization: doctor.specialization || '',
      license_number: doctor.license_number || '',
      phone: doctor.phone || '',
    });
    setEditModalOpen(true);
  };

  const handleEditFormChange = (e: any) => {
    setEditForm({ ...editForm, [e.target.name]: e.target.value });
  };

  const handleEditFormSubmit = async (e: any) => {
    e.preventDefault();
    if (!selectedDoctor) return;
    setSaving(true);
    const { error } = await supabase
      .from('profiles')
      .update({
        specialization: editForm.specialization,
        license_number: editForm.license_number,
        phone: editForm.phone,
      })
      .eq('id', selectedDoctor.id);
    setSaving(false);
    setEditModalOpen(false);
    if (!error) {
      fetchDoctors();
    } else {
      alert('Failed to update doctor');
    }
  };

  // Add Doctor logic
  const openAddModal = () => {
    setAddForm({ full_name: '', email: '', specialization: '', license_number: '', phone: '', username: '', password: '' });
    setAddError('');
    setAddModalOpen(true);
  };
  const handleAddFormChange = (e: any) => {
    setAddForm({ ...addForm, [e.target.name]: e.target.value });
  };
  const handleAddFormSubmit = async (e: any) => {
    e.preventDefault();
    setAddError('');
    setAdding(true);
    // Validate unique license number, phone, and username
    const { data: existingLicense } = await supabase.from('profiles').select('id').eq('license_number', addForm.license_number).single();
    if (existingLicense) {
      setAddError('License number already exists.');
      setAdding(false);
      return;
    }
    const { data: existingPhone } = await supabase.from('profiles').select('id').eq('phone', addForm.phone).single();
    if (existingPhone) {
      setAddError('Phone number already exists.');
      setAdding(false);
      return;
    }
    const { data: existingUsername } = await supabase.from('profiles').select('id').eq('username', addForm.username).single();
    if (existingUsername) {
      setAddError('Username already exists.');
      setAdding(false);
      return;
    }
    // Create user via admin API
    // @ts-ignore
    const { error } = await supabase.auth.admin.createUser({
      email: addForm.email,
      password: addForm.password,
      user_metadata: {
        full_name: addForm.full_name,
        specialization: addForm.specialization,
        license_number: addForm.license_number,
        phone: addForm.phone,
        username: addForm.username,
        role: 'doctor',
      },
    });
    setAdding(false);
    if (error) {
      setAddError(error.message || 'Failed to add doctor.');
    } else {
      setAddModalOpen(false);
      fetchDoctors();
    }
  };

  return (
    <div className="min-h-screen bg-black p-8">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold text-white">Doctor Directory</h1>
        <Button className="bg-blue-600 hover:bg-blue-700 text-white" onClick={openAddModal}>Add Doctor</Button>
      </div>
      {loading ? (
        <div className="text-white">Loading doctors...</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {doctors.map((doc) => (
            <Card key={doc.id} className="bg-white shadow-xl rounded-2xl relative overflow-hidden group">
              <div className="absolute -top-8 -right-8 w-32 h-32 bg-gradient-to-br from-blue-500 to-purple-600 opacity-20 rounded-full blur-2xl z-0 group-hover:scale-110 transition-transform duration-300" />
              <CardHeader>
                <CardTitle className="text-xl text-black font-bold flex items-center justify-between">
                  {doc.full_name}
                  <Button size="sm" variant="outline" className="ml-2" onClick={() => openEditModal(doc)}>
                    Edit
                  </Button>
                </CardTitle>
                <Badge className="bg-black text-white mt-2">{doc.specialization || 'Not set'}</Badge>
              </CardHeader>
              <CardContent className="text-black space-y-2">
                <div><span className="font-semibold">License:</span> {doc.license_number || <span className="text-gray-400">Not set</span>}</div>
                <div><span className="font-semibold">Email:</span> {doc.email}</div>
                <div><span className="font-semibold">Phone:</span> {doc.phone || <span className="text-gray-400">Not set</span>}</div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
      {/* Edit Doctor Modal */}
      <Dialog open={editModalOpen} onOpenChange={setEditModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Doctor Details</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleEditFormSubmit} className="space-y-4">
            <Input name="specialization" placeholder="Specialization" value={editForm.specialization} onChange={handleEditFormChange} required />
            <Input name="license_number" placeholder="License Number" value={editForm.license_number} onChange={handleEditFormChange} required />
            <Input name="phone" placeholder="Phone Number" value={editForm.phone} onChange={handleEditFormChange} required />
            <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white" disabled={saving}>{saving ? 'Saving...' : 'Save Changes'}</Button>
          </form>
        </DialogContent>
      </Dialog>
      {/* Add Doctor Modal */}
      <Dialog open={addModalOpen} onOpenChange={setAddModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New Doctor</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleAddFormSubmit} className="space-y-4">
            <Input name="full_name" placeholder="Full Name" value={addForm.full_name} onChange={handleAddFormChange} required />
            <Input name="email" type="email" placeholder="Email" value={addForm.email} onChange={handleAddFormChange} required />
            <Input name="username" placeholder="Username" value={addForm.username} onChange={handleAddFormChange} required />
            <Input name="password" type="password" placeholder="Password" value={addForm.password} onChange={handleAddFormChange} required minLength={6} />
            <Input name="specialization" placeholder="Specialization" value={addForm.specialization} onChange={handleAddFormChange} required />
            <Input name="license_number" placeholder="License Number" value={addForm.license_number} onChange={handleAddFormChange} required />
            <Input name="phone" placeholder="Phone Number" value={addForm.phone} onChange={handleAddFormChange} required />
            {addError && <div className="text-red-600 text-center text-sm">{addError}</div>}
            <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white" disabled={adding}>{adding ? 'Adding...' : 'Add Doctor'}</Button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default DoctorDirectory; 