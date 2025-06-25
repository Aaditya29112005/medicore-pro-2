import { useState, ChangeEvent } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Calendar, Upload, FileText, User, Phone, Mail, MapPin, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

interface AddPatientModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

const AddPatientModal = ({ open, onClose, onSuccess }: AddPatientModalProps) => {
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    dateOfBirth: "",
    gender: "",
    email: "",
    phone: "",
    address: "",
    emergencyContact: "",
    emergencyPhone: "",
    bloodType: "",
    allergies: "",
    medicalHistory: "",
    currentMedications: "",
  });
  const [file, setFile] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSelectChange = (name: string, value: string) => {
    setForm({ ...form, [name]: value });
  };

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      toast.success(`File "${e.target.files[0].name}" uploaded successfully`);
    }
  };

  const handleSave = async () => {
    if (!form.firstName || !form.lastName || !form.dateOfBirth || !form.gender) {
      toast.error("Please fill in all required fields");
      return;
    }

    setIsLoading(true);

    try {
      // Check if user is authenticated
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      
      if (authError || !user) {
        console.error("Authentication error:", authError);
        toast.error("Please log in to add patients");
        return;
      }

      console.log("Current user:", user);

      // Convert string fields to arrays where required by database schema
      const allergiesArray = form.allergies ? form.allergies.split(',').map(item => item.trim()).filter(item => item) : null;
      const medicalHistoryArray = form.medicalHistory ? form.medicalHistory.split(',').map(item => item.trim()).filter(item => item) : null;
      const currentMedicationsArray = form.currentMedications ? form.currentMedications.split(',').map(item => item.trim()).filter(item => item) : null;

      const patientData = {
        first_name: form.firstName,
        last_name: form.lastName,
        date_of_birth: form.dateOfBirth,
        gender: form.gender,
        email: form.email || null,
        phone: form.phone || null,
        address: form.address || null,
        emergency_contact_name: form.emergencyContact || null,
        emergency_contact_phone: form.emergencyPhone || null,
        blood_type: form.bloodType || null,
        allergies: allergiesArray,
        medical_history: medicalHistoryArray,
        current_medications: currentMedicationsArray,
        risk_level: "low" as const, // Default risk level
        status: "stable" as const, // Default status
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      console.log("Attempting to insert patient data:", patientData);

      // Insert patient into Supabase
      const { data, error } = await supabase
        .from("patients")
        .insert(patientData)
        .select()
        .single();

      if (error) {
        console.error("Error adding patient:", error);
        console.error("Error details:", {
          message: error.message,
          details: error.details,
          hint: error.hint,
          code: error.code
        });
        toast.error(`Failed to add patient: ${error.message}`);
        return;
      }

      console.log("Patient inserted successfully:", data);

      // Handle file upload if present
      if (file) {
        try {
          const fileName = `${data.id}_${file.name}`;
          console.log("Attempting to upload file:", fileName);
          
          const { error: uploadError } = await supabase.storage
            .from('patient-reports')
            .upload(fileName, file);

          if (uploadError) {
            console.error("Error uploading file:", uploadError);
            // If storage bucket doesn't exist, create it
            if (uploadError.message.includes("bucket") || uploadError.message.includes("not found")) {
              toast.warning("Patient saved but file upload failed - storage bucket not configured");
            } else {
              toast.warning("Patient saved but file upload failed");
            }
          } else {
            toast.success("Patient and file uploaded successfully!");
          }
        } catch (uploadException) {
          console.error("File upload exception:", uploadException);
          toast.warning("Patient saved but file upload failed");
        }
      } else {
        toast.success("Patient added successfully!");
      }

      // Reset form
      setForm({
        firstName: "",
        lastName: "",
        dateOfBirth: "",
        gender: "",
        email: "",
        phone: "",
        address: "",
        emergencyContact: "",
        emergencyPhone: "",
        bloodType: "",
        allergies: "",
        medicalHistory: "",
        currentMedications: "",
      });
      setFile(null);
      
      // Close modal
      onClose();
      
      // Call onSuccess callback if provided
      if (onSuccess) {
        onSuccess();
      }
      
    } catch (error) {
      console.error("Error:", error);
      toast.error("Failed to add patient. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handlePrint = () => {
    if (file) {
      const fileURL = URL.createObjectURL(file);
      const win = window.open(fileURL, '_blank');
      if (win) {
        win.print();
        toast.success("Print dialog opened");
      }
    } else {
      toast.error("No file uploaded to print");
    }
  };

  const calculateAge = (dateOfBirth: string) => {
    if (!dateOfBirth) return "";
    const today = new Date();
    const birthDate = new Date(dateOfBirth);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    
    return age.toString();
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center text-2xl">
            <User className="h-6 w-6 mr-2" />
            Add New Patient
          </DialogTitle>
        </DialogHeader>
        
        <form className="space-y-6" onSubmit={e => { e.preventDefault(); handleSave(); }}>
          {/* Personal Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="firstName">First Name *</Label>
              <Input 
                id="firstName"
                name="firstName" 
                placeholder="Enter first name" 
                value={form.firstName} 
                onChange={handleChange} 
                required 
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="lastName">Last Name *</Label>
              <Input 
                id="lastName"
                name="lastName" 
                placeholder="Enter last name" 
                value={form.lastName} 
                onChange={handleChange} 
                required 
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="dateOfBirth">Date of Birth *</Label>
              <Input 
                id="dateOfBirth"
                name="dateOfBirth" 
                type="date" 
                value={form.dateOfBirth} 
                onChange={handleChange} 
                required 
              />
              {form.dateOfBirth && (
                <p className="text-sm text-gray-600">
                  Age: {calculateAge(form.dateOfBirth)} years
                </p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="gender">Gender</Label>
              <Select value={form.gender} onValueChange={(value) => handleSelectChange("gender", value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select gender" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="male">Male</SelectItem>
                  <SelectItem value="female">Female</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Contact Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input 
                id="email"
                name="email" 
                type="email" 
                placeholder="Enter email address" 
                value={form.email} 
                onChange={handleChange} 
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">Phone</Label>
              <Input 
                id="phone"
                name="phone" 
                placeholder="Enter phone number" 
                value={form.phone} 
                onChange={handleChange} 
              />
            </div>
            <div className="md:col-span-2 space-y-2">
              <Label htmlFor="address">Address</Label>
              <Textarea 
                id="address"
                name="address" 
                placeholder="Enter full address" 
                value={form.address} 
                onChange={handleChange} 
                rows={2}
              />
            </div>
          </div>

          {/* Emergency Contact */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="emergencyContact">Emergency Contact Name</Label>
              <Input 
                id="emergencyContact"
                name="emergencyContact" 
                placeholder="Emergency contact name" 
                value={form.emergencyContact} 
                onChange={handleChange} 
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="emergencyPhone">Emergency Contact Phone</Label>
              <Input 
                id="emergencyPhone"
                name="emergencyPhone" 
                placeholder="Emergency contact phone" 
                value={form.emergencyPhone} 
                onChange={handleChange} 
              />
            </div>
          </div>

          {/* Medical Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="bloodType">Blood Type</Label>
              <Select value={form.bloodType} onValueChange={(value) => handleSelectChange("bloodType", value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select blood type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="A+">A+</SelectItem>
                  <SelectItem value="A-">A-</SelectItem>
                  <SelectItem value="B+">B+</SelectItem>
                  <SelectItem value="B-">B-</SelectItem>
                  <SelectItem value="AB+">AB+</SelectItem>
                  <SelectItem value="AB-">AB-</SelectItem>
                  <SelectItem value="O+">O+</SelectItem>
                  <SelectItem value="O-">O-</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="allergies">Allergies</Label>
              <Input 
                id="allergies"
                name="allergies" 
                placeholder="Enter allergies separated by commas (e.g., Penicillin, Peanuts)" 
                value={form.allergies} 
                onChange={handleChange} 
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="medicalHistory">Medical History</Label>
            <Textarea 
              id="medicalHistory"
              name="medicalHistory" 
              placeholder="Enter medical conditions separated by commas (e.g., Diabetes, Hypertension)" 
              value={form.medicalHistory} 
              onChange={handleChange} 
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="currentMedications">Current Medications</Label>
            <Textarea 
              id="currentMedications"
              name="currentMedications" 
              placeholder="Enter medications separated by commas (e.g., Aspirin, Metformin)" 
              value={form.currentMedications} 
              onChange={handleChange} 
              rows={2}
            />
          </div>

          {/* File Upload */}
          <div className="space-y-2">
            <Label htmlFor="file">Upload Medical Report</Label>
            <div className="flex items-center space-x-2">
              <Input 
                id="file"
                type="file" 
                accept="application/pdf,image/*,.doc,.docx" 
                onChange={handleFileChange}
                className="flex-1"
              />
              {file && (
                <div className="flex items-center space-x-2 text-sm text-green-600">
                  <FileText className="h-4 w-4" />
                  <span>{file.name}</span>
                </div>
              )}
            </div>
            <p className="text-xs text-gray-500">
              Accepted formats: PDF, Images, Word documents
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex space-x-3 justify-end pt-4 border-t">
            <Button type="button" variant="outline" onClick={onClose} disabled={isLoading}>
              Cancel
            </Button>
            <Button 
              type="button" 
              variant="secondary" 
              onClick={handlePrint} 
              disabled={!file || isLoading}
              className="flex items-center space-x-2"
            >
              <FileText className="h-4 w-4" />
              Print Report
            </Button>
            <Button 
              type="submit" 
              className="bg-green-600 hover:bg-green-700 text-white"
              disabled={isLoading}
            >
              {isLoading ? "Saving..." : "Save Patient"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AddPatientModal; 