// import React, { useState, useEffect } from "react";
// import {
//   Camera,
//   CheckCircle,
//   AlertCircle,
//   Upload,
//   X,
//   MapPin,
//   User,
//   Clock,
//   ArrowLeft,
// } from "lucide-react";
// import axiosInstance from "../../library/axios";
// import { useSelector, useDispatch } from "react-redux";
// import { useLocation, useNavigate } from "react-router-dom";
// import { resetSession, setFormStatus } from "../../redux/slices/sessionSlice";
// import toast from "react-hot-toast";

// // FormSubmissionService class for handling split API calls
// class FormSubmissionService {
//   constructor() {
//     this.baseURL = "/doctor"; // Adjust based on your API base URL
//   }

//   // Step 1: Submit form data only
//   async submitFormData(formData) {
//     const response = await axiosInstance.post(
//       "/doctor/submit-form-data",
//       formData,
//       {
//         headers: {
//           "Content-Type": "application/json",
//         },
//       }
//     );

//     if (response.data?.success) {
//       return response.data;
//     } else {
//       throw new Error(response.data?.message || "Form data submission failed");
//     }
//   }

//   // Step 2: Upload single image
//   async uploadImage(formDetailId, categoryId, subCategoryId, imageFile) {
//     const formData = new FormData();
//     formData.append("image", imageFile);
//     formData.append("formDetailId", formDetailId);
//     formData.append("categoryId", categoryId);
//     formData.append("subCategoryId", subCategoryId);

//     const response = await axiosInstance.post(
//       "/doctor/upload-form-image",
//       formData,
//       {
//         headers: {
//           "Content-Type": "multipart/form-data",
//         },
//       }
//     );

//     if (response.data?.success) {
//       return response.data;
//     } else {
//       throw new Error(response.data?.message || "Image upload failed");
//     }
//   }

//   // Step 3: Complete form submission
//   async completeSubmission(formDetailId) {
//     const response = await axiosInstance.post(
//       "/doctor/complete-form-submission",
//       {
//         formDetailId,
//       },
//       {
//         headers: {
//           "Content-Type": "application/json",
//         },
//       }
//     );

//     if (response.data?.success) {
//       return response.data;
//     } else {
//       throw new Error(response.data?.message || "Form completion failed");
//     }
//   }

//   // Get upload status
//   async getUploadStatus(formDetailId) {
//     const response = await axiosInstance.get(`/doctor/status/${formDetailId}`);

//     if (response.data?.success) {
//       return response.data;
//     } else {
//       throw new Error(response.data?.message || "Failed to get status");
//     }
//   }
// }

// const Form = () => {
//   const [checklistData, setChecklistData] = useState([]);
//   const [supportData, setSupportData] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState(null);
//   const [activeCategory, setActiveCategory] = useState("");
//   const [formSubmitted, setFormSubmitted] = useState(false);

//   // Form state
//   const [selectedChecklistItems, setSelectedChecklistItems] = useState([]);
//   const [supportFormData, setSupportFormData] = useState({});
//   const [images, setImages] = useState({});
//   const [submitting, setSubmitting] = useState(false);
//   const [formDetailId, setFormDetailId] = useState(null);
//   const [remark, setRemark] = useState("");

//   // New states for split submission
//   const [uploadProgress, setUploadProgress] = useState({
//     total: 0,
//     completed: 0,
//     failed: 0,
//     current: null,
//     isUploading: false,
//   });
//   const [formService] = useState(new FormSubmissionService());
//   const user = useSelector((state) => state.user.user);
//   const employeeId = user.EmployeeId;
//   const formStatus = useSelector((state) => state.session.formStatus);
//   const sessionStatus = useSelector((state) => state.session.sessionStatus);
//   const locationDetails = useSelector((state) => state.session.locationDetails);
//   const farmDetails = useSelector((state) => state.session.farmDetails);

//   const location = useLocation();
//   const dispatch = useDispatch();
//   const { activeTravel, selectedLocation } = location.state || {};

//   const navigate = useNavigate();

//   // Fetch checklist data from API
//   const fetchChecklistData = async () => {
//     try {
//       const response = await axiosInstance.get(`/doctor/doc-checklist-tasks`);
//       const result = response.data;

//       if (result.success && Array.isArray(result.data)) {
//         setChecklistData(result.data.filter((item) => item.isActive));
//       } else {
//         setChecklistData([]);
//       }
//     } catch (err) {
//       setError("Failed to fetch checklist data");
//       console.error("Checklist API Error:", err);
//       setChecklistData([]);
//     }
//   };

//   // Fetch support subcategories from API
//   const fetchSupportData = async () => {
//     try {
//       const response = await axiosInstance.get(`/doctor/support-subcategories`);
//       const result = response?.data;

//       if (result.success && Array.isArray(result.data)) {
//         setSupportData(result.data.filter((item) => item.isActive));
//       } else {
//         setSupportData([]);
//       }
//     } catch (err) {
//       setError("Failed to fetch support data");
//       console.error("Support API Error:", err);
//       setSupportData([]);
//     }
//   };

//   useEffect(() => {
//     const fetchData = async () => {
//       setLoading(true);
//       await Promise.all([fetchChecklistData(), fetchSupportData()]);
//       setLoading(false);
//     };
//     fetchData();
//   }, []);

//   useEffect(() => {
//     if (formStatus === "submitted") {
//       setFormSubmitted(true);
//     }
//   }, [formStatus]);

//   // Group support data by category with proper error handling
//   const groupedSupportData = supportData.reduce((acc, item) => {
//     if (item && item.category && item.category.CategoryName) {
//       const categoryName = item.category.CategoryName;
//       if (!acc[categoryName]) {
//         acc[categoryName] = [];
//       }
//       acc[categoryName].push(item);
//     }
//     return acc;
//   }, {});

//   // Set first category as active by default
//   useEffect(() => {
//     const categories = Object.keys(groupedSupportData);
//     if (categories.length > 0 && !activeCategory) {
//       setActiveCategory(categories[0]);
//     }
//   }, [groupedSupportData, activeCategory]);

//   useEffect(() => {
//     console.log("Selected Location:", selectedLocation);
//     console.log("Active Travel:", activeTravel);
//   }, [selectedLocation, activeTravel]);

//   // Handle checklist item selection
//   const handleChecklistSelect = (itemId) => {
//     setSelectedChecklistItems((prev) =>
//       prev.includes(itemId)
//         ? prev.filter((id) => id !== itemId)
//         : [...prev, itemId]
//     );
//   };

//   // Handle support form data
//   const handleSupportFormChange = (subcategoryId, field, value) => {
//     setSupportFormData((prev) => ({
//       ...prev,
//       [subcategoryId]: {
//         ...prev[subcategoryId],
//         [field]: value,
//       },
//     }));
//   };

//   // Handle image upload
//   const handleImageUpload = async (subcategoryId, file) => {
//     if (!file) return;

//     try {
//       // Convert to preview URL
//       const reader = new FileReader();
//       reader.onload = (e) => {
//         setImages((prev) => ({
//           ...prev,
//           [subcategoryId]: {
//             file, // Use compressed file here
//             preview: e.target.result,
//           },
//         }));
//       };
//       reader.readAsDataURL(file);
//     } catch (error) {
//       console.error("Image compression failed:", error);
//     }
//   };

//   // Handle checkout API call
//   const handleCheckout = async () => {
//     try {
//       setSubmitting(true);

//       // Get current location for checkout
//       const coords = await getCurrentLocation();

//       const checkoutData = {
//         EmployeeId: parseInt(employeeId),
//         checkoutLatitude: coords.latitude,
//         checkoutLongitude: coords.longitude,
//         checkoutTime: new Date().toISOString(),
//         DocFormDetailId: formDetailId, // Use the formDetailId from form submission response
//         travelInfoId: activeTravel?.id, // Use the travel ID
//       };

//       console.log("Checkout data:", checkoutData);

//       const response = await axiosInstance.post(
//         `/doctor/checkout`,
//         checkoutData
//       );

//       const result = response?.data;

//       if (result.success) {
//         console.log("Checkout response:", result);
//         toast.success("Checkout successful!");
//         dispatch(resetSession());
//         navigate("/dashboard");
//       } else {
//         throw new Error(result.message || "Checkout failed");
//       }
//     } catch (err) {
//       console.error("Checkout error:", err);
//       toast.error(`Checkout failed: ${err.message}`);
//     } finally {
//       setSubmitting(false);
//     }
//   };

//   // Remove image
//   const removeImage = (subcategoryId) => {
//     setImages((prev) => {
//       const newImages = { ...prev };
//       delete newImages[subcategoryId];
//       return newImages;
//     });
//   };

//   // Get current location for checkout
//   const getCurrentLocation = () => {
//     return new Promise((resolve, reject) => {
//       if (!navigator.geolocation) {
//         reject(new Error("Geolocation is not supported by this browser"));
//         return;
//       }

//       navigator.geolocation.getCurrentPosition(
//         (position) => {
//           const coords = {
//             latitude: position.coords.latitude.toString(),
//             longitude: position.coords.longitude.toString(),
//           };
//           resolve(coords);
//         },
//         (error) => {
//           let errorMessage = "Unable to get location";
//           switch (error.code) {
//             case error.PERMISSION_DENIED:
//               errorMessage = "Location access denied by user";
//               break;
//             case error.POSITION_UNAVAILABLE:
//               errorMessage = "Location information unavailable";
//               break;
//             case error.TIMEOUT:
//               errorMessage = "Location request timed out";
//               break;
//           }
//           reject(new Error(errorMessage));
//         },
//         {
//           enableHighAccuracy: true,
//           timeout: 10000,
//           maximumAge: 60000,
//         }
//       );
//     });
//   };

//   // NEW: Handle form submission with split API approach
//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     setSubmitting(true);

//     try {
//       // Prepare category details array
//       const categoryDetails = [];
//       const imagesToUpload = [];

//       // Process support form data
//       Object.entries(supportFormData).forEach(([subcategoryId, data]) => {
//         const subcategory = supportData.find(
//           (item) => item.id === parseInt(subcategoryId)
//         );

//         if (subcategory && subcategory.category) {
//           const categoryId = subcategory.category.id;

//           categoryDetails.push({
//             CategoryId: categoryId,
//             SubCategoryId: parseInt(subcategoryId),
//             Observation: data.observation || "",
//           });

//           // Collect images for upload
//           if (images[subcategoryId] && images[subcategoryId].file) {
//             imagesToUpload.push({
//               file: images[subcategoryId].file,
//               categoryId: categoryId,
//               subCategoryId: parseInt(subcategoryId),
//             });
//           }
//         }
//       });

//       // Prepare form data for first API call
//       const formDataToSubmit = {
//         EmployeeId: employeeId,
//         LocationId: selectedLocation?.locationId || 2,
//         FarmId: selectedLocation?.farmData?.FarmId || 1,
//         remark: remark,
//         categoryDetails: categoryDetails,
//         checklistItems: selectedChecklistItems,
//       };

//       console.log("Submitting form data:", formDataToSubmit);

//       // Step 1: Submit form data only (fast)
//       toast.loading("Submitting form data...", { id: "form-submit" });
//       const formResult = await formService.submitFormData(formDataToSubmit);

//       if (!formResult.success) {
//         throw new Error(formResult.message);
//       }

//       const newFormDetailId = formResult.data.formDetailId;
//       setFormDetailId(newFormDetailId);

//       // Show immediate success feedback
//       toast.success("Form data submitted! Now uploading images...", {
//         id: "form-submit",
//       });

//       // Initialize upload progress
//       setUploadProgress({
//         total: imagesToUpload.length,
//         completed: 0,
//         failed: 0,
//         current: null,
//         isUploading: true,
//       });

//       // Step 2: Upload images one by one
//       if (imagesToUpload.length > 0) {
//         console.log(`Uploading ${imagesToUpload.length} images...`);
//         let completedCount = 0;
//         let failedCount = 0;

//         for (let i = 0; i < imagesToUpload.length; i++) {
//           const image = imagesToUpload[i];
//           setUploadProgress((prev) => ({
//             ...prev,
//             current: `Uploading image ${i + 1} of ${imagesToUpload.length}`,
//           }));

//           try {
//             await formService.uploadImage(
//               newFormDetailId,
//               image.categoryId,
//               image.subCategoryId,
//               image.file
//             );

//             completedCount++;

//             setUploadProgress((prev) => ({
//               ...prev,
//               completed: completedCount,
//             }));

//             console.log(`Image ${i + 1} uploaded successfully`);
//           } catch (error) {
//             console.error(`Failed to upload image ${i + 1}:`, error);
//             failedCount++;

//             setUploadProgress((prev) => ({
//               ...prev,
//               failed: failedCount,
//             }));

//             toast.error(`Failed to upload image ${i + 1}: ${error.message}`);
//           }
//         }

//         // Step 3: Complete submission and send email
//         if (completedCount > 0) {
//           try {
//             await formService.completeSubmission(newFormDetailId);
//             console.log("Form submission completed, email sent");
//             toast.success("Email notification sent!");
//           } catch (error) {
//             console.error("Failed to complete submission:", error);
//             toast.error("Form saved but email notification failed");
//           }
//         }

//         // Final status
//         setUploadProgress((prev) => ({
//           ...prev,
//           current: `Completed: ${completedCount} uploaded, ${failedCount} failed`,
//           isUploading: false,
//         }));

//         if (completedCount > 0) {
//           toast.success(
//             `Form submitted successfully! ${completedCount} images uploaded.`
//           );
//         }
//         if (failedCount > 0) {
//           toast.error(`${failedCount} images failed to upload.`);
//         }
//       } else {
//         // No images to upload, just complete the submission
//         try {
//           await formService.completeSubmission(newFormDetailId);
//           toast.success("Form submitted successfully!");
//         } catch (error) {
//           console.error("Failed to complete submission:", error);
//           toast.error("Form saved but email notification failed");
//         }

//         setUploadProgress((prev) => ({
//           ...prev,
//           isUploading: false,
//         }));
//       }

//       // Update form status
//       dispatch(setFormStatus("submitted"));
//       setFormSubmitted(true);
//     } catch (err) {
//       console.error("Form submission error:", err);
//       toast.error(`Failed to submit form: ${err.message}`);
//       setUploadProgress((prev) => ({
//         ...prev,
//         isUploading: false,
//       }));
//     } finally {
//       setSubmitting(false);
//     }
//   };

//   if (loading) {
//     return (
//       <div className="flex items-center justify-center">
//         <div className="text-center">
//           <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
//           <p className="text-gray-600">Loading farm visit form...</p>
//         </div>
//       </div>
//     );
//   }

//   if (error) {
//     return (
//       <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
//         <div className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-md">
//           <div className="flex items-center">
//             <AlertCircle className="h-5 w-5 text-red-500 mr-2" />
//             <p className="text-red-700">{error}</p>
//           </div>
//           <button
//             onClick={() => window.location.reload()}
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
//       <div className="max-w-md mx-auto">
//         <div className="bg-white overflow-hidden">
//           {/* Header */}
//           <div className="bg-gradient-to-r from-green-700 to-green-800 px-6 py-4 rounded-lg">
//             <div className="flex justify-between items-start">
//               <div>
//                 <h1 className="text-xl font-bold text-white">
//                   Farm Visit Report
//                 </h1>
//                 <p className="text-white text-sm mt-1">
//                   Complete checklist and document issues
//                 </p>
//               </div>
//               <div className="text-right">
//                 <button
//                   onClick={() => navigate("/dashboard/checkin")}
//                   className="text-white text-sm transition-colors mb-1 border border-white rounded-lg px-2 py-1 m-1 block"
//                 >
//                   Back
//                 </button>
//               </div>
//             </div>
//           </div>

