import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Search, Plus, User, Phone, Mail, Calendar } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Tables } from "@/integrations/supabase/types";
import { toast } from "sonner";
import AddPatientModal from "./AddPatientModal";

type Patient = Tables<"patients">;

interface FunctionalPatientSearchProps {
  onPatientSelect: (patient: Patient) => void;
  addPatientOpen?: boolean;
  setAddPatientOpen?: (open: boolean) => void;
  pendingAddPatientOpen?: boolean;
  setPendingAddPatientOpen?: (open: boolean) => void;
}

const FunctionalPatientSearch = ({ onPatientSelect, addPatientOpen, setAddPatientOpen, pendingAddPatientOpen, setPendingAddPatientOpen }: FunctionalPatientSearchProps) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredPatients, setFilteredPatients] = useState<Patient[]>([]);
  const [internalAddPatientOpen, internalSetAddPatientOpen] = useState(false);
  const modalOpen = typeof addPatientOpen === 'boolean' ? addPatientOpen : internalAddPatientOpen;
  const modalSetOpen = setAddPatientOpen || internalSetAddPatientOpen;

  const { data: patients, isLoading, refetch } = useQuery({
    queryKey: ["patients"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("patients")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) {
        toast.error("Failed to fetch patients");
        throw error;
      }
      return data;
    },
  });

  useEffect(() => {
    if (!patients) return;

    if (searchQuery.trim() === "") {
      setFilteredPatients(patients);
    } else {
      const filtered = patients.filter(
        (patient) =>
          patient.first_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          patient.last_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          patient.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          patient.phone?.includes(searchQuery)
      );
      setFilteredPatients(filtered);
    }
  }, [patients, searchQuery]);

  // Effect to handle pendingAddPatientOpen
  useEffect(() => {
    if (pendingAddPatientOpen && setPendingAddPatientOpen) {
      modalSetOpen(true);
      setPendingAddPatientOpen(false);
    }
  }, [pendingAddPatientOpen, setPendingAddPatientOpen, modalSetOpen]);

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

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case "low": return "bg-green-100 text-green-800";
      case "medium": return "bg-yellow-100 text-yellow-800";
      case "high": return "bg-orange-100 text-orange-800";
      case "critical": return "bg-red-100 text-red-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

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

  const handleAddPatientSuccess = () => {
    // Refetch the patients list to show the new patient
    refetch();
    toast.success("Patient added successfully! The list has been updated.");
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Loading Patients...</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-20 bg-gray-200 rounded"></div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-2xl">Patient Management</CardTitle>
              <CardDescription>Search and manage patient records</CardDescription>
            </div>
            <Button 
              className="bg-blue-600 hover:bg-blue-700"
              onClick={() => modalSetOpen(true)}
            >
              <Plus className="h-4 w-4 mr-2" />
              Add New Patient
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="relative mb-6">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
            <Input
              placeholder="Search patients by name, email, or phone..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 h-12 text-lg"
            />
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-4">
        {filteredPatients?.map((patient) => (
          <Card key={patient.id} className="hover:shadow-md transition-shadow cursor-pointer">
            <CardContent className="p-6" onClick={() => onPatientSelect(patient)}>
              <div className="flex items-center space-x-4">
                <Avatar className="h-12 w-12">
                  <AvatarFallback className="bg-blue-100 text-blue-700 font-semibold">
                    {patient.first_name[0]}{patient.last_name[0]}
                  </AvatarFallback>
                </Avatar>
                
                <div className="flex-1 space-y-2">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                      {patient.first_name} {patient.last_name}
                    </h3>
                    <div className="flex space-x-2">
                      <Badge className={getRiskColor(patient.risk_level)}>
                        {patient.risk_level} risk
                      </Badge>
                      <Badge className={getStatusColor(patient.status)}>
                        {patient.status}
                      </Badge>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-700 dark:text-blue-200">
                    <div className="flex items-center space-x-2">
                      <User className="h-4 w-4" />
                      <span>Age: {calculateAge(patient.date_of_birth)} • {patient.gender}</span>
                    </div>
                    
                    {patient.email && (
                      <div className="flex items-center space-x-2">
                        <Mail className="h-4 w-4" />
                        <span>{patient.email}</span>
                      </div>
                    )}
                    
                    {patient.phone && (
                      <div className="flex items-center space-x-2">
                        <Phone className="h-4 w-4" />
                        <span>{patient.phone}</span>
                      </div>
                    )}
                  </div>

                  {patient.medical_history && patient.medical_history.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-2">
                      {patient.medical_history.slice(0, 3).map((condition, index) => (
                        <Badge key={index} variant="outline" className="text-xs">
                          {condition}
                        </Badge>
                      ))}
                      {patient.medical_history.length > 3 && (
                        <Badge variant="outline" className="text-xs">
                          +{patient.medical_history.length - 3} more
                        </Badge>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
        
        {filteredPatients?.length === 0 && (
          <Card>
            <CardContent className="p-12 text-center">
              <User className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No patients found</h3>
              <p className="text-gray-600">
                {searchQuery 
                  ? "Try adjusting your search terms" 
                  : "Start by adding your first patient"}
              </p>
              {!searchQuery && (
                <Button 
                  className="mt-4 bg-blue-600 hover:bg-blue-700"
                  onClick={() => modalSetOpen(true)}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Your First Patient
                </Button>
              )}
            </CardContent>
          </Card>
        )}
      </div>

      {/* Add Patient Modal */}
      <AddPatientModal 
        open={modalOpen} 
        onClose={() => modalSetOpen(false)}
        onSuccess={handleAddPatientSuccess}
      />
    </div>
  );
};

export default FunctionalPatientSearch;
