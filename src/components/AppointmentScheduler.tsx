import { useState, useEffect } from "react";
import { Calendar, Clock, User, Phone, Mail, Plus, Filter } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import ThreeDAnimatedCard from '@/components/ui/3DAnimatedCard';

interface Appointment {
  id: string;
  patientId: string;
  patientName: string;
  appointmentType: string;
  date: string;
  time: string;
  duration: number;
  status: 'scheduled' | 'confirmed' | 'completed' | 'cancelled' | 'no-show';
  notes: string;
  doctor: string;
  department: string;
  isUrgent: boolean;
}

const AppointmentScheduler = () => {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [filterStatus, setFilterStatus] = useState('all');
  const [loading, setLoading] = useState(true);
  const [newAppointment, setNewAppointment] = useState({
    patientName: "",
    appointmentType: "",
    date: "",
    time: "",
    duration: "30",
    notes: "",
    isUrgent: false
  });
  const { toast } = useToast();

  useEffect(() => {
    const loadAppointments = async () => {
      setLoading(true);
      await new Promise(resolve => setTimeout(resolve, 600));
      
      const mockAppointments: Appointment[] = [
        {
          id: "1",
          patientId: "p1",
          patientName: "Sarah Johnson",
          appointmentType: "Follow-up",
          date: "2024-06-20",
          time: "09:00",
          duration: 30,
          status: "confirmed",
          notes: "Blood pressure check",
          doctor: "Dr. Smith",
          department: "Cardiology",
          isUrgent: false
        },
        {
          id: "2",
          patientId: "p2",
          patientName: "Michael Chen",
          appointmentType: "Consultation",
          date: "2024-06-20",
          time: "10:30",
          duration: 45,
          status: "scheduled",
          notes: "Diabetes management review",
          doctor: "Dr. Johnson",
          department: "Endocrinology",
          isUrgent: true
        },
        {
          id: "3",
          patientId: "p3",
          patientName: "Emily Rodriguez",
          appointmentType: "Check-up",
          date: "2024-06-20",
          time: "14:00",
          duration: 30,
          status: "completed",
          notes: "Annual physical exam",
          doctor: "Dr. Williams",
          department: "General Medicine",
          isUrgent: false
        }
      ];
      
      setAppointments(mockAppointments);
      setLoading(false);
    };

    loadAppointments();
  }, []);

  const handleCreateAppointment = () => {
    if (!newAppointment.patientName || !newAppointment.date || !newAppointment.time) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    const appointment: Appointment = {
      id: Date.now().toString(),
      patientId: `p${Date.now()}`,
      patientName: newAppointment.patientName,
      appointmentType: newAppointment.appointmentType || "Consultation",
      date: newAppointment.date,
      time: newAppointment.time,
      duration: parseInt(newAppointment.duration),
      status: "scheduled",
      notes: newAppointment.notes,
      doctor: "Dr. Current User",
      department: "General Medicine",
      isUrgent: newAppointment.isUrgent
    };

    setAppointments(prev => [...prev, appointment]);
    setNewAppointment({
      patientName: "",
      appointmentType: "",
      date: "",
      time: "",
      duration: "30",
      notes: "",
      isUrgent: false
    });

    toast({
      title: "Success",
      description: "Appointment scheduled successfully",
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed': return 'bg-green-100 text-green-800';
      case 'scheduled': return 'bg-blue-100 text-blue-800';
      case 'completed': return 'bg-gray-100 text-gray-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      case 'no-show': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const filteredAppointments = appointments.filter(appointment => {
    const matchesDate = appointment.date === selectedDate;
    const matchesStatus = filterStatus === 'all' || appointment.status === filterStatus;
    return matchesDate && matchesStatus;
  });

  const timeSlots = Array.from({ length: 18 }, (_, i) => {
    const hour = Math.floor(i / 2) + 8;
    const minute = (i % 2) * 30;
    return `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
  });

  const handleToggleCompleted = (id: string) => {
    setAppointments(prev => prev.map(app =>
      app.id === id
        ? { ...app, status: app.status === 'completed' ? 'scheduled' : 'completed' }
        : app
    ));
    toast({
      title: 'Status Updated',
      description: 'Appointment status has been updated.',
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6 relative">
      <ThreeDAnimatedCard>
        <Card className="bg-gradient-to-r from-purple-600 to-blue-500 text-white shadow-2xl border border-white/20 hover:shadow-blue-200/40 transition-shadow duration-300 rounded-2xl overflow-hidden">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold">Appointment Scheduler</h2>
                <p className="text-teal-100 mt-1">Intelligent scheduling system with conflict detection</p>
              </div>
              <div className="flex space-x-3">
                <Dialog>
                  <DialogTrigger asChild>
                    <Button variant="secondary" className="bg-white/20 hover:bg-white/30 text-white border-white/30">
                      <Plus className="h-4 w-4 mr-2" />
                      Schedule Appointment
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-2xl">
                    <DialogHeader>
                      <DialogTitle>Schedule New Appointment</DialogTitle>
                      <DialogDescription>Book a new patient appointment</DialogDescription>
                    </DialogHeader>
                    <div className="grid grid-cols-2 gap-4 py-4">
                      <div>
                        <Label htmlFor="patient-name">Patient Name</Label>
                        <Input
                          id="patient-name"
                          value={newAppointment.patientName}
                          onChange={(e) => setNewAppointment(prev => ({ ...prev, patientName: e.target.value }))}
                          placeholder="Enter patient name"
                        />
                      </div>
                      <div>
                        <Label htmlFor="appointment-type">Appointment Type</Label>
                        <Select 
                          value={newAppointment.appointmentType} 
                          onValueChange={(value) => setNewAppointment(prev => ({ ...prev, appointmentType: value }))}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select type" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="consultation">Consultation</SelectItem>
                            <SelectItem value="follow-up">Follow-up</SelectItem>
                            <SelectItem value="check-up">Check-up</SelectItem>
                            <SelectItem value="procedure">Procedure</SelectItem>
                            <SelectItem value="emergency">Emergency</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label htmlFor="date">Date</Label>
                        <Input
                          id="date"
                          type="date"
                          value={newAppointment.date}
                          onChange={(e) => setNewAppointment(prev => ({ ...prev, date: e.target.value }))}
                        />
                      </div>
                      <div>
                        <Label htmlFor="time">Time</Label>
                        <Select 
                          value={newAppointment.time} 
                          onValueChange={(value) => setNewAppointment(prev => ({ ...prev, time: value }))}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select time" />
                          </SelectTrigger>
                          <SelectContent>
                            {timeSlots.map(slot => (
                              <SelectItem key={slot} value={slot}>{slot}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label htmlFor="duration">Duration (minutes)</Label>
                        <Select 
                          value={newAppointment.duration} 
                          onValueChange={(value) => setNewAppointment(prev => ({ ...prev, duration: value }))}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="15">15 minutes</SelectItem>
                            <SelectItem value="30">30 minutes</SelectItem>
                            <SelectItem value="45">45 minutes</SelectItem>
                            <SelectItem value="60">60 minutes</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="col-span-2">
                        <Label htmlFor="notes">Notes</Label>
                        <Input
                          id="notes"
                          value={newAppointment.notes}
                          onChange={(e) => setNewAppointment(prev => ({ ...prev, notes: e.target.value }))}
                          placeholder="Additional notes"
                        />
                      </div>
                    </div>
                    <Button onClick={handleCreateAppointment} className="w-full">
                      Schedule Appointment
                    </Button>
                  </DialogContent>
                </Dialog>
              </div>
            </div>
          </CardContent>
        </Card>
      </ThreeDAnimatedCard>

      <div className="flex flex-col md:flex-row gap-4">
        <div className="flex-1">
          <Label htmlFor="date-filter">Select Date</Label>
          <Input
            id="date-filter"
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="mt-1"
          />
        </div>
        <div className="flex-1">
          <Label htmlFor="status-filter">Filter by Status</Label>
          <Select value={filterStatus} onValueChange={setFilterStatus}>
            <SelectTrigger className="mt-1">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value="scheduled">Scheduled</SelectItem>
              <SelectItem value="confirmed">Confirmed</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
              <SelectItem value="cancelled">Cancelled</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {filteredAppointments.map((appointment) => (
          <ThreeDAnimatedCard key={appointment.id}>
            <Card className="bg-white/30 backdrop-blur-lg shadow-2xl border border-white/20 rounded-2xl overflow-hidden">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-lg flex items-center">
                      <User className="h-5 w-5 mr-2 text-blue-600" />
                      {appointment.patientName}
                    </CardTitle>
                    <CardDescription className="mt-1">
                      {appointment.appointmentType} • {appointment.department}
                    </CardDescription>
                  </div>
                  <div className="flex flex-col items-end space-y-1">
                    <Badge className={getStatusColor(appointment.status)} variant="secondary">
                      {appointment.status}
                    </Badge>
                    {appointment.isUrgent && (
                      <Badge variant="destructive" className="text-xs">
                        URGENT
                      </Badge>
                    )}
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="flex items-center">
                    <Calendar className="h-4 w-4 mr-2 text-gray-500" />
                    <span>{appointment.date}</span>
                  </div>
                  <div className="flex items-center">
                    <Clock className="h-4 w-4 mr-2 text-gray-500" />
                    <span>{appointment.time} ({appointment.duration}min)</span>
                  </div>
                </div>

                <div className="text-sm">
                  <span className="font-medium text-gray-700">Doctor: </span>
                  <span className="text-gray-900">{appointment.doctor}</span>
                </div>

                {appointment.notes && (
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <p className="text-sm text-gray-700">{appointment.notes}</p>
                  </div>
                )}

                <div className="flex space-x-2 pt-3 border-t border-gray-100">
                  <Button size="sm" variant="outline" className="flex-1">
                    <Phone className="h-3 w-3 mr-1" />
                    Call
                  </Button>
                  <Button size="sm" variant="outline" className="flex-1">
                    <Mail className="h-3 w-3 mr-1" />
                    Email
                  </Button>
                  {appointment.status !== 'completed' ? (
                    <Button size="sm" variant="secondary" className="flex-1" onClick={() => handleToggleCompleted(appointment.id)}>
                      Mark as Completed
                    </Button>
                  ) : (
                    <Button size="sm" variant="destructive" className="flex-1" onClick={() => handleToggleCompleted(appointment.id)}>
                      Mark as Not Completed
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          </ThreeDAnimatedCard>
        ))}
      </div>

      {filteredAppointments.length === 0 && (
        <ThreeDAnimatedCard>
          <Card className="bg-gray-50 border-dashed border-2 border-gray-300">
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Calendar className="h-12 w-12 text-gray-400 mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No appointments found</h3>
              <p className="text-gray-600 text-center">No appointments scheduled for {selectedDate}</p>
            </CardContent>
          </Card>
        </ThreeDAnimatedCard>
      )}
    </div>
  );
};

export default AppointmentScheduler;
