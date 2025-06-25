import { TrendingUp, Users, Activity, AlertTriangle, Calendar, FileText, Target, Clock, Sparkles } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import AddPatientModal from "./AddPatientModal";
import { motion, easeOut, useInView, useAnimation, useSpring, useTransform } from "framer-motion";
import { useState, useEffect, useRef } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import jsPDF from "jspdf";
import { DateRangePicker } from "@/components/ui/date-range-picker";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import ThreeDAnimatedCard from "@/components/ui/3DAnimatedCard";
import FloatingParticles from "@/components/FloatingParticles";

// Add Razorpay type declaration
// eslint-disable-next-line @typescript-eslint/no-explicit-any
declare global {
  interface Window {
    Razorpay?: any;
  }
}

const AnimatedCounter = ({ value }: { value: number }) => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true });
  const spring = useSpring(0, { stiffness: 100, damping: 30 });
  const displayValue = useTransform(spring, (latest) => Math.round(latest).toLocaleString());

  useEffect(() => {
    if (isInView) {
      spring.set(value);
    }
  }, [isInView, value, spring]);

  return <motion.span ref={ref}>{displayValue}</motion.span>;
};

const AnalyticsDashboard = () => {
  console.log("AnalyticsDashboard component is rendering...");
  
  const [addPatientOpen, setAddPatientOpen] = useState(false);
  const [stats, setStats] = useState({
    totalPatients: 0,
    todaysAppointments: 0,
    recordsProcessed: 0,
    efficiencyRate: 0,
    loading: true,
  });
  const [dateRange, setDateRange] = useState({ from: '', to: '' });
  const [selectedDoctor, setSelectedDoctor] = useState('all');
  const [selectedDepartment, setSelectedDepartment] = useState('all');
  const [payments, setPayments] = useState<any[]>([]);
  const [loadingPayments, setLoadingPayments] = useState(true);
  const [paymentAmount, setPaymentAmount] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("card");
  const [paymentOpen, setPaymentOpen] = useState(false);
  const [razorpayOpen, setRazorpayOpen] = useState(false);
  const [razorpayAmount, setRazorpayAmount] = useState('');

  const performanceMetrics = [
    { title: "Patient Satisfaction", value: "94.2%", change: "+2.3%", trend: "up", target: "95%" },
    { title: "Diagnosis Accuracy", value: "96.8%", change: "+1.1%", trend: "up", target: "98%" },
    { title: "Average Wait Time", value: "12.3 min", change: "-3.2 min", trend: "down", target: "10 min" },
    { title: "Treatment Success Rate", value: "89.1%", change: "+4.2%", trend: "up", target: "90%" }
  ];

  const getTrendIcon = (trend: string) => {
    return trend === "up" ? "↗️" : "↘️";
  };

  const getTrendColor = (trend: string) => {
    return trend === "up" ? "text-green-600" : "text-red-600";
  };

  const handleExportReport = () => {
    const doc = new jsPDF();
    doc.setFontSize(18);
    doc.text("Analytics & Revenue Report", 10, 15);
    doc.setFontSize(12);
    let y = 30;
    doc.text(`Total Patients: ${stats.totalPatients}`, 10, y);
    y += 10;
    doc.text(`Today's Appointments: ${stats.todaysAppointments}`, 10, y);
    y += 10;
    doc.text(`Records Processed: ${stats.recordsProcessed}`, 10, y);
    y += 10;
    doc.text(`Efficiency Rate: ${stats.efficiencyRate}%`, 10, y);
    y += 20;
    doc.setFontSize(16);
    doc.text("Revenue Overview", 10, y);
    y += 10;
    doc.setFontSize(12);
    doc.text(`Total Revenue: $12,450`, 10, y);
    y += 10;
    doc.text(`Payments This Month: $3,200`, 10, y);
    y += 10;
    doc.text("Recent Payments:", 10, y);
    y += 8;
    doc.text("06/20/2024 - $250 - Visa", 15, y);
    y += 8;
    doc.text("06/18/2024 - $500 - Stripe", 15, y);
    y += 8;
    doc.text("06/15/2024 - $120 - Cash", 15, y);
    doc.save("analytics_revenue_report.pdf");
    toast.success("Report exported as PDF");
  };

  const handleExportCSV = () => {
    const rows = [
      ["Metric", "Value"],
      ["Total Patients", stats.totalPatients],
      ["Today's Appointments", stats.todaysAppointments],
      ["Records Processed", stats.recordsProcessed],
      ["Efficiency Rate", `${stats.efficiencyRate}%`],
      ["Total Revenue", "$12,450"],
      ["Payments This Month", "$3,200"],
      ["Recent Payment 1", "06/20/2024 - $250 - Visa"],
      ["Recent Payment 2", "06/18/2024 - $500 - Stripe"],
      ["Recent Payment 3", "06/15/2024 - $120 - Cash"],
    ];
    const csvContent = rows.map(e => e.join(",")).join("\n");
    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "analytics_revenue_report.csv";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success("Report exported as CSV");
  };

  const handleAddPatientSuccess = () => {
    toast.success("Patient added successfully! Dashboard will refresh.");
  };

  const handleStripePayment = async () => {
    const amount = parseFloat(paymentAmount);
    if (!amount || amount <= 0) {
      toast.error("Please enter a valid payment amount.");
      return;
    }

    toast.info(`Initiating ${paymentMethod.toUpperCase()} payment...`);

    // TODO: Replace with your real backend call.
    // This call should send the amount and paymentMethod to your server,
    // which then creates a Stripe Checkout session.
    /*
    const res = await fetch('https://your-backend.com/create-checkout-session', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        amount,
        paymentMethod,
      }),
    });
    const { url, error } = await res.json();
    if (url) {
      window.location.href = url;
    } else {
      toast.error(error || "Failed to create payment session.");
    }
    */

    // Mock redirection for now
    toast.success(`Redirecting to Stripe for ${paymentMethod.toUpperCase()} payment (test mode).`);
    setPaymentOpen(false);
    setPaymentAmount("");
  };

  useEffect(() => {
    const fetchStats = async () => {
      setStats(s => ({ ...s, loading: true }));
      // Total patients
      const { count: patientCount } = await supabase
        .from("patients")
        .select("id", { count: "exact", head: true });
      // Today's appointments
      const today = new Date().toISOString().split("T")[0];
      const { count: apptCount } = await supabase
        .from("appointments")
        .select("id", { count: "exact", head: true })
        .eq("appointment_date", today);
      // Records processed (lab_results + prescriptions)
      const { count: labCount } = await supabase
        .from("lab_results")
        .select("id", { count: "exact", head: true });
      const { count: rxCount } = await supabase
        .from("prescriptions")
        .select("id", { count: "exact", head: true });
      // Efficiency rate (mocked for now)
      const efficiency = 94.2;
      setStats({
        totalPatients: patientCount || 0,
        todaysAppointments: apptCount || 0,
        recordsProcessed: (labCount || 0) + (rxCount || 0),
        efficiencyRate: efficiency,
        loading: false,
      });
    };
    const fetchPayments = async () => {
      setLoadingPayments(true);
      // NOTE: This assumes a 'payments' table in your Supabase schema.
      // Replace with your actual table and filter logic.
      // const { data, error } = await supabase.from('payments').select('*');
      // For now, using mock data:
      const mockPayments = [
        { id: '1', created_at: '2024-06-20T10:00:00Z', amount: 250, payment_method: 'Visa', status: 'succeeded' },
        { id: '2', created_at: '2024-06-18T11:00:00Z', amount: 500, payment_method: 'Stripe', status: 'succeeded' },
        { id: '3', created_at: '2024-06-15T12:00:00Z', amount: 120, payment_method: 'Cash', status: 'succeeded' },
      ];
      setPayments(mockPayments);
      setLoadingPayments(false);
    };
    fetchStats();
    fetchPayments();
  }, [dateRange, selectedDoctor, selectedDepartment]);

  const handleRefund = async (paymentId: string) => {
    toast.info(`Refunding payment ${paymentId}...`);
    // Replace with your backend endpoint for Stripe refunds
    // await fetch('/api/refund', { method: 'POST', body: JSON.stringify({ paymentId }) });
    toast.success(`Refund for ${paymentId} processed successfully!`);
  };

  const revenueData = [
    { name: 'Jan', revenue: 4000 },
    { name: 'Feb', revenue: 3000 },
    { name: 'Mar', revenue: 5000 },
    { name: 'Apr', revenue: 4500 },
    { name: 'May', revenue: 6000 },
    { name: 'Jun', revenue: 5500 },
  ];

  return (
    <div className="space-y-6 relative min-h-screen">
      {/* Hero Section */}
      <div className="relative z-10 flex flex-col items-center justify-center py-12 mb-8">
        <motion.h1
          initial={{ opacity: 0, y: -40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
          className="text-4xl md:text-5xl font-extrabold text-white drop-shadow-lg mb-4"
        >
          Welcome to <span className="text-blue-300 animate-pulse">Advanced Diagnostics Portal</span>
        </motion.h1>
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.8, ease: 'easeOut' }}
          className="text-lg md:text-2xl text-blue-100 mb-6"
        >
          <Sparkles className="inline-block mr-2 animate-bounce text-yellow-300" />
          Empowering healthcare with data, intelligence, and beauty.
        </motion.p>
        <motion.button
          whileHover={{ scale: 1.08, boxShadow: '0 0 16px #60a5fa' }}
          whileTap={{ scale: 0.96 }}
          className="px-8 py-3 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 text-white font-semibold shadow-lg backdrop-blur-lg bg-opacity-70 border border-white/20 hover:from-blue-600 hover:to-purple-700 transition-all duration-300"
          onClick={() => window.scrollTo({ top: 600, behavior: 'smooth' })}
        >
          Explore Dashboard
        </motion.button>
      </div>

      {/* Header */}
      <Card className="bg-gradient-to-r from-purple-600 to-blue-600 text-white shadow-lg">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold">Analytics Dashboard</h2>
              <p className="text-purple-100 mt-1">Performance insights and operational metrics</p>
            </div>
            <div className="flex space-x-3">
              <Button 
                variant="secondary" 
                className="bg-white/20 hover:bg-white/30 text-white border-white/30"
                onClick={handleExportReport}
              >
                <FileText className="h-4 w-4 mr-2" />
                Export Report
              </Button>
              <Button 
                variant="secondary" 
                className="bg-white/20 hover:bg-white/30 text-white border-white/30"
                onClick={handleExportCSV}
              >
                <FileText className="h-4 w-4 mr-2" />
                Export CSV
              </Button>
              <Button 
                variant="secondary" 
                className="bg-green-500 hover:bg-green-600 text-white border-white/30" 
                onClick={() => setAddPatientOpen(true)}
              >
                Add Patient
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Filter Controls */}
      <div className="flex flex-wrap gap-4 mb-6 items-end">
        <div>
          <label className="block text-sm font-medium mb-1 dark:text-white">Date Range</label>
          <DateRangePicker value={dateRange} onChange={setDateRange} />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1 dark:text-white">Doctor</label>
          <Select value={selectedDoctor} onValueChange={setSelectedDoctor}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="All Doctors" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Doctors</SelectItem>
              <SelectItem value="dr-smith">Dr. Smith</SelectItem>
              <SelectItem value="dr-johnson">Dr. Johnson</SelectItem>
              <SelectItem value="dr-williams">Dr. Williams</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <label className="block text-sm font-medium mb-1 dark:text-white">Department</label>
          <Select value={selectedDepartment} onValueChange={setSelectedDepartment}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="All Departments" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Departments</SelectItem>
              <SelectItem value="cardiology">Cardiology</SelectItem>
              <SelectItem value="endocrinology">Endocrinology</SelectItem>
              <SelectItem value="general">General Medicine</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {stats.loading ? (
        <div className="text-center py-12 text-lg">Loading analytics...</div>
      ) : (
        <>
          {/* Performance Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {performanceMetrics.map((metric, index) => (
              <ThreeDAnimatedCard key={index}>
                <Card className="bg-white/30 backdrop-blur-lg shadow-2xl border border-white/20 hover:shadow-blue-200/40 transition-shadow duration-300 rounded-2xl overflow-hidden">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <p className="text-sm font-medium text-gray-600 dark:text-white">{metric.title}</p>
                        <p className="text-2xl font-bold text-gray-900 dark:text-white">{metric.value}</p>
                      </div>
                      <div className="p-2 bg-blue-100 rounded-lg">
                        <Target className="h-5 w-5 text-blue-600" />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span className={getTrendColor(metric.trend)}>
                          {getTrendIcon(metric.trend)} {metric.change}
                        </span>
                        <span className="text-gray-500 dark:text-white">Target: {metric.target}</span>
                      </div>
                      <Progress 
                        value={parseFloat(metric.value)} 
                        className="h-2" 
                      />
                    </div>
                  </CardContent>
                </Card>
              </ThreeDAnimatedCard>
            ))}
          </div>

          {/* Quick Stats Summary */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <ThreeDAnimatedCard>
              <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white shadow-md">
                <CardContent className="p-4 text-center">
                  <Users className="h-8 w-8 mx-auto mb-2" />
                  <p className="text-2xl font-bold"><AnimatedCounter value={stats.totalPatients} /></p>
                  <p className="text-blue-100 text-sm">Total Patients</p>
                </CardContent>
              </Card>
            </ThreeDAnimatedCard>
            <ThreeDAnimatedCard>
              <Card className="bg-gradient-to-br from-green-500 to-green-600 text-white shadow-md">
                <CardContent className="p-4 text-center">
                  <Calendar className="h-8 w-8 mx-auto mb-2" />
                  <p className="text-2xl font-bold"><AnimatedCounter value={stats.todaysAppointments} /></p>
                  <p className="text-green-100 text-sm">Today's Appointments</p>
                </CardContent>
              </Card>
            </ThreeDAnimatedCard>
            <ThreeDAnimatedCard>
              <Card className="bg-gradient-to-br from-purple-500 to-purple-600 text-white shadow-md">
                <CardContent className="p-4 text-center">
                  <FileText className="h-8 w-8 mx-auto mb-2" />
                  <p className="text-2xl font-bold"><AnimatedCounter value={stats.recordsProcessed} /></p>
                  <p className="text-purple-100 text-sm">Records Processed</p>
                </CardContent>
              </Card>
            </ThreeDAnimatedCard>
            <ThreeDAnimatedCard>
              <Card className="bg-gradient-to-br from-orange-500 to-orange-600 text-white shadow-md">
                <CardContent className="p-4 text-center">
                  <TrendingUp className="h-8 w-8 mx-auto mb-2" />
                  <p className="text-2xl font-bold"><AnimatedCounter value={stats.efficiencyRate} />%</p>
                  <p className="text-orange-100 text-sm">Efficiency Rate</p>
                </CardContent>
              </Card>
            </ThreeDAnimatedCard>
          </div>

          {/* Revenue Section */}
          <div className="mt-8">
            <h3 className="text-lg font-semibold mb-2">Payment History</h3>
            <div style={{ position: 'relative', zIndex: 50 }}>
              <Button 
                variant="secondary" 
                className="mb-4 bg-green-500 hover:bg-green-600 text-white border-white/30" 
                onClick={() => setRazorpayOpen(true)}
              >
                Pay with Razorpay
              </Button>
              <Dialog open={razorpayOpen} onOpenChange={setRazorpayOpen}>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Pay with Razorpay</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <label className="block text-sm font-medium">Amount (INR)</label>
                    <Input
                      type="number"
                      min="1"
                      placeholder="Enter amount"
                      value={razorpayAmount}
                      onChange={e => setRazorpayAmount(e.target.value)}
                    />
                  </div>
                  <DialogFooter>
                    <Button
                      onClick={async () => {
                        const amountNum = parseFloat(razorpayAmount);
                        if (!amountNum || amountNum <= 0) {
                          toast.error('Please enter a valid amount.');
                          return;
                        }
                        // Load Razorpay script if not already loaded
                        if (!window.Razorpay) {
                          toast.loading('Loading payment gateway...');
                          const script = document.createElement('script');
                          script.src = 'https://checkout.razorpay.com/v1/checkout.js';
                          script.async = true;
                          document.body.appendChild(script);
                          try {
                            await new Promise((resolve, reject) => {
                              script.onload = resolve;
                              script.onerror = reject;
                            });
                          } catch {
                            toast.dismiss();
                            toast.error('Failed to load Razorpay. Please try again.');
                            return;
                          }
                          toast.dismiss();
                        }
                        if (!window.Razorpay) {
                          toast.error('Razorpay is not available.');
                          return;
                        }
                        setRazorpayOpen(false);
                        setRazorpayAmount('');
                        const options = {
                          key: 'rzp_test_YourTestKeyHere', // Replace with your Razorpay Test Key
                          amount: Math.round(amountNum * 100), // Amount in paise
                          currency: 'INR',
                          name: 'MediCore Pro',
                          description: 'Analytics Payment',
                          image: '/favicon.ico',
                          handler: function (response: any) {
                            toast.success('Payment successful! Payment ID: ' + response.razorpay_payment_id);
                          },
                          prefill: {
                            name: 'Test User',
                            email: 'test@example.com',
                            contact: '9999999999',
                          },
                          theme: {
                            color: '#6366f1',
                          },
                          modal: {
                            ondismiss: function () {
                              toast.info('Payment popup closed.');
                            }
                          },
                        };
                        const rzp = new window.Razorpay(options);
                        rzp.on('payment.failed', function (response: any) {
                          toast.error('Payment failed: ' + response.error.description);
                          console.error('Razorpay payment failed:', response);
                        });
                        rzp.open();
                      }}
                    >
                      Pay Now
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full bg-white text-gray-900 rounded shadow">
                <thead>
                  <tr>
                    <th className="px-4 py-2">Date</th>
                    <th className="px-4 py-2">Amount</th>
                    <th className="px-4 py-2">Method</th>
                    <th className="px-4 py-2">Status</th>
                    <th className="px-4 py-2">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {loadingPayments ? (
                    <tr><td colSpan={5} className="text-center py-4">Loading payments...</td></tr>
                  ) : (
                    payments.map(p => (
                      <tr key={p.id}>
                        <td className="px-4 py-2">{new Date(p.created_at).toLocaleDateString()}</td>
                        <td className="px-4 py-2">${p.amount}</td>
                        <td className="px-4 py-2">{p.payment_method}</td>
                        <td className="px-4 py-2"><span className="text-green-600 font-semibold capitalize">{p.status}</span></td>
                        <td className="px-4 py-2">
                          {p.status === 'succeeded' ? (
                            <button className="text-blue-600 hover:underline" onClick={() => handleRefund(p.id)}>Refund</button>
                          ) : (
                            <button className="text-gray-400 cursor-not-allowed" disabled>Refund</button>
                          )}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
            {/* Revenue Trend Chart */}
            <div className="mt-8 bg-white rounded shadow p-6">
              <h3 className="text-lg font-semibold mb-4">Revenue Trend</h3>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={revenueData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="revenue" stroke="#8884d8" activeDot={{ r: 8 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </>
      )}

      {/* Modals */}
      <AddPatientModal 
        open={addPatientOpen} 
        onClose={() => setAddPatientOpen(false)} 
        onSuccess={handleAddPatientSuccess}
      />

      <Dialog open={paymentOpen} onOpenChange={setPaymentOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Make a Payment</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <Input
              type="number"
              placeholder="Enter amount"
              value={paymentAmount}
              onChange={(e) => setPaymentAmount(e.target.value)}
            />
            <RadioGroup value={paymentMethod} onValueChange={setPaymentMethod} defaultValue="card">
              <Label className="font-semibold">Select Payment Method</Label>
              <div className="flex items-center space-x-2 pt-2">
                <RadioGroupItem value="card" id="card" />
                <Label htmlFor="card">Card (Credit/Debit)</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="netbanking" id="netbanking" />
                <Label htmlFor="netbanking">Netbanking</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="upi" id="upi" />
                <Label htmlFor="upi">UPI</Label>
              </div>
            </RadioGroup>
            <p className="text-xs text-gray-500">
              Note: Netbanking and UPI payments are typically processed in INR.
            </p>
          </div>
          <DialogFooter>
            <Button onClick={handleStripePayment} className="w-full bg-blue-600 hover:bg-blue-700 text-white">
              Proceed to Pay
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AnalyticsDashboard;
