import React, { useState, useEffect } from "react";
import {
  Download,
  Calendar,
  User,
  MapPin,
  Clock,
  FileText,
  Camera,
  Mail,
  CheckCircle,
  XCircle,
  Filter,
} from "lucide-react";
import axiosInstance from "../../library/axios";

const Report = () => {
  const [travelData, setTravelData] = useState([]);
  const [formData, setFormData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState({
    employeeId: "",
    startDate: "",
    endDate: "",
    page: 1,
    limit: 10,
  });

  const fetchTravelData = async () => {
    try {
      setLoading(true);
      const response = await axiosInstance.get(
        `/analytics/report/daily-travel-info?EmployeeId=${filters.employeeId}&startDate=${filters.startDate}&endDate=${filters.endDate}&page=${filters.page}&limit=${filters.limit}`
      );
      const result = response.data;
      if (result.success && result.data && Array.isArray(result.data.travels)) {
        setTravelData(result.data.travels);
      } else {
        setTravelData([]);
      }
    } catch (err) {
      console.error("Error fetching travel data:", err);
      setTravelData([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchFormData = async () => {
    try {
      setLoading(true);
      const response = await axiosInstance.get(
        `/analytics/report/form-details?EmployeeId=${filters.employeeId}&startDate=${filters.startDate}&endDate=${filters.endDate}&page=${filters.page}&limit=${filters.limit}`
      );
      const result = response.data;
      // Fixed: the API returns result.data directly, not result.data.travels
      if (result.success && result.data && Array.isArray(result.data)) {
        setFormData(result.data);
      } else {
        setFormData([]);
      }
    } catch (err) {
      console.error("Error fetching form data:", err);
      setFormData([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTravelData();
    fetchFormData();
  }, []);

  const formatDateTime = (dateTime) => {
    return new Date(dateTime).toLocaleString("en-IN", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: true,
    });
  };

  // Fixed: Updated function to correctly match form details using DocFormDetailId
  const getFormDetailsForTravel = (docFormDetailId) => {
    return formData.find((form) => form.id === docFormDetailId);
  };

  const generateExcelData = () => {
    const data = [];

    travelData.forEach((travel) => {
      const formDetails = getFormDetailsForTravel(travel.DocFormDetailId);

      const baseRow = {
        "Employee ID": travel.EmployeeId,
        // Fixed: Correct path to employee data
        "Employee Name": travel?.employee?.EmployeeName || "N/A",
        "Employee Phone": travel?.employee?.EmployeePhone || "N/A",
        "Check-in Coordinates": `${travel.checkinLatitude}, ${travel.checkinLongitude}`,
        "Check-in Time": formatDateTime(travel.checkinTime),
        "Check-out Coordinates": `${travel.checkoutLatitude}, ${travel.checkoutLongitude}`,
        "Check-out Time": formatDateTime(travel.checkoutTime),
        "Total Time": travel.totalTime,
        Remark: travel.formDetail?.remark || "",
        "Farm Name": travel.formDetail?.DocFarm?.FarmName || "N/A",
        "Location Name": travel.formDetail?.DocLocation?.LocationName || "N/A",
      };

      if (
        formDetails &&
        formDetails.categoryDetails &&
        formDetails.categoryDetails.length > 0
      ) {
        formDetails.categoryDetails.forEach((category) => {
          data.push({
            ...baseRow,
            "Category Name": category.category.CategoryName,
            "Sub Category Name": category.subcategory.SubCategoryName,
            Observation: category.Observation,
            "Image URL": category.Image || "N/A",
            Status: category.status,
            "Mail Sent": category.isMailSent ? "Yes" : "No",
          });
        });
      } else {
        data.push({
          ...baseRow,
          "Category Name": "N/A",
          "Sub Category Name": "N/A",
          Observation: "N/A",
          "Image URL": "N/A",
          Status: "N/A",
          "Mail Sent": "N/A",
        });
      }
    });

    return data;
  };

  const downloadExcel = () => {
    const data = generateExcelData();
    const headers = Object.keys(data[0] || {});

    let csvContent = headers.join(",") + "\n";
    data.forEach((row) => {
      csvContent +=
        headers.map((header) => `"${row[header] || ""}"`).join(",") + "\n";
    });

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `travel_report_${filters.startDate}_to_${filters.endDate}.csv`;
    link.click();
  };

  const downloadPDF = () => {
    // For a real implementation, you'd use a library like jsPDF
    alert(
      "PDF download functionality would be implemented using jsPDF library"
    );
  };

  const handleFilterChange = (field, value) => {
    setFilters((prev) => ({ ...prev, [field]: value }));
  };

  const applyFilters = () => {
    fetchTravelData();
    fetchFormData();
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
                <FileText className="h-8 w-8 text-blue-600" />
                Travel Report Dashboard
              </h1>
              <p className="text-gray-600 mt-1">
                Employee travel and form submission analytics
              </p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={downloadExcel}
                className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
              >
                <Download className="h-4 w-4" />
                Excel
              </button>
              <button
                onClick={downloadPDF}
                className="flex items-center gap-2 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
              >
                <Download className="h-4 w-4" />
                PDF
              </button>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex items-center gap-2 mb-4">
            <Filter className="h-5 w-5 text-gray-600" />
            <h2 className="text-lg font-semibold text-gray-900">Filters</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Employee ID
              </label>
              <input
                type="text"
                value={filters.employeeId}
                onChange={(e) =>
                  handleFilterChange("employeeId", e.target.value)
                }
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter Employee ID"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Start Date
              </label>
              <input
                type="date"
                value={filters.startDate}
                onChange={(e) =>
                  handleFilterChange("startDate", e.target.value)
                }
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                End Date
              </label>
              <input
                type="date"
                value={filters.endDate}
                onChange={(e) => handleFilterChange("endDate", e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="flex items-end">
              <button
                onClick={applyFilters}
                className="w-full bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
              >
                Apply Filters
              </button>
            </div>
          </div>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
            <div className="flex items-center justify-center">
              <div className="text-gray-600">Loading...</div>
            </div>
          </div>
        )}

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">
                  Total Travels
                </p>
                <p className="text-2xl font-bold text-gray-900">
                  {travelData.length}
                </p>
              </div>
              <MapPin className="h-8 w-8 text-blue-600" />
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Forms</p>
                <p className="text-2xl font-bold text-gray-900">
                  {formData.length}
                </p>
              </div>
              <FileText className="h-8 w-8 text-green-600" />
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Farm Visits</p>
                <p className="text-2xl font-bold text-gray-900">
                  {
                    travelData.filter(
                      (t) =>
                        t.formDetail?.DocLocation?.LocationName === "Farm Visit"
                    ).length
                  }
                </p>
              </div>
              <User className="h-8 w-8 text-purple-600" />
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">HO Visits</p>
                <p className="text-2xl font-bold text-gray-900">
                  {
                    travelData.filter(
                      (t) =>
                        t.formDetail?.DocLocation?.LocationName === "HO Visit"
                    ).length
                  }
                </p>
              </div>
              <Clock className="h-8 w-8 text-orange-600" />
            </div>
          </div>
        </div>

        {/* Travel Records */}
        <div className="space-y-6">
          {travelData.map((travel) => {
            const formDetails = getFormDetailsForTravel(travel.DocFormDetailId);

            return (
              <div
                key={travel.id}
                className="bg-white rounded-lg shadow-sm overflow-hidden"
              >
                {/* Travel Header */}
                <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-6">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <p className="text-blue-100 text-sm">Employee Details</p>
                      <p className="font-semibold">ID: {travel.EmployeeId}</p>
                      <p className="text-sm text-blue-100">Employee Info</p>
                      <p className="font-semibold">
                        Name: {travel?.employee?.EmployeeName || "N/A"}
                      </p>
                      <p className="font-semibold">
                        Phone: {travel?.employee?.EmployeePhone || "N/A"}
                      </p>
                    </div>
                    <div>
                      <p className="text-blue-100 text-sm">Location</p>
                      <p className="font-semibold">
                        {travel.formDetail?.DocFarm?.FarmName || "N/A"}
                      </p>
                      <p className="text-sm text-blue-100">
                        {travel.formDetail?.DocLocation?.LocationName || "N/A"}
                      </p>
                    </div>
                    <div>
                      <p className="text-blue-100 text-sm">Duration</p>
                      <p className="font-semibold">{travel.totalTime}</p>
                      <p className="text-sm text-blue-100">Total Time</p>
                    </div>
                  </div>
                </div>

                {/* Travel Details */}
                <div className="p-6">
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                    {/* Check-in Details */}
                    <div className="border rounded-lg p-4">
                      <h3 className="font-semibold text-green-700 mb-3 flex items-center gap-2">
                        <CheckCircle className="h-4 w-4" />
                        Check-in Details
                      </h3>
                      <div className="space-y-2 text-sm">
                        <p>
                          <span className="font-medium">Time:</span>{" "}
                          {formatDateTime(travel.checkinTime)}
                        </p>
                        <p>
                          <span className="font-medium">Coordinates:</span>{" "}
                          {travel.checkinLatitude}, {travel.checkinLongitude}
                        </p>
                      </div>
                    </div>

                    {/* Check-out Details */}
                    <div className="border rounded-lg p-4">
                      <h3 className="font-semibold text-red-700 mb-3 flex items-center gap-2">
                        <XCircle className="h-4 w-4" />
                        Check-out Details
                      </h3>
                      <div className="space-y-2 text-sm">
                        <p>
                          <span className="font-medium">Time:</span>{" "}
                          {formatDateTime(travel.checkoutTime)}
                        </p>
                        <p>
                          <span className="font-medium">Coordinates:</span>{" "}
                          {travel.checkoutLatitude}, {travel.checkoutLongitude}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Remark */}
                  <div className="mb-6">
                    <h3 className="font-semibold text-gray-700 mb-2">Remark</h3>
                    <p className="text-gray-600 bg-gray-50 p-3 rounded-lg">
                      {travel.formDetail?.remark || "No remark provided"}
                    </p>
                  </div>

                  {/* Form Details */}
                  {formDetails &&
                    formDetails.categoryDetails &&
                    formDetails.categoryDetails.length > 0 && (
                      <div>
                        <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                          <FileText className="h-5 w-5" />
                          Form Submissions ({formDetails.categoryDetails.length}
                          )
                        </h3>
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                          {formDetails.categoryDetails.map((category) => (
                            <div
                              key={category.id}
                              className="border rounded-lg p-4 hover:shadow-md transition-shadow"
                            >
                              <div className="flex items-start justify-between mb-3">
                                <div>
                                  <h4 className="font-medium text-gray-900">
                                    {category.category.CategoryName} -{" "}
                                    {category.subcategory.SubCategoryName}
                                  </h4>
                                  <div className="flex items-center gap-4 mt-2">
                                    <span
                                      className={`px-2 py-1 rounded-full text-xs font-medium ${
                                        category.status === "pending"
                                          ? "bg-yellow-100 text-yellow-800"
                                          : category.status === "completed"
                                          ? "bg-green-100 text-green-800"
                                          : "bg-gray-100 text-gray-800"
                                      }`}
                                    >
                                      {category.status}
                                    </span>
                                    <div className="flex items-center gap-1">
                                      <Mail
                                        className={`h-3 w-3 ${
                                          category.isMailSent
                                            ? "text-green-600"
                                            : "text-gray-400"
                                        }`}
                                      />
                                      <span className="text-xs text-gray-600">
                                        {category.isMailSent
                                          ? "Mail Sent"
                                          : "Mail Not Sent"}
                                      </span>
                                    </div>
                                  </div>
                                </div>
                                {category.Image && (
                                  <div className="flex items-center gap-1 text-blue-600">
                                    <Camera className="h-4 w-4" />
                                    <a
                                      href={category.Image}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="text-xs hover:underline"
                                    >
                                      View Image
                                    </a>
                                  </div>
                                )}
                              </div>
                              <p className="text-sm text-gray-600">
                                {category.Observation}
                              </p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                </div>
              </div>
            );
          })}
        </div>

        {/* No Data Message */}
        {!loading && travelData.length === 0 && (
          <div className="bg-white rounded-lg shadow-sm p-6 text-center">
            <p className="text-gray-600">
              No travel data found for the selected filters.
            </p>
          </div>
        )}

        {/* Pagination */}
        <div className="bg-white rounded-lg shadow-sm p-4 mt-6">
          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-600">
              Showing {travelData.length} of {travelData.length} results
            </p>
            <div className="flex gap-2">
              <button
                className="px-3 py-1 border border-gray-300 rounded text-sm hover:bg-gray-50 disabled:opacity-50"
                disabled
              >
                Previous
              </button>
              <button
                className="px-3 py-1 border border-gray-300 rounded text-sm hover:bg-gray-50 disabled:opacity-50"
                disabled
              >
                Next
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Report;
