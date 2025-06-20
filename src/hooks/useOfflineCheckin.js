// hooks/useOfflineCheckin.js
import { useState, useEffect, useCallback } from "react";
import { useSelector, useDispatch } from "react-redux";
import { setSessionStatus } from "../redux/slices/sessionSlice";
import checkinService from "../services/checkinService";
import { NetworkUtils } from "../utils/dataSchemas";
import toast from "react-hot-toast";

export const useOfflineCheckin = () => {
  const [isCheckedIn, setIsCheckedIn] = useState(false);
  const [checkInLoading, setCheckInLoading] = useState(false);
  const [locationLoading, setLocationLoading] = useState(false);
  const [coordinates, setCoordinates] = useState(null);
  const [error, setError] = useState(null);
  const [networkStatus, setNetworkStatus] = useState({
    isOnline: navigator.onLine,
    isSlowNetwork: false,
  });
  const [pendingSyncCount, setPendingSyncCount] = useState(0);
  const [syncStatus, setSyncStatus] = useState("idle"); // 'idle', 'syncing', 'synced', 'failed'

  const user = useSelector((state) => state.user.user);
  const sessionStatus = useSelector((state) => state.session.sessionStatus);
  const dispatch = useDispatch();

  const employeeId = user?.EmployeeId;

  // Network status monitoring
  useEffect(() => {
    const checkNetworkStatus = async () => {
      const status = await NetworkUtils.checkConnectivity();
      setNetworkStatus(status);
    };

    // Check initial network status
    checkNetworkStatus();

    // Set up network listeners
    const cleanup = NetworkUtils.addNetworkListeners({
      onOnline: () => {
        checkNetworkStatus();
        toast.success("Connection restored - syncing data...");
        handleSync();
      },
      onOffline: () => {
        setNetworkStatus({ isOnline: false, isSlowNetwork: false });
        toast.error("Connection lost - working offline");
      },
    });

    return cleanup;
  }, []);

  // Check pending sync count
  const updatePendingSyncCount = useCallback(async () => {
    try {
      const count = await checkinService.getPendingSyncCount();
      setPendingSyncCount(count);
    } catch (error) {
      console.error("Failed to get pending sync count:", error);
    }
  }, []);

  // Check checkin status on mount and when employeeId changes
  useEffect(() => {
    if (employeeId) {
      checkCheckinStatus();
      updatePendingSyncCount();
    }
  }, [employeeId]);

  // Periodic sync check
  useEffect(() => {
    const interval = setInterval(() => {
      if (networkStatus.isOnline) {
        updatePendingSyncCount();
      }
    }, 30000); // Check every 30 seconds

    return () => clearInterval(interval);
  }, [networkStatus.isOnline, updatePendingSyncCount]);

  const checkCheckinStatus = async () => {
    if (!employeeId) return;

    try {
      const status = await checkinService.getCheckinStatus(employeeId);

      if (status.hasActiveCheckin) {
        setIsCheckedIn(true);
        dispatch(setSessionStatus("checked_in"));

        if (status.pendingSync) {
          toast.info(
            "Previous check-in found - will sync when connection improves"
          );
        }
      } else {
        setIsCheckedIn(false);
        dispatch(setSessionStatus("not_checked_in"));
      }
    } catch (error) {
      console.error("Failed to check checkin status:", error);
      setError("Failed to check check-in status");
    }
  };

  const getCurrentLocation = useCallback(() => {
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
  }, []);

  const handleCheckIn = async () => {
    if (!employeeId) {
      setError("Employee ID not found");
      return;
    }

    try {
      setError(null);
      setCheckInLoading(true);

      // Get current location
      const coords = await getCurrentLocation();

      // Get selected location and farm from localStorage
      const getLocation = localStorage.getItem("selectedLocation");
      const selectedLocation = getLocation ? JSON.parse(getLocation) : null;
      const LocationId = selectedLocation ? selectedLocation.LocationId : null;

      const getFarm = localStorage.getItem("selectedFarm");
      const selectedFarm = getFarm ? JSON.parse(getFarm) : null;
      const FarmId = selectedFarm ? selectedFarm.FarmId : null;

      if (!LocationId) {
        throw new Error("Please select a location first");
      }

      // Prepare checkin data
      const checkinData = {
        employeeId: parseInt(employeeId),
        checkinLatitude: coords.latitude,
        checkinLongitude: coords.longitude,
        checkinTime: new Date().toISOString(),
        locationId: LocationId,
        farmId: FarmId,
      };

      // Perform checkin (handles online/offline automatically)
      const result = await checkinService.performCheckin(checkinData);

      if (result.success) {
        setIsCheckedIn(true);
        dispatch(setSessionStatus("checked_in"));

        // Show appropriate message based on checkin type
        if (result.type === "offline") {
          toast.success("Check-in saved locally - will sync when online");
        } else {
          toast.success("Check-in completed successfully");
        }

        // Update pending sync count
        await updatePendingSyncCount();
      } else {
        throw new Error(result.message || "Check-in failed");
      }
    } catch (err) {
      console.error("Check-in error:", err);
      setError(`Check-in failed: ${err.message}`);
      toast.error(`Check-in failed: ${err.message}`);
    } finally {
      setCheckInLoading(false);
    }
  };

  const handleSync = async () => {
    if (!networkStatus.isOnline) {
      toast.error("Cannot sync - device is offline");
      return;
    }

    try {
      setSyncStatus("syncing");
      await checkinService.forceSyncAll();
      setSyncStatus("synced");
      await updatePendingSyncCount();
      toast.success("All data synced successfully");
    } catch (error) {
      console.error("Sync failed:", error);
      setSyncStatus("failed");
      toast.error("Sync failed - will retry automatically");
    }
  };

  const getNetworkStatusDisplay = () => {
    if (!networkStatus.isOnline) {
      return { text: "Offline", color: "text-red-500", icon: "🔴" };
    } else if (networkStatus.isSlowNetwork) {
      return { text: "Slow Connection", color: "text-yellow-500", icon: "🟡" };
    } else {
      return { text: "Online", color: "text-green-500", icon: "🟢" };
    }
  };

  const getSyncStatusDisplay = () => {
    if (pendingSyncCount > 0) {
      return {
        text: `${pendingSyncCount} pending`,
        color: "text-orange-500",
        showSync: true,
      };
    } else if (syncStatus === "syncing") {
      return {
        text: "Syncing...",
        color: "text-blue-500",
        showSync: false,
      };
    } else {
      return {
        text: "All synced",
        color: "text-green-500",
        showSync: false,
      };
    }
  };

  return {
    // State
    isCheckedIn,
    checkInLoading,
    locationLoading,
    coordinates,
    error,
    networkStatus,
    pendingSyncCount,
    syncStatus,

    // Actions
    handleCheckIn,
    handleSync,
    getCurrentLocation,
    checkCheckinStatus,

    // Utilities
    getNetworkStatusDisplay,
    getSyncStatusDisplay,

    // Data
    employeeId,
    sessionStatus,
  };
};
