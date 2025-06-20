import { useState, ChangeEvent } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface AddPatientModalProps {
  open: boolean;
  onClose: () => void;
}

const AddPatientModal = ({ open, onClose }: AddPatientModalProps) => {
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    age: "",
    gender: "",
    email: "",
    phone: "",
  });
  const [file, setFile] = useState<File | null>(null);

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleSave = () => {
    // TODO: Save logic
    onClose();
  };

  const handlePrint = () => {
    if (file) {
      const fileURL = URL.createObjectURL(file);
      const win = window.open(fileURL, '_blank');
      if (win) win.print();
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Add New Patient</DialogTitle>
        </DialogHeader>
        <form className="space-y-4" onSubmit={e => { e.preventDefault(); handleSave(); }}>
          <div className="flex space-x-2">
            <Input name="firstName" placeholder="First Name" value={form.firstName} onChange={handleChange} required />
            <Input name="lastName" placeholder="Last Name" value={form.lastName} onChange={handleChange} required />
          </div>
          <div className="flex space-x-2">
            <Input name="age" placeholder="Age" value={form.age} onChange={handleChange} type="number" required />
            <Input name="gender" placeholder="Gender" value={form.gender} onChange={handleChange} required />
          </div>
          <Input name="email" placeholder="Email" value={form.email} onChange={handleChange} type="email" />
          <Input name="phone" placeholder="Phone" value={form.phone} onChange={handleChange} />
          <div>
            <label className="block mb-1 font-medium">Upload Report</label>
            <Input type="file" accept="application/pdf,image/*" onChange={handleFileChange} />
          </div>
          <div className="flex space-x-2 justify-end">
            <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
            <Button type="button" variant="secondary" onClick={handlePrint} disabled={!file}>Print Report</Button>
            <Button type="submit" className="bg-green-600 hover:bg-green-700 text-white">Save</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AddPatientModal; 