//           {/* Travel Info */}
//           <div className="bg-gray-50 px-4 py-3 border-b">
//             <div className="grid grid-cols-2 gap-3 text-xs">
//               <div className="flex items-center">
//                 <MapPin className="h-3 w-3 text-green-600 mr-1" />
//                 <div>
//                   <p className="text-gray-600">Location</p>
//                   <p className="font-medium text-gray-900 text-xs">
//                     {locationDetails ? locationDetails.locationName : "N/A"}
//                     {farmDetails && ` - ${farmDetails.farmName}`}
//                   </p>
//                 </div>
//               </div>
//               <div className="flex items-center">
//                 <User className="h-3 w-3 text-blue-600 mr-1" />
//                 <div>
//                   <p className="text-gray-600">Doctor</p>
//                   <p className="font-medium text-gray-900 text-xs">
//                     {user?.EmployeeName}
//                   </p>
//                 </div>
//               </div>
//               <div className="flex items-center">
//                 <Clock className="h-3 w-3 text-orange-600 mr-1" />
//                 <div>
//                   <p className="text-gray-600">Check-in</p>
//                   <p className="font-medium text-gray-900 text-xs">
//                     {sessionStatus === "checked_in" ? "Checked In" : "N/A"}
//                   </p>
//                 </div>
//               </div>
//               <div className="flex items-center">
//                 <CheckCircle className="h-3 w-3 text-purple-600 mr-1" />
//                 <div>
//                   <p className="text-gray-600">Form Status</p>
//                   <p className="font-medium text-gray-900 text-xs">
//                     {formStatus}
//                   </p>
//                 </div>
//               </div>
//             </div>
//           </div>

//           {/* Upload Progress Display */}
//           {uploadProgress.isUploading && (
//             <div className="bg-blue-50 border-b border-blue-200 px-4 py-3">
//               <div className="flex items-center justify-between mb-2">
//                 <span className="text-sm font-medium text-blue-800">
//                   Uploading Images
//                 </span>
//                 <span className="text-sm text-blue-600">
//                   {uploadProgress.completed} / {uploadProgress.total}
//                 </span>
//               </div>
//               <div className="w-full bg-blue-200 rounded-full h-2 mb-2">
//                 <div
//                   className="bg-blue-600 h-2 rounded-full transition-all duration-300"
//                   style={{
//                     width: `${
//                       uploadProgress.total > 0
//                         ? (uploadProgress.completed / uploadProgress.total) *
//                           100
//                         : 0
//                     }%`,
//                   }}
//                 />
//               </div>
//               {uploadProgress.current && (
//                 <p className="text-xs text-blue-700">
//                   {uploadProgress.current}
//                 </p>
//               )}
//               {uploadProgress.failed > 0 && (
//                 <p className="text-xs text-red-600 mt-1">
//                   {uploadProgress.failed} images failed to upload
//                 </p>
//               )}
//             </div>
//           )}

//           {!formSubmitted ? (
//             <form onSubmit={handleSubmit} className="p-4 space-y-6">
//               {locationDetails?.locationName === "HO Visit" ? (
//                 // HO Visit - Only show remark field
//                 <div className="space-y-4">
//                   <div className="flex items-center space-x-3 mb-6">
//                     <h2 className="text-2xl font-semibold text-gray-800">
//                       HO Visit Remark
//                     </h2>
//                   </div>

//                   {/* Remark section */}
//                   <div className="space-y-2">
//                     <label className="block text-sm font-medium text-gray-700">
//                       Remark
//                     </label>
//                     <textarea
//                       rows={8}
//                       className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none transition-all duration-200 text-sm min-h-24"
//                       placeholder="Enter your observations or notes for this HO visit"
//                       value={remark || ""}
//                       onChange={(e) => setRemark(e.target.value)}
//                     />
//                   </div>
//                 </div>
//               ) : (
//                 // Farm Visit - Show original content with checklist and support
//                 <>
//                   {/* Checklist Section */}
//                   <section className="space-y-6">
//                     <div className="flex items-center space-x-3 mb-6">
//                       <div className="bg-blue-100 rounded-full p-2">
//                         <CheckCircle className="h-6 w-6 text-blue-600" />
//                       </div>
//                       <h2 className="text-2xl font-semibold text-gray-800">
//                         Top Pointers
//                       </h2>
//                     </div>

//                     {checklistData.length > 0 ? (
//                       <div className="grid md:grid-cols-2 gap-4">
//                         {checklistData.map((item) => (
//                           <div
//                             key={item.id}
//                             className={`border-2 rounded-xl p-4 cursor-pointer transition-all duration-200 ${
//                               selectedChecklistItems.includes(item.id)
//                                 ? "border-green-500 bg-green-50 shadow-md transform scale-105"
//                                 : "border-gray-200 hover:border-blue-300 hover:shadow-sm"
//                             }`}
//                             onClick={() => handleChecklistSelect(item.id)}
//                           >
//                             <div className="flex items-center justify-between">
//                               <span className="font-medium text-gray-800">
//                                 {item.ChecklistTask}
//                               </span>
//                               <div
//                                 className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all duration-200 ${
//                                   selectedChecklistItems.includes(item.id)
//                                     ? "border-green-500 bg-green-500"
//                                     : "border-gray-300"
//                                 }`}
//                               >
//                                 {selectedChecklistItems.includes(item.id) && (
//                                   <CheckCircle className="h-3 w-3 text-white" />
//                                 )}
//                               </div>
//                             </div>
//                           </div>
//                         ))}
//                       </div>
//                     ) : (
//                       <div className="text-center py-8 text-gray-500">
//                         <AlertCircle className="h-12 w-12 mx-auto mb-4 text-gray-400" />
//                         <p>No checklist tasks available</p>
//                       </div>
//                     )}
//                   </section>

//                   {/* Support Section */}
//                   <section className="space-y-6">
//                     <div className="flex items-center space-x-3 mb-6">
//                       <div className="bg-orange-100 rounded-full p-2">
//                         <AlertCircle className="h-6 w-6 text-orange-600" />
//                       </div>
//                       <h2 className="text-2xl font-semibold text-gray-800">
//                         Support
//                       </h2>
//                     </div>

//                     {Object.keys(groupedSupportData).length > 0 ? (
//                       <div className="space-y-6">
//                         {/* Category Tabs */}
//                         <div className="overflow-x-auto pb-2">
//                           <div className="flex space-x-2 min-w-max px-2 py-1">
//                             {Object.entries(groupedSupportData).map(
//                               ([categoryName, subcategories]) => (
//                                 <button
//                                   key={categoryName}
//                                   type="button"
//                                   onClick={() =>
//                                     setActiveCategory(categoryName)
//                                   }
//                                   className={`px-2 py-1 rounded-full text-sm font-medium transition-all duration-200 whitespace-nowrap ${
//                                     activeCategory === categoryName
//                                       ? "bg-blue-500 text-white shadow-md transform scale-105"
//                                       : "bg-gray-100 text-gray-700 hover:bg-gray-200"
//                                   }`}
//                                 >
//                                   {categoryName} ({subcategories.length})
//                                 </button>
//                               )
//                             )}
//                           </div>
//                         </div>

//                         {/* Subcategories for Active Category */}
//                         {activeCategory &&
//                           groupedSupportData[activeCategory] && (
//                             <div className="space-y-6">
//                               {groupedSupportData[activeCategory].map(
//                                 (subcategory) => (
//                                   <div
//                                     key={subcategory.id}
//                                     className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-6 w-full"
//                                   >
//                                     <h4 className="text-lg font-medium text-gray-800 mb-4">
//                                       {subcategory.SubCategoryName}
//                                     </h4>

//                                     <div className="space-y-4">
//                                       {/* Image Upload */}
//                                       <div className="space-y-2">
//                                         <label className="block text-sm font-medium text-gray-700">
//                                           Upload Image
//                                         </label>

//                                         <div className="flex items-center space-x-3">
//                                           {images[subcategory.id] ? (
//                                             <div className="relative">
//                                               <img
//                                                 src={
//                                                   images[subcategory.id].preview
//                                                 }
//                                                 alt="Preview"
//                                                 className="w-16 h-16 object-cover rounded-lg border-2 border-gray-300"
//                                               />
//                                               <button
//                                                 type="button"
//                                                 onClick={() =>
//                                                   removeImage(subcategory.id)
//                                                 }
//                                                 className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors shadow-lg"
//                                               >
//                                                 <X className="h-3 w-3" />
//                                               </button>
//                                             </div>
//                                           ) : (
//                                             <div className="w-16 h-16 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center hover:border-blue-400 transition-colors">
//                                               <input
//                                                 type="file"
//                                                 accept="image/*"
//                                                 onChange={(e) =>
//                                                   handleImageUpload(
//                                                     subcategory.id,
//                                                     e.target.files[0]
//                                                   )
//                                                 }
//                                                 className="hidden"
//                                                 id={`image-${subcategory.id}`}
//                                               />
//                                               <label
//                                                 htmlFor={`image-${subcategory.id}`}
//                                                 className="cursor-pointer"
//                                               >
//                                                 <Camera className="h-6 w-6 text-gray-400 hover:text-blue-500 transition-colors" />
//                                               </label>
//                                             </div>
//                                           )}

//                                           <div className="flex-1">
//                                             <input
//                                               type="file"
//                                               accept="image/*"
//                                               onChange={(e) =>
//                                                 handleImageUpload(
//                                                   subcategory.id,
//                                                   e.target.files[0]
//                                                 )
//                                               }
//                                               className="hidden"
//                                               id={`image-btn-${subcategory.id}`}
//                                             />
//                                             <label
//                                               htmlFor={`image-btn-${subcategory.id}`}
//                                               className="inline-flex items-center px-3 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 cursor-pointer transition-colors"
//                                             >
//                                               <Upload className="h-4 w-4 mr-2" />
//                                               {images[subcategory.id]
//                                                 ? "Change Image"
//                                                 : "Select Image"}
//                                             </label>
//                                           </div>
//                                         </div>

//                                         {images[subcategory.id] && (
//                                           <p className="text-xs text-gray-500 break-words">
//                                             {images[subcategory.id].file.name}
//                                           </p>
//                                         )}
//                                       </div>

//                                       {/* Observation Field */}
//                                       <div className="space-y-2">
//                                         <label className="block text-sm font-medium text-gray-700">
//                                           Observation
//                                         </label>
//                                         <textarea
//                                           rows={4}
//                                           className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none transition-all duration-200 text-sm min-h-24"
//                                           placeholder={`Enter observations for ${subcategory.SubCategoryName}...`}
//                                           value={
//                                             supportFormData[subcategory.id]
//                                               ?.observation || ""
//                                           }
//                                           onChange={(e) =>
//                                             handleSupportFormChange(
//                                               subcategory.id,
//                                               "observation",
//                                               e.target.value
//                                             )
//                                           }
//                                         />
//                                       </div>
//                                     </div>
//                                   </div>
//                                 )
//                               )}
//                             </div>
//                           )}
//                       </div>
//                     ) : (
//                       <div className="text-center py-8 text-gray-500">
//                         <AlertCircle className="h-12 w-12 mx-auto mb-4 text-gray-400" />
//                         <p>No support categories available</p>
//                       </div>
//                     )}
//                   </section>

//                   {/* Remark section */}
//                   <div className="space-y-2">
//                     <label className="block text-sm font-medium text-gray-700">
//                       Remark
//                     </label>
//                     <textarea
//                       rows={4}
//                       className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none transition-all duration-200 text-sm min-h-24"
//                       placeholder={`Enter remark`}
//                       value={remark || ""}
//                       onChange={(e) => setRemark(e.target.value)}
//                     />
//                   </div>
//                 </>
//               )}

//               {/* Submit/Checkout Section */}
//               <div className="sticky bottom-0 bg-white border-t border-gray-200 p-4 -mx-4">
//                 <button
//                   type="submit"
//                   disabled={submitting || uploadProgress.isUploading}
//                   className={`w-full py-3 px-6 rounded-xl font-semibold shadow-lg transform transition-all duration-200 ${
//                     submitting || uploadProgress.isUploading
//                       ? "bg-gray-400 text-gray-200 cursor-not-allowed"
//                       : "bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:from-blue-700 hover:to-indigo-700 hover:scale-105"
//                   }`}
//                 >
//                   {submitting ? (
//                     <div className="flex items-center justify-center">
//                       <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
//                       {uploadProgress.isUploading
//                         ? "Uploading Images..."
//                         : "Submitting..."}
//                     </div>
//                   ) : (
//                     <>
//                       Submit Report
//                       {selectedChecklistItems.length > 0 && (
//                         <span className="ml-2 bg-white bg-opacity-20 px-2 py-1 rounded text-sm">
//                           {selectedChecklistItems.length} tasks
//                         </span>
//                       )}
//                     </>
//                   )}
//                 </button>
//               </div>
//             </form>
//           ) : (
//             <div className="sticky bottom-0 bg-white border-t border-gray-200 p-4 -mx-4">
//               <div className="space-y-3">
//                 <div className="bg-green-50 border border-green-200 rounded-lg p-3 text-center">
//                   <CheckCircle className="h-6 w-6 text-green-600 mx-auto mb-2" />
//                   <p className="text-green-800 font-medium text-sm">
//                     Form submitted successfully!
//                   </p>
//                   <p className="text-green-600 text-xs">
//                     You can now checkout from this location
//                   </p>
//                   {/* Show upload summary if there were images */}
//                   {uploadProgress.total > 0 && (
//                     <div className="mt-2 text-xs text-green-700">
//                       Images: {uploadProgress.completed} uploaded,{" "}
//                       {uploadProgress.failed} failed
//                     </div>
//                   )}
//                 </div>
//                 <div className="flex space-x-3">
//                   {/* checkout button */}
//                   <button
//                     type="button"
//                     onClick={handleCheckout}
//                     disabled={submitting}
//                     className="flex-1 bg-gradient-to-r from-green-500 to-green-600 text-white font-poppins font-semibold py-3 px-4 rounded-lg hover:from-green-600 hover:to-green-700 transition-all disabled:opacity-50"
//                   >
//                     {submitting ? (
//                       <div className="flex items-center justify-center">
//                         <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-1"></div>
//                         Checking out...
//                       </div>
//                     ) : (
//                       "Checkout"
//                     )}
//                   </button>
//                 </div>
//               </div>
//             </div>
//           )}
//         </div>
//       </div>
//     </div>
//   );
// };

// export default Form;

// import React, { useState, useEffect } from "react";
// import {
//   Camera,
//   CheckCircle,
//   AlertCircle,
//   Upload,
//   X,
//   MapPin,
//   User,
//   Clock,
//   ArrowLeft,
// } from "lucide-react";
// import axiosInstance from "../../library/axios";
// import { useSelector, useDispatch } from "react-redux";
// import { useNavigate } from "react-router-dom";
// import { resetSession, setFormStatus } from "../../redux/slices/sessionSlice";
// import toast from "react-hot-toast";

// // FormSubmissionService class for handling split API calls
// class FormSubmissionService {
//   constructor() {
//     // this.baseURL = "/doctor"; // Adjust based on your API base URL
//   }

