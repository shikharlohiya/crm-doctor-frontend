import React, { useState, useEffect } from "react";
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  AreaChart,
  Area,
} from "recharts";
import {
  Users,
  Building2,
  MapPin,
  Home,
  Car,
  FileText,
  TrendingUp,
  Clock,
  CheckCircle,
  AlertCircle,
  RefreshCw,
  ArrowUp,
  ArrowDown,
  Activity,
  Calendar,
  Filter,
  Download,
  Maximize2,
  Settings,
  FileDown,
  Table,
} from "lucide-react";

const AnalyticsDashboard = () => {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState({
    summary: {},
    formCategoryStatus: [],
    doctorUnitDistribution: {},
    doctorFarmDistribution: {},
    dailyCheckins: [],
    topDoctors: [],
    formSubmissionTrends: [],
    categoryCompletion: { categoryCompletion: [], subCategoryCompletion: [] },
  });

  // Enhanced color schemes
  const COLORS = [
    "#6366F1",
    "#8B5CF6",
    "#EC4899",
    "#EF4444",
    "#F59E0B",
    "#10B981",
    "#06B6D4",
    "#84CC16",
    "#F97316",
    "#64748B",
  ];

  const GRADIENTS = [
    "from-blue-500 to-purple-600",
    "from-purple-500 to-pink-600",
    "from-pink-500 to-rose-600",
    "from-orange-500 to-red-600",
    "from-green-500 to-emerald-600",
    "from-teal-500 to-cyan-600",
    "from-indigo-500 to-blue-600",
  ];

  const STATUS_COLORS = {
    completed: "#10B981",
    pending: "#F59E0B",
    failed: "#EF4444",
  };

  useEffect(() => {
    fetchAllData();
  }, []);

  const fetchAllData = async () => {
    setLoading(true);
    try {
      // Replace 'YOUR_API_BASE_URL' with your actual API base URL
      const BASE_URL = "http://localhost:5000"; // Change this to your API base URL

      const endpoints = [
        `${BASE_URL}/api/analytics/summary-counts`,
        `${BASE_URL}/api/analytics/form-category-status`,
        `${BASE_URL}/api/analytics/doctor-unit-distribution`,
        `${BASE_URL}/api/analytics/doctor-farm-distribution`,
        `${BASE_URL}/api/analytics/daily-checkins`,
        `${BASE_URL}/api/analytics/top-doctors`,
        `${BASE_URL}/api/analytics/form-submission-trends`,
        `${BASE_URL}/api/analytics/category-completion-rates`,
      ];

      // Make all API calls
      const responses = await Promise.all(
        endpoints.map(async (endpoint) => {
          try {
            const response = await fetch(endpoint, {
              method: "GET",
              headers: {
                "Content-Type": "application/json",
                // Add any authentication headers here if needed
                // 'Authorization': `Bearer ${your_token}`,
              },
            });

            if (!response.ok) {
              throw new Error(`HTTP error! status: ${response.status}`);
            }

            return await response.json();
          } catch (error) {
            console.error(`Error fetching ${endpoint}:`, error);
            return null; // Return null for failed requests
          }
        })
      );

      // Set data with fallbacks for failed requests
      setData({
        summary: responses[0] || {},
        formCategoryStatus: Array.isArray(responses[1]) ? responses[1] : [],
        doctorUnitDistribution: responses[2] || {},
        doctorFarmDistribution: responses[3] || {},
        dailyCheckins: Array.isArray(responses[4]) ? responses[4] : [],
        topDoctors: Array.isArray(responses[5]) ? responses[5] : [],
        formSubmissionTrends: Array.isArray(responses[6]) ? responses[6] : [],
        categoryCompletion: responses[7] || {
          categoryCompletion: [],
          subCategoryCompletion: [],
        },
      });
    } catch (error) {
      console.error("Error fetching analytics data:", error);
      // Fallback to empty data if API fails
      setData({
        summary: {
          doctorCount: 0,
          unitCount: 0,
          locationCount: 0,
          farmCount: 0,
          travelCount: 0,
          formCount: 0,
          formCategoryDetailCount: 0,
        },
        formCategoryStatus: [],
        doctorUnitDistribution: {},
        doctorFarmDistribution: {},
        dailyCheckins: [],
        topDoctors: [],
        formSubmissionTrends: [],
        categoryCompletion: {
          categoryCompletion: [],
          subCategoryCompletion: [],
        },
      });
    } finally {
      setLoading(false);
    }
  };

  // Report Generation Functions
  const generateCSVReport = () => {
    const csvData = [];

    // Summary Section
    csvData.push(["HEALTHCARE ANALYTICS REPORT"]);
    csvData.push(["Generated on:", new Date().toLocaleDateString()]);
    csvData.push([""]);

    // Summary Statistics
    csvData.push(["SUMMARY STATISTICS"]);
    csvData.push(["Metric", "Count"]);
    csvData.push(["Total Doctors", data.summary.doctorCount || 0]);
    csvData.push(["Active Units", data.summary.unitCount || 0]);
    csvData.push(["Locations", data.summary.locationCount || 0]);
    csvData.push(["Farms", data.summary.farmCount || 0]);
    csvData.push(["Travel Records", data.summary.travelCount || 0]);
    csvData.push(["Total Forms", data.summary.formCount || 0]);
    csvData.push([
      "Form Categories",
      data.summary.formCategoryDetailCount || 0,
    ]);
    csvData.push([""]);

    // Doctor Unit Distribution
    csvData.push(["DOCTOR UNIT DISTRIBUTION"]);
    csvData.push(["Unit", "Doctor Count"]);
    Object.entries(data.doctorUnitDistribution || {}).forEach(
      ([unit, count]) => {
        csvData.push([unit, count]);
      }
    );
    csvData.push([""]);

    // Doctor Farm Distribution
    csvData.push(["DOCTOR FARM DISTRIBUTION"]);
    csvData.push(["Farm", "Doctor Count"]);
    Object.entries(data.doctorFarmDistribution || {}).forEach(
      ([farm, count]) => {
        csvData.push([farm, count]);
      }
    );
    csvData.push([""]);

    // Form Status
    csvData.push(["FORM STATUS OVERVIEW"]);
    csvData.push(["Category ID", "Status", "Count"]);
    data.formCategoryStatus.forEach((item) => {
      csvData.push([item.CategoryId, item.status, item.count]);
    });
    csvData.push([""]);

    // Top Doctors
    csvData.push(["TOP PERFORMING DOCTORS"]);
    csvData.push(["Employee ID", "Name", "Check-in Count"]);
    data.topDoctors.forEach((doctor) => {
      csvData.push([
        doctor.EmployeeId,
        doctor.employee.EmployeeName,
        doctor.checkinCount,
      ]);
    });
    csvData.push([""]);

    // Category Completion
    csvData.push(["CATEGORY COMPLETION RATES"]);
    csvData.push([
      "Category ID",
      "Total",
      "Completed",
      "Pending",
      "Completion Rate",
    ]);
    data.categoryCompletion.categoryCompletion?.forEach((cat) => {
      const completionRate =
        cat.total > 0
          ? ((parseInt(cat.completed) / cat.total) * 100).toFixed(1) + "%"
          : "0%";
      csvData.push([
        cat.CategoryId,
        cat.total,
        cat.completed,
        cat.pending,
        completionRate,
      ]);
    });

    return csvData;
  };

  const downloadCSVReport = () => {
    const csvData = generateCSVReport();
    const csvContent = csvData.map((row) => row.join(",")).join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute(
      "download",
      `healthcare_analytics_report_${
        new Date().toISOString().split("T")[0]
      }.csv`
    );
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  //   const downloadJSONReport = () => {
  //     const reportData = {
  //       reportInfo: {
  //         title: "Healthcare Analytics Report",
  //         generatedOn: new Date().toISOString(),
  //         timePeriod: selectedPeriod,
  //       },
  //       summary: data.summary,
  //       doctorUnitDistribution: data.doctorUnitDistribution,
  //       doctorFarmDistribution: data.doctorFarmDistribution,
  //       formCategoryStatus: data.formCategoryStatus,
  //       topDoctors: data.topDoctors,
  //       dailyCheckins: data.dailyCheckins,
  //       formSubmissionTrends: data.formSubmissionTrends,
  //       categoryCompletion: data.categoryCompletion,
  //     };

  //     const dataStr = JSON.stringify(reportData, null, 2);
  //     const blob = new Blob([dataStr], { type: "application/json" });
  //     const url = URL.createObjectURL(blob);
  //     const link = document.createElement("a");
  //     link.href = url;
  //     link.download = `healthcare_analytics_report_${
  //       new Date().toISOString().split("T")[0]
  //     }.json`;
  //     document.body.appendChild(link);
  //     link.click();
  //     document.body.removeChild(link);
  //   };

  const StatCard = ({ title, value, trend, gradient }) => (
    <div className="group relative overflow-hidden bg-white rounded-2xl shadow-sm border border-gray-100 p-6 hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
      <div
        className={`absolute inset-0 bg-gradient-to-br ${gradient} opacity-0 group-hover:opacity-5 transition-opacity duration-300`}
      />
      <div className="relative z-10">
        <div className="flex items-center justify-between mb-4">
          <div
            className={`p-3 rounded-xl bg-gradient-to-br ${gradient} shadow-lg`}
          >
            <Icon className="h-6 w-6 text-white" />
          </div>
          {trend && (
            <div
              className={`flex items-center space-x-1 px-2 py-1 rounded-full text-xs font-medium ${
                trend > 0
                  ? "bg-green-100 text-green-700"
                  : "bg-red-100 text-red-700"
              }`}
            >
              {trend > 0 ? (
                <ArrowUp className="h-3 w-3" />
              ) : (
                <ArrowDown className="h-3 w-3" />
              )}
              <span>{Math.abs(trend)}%</span>
            </div>
          )}
        </div>
        <div>
          <p className="text-sm font-medium text-gray-600 mb-1">{title}</p>
          <p className="text-3xl font-bold text-gray-900">
            {typeof value === "number" ? value.toLocaleString() : value || 0}
          </p>
        </div>
      </div>
    </div>
  );

  const ChartCard = ({
    title,
    children,
    fullWidth = false,
    actions = null,
  }) => (
    <div
      className={`bg-white rounded-2xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow duration-300 ${
        fullWidth ? "col-span-full" : ""
      }`}
    >
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
        <div className="flex items-center space-x-2">
          {actions}
          <button className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
            <Maximize2 className="h-4 w-4" />
          </button>
        </div>
      </div>
      {children}
    </div>
  );

  const EmptyState = ({ message }) => (
    <div className="h-72 flex items-center justify-center text-gray-500">
      <div className="text-center">
        <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
          <AlertCircle className="h-8 w-8 text-gray-400" />
        </div>
        <p className="text-gray-600">{message}</p>
      </div>
    </div>
  );

  // Transform data functions based on actual API responses
  const transformUnitDistribution = () => {
    if (
      !data.doctorUnitDistribution ||
      typeof data.doctorUnitDistribution !== "object"
    ) {
      return [];
    }
    return Object.entries(data.doctorUnitDistribution).map(([unit, count]) => ({
      unit,
      count: Number(count),
      name: unit, // For recharts
    }));
  };

  const transformFarmDistribution = () => {
    if (
      !data.doctorFarmDistribution ||
      typeof data.doctorFarmDistribution !== "object"
    ) {
      return [];
    }
    return Object.entries(data.doctorFarmDistribution).map(([farm, count]) => ({
      farm,
      count: Number(count),
      name: farm, // For recharts
    }));
  };

  const transformFormStatus = () => {
    if (
      !Array.isArray(data.formCategoryStatus) ||
      data.formCategoryStatus.length === 0
    ) {
      return [];
    }

    // Group by status and sum counts
    const statusCounts = {};
    data.formCategoryStatus.forEach((item) => {
      const status = item.status;
      statusCounts[status] = (statusCounts[status] || 0) + Number(item.count);
    });

    return Object.entries(statusCounts).map(([status, count]) => ({
      status: status.charAt(0).toUpperCase() + status.slice(1),
      count,
      color: STATUS_COLORS[status] || "#6B7280",
    }));
  };

  const transformCategoryCompletion = () => {
    return (
      data.categoryCompletion.categoryCompletion?.map((cat) => ({
        category: `Category ${cat.CategoryId}`,
        completed: parseInt(cat.completed) || 0,
        pending: parseInt(cat.pending) || 0,
        total: Number(cat.total) || 0,
        completionRate:
          cat.total > 0
            ? Math.round((parseInt(cat.completed) / cat.total) * 100)
            : 0,
      })) || []
    );
  };

  const transformDailyCheckins = () => {
    return data.dailyCheckins.map((item) => ({
      ...item,
      count: Number(item.count),
      date: new Date(item.date).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      }),
    }));
  };

  const transformFormSubmissionTrends = () => {
    return data.formSubmissionTrends.map((item) => ({
      ...item,
      submissionCount: Number(item.submissionCount),
      date: new Date(item.date).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      }),
    }));
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="relative">
            <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg">
              <RefreshCw className="h-8 w-8 text-white animate-spin" />
            </div>
            <div className="absolute inset-0 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl blur-xl opacity-30 animate-pulse" />
          </div>
          <h2 className="text-xl font-semibold text-gray-800 mb-2">
            Loading Analytics
          </h2>
          <p className="text-gray-600">Fetching your latest data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/30 to-purple-50/30">
      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Enhanced Header */}
        <div className="mb-8">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
            <div className="mb-4 lg:mb-0">
              <h1 className="text-4xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent mb-2">
                Farm Health Analytics Dashboard
              </h1>
              <p className="text-gray-600 text-lg">
                Real-time insights into your healthcare operations
              </p>
            </div>

            <div className="flex items-center space-x-4">
              {/* Download Dropdown */}
              <div className="relative group">
                <button className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-xl hover:from-green-600 hover:to-emerald-700 transition-all duration-200 shadow-lg hover:shadow-xl">
                  <Download className="h-4 w-4 mr-2" />
                  Download Report
                </button>
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-lg border border-gray-200 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-20">
                  <div className="p-2">
                    <button
                      onClick={downloadCSVReport}
                      className="w-full flex items-center px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 rounded-lg transition-colors"
                    >
                      <Table className="h-4 w-4 mr-3 text-green-600" />
                      Download CSV Report
                    </button>
                    {/* <button
                      onClick={downloadJSONReport}
                      className="w-full flex items-center px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 rounded-lg transition-colors"
                    >
                      <FileDown className="h-4 w-4 mr-3 text-blue-600" />
                      Download JSON Data
                    </button> */}
                  </div>
                </div>
              </div>

              <button
                onClick={fetchAllData}
                disabled={loading}
                className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl hover:from-blue-600 hover:to-purple-700 transition-all duration-200 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <RefreshCw
                  className={`h-4 w-4 mr-2 ${loading ? "animate-spin" : ""}`}
                />
                Refresh
              </button>
            </div>
          </div>
        </div>

        {/* Enhanced Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard
            title="Total Doctors"
            value={data.summary.doctorCount || 0}
            icon={Users}
            gradient={GRADIENTS[0]}
          />
          <StatCard
            title="Active Units"
            value={data.summary.unitCount || 0}
            icon={Building2}
            gradient={GRADIENTS[1]}
          />
          <StatCard
            title="Locations"
            value={data.summary.locationCount || 0}
            icon={MapPin}
            gradient={GRADIENTS[2]}
          />
          <StatCard
            title="Farms"
            value={data.summary.farmCount || 0}
            icon={Home}
            gradient={GRADIENTS[3]}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <StatCard
            title="Travel Records"
            value={data.summary.travelCount || 0}
            icon={Car}
            gradient={GRADIENTS[4]}
          />
          <StatCard
            title="Total Forms"
            value={data.summary.formCount || 0}
            icon={FileText}
            gradient={GRADIENTS[5]}
          />
          <StatCard
            title="Form Categories"
            value={data.summary.formCategoryDetailCount || 0}
            icon={CheckCircle}
            gradient={GRADIENTS[6]}
          />
        </div>

        {/* Enhanced Charts Grid */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-8 mb-8">
          {/* Doctor Unit Distribution */}
          <ChartCard title="Doctor Unit Distribution">
            {transformUnitDistribution().length > 0 ? (
              <ResponsiveContainer width="100%" height={320}>
                <PieChart>
                  <Pie
                    data={transformUnitDistribution()}
                    cx="50%"
                    cy="50%"
                    innerRadius={70}
                    outerRadius={130}
                    paddingAngle={3}
                    dataKey="count"
                    nameKey="name"
                  >
                    {transformUnitDistribution().map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={COLORS[index % COLORS.length]}
                        stroke="white"
                        strokeWidth={2}
                      />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "white",
                      border: "none",
                      borderRadius: "12px",
                      boxShadow: "0 10px 25px rgba(0,0,0,0.1)",
                    }}
                  />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <EmptyState message="No unit distribution data available" />
            )}
          </ChartCard>

          {/* Form Status Distribution */}
          <ChartCard title="Form Status Overview">
            {transformFormStatus().length > 0 ? (
              <ResponsiveContainer width="100%" height={320}>
                <BarChart data={transformFormStatus()}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="status" tick={{ fill: "#6b7280" }} />
                  <YAxis tick={{ fill: "#6b7280" }} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "white",
                      border: "none",
                      borderRadius: "12px",
                      boxShadow: "0 10px 25px rgba(0,0,0,0.1)",
                    }}
                  />
                  <Bar dataKey="count" fill="#3B82F6" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <EmptyState message="No form status data available" />
            )}
          </ChartCard>
        </div>

        {/* Daily Trends */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-8 mb-8">
          <ChartCard title="Daily Check-ins Trend">
            {data.dailyCheckins.length > 0 ? (
              <ResponsiveContainer width="100%" height={320}>
                <AreaChart data={transformDailyCheckins()}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis
                    dataKey="date"
                    tick={{ fill: "#6b7280", fontSize: 12 }}
                  />
                  <YAxis tick={{ fill: "#6b7280" }} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "white",
                      border: "none",
                      borderRadius: "12px",
                      boxShadow: "0 10px 25px rgba(0,0,0,0.1)",
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="count"
                    stroke="#10B981"
                    strokeWidth={3}
                    fill="#10B981"
                    fillOpacity={0.3}
                  />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <EmptyState message="No daily check-in data available" />
            )}
          </ChartCard>

          <ChartCard title="Form Submission Trends">
            {data.formSubmissionTrends.length > 0 ? (
              <ResponsiveContainer width="100%" height={320}>
                <LineChart data={transformFormSubmissionTrends()}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis
                    dataKey="date"
                    tick={{ fill: "#6b7280", fontSize: 12 }}
                  />
                  <YAxis tick={{ fill: "#6b7280" }} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "white",
                      border: "none",
                      borderRadius: "12px",
                      boxShadow: "0 10px 25px rgba(0,0,0,0.1)",
                    }}
                  />
                  <Line
                    type="monotone"
                    dataKey="submissionCount"
                    stroke="#F59E0B"
                    strokeWidth={3}
                    dot={{ fill: "#F59E0B", strokeWidth: 2, r: 5 }}
                    activeDot={{ r: 7, fill: "#F59E0B" }}
                  />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <EmptyState message="No form submission trend data available" />
            )}
          </ChartCard>
        </div>

        {/* Bottom Section */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-8 mb-8">
          {/* Top Doctors */}
          <ChartCard title="Top Performing Doctors">
            {data.topDoctors.length > 0 ? (
              <div className="space-y-4">
                {data.topDoctors.map((doctor, index) => (
                  <div
                    key={doctor.EmployeeId}
                    className="group flex items-center justify-between p-4 bg-gradient-to-r from-gray-50 to-gray-100 hover:from-blue-50 hover:to-purple-50 rounded-xl transition-all duration-300 hover:shadow-md"
                  >
                    <div className="flex items-center space-x-4">
                      <div
                        className={`relative w-10 h-10 rounded-full flex items-center justify-center text-white text-sm font-bold shadow-lg ${
                          index === 0
                            ? "bg-gradient-to-br from-yellow-400 to-yellow-600"
                            : index === 1
                            ? "bg-gradient-to-br from-gray-400 to-gray-600"
                            : index === 2
                            ? "bg-gradient-to-br from-orange-400 to-orange-600"
                            : "bg-gradient-to-br from-blue-400 to-blue-600"
                        }`}
                      >
                        {index + 1}
                        {index < 3 && (
                          <div className="absolute -top-1 -right-1 w-3 h-3 bg-white rounded-full flex items-center justify-center">
                            <div className="w-1.5 h-1.5 bg-current rounded-full"></div>
                          </div>
                        )}
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900 group-hover:text-blue-700 transition-colors">
                          {doctor.employee.EmployeeName}
                        </p>
                        <p className="text-sm text-gray-600">
                          ID: {doctor.EmployeeId}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-xl text-blue-600">
                        {doctor.checkinCount}
                      </p>
                      <p className="text-sm text-gray-600">check-ins</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <EmptyState message="No top doctors data available" />
            )}
          </ChartCard>

          {/* Enhanced Category Completion */}
          <ChartCard title="Category Completion Rates">
            <ResponsiveContainer width="100%" height={320}>
              <BarChart data={transformCategoryCompletion()}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis
                  dataKey="category"
                  tick={{ fill: "#6b7280", fontSize: 12 }}
                />
                <YAxis tick={{ fill: "#6b7280" }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "white",
                    border: "none",
                    borderRadius: "12px",
                    boxShadow: "0 10px 25px rgba(0,0,0,0.1)",
                  }}
                />
                <Legend />
                <Bar
                  dataKey="completed"
                  fill="#10B981"
                  name="Completed"
                  radius={[4, 4, 0, 0]}
                />
                <Bar
                  dataKey="pending"
                  fill="#F59E0B"
                  name="Pending"
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </ChartCard>
        </div>

        {/* Enhanced Doctor Farm Distribution */}
        <ChartCard title="Doctor Farm Distribution" fullWidth>
          <ResponsiveContainer width="100%" height={400}>
            <BarChart data={transformFarmDistribution()} layout="horizontal">
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis type="number" tick={{ fill: "#6b7280" }} />
              <YAxis
                dataKey="farm"
                type="category"
                tick={{ fill: "#6b7280" }}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "white",
                  border: "none",
                  borderRadius: "12px",
                  boxShadow: "0 10px 25px rgba(0,0,0,0.1)",
                }}
              />
              <Bar
                dataKey="count"
                fill="url(#farmGradient)"
                radius={[0, 8, 8, 0]}
              />
              <defs>
                <linearGradient id="farmGradient" x1="0" y1="0" x2="1" y2="0">
                  <stop offset="0%" stopColor="#8B5CF6" />
                  <stop offset="100%" stopColor="#A855F7" />
                </linearGradient>
              </defs>
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>
    </div>
  );
};

export default AnalyticsDashboard;
