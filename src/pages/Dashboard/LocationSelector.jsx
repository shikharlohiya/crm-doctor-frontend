import { useState, useEffect } from "react";
import axiosInstance from "../../library/axios";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";

const LocationSelector = () => {
  const [locations, setLocations] = useState([]);
  const [farms, setFarms] = useState([]);
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [farmLoading, setFarmLoading] = useState(false);

  const navigate = useNavigate();

  // Fetch locations on component mount
  useEffect(() => {
    fetchLocations();
  }, []);

  const { user } = useSelector((state) => state.user);
  const employeeId = user.EmployeeId;

  const fetchLocations = async () => {
    try {
      setLoading(true);
      const response = await axiosInstance.get(`/doctor/doc-locations`);
      const result = response.data;
      if (result.success && Array.isArray(result.data)) {
        setLocations(result.data);
      } else {
        setLocations([]);
      }
    } catch (err) {
      setError("Failed to fetch locations");
      console.error("Locations API Error:", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchFarms = async () => {
    try {
      setFarmLoading(true);
      const response = await axiosInstance.get(
        `/doctor/doc-emp-farms?EmployeeId=${employeeId}`
      );
      const result = response.data;

      if (result.success && Array.isArray(result.data)) {
        setFarms(result.data);
      } else {
        setFarms([]);
      }
    } catch (err) {
      setError("Failed to fetch farms");
      console.error("Farms API Error:", err);
    } finally {
      setFarmLoading(false);
    }
  };

  const handleLocationSelect = (location) => {
    setSelectedLocation(location);
    if (location.LocationName === "Farm Visit") {
      fetchFarms();
    }
  };

  const handleFarmSelect = (farmData) => {
    navigate("/dashboard/checkin", {
      state: { farmData },
    });
  };

  const handleHoVisitSelect = () => {
    navigate("/dashboard/checkin", { state: { selectedLocation } });
  };

  const getLocationIcon = (locationName) => {
    switch (locationName) {
      case "Farm Visit":
        return "🚜";
      case "HO Visit":
        return "🏥";
      default:
        return "📍";
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen px-4 py-8 bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading locations...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen px-4 py-8 bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-md">
          <div className="flex items-center">
            <span className="text-red-500 text-xl mr-2">⚠️</span>
            <p className="text-red-700">{error}</p>
          </div>
          <button
            onClick={fetchLocations}
            className="mt-4 bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen px-4 py-8 bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-2xl shadow-xl p-8">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                {!selectedLocation
                  ? "Select Visit Type"
                  : selectedLocation.LocationName === "Farm Visit"
                  ? "Select Farm"
                  : "Confirm Location"}
              </h1>
              <p className="text-gray-600">
                {!selectedLocation
                  ? "Choose the type of visit"
                  : selectedLocation.LocationName === "Farm Visit"
                  ? "Select your assigned farm"
                  : "Proceed with HO visit"}
              </p>
            </div>
            <button
              onClick={(e) => {
                e.preventDefault();
                if (selectedLocation !== null) {
                  setSelectedLocation(null);
                } else {
                  navigate("/dashboard");
                }
              }}
              className="text-gray-500 hover:text-gray-700 p-2 rounded-lg transition-colors hover:bg-gray-100"
            >
              ← Back
            </button>
          </div>

          {/* Breadcrumb */}
          {selectedLocation && (
            <div className="mb-6 text-sm text-gray-600">
              <span className="cursor-pointer hover:text-blue-600">
                Visit Types
              </span>
              <span className="mx-2">→</span>
              <span className="font-medium text-gray-900">
                {selectedLocation.LocationName}
              </span>
            </div>
          )}

          {/* Location Selection */}
          {!selectedLocation ? (
            <div className="grid gap-4">
              {locations.length > 0 ? (
                locations.map((location) => (
                  <button
                    key={location.LocationId}
                    onClick={() => handleLocationSelect(location)}
                    className="w-full text-left p-6 border-2 border-gray-200 rounded-xl hover:border-blue-500 hover:bg-blue-50 transition-all duration-200 hover:shadow-lg transform hover:scale-105"
                  >
                    <div className="flex items-center">
                      <span className="text-3xl mr-4">
                        {getLocationIcon(location.LocationName)}
                      </span>
                      <div>
                        <span className="font-semibold text-gray-900 text-lg block">
                          {location.LocationName}
                        </span>
                        <span className="text-gray-600 text-sm">
                          {location.LocationName === "Farm Visit"
                            ? "Visit assigned farms"
                            : "Head office visit"}
                        </span>
                      </div>
                    </div>
                  </button>
                ))
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <span className="text-4xl mb-4 block">📍</span>
                  <p>No locations available</p>
                </div>
              )}
            </div>
          ) : selectedLocation.LocationName === "Farm Visit" ? (
            /* Farm List for Farm Visit */
            <div className="space-y-3">
              {farmLoading ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
                  <p className="text-gray-600">
                    Loading your assigned farms...
                  </p>
                </div>
              ) : farms.length > 0 ? (
                <div className="max-h-96 overflow-y-auto space-y-3">
                  {farms.map((farmData, index) => (
                    <button
                      key={index}
                      onClick={() => handleFarmSelect(farmData)}
                      className="w-full text-left p-4 border border-gray-200 rounded-lg hover:border-green-500 hover:bg-green-50 transition-all duration-200 hover:shadow-md"
                    >
                      <div className="flex items-start">
                        {/* <span className="text-xl mr-3 mt-1">🚜</span> */}
                        <div className="flex-1">
                          <div className="font-medium text-gray-900 mb-1">
                            {farmData.farm.FarmName}
                          </div>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <span className="text-4xl mb-4 block">🚜</span>
                  <p>No farms assigned to you</p>
                  <p className="text-sm mt-2">
                    Contact your administrator for farm assignments
                  </p>
                </div>
              )}
            </div>
          ) : (
            /* HO Visit Confirmation */
            <div className="text-center py-8">
              <span className="text-6xl mb-4 block">🏥</span>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                HO Visit
              </h3>
              <p className="text-gray-600 mb-6">
                You've selected to proceed with a Head Office visit
              </p>
              <button
                onClick={handleHoVisitSelect}
                className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white py-3 px-8 rounded-xl font-semibold hover:from-blue-600 hover:to-indigo-700 transform hover:scale-105 transition-all duration-200 shadow-lg"
              >
                Proceed with HO Visit
              </button>
            </div>
          )}

          {/* Footer Info */}
          <div className="mt-6 pt-4 border-t border-gray-200">
            <p className="text-sm text-gray-500 text-center">
              {!selectedLocation
                ? `Showing ${locations.length} visit types available`
                : selectedLocation.LocationName === "Farm Visit"
                ? `Employee Name: ${user.EmployeeName} • Employee ID: ${employeeId} • ${farms.length} farms assigned`
                : "Ready to proceed with HO visit"}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LocationSelector;