//   // Step 1: Submit form data only
//   async submitFormData(formData) {
//     const response = await axiosInstance.post(
//       "/doctor/submit-form-data",
//       formData,
//       {
//         headers: {
//           "Content-Type": "application/json",
//         },
//       }
//     );

//     if (response.data?.success) {
//       return response.data;
//     } else {
//       throw new Error(response.data?.message || "Form data submission failed");
//     }
//   }

//   // Step 2: Upload single image
//   async uploadImage(formDetailId, categoryId, subCategoryId, imageFile) {
//     const formData = new FormData();
//     formData.append("image", imageFile);
//     formData.append("formDetailId", formDetailId);
//     formData.append("categoryId", categoryId);
//     formData.append("subCategoryId", subCategoryId);

//     const response = await axiosInstance.post(
//       "/doctor/upload-form-image",
//       formData,
//       {
//         headers: {
//           "Content-Type": "multipart/form-data",
//         },
//       }
//     );

//     if (response.data?.success) {
//       return response.data;
//     } else {
//       throw new Error(response.data?.message || "Image upload failed");
//     }
//   }

//   // Step 3: Complete form submission
//   async completeSubmission(formDetailId, employeeId) {
//     const response = await axiosInstance.post(
//       "/doctor/complete-form-submission",
//       {
//         formDetailId,
//         employeeId,
//       },
//       {
//         headers: {
//           "Content-Type": "application/json",
//         },
//       }
//     );

//     if (response.data?.success) {
//       return response.data;
//     } else {
//       throw new Error(response.data?.message || "Form completion failed");
//     }
//   }

//   // Get upload status
//   async getUploadStatus(formDetailId) {
//     const response = await axiosInstance.get(`/doctor/status/${formDetailId}`);

//     if (response.data?.success) {
//       return response.data;
//     } else {
//       throw new Error(response.data?.message || "Failed to get status");
//     }
//   }
// }

// // BACKGROUND UPLOAD SERVICE - NEW CLASS
// class BackgroundUploadService {
//   constructor() {
//     this.uploadQueue = [];
//     this.isProcessing = false;
//     this.formService = new FormSubmissionService();
//   }

//   // Add upload job to queue
//   addUploadJob(
//     formDetailId,
//     imagesToUpload,
//     employeeId,
//     onProgress,
//     onComplete
//   ) {
//     const job = {
//       id: Date.now(),
//       formDetailId,
//       imagesToUpload,
//       onProgress,
//       employeeId,
//       onComplete,
//       status: "pending",
//     };

//     this.uploadQueue.push(job);
//     this.processQueue();
//     return job.id;
//   }

//   // Process upload queue
//   async processQueue() {
//     if (this.isProcessing || this.uploadQueue.length === 0) {
//       return;
//     }

//     this.isProcessing = true;

//     while (this.uploadQueue.length > 0) {
//       const job = this.uploadQueue.shift();
//       await this.processJob(job);
//     }

//     this.isProcessing = false;
//   }

//   // Process individual upload job
//   async processJob(job) {
//     const { formDetailId, imagesToUpload, employeeId, onProgress, onComplete } =
//       job;

//     try {
//       let completedCount = 0;
//       let failedCount = 0;

//       // Show initial progress
//       onProgress({
//         total: imagesToUpload.length,
//         completed: 0,
//         failed: 0,
//         current: "Starting upload...",
//         isUploading: true,
//       });

//       // Upload images one by one
//       for (let i = 0; i < imagesToUpload.length; i++) {
//         const image = imagesToUpload[i];

//         onProgress({
//           total: imagesToUpload.length,
//           completed: completedCount,
//           failed: failedCount,
//           current: `Uploading image ${i + 1} of ${imagesToUpload.length}`,
//           isUploading: true,
//         });

//         try {
//           await this.formService.uploadImage(
//             formDetailId,
//             image.categoryId,
//             image.subCategoryId,
//             image.file
//           );

//           completedCount++;
//           console.log(
//             `Background upload: Image ${i + 1} uploaded successfully`
//           );
//         } catch (error) {
//           console.error(
//             `Background upload: Failed to upload image ${i + 1}:`,
//             error
//           );
//           failedCount++;
//         }
//       }

//       // Complete submission if any images were uploaded successfully
//       if (completedCount > 0) {
//         try {
//           await this.formService.completeSubmission(formDetailId, employeeId);
//           console.log(
//             "Background upload: Form submission completed, email sent"
//           );
//         } catch (error) {
//           console.error(
//             "Background upload: Failed to complete submission:",
//             error
//           );
//         }
//       }

//       // Call completion callback
//       onComplete({
//         success: true,
//         completed: completedCount,
//         failed: failedCount,
//         total: imagesToUpload.length,
//       });
//     } catch (error) {
//       console.error("Background upload job failed:", error);
//       onComplete({
//         success: false,
//         error: error.message,
//       });
//     }
//   }
// }

// // Create singleton instance
// const backgroundUploadService = new BackgroundUploadService();

// const Form = () => {
//   const user = useSelector((state) => state.user.user);
//   const employeeId = user.EmployeeId;
//   const [checklistData, setChecklistData] = useState([]);
//   const [supportData, setSupportData] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState(null);
//   const [activeCategory, setActiveCategory] = useState("");

//   // Form state
//   const [selectedChecklistItems, setSelectedChecklistItems] = useState([]);
//   const [supportFormData, setSupportFormData] = useState({});
//   const [images, setImages] = useState({});
//   const [submitting, setSubmitting] = useState(false);
//   const [checkingOut, setCheckingOut] = useState(false);
//   const [formDetailId, setFormDetailId] = useState(null);
//   const [remark, setRemark] = useState("");

//   console.log(employeeId);
//   const formStatus = useSelector((state) => state.session.formStatus);
//   const sessionStatus = useSelector((state) => state.session.sessionStatus);
//   const locationDetails = useSelector((state) => state.session.locationDetails);
//   // const farmDetails = useSelector((state) => state.session.farmDetails);

//   console.log(sessionStatus);
//   // const selectedFarm = localStorage.getItem("selectedFarm");
//   // const FarmId = selectedFarm ? JSON.parse(selectedFarm)?.FarmId ?? null : null;

//   // const selectedLocation = localStorage.getItem("selectedLocation");
//   // const LocationId = selectedLocation ? JSON.parse(selectedLocation)?.LocationId ?? null : null;
//   // const selectedFarm = localStorage.getItem("selectedFarm");
//   // const FarmId = selectedFarm ? JSON.parse(selectedFarm)?.FarmId ?? null : null;

//   // const selectedLocation = localStorage.getItem("selectedLocation");
//   // const LocationId = selectedLocation
//   //   ? JSON.parse(selectedLocation)?.LocationId ?? null
//   //   : null;

//   const getLocation = localStorage.getItem("selectedLocation");
//   const selectedLocation = getLocation ? JSON.parse(getLocation) : null;
//   const LocationId = selectedLocation ? selectedLocation.LocationId : null;
//   const LocationName = selectedLocation ? selectedLocation.LocationName : null;

//   const getFarm = localStorage.getItem("selectedFarm");
//   const selectedFarm = getFarm ? JSON.parse(getFarm) : null;
//   const FarmId = selectedFarm ? selectedFarm.FarmId : null;
//   const FarmName = selectedFarm ? selectedFarm.farm.FarmName : null;

//   const dispatch = useDispatch();
//   const navigate = useNavigate();
//   useEffect(() => {
//     if (sessionStatus !== "checked_in") {
//       navigate("/dashboard");
//     }
//   }, []);

//   // Keep existing fetch functions unchanged
//   const fetchChecklistData = async () => {
//     try {
//       const response = await axiosInstance.get(`/doctor/doc-checklist-tasks`);
//       const result = response.data;

//       if (result.success && Array.isArray(result.data)) {
//         setChecklistData(result.data.filter((item) => item.isActive));
//       } else {
//         setChecklistData([]);
//       }
//     } catch (err) {
//       setError("Failed to fetch checklist data");
//       console.error("Checklist API Error:", err);
//       setChecklistData([]);
//     }
//   };
//   const fetchFormStatus = async () => {
//     try {
//       const response = await axiosInstance.get(
//         `/doctor/employee/${employeeId}/status`
//       );
//       const result = response.data;
//       console.log(result);
//       if (result.success) {
//         if (result.data.DocFormDetailId === null) {
//           dispatch(setFormStatus("not-submitted"));
//         } else {
//           dispatch(setFormStatus("submitted"));
//         }
//       }
//     } catch (err) {
//       console.error("Failed to fetch form status:", err);
//     }
//   };
//   useEffect(() => {
//     fetchFormStatus();
//   }, []);

//   const fetchSupportData = async () => {
//     try {
//       const response = await axiosInstance.get(`/doctor/support-subcategories`);
//       const result = response?.data;

//       if (result.success && Array.isArray(result.data)) {
//         setSupportData(result.data.filter((item) => item.isActive));
//       } else {
//         setSupportData([]);
//       }
//     } catch (err) {
//       setError("Failed to fetch support data");
//       console.error("Support API Error:", err);
//       setSupportData([]);
//     }
//   };

//   useEffect(() => {
//     const fetchData = async () => {
//       setLoading(true);
//       await Promise.all([fetchChecklistData(), fetchSupportData()]);
//       setLoading(false);
//     };
//     fetchData();
//   }, []);

//   // Group support data by category with proper error handling
//   const groupedSupportData = supportData.reduce((acc, item) => {
//     if (item && item.category && item.category.CategoryName) {
//       const categoryName = item.category.CategoryName;
//       if (!acc[categoryName]) {
//         acc[categoryName] = [];
//       }
//       acc[categoryName].push(item);
//     }
//     return acc;
//   }, {});

//   // Set first category as active by default
//   useEffect(() => {
//     const categories = Object.keys(groupedSupportData);
//     if (categories.length > 0 && !activeCategory) {
//       setActiveCategory(categories[0]);
//     }
//   }, [groupedSupportData, activeCategory]);

//   // Handle checklist item selection
//   const handleChecklistSelect = (itemId) => {
//     setSelectedChecklistItems((prev) =>
//       prev.includes(itemId)
//         ? prev.filter((id) => id !== itemId)
//         : [...prev, itemId]
//     );
//   };

//   // Handle support form data
//   const handleSupportFormChange = (subcategoryId, field, value) => {
//     setSupportFormData((prev) => ({
//       ...prev,
//       [subcategoryId]: {
//         ...prev[subcategoryId],
//         [field]: value,
//       },
//     }));
//   };

//   // Handle image upload
//   const handleImageUpload = async (subcategoryId, file) => {
//     if (!file) return;

//     try {
//       // Check file size - 20MB limit
//       const maxSizeInBytes = 20 * 1024 * 1024; // 10MB
//       if (file.size > maxSizeInBytes) {
//         toast.error("Image is too large. Maximum size is 20MB.");
//         return;
//       }

//       // Generate random filename
//       const fileExtension = file.name.split(".").pop();
//       const randomName = `img_${Math.random()
//         .toString(36)
//         .substring(2, 15)}_${Date.now()}.${fileExtension}`;

//       // Create a new file object with the random name
//       const renamedFile = new File([file], randomName, { type: file.type });

//       // Convert to preview URL
//       const reader = new FileReader();
//       reader.onload = (e) => {
//         setImages((prev) => ({
//           ...prev,
//           [subcategoryId]: {
//             file: renamedFile,
//             preview: e.target.result,
//           },
//         }));
//       };
//       reader.readAsDataURL(file);
//     } catch (error) {
//       console.error("Image handling failed:", error);
//     }
//   };

//   // Remove image
//   const removeImage = (subcategoryId) => {
//     setImages((prev) => {
//       const newImages = { ...prev };
//       delete newImages[subcategoryId];
//       return newImages;
//     });
//   };

//   // UPDATED: Handle form submission with immediate redirect
//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     setSubmitting(true);

//     try {
//       if (!remark || remark.trim() === "") {
//         toast.error("Remark is required");
//         return;
//       }

//       // Check if any image is uploaded without an observation
//       let missingObservations = false;
//       let firstMissingSubcategory = null;

//       Object.entries(images).forEach(([subcategoryId, imageData]) => {
//         const observation = supportFormData[subcategoryId]?.observation || "";
//         if (imageData && (!observation || observation.trim() === "")) {
//           missingObservations = true;
//           if (!firstMissingSubcategory) {
//             firstMissingSubcategory = supportData.find(
//               (item) => item.id === parseInt(subcategoryId)
//             );
//           }
//         }
//       });

//       if (missingObservations) {
//         toast.error(
//           `Observation is required for images. Please add observation for ${
//             firstMissingSubcategory?.SubCategoryName || "all uploaded images"
//           }.`
//         );
//         setSubmitting(false);
//         return;
//       }

//       // Prepare category details array
//       const categoryDetails = [];
//       const imagesToUpload = [];

//       // Process support form data
//       Object.entries(supportFormData).forEach(([subcategoryId, data]) => {
//         const subcategory = supportData.find(
//           (item) => item.id === parseInt(subcategoryId)
//         );

//         if (subcategory && subcategory.category) {
//           const categoryId = subcategory.category.id;

//           categoryDetails.push({
//             CategoryId: categoryId,
//             SubCategoryId: parseInt(subcategoryId),
//             Observation: data.observation || "",
//           });

//           // Collect images for upload
//           if (images[subcategoryId] && images[subcategoryId].file) {
//             imagesToUpload.push({
//               file: images[subcategoryId].file,
//               categoryId: categoryId,
//               subCategoryId: parseInt(subcategoryId),
//             });
//           }
//         }
//       });

//       // Prepare form data for first API call
//       const formDataToSubmit = {
//         EmployeeId: employeeId,
//         LocationId: LocationId,
//         FarmId: FarmId,
//         remark: remark,
//         categoryDetails: categoryDetails,
//         checklistItems: selectedChecklistItems,
//       };

//       console.log("Submitting form data:", formDataToSubmit);

//       // Step 1: Submit form data only (fast)
//       const formService = new FormSubmissionService();
//       const formResult = await formService.submitFormData(formDataToSubmit);

//       if (!formResult.success) {
//         throw new Error(formResult.message);
//       }

//       const newFormDetailId = formResult.data.formDetailId;
//       setFormDetailId(newFormDetailId);

//       // Update form status immediately
//       dispatch(setFormStatus("submitted"));

//       // Show success message
//       toast.success("Form submitted successfully!");

//       // If there are images, start background upload and show notification
//       if (imagesToUpload.length > 0) {
//         // Show background upload notification
//         // toast.success(`Some images will upload in background.`, {
//         //   duration: 4000,
//         // });
//         // toast.success(
//         //   `Form saved! ${imagesToUpload.length} images will upload in background.`,
//         //   { duration: 4000 }
//         // );

//         // Start background upload
//         backgroundUploadService.addUploadJob(
//           newFormDetailId,
//           imagesToUpload,
//           employeeId, // Pass employeeId to backgroundUploadService
//           // Progress callback
//           (progress) => {
//             console.log("Background upload progress:", progress);
//             // You can show a subtle notification or update app state here
//           },
//           // Completion callback
//           (result) => {
//             if (result.success) {
//               toast.success(
//                 `Background upload completed! ${result.completed} images uploaded successfully.`,
//                 { duration: 3000 }
//               );
//             } else {
//               toast.error(
//                 "Background upload failed. Please check your connection."
//               );
//             }
//           }
//         );
//       } else {
//         // No images, complete the submission immediately
//         try {
//           console.log("Completing submission with:", {
//             formDetailId: newFormDetailId,
//             employeeId: employeeId, // Use the Redux employeeId directly
//           });

