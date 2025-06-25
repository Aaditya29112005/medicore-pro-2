import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { LogOut, UserPlus, Calendar, FileText, Activity, Users, TrendingUp, AlertTriangle, Sun, Moon } from "lucide-react";
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
import { useTheme } from 'next-themes';
import { Link } from "react-router-dom";
import { motion, easeOut } from "framer-motion";
import React from "react";

type Patient = Tables<"patients">;
type Disease = Tables<"diseases">;

const Index = () => {
  const [activeTab, setActiveTab] = useState("dashboard");
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [showPatientModal, setShowPatientModal] = useState(false);
  const { theme, setTheme } = useTheme();
  const [addPatientOpen, setAddPatientOpen] = useState(false);
  const [pendingAddPatientOpen, setPendingAddPatientOpen] = useState(false);

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

  // Add a sample news array for demonstration
  const news = [
    { title: "AI-powered Diagnostics Launched", date: "June 25, 2024" },
    { title: "New Lab Integration Announced", date: "June 20, 2024" },
    { title: "MediCore Pro Reaches 10,000 Patients", date: "June 10, 2024" },
    { title: "Advanced Analytics Dashboard Released", date: "May 30, 2024" },
  ];

  const containerVariants = {
    hidden: {},
    show: {
      transition: {
        staggerChildren: 0.15
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 40 },
    show: { opacity: 1, y: 0, transition: { duration: 0.7, ease: "easeOut" } }
  };

  return (
    <div className="min-h-screen bg-transparent relative">
      {/* Header */}
      <motion.header
        initial={{ opacity: 0, y: -40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: 'easeOut' }}
        className="bg-white dark:bg-gray-900 shadow-lg border-b border-blue-100 dark:border-gray-800"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <Activity className="h-8 w-8 text-blue-600 dark:text-blue-400" />
                {/* Enhanced Animated MediCore Pro name with 3D effect */}
                <motion.div className="relative flex items-center">
                  <motion.h1
                    className="text-2xl font-bold text-gray-900 dark:text-white flex relative z-10"
                    initial="hidden"
                    animate="show"
                    variants={{
                      hidden: {},
                      show: { transition: { staggerChildren: 0.07 } }
                    }}
                  >
                    {[...'MediCore Pro'].map((char, i) => (
                      <motion.span
                        key={i}
                        variants={{
                          hidden: { opacity: 0, y: 24 },
                          show: { opacity: 1, y: 0, transition: { duration: 0.5 } }
                        }}
                        style={{
                          display: char === ' ' ? 'inline-block' : 'inline',
                          animation: char !== ' ' ? `colorCycle 2s linear infinite ${i * 0.1}s` : undefined,
                          perspective: '400px',
                        }}
                        className="animated-letter-3d text-gray-900 dark:text-white"
                        whileHover={{ rotateY: 20, scale: 1.15 }}
                        transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                      >
                        {char === ' ' ? '\u00A0' : char}
                      </motion.span>
                    ))}
                  </motion.h1>
                </motion.div>
              </div>
              <Badge variant="secondary" className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
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
                onClick={() => {
                  setActiveTab("patients");
                  setPendingAddPatientOpen(true);
                }}
              >
                <UserPlus className="h-4 w-4 mr-2" />
                New Patient
              </Button>
              <Button
                variant="ghost"
                aria-label="Toggle theme"
                onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                className="rounded-full p-2"
              >
                {theme === 'dark' ? <Sun className="h-5 w-5 text-yellow-400" /> : <Moon className="h-5 w-5 text-gray-700" />}
              </Button>
              <Button variant="outline" onClick={handleLogout}>
                <LogOut className="h-4 w-4 mr-2" />
                Logout
              </Button>
              <Button
                asChild
                className="bg-blue-100 text-blue-800 hover:bg-blue-200 dark:bg-blue-900 dark:text-blue-200 dark:hover:bg-blue-800"
              >
                <Link to="/doctors">Doctors</Link>
              </Button>
              <Button
                asChild
                className="bg-white text-blue-800 border-blue-200 hover:bg-blue-50 dark:bg-gray-800 dark:text-white dark:border-gray-700 dark:hover:bg-gray-900"
              >
                <Link to="/login">Login</Link>
              </Button>
              <Button
                asChild
                className="bg-blue-600 text-white hover:bg-blue-700 dark:bg-blue-700 dark:text-white dark:hover:bg-blue-800"
              >
                <Link to="/signup">Sign Up</Link>
              </Button>
            </div>
          </div>
        </div>
      </motion.header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Tabs defaultValue="records" className="w-full">
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
              <motion.div
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, ease: 'easeOut' }}
                viewport={{ once: true }}
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
              >
                {quickStats.map((stat, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 40 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 + index * 0.1, ease: 'easeOut' }}
                    viewport={{ once: true }}
                  >
                    <Card className="bg-white/90 shadow-md hover:shadow-lg transition-shadow duration-200">
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
                  </motion.div>
                ))}
              </motion.div>

              {/* Recent Patients & Quick Actions */}
              <motion.div
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, ease: 'easeOut' }}
                viewport={{ once: true }}
                className="grid grid-cols-1 lg:grid-cols-3 gap-6"
              >
                <motion.div
                  initial={{ opacity: 0, x: -40 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.8, ease: 'easeOut' }}
                  viewport={{ once: true }}
                  className="lg:col-span-2"
                >
                  <Card className="bg-white/90 shadow-md">
                    <CardHeader>
                      <CardTitle className="text-xl text-gray-900">Recent Patients</CardTitle>
                      <CardDescription>Latest patient interactions and status updates</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {recentPatients?.map((patient) => (
                          <motion.div
                            key={patient.id}
                            initial={{ opacity: 0, x: -40 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.6, ease: 'easeOut' }}
                            viewport={{ once: true }}
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
                          </motion.div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, x: 40 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.8, ease: 'easeOut' }}
                  viewport={{ once: true }}
                >
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
                </motion.div>
              </motion.div>
            </div>
          </TabsContent>

          <TabsContent value="patients" className="mt-6">
            <FunctionalPatientSearch 
              onPatientSelect={handlePatientSelect}
              addPatientOpen={addPatientOpen}
              setAddPatientOpen={setAddPatientOpen}
              pendingAddPatientOpen={pendingAddPatientOpen}
              setPendingAddPatientOpen={setPendingAddPatientOpen}
            />
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
        {/* Animated News Section */}
        <div className="mt-12">
          <h2 className="text-2xl font-bold mb-6 text-gray-900 dark:text-white">Latest Updates</h2>
          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true }}
            className="space-y-6"
          >
            {news.map((item, idx) => (
              <motion.div
                key={idx}
                variants={itemVariants}
                whileHover={{ scale: 1.03, boxShadow: "0 4px 24px rgba(0,0,0,0.08)" }}
                className="bg-white dark:bg-gray-900 p-6 rounded-xl shadow transition-all cursor-pointer"
              >
                <div className="text-xs text-gray-500 mb-2">{item.date}</div>
                <div className="text-lg font-semibold">{item.title}</div>
              </motion.div>
            ))}
          </motion.div>
        </div>
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
