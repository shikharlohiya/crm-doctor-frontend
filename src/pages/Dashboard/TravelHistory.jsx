// import React, { useState, useEffect } from "react";
// import {
//   Clock,
//   MapPin,
//   User,
//   Calendar,
//   CheckCircle,
//   ArrowLeft,
//   Eye,
//   X,
//   ChevronDown,
//   ChevronUp,
//   FileText,
//   Activity,
// } from "lucide-react";
// import { Link } from "react-router-dom";
// import { useSelector } from "react-redux";
// import axiosInstance from "../../library/axios";
// import { useNavigate } from "react-router-dom";

// const TravelHistory = () => {
//   const [travels, setTravels] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState(null);
//   const [selectedTravel, setSelectedTravel] = useState(null);
//   const [expandedItems, setExpandedItems] = useState({});
//   const [pagination, setPagination] = useState({});
//   // const [currentPage, setCurrentPage] = useState(1);
//   const [limit] = useState(10);

//   const user = useSelector((state) => state.user.user);
//   const employeeId = user.EmployeeId;
//   const navigate = useNavigate();

//   // Fetch travel history
//   // Fetch travel history
//   const fetchTravelHistory = async (page = 1) => {
//     try {
//       setLoading(true);

//       const response = await axiosInstance.get(
//         `/doctor/daily-travel-info?page=${page}&limit=${limit}&EmployeeId=${employeeId}&startDate=&endDate=`
//       );
//       const result = response.data;
//       console.log(result);

//       if (result.success && result.data) {
//         setTravels(result.data.travels || []);
//         setPagination(result.data.pagination || {});
//         setCurrentPage(page);
//       } else {
//         setTravels([]);
//       }
//     } catch (err) {
//       console.error("Error fetching travel history:", err);
//       setError("Failed to fetch travel history");
//       setTravels([]);
//     } finally {
//       setLoading(false);
//     }
//   };
//   useEffect(() => {
//     fetchTravelHistory();
//   }, []);

//   // Format date for display
//   const formatDate = (dateString) => {
//     if (!dateString) return "N/A";
//     return new Date(dateString).toLocaleString("en-IN", {
//       year: "numeric",
//       month: "short",
//       day: "numeric",
//       hour: "2-digit",
//       minute: "2-digit",
//     });
//   };

//   // Calculate duration between checkin and checkout
//   const calculateDuration = (checkin, checkout) => {
//     if (!checkin || !checkout) return "N/A";

//     const checkinTime = new Date(checkin);
//     const checkoutTime = new Date(checkout);
//     const diffMs = checkoutTime - checkinTime;

//     const hours = Math.floor(diffMs / (1000 * 60 * 60));
//     const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));

//     return `${hours}h ${minutes}m`;
//   };

//   // Toggle expanded view for travel item
//   const toggleExpanded = (travelId) => {
//     setExpandedItems((prev) => ({
//       ...prev,
//       [travelId]: !prev[travelId],
//     }));
//   };

//   // Show detailed modal for travel
//   const showTravelDetails = (travel) => {
//     setSelectedTravel(travel);
//   };

//   if (loading) {
//     return (
//       <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
//         <div className="text-center">
//           <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
//           <p className="text-gray-600">Loading travel history...</p>
//         </div>
//       </div>
//     );
//   }

//   if (error) {
//     return (
//       <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
//         <div className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-md">
//           <div className="flex items-center">
//             <X className="h-5 w-5 text-red-500 mr-2" />
//             <p className="text-red-700">{error}</p>
//           </div>
//           <button
//             onClick={fetchTravelHistory}
//             className="mt-4 bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 transition-colors"
//           >
//             Retry
//           </button>
//         </div>
//       </div>
//     );
//   }

//   return (
//     <div className="">
//       <div className="mx-auto">
//         {/* Header */}
//         <div className="bg-gradient-to-r from-green-700 to-green-800 px-6 py-4 rounded-lg">
//           <div className="flex justify-between items-start">
//             <div>
//               <h1 className="text-xl font-bold text-white">Travel History</h1>
//               <p className="text-white text-sm mt-1">Complete visit records</p>
//             </div>
//             <div className="text-right">
//               <button
//                 onClick={() => navigate("/dashboard/location-selector")}
//                 disabled={!travels.every((travel) => travel.checkoutTime)}
//                 className={`text-sm transition-colors mb-1 border rounded-lg px-2 py-1 m-1 block ${
//                   travels.every((travel) => travel.checkoutTime)
//                     ? "text-white border-white hover:bg-white hover:bg-opacity-10"
//                     : "text-gray-300 border-gray-300 cursor-not-allowed"
//                 }`}
//               >
//                 {travels.every((travel) => travel.checkoutTime)
//                   ? "Check-in"
//                   : "Checkout Pending"}
//               </button>
//             </div>
//           </div>
//         </div>

//         {/* User Info */}
//         <div className="bg-gray-50 px-4 py-3 border-b">
//           <div className="flex items-center justify-between">
//             <div className="flex items-center">
//               <User className="h-4 w-4 text-blue-600 mr-2" />
//               <div>
//                 <p className="text-gray-600 text-xs">Doctor</p>
//                 <p className="font-medium text-gray-900 text-sm">
//                   {user?.EmployeeName}
//                 </p>
//               </div>
//             </div>
//             <div className="text-right">
//               <p className="text-gray-600 text-xs">
//                 Total Visits- {travels.length}
//               </p>
//             </div>
//           </div>
//         </div>

//         {/* Travel List */}
//         <div className="p-4 space-y-4">
//           {travels.length > 0 ? (
//             travels.map((travel) => (
//               <div
//                 key={travel.id}
//                 className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden"
//               >
//                 {/* Travel Header */}
//                 <div className="p-4">
//                   <div className="flex justify-between items-start mb-3">
//                     <div className="flex items-center space-x-2">
//                       <div className="bg-blue-100 rounded-full p-2">
//                         <MapPin className="h-4 w-4 text-blue-600" />
//                       </div>
//                       <div>
//                         {console.log(travel)}
//                         {/* <p className="font-semibold text-gray-800">
//                           Travel #{travel.id}
//                         </p>
//                         <p className="text-xs text-gray-500">
//                           Employee ID: {travel.EmployeeId}
//                         </p> */}
//                       </div>
//                     </div>
//                     <div className="flex space-x-2">
//                       <button
//                         onClick={() => showTravelDetails(travel)}
//                         className="p-1 text-blue-600 hover:bg-blue-50 rounded"
//                       >
//                         <Eye className="h-4 w-4" />
//                       </button>
//                       <button
//                         onClick={() => toggleExpanded(travel.id)}
//                         className="p-1 text-gray-600 hover:bg-gray-50 rounded"
//                       >
//                         {expandedItems[travel.id] ? (
//                           <ChevronUp className="h-4 w-4" />
//                         ) : (
//                           <ChevronDown className="h-4 w-4" />
//                         )}
//                       </button>
//                       {!travel.checkoutTime && (
//                         <button
//                           onClick={() => navigate("/dashboard/checkin")}
//                           className="text-black text-sm transition-colors mb-1 border border-black rounded-lg px-2 py-1 m-1 block"
//                         >
//                           view
//                         </button>
//                       )}
//                     </div>
//                   </div>

//                   {/* Time Info */}
//                   <div className="grid grid-cols-2 gap-3 text-xs">
//                     <div className="space-y-1">
//                       <div className="flex items-center text-green-600">
//                         <Clock className="h-3 w-3 mr-1" />
//                         <span className="font-medium">Check-in</span>
//                       </div>
//                       <p className="text-gray-800 font-medium">
//                         {formatDate(travel.checkinTime)}
//                       </p>
//                     </div>

//                     <div className="space-y-1">
//                       <div className="flex items-center text-red-600">
//                         <Clock className="h-3 w-3 mr-1" />
//                         <span className="font-medium">Check-out</span>
//                       </div>
//                       <p className="text-gray-800 font-medium">
//                         {travel.checkoutTime
//                           ? formatDate(travel.checkoutTime)
//                           : "Not checked out"}
//                       </p>
//                     </div>
//                   </div>

//                   {/* Duration */}
//                   {travel.checkoutTime && (
//                     <div className="mt-3 pt-3 border-t border-gray-100">
//                       <div className="flex items-center justify-between">
//                         <span className="text-xs text-gray-600">Duration</span>
//                         <span className="text-sm font-semibold text-purple-600">
//                           {calculateDuration(
//                             travel.checkinTime,
//                             travel.checkoutTime
//                           )}
//                         </span>
//                       </div>
//                     </div>
//                   )}
//                 </div>

//                 {/* Expanded Details */}
//                 {expandedItems[travel.id] && (
//                   <div className="bg-gray-50 border-t border-gray-200 p-4 space-y-3">
//                     {/* Location Details */}
//                     <div className="grid grid-cols-2 gap-3 text-xs">
//                       <div>
//                         <p className="text-gray-600 mb-1">Check-in Location</p>
//                         <p className="font-mono text-gray-800">
//                           {travel.checkinLatitude}, {travel.checkinLongitude}
//                         </p>
//                       </div>
//                       {travel.checkoutLatitude && (
//                         <div>
//                           <p className="text-gray-600 mb-1">
//                             Check-out Location
//                           </p>
//                           <p className="font-mono text-gray-800">
//                             {travel.checkoutLatitude},{" "}
//                             {travel.checkoutLongitude}
//                           </p>
//                         </div>
//                       )}
//                     </div>

//                     {/* Form Details */}
//                     {travel.formDetail && (
//                       <div className="space-y-2">
//                         <div className="flex items-center space-x-2">
//                           <FileText className="h-4 w-4 text-blue-600" />
//                           <span className="text-sm font-medium text-gray-800">
//                             Form Details
//                           </span>
//                         </div>

//                         <div className="bg-white rounded-lg p-3 space-y-2">
//                           <div className="grid grid-cols-2 gap-2 text-xs">
//                             <div>
//                               <span className="text-gray-600">Farm ID:</span>
//                               <span className="ml-1 font-medium">
//                                 {travel.formDetail.FarmId}
//                               </span>
//                             </div>
//                             <div>
//                               <span className="text-gray-600">
//                                 Location ID:
//                               </span>
//                               <span className="ml-1 font-medium">
//                                 {travel.formDetail.LocationId}
//                               </span>
//                             </div>
//                           </div>

//                           {travel.formDetail.remark && (
//                             <div>
//                               <p className="text-gray-600 text-xs mb-1">
//                                 Remark:
//                               </p>
//                               <p className="text-gray-800 text-xs bg-gray-50 p-2 rounded">
//                                 {travel.formDetail.remark}
//                               </p>
//                             </div>
//                           )}
//                         </div>
//                       </div>
//                     )}

//                     {/* Status */}
//                     <div className="flex items-center justify-between pt-2 border-t border-gray-200">
//                       <span className="text-xs text-gray-600">Status</span>
//                       <div
//                         className={`flex items-center text-xs px-2 py-1 rounded-full ${
//                           travel.checkoutTime
//                             ? "bg-green-100 text-green-800"
//                             : "bg-yellow-100 text-yellow-800"
//                         }`}
//                       >
//                         <CheckCircle className="h-3 w-3 mr-1" />
//                         {travel.checkoutTime ? "Completed" : "In Progress"}
//                       </div>
//                     </div>
//                   </div>
//                 )}
//               </div>
//             ))
//           ) : (
//             <div className="text-center py-12">
//               <Activity className="h-12 w-12 text-gray-400 mx-auto mb-4" />
//               <p className="text-gray-600 text-lg font-medium">
//                 No travel history found
//               </p>
//               <p className="text-gray-500 text-sm">
//                 Your completed visits will appear here
//               </p>
//             </div>
//           )}
//         </div>

//         {/* Pagination */}
//         {pagination.totalPages > 1 && (
//           <div className="p-4 border-t border-gray-200 bg-gray-50">
//             <div className="flex justify-between items-center text-sm">
//               <span className="text-gray-600">
//                 Page {pagination.currentPage} of {pagination.totalPages}
//               </span>
//               <span className="text-gray-600">
//                 {pagination.totalRecords} total records
//               </span>
//             </div>
//           </div>
//         )}
//       </div>