//           // Ensure employeeId is not null/undefined
//           // if (!employeeId) {
//           //   console.error("EmployeeId not found in Redux state");
//           //   toast.error("Employee ID not found. Please log in again.");
//           //   return;
//           // }

//           // Pass employeeId to completeSubmission
//           await formService.completeSubmission(newFormDetailId, employeeId);
//         } catch (error) {
//           console.error("Failed to complete submission:", error);
//         }
//       }

//       // // IMMEDIATE REDIRECT - This is the key change!
//       // setTimeout(() => {
//       //   navigate("/dashboard/checkin", {
//       //     state: {
//       //       formSubmitted: true,
//       //       formDetailId: newFormDetailId,
//       //       hasBackgroundUploads: imagesToUpload.length > 0,
//       //     },
//       //   });
//       // }, 1000); // Small delay to show success message
//     } catch (err) {
//       console.error("Form submission error:", err);
//       toast.error(`Failed to submit form: ${err.message}`);
//     } finally {
//       setSubmitting(false);
//     }
//   };
//   // Get current location for checkout
//   const getCurrentLocation = () => {
//     return new Promise((resolve, reject) => {
//       if (!navigator.geolocation) {
//         reject(new Error("Geolocation is not supported by this browser"));
//         return;
//       }

//       navigator.geolocation.getCurrentPosition(
//         (position) => {
//           const coords = {
//             latitude: position.coords.latitude.toString(),
//             longitude: position.coords.longitude.toString(),
//           };
//           resolve(coords);
//         },
//         (error) => {
//           let errorMessage = "Unable to get location";
//           switch (error.code) {
//             case error.PERMISSION_DENIED:
//               errorMessage = "Location access denied by user";
//               break;
//             case error.POSITION_UNAVAILABLE:
//               errorMessage = "Location information unavailable";
//               break;
//             case error.TIMEOUT:
//               errorMessage = "Location request timed out";
//               break;
//           }
//           reject(new Error(errorMessage));
//         },
//         {
//           enableHighAccuracy: true,
//           timeout: 10000,
//           maximumAge: 60000,
//         }
//       );
//     });
//   };

//   // Handle checkout API call
//   const handleCheckout = async () => {
//     try {
//       setCheckingOut(true);

//       // Get current location for checkout
//       const coords = await getCurrentLocation();

//       const checkoutData = {
//         EmployeeId: parseInt(employeeId),
//         checkoutLatitude: coords.latitude,
//         checkoutLongitude: coords.longitude,
//         checkoutTime: new Date().toISOString(),
//         DocFormDetailId: formDetailId, // Use the formDetailId from form submission response
//         // travelInfoId: ?.id, // Use the travel ID
//       };

//       console.log("Checkout data:", checkoutData);

//       const response = await axiosInstance.post(
//         `/doctor/checkout`,
//         checkoutData
//       );

//       const result = response?.data;

//       if (result.success) {
//         console.log("Checkout response:", result);
//         toast.success("Checkout successful!");
//         dispatch(resetSession());
//         navigate("/dashboard");
//       } else {
//         throw new Error(result.message || "Checkout failed");
//       }
//     } catch (err) {
//       console.error("Checkout error:", err);
//       toast.error(`Checkout failed: ${err.message}`);
//     } finally {
//       setCheckingOut(false);
//     }
//   };

//   if (loading) {
//     return (
//       <div className="flex items-center justify-center">
//         <div className="text-center">
//           <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
//           <p className="text-gray-600">Loading farm visit form...</p>
//         </div>
//       </div>
//     );
//   }

//   if (error) {
//     return (
//       <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
//         <div className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-md">
//           <div className="flex items-center">
//             <AlertCircle className="h-5 w-5 text-red-500 mr-2" />
//             <p className="text-red-700">{error}</p>
//           </div>
//           <button
//             onClick={() => window.location.reload()}
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
//       <div className="max-w-md mx-auto">
//         <div className="bg-white overflow-hidden">
//           {/* Header */}
//           <div className="bg-gradient-to-r from-green-700 to-green-800 px-6 py-4 rounded-lg">
//             <div className="flex justify-between items-start">
//               <div>
//                 <h1 className="text-xl font-bold text-white">
//                   Farm Visit Report
//                 </h1>
//                 <p className="text-white text-sm mt-1">
//                   Complete checklist and document issues
//                 </p>
//               </div>
//               <div className="text-right">
//                 <button
//                   onClick={() => navigate("/dashboard/checkin")}
//                   className="text-white text-sm transition-colors mb-1 border border-white rounded-lg px-2 py-1 m-1 block"
//                 >
//                   Back
//                 </button>
//               </div>
//             </div>
//           </div>
//           {/* Travel Info */}
//           <div className="bg-gray-50 px-4 py-3 border-b">
//             <div className="grid grid-cols-2 gap-3 text-xs">
//               <div className="flex items-center">
//                 <MapPin className="h-3 w-3 text-green-600 mr-1" />
//                 <div>
//                   <p className="text-gray-600">Location</p>
//                   <p className="font-medium text-gray-900 text-xs">
//                     {/* {locationDetails ? locationDetails.locationName : "N/A"}
//                     {farmDetails && ` - ${farmDetails.farmName}`} */}
//                     {LocationName}- {FarmName}
//                   </p>
//                 </div>
//               </div>
//               <div className="flex items-center">
//                 <User className="h-3 w-3 text-blue-600 mr-1" />
//                 <div>
//                   <p className="text-gray-600">Doctor</p>
//                   <p className="font-medium text-gray-900 text-xs">
//                     {user?.EmployeeName}
//                   </p>
//                 </div>
//               </div>
//               <div className="flex items-center">
//                 <Clock className="h-3 w-3 text-orange-600 mr-1" />
//                 <div>
//                   <p className="text-gray-600">Check-in</p>
//                   <p className="font-medium text-gray-900 text-xs">
//                     {sessionStatus === "checked_in" ? "Checked In" : "N/A"}
//                   </p>
//                 </div>
//               </div>
//               <div className="flex items-center">
//                 <CheckCircle className="h-3 w-3 text-purple-600 mr-1" />
//                 <div>
//                   <p className="text-gray-600">Form Status</p>
//                   <p className="font-medium text-gray-900 text-xs">
//                     {formStatus === "submitted" ? "Submitted" : "Not Submitted"}
//                   </p>
//                 </div>
//               </div>
//             </div>
//           </div>

//           {!formStatus || formStatus === "not-submitted" ? (
//             <form onSubmit={handleSubmit} className="p-4 space-y-6">
//               {locationDetails?.locationName === "HO Visit" ? (
//                 // HO Visit - Only show remark field
//                 <div className="space-y-4">
//                   <div className="flex items-center space-x-3 mb-6">
//                     <h2 className="text-2xl font-semibold text-gray-800">
//                       HO Visit Remark
//                     </h2>
//                   </div>

//                   {/* Remark section */}
//                   <div className="space-y-2">
//                     <label className="block text-md font-medium text-gray-700">
//                       Remark <span className="text-red-500">*</span>
//                       <span className="text-red-500 text-xs">required</span>
//                     </label>
//                     <textarea
//                       rows={8}
//                       className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none transition-all duration-200 text-sm min-h-24"
//                       placeholder="Enter your observations or notes for this visit"
//                       value={remark || ""}
//                       onChange={(e) => setRemark(e.target.value)}
//                     />
//                   </div>
//                 </div>
//               ) : (
//                 // Farm Visit - Show original content with checklist and support
//                 <>
//                   {/* Checklist Section */}
//                   <section className="space-y-6">
//                     <div className="flex items-center space-x-3 mb-6">
//                       <div className="bg-blue-100 rounded-full p-2">
//                         <CheckCircle className="h-6 w-6 text-blue-600" />
//                       </div>
//                       <h2 className="text-2xl font-semibold text-gray-800">
//                         Top Pointers
//                       </h2>
//                     </div>

//                     {checklistData.length > 0 ? (
//                       <div className="grid md:grid-cols-2 gap-4">
//                         {checklistData.map((item) => (
//                           <div
//                             key={item.id}
//                             className={`border-2 rounded-xl p-4 cursor-pointer transition-all duration-200 ${
//                               selectedChecklistItems.includes(item.id)
//                                 ? "border-green-500 bg-green-50 shadow-md transform scale-105"
//                                 : "border-gray-200 hover:border-blue-300 hover:shadow-sm"
//                             }`}
//                             onClick={() => handleChecklistSelect(item.id)}
//                           >
//                             <div className="flex items-center justify-between">
//                               <span className="font-medium text-gray-800">
//                                 {item.ChecklistTask}
//                               </span>
//                               <div
//                                 className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all duration-200 ${
//                                   selectedChecklistItems.includes(item.id)
//                                     ? "border-green-500 bg-green-500"
//                                     : "border-gray-300"
//                                 }`}
//                               >
//                                 {selectedChecklistItems.includes(item.id) && (
//                                   <CheckCircle className="h-3 w-3 text-white" />
//                                 )}
//                               </div>
//                             </div>
//                           </div>
//                         ))}
//                       </div>
//                     ) : (
//                       <div className="text-center py-8 text-gray-500">
//                         <AlertCircle className="h-12 w-12 mx-auto mb-4 text-gray-400" />
//                         <p>No checklist tasks available</p>
//                       </div>
//                     )}
//                   </section>
//                   {/* Support Section */}
//                   <section className="space-y-6">
//                     <div className="flex items-center space-x-3 mb-6">
//                       <div className="bg-orange-100 rounded-full p-2">
//                         <AlertCircle className="h-6 w-6 text-orange-600" />
//                       </div>
//                       <h2 className="text-2xl font-semibold text-gray-800">
//                         Support
//                       </h2>
//                     </div>

//                     {Object.keys(groupedSupportData).length > 0 ? (
//                       <div className="space-y-6">
//                         {/* Category Tabs */}
//                         <div className="overflow-x-auto pb-2">
//                           <div className="flex space-x-2 min-w-max px-2 py-1">
//                             {Object.entries(groupedSupportData).map(
//                               ([categoryName, subcategories]) => (
//                                 <button
//                                   key={categoryName}
//                                   type="button"
//                                   onClick={() =>
//                                     setActiveCategory(categoryName)
//                                   }
//                                   className={`px-2 py-1 rounded-full text-sm font-medium transition-all duration-200 whitespace-nowrap ${
//                                     activeCategory === categoryName
//                                       ? "bg-blue-500 text-white shadow-md transform scale-105"
//                                       : "bg-gray-100 text-gray-700 hover:bg-gray-200"
//                                   }`}
//                                 >
//                                   {categoryName} ({subcategories.length})
//                                 </button>
//                               )
//                             )}
//                           </div>
//                         </div>

//                         {/* Subcategories for Active Category */}
//                         {activeCategory &&
//                           groupedSupportData[activeCategory] && (
//                             <div className="space-y-6">
//                               {groupedSupportData[activeCategory].map(
//                                 (subcategory) => (
//                                   <div
//                                     key={subcategory.id}
//                                     className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-6 w-full"
//                                   >
//                                     <h4 className="text-lg font-medium text-gray-800 mb-4">
//                                       {subcategory.SubCategoryName}
//                                     </h4>

//                                     <div className="space-y-4">
//                                       {/* Image Upload */}
//                                       <div className="space-y-2">
//                                         <label className="block text-sm font-medium text-gray-700">
//                                           Upload Image
//                                         </label>

//                                         <div className="flex items-center space-x-3">
//                                           {images[subcategory.id] ? (
//                                             <div className="relative">
//                                               <img
//                                                 src={
//                                                   images[subcategory.id].preview
//                                                 }
//                                                 alt="Preview"
//                                                 className="w-16 h-16 object-cover rounded-lg border-2 border-gray-300"
//                                               />
//                                               <button
//                                                 type="button"
//                                                 onClick={() =>
//                                                   removeImage(subcategory.id)
//                                                 }
//                                                 className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors shadow-lg"
//                                               >
//                                                 <X className="h-3 w-3" />
//                                               </button>
//                                             </div>
//                                           ) : (
//                                             <div className="w-16 h-16 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center hover:border-blue-400 transition-colors">
//                                               <input
//                                                 type="file"
//                                                 accept="image/*"
//                                                 onChange={(e) =>
//                                                   handleImageUpload(
//                                                     subcategory.id,
//                                                     e.target.files[0]
//                                                   )
//                                                 }
//                                                 className="hidden"
//                                                 id={`image-${subcategory.id}`}
//                                               />
//                                               <label
//                                                 htmlFor={`image-${subcategory.id}`}
//                                                 className="cursor-pointer"
//                                               >
//                                                 <Camera className="h-6 w-6 text-gray-400 hover:text-blue-500 transition-colors" />
//                                               </label>
//                                             </div>
//                                           )}

//                                           <div className="flex-1">
//                                             <input
//                                               type="file"
//                                               accept="image/*"
//                                               onChange={(e) =>
//                                                 handleImageUpload(
//                                                   subcategory.id,
//                                                   e.target.files[0]
//                                                 )
//                                               }
//                                               className="hidden"
//                                               id={`image-btn-${subcategory.id}`}
//                                             />
//                                             <label
//                                               htmlFor={`image-btn-${subcategory.id}`}
//                                               className="inline-flex items-center px-3 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 cursor-pointer transition-colors"
//                                             >
//                                               <Upload className="h-4 w-4 mr-2" />
//                                               {images[subcategory.id]
//                                                 ? "Change Image"
//                                                 : "Select Image"}
//                                             </label>
//                                           </div>
//                                         </div>

//                                         {images[subcategory.id] && (
//                                           <p className="text-xs text-gray-500 break-words">
//                                             {images[subcategory.id].file.name}
//                                           </p>
//                                         )}
//                                       </div>

//                                       {/* Observation Field */}
//                                       <div className="space-y-2">
//                                         <label className="block text-sm font-medium text-gray-700">
//                                           Observation
//                                           {images[subcategory.id] && (
//                                             <span className="text-red-500 ml-1">
//                                               *
//                                             </span>
//                                           )}
//                                         </label>
//                                         <textarea
//                                           rows={4}
//                                           className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none transition-all duration-200 text-sm min-h-24 ${
//                                             images[subcategory.id] &&
//                                             (!supportFormData[subcategory.id]
//                                               ?.observation ||
//                                               supportFormData[
//                                                 subcategory.id
//                                               ]?.observation.trim() === "")
//                                               ? "border-red-300"
//                                               : "border-gray-300"
//                                           }`}
//                                           placeholder={`Enter observations for ${subcategory.SubCategoryName}...`}
//                                           value={
//                                             supportFormData[subcategory.id]
//                                               ?.observation || ""
//                                           }
//                                           onChange={(e) =>
//                                             handleSupportFormChange(
//                                               subcategory.id,
//                                               "observation",
//                                               e.target.value
//                                             )
//                                           }
//                                         />
//                                       </div>
//                                     </div>
//                                   </div>
//                                 )
//                               )}
//                             </div>
//                           )}
//                       </div>
//                     ) : (
//                       <div className="text-center py-8 text-gray-500">
//                         <AlertCircle className="h-12 w-12 mx-auto mb-4 text-gray-400" />
//                         <p>No support categories available</p>
//                       </div>
//                     )}
//                   </section>

