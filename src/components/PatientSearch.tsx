
import { useState } from "react";
import { Search, Filter, UserCheck, Calendar, Phone, Mail } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

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

const PatientSearch = ({ onPatientSelect }: { onPatientSelect: (patient: Patient) => void }) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterRisk, setFilterRisk] = useState("all");

  const patients: Patient[] = [
    {
      id: 1,
      name: "Sarah Johnson",
      age: 34,
      gender: "Female",
      condition: "Hypertension",
      status: "stable",
      phone: "+1 (555) 123-4567",
      email: "sarah.j@email.com",
      lastVisit: "2024-06-19",
      nextAppointment: "2024-06-26",
      riskLevel: "low"
    },
    {
      id: 2,
      name: "Michael Chen",
      age: 45,
      gender: "Male",
      condition: "Type 2 Diabetes",
      status: "monitoring",
      phone: "+1 (555) 234-5678",
      email: "m.chen@email.com",
      lastVisit: "2024-06-18",
      nextAppointment: "2024-06-25",
      riskLevel: "medium"
    },
    {
      id: 3,
      name: "Emily Rodriguez",
      age: 28,
      gender: "Female",
      condition: "Migraine",
      status: "treatment",
      phone: "+1 (555) 345-6789",
      email: "emily.r@email.com",
      lastVisit: "2024-06-17",
      riskLevel: "low"
    },
    {
      id: 4,
      name: "Robert Williams",
      age: 67,
      gender: "Male",
      condition: "Cardiovascular Disease",
      status: "critical",
      phone: "+1 (555) 456-7890",
      email: "r.williams@email.com",
      lastVisit: "2024-06-20",
      nextAppointment: "2024-06-22",
      riskLevel: "high"
    },
    {
      id: 5,
      name: "Lisa Anderson",
      age: 52,
      gender: "Female",
      condition: "Osteoarthritis",
      status: "stable",
      phone: "+1 (555) 567-8901",
      email: "lisa.a@email.com",
      lastVisit: "2024-06-16",
      nextAppointment: "2024-06-30",
      riskLevel: "low"
    }
  ];

  const filteredPatients = patients.filter(patient => {
    const matchesSearch = patient.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         patient.condition.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === "all" || patient.status === filterStatus;
    const matchesRisk = filterRisk === "all" || patient.riskLevel === filterRisk;
    
    return matchesSearch && matchesStatus && matchesRisk;
  });

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case 'high': return 'bg-red-100 text-red-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'critical': return 'destructive';
      case 'treatment': return 'secondary';
      case 'monitoring': return 'outline';
      case 'stable': return 'default';
      default: return 'outline';
    }
  };

  return (
    <div className="space-y-6">
      {/* Search and Filters */}
      <Card className="bg-white shadow-md">
        <CardHeader>
          <CardTitle className="flex items-center text-xl text-gray-900">
            <Search className="h-5 w-5 mr-2 text-blue-600" />
            Patient Search & Management
          </CardTitle>
          <CardDescription>Search, filter, and manage patient records</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Search by name, condition, or ID..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="w-full md:w-40">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="stable">Stable</SelectItem>
                <SelectItem value="monitoring">Monitoring</SelectItem>
                <SelectItem value="treatment">Treatment</SelectItem>
                <SelectItem value="critical">Critical</SelectItem>
              </SelectContent>
            </Select>
            <Select value={filterRisk} onValueChange={setFilterRisk}>
              <SelectTrigger className="w-full md:w-40">
                <SelectValue placeholder="Risk Level" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Risk Levels</SelectItem>
                <SelectItem value="low">Low Risk</SelectItem>
                <SelectItem value="medium">Medium Risk</SelectItem>
                <SelectItem value="high">High Risk</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Patient Results */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {filteredPatients.map((patient) => (
          <Card 
            key={patient.id} 
            className="bg-white shadow-md hover:shadow-lg transition-shadow duration-200 cursor-pointer border-l-4 border-l-blue-500"
            onClick={() => onPatientSelect(patient)}
          >
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center text-white font-semibold text-lg">
                    {patient.name.split(' ').map(n => n[0]).join('')}
                  </div>
                  <div>
                    <CardTitle className="text-lg text-gray-900">{patient.name}</CardTitle>
                    <p className="text-sm text-gray-600">{patient.age} years • {patient.gender}</p>
                  </div>
                </div>
                <Badge className={getRiskColor(patient.riskLevel)}>
                  {patient.riskLevel} risk
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-700">Condition:</span>
                  <span className="text-sm text-gray-900">{patient.condition}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-700">Status:</span>
                  <Badge variant={getStatusColor(patient.status)} className="capitalize">
                    {patient.status}
                  </Badge>
                </div>
                <div className="space-y-2 pt-2 border-t border-gray-100">
                  <div className="flex items-center space-x-2 text-sm text-gray-600">
                    <Phone className="h-3 w-3" />
                    <span>{patient.phone}</span>
                  </div>
                  <div className="flex items-center space-x-2 text-sm text-gray-600">
                    <Mail className="h-3 w-3" />
                    <span>{patient.email}</span>
                  </div>
                  <div className="flex items-center space-x-2 text-sm text-gray-600">
                    <Calendar className="h-3 w-3" />
                    <span>Last visit: {patient.lastVisit}</span>
                  </div>
                  {patient.nextAppointment && (
                    <div className="flex items-center space-x-2 text-sm text-blue-600">
                      <UserCheck className="h-3 w-3" />
                      <span>Next: {patient.nextAppointment}</span>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredPatients.length === 0 && (
        <Card className="bg-gray-50 border-dashed border-2 border-gray-300">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Search className="h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No patients found</h3>
            <p className="text-gray-600 text-center">Try adjusting your search criteria or filters</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default PatientSearch;