//       {/* Detailed Modal */}
//       {selectedTravel && (
//         <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
//           <div className="bg-white rounded-xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
//             <div className="sticky top-0 bg-white border-b border-gray-200 p-4">
//               <div className="flex justify-between items-center">
//                 <h3 className="text-lg font-semibold text-gray-800">
//                   Travel Details #{selectedTravel.id}
//                 </h3>
//                 <button
//                   onClick={() => setSelectedTravel(null)}
//                   className="text-gray-500 hover:text-gray-700"
//                 >
//                   <X className="h-5 w-5" />
//                 </button>
//               </div>
//             </div>

//             <div className="p-6 space-y-6">
//               {/* Time Details */}
//               <div className="space-y-4">
//                 <h4 className="font-medium text-gray-800 flex items-center">
//                   <Clock className="h-4 w-4 mr-2" />
//                   Time Information
//                 </h4>

//                 <div className="bg-gray-50 rounded-lg p-4 space-y-3">
//                   <div className="grid grid-cols-1 gap-3">
//                     <div>
//                       <p className="text-sm text-gray-600">Check-in Time</p>
//                       <p className="font-medium">
//                         {formatDate(selectedTravel.checkinTime)}
//                       </p>
//                     </div>

//                     {selectedTravel.checkoutTime && (
//                       <>
//                         <div>
//                           <p className="text-sm text-gray-600">
//                             Check-out Time
//                           </p>
//                           <p className="font-medium">
//                             {formatDate(selectedTravel.checkoutTime)}
//                           </p>
//                         </div>

//                         <div>
//                           <p className="text-sm text-gray-600">
//                             Total Duration
//                           </p>
//                           <p className="font-medium text-purple-600">
//                             {calculateDuration(
//                               selectedTravel.checkinTime,
//                               selectedTravel.checkoutTime
//                             )}
//                           </p>
//                         </div>
//                       </>
//                     )}
//                   </div>
//                 </div>
//               </div>

//               {/* Location Details */}
//               <div className="space-y-4">
//                 <h4 className="font-medium text-gray-800 flex items-center">
//                   <MapPin className="h-4 w-4 mr-2" />
//                   Location Information
//                 </h4>

//                 <div className="bg-gray-50 rounded-lg p-4 space-y-3">
//                   <div>
//                     <p className="text-sm text-gray-600">
//                       Check-in Coordinates
//                     </p>
//                     <p className="font-mono text-sm">
//                       {selectedTravel.checkinLatitude},{" "}
//                       {selectedTravel.checkinLongitude}
//                     </p>
//                   </div>

//                   {selectedTravel.checkoutLatitude && (
//                     <div>
//                       <p className="text-sm text-gray-600">
//                         Check-out Coordinates
//                       </p>
//                       <p className="font-mono text-sm">
//                         {selectedTravel.checkoutLatitude},{" "}
//                         {selectedTravel.checkoutLongitude}
//                       </p>
//                     </div>
//                   )}
//                 </div>
//               </div>

//               {/* Form Details */}
//               {selectedTravel.formDetail && (
//                 <div className="space-y-4">
//                   <h4 className="font-medium text-gray-800 flex items-center">
//                     <FileText className="h-4 w-4 mr-2" />
//                     Form Information
//                   </h4>

//                   <div className="bg-gray-50 rounded-lg p-4 space-y-4">
//                     <div className="grid grid-cols-2 gap-4">
//                       <div>
//                         <p className="text-sm text-gray-600">Farm ID</p>
//                         <p className="font-medium">
//                           {selectedTravel.formDetail.FarmId}
//                         </p>
//                       </div>
//                       <div>
//                         <p className="text-sm text-gray-600">Location ID</p>
//                         <p className="font-medium">
//                           {selectedTravel.formDetail.LocationId}
//                         </p>
//                       </div>
//                     </div>

//                     {selectedTravel.formDetail.remark && (
//                       <div>
//                         <p className="text-sm text-gray-600 mb-2">Remark</p>
//                         <p className="text-sm bg-white p-3 rounded border">
//                           {selectedTravel.formDetail.remark}
//                         </p>
//                       </div>
//                     )}

//                     {/* Categories and Subcategories */}
//                     {selectedTravel.formDetail.FormDetail?.categories && (
//                       <div>
//                         <p className="text-sm text-gray-600 mb-3">
//                           Categories & Observations
//                         </p>
//                         <div className="space-y-3">
//                           {selectedTravel.formDetail.FormDetail.categories.map(
//                             (category) => (
//                               <div
//                                 key={category.id}
//                                 className="bg-white rounded border p-3"
//                               >
//                                 <h5 className="font-medium text-sm text-gray-800 mb-2">
//                                   {category.CategoryName}
//                                 </h5>

//                                 {category.subcategories &&
//                                   category.subcategories.length > 0 && (
//                                     <div className="space-y-2">
//                                       {category.subcategories.map((sub) => (
//                                         <div
//                                           key={sub.id}
//                                           className="bg-gray-50 rounded p-2"
//                                         >
//                                           <div className="flex justify-between items-start mb-1">
//                                             <span className="text-xs font-medium text-gray-700">
//                                               {sub.SubCategoryName}
//                                             </span>
//                                             <span
//                                               className={`text-xs px-2 py-1 rounded-full ${
//                                                 sub.status === "Completed"
//                                                   ? "bg-green-100 text-green-800"
//                                                   : "bg-yellow-100 text-yellow-800"
//                                               }`}
//                                             >
//                                               {sub.status}
//                                             </span>
//                                           </div>
//                                           {sub.observation && (
//                                             <p className="text-xs text-gray-600 mt-1">
//                                               {sub.observation}
//                                             </p>
//                                           )}
//                                         </div>
//                                       ))}
//                                     </div>
//                                   )}
//                               </div>
//                             )
//                           )}
//                         </div>
//                       </div>
//                     )}
//                   </div>
//                 </div>
//               )}
//             </div>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// };

// export default TravelHistory;

// import React, { useState, useEffect } from "react";
// import {
//   Clock,
//   MapPin,
//   User,
//   Calendar,
//   CheckCircle,
//   ArrowLeft,
//   Eye,
//   X,
//   ChevronDown,
//   ChevronUp,
//   FileText,
//   Activity,
//   Image as ImageIcon,
//   ExternalLink,
// } from "lucide-react";
// import { Link } from "react-router-dom";
// import { useSelector } from "react-redux";
// import axiosInstance from "../../library/axios";
// import { useNavigate } from "react-router-dom";

// const TravelHistory = () => {
//   const [travels, setTravels] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState(null);
//   const [selectedTravel, setSelectedTravel] = useState(null);
//   const [expandedItems, setExpandedItems] = useState({});
//   const [pagination, setPagination] = useState({});
//   const [currentPage, setCurrentPage] = useState(1);
//   const [limit] = useState(10);
//   const [formDetails, setFormDetails] = useState(null);
//   const [formLoading, setFormLoading] = useState(false);
//   const [viewImage, setViewImage] = useState(null);

//   const user = useSelector((state) => state.user.user);
//   const employeeId = user.EmployeeId;
//   const navigate = useNavigate();

//   // Fetch travel history
//   const fetchTravelHistory = async (page = 1) => {
//     try {
//       setLoading(true);

//       const response = await axiosInstance.get(
//         `/doctor/daily-travel-info?page=${page}&limit=${limit}&EmployeeId=${employeeId}&startDate=&endDate=`
//       );
//       const result = response.data;

//       if (result.success && result.data) {
//         setTravels(result.data.travels || []);
//         setPagination(result.data.pagination || {});
//         setCurrentPage(page);
//       } else {
//         setTravels([]);
//       }
//     } catch (err) {
//       console.error("Error fetching travel history:", err);
//       setError("Failed to fetch travel history");
//       setTravels([]);
//     } finally {
//       setLoading(false);
//     }
//   };

//   // Fetch form details
//   const fetchFormDetails = async (formDetailId) => {
//     try {
//       setFormLoading(true);

//       const response = await axiosInstance.get(
//         `/doctor/form-details?id=${formDetailId}&EmployeeId=${employeeId}`
//       );
//       const result = response.data;

//       if (result.success && result.data && result.data.length > 0) {
//         setFormDetails(result.data[0]);
//       } else {
//         setFormDetails(null);
//       }
//     } catch (err) {
//       console.error("Error fetching form details:", err);
//       setFormDetails(null);
//     } finally {
//       setFormLoading(false);
//     }
//   };

//   useEffect(() => {
//     fetchTravelHistory();
//   }, []);

//   // Format date for display
//   const formatDate = (dateString) => {
//     if (!dateString) return "N/A";
//     return new Date(dateString).toLocaleString("en-IN", {
//       year: "numeric",
//       month: "short",
//       day: "numeric",
//       hour: "2-digit",
//       minute: "2-digit",
//     });
//   };

//   // Toggle expanded view for travel item
//   const toggleExpanded = (travelId) => {
//     setExpandedItems((prev) => ({
//       ...prev,
//       [travelId]: !prev[travelId],
//     }));
//   };

//   // Show detailed modal for travel
//   const showTravelDetails = (travel) => {
//     setSelectedTravel(travel);
//     if (travel.formDetail && travel.formDetail.id) {
//       fetchFormDetails(travel.formDetail.id);
//     }
//   };

//   // Handle pagination
//   const handlePageChange = (page) => {
//     fetchTravelHistory(page);
//   };

//   // Get status color based on status
//   const getStatusColor = (status) => {
//     switch (status?.toLowerCase()) {
//       case "completed":
//         return "bg-green-100 text-green-800";
//       case "pending":
//         return "bg-yellow-100 text-yellow-800";
//       case "failed":
//         return "bg-red-100 text-red-800";
//       default:
//         return "bg-gray-100 text-gray-800";
//     }
//   };

//   // Open image in full view
//   const openImageView = (imageUrl) => {
//     setViewImage(imageUrl);
//   };

//   // Close image view
//   const closeImageView = () => {
//     setViewImage(null);
//   };
//   // Calculate duration between checkin and checkout
//   const calculateDuration = (checkin, checkout) => {
//     if (!checkin || !checkout) return "N/A";

//     const checkinTime = new Date(checkin);
//     const checkoutTime = new Date(checkout);
//     const diffMs = checkoutTime - checkinTime;

//     const hours = Math.floor(diffMs / (1000 * 60 * 60));
//     const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));

//     return `${hours}h ${minutes}m`;
//   };

//   if (loading) {
//     return (
//       <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
//         <div className="text-center">
//           <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
//           <p className="text-gray-600">Loading travel history...</p>
//         </div>
//       </div>
//     );
//   }

//   if (error) {
//     return (
//       <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
//         <div className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-md">
//           <div className="flex items-center">
//             <X className="h-5 w-5 text-red-500 mr-2" />
//             <p className="text-red-700">{error}</p>
//           </div>
//           <button
//             onClick={() => fetchTravelHistory(currentPage)}
//             className="mt-4 bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 transition-colors"
//           >
//             Retry
//           </button>
//         </div>
//       </div>
//     );
//   }

//   return (
//     <div className="">
//       <div className="mx-auto">
//         {/* Header */}
//         <div className="bg-gradient-to-r from-green-700 to-green-800 px-6 py-4 rounded-lg">
//           <div className="flex justify-between items-start">
//             <div>
//               <h1 className="text-xl font-bold text-white">Travel History</h1>
//               <p className="text-white text-sm mt-1">Complete visit records</p>
//             </div>
//             <div className="text-right">
//               <button
//                 onClick={() => navigate("/dashboard/location-selector")}
//                 disabled={!travels.every((travel) => travel.checkoutTime)}
//                 className={`text-sm transition-colors mb-1 border rounded-lg px-2 py-1 m-1 block ${
//                   travels.every((travel) => travel.checkoutTime)
//                     ? "text-white border-white hover:bg-white hover:bg-opacity-10"
//                     : "text-gray-300 border-gray-300 cursor-not-allowed"
//                 }`}
//               >
//                 {travels.every((travel) => travel.checkoutTime)
//                   ? "Check-in"
//                   : "Checkout Pending"}
//               </button>
//             </div>
//           </div>
//         </div>