//                   {/* Remark section */}
//                   <div className="space-y-2">
//                     <label className="block text-sm font-medium text-gray-700">
//                       <span className="text-red-500">*</span>Remark{" "}
//                       <span className="text-red-500 text-xs">(required)</span>
//                     </label>
//                     <textarea
//                       rows={8}
//                       className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none transition-all duration-200 text-sm min-h-24"
//                       placeholder="Enter your observations or notes for this visit"
//                       value={remark || ""}
//                       onChange={(e) => setRemark(e.target.value)}
//                     />
//                   </div>
//                 </>
//               )}
//               {/* Submit/Checkout Section */}
//               <div className="sticky bottom-0 bg-white border-t border-gray-200 p-4 -mx-4">
//                 <button
//                   type="submit"
//                   disabled={submitting}
//                   className={`w-full py-3 px-6 rounded-xl font-semibold shadow-lg transform transition-all duration-200 ${
//                     submitting
//                       ? "bg-gray-400 text-gray-200 cursor-not-allowed"
//                       : "bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:from-blue-700 hover:to-indigo-700 hover:scale-105"
//                   }`}
//                 >
//                   {submitting ? (
//                     <div className="flex items-center justify-center">
//                       <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
//                       Submitting
//                     </div>
//                   ) : (
//                     <>
//                       Submit Report
//                       {selectedChecklistItems.length > 0 && (
//                         <span className="ml-2 bg-white bg-opacity-20 px-2 py-1 rounded text-sm">
//                           {selectedChecklistItems.length} tasks
//                         </span>
//                       )}
//                     </>
//                   )}
//                 </button>
//               </div>
//             </form>
//           ) : (
//             <div className="sticky bottom-0 bg-white border-t border-gray-200 p-4 -mx-4">
//               <div className="space-y-3">
//                 <div className="bg-green-50 border border-green-200 rounded-lg p-3 text-center">
//                   <CheckCircle className="h-6 w-6 text-green-600 mx-auto mb-2" />
//                   <p className="text-green-800 font-medium text-sm">
//                     Form submitted successfully!
//                   </p>
//                   <p className="text-green-600 text-xs">
//                     You can now checkout from this location
//                   </p>
//                 </div>
//                 <div className="flex space-x-3">
//                   {/* checkout button */}
//                   <button
//                     type="button"
//                     onClick={handleCheckout}
//                     disabled={checkingOut}
//                     className="flex-1 bg-gradient-to-r from-green-500 to-green-600 text-white font-poppins font-semibold py-3 px-4 rounded-lg hover:from-green-600 hover:to-green-700 transition-all disabled:opacity-50"
//                   >
//                     {checkingOut ? (
//                       <div className="flex items-center justify-center">
//                         <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-1"></div>
//                         Checking out...
//                       </div>
//                     ) : (
//                       "Checkout"
//                     )}
//                   </button>
//                 </div>
//               </div>
//             </div>
//           )}
//         </div>
//       </div>
//     </div>
//   );
// };

// export default Form;

// import React, { useState, useEffect } from "react";
// import {
//   Camera,
//   CheckCircle,
//   AlertCircle,
//   Upload,
//   X,
//   MapPin,
//   User,
//   Clock,
//   ArrowLeft,
//   Wifi,
//   WifiOff,
//   CloudOff,
//   RefreshCcw as Sync,
// } from "lucide-react";
// import axiosInstance from "../../library/axios";
// import { useSelector, useDispatch } from "react-redux";
// import { useNavigate } from "react-router-dom";
// import { resetSession, setFormStatus } from "../../redux/slices/sessionSlice";
// import toast from "react-hot-toast";
// import { useOfflineForm } from "../../hooks/useOfflineForm";

// const Form = () => {
//   const user = useSelector((state) => state.user.user);
//   const [checklistData, setChecklistData] = useState([]);
//   const [supportData, setSupportData] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState(null);
//   const [activeCategory, setActiveCategory] = useState("");
//   const [checkingOut, setCheckingOut] = useState(false);

//   // Form state
//   const [selectedChecklistItems, setSelectedChecklistItems] = useState([]);
//   const [supportFormData, setSupportFormData] = useState({});
//   const [images, setImages] = useState({});
//   const [remark, setRemark] = useState("");

//   // Use offline form hook
//   const {
//     submitting,
//     formDetailId,
//     networkStatus,
//     pendingSyncCount,
//     syncStatus,
//     formStatus,
//     sessionStatus,
//     submitForm,
//     handleSync,
//     validateFormData,
//     getNetworkStatusDisplay,
//     getSyncStatusDisplay,
//     canSubmitForm,
//     getSubmissionStatusMessage,
//     employeeId,
//   } = useOfflineForm();

//   const locationDetails = useSelector((state) => state.session.locationDetails);
//   const dispatch = useDispatch();
//   const navigate = useNavigate();

//   // Get location and farm data
//   const getLocation = localStorage.getItem("selectedLocation");
//   const selectedLocation = getLocation ? JSON.parse(getLocation) : null;
//   const LocationId = selectedLocation ? selectedLocation.LocationId : null;
//   const LocationName = selectedLocation ? selectedLocation.LocationName : null;

//   const getFarm = localStorage.getItem("selectedFarm");
//   const selectedFarm = getFarm ? JSON.parse(getFarm) : null;
//   const FarmId = selectedFarm ? selectedFarm.FarmId : null;
//   const FarmName = selectedFarm ? selectedFarm.farm.FarmName : null;

//   useEffect(() => {
//     if (sessionStatus !== "checked_in") {
//       navigate("/dashboard");
//     }
//   }, [sessionStatus, navigate]);

//   // Fetch functions - only when online
//   const fetchChecklistData = async () => {
//     if (!networkStatus.isOnline) {
//       console.log("Skipping checklist fetch - offline");
//       return;
//     }

//     try {
//       const response = await axiosInstance.get(`/doctor/doc-checklist-tasks`);
//       const result = response.data;

//       if (result.success && Array.isArray(result.data)) {
//         setChecklistData(result.data.filter((item) => item.isActive));
//       } else {
//         setChecklistData([]);
//       }
//     } catch (err) {
//       setError("Failed to fetch checklist data");
//       console.error("Checklist API Error:", err);
//       setChecklistData([]);
//     }
//   };

//   const fetchFormStatus = async () => {
//     if (!networkStatus.isOnline) {
//       // When offline, assume not submitted unless we have local data
//       dispatch(setFormStatus("not-submitted"));
//       return;
//     }

//     try {
//       const response = await axiosInstance.get(
//         `/doctor/employee/${employeeId}/status`
//       );
//       const result = response.data;
//       if (result.success) {
//         if (result.data.DocFormDetailId === null) {
//           dispatch(setFormStatus("not-submitted"));
//         } else {
//           dispatch(setFormStatus("submitted"));
//         }
//       }
//     } catch (err) {
//       console.error("Failed to fetch form status:", err);
//       // Don't update status on error when offline
//     }
//   };

//   const fetchSupportData = async () => {
//     if (!networkStatus.isOnline) {
//       console.log("Skipping support data fetch - offline");
//       return;
//     }

//     try {
//       const response = await axiosInstance.get(`/doctor/support-subcategories`);
//       const result = response?.data;

//       if (result.success && Array.isArray(result.data)) {
//         setSupportData(result.data.filter((item) => item.isActive));
//       } else {
//         setSupportData([]);
//       }
//     } catch (err) {
//       setError("Failed to fetch support data");
//       console.error("Support API Error:", err);
//       setSupportData([]);
//     }
//   };

//   useEffect(() => {
//     if (employeeId) {
//       fetchFormStatus();
//     }
//   }, [employeeId, networkStatus.isOnline]);

//   useEffect(() => {
//     const fetchData = async () => {
//       setLoading(true);
//       await Promise.all([fetchChecklistData(), fetchSupportData()]);
//       setLoading(false);
//     };
//     fetchData();
//   }, [networkStatus.isOnline]);

//   // Group support data by category with proper error handling
//   const groupedSupportData = supportData.reduce((acc, item) => {
//     if (item && item.category && item.category.CategoryName) {
//       const categoryName = item.category.CategoryName;
//       if (!acc[categoryName]) {
//         acc[categoryName] = [];
//       }
//       acc[categoryName].push(item);
//     }
//     return acc;
//   }, {});

//   // Set first category as active by default
//   useEffect(() => {
//     const categories = Object.keys(groupedSupportData);
//     if (categories.length > 0 && !activeCategory) {
//       setActiveCategory(categories[0]);
//     }
//   }, [groupedSupportData, activeCategory]);

//   // Handle checklist item selection
//   const handleChecklistSelect = (itemId) => {
//     setSelectedChecklistItems((prev) =>
//       prev.includes(itemId)
//         ? prev.filter((id) => id !== itemId)
//         : [...prev, itemId]
//     );
//   };

//   // Handle support form data
//   const handleSupportFormChange = (subcategoryId, field, value) => {
//     setSupportFormData((prev) => ({
//       ...prev,
//       [subcategoryId]: {
//         ...prev[subcategoryId],
//         [field]: value,
//       },
//     }));
//   };

//   // Handle image upload
//   const handleImageUpload = async (subcategoryId, file) => {
//     if (!file) return;

//     try {
//       // Check file size - 20MB limit
//       const maxSizeInBytes = 20 * 1024 * 1024;
//       if (file.size > maxSizeInBytes) {
//         toast.error("Image is too large. Maximum size is 20MB.");
//         return;
//       }

//       // Generate random filename
//       const fileExtension = file.name.split(".").pop();
//       const randomName = `img_${Math.random()
//         .toString(36)
//         .substring(2, 15)}_${Date.now()}.${fileExtension}`;

//       // Create a new file object with the random name
//       const renamedFile = new File([file], randomName, { type: file.type });

//       // Convert to preview URL
//       const reader = new FileReader();
//       reader.onload = (e) => {
//         setImages((prev) => ({
//           ...prev,
//           [subcategoryId]: {
//             file: renamedFile,
//             preview: e.target.result,
//           },
//         }));
//       };
//       reader.readAsDataURL(file);
//     } catch (error) {
//       console.error("Image handling failed:", error);
//       toast.error("Failed to process image");
//     }
//   };

//   // Remove image
//   const removeImage = (subcategoryId) => {
//     setImages((prev) => {
//       const newImages = { ...prev };
//       delete newImages[subcategoryId];
//       return newImages;
//     });
//   };

//   // Handle form submission with offline support
//   const handleSubmit = async (e) => {
//     e.preventDefault();

//     if (!canSubmitForm()) {
//       toast.error("Cannot submit form at this time");
//       return;
//     }

//     // Validate form data
//     const validationErrors = validateFormData(
//       { remark, categoryDetails: prepareCategoryDetails() },
//       images,
//       supportData
//     );

//     if (validationErrors.length > 0) {
//       toast.error(validationErrors[0]);
//       return;
//     }

//     try {
//       // Prepare form data
//       const formData = {
//         LocationId: LocationId,
//         FarmId: FarmId,
//         remark: remark,
//         categoryDetails: prepareCategoryDetails(),
//         checklistItems: selectedChecklistItems,
//       };

//       // Submit form using offline-capable service
//       const result = await submitForm(formData, images, supportData);

//       if (result.success) {
//         // Form submitted successfully (online or offline)
//         console.log("Form submission result:", result);
//       }
//     } catch (err) {
//       console.error("Form submission error:", err);
//     }
//   };

//   // Prepare category details for submission
//   const prepareCategoryDetails = () => {
//     const categoryDetails = [];

//     Object.entries(supportFormData).forEach(([subcategoryId, data]) => {
//       const subcategory = supportData.find(
//         (item) => item.id === parseInt(subcategoryId)
//       );

//       if (subcategory && subcategory.category) {
//         categoryDetails.push({
//           CategoryId: subcategory.category.id,
//           SubCategoryId: parseInt(subcategoryId),
//           Observation: data.observation || "",
//         });
//       }
//     });

//     return categoryDetails;
//   };

//   // Get current location for checkout
//   const getCurrentLocation = () => {
//     return new Promise((resolve, reject) => {
//       if (!navigator.geolocation) {
//         reject(new Error("Geolocation is not supported by this browser"));
//         return;
//       }

//       navigator.geolocation.getCurrentPosition(
//         (position) => {
//           const coords = {
//             latitude: position.coords.latitude.toString(),
//             longitude: position.coords.longitude.toString(),
//           };
//           resolve(coords);
//         },
//         (error) => {
//           let errorMessage = "Unable to get location";
//           switch (error.code) {
//             case error.PERMISSION_DENIED:
//               errorMessage = "Location access denied by user";
//               break;
//             case error.POSITION_UNAVAILABLE:
//               errorMessage = "Location information unavailable";
//               break;
//             case error.TIMEOUT:
//               errorMessage = "Location request timed out";
//               break;
//           }
//           reject(new Error(errorMessage));
//         },
//         {
//           enableHighAccuracy: true,
//           timeout: 10000,
//           maximumAge: 60000,
//         }
//       );
//     });
//   };

//   // Handle checkout API call
//   const handleCheckout = async () => {
//     if (!networkStatus.isOnline) {
//       toast.error("Cannot checkout while offline. Please wait for connection.");
//       return;
//     }

//     try {
//       setCheckingOut(true);

//       // Get current location for checkout
//       const coords = await getCurrentLocation();

//       const checkoutData = {
//         EmployeeId: parseInt(employeeId),
//         checkoutLatitude: coords.latitude,
//         checkoutLongitude: coords.longitude,
//         checkoutTime: new Date().toISOString(),
//         DocFormDetailId: formDetailId,
//       };

//       const response = await axiosInstance.post(
//         `/doctor/checkout`,
//         checkoutData
//       );
//       const result = response?.data;

//       if (result.success) {
//         toast.success("Checkout successful!");
//         dispatch(resetSession());
//         navigate("/dashboard");
//       } else {
//         throw new Error(result.message || "Checkout failed");
//       }
//     } catch (err) {
//       console.error("Checkout error:", err);
//       toast.error(`Checkout failed: ${err.message}`);
//     } finally {
//       setCheckingOut(false);
//     }
//   };

//   // Network status component
//   const NetworkStatusIndicator = () => {
//     const statusDisplay = getNetworkStatusDisplay();
//     const syncDisplay = getSyncStatusDisplay();

//     return (
//       <div className="bg-gray-50 px-4 py-2 border-b">
//         <div className="flex items-center justify-between text-xs">
//           <div className="flex items-center space-x-2">
//             <div className="flex items-center">
//               {networkStatus.isOnline ? (
//                 <Wifi className="h-3 w-3 text-green-500 mr-1" />
//               ) : (
//                 <WifiOff className="h-3 w-3 text-red-500 mr-1" />
//               )}
//               <span className={statusDisplay.color}>{statusDisplay.text}</span>
//             </div>

//             <div className="flex items-center">
//               <span className={syncDisplay.color}>{syncDisplay.text}</span>
//               {syncDisplay.showSync && (
//                 <button
//                   onClick={handleSync}
//                   disabled={syncStatus === "syncing" || !networkStatus.isOnline}
//                   className="ml-2 text-blue-500 hover:text-blue-700 disabled:text-gray-400"
//                 >
//                   <Sync
//                     className={`h-3 w-3 ${
//                       syncStatus === "syncing" ? "animate-spin" : ""
//                     }`}
//                   />
//                 </button>
//               )}
//             </div>
//           </div>

//           <div className="text-gray-500">{getSubmissionStatusMessage()}</div>
//         </div>
//       </div>
//     );
//   };

//   if (loading) {
//     return (
//       <div className="flex items-center justify-center">
//         <div className="text-center">
//           <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
//           <p className="text-gray-600">Loading farm visit form...</p>
//         </div>
//       </div>
//     );
//   }

