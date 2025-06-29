import { useState, useEffect } from "react";
import { FileText, Download, Upload, Search, Filter, Calendar, User, Stethoscope, Pill } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import jsPDF from "jspdf";
import ThreeDAnimatedCard from '@/components/ui/3DAnimatedCard';
import FloatingParticles from '@/components/FloatingParticles';
import { motion, useSpring, useInView, useTransform } from 'framer-motion';
import { useRef } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { supabase } from '@/integrations/supabase/client';

const AnimatedCounter = ({ value }: { value: number }) => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true });
  const spring = useSpring(0, { stiffness: 100, damping: 30 });
  const displayValue = useTransform(spring, (latest) => Math.round(latest).toLocaleString());
  useEffect(() => { if (isInView) { spring.set(value); } }, [isInView, value, spring]);
  return <motion.span ref={ref}>{displayValue}</motion.span>;
};

const MedicalRecords = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState("all");
  const [filterDate, setFilterDate] = useState("all");
  const [templateModalOpen, setTemplateModalOpen] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<any>(null);
  const [templateForm, setTemplateForm] = useState<any>({});
  const [analytics, setAnalytics] = useState({ total: 0, completion: 0, pending: 0, loading: true, error: '' });

  const records = [
    {
      id: 1,
      patient: "Sarah Johnson",
      type: "diagnosis",
      title: "Hypertension Diagnosis",
      date: "2024-06-19",
      doctor: "Dr. Smith",
      status: "finalized",
      description: "Essential hypertension with recommendation for lifestyle modifications and medication."
    },
    {
      id: 2,
      patient: "Michael Chen",
      type: "lab",
      title: "Complete Blood Count",
      date: "2024-06-18",
      doctor: "Dr. Johnson",
      status: "reviewed",
      description: "CBC results showing normal values across all parameters."
    },
    {
      id: 3,
      patient: "Emily Rodriguez",
      type: "imaging",
      title: "Brain MRI",
      date: "2024-06-17",
      doctor: "Dr. Williams",
      status: "pending",
      description: "MRI scan for migraine evaluation - awaiting radiologist review."
    },
    {
      id: 4,
      patient: "Robert Williams",
      type: "prescription",
      title: "Medication Adjustment",
      date: "2024-06-16",
      doctor: "Dr. Smith",
      status: "active",
      description: "Increased Lisinopril dosage from 5mg to 10mg daily for better BP control."
    },
    {
      id: 5,
      patient: "Lisa Anderson",
      type: "consultation",
      title: "Orthopedic Consultation",
      date: "2024-06-15",
      doctor: "Dr. Brown",
      status: "finalized",
      description: "Knee pain evaluation with recommendation for physical therapy."
    }
  ];

  const templates = [
    { name: "Progress Note", type: "consultation", icon: FileText },
    { name: "Discharge Summary", type: "summary", icon: User },
    { name: "Diagnostic Report", type: "diagnosis", icon: Stethoscope },
    { name: "Prescription Form", type: "prescription", icon: Pill }
  ];

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'diagnosis': return 'bg-blue-100 text-blue-800';
      case 'lab': return 'bg-green-100 text-green-800';
      case 'imaging': return 'bg-purple-100 text-purple-800';
      case 'prescription': return 'bg-orange-100 text-orange-800';
      case 'consultation': return 'bg-teal-100 text-teal-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'finalized': return 'default';
      case 'reviewed': return 'secondary';
      case 'pending': return 'outline';
      case 'active': return 'default';
      default: return 'outline';
    }
  };

  const filteredRecords = records.filter(record => {
    const matchesSearch = record.patient.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         record.title.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = filterType === 'all' || record.type === filterType;
    const matchesDate = filterDate === 'all' || 
                       (filterDate === 'today' && record.date === '2024-06-19') ||
                       (filterDate === 'week' && new Date(record.date) >= new Date('2024-06-13'));
    
    return matchesSearch && matchesType && matchesDate;
  });

  // Fetch analytics from Supabase
  useEffect(() => {
    const fetchAnalytics = async () => {
      setAnalytics(a => ({ ...a, loading: true, error: '' }));
      try {
        // Count all records (diagnosis + lab + prescription + consultation)
        const { count: diagnosisCount } = await supabase.from('patient_diagnoses').select('id', { count: 'exact', head: true });
        const { count: labCount } = await supabase.from('lab_results').select('id', { count: 'exact', head: true });
        const { count: rxCount } = await supabase.from('prescriptions').select('id', { count: 'exact', head: true });
        const { count: consultCount } = { count: 0 }; // Add consultation table if exists
        const total = (diagnosisCount || 0) + (labCount || 0) + (rxCount || 0) + (consultCount || 0);
        // Completion rate: finalized/total (mocked for now)
        const completion = total > 0 ? Math.round(((diagnosisCount || 0) + (labCount || 0)) / total * 100) : 0;
        // Pending reviews: lab results with status 'pending'
        const { count: pending } = await supabase.from('lab_results').select('id', { count: 'exact', head: true }).eq('status', 'pending');
        setAnalytics({ total, completion, pending: pending || 0, loading: false, error: '' });
      } catch (e) {
        setAnalytics(a => ({ ...a, loading: false, error: 'Failed to load analytics' }));
      }
    };
    fetchAnalytics();
  }, []);

  const handleExportPDF = (record: any) => {
    const doc = new jsPDF();
    // Header
    doc.setFontSize(18);
    doc.text('MediCore Pro - Medical Record', 10, 15);
    doc.setFontSize(12);
    doc.text(`Exported: ${new Date().toLocaleString()}`, 10, 25);
    doc.line(10, 28, 200, 28);
    // Record details
    let y = 38;
    doc.setFontSize(14);
    doc.text('Patient Information', 10, y);
    y += 8;
    doc.setFontSize(12);
    doc.text(`Patient: ${record.patient}`, 10, y); y += 8;
    doc.text(`Doctor: ${record.doctor}`, 10, y); y += 8;
    doc.text(`Date: ${record.date}`, 10, y); y += 8;
    doc.text(`Type: ${record.type}`, 10, y); y += 8;
    doc.text(`Status: ${record.status}`, 10, y); y += 8;
    doc.text('Title:', 10, y); doc.text(record.title, 40, y); y += 8;
    doc.text('Description:', 10, y); y += 8;
    doc.text(doc.splitTextToSize(record.description, 180), 10, y); y += 20;
    // Footer
    doc.setFontSize(10);
    doc.text('Generated by MediCore Pro', 10, 285);
    doc.save(`${record.patient}_${record.title}.pdf`);
  };

  // Template modal logic
  const openTemplateModal = (template: any) => {
    setSelectedTemplate(template);
    setTemplateForm({
      patient: '',
      doctor: '',
      date: new Date().toISOString().split('T')[0],
      title: template.name,
      type: template.type,
      status: 'pending',
      description: '',
    });
    setTemplateModalOpen(true);
  };
  const handleTemplateFormChange = (e: any) => {
    setTemplateForm({ ...templateForm, [e.target.name]: e.target.value });
  };
  const handleTemplateFormSubmit = async (e: any) => {
    e.preventDefault();
    // For demo, just add to records array (in real app, insert to Supabase)
    // You can replace this with a Supabase insert for the correct table
    // e.g., supabase.from('patient_diagnoses').insert(...)
    setTemplateModalOpen(false);
    // Optionally show a toast
    alert('Record created! (Demo only, not saved to DB)');
  };

  return (
    <div className="space-y-6 relative">
      <ThreeDAnimatedCard>
        <Card className="bg-gradient-to-r from-purple-600 to-blue-500 text-white shadow-2xl border border-white/20 hover:shadow-blue-200/40 transition-shadow duration-300 rounded-2xl overflow-hidden">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold">Medical Records Management</h2>
                <p className="text-green-100 mt-1">Comprehensive patient documentation system</p>
              </div>
              <div className="flex space-x-3">
                <Button variant="secondary" className="bg-white/20 hover:bg-white/30 text-white border-white/30">
                  <Upload className="h-4 w-4 mr-2" />
                  Upload Record
                </Button>
                <Button variant="secondary" className="bg-white/20 hover:bg-white/30 text-white border-white/30">
                  <FileText className="h-4 w-4 mr-2" />
                  New Record
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </ThreeDAnimatedCard>
      <Tabs defaultValue="records" className="w-full">
        <TabsList className="grid w-full grid-cols-3 bg-white shadow-sm border border-gray-200">
          <TabsTrigger value="records" className="data-[state=active]:bg-blue-600 data-[state=active]:text-white">
            All Records
          </TabsTrigger>
          <TabsTrigger value="templates" className="data-[state=active]:bg-blue-600 data-[state=active]:text-white">
            Templates
          </TabsTrigger>
          <TabsTrigger value="analytics" className="data-[state=active]:bg-blue-600 data-[state=active]:text-white">
            Analytics
          </TabsTrigger>
        </TabsList>
        <TabsContent value="records" className="mt-6">
          <ThreeDAnimatedCard>
            <Card className="bg-white/30 backdrop-blur-lg shadow-2xl border border-white/20 rounded-2xl overflow-hidden mb-6">
              <CardContent className="p-6">
                <div className="flex flex-col md:flex-row gap-4">
                  <div className="flex-1 relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                    <Input
                      placeholder="Search records by patient name or title..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                  <Select value={filterType} onValueChange={setFilterType}>
                    <SelectTrigger className="w-full md:w-48">
                      <SelectValue placeholder="Record Type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Types</SelectItem>
                      <SelectItem value="diagnosis">Diagnosis</SelectItem>
                      <SelectItem value="lab">Lab Results</SelectItem>
                      <SelectItem value="imaging">Imaging</SelectItem>
                      <SelectItem value="prescription">Prescription</SelectItem>
                      <SelectItem value="consultation">Consultation</SelectItem>
                    </SelectContent>
                  </Select>
                  <Select value={filterDate} onValueChange={setFilterDate}>
                    <SelectTrigger className="w-full md:w-48">
                      <SelectValue placeholder="Date Range" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Dates</SelectItem>
                      <SelectItem value="today">Today</SelectItem>
                      <SelectItem value="week">This Week</SelectItem>
                      <SelectItem value="month">This Month</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>
          </ThreeDAnimatedCard>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {filteredRecords.map((record) => (
              <ThreeDAnimatedCard key={record.id}>
                <Card className="bg-white/30 backdrop-blur-lg shadow-2xl border border-white/20 rounded-2xl overflow-hidden">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="text-lg text-gray-900 dark:text-white">{record.title}</CardTitle>
                        <CardDescription className="text-gray-600 dark:text-blue-200">{record.patient}</CardDescription>
                      </div>
                      <Badge className={getTypeColor(record.type)} variant="secondary">
                        {record.type}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-700 text-sm mb-4 dark:text-white">{record.description}</p>
                    <div className="flex items-center justify-between">
                      <div className="text-sm text-gray-600 dark:text-white">
                        <div className="flex items-center space-x-1 mb-1">
                          <Calendar className="h-3 w-3" />
                          <span>{record.date}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <User className="h-3 w-3" />
                          <span>{record.doctor}</span>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Badge variant={getStatusColor(record.status)} className="capitalize">
                          {record.status}
                        </Badge>
                        <Button size="sm" variant="outline" onClick={() => handleExportPDF(record)}>
                          <Download className="h-3 w-3 mr-1" />
                          Export
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </ThreeDAnimatedCard>
            ))}
          </div>
          {filteredRecords.length === 0 && (
            <ThreeDAnimatedCard>
              <Card className="bg-gray-50 border-dashed border-2 border-gray-300">
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <FileText className="h-12 w-12 text-gray-400 mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">No records found</h3>
                  <p className="text-gray-600 text-center">Try adjusting your search criteria or filters</p>
                </CardContent>
              </Card>
            </ThreeDAnimatedCard>
          )}
        </TabsContent>
        <TabsContent value="templates" className="mt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {templates.map((template, index) => (
              <ThreeDAnimatedCard key={index}>
                <Card className="bg-white/30 backdrop-blur-lg shadow-2xl border border-white/20 rounded-2xl overflow-hidden cursor-pointer">
                  <CardContent className="p-6 text-center">
                    <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <template.icon className="h-8 w-8 text-blue-600" />
                    </div>
                    <h3 className="font-semibold text-gray-900 mb-2">{template.name}</h3>
                    <p className="text-sm text-gray-600 dark:text-white mb-4">
                      {template.type === 'consultation' && 'Standard progress note template'}
                      {template.type === 'summary' && 'Patient discharge documentation'}
                      {template.type === 'diagnosis' && 'Diagnostic report format'}
                      {template.type === 'prescription' && 'Medication prescription form'}
                    </p>
                    <Button className="w-full bg-blue-600 hover:bg-blue-700" onClick={() => openTemplateModal(template)}>
                      Use Template
                    </Button>
                  </CardContent>
                </Card>
              </ThreeDAnimatedCard>
            ))}
          </div>
          {/* Template Modal */}
          <Dialog open={templateModalOpen} onOpenChange={setTemplateModalOpen}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create Record from Template</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleTemplateFormSubmit} className="space-y-4">
                <Input name="patient" placeholder="Patient Name" value={templateForm.patient} onChange={handleTemplateFormChange} required />
                <Input name="doctor" placeholder="Doctor Name" value={templateForm.doctor} onChange={handleTemplateFormChange} required />
                <Input name="date" type="date" value={templateForm.date} onChange={handleTemplateFormChange} required />
                <Input name="title" placeholder="Title" value={templateForm.title} onChange={handleTemplateFormChange} required />
                <Input name="type" placeholder="Type" value={templateForm.type} onChange={handleTemplateFormChange} required />
                <Input name="status" placeholder="Status" value={templateForm.status} onChange={handleTemplateFormChange} required />
                <textarea name="description" placeholder="Description" value={templateForm.description} onChange={handleTemplateFormChange} className="w-full rounded-md border p-2" required />
                <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white">Create Record</Button>
              </form>
            </DialogContent>
          </Dialog>
        </TabsContent>
        <TabsContent value="analytics" className="mt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <ThreeDAnimatedCard>
              <Card className="bg-white/30 backdrop-blur-lg shadow-2xl border border-white/20 rounded-2xl overflow-hidden">
                <CardContent className="p-6 text-center">
                  <h3 className="text-2xl font-bold text-blue-600 dark:text-white">
                    {analytics.loading ? '...' : analytics.total}
                  </h3>
                  <p className="text-gray-600 dark:text-white">Total Records</p>
                  <p className="text-sm text-green-600 dark:text-green-400 mt-1">{analytics.loading ? '' : '+15% this month'}</p>
                </CardContent>
              </Card>
            </ThreeDAnimatedCard>
            <ThreeDAnimatedCard>
              <Card className="bg-white/30 backdrop-blur-lg shadow-2xl border border-white/20 rounded-2xl overflow-hidden">
                <CardContent className="p-6 text-center">
                  <h3 className="text-2xl font-bold text-green-600 dark:text-white">
                    {analytics.loading ? '...' : analytics.completion + '%'}
                  </h3>
                  <p className="text-gray-600 dark:text-white">Completion Rate</p>
                  <p className="text-sm text-green-600 dark:text-green-400 mt-1">{analytics.loading ? '' : '+2% improvement'}</p>
                </CardContent>
              </Card>
            </ThreeDAnimatedCard>
            <ThreeDAnimatedCard>
              <Card className="bg-white/30 backdrop-blur-lg shadow-2xl border border-white/20 rounded-2xl overflow-hidden">
                <CardContent className="p-6 text-center">
                  <h3 className="text-2xl font-bold text-orange-600 dark:text-white">
                    {analytics.loading ? '...' : '3.2'}
                  </h3>
                  <p className="text-gray-600 dark:text-white">Avg. Days to Complete</p>
                  <p className="text-sm text-red-600 dark:text-red-400 mt-1">{analytics.loading ? '' : '+0.5 days'}</p>
                </CardContent>
              </Card>
            </ThreeDAnimatedCard>
            <ThreeDAnimatedCard>
              <Card className="bg-white/30 backdrop-blur-lg shadow-2xl border border-white/20 rounded-2xl overflow-hidden">
                <CardContent className="p-6 text-center">
                  <h3 className="text-2xl font-bold text-purple-600 dark:text-white">
                    {analytics.loading ? '...' : analytics.pending}
                  </h3>
                  <p className="text-gray-600 dark:text-white">Pending Reviews</p>
                  <p className="text-sm text-orange-600 dark:text-orange-400 mt-1">{analytics.loading ? '' : 'Needs attention'}</p>
                </CardContent>
              </Card>
            </ThreeDAnimatedCard>
          </div>
          {analytics.error && <div className="text-red-600 text-center mt-4">{analytics.error}</div>}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default MedicalRecords;