//         {/* User Info */}
//         <div className="bg-gray-50 px-4 py-3 border-b">
//           <div className="flex items-center justify-between">
//             <div className="flex items-center">
//               <User className="h-4 w-4 text-blue-600 mr-2" />
//               <div>
//                 <p className="text-gray-600 text-xs">Doctor</p>
//                 <p className="font-medium text-gray-900 text-sm">
//                   {user?.EmployeeName}
//                 </p>
//               </div>
//             </div>
//             <div className="text-right">
//               <p className="text-gray-600 text-xs">
//                 Total Visits: {pagination.totalRecords || 0}
//               </p>
//             </div>
//           </div>
//         </div>

//         {/* Travel List */}
//         <div className="p-4 space-y-4">
//           {travels.length > 0 ? (
//             travels.map((travel) => (
//               <div
//                 key={travel.id}
//                 className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden"
//               >
//                 {/* Travel Header */}
//                 <div className="p-4">
//                   <div className="flex justify-between items-start mb-3">
//                     <div className="flex items-center space-x-2">
//                       <div className="bg-blue-100 rounded-full p-2">
//                         <MapPin className="h-4 w-4 text-blue-600" />
//                       </div>
//                       <div>
//                         {travel.formDetail && (
//                           <div>
//                             <p className="font-semibold text-gray-500">
//                               {travel.formDetail.DocLocation?.LocationName ||
//                                 "Unknown Location"}
//                             </p>
//                             <p className="text-xs text-gray-800">
//                               {travel.formDetail.DocFarm?.FarmName ||
//                                 "IB Group"}
//                             </p>
//                           </div>
//                         )}
//                       </div>
//                     </div>
//                     <div className="flex space-x-2">
//                       <button
//                         onClick={() => showTravelDetails(travel)}
//                         className="p-1 text-blue-600 hover:bg-blue-50 rounded"
//                       >
//                         <Eye className="h-4 w-4" />
//                       </button>
//                       <button
//                         onClick={() => toggleExpanded(travel.id)}
//                         className="p-1 text-gray-600 hover:bg-gray-50 rounded"
//                       >
//                         {expandedItems[travel.id] ? (
//                           <ChevronUp className="h-4 w-4" />
//                         ) : (
//                           <ChevronDown className="h-4 w-4" />
//                         )}
//                       </button>
//                       {!travel.checkoutTime && (
//                         <button
//                           onClick={() => navigate("/dashboard/checkin")}
//                           className="text-black text-sm transition-colors mb-1 border border-black rounded-lg px-2 py-1 m-1 block"
//                         >
//                           View
//                         </button>
//                       )}
//                     </div>
//                   </div>
//                   {/* Travel Info */}
//                   <div className="grid grid-cols-2 gap-3 text-xs">
//                     <div className="flex items-center">
//                       <Calendar className="h-3 w-3 text-gray-500 mr-1" />
//                       <span className="text-gray-500">Check-in:</span>
//                       <span className="ml-1 font-medium">
//                         {formatDate(travel.checkinTime)}
//                       </span>
//                     </div>
//                     <div className="flex items-center">
//                       <Calendar className="h-3 w-3 text-gray-500 mr-1" />
//                       <span className="text-gray-500">Check-out:</span>
//                       <span className="ml-1 font-medium">
//                         {travel.checkoutTime
//                           ? formatDate(travel.checkoutTime)
//                           : "Pending"}
//                       </span>
//                     </div>
//                     <div className="flex items-center">
//                       <Clock className="h-3 w-3 text-gray-500 mr-1" />
//                       <span className="text-gray-500">Duration:</span>
//                       <span className="ml-1 font-medium">
//                         {calculateDuration(
//                           travel.checkinTime,
//                           travel.checkoutTime
//                         )}
//                       </span>
//                     </div>
//                     <div className="flex items-center">
//                       <Activity className="h-3 w-3 text-gray-500 mr-1" />
//                       <span className="text-gray-500">Status:</span>
//                       <span
//                         className={`ml-1 px-2 py-0.5 rounded-full text-xs ${getStatusColor(
//                           travel.checkoutTime ? "completed" : "pending"
//                         )}`}
//                       >
//                         {travel.checkoutTime ? "Completed" : "Pending"}
//                       </span>
//                     </div>
//                   </div>
//                 </div>

//                 {/* Expanded Content */}
//                 {expandedItems[travel.id] && (
//                   <div className="border-t border-gray-100 p-4 bg-gray-50">
//                     <div className="space-y-3">
//                       {/* Location Details */}
//                       <div>
//                         <h4 className="text-sm font-medium text-gray-700 mb-2">
//                           Location Details
//                         </h4>
//                         <div className="grid grid-cols-2 gap-2 text-xs">
//                           <div>
//                             <p className="text-gray-500">Check-in Location:</p>
//                             <p className="font-medium">
//                               {travel.checkinLatitude && travel.checkinLongitude
//                                 ? `${travel.checkinLatitude}, ${travel.checkinLongitude}`
//                                 : "Not recorded"}
//                             </p>
//                           </div>
//                           <div>
//                             <p className="text-gray-500">Check-out Location:</p>
//                             <p className="font-medium">
//                               {travel.checkoutLatitude &&
//                               travel.checkoutLongitude
//                                 ? `${travel.checkoutLatitude}, ${travel.checkoutLongitude}`
//                                 : "Not recorded"}
//                             </p>
//                           </div>
//                         </div>
//                       </div>

//                       {/* Form Details */}
//                       {travel.formDetail && (
//                         <div>
//                           <h4 className="text-sm font-medium text-gray-700 mb-2">
//                             Form Details
//                           </h4>
//                           <div className="grid grid-cols-2 gap-2 text-xs">
//                             <div>
//                               <p className="text-gray-500">Form ID:</p>
//                               <p className="font-medium">
//                                 {travel.formDetail.id || "N/A"}
//                               </p>
//                             </div>
//                             <div>
//                               <p className="text-gray-500">Submission Date:</p>
//                               <p className="font-medium">
//                                 {travel.formDetail.createdAt
//                                   ? formatDate(travel.formDetail.createdAt)
//                                   : "N/A"}
//                               </p>
//                             </div>
//                             <div className="col-span-2">
//                               <p className="text-gray-500">Remark:</p>
//                               <p className="font-medium">
//                                 {travel.formDetail.remark ||
//                                   "No remarks provided"}
//                               </p>
//                             </div>
//                           </div>
//                           <div className="mt-2">
//                             <button
//                               onClick={() => showTravelDetails(travel)}
//                               className="text-blue-600 text-xs flex items-center hover:underline"
//                             >
//                               <FileText className="h-3 w-3 mr-1" />
//                               View Complete Form
//                             </button>
//                           </div>
//                         </div>
//                       )}

//                       {/* Images Preview */}
//                       {travel.formDetail &&
//                         travel.formDetail.images &&
//                         travel.formDetail.images.length > 0 && (
//                           <div>
//                             <h4 className="text-sm font-medium text-gray-700 mb-2">
//                               Images
//                             </h4>
//                             <div className="flex flex-wrap gap-2">
//                               {travel.formDetail.images.map((image, index) => (
//                                 <div
//                                   key={index}
//                                   className="relative w-16 h-16 rounded-md overflow-hidden border border-gray-200"
//                                 >
//                                   <img
//                                     src={image.imageUrl}
//                                     alt={`Form image ${index + 1}`}
//                                     className="w-full h-full object-cover"
//                                     onClick={() =>
//                                       openImageView(image.imageUrl)
//                                     }
//                                   />
//                                 </div>
//                               ))}
//                             </div>
//                           </div>
//                         )}
//                     </div>
//                   </div>
//                 )}
//               </div>
//             ))
//           ) : (
//             <div className="text-center py-8">
//               <div className="bg-gray-100 rounded-full p-4 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
//                 <Calendar className="h-8 w-8 text-gray-400" />
//               </div>
//               <h3 className="text-gray-700 font-medium mb-1">
//                 No Travel Records
//               </h3>
//               <p className="text-gray-500 text-sm mb-4">
//                 You haven't recorded any travel yet
//               </p>
//               <button
//                 onClick={() => navigate("/dashboard/location-selector")}
//                 className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
//               >
//                 Start New Visit
//               </button>
//             </div>
//           )}

//           {/* Pagination */}
//           {pagination && pagination.totalPages > 1 && (
//             <div className="flex justify-center mt-6">
//               <div className="flex space-x-1">
//                 <button
//                   onClick={() => handlePageChange(1)}
//                   disabled={currentPage === 1}
//                   className={`px-3 py-1 rounded ${
//                     currentPage === 1
//                       ? "bg-gray-100 text-gray-400"
//                       : "bg-gray-200 text-gray-700 hover:bg-gray-300"
//                   }`}
//                 >
//                   First
//                 </button>
//                 <button
//                   onClick={() => handlePageChange(currentPage - 1)}
//                   disabled={currentPage === 1}
//                   className={`px-3 py-1 rounded ${
//                     currentPage === 1
//                       ? "bg-gray-100 text-gray-400"
//                       : "bg-gray-200 text-gray-700 hover:bg-gray-300"
//                   }`}
//                 >
//                   Prev
//                 </button>
//                 <div className="px-3 py-1 bg-blue-600 text-white rounded">
//                   {currentPage}
//                 </div>
//                 <button
//                   onClick={() => handlePageChange(currentPage + 1)}
//                   disabled={currentPage === pagination.totalPages}
//                   className={`px-3 py-1 rounded ${
//                     currentPage === pagination.totalPages
//                       ? "bg-gray-100 text-gray-400"
//                       : "bg-gray-200 text-gray-700 hover:bg-gray-300"
//                   }`}
//                 >
//                   Next
//                 </button>
//                 <button
//                   onClick={() => handlePageChange(pagination.totalPages)}
//                   disabled={currentPage === pagination.totalPages}
//                   className={`px-3 py-1 rounded ${
//                     currentPage === pagination.totalPages
//                       ? "bg-gray-100 text-gray-400"
//                       : "bg-gray-200 text-gray-700 hover:bg-gray-300"
//                   }`}
//                 >
//                   Last
//                 </button>
//               </div>
//             </div>
//           )}
//         </div>
//       </div>

//       {/* Travel Detail Modal */}
//       {selectedTravel && (
//         <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
//           <div className="bg-white rounded-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
//             <div className="sticky top-0 bg-white p-4 border-b flex justify-between items-center">
//               <h3 className="font-semibold text-lg">Travel Details</h3>
//               <button
//                 onClick={() => {
//                   setSelectedTravel(null);
//                   setFormDetails(null);
//                 }}
//                 className="p-1 rounded-full hover:bg-gray-100"
//               >
//                 <X className="h-5 w-5" />
//               </button>
//             </div>
//             <div className="p-4 space-y-4">
//               {/* Basic Travel Info */}
//               <div className="bg-blue-50 p-3 rounded-lg">
//                 <div className="grid grid-cols-2 gap-3 text-sm">
//                   <div>
//                     <p className="text-gray-500 text-xs">Check-in Time</p>
//                     <p className="font-medium">
//                       {formatDate(selectedTravel.checkinTime)}
//                     </p>
//                   </div>
//                   <div>
//                     <p className="text-gray-500 text-xs">Check-out Time</p>
//                     <p className="font-medium">
//                       {selectedTravel.checkoutTime
//                         ? formatDate(selectedTravel.checkoutTime)
//                         : "Pending"}
//                     </p>
//                   </div>
//                   <div>
//                     <p className="text-gray-500 text-xs">Duration</p>
//                     <p className="font-medium">
//                       {calculateDuration(
//                         selectedTravel.checkinTime,
//                         selectedTravel.checkoutTime
//                       )}
//                     </p>
//                   </div>
//                   <div>
//                     <p className="text-gray-500 text-xs">Status</p>
//                     <span
//                       className={`px-2 py-0.5 rounded-full text-xs ${getStatusColor(
//                         selectedTravel.checkoutTime ? "completed" : "pending"
//                       )}`}
//                     >
//                       {selectedTravel.checkoutTime ? "Completed" : "Pending"}
//                     </span>
//                   </div>
//                 </div>
//               </div>