//   if (error) {
//     return (
//       <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
//         <div className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-md">
//           <div className="flex items-center">
//             <AlertCircle className="h-5 w-5 text-red-500 mr-2" />
//             <p className="text-red-700">{error}</p>
//           </div>
//           <button
//             onClick={() => window.location.reload()}
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
//       <div className="max-w-md mx-auto">
//         <div className="bg-white overflow-hidden">
//           {/* Header */}
//           <div className="bg-gradient-to-r from-green-700 to-green-800 px-6 py-4 rounded-lg">
//             <div className="flex justify-between items-start">
//               <div>
//                 <h1 className="text-xl font-bold text-white">
//                   Farm Visit Report
//                 </h1>
//                 <p className="text-white text-sm mt-1">
//                   Complete checklist and document issues
//                 </p>
//               </div>
//               <div className="text-right">
//                 <button
//                   onClick={() => navigate("/dashboard/checkin")}
//                   className="text-white text-sm transition-colors mb-1 border border-white rounded-lg px-2 py-1 m-1 block"
//                 >
//                   Back
//                 </button>
//               </div>
//             </div>
//           </div>

//           {/* Network Status Indicator */}
//           <NetworkStatusIndicator />

//           {/* Travel Info */}
//           <div className="bg-gray-50 px-4 py-3 border-b">
//             <div className="grid grid-cols-2 gap-3 text-xs">
//               <div className="flex items-center">
//                 <MapPin className="h-3 w-3 text-green-600 mr-1" />
//                 <div>
//                   <p className="text-gray-600">Location</p>
//                   <p className="font-medium text-gray-900 text-xs">
//                     {LocationName}- {FarmName}
//                   </p>
//                 </div>
//               </div>
//               <div className="flex items-center">
//                 <User className="h-3 w-3 text-blue-600 mr-1" />
//                 <div>
//                   <p className="text-gray-600">Doctor</p>
//                   <p className="font-medium text-gray-900 text-xs">
//                     {user?.EmployeeName}
//                   </p>
//                 </div>
//               </div>
//               <div className="flex items-center">
//                 <Clock className="h-3 w-3 text-orange-600 mr-1" />
//                 <div>
//                   <p className="text-gray-600">Check-in</p>
//                   <p className="font-medium text-gray-900 text-xs">
//                     {sessionStatus === "checked_in" ? "Checked In" : "N/A"}
//                   </p>
//                 </div>
//               </div>
//               <div className="flex items-center">
//                 <CheckCircle className="h-3 w-3 text-purple-600 mr-1" />
//                 <div>
//                   <p className="text-gray-600">Form Status</p>
//                   <p className="font-medium text-gray-900 text-xs">
//                     {formStatus === "submitted" ? "Submitted" : "Not Submitted"}
//                   </p>
//                 </div>
//               </div>
//             </div>
//           </div>

//           {!formStatus || formStatus === "not-submitted" ? (
//             <form onSubmit={handleSubmit} className="p-4 space-y-6">
//               {LocationName === "HO Visit" ? (
//                 // HO Visit - Only show remark field
//                 <div className="space-y-4">
//                   <div className="flex items-center space-x-3 mb-6">
//                     <h2 className="text-2xl font-semibold text-gray-800">
//                       HO Visit Remark
//                     </h2>
//                   </div>

//                   {/* Remark section */}
//                   <div className="space-y-2">
//                     <label className="block text-md font-medium text-gray-700">
//                       Remark <span className="text-red-500">*</span>
//                       <span className="text-red-500 text-xs">required</span>
//                     </label>
//                     <textarea
//                       rows={8}
//                       className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none transition-all duration-200 text-sm min-h-24"
//                       placeholder="Enter your observations or notes for this visit"
//                       value={remark || ""}
//                       onChange={(e) => setRemark(e.target.value)}
//                     />
//                   </div>
//                 </div>
//               ) : (
//                 // Farm Visit - Show original content with checklist and support
//                 <>
//                   {/* Checklist Section */}
//                   <section className="space-y-6">
//                     <div className="flex items-center space-x-3 mb-6">
//                       <div className="bg-blue-100 rounded-full p-2">
//                         <CheckCircle className="h-6 w-6 text-blue-600" />
//                       </div>
//                       <h2 className="text-2xl font-semibold text-gray-800">
//                         Top Pointers
//                       </h2>
//                     </div>

//                     {checklistData.length > 0 ? (
//                       <div className="grid md:grid-cols-2 gap-4">
//                         {checklistData.map((item) => (
//                           <div
//                             key={item.id}
//                             className={`border-2 rounded-xl p-4 cursor-pointer transition-all duration-200 ${
//                               selectedChecklistItems.includes(item.id)
//                                 ? "border-green-500 bg-green-50 shadow-md transform scale-105"
//                                 : "border-gray-200 hover:border-blue-300 hover:shadow-sm"
//                             }`}
//                             onClick={() => handleChecklistSelect(item.id)}
//                           >
//                             <div className="flex items-center justify-between">
//                               <span className="font-medium text-gray-800">
//                                 {item.ChecklistTask}
//                               </span>
//                               <div
//                                 className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all duration-200 ${
//                                   selectedChecklistItems.includes(item.id)
//                                     ? "border-green-500 bg-green-500"
//                                     : "border-gray-300"
//                                 }`}
//                               >
//                                 {selectedChecklistItems.includes(item.id) && (
//                                   <CheckCircle className="h-3 w-3 text-white" />
//                                 )}
//                               </div>
//                             </div>
//                           </div>
//                         ))}
//                       </div>
//                     ) : (
//                       <div className="text-center py-8 text-gray-500">
//                         <AlertCircle className="h-12 w-12 mx-auto mb-4 text-gray-400" />
//                         <p>No checklist tasks available</p>
//                         {!networkStatus.isOnline && (
//                           <p className="text-xs mt-2">
//                             Connect to internet to load checklist
//                           </p>
//                         )}
//                       </div>
//                     )}
//                   </section>

//                   {/* Support Section */}
//                   <section className="space-y-6">
//                     <div className="flex items-center space-x-3 mb-6">
//                       <div className="bg-orange-100 rounded-full p-2">
//                         <AlertCircle className="h-6 w-6 text-orange-600" />
//                       </div>
//                       <h2 className="text-2xl font-semibold text-gray-800">
//                         Support
//                       </h2>
//                     </div>

//                     {Object.keys(groupedSupportData).length > 0 ? (
//                       <div className="space-y-6">
//                         {/* Category Tabs */}
//                         <div className="overflow-x-auto pb-2">
//                           <div className="flex space-x-2 min-w-max px-2 py-1">
//                             {Object.entries(groupedSupportData).map(
//                               ([categoryName, subcategories]) => (
//                                 <button
//                                   key={categoryName}
//                                   type="button"
//                                   onClick={() =>
//                                     setActiveCategory(categoryName)
//                                   }
//                                   className={`px-2 py-1 rounded-full text-sm font-medium transition-all duration-200 whitespace-nowrap ${
//                                     activeCategory === categoryName
//                                       ? "bg-blue-500 text-white shadow-md transform scale-105"
//                                       : "bg-gray-100 text-gray-700 hover:bg-gray-200"
//                                   }`}
//                                 >
//                                   {categoryName} ({subcategories.length})
//                                 </button>
//                               )
//                             )}
//                           </div>
//                         </div>

//                         {/* Subcategories for Active Category */}
//                         {activeCategory &&
//                           groupedSupportData[activeCategory] && (
//                             <div className="space-y-6">
//                               {groupedSupportData[activeCategory].map(
//                                 (subcategory) => (
//                                   <div
//                                     key={subcategory.id}
//                                     className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-6 w-full"
//                                   >
//                                     <h4 className="text-lg font-medium text-gray-800 mb-4">
//                                       {subcategory.SubCategoryName}
//                                     </h4>

//                                     <div className="space-y-4">
//                                       {/* Image Upload */}
//                                       <div className="space-y-2">
//                                         <label className="block text-sm font-medium text-gray-700">
//                                           Upload Image
//                                         </label>

//                                         <div className="flex items-center space-x-3">
//                                           {images[subcategory.id] ? (
//                                             <div className="relative">
//                                               <img
//                                                 src={
//                                                   images[subcategory.id].preview
//                                                 }
//                                                 alt="Preview"
//                                                 className="w-16 h-16 object-cover rounded-lg border-2 border-gray-300"
//                                               />
//                                               <button
//                                                 type="button"
//                                                 onClick={() =>
//                                                   removeImage(subcategory.id)
//                                                 }
//                                                 className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors shadow-lg"
//                                               >
//                                                 <X className="h-3 w-3" />
//                                               </button>
//                                             </div>
//                                           ) : (
//                                             <div className="w-16 h-16 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center hover:border-blue-400 transition-colors">
//                                               <input
//                                                 type="file"
//                                                 accept="image/*"
//                                                 onChange={(e) =>
//                                                   handleImageUpload(
//                                                     subcategory.id,
//                                                     e.target.files[0]
//                                                   )
//                                                 }
//                                                 className="hidden"
//                                                 id={`image-${subcategory.id}`}
//                                               />
//                                               <label
//                                                 htmlFor={`image-${subcategory.id}`}
//                                                 className="cursor-pointer"
//                                               >
//                                                 <Camera className="h-6 w-6 text-gray-400 hover:text-blue-500 transition-colors" />
//                                               </label>
//                                             </div>
//                                           )}

//                                           <div className="flex-1">
//                                             <input
//                                               type="file"
//                                               accept="image/*"
//                                               onChange={(e) =>
//                                                 handleImageUpload(
//                                                   subcategory.id,
//                                                   e.target.files[0]
//                                                 )
//                                               }
//                                               className="hidden"
//                                               id={`image-btn-${subcategory.id}`}
//                                             />
//                                             <label
//                                               htmlFor={`image-btn-${subcategory.id}`}
//                                               className="inline-flex items-center px-3 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 cursor-pointer transition-colors"
//                                             >
//                                               <Upload className="h-4 w-4 mr-2" />
//                                               {images[subcategory.id]
//                                                 ? "Change Image"
//                                                 : "Select Image"}
//                                             </label>
//                                           </div>
//                                         </div>

//                                         {images[subcategory.id] && (
//                                           <p className="text-xs text-gray-500 break-words">
//                                             {images[subcategory.id].file.name}
//                                           </p>
//                                         )}
//                                       </div>

//                                       {/* Observation Field */}
//                                       <div className="space-y-2">
//                                         <label className="block text-sm font-medium text-gray-700">
//                                           Observation
//                                           {images[subcategory.id] && (
//                                             <span className="text-red-500 ml-1">
//                                               *
//                                             </span>
//                                           )}
//                                         </label>
//                                         <textarea
//                                           rows={4}
//                                           className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none transition-all duration-200 text-sm min-h-24 ${
//                                             images[subcategory.id] &&
//                                             (!supportFormData[subcategory.id]
//                                               ?.observation ||
//                                               supportFormData[
//                                                 subcategory.id
//                                               ]?.observation.trim() === "")
//                                               ? "border-red-300"
//                                               : "border-gray-300"
//                                           }`}
//                                           placeholder={`Enter observations for ${subcategory.SubCategoryName}...`}
//                                           value={
//                                             supportFormData[subcategory.id]
//                                               ?.observation || ""
//                                           }
//                                           onChange={(e) =>
//                                             handleSupportFormChange(
//                                               subcategory.id,
//                                               "observation",
//                                               e.target.value
//                                             )
//                                           }
//                                         />
//                                       </div>
//                                     </div>
//                                   </div>
//                                 )
//                               )}
//                             </div>
//                           )}
//                       </div>
//                     ) : (
//                       <div className="text-center py-8 text-gray-500">
//                         <AlertCircle className="h-12 w-12 mx-auto mb-4 text-gray-400" />
//                         <p>No support categories available</p>
//                         {!networkStatus.isOnline && (
//                           <p className="text-xs mt-2">
//                             Connect to internet to load support data
//                           </p>
//                         )}
//                       </div>
//                     )}
//                   </section>

//                   {/* Remark section */}
//                   <div className="space-y-2">
//                     <label className="block text-sm font-medium text-gray-700">
//                       <span className="text-red-500">*</span>Remark{" "}
//                       <span className="text-red-500 text-xs">(required)</span>
//                     </label>
//                     <textarea
//                       rows={8}
//                       className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none transition-all duration-200 text-sm min-h-24"
//                       placeholder="Enter your observations or notes for this visit"
//                       value={remark || ""}
//                       onChange={(e) => setRemark(e.target.value)}
//                     />
//                   </div>
//                 </>
//               )}

//               {/* Submit Section with Enhanced Status */}
//               <div className="sticky bottom-0 bg-white border-t border-gray-200 p-4 -mx-4">
//                 {!networkStatus.isOnline && (
//                   <div className="mb-3 bg-yellow-50 border border-yellow-200 rounded-lg p-3">
//                     <div className="flex items-center">
//                       <CloudOff className="h-4 w-4 text-yellow-600 mr-2" />
//                       <p className="text-yellow-800 text-sm">
//                         Working offline - form will sync when connection is
//                         restored
//                       </p>
//                     </div>
//                   </div>
//                 )}

//                 <button
//                   type="submit"
//                   disabled={!canSubmitForm()}
//                   className={`w-full py-3 px-6 rounded-xl font-semibold shadow-lg transform transition-all duration-200 ${
//                     !canSubmitForm()
//                       ? "bg-gray-400 text-gray-200 cursor-not-allowed"
//                       : "bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:from-blue-700 hover:to-indigo-700 hover:scale-105"
//                   }`}
//                 >
//                   {submitting ? (
//                     <div className="flex items-center justify-center">
//                       <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
//                       {networkStatus.isOnline
//                         ? "Submitting..."
//                         : "Saving offline..."}
//                     </div>
//                   ) : (
//                     <>
//                       {networkStatus.isOnline
//                         ? "Submit Report"
//                         : "Save Report (Offline)"}
//                       {selectedChecklistItems.length > 0 && (
//                         <span className="ml-2 bg-white bg-opacity-20 px-2 py-1 rounded text-sm">
//                           {selectedChecklistItems.length} tasks
//                         </span>
//                       )}
//                     </>
//                   )}
//                 </button>
//               </div>
//             </form>
//           ) : (
//             // Form submitted state
//             <div className="sticky bottom-0 bg-white border-t border-gray-200 p-4 -mx-4">
//               <div className="space-y-3">
//                 <div className="bg-green-50 border border-green-200 rounded-lg p-3 text-center">
//                   <CheckCircle className="h-6 w-6 text-green-600 mx-auto mb-2" />
//                   <p className="text-green-800 font-medium text-sm">
//                     Form submitted successfully!
//                   </p>
//                   <p className="text-green-600 text-xs">
//                     You can now checkout from this location
//                   </p>
//                 </div>

//                 {/* Show sync status if there are pending items */}
//                 {pendingSyncCount.total > 0 && (
//                   <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-center">
//                     <div className="flex items-center justify-center">
//                       <Sync
//                         className={`h-4 w-4 text-blue-600 mr-2 ${
//                           syncStatus === "syncing" ? "animate-spin" : ""
//                         }`}
//                       />
//                       <p className="text-blue-800 text-sm">
//                         {syncStatus === "syncing"
//                           ? "Syncing data..."
//                           : `${pendingSyncCount.total} items pending sync`}
//                       </p>
//                       {syncStatus !== "syncing" && networkStatus.isOnline && (
//                         <button
//                           onClick={handleSync}
//                           className="ml-2 text-blue-600 hover:text-blue-800 text-sm underline"
//                         >
//                           Sync now
//                         </button>
//                       )}
//                     </div>
//                   </div>
//                 )}

