
import { useState, useEffect } from "react";
import { Search, User, Stethoscope } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { Tables } from "@/integrations/supabase/types";

type Patient = Tables<"patients">;
type Disease = Tables<"diseases">;

interface SearchBarProps {
  onPatientSelect?: (patient: Patient) => void;
  onDiseaseSelect?: (disease: Disease) => void;
}

const SearchBar = ({ onPatientSelect, onDiseaseSelect }: SearchBarProps) => {
  const [query, setQuery] = useState("");
  const [patients, setPatients] = useState<Patient[]>([]);
  const [diseases, setDiseases] = useState<Disease[]>([]);
  const [showResults, setShowResults] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const searchData = async () => {
      if (query.length < 2) {
        setPatients([]);
        setDiseases([]);
        setShowResults(false);
        return;
      }

      setLoading(true);
      
      try {
        // Search patients
        const { data: patientsData } = await supabase
          .from("patients")
          .select("*")
          .or(`first_name.ilike.%${query}%,last_name.ilike.%${query}%,email.ilike.%${query}%`)
          .limit(5);

        // Search diseases
        const { data: diseasesData } = await supabase
          .from("diseases")
          .select("*")
          .or(`name.ilike.%${query}%,category.ilike.%${query}%,description.ilike.%${query}%`)
          .limit(5);

        setPatients(patientsData || []);
        setDiseases(diseasesData || []);
        setShowResults(true);
      } catch (error) {
        console.error("Search error:", error);
      } finally {
        setLoading(false);
      }
    };

    const debounceTimer = setTimeout(searchData, 300);
    return () => clearTimeout(debounceTimer);
  }, [query]);

  const handlePatientClick = (patient: Patient) => {
    onPatientSelect?.(patient);
    setShowResults(false);
    setQuery("");
  };

  const handleDiseaseClick = (disease: Disease) => {
    onDiseaseSelect?.(disease);
    setShowResults(false);
    setQuery("");
  };

  return (
    <div className="relative w-64">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
        <Input
          placeholder="Search patients, diseases..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => query.length >= 2 && setShowResults(true)}
          onBlur={() => setTimeout(() => setShowResults(false), 200)}
          className="pl-10 bg-gray-50 border-gray-200 focus:bg-white transition-colors"
        />
      </div>

      {showResults && (patients.length > 0 || diseases.length > 0) && (
        <Card className="absolute top-full left-0 right-0 mt-1 z-50 shadow-lg">
          <CardContent className="p-2">
            {patients.length > 0 && (
              <div className="mb-2">
                <p className="text-xs font-semibold text-gray-500 mb-1 px-2">Patients</p>
                {patients.map((patient) => (
                  <div
                    key={patient.id}
                    onClick={() => handlePatientClick(patient)}
                    className="flex items-center space-x-3 p-2 hover:bg-gray-100 cursor-pointer rounded"
                  >
                    <User className="h-4 w-4 text-blue-600" />
                    <div className="flex-1">
                      <p className="text-sm font-medium">
                        {patient.first_name} {patient.last_name}
                      </p>
                      <p className="text-xs text-gray-500">{patient.email}</p>
                    </div>
                    <Badge variant="outline" className="text-xs">
                      {patient.status}
                    </Badge>
                  </div>
                ))}
              </div>
            )}

            {diseases.length > 0 && (
              <div>
                <p className="text-xs font-semibold text-gray-500 mb-1 px-2">Diseases</p>
                {diseases.map((disease) => (
                  <div
                    key={disease.id}
                    onClick={() => handleDiseaseClick(disease)}
                    className="flex items-center space-x-3 p-2 hover:bg-gray-100 cursor-pointer rounded"
                  >
                    <Stethoscope className="h-4 w-4 text-green-600" />
                    <div className="flex-1">
                      <p className="text-sm font-medium">{disease.name}</p>
                      <p className="text-xs text-gray-500">{disease.category}</p>
                    </div>
                    <Badge variant="secondary" className="text-xs">
                      {disease.icd_code}
                    </Badge>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {loading && showResults && (
        <Card className="absolute top-full left-0 right-0 mt-1 z-50 shadow-lg">
          <CardContent className="p-4 text-center">
            <p className="text-sm text-gray-500">Searching...</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default SearchBar;
