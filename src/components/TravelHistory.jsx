import React, { useState, useEffect } from 'react';
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
  Activity
} from 'lucide-react';

const TravelHistory = ({ user, onBack, onLogout }) => {
  const [travels, setTravels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedTravel, setSelectedTravel] = useState(null);
  const [expandedItems, setExpandedItems] = useState({});
  const [pagination, setPagination] = useState({});

  const baseUrl = 'http://localhost:3002';
  const employeeId = '10001020';

  // Fetch travel history
  const fetchTravelHistory = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${baseUrl}/api/doctor/daily-travel-info?EmployeeId=${employeeId}&limit=20`);
      const result = await response.json();
      
      if (result.success && result.data) {
        setTravels(result.data.travels || []);
        setPagination(result.data.pagination || {});
      } else {
        setTravels([]);
      }
    } catch (err) {
      console.error('Error fetching travel history:', err);
      setError('Failed to fetch travel history');
      setTravels([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTravelHistory();
  }, []);

  // Format date for display
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Calculate duration between checkin and checkout
  const calculateDuration = (checkin, checkout) => {
    if (!checkin || !checkout) return 'N/A';
    
    const checkinTime = new Date(checkin);
    const checkoutTime = new Date(checkout);
    const diffMs = checkoutTime - checkinTime;
    
    const hours = Math.floor(diffMs / (1000 * 60 * 60));
    const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
    
    return `${hours}h ${minutes}m`;
  };

  // Toggle expanded view for travel item
  const toggleExpanded = (travelId) => {
    setExpandedItems(prev => ({
      ...prev,
      [travelId]: !prev[travelId]
    }));
  };

  // Show detailed modal for travel
  const showTravelDetails = (travel) => {
    setSelectedTravel(travel);
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
            onClick={fetchTravelHistory} 
            className="mt-4 bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="max-w-md mx-auto bg-white min-h-screen shadow-xl">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-4">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-xl font-bold text-white">Travel History</h1>
              <p className="text-blue-100 text-sm mt-1">Complete visit records</p>
            </div>
            <div className="text-right">
              <button
                onClick={onBack}
                className="text-blue-100 hover:text-white text-sm transition-colors mb-1 block"
              >
                ← Back
              </button>
              <button
                onClick={onLogout}
                className="text-blue-100 hover:text-white text-xs transition-colors"
              >
                Logout
              </button>
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
                <p className="font-medium text-gray-900 text-sm">{user?.username}</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-gray-600 text-xs">Total Visits</p>
              <p className="font-bold text-blue-600 text-lg">{travels.length}</p>
            </div>
          </div>
        </div>

        {/* Travel List */}
        <div className="p-4 space-y-4">
          {travels.length > 0 ? (
            travels.map((travel) => (
              <div
                key={travel.id}
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
                        <p className="font-semibold text-gray-800">Travel #{travel.id}</p>
                        <p className="text-xs text-gray-500">Employee ID: {travel.EmployeeId}</p>
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
                        onClick={() => toggleExpanded(travel.id)}
                        className="p-1 text-gray-600 hover:bg-gray-50 rounded"
                      >
                        {expandedItems[travel.id] ? 
                          <ChevronUp className="h-4 w-4" /> : 
                          <ChevronDown className="h-4 w-4" />
                        }
                      </button>
                    </div>
                  </div>

                  {/* Time Info */}
                  <div className="grid grid-cols-2 gap-3 text-xs">
                    <div className="space-y-1">
                      <div className="flex items-center text-green-600">
                        <Clock className="h-3 w-3 mr-1" />
                        <span className="font-medium">Check-in</span>
                      </div>
                      <p className="text-gray-800 font-medium">
                        {formatDate(travel.checkinTime)}
                      </p>
                    </div>
                    
                    <div className="space-y-1">
                      <div className="flex items-center text-red-600">
                        <Clock className="h-3 w-3 mr-1" />
                        <span className="font-medium">Check-out</span>
                      </div>
                      <p className="text-gray-800 font-medium">
                        {travel.checkoutTime ? formatDate(travel.checkoutTime) : 'Not checked out'}
                      </p>
                    </div>
                  </div>

                  {/* Duration */}
                  {travel.checkoutTime && (
                    <div className="mt-3 pt-3 border-t border-gray-100">
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-gray-600">Duration</span>
                        <span className="text-sm font-semibold text-purple-600">
                          {calculateDuration(travel.checkinTime, travel.checkoutTime)}
                        </span>
                      </div>
                    </div>
                  )}
                </div>

                {/* Expanded Details */}
                {expandedItems[travel.id] && (
                  <div className="bg-gray-50 border-t border-gray-200 p-4 space-y-3">
                    {/* Location Details */}
                    <div className="grid grid-cols-2 gap-3 text-xs">
                      <div>
                        <p className="text-gray-600 mb-1">Check-in Location</p>
                        <p className="font-mono text-gray-800">
                          {travel.checkinLatitude}, {travel.checkinLongitude}
                        </p>
                      </div>
                      {travel.checkoutLatitude && (
                        <div>
                          <p className="text-gray-600 mb-1">Check-out Location</p>
                          <p className="font-mono text-gray-800">
                            {travel.checkoutLatitude}, {travel.checkoutLongitude}
                          </p>
                        </div>
                      )}
                    </div>

                    {/* Form Details */}
                    {travel.formDetail && (
                      <div className="space-y-2">
                        <div className="flex items-center space-x-2">
                          <FileText className="h-4 w-4 text-blue-600" />
                          <span className="text-sm font-medium text-gray-800">Form Details</span>
                        </div>
                        
                        <div className="bg-white rounded-lg p-3 space-y-2">
                          <div className="grid grid-cols-2 gap-2 text-xs">
                            <div>
                              <span className="text-gray-600">Farm ID:</span>
                              <span className="ml-1 font-medium">{travel.formDetail.FarmId}</span>
                            </div>
                            <div>
                              <span className="text-gray-600">Location ID:</span>
                              <span className="ml-1 font-medium">{travel.formDetail.LocationId}</span>
                            </div>
                          </div>
                          
                          {travel.formDetail.remark && (
                            <div>
                              <p className="text-gray-600 text-xs mb-1">Remark:</p>
                              <p className="text-gray-800 text-xs bg-gray-50 p-2 rounded">
                                {travel.formDetail.remark}
                              </p>
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Status */}
                    <div className="flex items-center justify-between pt-2 border-t border-gray-200">
                      <span className="text-xs text-gray-600">Status</span>
                      <div className={`flex items-center text-xs px-2 py-1 rounded-full ${
                        travel.checkoutTime ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        <CheckCircle className="h-3 w-3 mr-1" />
                        {travel.checkoutTime ? 'Completed' : 'In Progress'}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))
          ) : (
            <div className="text-center py-12">
              <Activity className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600 text-lg font-medium">No travel history found</p>
              <p className="text-gray-500 text-sm">Your completed visits will appear here</p>
            </div>
          )}
        </div>

        {/* Pagination */}
        {pagination.totalPages > 1 && (
          <div className="p-4 border-t border-gray-200 bg-gray-50">
            <div className="flex justify-between items-center text-sm">
              <span className="text-gray-600">
                Page {pagination.currentPage} of {pagination.totalPages}
              </span>
              <span className="text-gray-600">
                {pagination.totalRecords} total records
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Detailed Modal */}
      {selectedTravel && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 p-4">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold text-gray-800">
                  Travel Details #{selectedTravel.id}
                </h3>
                <button
                  onClick={() => setSelectedTravel(null)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>

            <div className="p-6 space-y-6">
              {/* Time Details */}
              <div className="space-y-4">
                <h4 className="font-medium text-gray-800 flex items-center">
                  <Clock className="h-4 w-4 mr-2" />
                  Time Information
                </h4>
                
                <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                  <div className="grid grid-cols-1 gap-3">
                    <div>
                      <p className="text-sm text-gray-600">Check-in Time</p>
                      <p className="font-medium">{formatDate(selectedTravel.checkinTime)}</p>
                    </div>
                    
                    {selectedTravel.checkoutTime && (
                      <>
                        <div>
                          <p className="text-sm text-gray-600">Check-out Time</p>
                          <p className="font-medium">{formatDate(selectedTravel.checkoutTime)}</p>
                        </div>
                        
                        <div>
                          <p className="text-sm text-gray-600">Total Duration</p>
                          <p className="font-medium text-purple-600">
                            {calculateDuration(selectedTravel.checkinTime, selectedTravel.checkoutTime)}
                          </p>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              </div>

              {/* Location Details */}
              <div className="space-y-4">
                <h4 className="font-medium text-gray-800 flex items-center">
                  <MapPin className="h-4 w-4 mr-2" />
                  Location Information
                </h4>
                
                <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                  <div>
                    <p className="text-sm text-gray-600">Check-in Coordinates</p>
                    <p className="font-mono text-sm">
                      {selectedTravel.checkinLatitude}, {selectedTravel.checkinLongitude}
                    </p>
                  </div>
                  
                  {selectedTravel.checkoutLatitude && (
                    <div>
                      <p className="text-sm text-gray-600">Check-out Coordinates</p>
                      <p className="font-mono text-sm">
                        {selectedTravel.checkoutLatitude}, {selectedTravel.checkoutLongitude}
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Form Details */}
              {selectedTravel.formDetail && (
                <div className="space-y-4">
                  <h4 className="font-medium text-gray-800 flex items-center">
                    <FileText className="h-4 w-4 mr-2" />
                    Form Information
                  </h4>
                  
                  <div className="bg-gray-50 rounded-lg p-4 space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-gray-600">Farm ID</p>
                        <p className="font-medium">{selectedTravel.formDetail.FarmId}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Location ID</p>
                        <p className="font-medium">{selectedTravel.formDetail.LocationId}</p>
                      </div>
                    </div>
                    
                    {selectedTravel.formDetail.remark && (
                      <div>
                        <p className="text-sm text-gray-600 mb-2">Remark</p>
                        <p className="text-sm bg-white p-3 rounded border">
                          {selectedTravel.formDetail.remark}
                        </p>
                      </div>
                    )}

                    {/* Categories and Subcategories */}
                    {selectedTravel.formDetail.FormDetail?.categories && (
                      <div>
                        <p className="text-sm text-gray-600 mb-3">Categories & Observations</p>
                        <div className="space-y-3">
                          {selectedTravel.formDetail.FormDetail.categories.map((category) => (
                            <div key={category.id} className="bg-white rounded border p-3">
                              <h5 className="font-medium text-sm text-gray-800 mb-2">
                                {category.CategoryName}
                              </h5>
                              
                              {category.subcategories && category.subcategories.length > 0 && (
                                <div className="space-y-2">
                                  {category.subcategories.map((sub) => (
                                    <div key={sub.id} className="bg-gray-50 rounded p-2">
                                      <div className="flex justify-between items-start mb-1">
                                        <span className="text-xs font-medium text-gray-700">
                                          {sub.SubCategoryName}
                                        </span>
                                        <span className={`text-xs px-2 py-1 rounded-full ${
                                          sub.status === 'Completed' 
                                            ? 'bg-green-100 text-green-800' 
                                            : 'bg-yellow-100 text-yellow-800'
                                        }`}>
                                          {sub.status}
                                        </span>
                                      </div>
                                      {sub.observation && (
                                        <p className="text-xs text-gray-600 mt-1">
                                          {sub.observation}
                                        </p>
                                      )}
                                    </div>
                                  ))}
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TravelHistory;