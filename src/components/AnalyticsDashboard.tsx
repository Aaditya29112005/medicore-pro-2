import { TrendingUp, Users, Activity, AlertTriangle, Calendar, FileText, Target, Clock } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import AddPatientModal from "./AddPatientModal";
import { useState } from "react";

const AnalyticsDashboard = () => {
  const performanceMetrics = [
    { title: "Patient Satisfaction", value: "94.2%", change: "+2.3%", trend: "up", target: "95%" },
    { title: "Diagnosis Accuracy", value: "96.8%", change: "+1.1%", trend: "up", target: "98%" },
    { title: "Average Wait Time", value: "12.3 min", change: "-3.2 min", trend: "down", target: "10 min" },
    { title: "Treatment Success Rate", value: "89.1%", change: "+4.2%", trend: "up", target: "90%" }
  ];

  const departmentStats = [
    { department: "Cardiology", patients: 156, utilization: 87, revenue: "$45,230" },
    { department: "Neurology", patients: 89, utilization: 72, revenue: "$32,180" },
    { department: "Orthopedics", patients: 134, utilization: 91, revenue: "$38,940" },
    { department: "Internal Medicine", patients: 203, utilization: 95, revenue: "$52,670" }
  ];

  const recentInsights = [
    {
      title: "Peak Hours Analysis",
      description: "Patient volume highest between 10 AM - 2 PM",
      type: "scheduling",
      impact: "high",
      recommendation: "Consider adding staff during peak hours"
    },
    {
      title: "Medication Adherence",
      description: "Hypertension patients showing 15% improvement in adherence",
      type: "treatment",
      impact: "medium",
      recommendation: "Expand patient education program"
    },
    {
      title: "Readmission Rate Decline",
      description: "30-day readmissions down 8% this quarter",
      type: "outcomes",
      impact: "high",
      recommendation: "Continue enhanced discharge planning"
    }
  ];

  const getTrendIcon = (trend: string) => {
    return trend === "up" ? "↗️" : "↘️";
  };

  const getTrendColor = (trend: string) => {
    return trend === "up" ? "text-green-600" : "text-red-600";
  };

  const getImpactColor = (impact: string) => {
    switch (impact) {
      case 'high': return 'bg-red-100 text-red-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const [addPatientOpen, setAddPatientOpen] = useState(false);

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="bg-gradient-to-r from-purple-600 to-blue-600 text-white shadow-lg">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold">Analytics Dashboard</h2>
              <p className="text-purple-100 mt-1">Performance insights and operational metrics</p>
            </div>
            <div className="flex space-x-3">
              <Button variant="secondary" className="bg-white/20 hover:bg-white/30 text-white border-white/30">
                <FileText className="h-4 w-4 mr-2" />
                Export Report
              </Button>
              <Button variant="secondary" className="bg-white/20 hover:bg-white/30 text-white border-white/30">
                <Calendar className="h-4 w-4 mr-2" />
                Custom Period
              </Button>
              <Button variant="secondary" className="bg-green-500 hover:bg-green-600 text-white border-white/30" onClick={() => setAddPatientOpen(true)}>
                Add Patient
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
      <AddPatientModal open={addPatientOpen} onClose={() => setAddPatientOpen(false)} />

      {/* Performance Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {performanceMetrics.map((metric, index) => (
          <Card key={index} className="bg-white shadow-md hover:shadow-lg transition-shadow duration-200">
            <CardContent className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <p className="text-sm font-medium text-gray-600">{metric.title}</p>
                  <p className="text-2xl font-bold text-gray-900">{metric.value}</p>
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
                  <span className="text-gray-500">Target: {metric.target}</span>
                </div>
                <Progress 
                  value={parseFloat(metric.value)} 
                  className="h-2" 
                />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Department Performance */}
      <Card className="bg-white shadow-md">
        <CardHeader>
          <CardTitle className="flex items-center text-xl text-gray-900">
            <Activity className="h-6 w-6 mr-2 text-blue-600" />
            Department Performance
          </CardTitle>
          <CardDescription>Monthly performance by department</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {departmentStats.map((dept, index) => (
              <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                    <Activity className="h-6 w-6 text-blue-600" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900">{dept.department}</h4>
                    <p className="text-sm text-gray-600">{dept.patients} patients this month</p>
                  </div>
                </div>
                <div className="flex items-center space-x-6">
                  <div className="text-center">
                    <p className="text-sm text-gray-600">Utilization</p>
                    <div className="flex items-center space-x-2">
                      <Progress value={dept.utilization} className="w-20 h-2" />
                      <span className="text-sm font-medium">{dept.utilization}%</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gray-600">Revenue</p>
                    <p className="font-bold text-green-600">{dept.revenue}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Insights and Recommendations */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="bg-white shadow-md">
          <CardHeader>
            <CardTitle className="flex items-center text-xl text-gray-900">
              <TrendingUp className="h-6 w-6 mr-2 text-green-600" />
              Key Insights
            </CardTitle>
            <CardDescription>AI-powered operational insights</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentInsights.map((insight, index) => (
                <div key={index} className="p-4 border border-gray-200 rounded-lg">
                  <div className="flex items-start justify-between mb-2">
                    <h4 className="font-semibold text-gray-900">{insight.title}</h4>
                    <Badge className={getImpactColor(insight.impact)} variant="secondary">
                      {insight.impact} impact
                    </Badge>
                  </div>
                  <p className="text-gray-700 text-sm mb-3">{insight.description}</p>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-500 capitalize">{insight.type}</span>
                    <Button size="sm" variant="outline" className="text-xs">
                      View Details
                    </Button>
                  </div>
                  <div className="mt-3 p-3 bg-blue-50 rounded-lg">
                    <p className="text-sm text-blue-800">
                      <strong>Recommendation:</strong> {insight.recommendation}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white shadow-md">
          <CardHeader>
            <CardTitle className="flex items-center text-xl text-gray-900">
              <AlertTriangle className="h-6 w-6 mr-2 text-orange-600" />
              Alerts & Notifications
            </CardTitle>
            <CardDescription>Important updates and alerts</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                <div className="flex items-center space-x-2 mb-2">
                  <AlertTriangle className="h-5 w-5 text-red-600" />
                  <h4 className="font-semibold text-red-900">Critical Alert</h4>
                </div>
                <p className="text-red-800 text-sm">3 patients require immediate follow-up</p>
                <Button size="sm" className="mt-2 bg-red-600 hover:bg-red-700 text-white">
                  Review Now
                </Button>
              </div>
              
              <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                <div className="flex items-center space-x-2 mb-2">
                  <Clock className="h-5 w-5 text-yellow-600" />
                  <h4 className="font-semibold text-yellow-900">Pending Actions</h4>
                </div>
                <p className="text-yellow-800 text-sm">15 lab results awaiting review</p>
                <Button size="sm" variant="outline" className="mt-2 border-yellow-600 text-yellow-700">
                  Review Lab Results
                </Button>
              </div>
              
              <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <div className="flex items-center space-x-2 mb-2">
                  <Users className="h-5 w-5 text-blue-600" />
                  <h4 className="font-semibold text-blue-900">Staff Update</h4>
                </div>
                <p className="text-blue-800 text-sm">Dr. Johnson will be on leave next week</p>
                <Button size="sm" variant="outline" className="mt-2 border-blue-600 text-blue-700">
                  Adjust Schedule
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Stats Summary */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white shadow-md">
          <CardContent className="p-4 text-center">
            <Users className="h-8 w-8 mx-auto mb-2" />
            <p className="text-2xl font-bold">2,847</p>
            <p className="text-blue-100 text-sm">Total Patients</p>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-green-500 to-green-600 text-white shadow-md">
          <CardContent className="p-4 text-center">
            <Calendar className="h-8 w-8 mx-auto mb-2" />
            <p className="text-2xl font-bold">156</p>
            <p className="text-green-100 text-sm">Today's Appointments</p>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-purple-500 to-purple-600 text-white shadow-md">
          <CardContent className="p-4 text-center">
            <FileText className="h-8 w-8 mx-auto mb-2" />
            <p className="text-2xl font-bold">1,247</p>
            <p className="text-purple-100 text-sm">Records Processed</p>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-orange-500 to-orange-600 text-white shadow-md">
          <CardContent className="p-4 text-center">
            <TrendingUp className="h-8 w-8 mx-auto mb-2" />
            <p className="text-2xl font-bold">94.2%</p>
            <p className="text-orange-100 text-sm">Efficiency Rate</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AnalyticsDashboard;
