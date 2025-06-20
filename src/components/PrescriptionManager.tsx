
import { useState, useEffect } from "react";
import { Pill, Plus, AlertTriangle, Calendar, User, FileText, CheckCircle } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";

interface Prescription {
  id: string;
  patientId: string;
  patientName: string;
  medication: string;
  dosage: string;
  frequency: string;
  duration: string;
  instructions: string;
  prescribedBy: string;
  prescribedDate: string;
  status: 'active' | 'completed' | 'discontinued';
  refillsRemaining: number;
  totalRefills: number;
  interactions: string[];
  sideEffects: string[];
}

const PrescriptionManager = () => {
  const [prescriptions, setPrescriptions] = useState<Prescription[]>([]);
  const [selectedPatient, setSelectedPatient] = useState("");
  const [loading, setLoading] = useState(true);
  const [newPrescription, setNewPrescription] = useState({
    medication: "",
    dosage: "",
    frequency: "",
    duration: "",
    instructions: "",
    refills: ""
  });
  const { toast } = useToast();

  // Mock data loading
  useEffect(() => {
    const loadPrescriptions = async () => {
      setLoading(true);
      await new Promise(resolve => setTimeout(resolve, 800));
      
      const mockPrescriptions: Prescription[] = [
        {
          id: "1",
          patientId: "p1",
          patientName: "Sarah Johnson",
          medication: "Lisinopril",
          dosage: "10mg",
          frequency: "Once daily",
          duration: "30 days",
          instructions: "Take with food in the morning",
          prescribedBy: "Dr. Smith",
          prescribedDate: "2024-06-15",
          status: "active",
          refillsRemaining: 3,
          totalRefills: 5,
          interactions: ["ACE inhibitors"],
          sideEffects: ["Dry cough", "Dizziness"]
        },
        {
          id: "2",
          patientId: "p2",
          patientName: "Michael Chen",
          medication: "Metformin",
          dosage: "500mg",
          frequency: "Twice daily",
          duration: "90 days",
          instructions: "Take with meals",
          prescribedBy: "Dr. Johnson",
          prescribedDate: "2024-06-10",
          status: "active",
          refillsRemaining: 2,
          totalRefills: 3,
          interactions: ["Alcohol", "Contrast dye"],
          sideEffects: ["Nausea", "Diarrhea"]
        }
      ];
      
      setPrescriptions(mockPrescriptions);
      setLoading(false);
    };

    loadPrescriptions();
  }, []);

  const handleCreatePrescription = async () => {
    if (!selectedPatient || !newPrescription.medication) {
      toast({
        title: "Error",
        description: "Please select a patient and medication",
        variant: "destructive",
      });
      return;
    }

    const prescription: Prescription = {
      id: Date.now().toString(),
      patientId: selectedPatient,
      patientName: "New Patient", // Would come from patient data
      medication: newPrescription.medication,
      dosage: newPrescription.dosage,
      frequency: newPrescription.frequency,
      duration: newPrescription.duration,
      instructions: newPrescription.instructions,
      prescribedBy: "Dr. Current User",
      prescribedDate: new Date().toISOString().split('T')[0],
      status: "active",
      refillsRemaining: parseInt(newPrescription.refills) || 0,
      totalRefills: parseInt(newPrescription.refills) || 0,
      interactions: [],
      sideEffects: []
    };

    setPrescriptions(prev => [prescription, ...prev]);
    setNewPrescription({
      medication: "",
      dosage: "",
      frequency: "",
      duration: "",
      instructions: "",
      refills: ""
    });

    toast({
      title: "Success",
      description: "Prescription created successfully",
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'completed': return 'bg-blue-100 text-blue-800';
      case 'discontinued': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold">Prescription Management</h2>
              <p className="text-indigo-100 mt-1">Digital prescription system with drug interaction checking</p>
            </div>
            <Dialog>
              <DialogTrigger asChild>
                <Button variant="secondary" className="bg-white/20 hover:bg-white/30 text-white border-white/30">
                  <Plus className="h-4 w-4 mr-2" />
                  New Prescription
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>Create New Prescription</DialogTitle>
                  <DialogDescription>Fill out the prescription details below</DialogDescription>
                </DialogHeader>
                <div className="grid grid-cols-2 gap-4 py-4">
                  <div className="col-span-2">
                    <Label htmlFor="patient">Patient</Label>
                    <Select value={selectedPatient} onValueChange={setSelectedPatient}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select patient" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="p1">Sarah Johnson</SelectItem>
                        <SelectItem value="p2">Michael Chen</SelectItem>
                        <SelectItem value="p3">Emily Rodriguez</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="medication">Medication</Label>
                    <Input
                      id="medication"
                      value={newPrescription.medication}
                      onChange={(e) => setNewPrescription(prev => ({ ...prev, medication: e.target.value }))}
                      placeholder="Enter medication name"
                    />
                  </div>
                  <div>
                    <Label htmlFor="dosage">Dosage</Label>
                    <Input
                      id="dosage"
                      value={newPrescription.dosage}
                      onChange={(e) => setNewPrescription(prev => ({ ...prev, dosage: e.target.value }))}
                      placeholder="e.g., 10mg"
                    />
                  </div>
                  <div>
                    <Label htmlFor="frequency">Frequency</Label>
                    <Select 
                      value={newPrescription.frequency} 
                      onValueChange={(value) => setNewPrescription(prev => ({ ...prev, frequency: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select frequency" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="once-daily">Once daily</SelectItem>
                        <SelectItem value="twice-daily">Twice daily</SelectItem>
                        <SelectItem value="three-times-daily">Three times daily</SelectItem>
                        <SelectItem value="as-needed">As needed</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="duration">Duration</Label>
                    <Input
                      id="duration"
                      value={newPrescription.duration}
                      onChange={(e) => setNewPrescription(prev => ({ ...prev, duration: e.target.value }))}
                      placeholder="e.g., 30 days"
                    />
                  </div>
                  <div className="col-span-2">
                    <Label htmlFor="instructions">Instructions</Label>
                    <Textarea
                      id="instructions"
                      value={newPrescription.instructions}
                      onChange={(e) => setNewPrescription(prev => ({ ...prev, instructions: e.target.value }))}
                      placeholder="Special instructions for the patient"
                    />
                  </div>
                  <div>
                    <Label htmlFor="refills">Number of Refills</Label>
                    <Input
                      id="refills"
                      type="number"
                      value={newPrescription.refills}
                      onChange={(e) => setNewPrescription(prev => ({ ...prev, refills: e.target.value }))}
                      placeholder="0"
                    />
                  </div>
                </div>
                <Button onClick={handleCreatePrescription} className="w-full">
                  Create Prescription
                </Button>
              </DialogContent>
            </Dialog>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {prescriptions.map(prescription => (
          <Card key={prescription.id} className="bg-white shadow-md hover:shadow-lg transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="text-lg flex items-center">
                    <Pill className="h-5 w-5 mr-2 text-blue-600" />
                    {prescription.medication}
                  </CardTitle>
                  <CardDescription className="flex items-center mt-1">
                    <User className="h-3 w-3 mr-1" />
                    {prescription.patientName}
                  </CardDescription>
                </div>
                <Badge className={getStatusColor(prescription.status)} variant="secondary">
                  {prescription.status}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="font-medium text-gray-700">Dosage:</span>
                  <p className="text-gray-900">{prescription.dosage}</p>
                </div>
                <div>
                  <span className="font-medium text-gray-700">Frequency:</span>
                  <p className="text-gray-900">{prescription.frequency}</p>
                </div>
                <div>
                  <span className="font-medium text-gray-700">Duration:</span>
                  <p className="text-gray-900">{prescription.duration}</p>
                </div>
                <div>
                  <span className="font-medium text-gray-700">Refills:</span>
                  <p className="text-gray-900">{prescription.refillsRemaining}/{prescription.totalRefills}</p>
                </div>
              </div>

              {prescription.instructions && (
                <div className="p-3 bg-blue-50 rounded-lg">
                  <p className="text-sm text-blue-800">{prescription.instructions}</p>
                </div>
              )}

              {prescription.interactions.length > 0 && (
                <div className="p-3 bg-yellow-50 rounded-lg border border-yellow-200">
                  <div className="flex items-center mb-1">
                    <AlertTriangle className="h-4 w-4 text-yellow-600 mr-1" />
                    <span className="text-sm font-medium text-yellow-800">Drug Interactions</span>
                  </div>
                  <p className="text-xs text-yellow-700">{prescription.interactions.join(", ")}</p>
                </div>
              )}

              <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                <div className="text-xs text-gray-500">
                  <Calendar className="h-3 w-3 inline mr-1" />
                  {prescription.prescribedDate}
                </div>
                <div className="flex space-x-2">
                  <Button size="sm" variant="outline">
                    <FileText className="h-3 w-3 mr-1" />
                    Print
                  </Button>
                  <Button size="sm" variant="outline">
                    <CheckCircle className="h-3 w-3 mr-1" />
                    Refill
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default PrescriptionManager;
