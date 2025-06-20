
import { Calendar, Phone, Mail, MapPin, AlertTriangle, Activity, FileText, Clock } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

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
    <div className="mt-6 space-y-6">
      {/* Patient Header */}
      <Card className="bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-lg">
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
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <FileText className="h-5 w-5 mr-2 text-blue-600" />
                  Medical Summary
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="font-semibold text-gray-900">Primary Condition</h4>
                  <p className="text-gray-700">{patient.condition}</p>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900">Status</h4>
                  <Badge variant={patient.status === 'stable' ? 'default' : 'secondary'} className="capitalize">
                    {patient.status}
                  </Badge>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900">Last Visit</h4>
                  <p className="text-gray-700">{patient.lastVisit}</p>
                </div>
                {patient.nextAppointment && (
                  <div>
                    <h4 className="font-semibold text-gray-900">Next Appointment</h4>
                    <p className="text-blue-600 font-medium">{patient.nextAppointment}</p>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
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
          </div>
        </TabsContent>

        <TabsContent value="vitals" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Current Vital Signs</CardTitle>
              <CardDescription>Latest recorded measurements</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div className="text-center p-4 bg-blue-50 rounded-lg">
                  <Activity className="h-8 w-8 mx-auto text-blue-600 mb-2" />
                  <h4 className="font-semibold text-gray-900">Blood Pressure</h4>
                  <p className="text-2xl font-bold text-blue-600">{vitals.bloodPressure}</p>
                </div>
                <div className="text-center p-4 bg-green-50 rounded-lg">
                  <Activity className="h-8 w-8 mx-auto text-green-600 mb-2" />
                  <h4 className="font-semibold text-gray-900">Heart Rate</h4>
                  <p className="text-2xl font-bold text-green-600">{vitals.heartRate}</p>
                </div>
                <div className="text-center p-4 bg-orange-50 rounded-lg">
                  <Activity className="h-8 w-8 mx-auto text-orange-600 mb-2" />
                  <h4 className="font-semibold text-gray-900">Temperature</h4>
                  <p className="text-2xl font-bold text-orange-600">{vitals.temperature}</p>
                </div>
                <div className="text-center p-4 bg-purple-50 rounded-lg">
                  <Activity className="h-8 w-8 mx-auto text-purple-600 mb-2" />
                  <h4 className="font-semibold text-gray-900">Weight</h4>
                  <p className="text-2xl font-bold text-purple-600">{vitals.weight}</p>
                </div>
                <div className="text-center p-4 bg-indigo-50 rounded-lg">
                  <Activity className="h-8 w-8 mx-auto text-indigo-600 mb-2" />
                  <h4 className="font-semibold text-gray-900">Height</h4>
                  <p className="text-2xl font-bold text-indigo-600">{vitals.height}</p>
                </div>
                <div className="text-center p-4 bg-teal-50 rounded-lg">
                  <Activity className="h-8 w-8 mx-auto text-teal-600 mb-2" />
                  <h4 className="font-semibold text-gray-900">BMI</h4>
                  <p className="text-2xl font-bold text-teal-600">{vitals.bmi}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="medications" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Current Medications</CardTitle>
              <CardDescription>Active prescriptions and dosages</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {medications.map((med, index) => (
                  <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div>
                      <h4 className="font-semibold text-gray-900">{med.name}</h4>
                      <p className="text-gray-600">{med.dosage} • {med.frequency}</p>
                      <p className="text-sm text-gray-500">Prescribed: {med.prescribed}</p>
                    </div>
                    <Badge variant="outline">Active</Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="labs" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Recent Lab Results</CardTitle>
              <CardDescription>Latest laboratory test results</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {labResults.map((lab, index) => (
                  <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div>
                      <h4 className="font-semibold text-gray-900">{lab.test}</h4>
                      <p className="text-gray-600">Normal range: {lab.range}</p>
                      <p className="text-sm text-gray-500">Date: {lab.date}</p>
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
        </TabsContent>

        <TabsContent value="appointments" className="mt-6">
          <Card>
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
                        <p className="text-xs text-gray-500">{apt.time}</p>
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-900">{apt.type}</h4>
                        <p className="text-gray-600">{apt.doctor}</p>
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
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default PatientOverview;
