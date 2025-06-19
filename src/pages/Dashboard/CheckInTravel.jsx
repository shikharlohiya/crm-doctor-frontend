import React, { useState, useEffect } from "react";
import {
  MapPin,
  User,
  Clock,
  Navigation,
  RefreshCw,
  Calendar,
  CheckSquare,
  AlertCircle,
  Play,
} from "lucide-react";
import axiosInstance from "../../library/axios";
import { useSelector, useDispatch } from "react-redux";
import { setSessionStatus } from "../../redux/slices/sessionSlice";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { Button } from "@mui/material";

const CheckInTravel = () => {
  const [isCheckedIn, setIsCheckedIn] = useState(false);
  const [travelData, setTravelData] = useState([]);
  const [activeTravel, setActiveTravel] = useState(null);

  // Location and check-in states
  const [locationLoading, setLocationLoading] = useState(false);
  const [checkInLoading, setCheckInLoading] = useState(false);
  const [travelLoading, setTravelLoading] = useState(false);
  const [coordinates, setCoordinates] = useState(null);
  const [error, setError] = useState(null);

  const user = useSelector((state) => state.user.user);
  const employeeId = user.EmployeeId;

  const navigate = useNavigate();
  const dispatch = useDispatch();

  const locationDetails = useSelector((state) => state.session.locationDetails);
  const farmDetails = useSelector((state) => state.session.farmDetails);
  const sessionStatus = useSelector((state) => state.session.sessionStatus);
  // const formStatus = useSelector((state) => state.session.formStatus);
  // console.log(formStatus);

  const getLocation = localStorage.getItem("selectedLocation");
  const selectedLocation = getLocation ? JSON.parse(getLocation) : null;
  const LocationId = selectedLocation ? selectedLocation.LocationId : null;
  const LocationName = selectedLocation ? selectedLocation.LocationName : null;

  const getFarm = localStorage.getItem("selectedFarm");
  const selectedFarm = getFarm ? JSON.parse(getFarm) : null;
  const FarmId = selectedFarm ? selectedFarm.FarmId : null;
  const FarmName = selectedFarm ? selectedFarm.farm.FarmName : null;

  // Get user's current location
  const getCurrentLocation = () => {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error("Geolocation is not supported by this browser"));
        return;
      }

      setLocationLoading(true);
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const coords = {
            latitude: position.coords.latitude.toString(),
            longitude: position.coords.longitude.toString(),
          };
          setCoordinates(coords);
          setLocationLoading(false);
          resolve(coords);
        },
        (error) => {
          setLocationLoading(false);
          let errorMessage = "Unable to get location";
          switch (error.code) {
            case error.PERMISSION_DENIED:
              errorMessage = "Location access denied by user";
              break;
            case error.POSITION_UNAVAILABLE:
              errorMessage = "Location information unavailable";
              break;
            case error.TIMEOUT:
              errorMessage = "Location request timed out";
              break;
          }
          reject(new Error(errorMessage));
        },
        {
          enableHighAccuracy: true,
          timeout: 30000,
          maximumAge: 60000,
        }
      );
    });
  };

  // Fetch travel data
  const fetchTravelData = async () => {
    try {
      setTravelLoading(true);
      setError(null);
      const response = await axiosInstance.get(
        `/doctor/daily-travel-info?EmployeeId=${employeeId}`
      );
      const result = response.data;
      if (result.success && result.data && Array.isArray(result.data.travels)) {
        setTravelData(result.data.travels);
        console.log(result.data.travels);

        // Check if there's an active travel (no checkout time)
        const activeTravelRecord = result.data.travels.find(
          (travel) => !travel.checkoutTime
        );
        if (activeTravelRecord) {
          setActiveTravel(activeTravelRecord);
          setIsCheckedIn(true);
        }
      } else {
        setTravelData([]);
      }
    } catch (err) {
      console.error("Travel API Error:", err);
      setError("Failed to fetch travel data");
      setTravelData([]);
    } finally {
      setTravelLoading(false);
    }
  };

  // Check-in API call
  const performCheckIn = async (coords) => {
    try {
      setCheckInLoading(true);
      setError(null);
      const checkInData = {
        EmployeeId: parseInt(employeeId),
        checkinLatitude: coords.latitude,
        checkinLongitude: coords.longitude,
        checkinTime: new Date().toISOString(),
        LocationId: LocationId,
        FarmId: FarmId,
      };

      const response = await axiosInstance.post(`/doctor/checkin`, checkInData);
      const result = response?.data;
      if (result.success) {
        setIsCheckedIn(true);
        dispatch(setSessionStatus("checked_in"));
        // Refresh travel data to get the new check-in record
        await fetchTravelData();
        toast.success(result.message);
      } else {
        throw new Error(result.message || "Check-in failed");
      }
    } catch (err) {
      console.error("Check-in API Error:", err);
      setError(`Check-in failed: ${err.message}`);
    } finally {
      setCheckInLoading(false);
    }
  };

  // Handle check-in process
  const handleCheckIn = async () => {
    try {
      setError(null);
      const coords = await getCurrentLocation();
      await performCheckIn(coords);
    } catch (err) {
      setError(`Check-in failed: ${err.message}`);
    }
  };

  // Format date for display
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString("en-IN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  };

  // Handle start form
  const handleStartForm = () => {
    if (activeTravel) {
      navigate("/dashboard/form");
    } else {
      alert("No active travel found. Please check in first.");
    }
  };

  useEffect(() => {
    fetchTravelData();
  }, []);

  return (
    <div className="">
      <div className="max-w-md mx-auto ">
        {/* Header */}
        <div className="bg-gradient-to-r from-green-700 to-green-800 px-6 py-4 rounded-lg">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-xl font-bold text-white">Visit Management</h1>
              <p className="text-white text-sm mt-1">
                {!isCheckedIn
                  ? "Check in to start your visit"
                  : "Manage your visit and travel"}
              </p>
            </div>
            <div className="text-right">
              <button
                onClick={() => navigate("/dashboard")}
                className="text-white text-sm transition-colors mb-1 border border-white rounded-lg px-2 py-1 m-1 block"
              >
                Back
              </button>
            </div>
          </div>
        </div>

        {/* Status Cards */}
        <div className="p-4 space-y-3 bg-gray-50">
          <div className="flex items-center space-x-3">
            <MapPin className="h-4 w-4 text-green-600" />
            <div>
              <p className="text-xs text-gray-600">Location</p>
              <p className="text-sm font-medium text-gray-900">
                {/* {LocationName} */}
                {locationDetails?.locationName}
                {farmDetails && ` - ${farmDetails.farmName}`}
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <User className="h-4 w-4 text-blue-600" />
            <div>
              <p className="text-xs text-gray-600">Doctor</p>
              <p className="text-sm font-medium text-gray-900">
                {user?.EmployeeName} (ID- {user?.EmployeeId})
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <Clock className="h-4 w-4 text-orange-600" />
            <div>
              <p className="text-xs text-gray-600">Status</p>
              <p className="text-sm font-medium text-gray-900">
                {sessionStatus === "not_checked_in"
                  ? "Check In Pending"
                  : sessionStatus === "checked_in"
                  ? "Checked In"
                  : "Checked Out"}
              </p>
            </div>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mx-4 mt-4 bg-red-50 border border-red-200 rounded-lg p-3">
            <div className="flex items-center">
              <AlertCircle className="h-4 w-4 text-red-500 mr-2" />
              <p className="text-red-700 text-sm">{error}</p>
            </div>
          </div>
        )}

        {/* Content Area */}
        <div className="flex-1 p-4">
          {!isCheckedIn ? (
            /* Check-in Section */
            <div className="text-center space-y-4">
              <h2 className="text-lg font-semibold text-gray-800">
                Ready to Start Your Visit?
              </h2>
              <p className="text-gray-600 text-sm">
                Check in to begin documenting your visit. We'll use your current
                location.
              </p>

              {coordinates && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                  <div className="flex items-center justify-center text-green-700">
                    <Navigation className="h-4 w-4 mr-2" />
                    <span className="text-sm">
                      Location found: {coordinates.latitude.substring(0, 8)},{" "}
                      {coordinates.longitude.substring(0, 8)}
                    </span>
                  </div>
                </div>
              )}

              <button
                onClick={handleCheckIn}
                disabled={checkInLoading || locationLoading}
                className="w-full bg-gradient-to-r from-green-500 to-emerald-600 text-white py-3 px-6 rounded-xl font-semibold hover:from-green-600 hover:to-emerald-700 transform hover:scale-105 transition-all duration-200 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
              >
                {checkInLoading ? (
                  <div className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                    Checking in...
                  </div>
                ) : locationLoading ? (
                  <div className="flex items-center justify-center">
                    <Navigation className="h-5 w-5 mr-2 animate-pulse" />
                    Getting location...
                  </div>
                ) : (
                  <>📍 Check In Now</>
                )}
              </button>
            </div>
          ) : (
            /* Travel History Section */
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <div className="flex items-center space-x-2">
                  <Calendar className="h-5 w-5 text-blue-600" />
                  <div>
                    <h2 className="text-lg font-semibold text-gray-800">
                      Today's Visits
                    </h2>
                  </div>
                </div>
                {console.log(travelData)}
                <button
                  onClick={fetchTravelData}
                  disabled={travelLoading}
                  className="p-2 text-gray-600 hover:text-gray-800 transition-colors"
                >
                  <RefreshCw
                    className={`h-4 w-4 ${travelLoading ? "animate-spin" : ""}`}
                  />
                </button>
              </div>

              {travelLoading ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mx-auto mb-2"></div>
                  <p className="text-gray-600 text-sm">Loading...</p>
                </div>
              ) : travelData.length > 0 ? (
                <div className="space-y-3">
                  {travelData
                    .filter((travel) => !travel.checkoutTime)
                    .map((travel) => (
                      <div
                        key={travel.id}
                        onClick={() =>
                          !travel.checkoutTime && handleStartForm()
                        }
                        className={`border rounded-xl p-4 transition-all cursor-pointer ${
                          !travel.checkoutTime
                            ? "border-green-500 bg-green-50 shadow-md hover:shadow-lg"
                            : "border-gray-200 bg-gray-50"
                        }`}
                      >
                        <div className="flex justify-between items-start">
                          <div className="space-y-2 flex-1">
                            <div className="flex items-center space-x-2">
                              <span
                                className={`inline-block w-2 h-2 rounded-full ${
                                  !travel.checkoutTime
                                    ? "bg-green-500 animate-pulse"
                                    : "bg-gray-400"
                                }`}
                              ></span>
                              {/* <span className="font-medium text-gray-900 text-sm">
                                Visit ID- {travel.id}
                              </span> */}
                              {!travel.checkoutTime && (
                                <span className="bg-green-100 text-green-800 text-xs px-2 py-0.5 rounded-full">
                                  Active
                                </span>
                              )}
                            </div>

                            <div className="text-xs space-y-1">
                              <div>
                                <span className="text-gray-600">Check-in:</span>
                                <span className="font-medium ml-1">
                                  {formatDate(travel.checkinTime)}
                                </span>
                              </div>
                              {travel.checkoutTime && (
                                <div>
                                  <span className="text-gray-600">
                                    Check-out:
                                  </span>
                                  <span className="font-medium ml-1">
                                    {formatDate(travel.checkoutTime)}
                                  </span>
                                </div>
                              )}
                            </div>
                          </div>

                          <div className="flex flex-col items-end space-y-1">
                            {travel.DocFormDetailId && (
                              <span className="bg-blue-100 text-blue-800 text-xs px-2 py-0.5 rounded-full">
                                Form Completed
                              </span>
                            )}
                            {!travel.checkoutTime && (
                              <span className="bg-red-100 text-red-800 text-xs px-2 py-0.5 rounded-full">
                                Checkout Pending
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <Calendar className="h-8 w-8 mx-auto mb-2 text-gray-400" />
                  <p className="text-sm">No travel records found</p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Fixed Bottom Button */}
        {/* <button
          type="button"
          onClick={handleCheckout}
          className="flex-1 bg-gradient-to-r from-orange-500 to-red-600 text-white py-3 px-4 rounded-lg font-medium hover:from-orange-600 hover:to-red-700 transition-all disabled:opacity-50"
        >
          {submitting ? (
            <div className="flex items-center justify-center">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-1"></div>
              Checking out...
            </div>
          ) : (
            "Checkout"
          )}
        </button> */}
        {/* {isCheckedIn && activeTravel && (
          <div className="sticky bottom-0 bg-white border-t border-gray-200 p-4">
            <button
              onClick={handleStartForm}
              className="w-full bg-gradient-to-r from-blue-500 to-indigo-600 text-white py-3 px-6 rounded-xl font-semibold hover:from-blue-600 hover:to-indigo-700 transform hover:scale-105 transition-all duration-200 shadow-lg flex items-center justify-center"
            >
              <CheckSquare className="h-5 w-5 mr-2" />
              Start Form
            </button>
          </div>
        )} */}
      </div>
    </div>
  );
};

export default CheckInTravel;
