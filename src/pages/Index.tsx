
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { LogOut, UserPlus, Calendar, FileText, Activity, Users, TrendingUp, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from "@/integrations/supabase/client";
import { Tables } from "@/integrations/supabase/types";
import { toast } from "sonner";
import SearchBar from "@/components/SearchBar";
import FunctionalPatientSearch from "@/components/FunctionalPatientSearch";
import PatientDetailsModal from "@/components/PatientDetailsModal";
import DiagnosticWorkflow from "@/components/DiagnosticWorkflow";
import PatientOverview from "@/components/PatientOverview";
import MedicalRecords from "@/components/MedicalRecords";
import AnalyticsDashboard from "@/components/AnalyticsDashboard";
import LabResults from "@/components/LabResults";
import PrescriptionManager from "@/components/PrescriptionManager";
import AppointmentScheduler from "@/components/AppointmentScheduler";

type Patient = Tables<"patients">;
type Disease = Tables<"diseases">;

const Index = () => {
  const [activeTab, setActiveTab] = useState("dashboard");
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [showPatientModal, setShowPatientModal] = useState(false);

  // Fetch real-time statistics
  const { data: stats } = useQuery({
    queryKey: ["dashboard-stats"],
    queryFn: async () => {
      const [patientsResult, appointmentsResult, diagnosesResult, criticalResult] = await Promise.all([
        supabase.from("patients").select("id", { count: "exact" }),
        supabase.from("appointments").select("id", { count: "exact" }).eq("appointment_date", new Date().toISOString().split('T')[0]),
        supabase.from("patient_diagnoses").select("id", { count: "exact" }).is("diagnosis_date", null),
        supabase.from("patients").select("id", { count: "exact" }).eq("risk_level", "critical"),
      ]);

      return {
        totalPatients: patientsResult.count || 0,
        todaysAppointments: appointmentsResult.count || 0,
        pendingDiagnoses: diagnosesResult.count || 0,
        criticalCases: criticalResult.count || 0,
      };
    },
  });

  // Fetch recent patients
  const { data: recentPatients } = useQuery({
    queryKey: ["recent-patients"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("patients")
        .select("*")
        .order("updated_at", { ascending: false })
        .limit(3);

      if (error) throw error;
      return data;
    },
  });

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      toast.success("Logged out successfully");
    } catch (error) {
      toast.error("Error logging out");
    }
  };

  const handlePatientSelect = (patient: Patient) => {
    setSelectedPatient(patient);
    setShowPatientModal(true);
  };

  const handleDiseaseSelect = (disease: Disease) => {
    toast.info(`Selected disease: ${disease.name}`);
    setActiveTab("diagnosis");
  };

  const handleQuickAction = (action: string) => {
    switch (action) {
      case "diagnosis":
        setActiveTab("diagnosis");
        break;
      case "appointment":
        setActiveTab("appointments");
        break;
      case "lab":
        setActiveTab("lab-results");
        break;
      case "emergency":
        toast.info("Emergency protocol activated");
        break;
    }
  };

  const quickStats = [
    { 
      title: "Total Patients", 
      value: stats?.totalPatients?.toString() || "0", 
      change: "+12%", 
      icon: Users 
    },
    { 
      title: "Today's Appointments", 
      value: stats?.todaysAppointments?.toString() || "0", 
      change: "+5%", 
      icon: Calendar 
    },
    { 
      title: "Pending Diagnoses", 
      value: stats?.pendingDiagnoses?.toString() || "0", 
      change: "-3%", 
      icon: FileText 
    },
    { 
      title: "Critical Cases", 
      value: stats?.criticalCases?.toString() || "0", 
      change: "0%", 
      icon: AlertTriangle 
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white">
      {/* Header */}
      <header className="bg-white shadow-lg border-b border-blue-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <Activity className="h-8 w-8 text-blue-600" />
                <h1 className="text-2xl font-bold text-gray-900">MediCore Pro</h1>
              </div>
              <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                Advanced Diagnostic Platform
              </Badge>
            </div>
            <div className="flex items-center space-x-4">
              <SearchBar 
                onPatientSelect={handlePatientSelect}
                onDiseaseSelect={handleDiseaseSelect}
              />
              <Button 
                className="bg-blue-600 hover:bg-blue-700 text-white"
                onClick={() => setActiveTab("patients")}
              >
                <UserPlus className="h-4 w-4 mr-2" />
                New Patient
              </Button>
              <Button variant="outline" onClick={handleLogout}>
                <LogOut className="h-4 w-4 mr-2" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-8 bg-white shadow-sm border border-gray-200 text-xs">
            <TabsTrigger value="dashboard" className="data-[state=active]:bg-blue-600 data-[state=active]:text-white">
              Dashboard
            </TabsTrigger>
            <TabsTrigger value="patients" className="data-[state=active]:bg-blue-600 data-[state=active]:text-white">
              Patients
            </TabsTrigger>
            <TabsTrigger value="diagnosis" className="data-[state=active]:bg-blue-600 data-[state=active]:text-white">
              Diagnosis
            </TabsTrigger>
            <TabsTrigger value="records" className="data-[state=active]:bg-blue-600 data-[state=active]:text-white">
              Records
            </TabsTrigger>
            <TabsTrigger value="lab-results" className="data-[state=active]:bg-blue-600 data-[state=active]:text-white">
              Lab Results
            </TabsTrigger>
            <TabsTrigger value="prescriptions" className="data-[state=active]:bg-blue-600 data-[state=active]:text-white">
              Prescriptions
            </TabsTrigger>
            <TabsTrigger value="appointments" className="data-[state=active]:bg-blue-600 data-[state=active]:text-white">
              Appointments
            </TabsTrigger>
            <TabsTrigger value="analytics" className="data-[state=active]:bg-blue-600 data-[state=active]:text-white">
              Analytics
            </TabsTrigger>
          </TabsList>

          <TabsContent value="dashboard" className="mt-6">
            <div className="space-y-6">
              {/* Quick Stats */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {quickStats.map((stat, index) => (
                  <Card key={index} className="bg-white shadow-md hover:shadow-lg transition-shadow duration-200">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                          <p className="text-3xl font-bold text-gray-900">{stat.value}</p>
                          <p className="text-sm text-green-600 flex items-center mt-1">
                            <TrendingUp className="h-3 w-3 mr-1" />
                            {stat.change}
                          </p>
                        </div>
                        <div className="p-3 bg-blue-100 rounded-full">
                          <stat.icon className="h-6 w-6 text-blue-600" />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {/* Recent Patients & Quick Actions */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <Card className="lg:col-span-2 bg-white shadow-md">
                  <CardHeader>
                    <CardTitle className="text-xl text-gray-900">Recent Patients</CardTitle>
                    <CardDescription>Latest patient interactions and status updates</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {recentPatients?.map((patient) => (
                        <div 
                          key={patient.id} 
                          className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer"
                          onClick={() => handlePatientSelect(patient)}
                        >
                          <div className="flex items-center space-x-4">
                            <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center text-white font-semibold">
                              {patient.first_name[0]}{patient.last_name[0]}
                            </div>
                            <div>
                              <p className="font-semibold text-gray-900">{patient.first_name} {patient.last_name}</p>
                              <p className="text-sm text-gray-600">{patient.gender} • {patient.risk_level} risk</p>
                              <p className="text-xs text-gray-500">Last updated: {new Date(patient.updated_at).toLocaleDateString()}</p>
                            </div>
                          </div>
                          <Badge 
                            className={
                              patient.status === 'stable' ? 'bg-green-100 text-green-800' :
                              patient.status === 'monitoring' ? 'bg-yellow-100 text-yellow-800' :
                              patient.status === 'critical' ? 'bg-red-100 text-red-800' :
                              'bg-blue-100 text-blue-800'
                            }
                          >
                            {patient.status}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-blue-600 to-blue-700 text-white shadow-md">
                  <CardHeader>
                    <CardTitle className="text-xl">Quick Actions</CardTitle>
                    <CardDescription className="text-blue-100">Common medical workflows</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <Button 
                      variant="secondary" 
                      className="w-full justify-start bg-white/10 hover:bg-white/20 text-white border-white/20"
                      onClick={() => handleQuickAction("diagnosis")}
                    >
                      <FileText className="h-4 w-4 mr-2" />
                      Create Diagnosis
                    </Button>
                    <Button 
                      variant="secondary" 
                      className="w-full justify-start bg-white/10 hover:bg-white/20 text-white border-white/20"
                      onClick={() => handleQuickAction("appointment")}
                    >
                      <Calendar className="h-4 w-4 mr-2" />
                      Schedule Appointment
                    </Button>
                    <Button 
                      variant="secondary" 
                      className="w-full justify-start bg-white/10 hover:bg-white/20 text-white border-white/20"
                      onClick={() => handleQuickAction("lab")}
                    >
                      <Activity className="h-4 w-4 mr-2" />
                      Lab Results
                    </Button>
                    <Button 
                      variant="secondary" 
                      className="w-full justify-start bg-white/10 hover:bg-white/20 text-white border-white/20"
                      onClick={() => handleQuickAction("emergency")}
                    >
                      <AlertTriangle className="h-4 w-4 mr-2" />
                      Emergency Protocol
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="patients" className="mt-6">
            <FunctionalPatientSearch onPatientSelect={handlePatientSelect} />
          </TabsContent>

          <TabsContent value="diagnosis" className="mt-6">
            <DiagnosticWorkflow />
          </TabsContent>

          <TabsContent value="records" className="mt-6">
            <MedicalRecords />
          </TabsContent>

          <TabsContent value="lab-results" className="mt-6">
            <LabResults />
          </TabsContent>

          <TabsContent value="prescriptions" className="mt-6">
            <PrescriptionManager />
          </TabsContent>

          <TabsContent value="appointments" className="mt-6">
            <AppointmentScheduler />
          </TabsContent>

          <TabsContent value="analytics" className="mt-6">
            <AnalyticsDashboard />
          </TabsContent>
        </Tabs>
      </div>

      <PatientDetailsModal
        patient={selectedPatient}
        open={showPatientModal}
        onClose={() => {
          setShowPatientModal(false);
          setSelectedPatient(null);
        }}
      />
    </div>
  );
};

export default Index;