//               {/* Location Info */}
//               <div>
//                 <h4 className="font-medium text-gray-800 mb-2">Location</h4>
//                 <div className="bg-gray-50 p-3 rounded-lg">
//                   <div className="grid grid-cols-1 gap-3 text-sm">
//                     <div>
//                       <p className="text-gray-500 text-xs">Farm</p>
//                       <p className="font-medium">
//                         {selectedTravel.formDetail?.DocFarm?.FarmName || "N/A"}
//                       </p>
//                     </div>
//                     <div>
//                       <p className="text-gray-500 text-xs">Location</p>
//                       <p className="font-medium">
//                         {selectedTravel.formDetail?.DocLocation?.LocationName ||
//                           "N/A"}
//                       </p>
//                     </div>
//                     <div>
//                       <p className="text-gray-500 text-xs">
//                         Check-in Coordinates
//                       </p>
//                       <p className="font-medium">
//                         {selectedTravel.checkinLatitude &&
//                         selectedTravel.checkinLongitude
//                           ? `${selectedTravel.checkinLatitude}, ${selectedTravel.checkinLongitude}`
//                           : "Not recorded"}
//                       </p>
//                     </div>
//                     <div>
//                       <p className="text-gray-500 text-xs">
//                         Check-out Coordinates
//                       </p>
//                       <p className="font-medium">
//                         {selectedTravel.checkoutLatitude &&
//                         selectedTravel.checkoutLongitude
//                           ? `${selectedTravel.checkoutLatitude}, ${selectedTravel.checkoutLongitude}`
//                           : "Not recorded"}
//                       </p>
//                     </div>
//                   </div>
//                 </div>
//               </div>

//               {/* Form Details */}
//               {formLoading ? (
//                 <div className="text-center py-4">
//                   <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mx-auto"></div>
//                   <p className="text-gray-500 text-sm mt-2">
//                     Loading form details...
//                   </p>
//                 </div>
//               ) : formDetails ? (
//                 <div>
//                   <h4 className="font-medium text-gray-800 mb-2">
//                     Form Details
//                   </h4>
//                   <div className="bg-gray-50 p-3 rounded-lg">
//                     <div className="space-y-3 text-sm">
//                       <div>
//                         <p className="text-gray-500 text-xs">Form ID</p>
//                         <p className="font-medium">{formDetails.id}</p>
//                       </div>
//                       <div>
//                         <p className="text-gray-500 text-xs">Submission Date</p>
//                         <p className="font-medium">
//                           {formatDate(formDetails.createdAt)}
//                         </p>
//                       </div>
//                       <div>
//                         <p className="text-gray-500 text-xs">Remark</p>
//                         <p className="font-medium">
//                           {formDetails.remark || "No remarks provided"}
//                         </p>
//                       </div>

//                       {/* Form Images */}
//                       {formDetails.images && formDetails.images.length > 0 && (
//                         <div>
//                           <p className="text-gray-500 text-xs mb-2">Images</p>
//                           <div className="grid grid-cols-3 gap-2">
//                             {formDetails.images.map((image, index) => (
//                               <div
//                                 key={index}
//                                 className="relative aspect-square rounded-md overflow-hidden border border-gray-200"
//                               >
//                                 <img
//                                   src={image.imageUrl}
//                                   alt={`Form image ${index + 1}`}
//                                   className="w-full h-full object-cover"
//                                   onClick={() => openImageView(image.imageUrl)}
//                                 />
//                               </div>
//                             ))}
//                           </div>
//                         </div>
//                       )}
//                     </div>
//                   </div>
//                 </div>
//               ) : (
//                 <div className="text-center py-4">
//                   <p className="text-gray-500">No form details available</p>
//                 </div>
//               )}
//             </div>
//           </div>
//         </div>
//       )}

//       {/* Image Viewer */}
//       {viewImage && (
//         <div className="fixed inset-0 bg-black bg-opacity-90 z-50 flex items-center justify-center p-4">
//           <button
//             onClick={closeImageView}
//             className="absolute top-4 right-4 text-white p-2 rounded-full bg-black bg-opacity-50 hover:bg-opacity-70"
//           >
//             <X className="h-6 w-6" />
//           </button>
//           <img
//             src={viewImage}
//             alt="Full size"
//             className="max-w-full max-h-[90vh] object-contain"
//           />
//           <a
//             href={viewImage}
//             target="_blank"
//             rel="noopener noreferrer"
//             className="absolute bottom-4 right-4 text-white p-2 rounded-full bg-black bg-opacity-50 hover:bg-opacity-70"
//           >
//             <ExternalLink className="h-5 w-5" />
//           </a>
//         </div>
//       )}
//     </div>
//   );
// };

// export default TravelHistory;

// import React, { useState, useEffect } from "react";
// import {
//   Clock,
//   MapPin,
//   User,
//   Calendar,
//   CheckCircle,
//   ArrowLeft,
//   Eye,
//   X,
//   ChevronDown,
//   ChevronUp,
//   FileText,
//   Activity,
//   Image as ImageIcon,
//   ExternalLink,
//   Mail,
//   AlertCircle,
//   Tag,
// } from "lucide-react";
// import { Link } from "react-router-dom";
// import { useSelector } from "react-redux";
// import axiosInstance from "../../library/axios";
// import { useNavigate } from "react-router-dom";

// const TravelHistory = () => {
//   const [travels, setTravels] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState(null);
//   const [selectedTravel, setSelectedTravel] = useState(null);
//   const [expandedItems, setExpandedItems] = useState({});
//   const [pagination, setPagination] = useState({});
//   const [currentPage, setCurrentPage] = useState(1);
//   const [limit] = useState(10);
//   const [viewImage, setViewImage] = useState(null);

//   const user = useSelector((state) => state.user.user);
//   const employeeId = user.EmployeeId;
//   const navigate = useNavigate();

//   // Fetch travel history with form details
//   const fetchTravelHistory = async (page = 1) => {
//     try {
//       setLoading(true);

//       const response = await axiosInstance.get(
//         `/doctor/form-details-with-travel-info?EmployeeId=${employeeId}&page=${page}&limit=${limit}`
//       );
//       const result = response.data;

//       if (result.success && result.data) {
//         setTravels(result.data || []);
//         setPagination(result.pagination || {});
//         setCurrentPage(page);
//       } else {
//         setTravels([]);
//       }
//     } catch (err) {
//       console.error("Error fetching travel history:", err);
//       setError("Failed to fetch travel history");
//       setTravels([]);
//     } finally {
//       setLoading(false);
//     }
//   };

//   useEffect(() => {
//     fetchTravelHistory();
//   }, []);

//   // Format date for display
//   const formatDate = (dateString) => {
//     if (!dateString) return "N/A";
//     return new Date(dateString).toLocaleString("en-IN", {
//       year: "numeric",
//       month: "short",
//       day: "numeric",
//       hour: "2-digit",
//       minute: "2-digit",
//     });
//   };

//   // Toggle expanded view for travel item
//   const toggleExpanded = (travelId) => {
//     setExpandedItems((prev) => ({
//       ...prev,
//       [travelId]: !prev[travelId],
//     }));
//   };

//   // Show detailed modal for travel
//   const showTravelDetails = (travel) => {
//     setSelectedTravel(travel);
//   };

//   // Handle pagination
//   const handlePageChange = (page) => {
//     fetchTravelHistory(page);
//   };

//   // Get status color based on status
//   const getStatusColor = (status) => {
//     switch (status?.toLowerCase()) {
//       case "completed":
//         return "bg-green-100 text-green-800";
//       case "pending":
//         return "bg-yellow-100 text-yellow-800";
//       case "failed":
//         return "bg-red-100 text-red-800";
//       default:
//         return "bg-gray-100 text-gray-800";
//     }
//   };

//   // Get category color
//   const getCategoryColor = (categoryName) => {
//     switch (categoryName?.toLowerCase()) {
//       case "tech":
//         return "bg-blue-100 text-blue-800";
//       case "health":
//         return "bg-green-100 text-green-800";
//       case "store":
//         return "bg-purple-100 text-purple-800";
//       default:
//         return "bg-gray-100 text-gray-800";
//     }
//   };

//   // Open image in full view
//   const openImageView = (imageUrl) => {
//     setViewImage(imageUrl);
//   };

//   // Close image view
//   const closeImageView = () => {
//     setViewImage(null);
//   };

//   if (loading) {
//     return (
//       <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
//         <div className="text-center">
//           <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
//           <p className="text-gray-600">Loading travel history...</p>
//         </div>
//       </div>
//     );
//   }

//   if (error) {
//     return (
//       <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
//         <div className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-md">
//           <div className="flex items-center">
//             <X className="h-5 w-5 text-red-500 mr-2" />
//             <p className="text-red-700">{error}</p>
//           </div>
//           <button
//             onClick={() => fetchTravelHistory(currentPage)}
//             className="mt-4 bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 transition-colors"
//           >
//             Retry
//           </button>
//         </div>
//       </div>
//     );
//   }

//   return (
//     <div className="">
//       <div className="mx-auto">
//         {/* Header */}
//         <div className="bg-gradient-to-r from-green-700 to-green-800 px-6 py-4 rounded-lg">
//           <div className="flex justify-between items-start">
//             <div>
//               <h1 className="text-xl font-bold text-white">
//                 Farm Visit History
//               </h1>
//               <p className="text-white text-sm mt-1">
//                 Complete visit records with observations
//               </p>
//             </div>
//             <div className="text-right">
//               <button
//                 onClick={() => navigate("/dashboard/location-selector")}
//                 disabled={
//                   !travels.every((travel) => travel.travelInfo?.checkoutTime)
//                 }
//                 className={`text-sm transition-colors mb-1 border rounded-lg px-2 py-1 m-1 block ${
//                   travels.every((travel) => travel.travelInfo?.checkoutTime)
//                     ? "text-white border-white hover:bg-white hover:bg-opacity-10"
//                     : "text-gray-300 border-gray-300 cursor-not-allowed"
//                 }`}
//               >
//                 {travels.every((travel) => travel.travelInfo?.checkoutTime)
//                   ? "Check-in"
//                   : "Checkout Pending"}
//               </button>
//             </div>
//           </div>
//         </div>

//         {/* User Info */}
//         <div className="bg-gray-50 px-4 py-3 border-b">
//           <div className="flex items-center justify-between">
//             <div className="flex items-center">
//               <User className="h-4 w-4 text-blue-600 mr-2" />
//               <div>
//                 <p className="text-gray-600 text-xs">Doctor</p>
//                 <p className="font-medium text-gray-900 text-sm">
//                   {user?.EmployeeName}
//                 </p>
//               </div>
//             </div>
//             <div className="text-right">
//               <p className="text-gray-600 text-xs">
//                 Total Visits: {pagination.totalCount || 0}
//               </p>
//             </div>
//           </div>
//         </div>

