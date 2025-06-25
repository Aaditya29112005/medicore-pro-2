import React, { useState } from "react";
import { CheckCircle, Clock, AlertTriangle, FileText, Stethoscope, Microscope, Activity, Brain } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { motion } from 'framer-motion';
import ThreeDAnimatedCard from '@/components/ui/3DAnimatedCard';
import FloatingParticles from '@/components/FloatingParticles';

const DiagnosticWorkflow = () => {
  const [currentStep, setCurrentStep] = useState(0);
  const [symptoms, setSymptoms] = useState("");
  const [vitalSigns, setVitalSigns] = useState({
    bloodPressure: "",
    heartRate: "",
    temperature: "",
    oxygenSaturation: ""
  });
  const [selectedTests, setSelectedTests] = useState<string[]>([]);
  const [completed, setCompleted] = useState(false);

  const diagnosticSteps = [
    { id: 0, title: "Patient History", icon: FileText, description: "Collect symptoms and medical history" },
    { id: 1, title: "Physical Examination", icon: Stethoscope, description: "Vital signs and physical assessment" },
    { id: 2, title: "Diagnostic Tests", icon: Microscope, description: "Laboratory and imaging studies" },
    { id: 3, title: "Analysis & Diagnosis", icon: Brain, description: "AI-assisted diagnostic analysis" },
    { id: 4, title: "Treatment Plan", icon: Activity, description: "Create comprehensive treatment plan" }
  ];

  const availableTests = [
    { id: "blood-work", name: "Complete Blood Count (CBC)", category: "Laboratory", urgency: "routine" },
    { id: "chest-xray", name: "Chest X-Ray", category: "Imaging", urgency: "routine" },
    { id: "ecg", name: "Electrocardiogram (ECG)", category: "Cardiac", urgency: "urgent" },
    { id: "ct-scan", name: "CT Scan", category: "Imaging", urgency: "urgent" },
    { id: "mri", name: "MRI", category: "Imaging", urgency: "routine" },
    { id: "urinalysis", name: "Urinalysis", category: "Laboratory", urgency: "routine" },
    { id: "blood-glucose", name: "Blood Glucose", category: "Laboratory", urgency: "stat" },
    { id: "lipid-panel", name: "Lipid Panel", category: "Laboratory", urgency: "routine" }
  ];

  const handleTestSelection = (testId: string) => {
    setSelectedTests(prev => 
      prev.includes(testId) 
        ? prev.filter(id => id !== testId)
        : [...prev, testId]
    );
  };

  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
      case 'stat': return 'bg-red-100 text-red-800';
      case 'urgent': return 'bg-orange-100 text-orange-800';
      case 'routine': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6 relative">
      {/* Progress Header */}
      <ThreeDAnimatedCard>
        <Card className="bg-gradient-to-r from-purple-600 to-blue-500 text-white shadow-2xl border border-white/20 hover:shadow-blue-200/40 transition-shadow duration-300 rounded-2xl overflow-hidden">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-bold">Diagnostic Workflow</h2>
              <Badge variant="secondary" className="bg-white/20 text-white">
                Step {currentStep + 1} of {diagnosticSteps.length}
              </Badge>
            </div>
            <div className="flex items-center space-x-4 overflow-x-auto">
              {diagnosticSteps.map((step, index) => (
                <div key={step.id} className="flex items-center space-x-2 min-w-max">
                  <div className={`flex items-center justify-center w-10 h-10 rounded-full border-2 ${
                    index <= currentStep 
                      ? 'bg-white text-blue-600 border-white' 
                      : 'bg-transparent text-white border-white/50'
                  }`}>
                    {index < currentStep ? (
                      <CheckCircle className="h-5 w-5" />
                    ) : (
                      <step.icon className="h-5 w-5" />
                    )}
                  </div>
                  <div className="text-sm">
                    <p className="font-medium">{step.title}</p>
                    <p className="text-blue-100 text-xs">{step.description}</p>
                  </div>
                  {index < diagnosticSteps.length - 1 && (
                    <div className="w-8 h-px bg-white/30 mx-2" />
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </ThreeDAnimatedCard>
      {/* Step Content */}
      <ThreeDAnimatedCard>
        <Card className="bg-white/30 backdrop-blur-lg shadow-2xl border border-white/20 rounded-2xl overflow-hidden">
          <CardHeader>
            <CardTitle className="flex items-center text-xl text-gray-900 dark:text-white">
              {React.createElement(diagnosticSteps[currentStep].icon, { className: "h-6 w-6 mr-2 text-blue-600" })}
              {diagnosticSteps[currentStep].title}
            </CardTitle>
            <CardDescription>{diagnosticSteps[currentStep].description}</CardDescription>
          </CardHeader>
          <CardContent>
            {currentStep === 0 && (
              <div className="space-y-6">
                <div>
                  <Label htmlFor="chief-complaint" className="text-base font-medium">Chief Complaint</Label>
                  <Input
                    id="chief-complaint"
                    placeholder="Primary reason for visit..."
                    className="mt-2"
                  />
                </div>
                <div>
                  <Label htmlFor="symptoms" className="text-base font-medium">Symptoms & History</Label>
                  <Textarea
                    id="symptoms"
                    placeholder="Describe patient symptoms, duration, severity, and relevant medical history..."
                    value={symptoms}
                    onChange={(e) => setSymptoms(e.target.value)}
                    className="mt-2 min-h-32"
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label className="text-base font-medium">Allergies</Label>
                    <Input placeholder="Known allergies..." className="mt-2" />
                  </div>
                  <div>
                    <Label className="text-base font-medium">Current Medications</Label>
                    <Input placeholder="Current medications..." className="mt-2" />
                  </div>
                </div>
              </div>
            )}

            {currentStep === 1 && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div>
                    <Label htmlFor="bp" className="text-base font-medium">Blood Pressure</Label>
                    <Input
                      id="bp"
                      placeholder="120/80 mmHg"
                      value={vitalSigns.bloodPressure}
                      onChange={(e) => setVitalSigns(prev => ({ ...prev, bloodPressure: e.target.value }))}
                      className="mt-2"
                    />
                  </div>
                  <div>
                    <Label htmlFor="hr" className="text-base font-medium">Heart Rate</Label>
                    <Input
                      id="hr"
                      placeholder="72 bpm"
                      value={vitalSigns.heartRate}
                      onChange={(e) => setVitalSigns(prev => ({ ...prev, heartRate: e.target.value }))}
                      className="mt-2"
                    />
                  </div>
                  <div>
                    <Label htmlFor="temp" className="text-base font-medium">Temperature</Label>
                    <Input
                      id="temp"
                      placeholder="98.6°F"
                      value={vitalSigns.temperature}
                      onChange={(e) => setVitalSigns(prev => ({ ...prev, temperature: e.target.value }))}
                      className="mt-2"
                    />
                  </div>
                  <div>
                    <Label htmlFor="o2sat" className="text-base font-medium">O2 Saturation</Label>
                    <Input
                      id="o2sat"
                      placeholder="98%"
                      value={vitalSigns.oxygenSaturation}
                      onChange={(e) => setVitalSigns(prev => ({ ...prev, oxygenSaturation: e.target.value }))}
                      className="mt-2"
                    />
                  </div>
                </div>
                <div>
                  <Label className="text-base font-medium">Physical Examination Notes</Label>
                  <Textarea
                    placeholder="Document physical examination findings..."
                    className="mt-2 min-h-32"
                  />
                </div>
              </div>
            )}

            {currentStep === 2 && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Select Diagnostic Tests</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {availableTests.map((test) => (
                      <div
                        key={test.id}
                        className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
                          selectedTests.includes(test.id)
                            ? 'border-blue-500 bg-blue-50'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                        onClick={() => handleTestSelection(test.id)}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <h4 className="font-medium text-gray-900 dark:text-white">{test.name}</h4>
                            <p className="text-sm text-gray-600 dark:text-blue-200 mt-1">{test.category}</p>
                          </div>
                          <Badge className={getUrgencyColor(test.urgency)} variant="secondary">
                            {test.urgency}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                {selectedTests.length > 0 && (
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <h4 className="font-medium text-gray-900 dark:text-white mb-2">Selected Tests ({selectedTests.length})</h4>
                    <div className="flex flex-wrap gap-2">
                      {selectedTests.map(testId => {
                        const test = availableTests.find(t => t.id === testId);
                        return test ? (
                          <Badge key={testId} variant="secondary" className="bg-blue-100 text-blue-800">
                            {test.name}
                          </Badge>
                        ) : null;
                      })}
                    </div>
                  </div>
                )}
              </div>
            )}

            {currentStep === 3 && (
              <div className="space-y-6">
                <div className="bg-gradient-to-r from-green-50 to-blue-50 p-6 rounded-lg border border-green-200">
                  <div className="flex items-center space-x-3 mb-4">
                    <Brain className="h-8 w-8 text-green-600" />
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white">AI Diagnostic Analysis</h3>
                      <p className="text-sm text-gray-600 dark:text-blue-200">Based on collected data and medical patterns</p>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div className="bg-white p-4 rounded-lg shadow-sm">
                      <h4 className="font-medium text-gray-900 dark:text-white mb-2">Primary Diagnosis (85% confidence)</h4>
                      <p className="text-gray-700 dark:text-white">Essential Hypertension (I10)</p>
                      <p className="text-sm text-gray-600 dark:text-blue-200 mt-1">Based on elevated blood pressure readings and patient history</p>
                    </div>
                    <div className="bg-white p-4 rounded-lg shadow-sm">
                      <h4 className="font-medium text-gray-900 dark:text-white mb-2">Differential Diagnoses</h4>
                      <ul className="space-y-2 text-gray-700 dark:text-white">
                        <li className="flex justify-between">
                          <span>Secondary Hypertension</span>
                          <Badge variant="outline">15%</Badge>
                        </li>
                        <li className="flex justify-between">
                          <span>White Coat Hypertension</span>
                          <Badge variant="outline">10%</Badge>
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {currentStep === 4 && !completed && (
              <motion.div initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} className="mb-8">
                <div className="bg-gradient-to-br from-blue-50 to-purple-50 p-6 rounded-2xl shadow-xl border border-blue-200/40">
                  <h2 className="text-2xl font-bold text-blue-700 dark:text-white mb-4 flex items-center"><FileText className="h-6 w-6 mr-2 text-blue-400" /> Complete Diagnosis Report</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h3 className="font-semibold text-blue-900 dark:text-white mb-2">Patient History</h3>
                      <p className="text-gray-700 dark:text-white mb-1"><span className="font-medium">Symptoms:</span> {symptoms || 'N/A'}</p>
                      <p className="text-gray-700 dark:text-white mb-1"><span className="font-medium">Blood Pressure:</span> {vitalSigns.bloodPressure || 'N/A'}</p>
                      <p className="text-gray-700 dark:text-white mb-1"><span className="font-medium">Heart Rate:</span> {vitalSigns.heartRate || 'N/A'}</p>
                      <p className="text-gray-700 dark:text-white mb-1"><span className="font-medium">Temperature:</span> {vitalSigns.temperature || 'N/A'}</p>
                      <p className="text-gray-700 dark:text-white mb-1"><span className="font-medium">O2 Saturation:</span> {vitalSigns.oxygenSaturation || 'N/A'}</p>
                    </div>
                    <div>
                      <h3 className="font-semibold text-blue-900 dark:text-white mb-2">Tests & Diagnosis</h3>
                      <p className="text-gray-700 dark:text-white mb-1"><span className="font-medium">Selected Tests:</span> {selectedTests.length > 0 ? selectedTests.map(id => availableTests.find(t => t.id === id)?.name).join(', ') : 'None'}</p>
                      <p className="text-gray-700 dark:text-white mb-1"><span className="font-medium">Primary Diagnosis:</span> Essential Hypertension (I10)</p>
                      <p className="text-gray-700 dark:text-white mb-1"><span className="font-medium">Differential:</span> Secondary Hypertension, White Coat Hypertension</p>
                    </div>
                  </div>
                  <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h3 className="font-semibold text-green-900 mb-2">Treatment Plan</h3>
                      <ul className="text-green-800 list-disc ml-5">
                        <li>Lisinopril 10mg daily</li>
                        <li>Amlodipine 5mg daily</li>
                        <li>Low sodium diet (&lt;2g/day)</li>
                        <li>Regular exercise 30min/day</li>
                        <li>Weight management</li>
                      </ul>
                    </div>
                    <div>
                      <h3 className="font-semibold text-purple-900 mb-2">Follow-up & Monitoring</h3>
                      <ul className="text-purple-800 list-disc ml-5">
                        <li>Next appointment: 2 weeks - BP recheck</li>
                        <li>Home BP monitoring</li>
                        <li>Monthly lab work</li>
                        <li>Medication compliance</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
            {currentStep === 4 && !completed && (
              <div className="flex justify-center mt-8">
                <motion.button
                  whileHover={{ scale: 1.05, boxShadow: '0 0 16px #60a5fa' }}
                  whileTap={{ scale: 0.97 }}
                  className="px-10 py-4 rounded-full bg-gradient-to-r from-blue-500 to-green-500 text-white text-xl font-bold shadow-lg backdrop-blur-lg border border-white/20 transition-all duration-300"
                  onClick={() => setCompleted(true)}
                >
                  Complete
                </motion.button>
              </div>
            )}
            {currentStep === 4 && completed && (
              <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ type: 'spring', stiffness: 200, damping: 20 }} className="flex flex-col items-center justify-center py-12">
                <CheckCircle className="h-16 w-16 text-green-500 mb-4 animate-bounce" />
                <h2 className="text-3xl font-bold text-green-700 dark:text-white mb-2">Diagnosis Complete!</h2>
                <p className="text-lg text-gray-700 dark:text-white mb-4">The full report has been saved and is ready for review.</p>
              </motion.div>
            )}

            {/* Navigation Buttons */}
            <div className="flex justify-between pt-6 border-t border-gray-200">
              <Button
                variant="outline"
                onClick={() => setCurrentStep(Math.max(0, currentStep - 1))}
                disabled={currentStep === 0}
              >
                Previous Step
              </Button>
              <Button
                onClick={() => setCurrentStep(Math.min(diagnosticSteps.length - 1, currentStep + 1))}
                disabled={currentStep === diagnosticSteps.length - 1}
                className="bg-blue-600 hover:bg-blue-700"
              >
                {currentStep === diagnosticSteps.length - 1 ? 'Complete' : 'Next Step'}
              </Button>
            </div>
          </CardContent>
        </Card>
      </ThreeDAnimatedCard>
    </div>
  );
};

export default DiagnosticWorkflow;
