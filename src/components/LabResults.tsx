import { useState, useEffect } from "react";
import { TestTube, TrendingUp, TrendingDown, AlertTriangle, Download, Calendar, Activity } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { toast } from "sonner";
import ThreeDAnimatedCard from '@/components/ui/3DAnimatedCard';
import { motion, useSpring, useInView, useTransform } from 'framer-motion';
import { useRef } from 'react';

interface LabResult {
  id: string;
  test: string;
  value: number;
  unit: string;
  normalRange: { min: number; max: number };
  status: 'normal' | 'high' | 'low' | 'critical';
  trend: 'up' | 'down' | 'stable';
  lastUpdated: string;
  category: string;
}

const AnimatedCounter = ({ value }: { value: number }) => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true });
  const spring = useSpring(0, { stiffness: 100, damping: 30 });
  const displayValue = useTransform(spring, (latest) => Math.round(latest).toLocaleString());
  useEffect(() => { if (isInView) { spring.set(value); } }, [isInView, value, spring]);
  return <motion.span ref={ref}>{displayValue}</motion.span>;
};

const LabResults = () => {
  const [results, setResults] = useState<LabResult[]>([]);
  const [loading, setLoading] = useState(true);
  const [retestOpen, setRetestOpen] = useState(false);
  const [retestType, setRetestType] = useState("");
  const [retestDate, setRetestDate] = useState("");

  // Simulate backend data fetching
  useEffect(() => {
    const fetchLabResults = async () => {
      setLoading(true);
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const mockResults: LabResult[] = [
        {
          id: "1",
          test: "Hemoglobin",
          value: 13.5,
          unit: "g/dL",
          normalRange: { min: 12.0, max: 15.5 },
          status: "normal",
          trend: "stable",
          lastUpdated: "2024-06-20T08:30:00Z",
          category: "Blood Count"
        },
        {
          id: "2",
          test: "Glucose",
          value: 145,
          unit: "mg/dL",
          normalRange: { min: 70, max: 100 },
          status: "high",
          trend: "up",
          lastUpdated: "2024-06-20T08:30:00Z",
          category: "Metabolic"
        },
        {
          id: "3",
          test: "Total Cholesterol",
          value: 220,
          unit: "mg/dL",
          normalRange: { min: 0, max: 200 },
          status: "high",
          trend: "up",
          lastUpdated: "2024-06-20T08:30:00Z",
          category: "Lipid Panel"
        },
        {
          id: "4",
          test: "Creatinine",
          value: 0.9,
          unit: "mg/dL",
          normalRange: { min: 0.6, max: 1.2 },
          status: "normal",
          trend: "stable",
          lastUpdated: "2024-06-20T08:30:00Z",
          category: "Kidney Function"
        }
      ];
      
      setResults(mockResults);
      setLoading(false);
    };

    fetchLabResults();
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'critical': return 'bg-red-500 text-white';
      case 'high': return 'bg-orange-500 text-white';
      case 'low': return 'bg-yellow-500 text-white';
      case 'normal': return 'bg-green-500 text-white';
      default: return 'bg-gray-500 text-white';
    }
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up': return <TrendingUp className="h-4 w-4 text-red-500" />;
      case 'down': return <TrendingDown className="h-4 w-4 text-green-500" />;
      case 'stable': return <Activity className="h-4 w-4 text-blue-500" />;
      default: return null;
    }
  };

  const getProgressValue = (result: LabResult) => {
    const { value, normalRange } = result;
    const range = normalRange.max - normalRange.min;
    const position = (value - normalRange.min) / range;
    return Math.max(0, Math.min(100, position * 100));
  };

  const criticalResults = results.filter(r => r.status === 'critical' || r.status === 'high');
  const categorizedResults = results.reduce((acc, result) => {
    if (!acc[result.category]) acc[result.category] = [];
    acc[result.category].push(result);
    return acc;
  }, {} as Record<string, LabResult[]>);

  const handleScheduleRetest = () => {
    if (!retestType || !retestDate) {
      toast.error("Please select test type and date");
      return;
    }
    setRetestOpen(false);
    setRetestType("");
    setRetestDate("");
    toast.success("Retest scheduled successfully!");
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
                <h2 className="text-2xl font-bold">Laboratory Results</h2>
                <p className="text-purple-100 mt-1">Real-time lab data analysis and monitoring</p>
              </div>
              <div className="flex space-x-3">
                <Button variant="secondary" className="bg-white/20 hover:bg-white/30 text-white border-white/30">
                  <Download className="h-4 w-4 mr-2" />
                  Export PDF
                </Button>
                <Button variant="secondary" className="bg-white/20 hover:bg-white/30 text-white border-white/30" onClick={() => setRetestOpen(true)}>
                  <Calendar className="h-4 w-4 mr-2" />
                  Schedule Retest
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </ThreeDAnimatedCard>

      {criticalResults.length > 0 && (
        <ThreeDAnimatedCard>
          <Card className="border-red-200 bg-red-50">
            <CardHeader>
              <CardTitle className="flex items-center text-red-800">
                <AlertTriangle className="h-5 w-5 mr-2" />
                Critical Values Requiring Attention
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {criticalResults.map(result => (
                  <div key={result.id} className="p-3 bg-white rounded-lg border border-red-200">
                    <div className="flex items-center justify-between">
                      <h4 className="font-medium text-red-900">{result.test}</h4>
                      <Badge className={getStatusColor(result.status)}>
                        {result.status.toUpperCase()}
                      </Badge>
                    </div>
                    <p className="text-2xl font-bold text-red-800 mt-1">
                      {result.value} {result.unit}
                    </p>
                    <p className="text-sm text-red-600">
                      Normal: {result.normalRange.min}-{result.normalRange.max} {result.unit}
                    </p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </ThreeDAnimatedCard>
      )}

      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid w-full grid-cols-3 bg-white shadow-sm border border-gray-200">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="categories">By Category</TabsTrigger>
          <TabsTrigger value="trends">Trends</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="mt-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {results.map(result => (
              <ThreeDAnimatedCard key={result.id}>
                <Card className="bg-white/30 backdrop-blur-lg shadow-2xl border border-white/20 rounded-2xl overflow-hidden">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg">{result.test}</CardTitle>
                      <div className="flex items-center space-x-2">
                        {getTrendIcon(result.trend)}
                        <Badge className={getStatusColor(result.status)}>
                          {result.status}
                        </Badge>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex items-baseline space-x-2">
                        <span className="text-3xl font-bold text-gray-900 dark:text-white">
                          <AnimatedCounter value={result.value} />
                        </span>
                        <span className="text-gray-600 dark:text-white">{result.unit}</span>
                      </div>
                      
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm text-gray-600 dark:text-white">
                          <span>Normal Range</span>
                          <span>{result.normalRange.min} - {result.normalRange.max} {result.unit}</span>
                        </div>
                        <Progress 
                          value={getProgressValue(result)} 
                          className="h-2"
                        />
                      </div>
                      
                      <div className="text-xs text-gray-500 dark:text-white">
                        Last updated: {new Date(result.lastUpdated).toLocaleString()}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </ThreeDAnimatedCard>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="categories" className="mt-6">
          <div className="space-y-6">
            {Object.entries(categorizedResults).map(([category, categoryResults]) => (
              <ThreeDAnimatedCard key={category}>
                <Card className="bg-white/30 backdrop-blur-lg shadow-2xl border border-white/20 rounded-2xl overflow-hidden">
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <TestTube className="h-5 w-5 mr-2 text-blue-600" />
                      {category}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {categoryResults.map(result => (
                        <div key={result.id} className="p-3 border rounded-lg">
                          <div className="flex items-center justify-between mb-2">
                            <h4 className="font-medium dark:text-white">{result.test}</h4>
                            <Badge className={getStatusColor(result.status)} variant="secondary">
                              {result.status}
                            </Badge>
                          </div>
                          <p className="text-xl font-bold dark:text-white">
                            {result.value} {result.unit}
                          </p>
                          <p className="text-sm text-gray-600 dark:text-white">
                            Normal: {result.normalRange.min}-{result.normalRange.max}
                          </p>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </ThreeDAnimatedCard>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="trends" className="mt-6">
          <ThreeDAnimatedCard>
            <Card className="bg-white/30 backdrop-blur-lg shadow-2xl border border-white/20 rounded-2xl overflow-hidden">
              <CardHeader>
                <CardTitle>Historical Trends</CardTitle>
                <CardDescription>Lab value changes over time</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-12 text-gray-500 dark:text-white">
                  <Activity className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>Trend analysis charts would be displayed here</p>
                  <p className="text-sm mt-2">Connect to backend for historical data visualization</p>
                </div>
              </CardContent>
            </Card>
          </ThreeDAnimatedCard>
        </TabsContent>
      </Tabs>

      <Dialog open={retestOpen} onOpenChange={setRetestOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Schedule Lab Retest</DialogTitle>
            <DialogDescription>Select test type and date for the retest.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <Select value={retestType} onValueChange={setRetestType}>
              <SelectTrigger>
                <SelectValue placeholder="Select test type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Hemoglobin">Hemoglobin</SelectItem>
                <SelectItem value="Glucose">Glucose</SelectItem>
                <SelectItem value="Cholesterol">Cholesterol</SelectItem>
                <SelectItem value="Creatinine">Creatinine</SelectItem>
              </SelectContent>
            </Select>
            <Input type="date" value={retestDate} onChange={e => setRetestDate(e.target.value)} />
          </div>
          <DialogFooter>
            <Button onClick={handleScheduleRetest}>Schedule</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default LabResults;