//                 <div className="flex space-x-3">
//                   {/* Checkout button */}
//                   <button
//                     type="button"
//                     onClick={handleCheckout}
//                     disabled={checkingOut || !networkStatus.isOnline}
//                     className={`flex-1 font-poppins font-semibold py-3 px-4 rounded-lg transition-all ${
//                       checkingOut || !networkStatus.isOnline
//                         ? "bg-gray-400 text-gray-200 cursor-not-allowed"
//                         : "bg-gradient-to-r from-green-500 to-green-600 text-white hover:from-green-600 hover:to-green-700"
//                     }`}
//                   >
//                     {checkingOut ? (
//                       <div className="flex items-center justify-center">
//                         <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-1"></div>
//                         Checking out...
//                       </div>
//                     ) : !networkStatus.isOnline ? (
//                       <div className="flex items-center justify-center">
//                         <WifiOff className="h-4 w-4 mr-2" />
//                         Checkout (Offline)
//                       </div>
//                     ) : (
//                       "Checkout"
//                     )}
//                   </button>
//                 </div>

//                 {/* Offline checkout message */}
//                 {!networkStatus.isOnline && (
//                   <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 text-center">
//                     <div className="flex items-center justify-center">
//                       <AlertCircle className="h-4 w-4 text-yellow-600 mr-2" />
//                       <p className="text-yellow-800 text-sm">
//                         Checkout requires internet connection
//                       </p>
//                     </div>
//                   </div>
//                 )}
//               </div>
//             </div>
//           )}
//         </div>
//       </div>
//     </div>
//   );
// };

// export default Form;