//         {/* Travel List */}
//         <div className="p-4 space-y-4">
//           {travels.length > 0 ? (
//             travels.map((travel) => (
//               <div
//                 key={travel.formDetail?.id || travel.travelInfo?.id}
//                 className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden"
//               >
//                 {/* Travel Header */}
//                 <div className="p-4">
//                   <div className="flex justify-between items-start mb-3">
//                     <div className="flex items-center space-x-2">
//                       <div className="bg-blue-100 rounded-full p-2">
//                         <MapPin className="h-4 w-4 text-blue-600" />
//                       </div>
//                       <div>
//                         <p className="font-semibold text-gray-900">
//                           {travel.formDetail?.DocFarm?.FarmName ||
//                             "Unknown Farm"}
//                         </p>
//                         <p className="text-xs text-gray-600">
//                           {travel.formDetail?.DocLocation?.LocationName ||
//                             "Unknown Location"}
//                         </p>
//                         <p className="text-xs text-gray-500">
//                           {travel.formDetail?.categoryDetails?.length || 0}{" "}
//                           observations
//                         </p>
//                       </div>
//                     </div>
//                     <div className="flex space-x-2">
//                       <button
//                         onClick={() => showTravelDetails(travel)}
//                         className="p-1 text-blue-600 hover:bg-blue-50 rounded"
//                       >
//                         <Eye className="h-4 w-4" />
//                       </button>
//                       <button
//                         onClick={() =>
//                           toggleExpanded(
//                             travel.formDetail?.id || travel.travelInfo?.id
//                           )
//                         }
//                         className="p-1 text-gray-600 hover:bg-gray-50 rounded"
//                       >
//                         {expandedItems[
//                           travel.formDetail?.id || travel.travelInfo?.id
//                         ] ? (
//                           <ChevronUp className="h-4 w-4" />
//                         ) : (
//                           <ChevronDown className="h-4 w-4" />
//                         )}
//                       </button>
//                       {!travel.travelInfo?.checkoutTime && (
//                         <button
//                           onClick={() => navigate("/dashboard/checkin")}
//                           className="text-black text-sm transition-colors mb-1 border border-black rounded-lg px-2 py-1 m-1 block"
//                         >
//                           View
//                         </button>
//                       )}
//                     </div>
//                   </div>

//                   {/* Travel Info */}
//                   <div className="grid grid-cols-2 gap-3 text-xs">
//                     <div className="flex items-center">
//                       <Calendar className="h-3 w-3 text-gray-500 mr-1" />
//                       <span className="text-gray-500">Check-in:</span>
//                       <span className="ml-1 font-medium">
//                         {formatDate(travel.travelInfo?.checkinTime)}
//                       </span>
//                     </div>
//                     <div className="flex items-center">
//                       <Calendar className="h-3 w-3 text-gray-500 mr-1" />
//                       <span className="text-gray-500">Check-out:</span>
//                       <span className="ml-1 font-medium">
//                         {travel.travelInfo?.checkoutTime
//                           ? formatDate(travel.travelInfo.checkoutTime)
//                           : "Pending"}
//                       </span>
//                     </div>
//                     <div className="flex items-center">
//                       <Clock className="h-3 w-3 text-gray-500 mr-1" />
//                       <span className="text-gray-500">Duration:</span>
//                       <span className="ml-1 font-medium">
//                         {travel.travelInfo?.totalTime || "N/A"}
//                       </span>
//                     </div>
//                     <div className="flex items-center">
//                       <Activity className="h-3 w-3 text-gray-500 mr-1" />
//                       <span className="text-gray-500">Status:</span>
//                       <span
//                         className={`ml-1 px-2 py-0.5 rounded-full text-xs ${getStatusColor(
//                           travel.travelInfo?.checkoutTime
//                             ? "completed"
//                             : "pending"
//                         )}`}
//                       >
//                         {travel.travelInfo?.checkoutTime
//                           ? "Completed"
//                           : "Pending"}
//                       </span>
//                     </div>
//                   </div>

//                   {/* Observations Summary */}
//                   {travel.formDetail?.categoryDetails &&
//                     travel.formDetail.categoryDetails.length > 0 && (
//                       <div className="mt-3 pt-3 border-t border-gray-100">
//                         <div className="flex flex-wrap gap-1">
//                           {Array.from(
//                             new Set(
//                               travel.formDetail.categoryDetails.map(
//                                 (cat) => cat.category?.CategoryName
//                               )
//                             )
//                           )
//                             .filter(Boolean)
//                             .map((categoryName, index) => (
//                               <span
//                                 key={index}
//                                 className={`text-xs px-2 py-1 rounded-full ${getCategoryColor(
//                                   categoryName
//                                 )}`}
//                               >
//                                 {categoryName}
//                               </span>
//                             ))}
//                         </div>
//                       </div>
//                     )}
//                 </div>

//                 {/* Expanded Content */}
//                 {expandedItems[
//                   travel.formDetail?.id || travel.travelInfo?.id
//                 ] && (
//                   <div className="border-t border-gray-100 p-4 bg-gray-50">
//                     <div className="space-y-4">
//                       {/* Location Details */}
//                       <div>
//                         <h4 className="text-sm font-medium text-gray-700 mb-2">
//                           Location Details
//                         </h4>
//                         <div className="grid grid-cols-2 gap-2 text-xs">
//                           <div>
//                             <p className="text-gray-500">Check-in Location:</p>
//                             <p className="font-medium">
//                               {travel.travelInfo?.checkinLatitude &&
//                               travel.travelInfo?.checkinLongitude
//                                 ? `${travel.travelInfo.checkinLatitude}, ${travel.travelInfo.checkinLongitude}`
//                                 : "Not recorded"}
//                             </p>
//                           </div>
//                           <div>
//                             <p className="text-gray-500">Check-out Location:</p>
//                             <p className="font-medium">
//                               {travel.travelInfo?.checkoutLatitude &&
//                               travel.travelInfo?.checkoutLongitude
//                                 ? `${travel.travelInfo.checkoutLatitude}, ${travel.travelInfo.checkoutLongitude}`
//                                 : "Not recorded"}
//                             </p>
//                           </div>
//                         </div>
//                       </div>

//                       {/* Form Details */}
//                       {travel.formDetail && (
//                         <div>
//                           <h4 className="text-sm font-medium text-gray-700 mb-2">
//                             Form Details
//                           </h4>
//                           <div className="bg-white p-3 rounded-lg border">
//                             <div className="grid grid-cols-2 gap-2 text-xs mb-3">
//                               <div>
//                                 <p className="text-gray-500">Form ID:</p>
//                                 <p className="font-medium">
//                                   {travel.formDetail.id}
//                                 </p>
//                               </div>
//                               <div>
//                                 <p className="text-gray-500">
//                                   Submission Date:
//                                 </p>
//                                 <p className="font-medium">
//                                   {formatDate(travel.formDetail.createdAt)}
//                                 </p>
//                               </div>
//                             </div>
//                             <div className="mb-3">
//                               <p className="text-gray-500 text-xs">Remark:</p>
//                               <p className="font-medium text-sm">
//                                 {travel.formDetail.remark ||
//                                   "No remarks provided"}
//                               </p>
//                             </div>
//                           </div>
//                         </div>
//                       )}

//                       {/* Category Details (Observations) */}
//                       {travel.formDetail?.categoryDetails &&
//                         travel.formDetail.categoryDetails.length > 0 && (
//                           <div>
//                             <h4 className="text-sm font-medium text-gray-700 mb-2">
//                               Observations (
//                               {travel.formDetail.categoryDetails.length})
//                             </h4>
//                             <div className="space-y-3">
//                               {travel.formDetail.categoryDetails.map(
//                                 (categoryDetail) => (
//                                   <div
//                                     key={categoryDetail.id}
//                                     className="bg-white p-3 rounded-lg border"
//                                   >
//                                     <div className="flex justify-between items-start mb-2">
//                                       <div className="flex items-center space-x-2">
//                                         <span
//                                           className={`text-xs px-2 py-1 rounded-full ${getCategoryColor(
//                                             categoryDetail.category
//                                               ?.CategoryName
//                                           )}`}
//                                         >
//                                           {
//                                             categoryDetail.category
//                                               ?.CategoryName
//                                           }
//                                         </span>
//                                         <span className="text-xs text-gray-500">
//                                           {
//                                             categoryDetail.subcategory
//                                               ?.SubCategoryName
//                                           }
//                                         </span>
//                                       </div>
//                                       <div className="flex items-center space-x-2">
//                                         {categoryDetail.isMailSent && (
//                                           <Mail
//                                             className="h-3 w-3 text-green-500"
//                                             title="Mail sent"
//                                           />
//                                         )}
//                                         <span
//                                           className={`text-xs px-2 py-0.5 rounded-full ${getStatusColor(
//                                             categoryDetail.status
//                                           )}`}
//                                         >
//                                           {categoryDetail.status}
//                                         </span>
//                                       </div>
//                                     </div>
//                                     <p className="text-sm text-gray-700 mb-2">
//                                       {categoryDetail.Observation}
//                                     </p>
//                                     {categoryDetail.Image && (
//                                       <div className="mt-2">
//                                         <div
//                                           className="relative w-20 h-20 rounded-md overflow-hidden border border-gray-200 cursor-pointer hover:opacity-90"
//                                           onClick={() =>
//                                             openImageView(categoryDetail.Image)
//                                           }
//                                         >
//                                           <img
//                                             src={categoryDetail.Image}
//                                             alt="Observation"
//                                             className="w-full h-full object-cover"
//                                           />
//                                           <div className="absolute inset-0 bg-black bg-opacity-0 hover:bg-opacity-10 transition-opacity flex items-center justify-center">
//                                             <Eye className="h-4 w-4 text-white opacity-0 hover:opacity-100" />
//                                           </div>
//                                         </div>
//                                       </div>
//                                     )}
//                                     <div className="mt-2 text-xs text-gray-500">
//                                       Created:{" "}
//                                       {formatDate(categoryDetail.createdAt)}
//                                       {categoryDetail.updatedAt !==
//                                         categoryDetail.createdAt && (
//                                         <span className="ml-2">
//                                           Updated:{" "}
//                                           {formatDate(categoryDetail.updatedAt)}
//                                         </span>
//                                       )}
//                                     </div>
//                                   </div>
//                                 )
//                               )}
//                             </div>
//                           </div>
//                         )}
//                     </div>
//                   </div>
//                 )}
//               </div>
//             ))
//           ) : (
//             <div className="text-center py-8">
//               <div className="bg-gray-100 rounded-full p-4 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
//                 <Calendar className="h-8 w-8 text-gray-400" />
//               </div>
//               <h3 className="text-gray-700 font-medium mb-1">
//                 No Travel Records
//               </h3>
//               <p className="text-gray-500 text-sm mb-4">
//                 You haven't recorded any visits yet
//               </p>
//               <button
//                 onClick={() => navigate("/dashboard/location-selector")}
//                 className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
//               >
//                 Start New Visit
//               </button>
//             </div>
//           )}

//           {/* Pagination */}
//           {pagination && pagination.totalPages > 1 && (
//             <div className="flex justify-center mt-6">
//               <div className="flex space-x-1">
//                 <button
//                   onClick={() => handlePageChange(1)}
//                   disabled={currentPage === 1}
//                   className={`px-3 py-1 rounded ${
//                     currentPage === 1
//                       ? "bg-gray-100 text-gray-400"
//                       : "bg-gray-200 text-gray-700 hover:bg-gray-300"
//                   }`}
//                 >
//                   First
//                 </button>
//                 <button
//                   onClick={() => handlePageChange(currentPage - 1)}
//                   disabled={currentPage === 1}
//                   className={`px-3 py-1 rounded ${
//                     currentPage === 1
//                       ? "bg-gray-100 text-gray-400"
//                       : "bg-gray-200 text-gray-700 hover:bg-gray-300"
//                   }`}
//                 >
//                   Prev
//                 </button>
//                 <div className="px-3 py-1 bg-blue-600 text-white rounded">
//                   {currentPage}
//                 </div>
//                 <button
//                   onClick={() => handlePageChange(currentPage + 1)}
//                   disabled={currentPage === pagination.totalPages}
//                   className={`px-3 py-1 rounded ${
//                     currentPage === pagination.totalPages
//                       ? "bg-gray-100 text-gray-400"
//                       : "bg-gray-200 text-gray-700 hover:bg-gray-300"
//                   }`}
//                 >
//                   Next
//                 </button>
//                 <button
//                   onClick={() => handlePageChange(pagination.totalPages)}
//                   disabled={currentPage === pagination.totalPages}
//                   className={`px-3 py-1 rounded ${
//                     currentPage === pagination.totalPages
//                       ? "bg-gray-100 text-gray-400"
//                       : "bg-gray-200 text-gray-700 hover:bg-gray-300"
//                   }`}
//                 >
//                   Last
//                 </button>
//               </div>
//             </div>
//           )}
//         </div>
//       </div>

