import { Calendar, Phone, Mail, MapPin, AlertTriangle, Activity, FileText, Clock } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import ThreeDAnimatedCard from '@/components/ui/3DAnimatedCard';
import FloatingParticles from '@/components/FloatingParticles';
import { motion, useSpring, useInView, useTransform } from 'framer-motion';
import { useRef, useEffect } from 'react';

interface Patient {
  id: number;
  name: string;
  age: number;
  gender: string;
  condition: string;
  status: string;
  phone: string;
  email: string;
  lastVisit: string;
  nextAppointment?: string;
  riskLevel: 'low' | 'medium' | 'high';
}

const AnimatedCounter = ({ value }: { value: number }) => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true });
  const spring = useSpring(0, { stiffness: 100, damping: 30 });
  const displayValue = useTransform(spring, (latest) => Math.round(latest).toLocaleString());
  useEffect(() => { if (isInView) { spring.set(value); } }, [isInView, value, spring]);
  return <motion.span ref={ref}>{displayValue}</motion.span>;
};

const PatientOverview = ({ patient }: { patient: Patient }) => {
  const vitals = {
    bloodPressure: "125/82 mmHg",
    heartRate: "72 bpm",
    temperature: "98.4°F",
    weight: "165 lbs",
    height: "5'6\"",
    bmi: "26.6"
  };

  const medications = [
    { name: "Lisinopril", dosage: "10mg", frequency: "Once daily", prescribed: "2024-05-15" },
    { name: "Metformin", dosage: "500mg", frequency: "Twice daily", prescribed: "2024-04-20" },
    { name: "Aspirin", dosage: "81mg", frequency: "Once daily", prescribed: "2024-03-10" }
  ];

  const labResults = [
    { test: "HbA1c", value: "6.8%", range: "<7.0%", status: "normal", date: "2024-06-15" },
    { test: "Total Cholesterol", value: "195 mg/dL", range: "<200 mg/dL", status: "normal", date: "2024-06-15" },
    { test: "Creatinine", value: "1.1 mg/dL", range: "0.6-1.2 mg/dL", status: "normal", date: "2024-06-15" },
    { test: "eGFR", value: "85 mL/min", range: ">60 mL/min", status: "normal", date: "2024-06-15" }
  ];

  const appointments = [
    { date: "2024-06-26", time: "10:30 AM", type: "Follow-up", doctor: "Dr. Smith", status: "scheduled" },
    { date: "2024-06-19", time: "2:00 PM", type: "Routine Check", doctor: "Dr. Smith", status: "completed" },
    { date: "2024-05-15", time: "11:00 AM", type: "Initial Consultation", doctor: "Dr. Smith", status: "completed" }
  ];

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case 'high': return 'bg-red-100 text-red-800 border-red-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'normal': return 'text-green-600';
      case 'high': return 'text-red-600';
      case 'low': return 'text-blue-600';
      default: return 'text-gray-600';
    }
  };

  return (
    <div className="mt-6 space-y-6 relative">
      {/* Patient Header */}
      <ThreeDAnimatedCard>
        <Card className="bg-white/30 backdrop-blur-lg shadow-2xl border border-white/20 hover:shadow-blue-200/40 transition-shadow duration-300 rounded-2xl overflow-hidden">
          <CardContent className="p-6">
            <div className="flex items-start justify-between">
              <div className="flex items-start space-x-4">
                <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center text-2xl font-bold">
                  {patient.name.split(' ').map(n => n[0]).join('')}
                </div>
                <div>
                  <h2 className="text-2xl font-bold">{patient.name}</h2>
                  <p className="text-blue-100 text-lg">{patient.age} years old • {patient.gender}</p>
                  <div className="flex items-center space-x-4 mt-2 text-blue-100">
                    <span className="flex items-center space-x-1">
                      <Phone className="h-4 w-4" />
                      <span>{patient.phone}</span>
                    </span>
                    <span className="flex items-center space-x-1">
                      <Mail className="h-4 w-4" />
                      <span>{patient.email}</span>
                    </span>
                  </div>
                </div>
              </div>
              <div className="text-right">
                <Badge className={`${getRiskColor(patient.riskLevel)} border`}>
                  {patient.riskLevel.toUpperCase()} RISK
                </Badge>
                <p className="text-blue-100 mt-2">Patient ID: #{patient.id.toString().padStart(6, '0')}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </ThreeDAnimatedCard>

      {/* Patient Details Tabs */}
      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid w-full grid-cols-5 bg-white shadow-sm border border-gray-200">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="vitals">Vitals</TabsTrigger>
          <TabsTrigger value="medications">Medications</TabsTrigger>
          <TabsTrigger value="labs">Lab Results</TabsTrigger>
          <TabsTrigger value="appointments">Appointments</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="mt-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <ThreeDAnimatedCard>
              <Card className="lg:col-span-2 bg-white/30 backdrop-blur-lg shadow-2xl border border-white/20 rounded-2xl overflow-hidden">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <FileText className="h-5 w-5 mr-2 text-blue-600" />
                    Medical Summary
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <h4 className="font-semibold text-gray-900 dark:text-white">Primary Condition</h4>
                    <p className="text-gray-700 dark:text-white">{patient.condition}</p>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 dark:text-white">Status</h4>
                    <Badge variant={patient.status === 'stable' ? 'default' : 'secondary'} className="capitalize">
                      {patient.status}
                    </Badge>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 dark:text-white">Last Visit</h4>
                    <p className="text-gray-700 dark:text-white">{patient.lastVisit}</p>
                  </div>
                  {patient.nextAppointment && (
                    <div>
                      <h4 className="font-semibold text-gray-900 dark:text-white">Next Appointment</h4>
                      <p className="text-blue-600 font-medium">{patient.nextAppointment}</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </ThreeDAnimatedCard>

            <ThreeDAnimatedCard>
              <Card className="bg-white/30 backdrop-blur-lg shadow-2xl border border-white/20 rounded-2xl overflow-hidden">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <AlertTriangle className="h-5 w-5 mr-2 text-orange-600" />
                    Quick Actions
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Button className="w-full justify-start" variant="outline">
                    <Calendar className="h-4 w-4 mr-2" />
                    Schedule Appointment
                  </Button>
                  <Button className="w-full justify-start" variant="outline">
                    <FileText className="h-4 w-4 mr-2" />
                    New Diagnosis
                  </Button>
                  <Button className="w-full justify-start" variant="outline">
                    <Activity className="h-4 w-4 mr-2" />
                    Order Tests
                  </Button>
                  <Button className="w-full justify-start" variant="outline">
                    <Phone className="h-4 w-4 mr-2" />
                    Contact Patient
                  </Button>
                </CardContent>
              </Card>
            </ThreeDAnimatedCard>
          </div>
        </TabsContent>

        <TabsContent value="vitals" className="mt-6">
          <ThreeDAnimatedCard>
            <Card className="bg-white/30 backdrop-blur-lg shadow-2xl border border-white/20 rounded-2xl overflow-hidden">
              <CardHeader>
                <CardTitle>Current Vital Signs</CardTitle>
                <CardDescription>Latest recorded measurements</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  <div className="text-center p-4 bg-blue-50 rounded-lg">
                    <Activity className="h-8 w-8 mx-auto text-blue-600 mb-2" />
                    <h4 className="font-semibold text-gray-900 dark:text-white">Blood Pressure</h4>
                    <p className="text-2xl font-bold text-blue-600"><AnimatedCounter value={parseInt(vitals.bloodPressure.split('/')[0])} />/{vitals.bloodPressure.split('/')[1]}</p>
                  </div>
                  <div className="text-center p-4 bg-green-50 rounded-lg">
                    <Activity className="h-8 w-8 mx-auto text-green-600 mb-2" />
                    <h4 className="font-semibold text-gray-900 dark:text-white">Heart Rate</h4>
                    <p className="text-2xl font-bold text-green-600"><AnimatedCounter value={parseInt(vitals.heartRate)} /> bpm</p>
                  </div>
                  <div className="text-center p-4 bg-orange-50 rounded-lg">
                    <Activity className="h-8 w-8 mx-auto text-orange-600 mb-2" />
                    <h4 className="font-semibold text-gray-900 dark:text-white">Temperature</h4>
                    <p className="text-2xl font-bold text-orange-600"><AnimatedCounter value={parseFloat(vitals.temperature)} />°F</p>
                  </div>
                  <div className="text-center p-4 bg-purple-50 rounded-lg">
                    <Activity className="h-8 w-8 mx-auto text-purple-600 mb-2" />
                    <h4 className="font-semibold text-gray-900 dark:text-white">Weight</h4>
                    <p className="text-2xl font-bold text-purple-600">{vitals.weight}</p>
                  </div>
                  <div className="text-center p-4 bg-indigo-50 rounded-lg">
                    <Activity className="h-8 w-8 mx-auto text-indigo-600 mb-2" />
                    <h4 className="font-semibold text-gray-900 dark:text-white">Height</h4>
                    <p className="text-2xl font-bold text-indigo-600">{vitals.height}</p>
                  </div>
                  <div className="text-center p-4 bg-teal-50 rounded-lg">
                    <Activity className="h-8 w-8 mx-auto text-teal-600 mb-2" />
                    <h4 className="font-semibold text-gray-900 dark:text-white">BMI</h4>
                    <p className="text-2xl font-bold text-teal-600">{vitals.bmi}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </ThreeDAnimatedCard>
        </TabsContent>

        <TabsContent value="medications" className="mt-6">
          <ThreeDAnimatedCard>
            <Card className="bg-white/30 backdrop-blur-lg shadow-2xl border border-white/20 rounded-2xl overflow-hidden">
              <CardHeader>
                <CardTitle>Current Medications</CardTitle>
                <CardDescription>Active prescriptions and dosages</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {medications.map((med, index) => (
                    <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                      <div>
                        <h4 className="font-semibold text-gray-900 dark:text-white">{med.name}</h4>
                        <p className="text-gray-600 dark:text-white">{med.dosage} • {med.frequency}</p>
                        <p className="text-sm text-gray-500 dark:text-white">Prescribed: {med.prescribed}</p>
                      </div>
                      <Badge variant="outline">Active</Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </ThreeDAnimatedCard>
        </TabsContent>

        <TabsContent value="labs" className="mt-6">
          <ThreeDAnimatedCard>
            <Card className="bg-white/30 backdrop-blur-lg shadow-2xl border border-white/20 rounded-2xl overflow-hidden">
              <CardHeader>
                <CardTitle>Recent Lab Results</CardTitle>
                <CardDescription>Latest laboratory test results</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {labResults.map((lab, index) => (
                    <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                      <div>
                        <h4 className="font-semibold text-gray-900 dark:text-white">{lab.test}</h4>
                        <p className="text-gray-600 dark:text-white">Normal range: {lab.range}</p>
                        <p className="text-sm text-gray-500 dark:text-white">Date: {lab.date}</p>
                      </div>
                      <div className="text-right">
                        <p className={`text-xl font-bold ${getStatusColor(lab.status)}`}>
                          {lab.value}
                        </p>
                        <Badge variant={lab.status === 'normal' ? 'default' : 'destructive'}>
                          {lab.status}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </ThreeDAnimatedCard>
        </TabsContent>

        <TabsContent value="appointments" className="mt-6">
          <ThreeDAnimatedCard>
            <Card className="bg-white/30 backdrop-blur-lg shadow-2xl border border-white/20 rounded-2xl overflow-hidden">
              <CardHeader>
                <CardTitle>Appointment History</CardTitle>
                <CardDescription>Past and upcoming appointments</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {appointments.map((apt, index) => (
                    <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                      <div className="flex items-center space-x-4">
                        <div className="text-center">
                          <Calendar className="h-6 w-6 text-blue-600 mx-auto" />
                          <p className="text-sm font-medium">{apt.date}</p>
                          <p className="text-xs text-gray-500 dark:text-white">{apt.time}</p>
                        </div>
                        <div>
                          <h4 className="font-semibold text-gray-900 dark:text-white">{apt.type}</h4>
                          <p className="text-gray-600 dark:text-white">{apt.doctor}</p>
                        </div>
                      </div>
                      <Badge variant={apt.status === 'completed' ? 'default' : 'secondary'}>
                        {apt.status}
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </ThreeDAnimatedCard>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default PatientOverview;