import React, { useState, useEffect } from "react";
import {
  Camera,
  CheckCircle,
  AlertCircle,
  Upload,
  X,
  MapPin,
  User,
  Clock,
  ArrowLeft,
  Wifi,
  WifiOff,
  CloudOff,
  RefreshCcw as Sync,
  MapPinOff, // NEW: Added for location permission denied
} from "lucide-react";
import axiosInstance from "../../library/axios";
import { useSelector, useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { resetSession, setFormStatus } from "../../redux/slices/sessionSlice";
import toast from "react-hot-toast";
import { useOfflineForm } from "../../hooks/useOfflineForm";
import { useOfflineCheckout } from "../../hooks/useOfflineCheckout"; // NEW: Import offline checkout hook

const Form = () => {
  const user = useSelector((state) => state.user.user);
  const [checklistData, setChecklistData] = useState([]);
  const [supportData, setSupportData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeCategory, setActiveCategory] = useState("");
  // REMOVED: const [checkingOut, setCheckingOut] = useState(false); // This is now handled by useOfflineCheckout

  // Form state
  const [selectedChecklistItems, setSelectedChecklistItems] = useState([]);
  const [supportFormData, setSupportFormData] = useState({});
  const [images, setImages] = useState({});
  const [remark, setRemark] = useState("");

  // Use offline form hook
  const {
    submitting,
    formDetailId,
    networkStatus,
    pendingSyncCount,
    syncStatus,
    formStatus,
    sessionStatus,
    submitForm,
    handleSync,
    validateFormData,
    getNetworkStatusDisplay,
    getSyncStatusDisplay,
    canSubmitForm,
    getSubmissionStatusMessage,
    employeeId,
  } = useOfflineForm();

  // NEW: Use offline checkout hook
  const {
    checkingOut,
    pendingCheckoutCount, // NEW: Track pending offline checkouts
    locationPermission, // NEW: Track location permission status
    checkout, // NEW: Enhanced checkout function with offline support
    handleSyncCheckouts, // NEW: Sync pending checkouts
    canCheckout, // NEW: Check if checkout is possible
    getCheckoutButtonText, // NEW: Get appropriate button text
    getCheckoutStatusMessage, // NEW: Get status message
    requestLocationPermission, // NEW: Request location permission
  } = useOfflineCheckout();

  const locationDetails = useSelector((state) => state.session.locationDetails);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  // Get location and farm data
  const getLocation = localStorage.getItem("selectedLocation");
  const selectedLocation = getLocation ? JSON.parse(getLocation) : null;
  const LocationId = selectedLocation ? selectedLocation.LocationId : null;
  const LocationName = selectedLocation ? selectedLocation.LocationName : null;

  const getFarm = localStorage.getItem("selectedFarm");
  const selectedFarm = getFarm ? JSON.parse(getFarm) : null;
  const FarmId = selectedFarm ? selectedFarm.FarmId : null;
  const FarmName = selectedFarm ? selectedFarm.farm.FarmName : null;

  useEffect(() => {
    if (sessionStatus !== "checked_in") {
      navigate("/dashboard");
    }
  }, [sessionStatus, navigate]);

  // Fetch functions - only when online (UNCHANGED)
  const fetchChecklistData = async () => {
    if (!networkStatus.isOnline) {
      console.log("Skipping checklist fetch - offline");
      return;
    }

    try {
      const response = await axiosInstance.get(`/doctor/doc-checklist-tasks`);
      const result = response.data;

      if (result.success && Array.isArray(result.data)) {
        setChecklistData(result.data.filter((item) => item.isActive));
      } else {
        setChecklistData([]);
      }
    } catch (err) {
      setError("Failed to fetch checklist data");
      console.error("Checklist API Error:", err);
      setChecklistData([]);
    }
  };

  const fetchFormStatus = async () => {
    if (!networkStatus.isOnline) {
      dispatch(setFormStatus("not-submitted"));
      return;
    }

    try {
      const response = await axiosInstance.get(
        `/doctor/employee/${employeeId}/status`
      );
      const result = response.data;
      if (result.success) {
        if (result.data.DocFormDetailId === null) {
          dispatch(setFormStatus("not-submitted"));
        } else {
          dispatch(setFormStatus("submitted"));
        }
      }
    } catch (err) {
      console.error("Failed to fetch form status:", err);
    }
  };

  const fetchSupportData = async () => {
    if (!networkStatus.isOnline) {
      console.log("Skipping support data fetch - offline");
      return;
    }

    try {
      const response = await axiosInstance.get(`/doctor/support-subcategories`);
      const result = response?.data;

      if (result.success && Array.isArray(result.data)) {
        setSupportData(result.data.filter((item) => item.isActive));
      } else {
        setSupportData([]);
      }
    } catch (err) {
      setError("Failed to fetch support data");
      console.error("Support API Error:", err);
      setSupportData([]);
    }
  };

  useEffect(() => {
    if (employeeId) {
      fetchFormStatus();
    }
  }, [employeeId, networkStatus.isOnline]);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      await Promise.all([fetchChecklistData(), fetchSupportData()]);
      setLoading(false);
    };
    fetchData();
  }, [networkStatus.isOnline]);

  // Group support data by category (UNCHANGED)
  const groupedSupportData = supportData.reduce((acc, item) => {
    if (item && item.category && item.category.CategoryName) {
      const categoryName = item.category.CategoryName;
      if (!acc[categoryName]) {
        acc[categoryName] = [];
      }
      acc[categoryName].push(item);
    }
    return acc;
  }, {});

  // Set first category as active by default (UNCHANGED)
  useEffect(() => {
    const categories = Object.keys(groupedSupportData);
    if (categories.length > 0 && !activeCategory) {
      setActiveCategory(categories[0]);
    }
  }, [groupedSupportData, activeCategory]);

  // Handle checklist item selection (UNCHANGED)
  const handleChecklistSelect = (itemId) => {
    setSelectedChecklistItems((prev) =>
      prev.includes(itemId)
        ? prev.filter((id) => id !== itemId)
        : [...prev, itemId]
    );
  };

  // Handle support form data (UNCHANGED)
  const handleSupportFormChange = (subcategoryId, field, value) => {
    setSupportFormData((prev) => ({
      ...prev,
      [subcategoryId]: {
        ...prev[subcategoryId],
        [field]: value,
      },
    }));
  };

  // Handle image upload (UNCHANGED)
  const handleImageUpload = async (subcategoryId, file) => {
    if (!file) return;

    try {
      const maxSizeInBytes = 20 * 1024 * 1024;
      if (file.size > maxSizeInBytes) {
        toast.error("Image is too large. Maximum size is 20MB.");
        return;
      }

      const fileExtension = file.name.split(".").pop();
      const randomName = `img_${Math.random()
        .toString(36)
        .substring(2, 15)}_${Date.now()}.${fileExtension}`;

      const renamedFile = new File([file], randomName, { type: file.type });

      const reader = new FileReader();
      reader.onload = (e) => {
        setImages((prev) => ({
          ...prev,
          [subcategoryId]: {
            file: renamedFile,
            preview: e.target.result,
          },
        }));
      };
      reader.readAsDataURL(file);
    } catch (error) {
      console.error("Image handling failed:", error);
      toast.error("Failed to process image");
    }
  };

  // Remove image (UNCHANGED)
  const removeImage = (subcategoryId) => {
    setImages((prev) => {
      const newImages = { ...prev };
      delete newImages[subcategoryId];
      return newImages;
    });
  };

  // Handle form submission (UNCHANGED)
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!canSubmitForm()) {
      toast.error("Cannot submit form at this time");
      return;
    }

    const validationErrors = validateFormData(
      { remark, categoryDetails: prepareCategoryDetails() },
      images,
      supportData
    );

    if (validationErrors.length > 0) {
      toast.error(validationErrors[0]);
      return;
    }

    try {
      const formData = {
        LocationId: LocationId,
        FarmId: FarmId,
        remark: remark,
        categoryDetails: prepareCategoryDetails(),
        checklistItems: selectedChecklistItems,
      };

      const result = await submitForm(formData, images, supportData);

      if (result.success) {
        console.log("Form submission result:", result);
      }
    } catch (err) {
      console.error("Form submission error:", err);
    }
  };

  // Prepare category details (UNCHANGED)
  const prepareCategoryDetails = () => {
    const categoryDetails = [];

    Object.entries(supportFormData).forEach(([subcategoryId, data]) => {
      const subcategory = supportData.find(
        (item) => item.id === parseInt(subcategoryId)
      );

      if (subcategory && subcategory.category) {
        categoryDetails.push({
          CategoryId: subcategory.category.id,
          SubCategoryId: parseInt(subcategoryId),
          Observation: data.observation || "",
        });
      }
    });

    return categoryDetails;
  };

  // REMOVED: getCurrentLocation() - now handled by useOfflineCheckout hook

  // NEW: Enhanced checkout handler with offline support
  const handleCheckout = async () => {
    // Check location permission first
    if (locationPermission === "denied") {
      const granted = await requestLocationPermission();
      if (!granted) {
        toast.error(
          "Location access is required for checkout. Please enable location permissions in your browser settings."
        );
        return;
      }
    }

    try {
      const result = await checkout(formDetailId, {
        resetSession: true, // Always reset session after checkout
      });

      if (result.success) {
        if (result.isOffline) {
          // For offline checkout, show message and navigate after delay
          toast.success(
            "Checkout completed offline. You can continue working or sync when online."
          );

          setTimeout(() => {
            navigate("/dashboard");
          }, 2000);
        } else {
          // For online checkout, navigate immediately
          navigate("/dashboard");
        }
      }
    } catch (err) {
      console.error("Checkout error:", err);
    }
  };

  // UPDATED: Enhanced network status component
  const NetworkStatusIndicator = () => {
    const statusDisplay = getNetworkStatusDisplay();
    const syncDisplay = getSyncStatusDisplay();
    const totalPendingItems = pendingSyncCount.total + pendingCheckoutCount; // NEW: Include checkout count

    return (
      <div className="bg-gray-50 px-4 py-2 border-b">
        <div className="flex items-center justify-between text-xs">
          <div className="flex items-center space-x-3">
            <div className="flex items-center">
              {networkStatus.isOnline ? (
                <Wifi className="h-3 w-3 text-green-500 mr-1" />
              ) : (
                <WifiOff className="h-3 w-3 text-red-500 mr-1" />
              )}
              <span className={statusDisplay.color}>{statusDisplay.text}</span>
            </div>

            <div className="flex items-center">
              <span className={syncDisplay.color}>
                {/* NEW: Show total pending items including checkouts */}
                {totalPendingItems > 0
                  ? `${totalPendingItems} pending`
                  : syncDisplay.text}
              </span>
              {/* NEW: Enhanced sync button for both forms and checkouts */}
              {(syncDisplay.showSync || totalPendingItems > 0) &&
                networkStatus.isOnline && (
                  <button
                    onClick={() => {
                      handleSync();
                      handleSyncCheckouts(); // NEW: Also sync checkouts
                    }}
                    disabled={syncStatus === "syncing"}
                    className="ml-2 text-blue-500 hover:text-blue-700 disabled:text-gray-400"
                    title="Sync all pending data" // NEW: Tooltip
                  >
                    <Sync
                      className={`h-3 w-3 ${
                        syncStatus === "syncing" ? "animate-spin" : ""
                      }`}
                    />
                  </button>
                )}
            </div>
          </div>

          <div className="text-gray-500">{getSubmissionStatusMessage()}</div>
        </div>

        {/* NEW: Show breakdown of pending items */}
        {totalPendingItems > 0 && (
          <div className="mt-1 text-xs text-gray-500">
            {pendingSyncCount.forms > 0 && `${pendingSyncCount.forms} forms`}
            {pendingSyncCount.images > 0 &&
              `, ${pendingSyncCount.images} images`}
            {pendingCheckoutCount > 0 && `, ${pendingCheckoutCount} checkouts`}
            {" pending sync"}
          </div>
        )}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading farm visit form...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-md">
          <div className="flex items-center">
            <AlertCircle className="h-5 w-5 text-red-500 mr-2" />
            <p className="text-red-700">{error}</p>
          </div>
          <button
            onClick={() => window.location.reload()}
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
      <div className="max-w-md mx-auto">
        <div className="bg-white overflow-hidden">
          {/* Header (UNCHANGED) */}
          <div className="bg-gradient-to-r from-green-700 to-green-800 px-6 py-4 rounded-lg">
            <div className="flex justify-between items-start">
              <div>
                <h1 className="text-xl font-bold text-white">
                  Farm Visit Report
                </h1>
                <p className="text-white text-sm mt-1">
                  Complete checklist and document issues
                </p>
              </div>
              <div className="text-right">
                <button
                  onClick={() => navigate("/dashboard/checkin")}
                  className="text-white text-sm transition-colors mb-1 border border-white rounded-lg px-2 py-1 m-1 block"
                >
                  Back
                </button>
              </div>
            </div>
          </div>

          {/* UPDATED: Enhanced Network Status Indicator */}
          <NetworkStatusIndicator />

          {/* Travel Info (UNCHANGED) */}
          <div className="bg-gray-50 px-4 py-3 border-b">
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="flex items-center">
                <MapPin className="h-3 w-3 text-green-600 mr-1" />
                <div>
                  <p className="text-gray-600">Location</p>
                  <p className="font-medium text-gray-900 text-xs">
                    {LocationName}- {FarmName}
                  </p>
                </div>
              </div>
              <div className="flex items-center">
                <User className="h-3 w-3 text-blue-600 mr-1" />
                <div>
                  <p className="text-gray-600">Doctor</p>
                  <p className="font-medium text-gray-900 text-xs">
                    {user?.EmployeeName}
                  </p>
                </div>
              </div>
              <div className="flex items-center">
                <Clock className="h-3 w-3 text-orange-600 mr-1" />
                <div>
                  <p className="text-gray-600">Check-in</p>
                  <p className="font-medium text-gray-900 text-xs">
                    {sessionStatus === "checked_in" ? "Checked In" : "N/A"}
                  </p>
                </div>
              </div>
              <div className="flex items-center">
                <CheckCircle className="h-3 w-3 text-purple-600 mr-1" />
                <div>
                  <p className="text-gray-600">Form Status</p>
                  <p className="font-medium text-gray-900 text-xs">
                    {formStatus === "submitted" ? "Submitted" : "Not Submitted"}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {!formStatus || formStatus === "not-submitted" ? (
            <form onSubmit={handleSubmit} className="p-4 space-y-6">
              {/* Form content remains exactly the same - all existing form sections */}
              {LocationName === "HO Visit" ? (
                // HO Visit - Only show remark field
                <div className="space-y-4">
                  <div className="flex items-center space-x-3 mb-6">
                    <h2 className="text-2xl font-semibold text-gray-800">
                      HO Visit Remark
                    </h2>
                  </div>

                  <div className="space-y-2">
                    <label className="block text-md font-medium text-gray-700">
                      Remark <span className="text-red-500">*</span>
                      <span className="text-red-500 text-xs">required</span>
                    </label>
                    <textarea
                      rows={8}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none transition-all duration-200 text-sm min-h-24"
                      placeholder="Enter your observations or notes for this visit"
                      value={remark || ""}
                      onChange={(e) => setRemark(e.target.value)}
                    />
                  </div>
                </div>
              ) : (
                // Farm Visit - All existing sections remain exactly the same
                <>
                  {/* Checklist Section - UNCHANGED */}
                  <section className="space-y-6">
                    <div className="flex items-center space-x-3 mb-6">
                      <div className="bg-blue-100 rounded-full p-2">
                        <CheckCircle className="h-6 w-6 text-blue-600" />
                      </div>
                      <h2 className="text-2xl font-semibold text-gray-800">
                        Top Pointers
                      </h2>
                    </div>

                    {checklistData.length > 0 ? (
                      <div className="grid md:grid-cols-2 gap-4">
                        {checklistData.map((item) => (
                          <div
                            key={item.id}
                            className={`border-2 rounded-xl p-4 cursor-pointer transition-all duration-200 ${
                              selectedChecklistItems.includes(item.id)
                                ? "border-green-500 bg-green-50 shadow-md transform scale-105"
                                : "border-gray-200 hover:border-blue-300 hover:shadow-sm"
                            }`}
                            onClick={() => handleChecklistSelect(item.id)}
                          >
                            <div className="flex items-center justify-between">
                              <span className="font-medium text-gray-800">
                                {item.ChecklistTask}
                              </span>
                              <div
                                className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all duration-200 ${
                                  selectedChecklistItems.includes(item.id)
                                    ? "border-green-500 bg-green-500"
                                    : "border-gray-300"
                                }`}
                              >
                                {selectedChecklistItems.includes(item.id) && (
                                  <CheckCircle className="h-3 w-3 text-white" />
                                )}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-8 text-gray-500">
                        <AlertCircle className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                        <p>No checklist tasks available</p>
                        {!networkStatus.isOnline && (
                          <p className="text-xs mt-2">
                            Connect to internet to load checklist
                          </p>
                        )}
                      </div>
                    )}
                  </section>

                  {/* Support Section - UNCHANGED but very long, keeping same structure */}
                  <section className="space-y-6">
                    <div className="flex items-center space-x-3 mb-6">
                      <div className="bg-orange-100 rounded-full p-2">
                        <AlertCircle className="h-6 w-6 text-orange-600" />
                      </div>
                      <h2 className="text-2xl font-semibold text-gray-800">
                        Support
                      </h2>
                    </div>

                    {Object.keys(groupedSupportData).length > 0 ? (
                      <div className="space-y-6">
                        {/* Category Tabs */}
                        <div className="overflow-x-auto pb-2">
                          <div className="flex space-x-2 min-w-max px-2 py-1">
                            {Object.entries(groupedSupportData).map(
                              ([categoryName, subcategories]) => (
                                <button
                                  key={categoryName}
                                  type="button"
                                  onClick={() =>
                                    setActiveCategory(categoryName)
                                  }
                                  className={`px-2 py-1 rounded-full text-sm font-medium transition-all duration-200 whitespace-nowrap ${
                                    activeCategory === categoryName
                                      ? "bg-blue-500 text-white shadow-md transform scale-105"
                                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                                  }`}
                                >
                                  {categoryName} ({subcategories.length})
                                </button>
                              )
                            )}
                          </div>
                        </div>

                        {/* Subcategories - UNCHANGED */}
                        {activeCategory &&
                          groupedSupportData[activeCategory] && (
                            <div className="space-y-6">
                              {groupedSupportData[activeCategory].map(
                                (subcategory) => (
                                  <div
                                    key={subcategory.id}
                                    className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-6 w-full"
                                  >
                                    <h4 className="text-lg font-medium text-gray-800 mb-4">
                                      {subcategory.SubCategoryName}
                                    </h4>

                                    <div className="space-y-4">
                                      {/* Image Upload */}
                                      <div className="space-y-2">
                                        <label className="block text-sm font-medium text-gray-700">
                                          Upload Image
                                        </label>

                                        <div className="flex items-center space-x-3">
                                          {images[subcategory.id] ? (
                                            <div className="relative">
                                              <img
                                                src={
                                                  images[subcategory.id].preview
                                                }
                                                alt="Preview"
                                                className="w-16 h-16 object-cover rounded-lg border-2 border-gray-300"
                                              />
                                              <button
                                                type="button"
                                                onClick={() =>
                                                  removeImage(subcategory.id)
                                                }
                                                className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors shadow-lg"
                                              >
                                                <X className="h-3 w-3" />
                                              </button>
                                            </div>
                                          ) : (
                                            <div className="w-16 h-16 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center hover:border-blue-400 transition-colors">
                                              <input
                                                type="file"
                                                accept="image/*"
                                                onChange={(e) =>
                                                  handleImageUpload(
                                                    subcategory.id,
                                                    e.target.files[0]
                                                  )
                                                }
                                                className="hidden"
                                                id={`image-${subcategory.id}`}
                                              />
                                              <label
                                                htmlFor={`image-${subcategory.id}`}
                                                className="cursor-pointer"
                                              >
                                                <Camera className="h-6 w-6 text-gray-400 hover:text-blue-500 transition-colors" />
                                              </label>
                                            </div>
                                          )}

                                          <div className="flex-1">
                                            <input
                                              type="file"
                                              accept="image/*"
                                              onChange={(e) =>
                                                handleImageUpload(
                                                  subcategory.id,
                                                  e.target.files[0]
                                                )
                                              }
                                              className="hidden"
                                              id={`image-btn-${subcategory.id}`}
                                            />
                                            <label
                                              htmlFor={`image-btn-${subcategory.id}`}
                                              className="inline-flex items-center px-3 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 cursor-pointer transition-colors"
                                            >
                                              <Upload className="h-4 w-4 mr-2" />
                                              {images[subcategory.id]
                                                ? "Change Image"
                                                : "Select Image"}
                                            </label>
                                          </div>
                                        </div>

                                        {images[subcategory.id] && (
                                          <p className="text-xs text-gray-500 break-words">
                                            {images[subcategory.id].file.name}
                                          </p>
                                        )}
                                      </div>

                                      {/* Observation Field */}
                                      <div className="space-y-2">
                                        <label className="block text-sm font-medium text-gray-700">
                                          Observation
                                          {images[subcategory.id] && (
                                            <span className="text-red-500 ml-1">
                                              *
                                            </span>
                                          )}
                                        </label>
                                        <textarea
                                          rows={4}
                                          className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none transition-all duration-200 text-sm min-h-24 ${
                                            images[subcategory.id] &&
                                            (!supportFormData[subcategory.id]
                                              ?.observation ||
                                              supportFormData[
                                                subcategory.id
                                              ]?.observation.trim() === "")
                                              ? "border-red-300"
                                              : "border-gray-300"
                                          }`}
                                          placeholder={`Enter observations for ${subcategory.SubCategoryName}...`}
                                          value={
                                            supportFormData[subcategory.id]
                                              ?.observation || ""
                                          }
                                          onChange={(e) =>
                                            handleSupportFormChange(
                                              subcategory.id,
                                              "observation",
                                              e.target.value
                                            )
                                          }
                                        />
                                      </div>
                                    </div>
                                  </div>
                                )
                              )}
                            </div>
                          )}
                      </div>
                    ) : (
                      <div className="text-center py-8 text-gray-500">
                        <AlertCircle className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                        <p>No support categories available</p>
                        {!networkStatus.isOnline && (
                          <p className="text-xs mt-2">
                            Connect to internet to load support data
                          </p>
                        )}
                      </div>
                    )}
                  </section>

                  {/* Remark section - UNCHANGED */}
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">
                      <span className="text-red-500">*</span>Remark{" "}
                      <span className="text-red-500 text-xs">(required)</span>
                    </label>
                    <textarea
                      rows={8}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none transition-all duration-200 text-sm min-h-24"
                      placeholder="Enter your observations or notes for this visit"
                      value={remark || ""}
                      onChange={(e) => setRemark(e.target.value)}
                    />
                  </div>
                </>
              )}

              {/* Submit Section - UNCHANGED */}
              <div className="sticky bottom-0 bg-white border-t border-gray-200 p-4 -mx-4">
                {!networkStatus.isOnline && (
                  <div className="mb-3 bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                    <div className="flex items-center">
                      <CloudOff className="h-4 w-4 text-yellow-600 mr-2" />
                      <p className="text-yellow-800 text-sm">
                        Working offline - form will sync when connection is
                        restored
                      </p>
                    </div>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={!canSubmitForm()}
                  className={`w-full py-3 px-6 rounded-xl font-semibold shadow-lg transform transition-all duration-200 ${
                    !canSubmitForm()
                      ? "bg-gray-400 text-gray-200 cursor-not-allowed"
                      : "bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:from-blue-700 hover:to-indigo-700 hover:scale-105"
                  }`}
                >
                  {submitting ? (
                    <div className="flex items-center justify-center">
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                      {networkStatus.isOnline
                        ? "Submitting..."
                        : "Saving offline..."}
                    </div>
                  ) : (
                    <>
                      {networkStatus.isOnline
                        ? "Submit Report"
                        : "Save Report (Offline)"}
                      {selectedChecklistItems.length > 0 && (
                        <span className="ml-2 bg-white bg-opacity-20 px-2 py-1 rounded text-sm">
                          {selectedChecklistItems.length} tasks
                        </span>
                      )}
                    </>
                  )}
                </button>
              </div>
            </form>
          ) : (
            // MAJOR CHANGES: Form submitted state - Enhanced with offline checkout support
            <div className="sticky bottom-0 bg-white border-t border-gray-200 p-4 -mx-4">
              <div className="space-y-3">
                <div className="bg-green-50 border border-green-200 rounded-lg p-3 text-center">
                  <CheckCircle className="h-6 w-6 text-green-600 mx-auto mb-2" />
                  <p className="text-green-800 font-medium text-sm">
                    Form submitted successfully!
                  </p>
                  <p className="text-green-600 text-xs">
                    You can now checkout from this location
                  </p>
                </div>

                {/* UPDATED: Enhanced sync status display with checkout data */}
                {(pendingSyncCount.total > 0 || pendingCheckoutCount > 0) && (
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-center">
                    <div className="flex items-center justify-center">
                      <Sync
                        className={`h-4 w-4 text-blue-600 mr-2 ${
                          syncStatus === "syncing" ? "animate-spin" : ""
                        }`}
                      />
                      <p className="text-blue-800 text-sm">
                        {syncStatus === "syncing"
                          ? "Syncing data..."
                          : `${
                              pendingSyncCount.total + pendingCheckoutCount
                            } items pending sync`}
                      </p>
                      {syncStatus !== "syncing" && networkStatus.isOnline && (
                        <button
                          onClick={() => {
                            handleSync();
                            handleSyncCheckouts(); // NEW: Also sync checkouts
                          }}
                          className="ml-2 text-blue-600 hover:text-blue-800 text-sm underline"
                        >
                          Sync now
                        </button>
                      )}
                    </div>
                    {/* NEW: Show breakdown of pending items */}
                    {(pendingSyncCount.total > 0 ||
                      pendingCheckoutCount > 0) && (
                      <div className="mt-1 text-xs text-blue-600">
                        {pendingSyncCount.forms > 0 &&
                          `${pendingSyncCount.forms} forms`}
                        {pendingSyncCount.images > 0 &&
                          `, ${pendingSyncCount.images} images`}
                        {pendingCheckoutCount > 0 &&
                          `, ${pendingCheckoutCount} checkouts`}
                      </div>
                    )}
                  </div>
                )}

                {/* NEW: Location permission warning */}
                {locationPermission === "denied" && (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-center">
                    <div className="flex items-center justify-center">
                      <MapPinOff className="h-4 w-4 text-red-600 mr-2" />
                      <p className="text-red-800 text-sm">
                        Location access required for checkout
                      </p>
                    </div>
                    <button
                      onClick={requestLocationPermission}
                      className="mt-2 text-red-600 hover:text-red-800 text-sm underline"
                    >
                      Enable location access
                    </button>
                  </div>
                )}

                {/* NEW: Offline checkout notification */}
                {!networkStatus.isOnline && (
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 text-center">
                    <div className="flex items-center justify-center">
                      <CloudOff className="h-4 w-4 text-yellow-600 mr-2" />
                      <p className="text-yellow-800 text-sm">
                        Working offline - checkout will be saved locally and
                        synced later
                      </p>
                    </div>
                  </div>
                )}

                <div className="flex space-x-3">
                  {/* COMPLETELY UPDATED: Enhanced checkout button with offline support */}
                  <button
                    type="button"
                    onClick={handleCheckout}
                    disabled={!canCheckout()} // NEW: Use canCheckout() instead of manual checks
                    className={`flex-1 font-poppins font-semibold py-3 px-4 rounded-lg transition-all ${
                      !canCheckout()
                        ? "bg-gray-400 text-gray-200 cursor-not-allowed"
                        : "bg-gradient-to-r from-green-500 to-green-600 text-white hover:from-green-600 hover:to-green-700"
                    }`}
                  >
                    {checkingOut ? (
                      <div className="flex items-center justify-center">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-1"></div>
                        {getCheckoutButtonText()}{" "}
                        {/* NEW: Use dynamic button text */}
                      </div>
                    ) : (
                      <div className="flex items-center justify-center">
                        {/* NEW: Dynamic icons based on status */}
                        {locationPermission === "denied" ? (
                          <MapPinOff className="h-4 w-4 mr-2" />
                        ) : !networkStatus.isOnline ? (
                          <WifiOff className="h-4 w-4 mr-2" />
                        ) : (
                          <CheckCircle className="h-4 w-4 mr-2" />
                        )}
                        {getCheckoutButtonText()}{" "}
                        {/* NEW: Use dynamic button text */}
                      </div>
                    )}
                  </button>
                </div>

                {/* NEW: Checkout status message */}
                <div className="text-center">
                  <p className="text-xs text-gray-600">
                    {getCheckoutStatusMessage()}{" "}
                    {/* NEW: Dynamic status message */}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Form;