//       {/* Travel Detail Modal */}
//       {selectedTravel && (
//         <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
//           <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
//             <div className="sticky top-0 bg-white p-4 border-b flex justify-between items-center">
//               <h3 className="font-semibold text-lg">Visit Details</h3>
//               <button
//                 onClick={() => setSelectedTravel(null)}
//                 className="p-1 rounded-full hover:bg-gray-100"
//               >
//                 <X className="h-5 w-5" />
//               </button>
//             </div>
//             <div className="p-4 space-y-4">
//               {/* Basic Travel Info */}
//               <div className="bg-blue-50 p-4 rounded-lg">
//                 <h4 className="font-medium text-gray-800 mb-3">
//                   Travel Information
//                 </h4>
//                 <div className="grid grid-cols-2 gap-3 text-sm">
//                   <div>
//                     <p className="text-gray-500 text-xs">Check-in Time</p>
//                     <p className="font-medium">
//                       {formatDate(selectedTravel.travelInfo?.checkinTime)}
//                     </p>
//                   </div>
//                   <div>
//                     <p className="text-gray-500 text-xs">Check-out Time</p>
//                     <p className="font-medium">
//                       {selectedTravel.travelInfo?.checkoutTime
//                         ? formatDate(selectedTravel.travelInfo.checkoutTime)
//                         : "Pending"}
//                     </p>
//                   </div>
//                   <div>
//                     <p className="text-gray-500 text-xs">Duration</p>
//                     <p className="font-medium">
//                       {selectedTravel.travelInfo?.totalTime || "N/A"}
//                     </p>
//                   </div>
//                   <div>
//                     <p className="text-gray-500 text-xs">Status</p>
//                     <span
//                       className={`px-2 py-0.5 rounded-full text-xs ${getStatusColor(
//                         selectedTravel.travelInfo?.checkoutTime
//                           ? "completed"
//                           : "pending"
//                       )}`}
//                     >
//                       {selectedTravel.travelInfo?.checkoutTime
//                         ? "Completed"
//                         : "Pending"}
//                     </span>
//                   </div>
//                 </div>
//               </div>

//               {/* Location Info */}
//               <div>
//                 <h4 className="font-medium text-gray-800 mb-2">
//                   Location Information
//                 </h4>
//                 <div className="bg-gray-50 p-3 rounded-lg">
//                   <div className="grid grid-cols-1 gap-3 text-sm">
//                     <div>
//                       <p className="text-gray-500 text-xs">Farm</p>
//                       <p className="font-medium">
//                         {selectedTravel.formDetail?.DocFarm?.FarmName || "N/A"}
//                       </p>
//                     </div>
//                     <div>
//                       <p className="text-gray-500 text-xs">Location</p>
//                       <p className="font-medium">
//                         {selectedTravel.formDetail?.DocLocation?.LocationName ||
//                           "N/A"}
//                       </p>
//                     </div>
//                     <div>
//                       <p className="text-gray-500 text-xs">
//                         Check-in Coordinates
//                       </p>
//                       <p className="font-medium">
//                         {selectedTravel.travelInfo?.checkinLatitude &&
//                         selectedTravel.travelInfo?.checkinLongitude
//                           ? `${selectedTravel.travelInfo.checkinLatitude}, ${selectedTravel.travelInfo.checkinLongitude}`
//                           : "Not recorded"}
//                       </p>
//                     </div>
//                     <div>
//                       <p className="text-gray-500 text-xs">
//                         Check-out Coordinates
//                       </p>
//                       <p className="font-medium">
//                         {selectedTravel.travelInfo?.checkoutLatitude &&
//                         selectedTravel.travelInfo?.checkoutLongitude
//                           ? `${selectedTravel.travelInfo.checkoutLatitude}, ${selectedTravel.travelInfo.checkoutLongitude}`
//                           : "Not recorded"}
//                       </p>
//                     </div>
//                   </div>
//                 </div>
//               </div>

//               {/* Form Details */}
//               {selectedTravel.formDetail && (
//                 <div>
//                   <h4 className="font-medium text-gray-800 mb-2">
//                     Form Details
//                   </h4>
//                   <div className="bg-gray-50 p-3 rounded-lg">
//                     <div className="space-y-3 text-sm">
//                       <div>
//                         <p className="text-gray-500 text-xs">Form ID</p>
//                         <p className="font-medium">
//                           {selectedTravel.formDetail.id}
//                         </p>
//                       </div>
//                       <div>
//                         <p className="text-gray-500 text-xs">Submission Date</p>
//                         <p className="font-medium">
//                           {formatDate(selectedTravel.formDetail.createdAt)}
//                         </p>
//                       </div>
//                       <div>
//                         <p className="text-gray-500 text-xs">Remark</p>
//                         <p className="font-medium">
//                           {selectedTravel.formDetail.remark ||
//                             "No remarks provided"}
//                         </p>
//                       </div>
//                     </div>
//                   </div>
//                 </div>
//               )}

//               {/* Detailed Observations */}
//               {selectedTravel.formDetail?.categoryDetails &&
//                 selectedTravel.formDetail.categoryDetails.length > 0 && (
//                   <div>
//                     <h4 className="font-medium text-gray-800 mb-2">
//                       Detailed Observations (
//                       {selectedTravel.formDetail.categoryDetails.length})
//                     </h4>
//                     <div className="space-y-3">
//                       {selectedTravel.formDetail.categoryDetails.map(
//                         (categoryDetail) => (
//                           <div
//                             key={categoryDetail.id}
//                             className="bg-gray-50 p-3 rounded-lg"
//                           >
//                             <div className="flex justify-between items-start mb-2">
//                               <div className="flex items-center space-x-2">
//                                 <span
//                                   className={`text-xs px-2 py-1 rounded-full ${getCategoryColor(
//                                     categoryDetail.category?.CategoryName
//                                   )}`}
//                                 >
//                                   {categoryDetail.category?.CategoryName}
//                                 </span>
//                                 <span className="text-xs text-gray-600">
//                                   {categoryDetail.subcategory?.SubCategoryName}
//                                 </span>
//                               </div>
//                               <div className="flex items-center space-x-2">
//                                 {categoryDetail.isMailSent && (
//                                   <Mail
//                                     className="h-3 w-3 text-green-500"
//                                     title="Mail sent"
//                                   />
//                                 )}
//                                 <span
//                                   className={`text-xs px-2 py-0.5 rounded-full ${getStatusColor(
//                                     categoryDetail.status
//                                   )}`}
//                                 >
//                                   {categoryDetail.status}
//                                 </span>
//                               </div>
//                             </div>
//                             <p className="text-sm text-gray-700 mb-2">
//                               <strong>Observation:</strong>{" "}
//                               {categoryDetail.Observation}
//                             </p>
//                             {categoryDetail.Image && (
//                               <div className="mt-2">
//                                 <p className="text-xs text-gray-500 mb-1">
//                                   Attached Image:
//                                 </p>
//                                 <div
//                                   className="relative w-24 h-24 rounded-md overflow-hidden border border-gray-200 cursor-pointer hover:opacity-90"
//                                   onClick={() =>
//                                     openImageView(categoryDetail.Image)
//                                   }
//                                 >
//                                   <img
//                                     src={categoryDetail.Image}
//                                     alt="Observation"
//                                     className="w-full h-full object-cover"
//                                   />
//                                 </div>
//                               </div>
//                             )}
//                             <div className="mt-2 text-xs text-gray-500 border-t pt-2">
//                               <p>
//                                 Created: {formatDate(categoryDetail.createdAt)}
//                               </p>
//                               {categoryDetail.updatedAt !==
//                                 categoryDetail.createdAt && (
//                                 <p>
//                                   Updated:{" "}
//                                   {formatDate(categoryDetail.updatedAt)}
//                                 </p>
//                               )}
//                             </div>
//                           </div>
//                         )
//                       )}
//                     </div>
//                   </div>
//                 )}
//             </div>
//           </div>
//         </div>
//       )}

//       {/* Image Viewer Modal */}
//       {viewImage && (
//         <div className="fixed inset-0 bg-black bg-opacity-90 z-50 flex items-center justify-center p-4">
//           <button
//             onClick={closeImageView}
//             className="absolute top-4 right-4 text-white p-2 rounded-full bg-black bg-opacity-50 hover:bg-opacity-70"
//           >
//             <X className="h-6 w-6" />
//           </button>
//           <img
//             src={viewImage}
//             alt="Full size"
//             className="max-w-full max-h-[90vh] object-contain"
//           />
//           <a
//             href={viewImage}
//             target="_blank"
//             rel="noopener noreferrer"
//             className="absolute bottom-4 right-4 text-white p-2 rounded-full bg-black bg-opacity-50 hover:bg-opacity-70"
//           >
//             <ExternalLink className="h-5 w-5" />
//           </a>
//         </div>
//       )}
//     </div>
//   );
// };

// export default TravelHistory;

import React, { useState, useEffect } from "react";
import {
  Clock,
  MapPin,
  User,
  Calendar,
  CheckCircle,
  ArrowLeft,
  Eye,
  X,
  ChevronDown,
  ChevronUp,
  FileText,
  Activity,
  Image as ImageIcon,
  ExternalLink,
  Mail,
  AlertCircle,
  Tag,
} from "lucide-react";
import { Link } from "react-router-dom";
import { useSelector } from "react-redux";
import axiosInstance from "../../library/axios";
import { useNavigate } from "react-router-dom";

