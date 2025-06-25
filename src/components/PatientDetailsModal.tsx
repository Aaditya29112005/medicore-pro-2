import { useQuery } from "@tanstack/react-query";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { User, Heart, FileText, TestTube, Pill, Calendar, Phone, Mail, MapPin, Activity } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Tables } from "@/integrations/supabase/types";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

type Patient = Tables<"patients">;
type PatientDiagnosis = Tables<"patient_diagnoses"> & {
  diseases: Tables<"diseases">;
  profiles: Tables<"profiles">;
};
type Prescription = Tables<"prescriptions"> & {
  profiles: Tables<"profiles">;
};
type LabResult = Tables<"lab_results"> & {
  profiles: Tables<"profiles">;
};
type Vital = Tables<"vitals"> & {
  profiles: Tables<"profiles">;
};

interface PatientDetailsModalProps {
  patient: Patient | null;
  open: boolean;
  onClose: () => void;
}

const PatientDetailsModal = ({ patient, open, onClose }: PatientDetailsModalProps) => {
  const { data: diagnoses } = useQuery({
    queryKey: ["patient-diagnoses", patient?.id],
    queryFn: async () => {
      if (!patient?.id) return [];
      const { data, error } = await supabase
        .from("patient_diagnoses")
        .select(`
          *,
          diseases(*),
          profiles(*)
        `)
        .eq("patient_id", patient.id)
        .order("diagnosis_date", { ascending: false });

      if (error) throw error;
      return data as PatientDiagnosis[];
    },
    enabled: !!patient?.id,
  });

  const { data: prescriptions } = useQuery({
    queryKey: ["patient-prescriptions", patient?.id],
    queryFn: async () => {
      if (!patient?.id) return [];
      const { data, error } = await supabase
        .from("prescriptions")
        .select(`
          *,
          profiles(*)
        `)
        .eq("patient_id", patient.id)
        .order("prescribed_date", { ascending: false });

      if (error) throw error;
      return data as Prescription[];
    },
    enabled: !!patient?.id,
  });

  const { data: labResults } = useQuery({
    queryKey: ["patient-lab-results", patient?.id],
    queryFn: async () => {
      if (!patient?.id) return [];
      const { data, error } = await supabase
        .from("lab_results")
        .select(`
          *,
          profiles(*)
        `)
        .eq("patient_id", patient.id)
        .order("ordered_date", { ascending: false });

      if (error) throw error;
      return data as LabResult[];
    },
    enabled: !!patient?.id,
  });

  const { data: vitals } = useQuery({
    queryKey: ["patient-vitals", patient?.id],
    queryFn: async () => {
      if (!patient?.id) return [];
      const { data, error } = await supabase
        .from("vitals")
        .select(`
          *,
          profiles(*)
        `)
        .eq("patient_id", patient.id)
        .order("recorded_at", { ascending: false })
        .limit(5);

      if (error) throw error;
      return data as Vital[];
    },
    enabled: !!patient?.id,
  });

  if (!patient) return null;

  const calculateAge = (dateOfBirth: string) => {
    const today = new Date();
    const birthDate = new Date(dateOfBirth);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    
    return age;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "stable": return "bg-green-100 text-green-800";
      case "monitoring": return "bg-yellow-100 text-yellow-800";
      case "treatment": return "bg-blue-100 text-blue-800";
      case "critical": return "bg-red-100 text-red-800";
      case "discharged": return "bg-gray-100 text-gray-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const handleScheduleAppointment = () => {
    toast.info("Opening appointment scheduler...");
    // Here you would typically open an appointment scheduling modal
  };

  const handleNewDiagnosis = () => {
    toast.info("Opening diagnosis form...");
    // Here you would typically open a diagnosis form
  };

  const handleOrderTests = () => {
    toast.info("Opening test ordering system...");
    // Here you would typically open a test ordering interface
  };

  const handleContactPatient = () => {
    toast.info("Opening patient contact form...");
    // Here you would typically open a contact form or phone system
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-4">
            <Avatar className="h-16 w-16">
              <AvatarFallback className="bg-blue-100 text-blue-700 font-semibold text-lg">
                {patient.first_name[0]}{patient.last_name[0]}
              </AvatarFallback>
            </Avatar>
            <div>
              <h2 className="text-2xl font-bold">{patient.first_name} {patient.last_name}</h2>
              <p className="text-gray-600">Age: {calculateAge(patient.date_of_birth)} • {patient.gender}</p>
              <div className="flex space-x-2 mt-2">
                <Badge className={getStatusColor(patient.status)}>
                  {patient.status}
                </Badge>
                <Badge variant="outline">
                  {patient.risk_level} risk
                </Badge>
              </div>
            </div>
          </DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="diagnoses">Diagnoses</TabsTrigger>
            <TabsTrigger value="prescriptions">Prescriptions</TabsTrigger>
            <TabsTrigger value="lab-results">Lab Results</TabsTrigger>
            <TabsTrigger value="vitals">Vitals</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <User className="h-5 w-5" />
                    <span>Personal Information</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center space-x-2">
                    <Calendar className="h-4 w-4 text-gray-500" />
                    <span>Born: {format(new Date(patient.date_of_birth), "MMMM d, yyyy")}</span>
                  </div>
                  {patient.email && (
                    <div className="flex items-center space-x-2">
                      <Mail className="h-4 w-4 text-gray-500" />
                      <span>{patient.email}</span>
                    </div>
                  )}
                  {patient.phone && (
                    <div className="flex items-center space-x-2">
                      <Phone className="h-4 w-4 text-gray-500" />
                      <span>{patient.phone}</span>
                    </div>
                  )}
                  {patient.address && (
                    <div className="flex items-center space-x-2">
                      <MapPin className="h-4 w-4 text-gray-500" />
                      <span>{patient.address}</span>
                    </div>
                  )}
                  {patient.blood_type && (
                    <div>
                      <span className="font-medium">Blood Type: </span>
                      <Badge variant="outline">{patient.blood_type}</Badge>
                    </div>
                  )}
                  <Button className="w-full justify-start" variant="outline" onClick={handleScheduleAppointment}>
                    <Calendar className="h-4 w-4 mr-2" />
                    Schedule Appointment
                  </Button>
                  <Button className="w-full justify-start" variant="outline" onClick={handleNewDiagnosis}>
                    <FileText className="h-4 w-4 mr-2" />
                    New Diagnosis
                  </Button>
                  <Button className="w-full justify-start" variant="outline" onClick={handleOrderTests}>
                    <Activity className="h-4 w-4 mr-2" />
                    Order Tests
                  </Button>
                  <Button className="w-full justify-start" variant="outline" onClick={handleContactPatient}>
                    <Phone className="h-4 w-4 mr-2" />
                    Contact Patient
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Emergency Contact</CardTitle>
                </CardHeader>
                <CardContent>
                  {patient.emergency_contact_name ? (
                    <div className="space-y-2">
                      <p className="font-medium">{patient.emergency_contact_name}</p>
                      {patient.emergency_contact_phone && (
                        <div className="flex items-center space-x-2">
                          <Phone className="h-4 w-4 text-gray-500" />
                          <span>{patient.emergency_contact_phone}</span>
                        </div>
                      )}
                    </div>
                  ) : (
                    <p className="text-gray-500">No emergency contact information</p>
                  )}
                </CardContent>
              </Card>
            </div>

            {patient.allergies && patient.allergies.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Allergies</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {patient.allergies.map((allergy, index) => (
                      <Badge key={index} variant="destructive">
                        {allergy}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {patient.current_medications && patient.current_medications.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Current Medications</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {patient.current_medications.map((medication, index) => (
                      <Badge key={index} variant="outline">
                        {medication}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="diagnoses" className="space-y-4">
            {diagnoses?.map((diagnosis) => (
              <Card key={diagnosis.id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">{diagnosis.diseases.name}</CardTitle>
                    <Badge variant="outline">{diagnosis.diseases.icd_code}</Badge>
                  </div>
                  <CardDescription>
                    Diagnosed on {format(new Date(diagnosis.diagnosis_date), "MMMM d, yyyy")} 
                    by Dr. {diagnosis.profiles.full_name}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-700 mb-2">{diagnosis.diseases.description}</p>
                  {diagnosis.severity && (
                    <p><span className="font-medium">Severity:</span> {diagnosis.severity}</p>
                  )}
                  {diagnosis.notes && (
                    <p><span className="font-medium">Notes:</span> {diagnosis.notes}</p>
                  )}
                </CardContent>
              </Card>
            ))}
            {(!diagnoses || diagnoses.length === 0) && (
              <Card>
                <CardContent className="p-12 text-center">
                  <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600">No diagnoses recorded</p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="prescriptions" className="space-y-4">
            {prescriptions?.map((prescription) => (
              <Card key={prescription.id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">{prescription.medication_name}</CardTitle>
                    <Badge 
                      variant={prescription.status === "active" ? "default" : "secondary"}
                    >
                      {prescription.status}
                    </Badge>
                  </div>
                  <CardDescription>
                    Prescribed on {format(new Date(prescription.prescribed_date), "MMMM d, yyyy")} 
                    by Dr. {prescription.profiles.full_name}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="font-medium">Dosage:</span> {prescription.dosage}
                    </div>
                    <div>
                      <span className="font-medium">Frequency:</span> {prescription.frequency}
                    </div>
                    {prescription.duration && (
                      <div>
                        <span className="font-medium">Duration:</span> {prescription.duration}
                      </div>
                    )}
                  </div>
                  {prescription.instructions && (
                    <div className="mt-3">
                      <span className="font-medium">Instructions:</span> {prescription.instructions}
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
            {(!prescriptions || prescriptions.length === 0) && (
              <Card>
                <CardContent className="p-12 text-center">
                  <Pill className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600">No prescriptions recorded</p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="lab-results" className="space-y-4">
            {labResults?.map((result) => (
              <Card key={result.id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">{result.test_name}</CardTitle>
                    <Badge 
                      variant={result.is_abnormal ? "destructive" : "default"}
                    >
                      {result.status}
                    </Badge>
                  </div>
                  <CardDescription>
                    Ordered on {format(new Date(result.ordered_date), "MMMM d, yyyy")} 
                    by Dr. {result.profiles.full_name}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="font-medium">Test Type:</span> {result.test_type}
                    </div>
                    {result.result_value && (
                      <div>
                        <span className="font-medium">Result:</span> {result.result_value} {result.unit}
                      </div>
                    )}
                    {result.reference_range && (
                      <div>
                        <span className="font-medium">Reference Range:</span> {result.reference_range}
                      </div>
                    )}
                    {result.completed_date && (
                      <div>
                        <span className="font-medium">Completed:</span> {format(new Date(result.completed_date), "MMMM d, yyyy")}
                      </div>
                    )}
                  </div>
                  {result.notes && (
                    <div className="mt-3">
                      <span className="font-medium">Notes:</span> {result.notes}
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
            {(!labResults || labResults.length === 0) && (
              <Card>
                <CardContent className="p-12 text-center">
                  <TestTube className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600">No lab results recorded</p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="vitals" className="space-y-4">
            {vitals?.map((vital) => (
              <Card key={vital.id}>
                <CardHeader>
                  <CardTitle className="text-lg">
                    Vital Signs - {format(new Date(vital.recorded_at), "MMMM d, yyyy 'at' h:mm a")}
                  </CardTitle>
                  <CardDescription>
                    Recorded by {vital.profiles.full_name}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    {vital.blood_pressure_systolic && vital.blood_pressure_diastolic && (
                      <div>
                        <span className="font-medium">Blood Pressure:</span><br />
                        {vital.blood_pressure_systolic}/{vital.blood_pressure_diastolic} mmHg
                      </div>
                    )}
                    {vital.heart_rate && (
                      <div>
                        <span className="font-medium">Heart Rate:</span><br />
                        {vital.heart_rate} bpm
                      </div>
                    )}
                    {vital.temperature && (
                      <div>
                        <span className="font-medium">Temperature:</span><br />
                        {vital.temperature}°F
                      </div>
                    )}
                    {vital.oxygen_saturation && (
                      <div>
                        <span className="font-medium">O2 Saturation:</span><br />
                        {vital.oxygen_saturation}%
                      </div>
                    )}
                    {vital.weight && (
                      <div>
                        <span className="font-medium">Weight:</span><br />
                        {vital.weight} lbs
                      </div>
                    )}
                    {vital.height && (
                      <div>
                        <span className="font-medium">Height:</span><br />
                        {vital.height} inches
                      </div>
                    )}
                    {vital.respiratory_rate && (
                      <div>
                        <span className="font-medium">Respiratory Rate:</span><br />
                        {vital.respiratory_rate} breaths/min
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
            {(!vitals || vitals.length === 0) && (
              <Card>
                <CardContent className="p-12 text-center">
                  <Heart className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600">No vital signs recorded</p>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};

export default PatientDetailsModal;