const TravelHistory = () => {
  const [travels, setTravels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedTravel, setSelectedTravel] = useState(null);
  const [expandedItems, setExpandedItems] = useState({});
  const [pagination, setPagination] = useState({});
  const [currentPage, setCurrentPage] = useState(1);
  const [limit] = useState(10);
  const [viewImage, setViewImage] = useState(null);
  const [currentStatus, setCurrentStatus] = useState(null);
  const [statusLoading, setStatusLoading] = useState(true);

  const user = useSelector((state) => state.user.user);
  const employeeId = user.EmployeeId;
  const navigate = useNavigate();

  // Fetch current employee status
  const fetchCurrentStatus = async () => {
    try {
      setStatusLoading(true);
      const response = await axiosInstance.get(
        `/doctor/employee/${employeeId}/status`
      );
      const result = response.data;

      if (result.success) {
        setCurrentStatus(result);
      }
    } catch (err) {
      console.error("Error fetching current status:", err);
      // Don't set error for status fetch, just log it
    } finally {
      setStatusLoading(false);
    }
  };

  // Fetch travel history with form details
  const fetchTravelHistory = async (page = 1) => {
    try {
      setLoading(true);

      const response = await axiosInstance.get(
        `/doctor/form-details-with-travel-info?EmployeeId=${employeeId}&page=${page}&limit=${limit}`
      );
      const result = response.data;

      if (result.success && result.data) {
        setTravels(result.data || []);
        setPagination(result.pagination || {});
        setCurrentPage(page);
      } else {
        setTravels([]);
      }
    } catch (err) {
      console.error("Error fetching travel history:", err);
      setError("Failed to fetch travel history");
      setTravels([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTravelHistory();
    fetchCurrentStatus();
  }, []);

  // Format date for display
  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleString("en-IN", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // Toggle expanded view for travel item
  const toggleExpanded = (travelId) => {
    setExpandedItems((prev) => ({
      ...prev,
      [travelId]: !prev[travelId],
    }));
  };

  // Show detailed modal for travel
  const showTravelDetails = (travel) => {
    setSelectedTravel(travel);
  };

  // Handle pagination
  const handlePageChange = (page) => {
    fetchTravelHistory(page);
  };

  // Get status color based on status
  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case "completed":
        return "bg-green-100 text-green-800";
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "failed":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  // Get category color
  const getCategoryColor = (categoryName) => {
    switch (categoryName?.toLowerCase()) {
      case "tech":
        return "bg-blue-100 text-blue-800";
      case "health":
        return "bg-green-100 text-green-800";
      case "store":
        return "bg-purple-100 text-purple-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  // Open image in full view
  const openImageView = (imageUrl) => {
    setViewImage(imageUrl);
  };

  // Close image view
  const closeImageView = () => {
    setViewImage(null);
  };

  // Check if user can start new visit (must be checked out or no current status)
  const canStartNewVisit = () => {
    return !currentStatus || currentStatus.status === "checked_out";
  };

  // Check if user is currently checked in
  const isCurrentlyCheckedIn = () => {
    return currentStatus && currentStatus.status === "checked_in";
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading travel history...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-md">
          <div className="flex items-center">
            <X className="h-5 w-5 text-red-500 mr-2" />
            <p className="text-red-700">{error}</p>
          </div>
          <button
            onClick={() => fetchTravelHistory(currentPage)}
            className="mt-4 bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="">
      <div className="mx-auto">
        {/* Header */}
        <div className="bg-gradient-to-r from-green-700 to-green-800 px-6 py-4 rounded-lg">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-xl font-bold text-white">
                Farm Visit History
              </h1>
              <p className="text-white text-sm mt-1">
                Complete visit records with observations
              </p>
            </div>
            <div className="text-right">
              {/* Current Status Indicator */}
              {/* {!statusLoading && currentStatus && (
                <div className="mb-2">
                  <div
                    className={`text-xs px-2 py-1 rounded-full mb-1 ${
                      currentStatus.status === "checked_in"
                        ? "bg-yellow-100 text-yellow-800 border border-yellow-200"
                        : "bg-green-100 text-green-800 border border-green-200"
                    }`}
                  >
                    {currentStatus.status === "checked_in"
                      ? "Currently Checked In"
                      : "Available for Check-in"}
                  </div>
                  {currentStatus.status === "checked_in" &&
                    currentStatus.data && (
                      <div className="text-xs text-white opacity-90">
                        At: {currentStatus.data.farm?.FarmName}
                      </div>
                    )}
                </div>
              )} */}

              {/* Action Buttons */}
              {isCurrentlyCheckedIn() ? (
                <button
                  onClick={() => navigate("/dashboard/checkin")}
                  className="text-sm transition-colors border rounded-lg px-2 py-1 m-1 block text-yellow-200 border-yellow-200 hover:bg-yellow-200 hover:bg-opacity-20"
                >
                  Continue Visit
                </button>
              ) : canStartNewVisit() ? (
                <button
                  onClick={() => navigate("/dashboard/location-selector")}
                  className="text-sm transition-colors border rounded-lg px-2 py-1 m-1 block text-white border-white hover:bg-white hover:bg-opacity-10"
                >
                  Start New Visit
                </button>
              ) : (
                <button
                  disabled
                  className="text-sm transition-colors border rounded-lg px-2 py-1 m-1 block text-gray-300 border-gray-300 cursor-not-allowed"
                >
                  {statusLoading ? "Loading..." : "Check Status"}
                </button>
              )}
            </div>
          </div>
        </div>

        {/* User Info */}
        <div className="bg-gray-50 px-4 py-3 border-b">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <User className="h-4 w-4 text-blue-600 mr-2" />
              <div>
                <p className="text-gray-600 text-xs">Doctor</p>
                <p className="font-medium text-gray-900 text-sm">
                  {user?.EmployeeName}
                </p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-gray-600 text-xs">
                Total Visits: {pagination.totalCount || 0}
              </p>
              {currentStatus && currentStatus.status === "checked_in" && (
                <p className="text-blue-600 text-xs font-medium">
                  Current Visit Active
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Current Visit Status Card */}
        {currentStatus &&
          currentStatus.status === "checked_in" &&
          currentStatus.data && (
            <div className="p-4">
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-medium text-yellow-800">
                    Current Active Visit
                  </h3>
                  <span className="bg-yellow-100 text-yellow-800 text-xs px-2 py-1 rounded-full">
                    In Progress
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <p className="text-yellow-600 text-xs">Farm</p>
                    <p className="font-medium text-yellow-900">
                      {currentStatus.data.farm?.FarmName || "Unknown"}
                    </p>
                  </div>
                  <div>
                    <p className="text-yellow-600 text-xs">Location</p>
                    <p className="font-medium text-yellow-900">
                      {currentStatus.data.location?.LocationName || "Unknown"}
                    </p>
                  </div>
                  <div>
                    <p className="text-yellow-600 text-xs">Check-in Time</p>
                    <p className="font-medium text-yellow-900">
                      {formatDate(currentStatus.data.checkinTime)}
                    </p>
                  </div>
                  <div>
                    <p className="text-yellow-600 text-xs">Form Status</p>
                    <p className="font-medium text-yellow-900">
                      {currentStatus.data.formDetail
                        ? "Form Submitted"
                        : "Form Pending"}
                    </p>
                  </div>
                </div>
                <div className="mt-3 pt-3 border-t border-yellow-200">
                  <button
                    onClick={() => navigate("/dashboard/checkin")}
                    className="bg-yellow-600 text-white px-4 py-2 rounded-lg hover:bg-yellow-700 transition-colors text-sm"
                  >
                    Continue This Visit
                  </button>
                </div>
              </div>
            </div>
          )}

        {/* Travel List */}
        <div className="p-4 space-y-4">
          {travels.length > 0 ? (
            travels.map((travel) => (
              <div
                key={travel.formDetail?.id || travel.travelInfo?.id}
                className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden"
              >
                {/* Travel Header */}
                <div className="p-4">
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex items-center space-x-2">
                      <div className="bg-blue-100 rounded-full p-2">
                        <MapPin className="h-4 w-4 text-blue-600" />
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900">
                          {travel.formDetail?.DocFarm?.FarmName ||
                            "Unknown Farm"}
                        </p>
                        <p className="text-xs text-gray-600">
                          {travel.formDetail?.DocLocation?.LocationName ||
                            "Unknown Location"}
                        </p>
                        <p className="text-xs text-gray-500">
                          {travel.formDetail?.categoryDetails?.length || 0}{" "}
                          observations
                        </p>
                      </div>
                    </div>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => showTravelDetails(travel)}
                        className="p-1 text-blue-600 hover:bg-blue-50 rounded"
                      >
                        <Eye className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() =>
                          toggleExpanded(
                            travel.formDetail?.id || travel.travelInfo?.id
                          )
                        }
                        className="p-1 text-gray-600 hover:bg-gray-50 rounded"
                      >
                        {expandedItems[
                          travel.formDetail?.id || travel.travelInfo?.id
                        ] ? (
                          <ChevronUp className="h-4 w-4" />
                        ) : (
                          <ChevronDown className="h-4 w-4" />
                        )}
                      </button>
                      {!travel.travelInfo?.checkoutTime && (
                        <button
                          onClick={() => navigate("/dashboard/checkin")}
                          className="text-black text-sm transition-colors mb-1 border border-black rounded-lg px-2 py-1 m-1 block"
                        >
                          View
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Travel Info */}
                  <div className="grid grid-cols-2 gap-3 text-xs">
                    <div className="flex items-center">
                      <Calendar className="h-3 w-3 text-gray-500 mr-1" />
                      <span className="text-gray-500">Check-in:</span>
                      <span className="ml-1 font-medium">
                        {formatDate(travel.travelInfo?.checkinTime)}
                      </span>
                    </div>
                    <div className="flex items-center">
                      <Calendar className="h-3 w-3 text-gray-500 mr-1" />
                      <span className="text-gray-500">Check-out:</span>
                      <span className="ml-1 font-medium">
                        {travel.travelInfo?.checkoutTime
                          ? formatDate(travel.travelInfo.checkoutTime)
                          : "Pending"}
                      </span>
                    </div>
                    <div className="flex items-center">
                      <Clock className="h-3 w-3 text-gray-500 mr-1" />
                      <span className="text-gray-500">Duration:</span>
                      <span className="ml-1 font-medium">
                        {travel.travelInfo?.totalTime || "N/A"}
                      </span>
                    </div>
                    <div className="flex items-center">
                      <Activity className="h-3 w-3 text-gray-500 mr-1" />
                      <span className="text-gray-500">Status:</span>
                      <span
                        className={`ml-1 px-2 py-0.5 rounded-full text-xs ${getStatusColor(
                          travel.travelInfo?.checkoutTime
                            ? "completed"
                            : "pending"
                        )}`}
                      >
                        {travel.travelInfo?.checkoutTime
                          ? "Completed"
                          : "Pending"}
                      </span>
                    </div>
                  </div>

                  {/* Observations Summary */}
                  {travel.formDetail?.categoryDetails &&
                    travel.formDetail.categoryDetails.length > 0 && (
                      <div className="mt-3 pt-3 border-t border-gray-100">
                        <div className="flex flex-wrap gap-1">
                          {Array.from(
                            new Set(
                              travel.formDetail.categoryDetails.map(
                                (cat) => cat.category?.CategoryName
                              )
                            )
                          )
                            .filter(Boolean)
                            .map((categoryName, index) => (
                              <span
                                key={index}
                                className={`text-xs px-2 py-1 rounded-full ${getCategoryColor(
                                  categoryName
                                )}`}
                              >
                                {categoryName}
                              </span>
                            ))}
                        </div>
                      </div>
                    )}
                </div>

                {/* Expanded Content */}
                {expandedItems[
                  travel.formDetail?.id || travel.travelInfo?.id
                ] && (
                  <div className="border-t border-gray-100 p-4 bg-gray-50">
                    <div className="space-y-4">
                      {/* Location Details */}
                      <div>
                        <h4 className="text-sm font-medium text-gray-700 mb-2">
                          Location Details
                        </h4>
                        <div className="grid grid-cols-2 gap-2 text-xs">
                          <div>
                            <p className="text-gray-500">Check-in Location:</p>
                            <p className="font-medium">
                              {travel.travelInfo?.checkinLatitude &&
                              travel.travelInfo?.checkinLongitude
                                ? `${travel.travelInfo.checkinLatitude}, ${travel.travelInfo.checkinLongitude}`
                                : "Not recorded"}
                            </p>
                          </div>
                          <div>
                            <p className="text-gray-500">Check-out Location:</p>
                            <p className="font-medium">
                              {travel.travelInfo?.checkoutLatitude &&
                              travel.travelInfo?.checkoutLongitude
                                ? `${travel.travelInfo.checkoutLatitude}, ${travel.travelInfo.checkoutLongitude}`
                                : "Not recorded"}
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* Form Details */}
                      {travel.formDetail && (
                        <div>
                          <h4 className="text-sm font-medium text-gray-700 mb-2">
                            Form Details
                          </h4>
                          <div className="bg-white p-3 rounded-lg border">
                            <div className="grid grid-cols-2 gap-2 text-xs mb-3">
                              <div>
                                <p className="text-gray-500">Form ID:</p>
                                <p className="font-medium">
                                  {travel.formDetail.id}
                                </p>
                              </div>
                              <div>
                                <p className="text-gray-500">
                                  Submission Date:
                                </p>
                                <p className="font-medium">
                                  {formatDate(travel.formDetail.createdAt)}
                                </p>
                              </div>
                            </div>
                            <div className="mb-3">
                              <p className="text-gray-500 text-xs">Remark:</p>
                              <p className="font-medium text-sm">
                                {travel.formDetail.remark ||
                                  "No remarks provided"}
                              </p>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Category Details (Observations) */}
                      {travel.formDetail?.categoryDetails &&
                        travel.formDetail.categoryDetails.length > 0 && (
                          <div>
                            <h4 className="text-sm font-medium text-gray-700 mb-2">
                              Observations (
                              {travel.formDetail.categoryDetails.length})
                            </h4>
                            <div className="space-y-3">
                              {travel.formDetail.categoryDetails.map(
                                (categoryDetail) => (
                                  <div
                                    key={categoryDetail.id}
                                    className="bg-white p-3 rounded-lg border"
                                  >
                                    <div className="flex justify-between items-start mb-2">
                                      <div className="flex items-center space-x-2">
                                        <span
                                          className={`text-xs px-2 py-1 rounded-full ${getCategoryColor(
                                            categoryDetail.category
                                              ?.CategoryName
                                          )}`}
                                        >
                                          {
                                            categoryDetail.category
                                              ?.CategoryName
                                          }
                                        </span>
                                        <span className="text-xs text-gray-500">
                                          {
                                            categoryDetail.subcategory
                                              ?.SubCategoryName
                                          }
                                        </span>
                                      </div>
                                      <div className="flex items-center space-x-2">
                                        {categoryDetail.isMailSent && (
                                          <Mail
                                            className="h-3 w-3 text-green-500"
                                            title="Mail sent"
                                          />
                                        )}
                                        <span
                                          className={`text-xs px-2 py-0.5 rounded-full ${getStatusColor(
                                            categoryDetail.status
                                          )}`}
                                        >
                                          {categoryDetail.status}
                                        </span>
                                      </div>
                                    </div>
                                    <p className="text-sm text-gray-700 mb-2">
                                      {categoryDetail.Observation}
                                    </p>
                                    {categoryDetail.Image && (
                                      <div className="mt-2">
                                        <div
                                          className="relative w-20 h-20 rounded-md overflow-hidden border border-gray-200 cursor-pointer hover:opacity-90"
                                          onClick={() =>
                                            openImageView(categoryDetail.Image)
                                          }
                                        >
                                          <img
                                            src={categoryDetail.Image}
                                            alt="Observation"
                                            className="w-full h-full object-cover"
                                          />
                                          <div className="absolute inset-0 bg-black bg-opacity-0 hover:bg-opacity-10 transition-opacity flex items-center justify-center">
                                            <Eye className="h-4 w-4 text-white opacity-0 hover:opacity-100" />
                                          </div>
                                        </div>
                                      </div>
                                    )}
                                    <div className="mt-2 text-xs text-gray-500">
                                      Created:{" "}
                                      {formatDate(categoryDetail.createdAt)}
                                      {categoryDetail.updatedAt !==
                                        categoryDetail.createdAt && (
                                        <span className="ml-2">
                                          Updated:{" "}
                                          {formatDate(categoryDetail.updatedAt)}
                                        </span>
                                      )}
                                    </div>
                                  </div>
                                )
                              )}
                            </div>
                          </div>
                        )}
                    </div>
                  </div>
                )}
              </div>
            ))
          ) : (
            <div className="text-center py-8">
              <div className="bg-gray-100 rounded-full p-4 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                <Calendar className="h-8 w-8 text-gray-400" />
              </div>
              <h3 className="text-gray-700 font-medium mb-1">
                No Travel Records
              </h3>
              <p className="text-gray-500 text-sm mb-4">
                You haven't recorded any visits yet
              </p>
              {canStartNewVisit() ? (
                <button
                  onClick={() => navigate("/dashboard/location-selector")}
                  className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
                >
                  Start New Visit
                </button>
              ) : (
                <button
                  onClick={() => navigate("/dashboard/checkin")}
                  className="bg-yellow-600 text-white px-4 py-2 rounded-lg hover:bg-yellow-700 transition-colors"
                >
                  Continue Current Visit
                </button>
              )}
            </div>
          )}

          {/* Pagination */}
          {pagination && pagination.totalPages > 1 && (
            <div className="flex justify-center mt-6">
              <div className="flex space-x-1">
                <button
                  onClick={() => handlePageChange(1)}
                  disabled={currentPage === 1}
                  className={`px-3 py-1 rounded ${
                    currentPage === 1
                      ? "bg-gray-100 text-gray-400"
                      : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                  }`}
                >
                  First
                </button>
                <button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  className={`px-3 py-1 rounded ${
                    currentPage === 1
                      ? "bg-gray-100 text-gray-400"
                      : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                  }`}
                >
                  Prev
                </button>
                <div className="px-3 py-1 bg-blue-600 text-white rounded">
                  {currentPage}
                </div>
                <button
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === pagination.totalPages}
                  className={`px-3 py-1 rounded ${
                    currentPage === pagination.totalPages
                      ? "bg-gray-100 text-gray-400"
                      : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                  }`}
                >
                  Next
                </button>
                <button
                  onClick={() => handlePageChange(pagination.totalPages)}
                  disabled={currentPage === pagination.totalPages}
                  className={`px-3 py-1 rounded ${
                    currentPage === pagination.totalPages
                      ? "bg-gray-100 text-gray-400"
                      : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                  }`}
                >
                  Last
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Travel Detail Modal */}
      {selectedTravel && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white p-4 border-b flex justify-between items-center">
              <h3 className="font-semibold text-lg">Visit Details</h3>
              <button
                onClick={() => setSelectedTravel(null)}
                className="p-1 rounded-full hover:bg-gray-100"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="p-4 space-y-4">
              {/* Basic Travel Info */}
              <div className="bg-blue-50 p-4 rounded-lg">
                <h4 className="font-medium text-gray-800 mb-3">
                  Travel Information
                </h4>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <p className="text-gray-500 text-xs">Check-in Time</p>
                    <p className="font-medium">
                      {formatDate(selectedTravel.travelInfo?.checkinTime)}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-500 text-xs">Check-out Time</p>
                    <p className="font-medium">
                      {selectedTravel.travelInfo?.checkoutTime
                        ? formatDate(selectedTravel.travelInfo.checkoutTime)
                        : "Pending"}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-500 text-xs">Duration</p>
                    <p className="font-medium">
                      {selectedTravel.travelInfo?.totalTime || "N/A"}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-500 text-xs">Status</p>
                    <span
                      className={`px-2 py-0.5 rounded-full text-xs ${getStatusColor(
                        selectedTravel.travelInfo?.checkoutTime
                          ? "completed"
                          : "pending"
                      )}`}
                    >
                      {selectedTravel.travelInfo?.checkoutTime
                        ? "Completed"
                        : "Pending"}
                    </span>
                  </div>
                </div>
              </div>

              {/* Location Info */}
              <div>
                <h4 className="font-medium text-gray-800 mb-2">
                  Location Information
                </h4>
                <div className="bg-gray-50 p-3 rounded-lg">
                  <div className="grid grid-cols-1 gap-3 text-sm">
                    <div>
                      <p className="text-gray-500 text-xs">Farm</p>
                      <p className="font-medium">
                        {selectedTravel.formDetail?.DocFarm?.FarmName || "N/A"}
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-500 text-xs">Location</p>
                      <p className="font-medium">
                        {selectedTravel.formDetail?.DocLocation?.LocationName ||
                          "N/A"}
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-500 text-xs">
                        Check-in Coordinates
                      </p>
                      <p className="font-medium">
                        {selectedTravel.travelInfo?.checkinLatitude &&
                        selectedTravel.travelInfo?.checkinLongitude
                          ? `${selectedTravel.travelInfo.checkinLatitude}, ${selectedTravel.travelInfo.checkinLongitude}`
                          : "Not recorded"}
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-500 text-xs">
                        Check-out Coordinates
                      </p>
                      <p className="font-medium">
                        {selectedTravel.travelInfo?.checkoutLatitude &&
                        selectedTravel.travelInfo?.checkoutLongitude
                          ? `${selectedTravel.travelInfo.checkoutLatitude}, ${selectedTravel.travelInfo.checkoutLongitude}`
                          : "Not recorded"}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Form Details */}
              {selectedTravel.formDetail && (
                <div>
                  <h4 className="font-medium text-gray-800 mb-2">
                    Form Details
                  </h4>
                  <div className="bg-gray-50 p-3 rounded-lg">
                    <div className="space-y-3 text-sm">
                      <div>
                        <p className="text-gray-500 text-xs">Form ID</p>
                        <p className="font-medium">
                          {selectedTravel.formDetail.id}
                        </p>
                      </div>
                      <div>
                        <p className="text-gray-500 text-xs">Submission Date</p>
                        <p className="font-medium">
                          {formatDate(selectedTravel.formDetail.createdAt)}
                        </p>
                      </div>
                      <div>
                        <p className="text-gray-500 text-xs">Remark</p>
                        <p className="font-medium">
                          {selectedTravel.formDetail.remark ||
                            "No remarks provided"}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Detailed Observations */}
              {selectedTravel.formDetail?.categoryDetails &&
                selectedTravel.formDetail.categoryDetails.length > 0 && (
                  <div>
                    <h4 className="font-medium text-gray-800 mb-2">
                      Detailed Observations (
                      {selectedTravel.formDetail.categoryDetails.length})
                    </h4>
                    <div className="space-y-3">
                      {selectedTravel.formDetail.categoryDetails.map(
                        (categoryDetail) => (
                          <div
                            key={categoryDetail.id}
                            className="bg-gray-50 p-3 rounded-lg"
                          >
                            <div className="flex justify-between items-start mb-2">
                              <div className="flex items-center space-x-2">
                                <span
                                  className={`text-xs px-2 py-1 rounded-full ${getCategoryColor(
                                    categoryDetail.category?.CategoryName
                                  )}`}
                                >
                                  {categoryDetail.category?.CategoryName}
                                </span>
                                <span className="text-xs text-gray-600">
                                  {categoryDetail.subcategory?.SubCategoryName}
                                </span>
                              </div>
                              <div className="flex items-center space-x-2">
                                {categoryDetail.isMailSent && (
                                  <Mail
                                    className="h-3 w-3 text-green-500"
                                    title="Mail sent"
                                  />
                                )}
                                <span
                                  className={`text-xs px-2 py-0.5 rounded-full ${getStatusColor(
                                    categoryDetail.status
                                  )}`}
                                >
                                  {categoryDetail.status}
                                </span>
                              </div>
                            </div>
                            <p className="text-sm text-gray-700 mb-2">
                              <strong>Observation:</strong>{" "}
                              {categoryDetail.Observation}
                            </p>
                            {categoryDetail.Image && (
                              <div className="mt-2">
                                <p className="text-xs text-gray-500 mb-1">
                                  Attached Image:
                                </p>
                                <div
                                  className="relative w-24 h-24 rounded-md overflow-hidden border border-gray-200 cursor-pointer hover:opacity-90"
                                  onClick={() =>
                                    openImageView(categoryDetail.Image)
                                  }
                                >
                                  <img
                                    src={categoryDetail.Image}
                                    alt="Observation"
                                    className="w-full h-full object-cover"
                                  />
                                </div>
                              </div>
                            )}
                            <div className="mt-2 text-xs text-gray-500 border-t pt-2">
                              <p>
                                Created: {formatDate(categoryDetail.createdAt)}
                              </p>
                              {categoryDetail.updatedAt !==
                                categoryDetail.createdAt && (
                                <p>
                                  Updated:{" "}
                                  {formatDate(categoryDetail.updatedAt)}
                                </p>
                              )}
                            </div>
                          </div>
                        )
                      )}
                    </div>
                  </div>
                )}
            </div>
          </div>
        </div>
      )}

      {/* Image Viewer Modal */}
      {viewImage && (
        <div className="fixed inset-0 bg-black bg-opacity-90 z-50 flex items-center justify-center p-4">
          <button
            onClick={closeImageView}
            className="absolute top-4 right-4 text-white p-2 rounded-full bg-black bg-opacity-50 hover:bg-opacity-70"
          >
            <X className="h-6 w-6" />
          </button>
          <img
            src={viewImage}
            alt="Full size"
            className="max-w-full max-h-[90vh] object-contain"
          />
          <a
            href={viewImage}
            target="_blank"
            rel="noopener noreferrer"
            className="absolute bottom-4 right-4 text-white p-2 rounded-full bg-black bg-opacity-50 hover:bg-opacity-70"
          >
            <ExternalLink className="h-5 w-5" />
          </a>
        </div>
      )}
    </div>
  );
};

export default TravelHistory;
