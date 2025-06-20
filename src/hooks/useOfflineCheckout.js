// hooks/useOfflineCheckout.js
import { useState, useEffect, useCallback } from "react";
import { useSelector, useDispatch } from "react-redux";
import { resetSession } from "../redux/slices/sessionSlice";
import offlineCheckoutService from "../services/offlineCheckoutService";
import { NetworkUtils } from "../utils/dataSchemas";
import toast from "react-hot-toast";

export const useOfflineCheckout = () => {
  const [checkingOut, setCheckingOut] = useState(false);
  const [error, setError] = useState(null);
  const [networkStatus, setNetworkStatus] = useState({
    isOnline: navigator.onLine,
    isSlowNetwork: false,
  });
  const [pendingCheckoutCount, setPendingCheckoutCount] = useState(0);
  const [userCheckouts, setUserCheckouts] = useState([]);
  const [locationPermission, setLocationPermission] = useState("prompt"); // 'granted', 'denied', 'prompt'

  const user = useSelector((state) => state.user.user);
  const dispatch = useDispatch();
  const employeeId = user?.EmployeeId;

  // Network status monitoring
  useEffect(() => {
    const checkNetworkStatus = async () => {
      const status = await NetworkUtils.checkConnectivity();
      setNetworkStatus(status);
    };

    checkNetworkStatus();

    const cleanup = NetworkUtils.addNetworkListeners({
      onOnline: () => {
        checkNetworkStatus();
        handleSyncCheckouts();
      },
      onOffline: () => {
        setNetworkStatus({ isOnline: false, isSlowNetwork: false });
      },
    });

    return cleanup;
  }, []);

  // Check location permission on mount
  useEffect(() => {
    const checkLocationPermission = async () => {
      if ("permissions" in navigator) {
        try {
          const result = await navigator.permissions.query({
            name: "geolocation",
          });
          setLocationPermission(result.state);

          // Listen for permission changes
          result.onchange = () => {
            setLocationPermission(result.state);
          };
        } catch (error) {
          console.log("Permissions API not supported");
        }
      }
    };

    checkLocationPermission();
  }, []);

  // Update pending checkout count
  const updatePendingCheckoutCount = useCallback(async () => {
    if (!employeeId) return;

    try {
      const count = await offlineCheckoutService.getPendingCheckoutCount();
      setPendingCheckoutCount(count);
    } catch (error) {
      console.error("Failed to get pending checkout count:", error);
    }
  }, [employeeId]);

  // Load user checkouts
  const loadUserCheckouts = useCallback(async () => {
    if (!employeeId) return;

    try {
      const checkouts = await offlineCheckoutService.getUserCheckouts(
        employeeId
      );
      setUserCheckouts(checkouts);
    } catch (error) {
      console.error("Failed to load user checkouts:", error);
    }
  }, [employeeId]);

  // Initial data load
  useEffect(() => {
    if (employeeId) {
      updatePendingCheckoutCount();
      loadUserCheckouts();
    }
  }, [employeeId, updatePendingCheckoutCount, loadUserCheckouts]);

  // Periodic updates
  useEffect(() => {
    const interval = setInterval(() => {
      if (employeeId) {
        updatePendingCheckoutCount();
        if (networkStatus.isOnline) {
          loadUserCheckouts();
        }
      }
    }, 30000); // Check every 30 seconds

    return () => clearInterval(interval);
  }, [
    employeeId,
    networkStatus.isOnline,
    updatePendingCheckoutCount,
    loadUserCheckouts,
  ]);

  // Main checkout function
  const checkout = async (formDetailId, options = {}) => {
    if (!employeeId) {
      setError("Employee ID not found");
      return { success: false, error: "Employee ID not found" };
    }

    try {
      setError(null);
      setCheckingOut(true);

      // Get current location
      const coordinates = await offlineCheckoutService.getCurrentLocation();

      // Perform checkout (handles online/offline automatically)
      const result = await offlineCheckoutService.checkout(
        employeeId,
        formDetailId,
        coordinates
      );

      if (result.success) {
        // Show appropriate message based on checkout type
        if (result.type === "offline") {
          toast.success("Checkout saved offline - will sync when online");
        } else {
          toast.success("Checkout completed successfully");
        }

        // Reset session for online checkout, or if requested
        if (result.type === "online" || options.resetSession) {
          dispatch(resetSession());
        }

        // Update local data
        await updatePendingCheckoutCount();
        await loadUserCheckouts();

        return {
          success: true,
          data: result.data,
          type: result.type,
          isOffline: result.type === "offline",
        };
      } else {
        throw new Error(result.message || "Checkout failed");
      }
    } catch (err) {
      console.error("Checkout error:", err);
      const errorMessage = `Checkout failed: ${err.message}`;
      setError(errorMessage);

      // Show different messages for different error types
      if (
        err.message.includes("location") ||
        err.message.includes("Location")
      ) {
        toast.error("Location access required for checkout");
      } else if (
        err.message.includes("network") ||
        err.message.includes("offline")
      ) {
        toast.error("Network error - checkout saved for later sync");
      } else {
        toast.error(errorMessage);
      }

      return { success: false, error: err.message };
    } finally {
      setCheckingOut(false);
    }
  };

  // Handle manual sync of checkouts
  const handleSyncCheckouts = async () => {
    if (!networkStatus.isOnline) {
      toast.error("Cannot sync - device is offline");
      return { success: false, error: "Device is offline" };
    }

    try {
      await offlineCheckoutService.forceSyncAll();
      await updatePendingCheckoutCount();
      await loadUserCheckouts();

      if (pendingCheckoutCount > 0) {
        toast.success("Checkout data synced successfully");
      }

      return { success: true };
    } catch (error) {
      console.error("Checkout sync failed:", error);
      toast.error("Checkout sync failed - will retry automatically");
      return { success: false, error: error.message };
    }
  };

  // Check if checkout is possible
  const canCheckout = () => {
    if (checkingOut) return false;
    if (locationPermission === "denied") return false;
    return true;
  };

  // Get checkout button text based on conditions
  const getCheckoutButtonText = () => {
    if (checkingOut) {
      return networkStatus.isOnline ? "Checking out..." : "Saving checkout...";
    }

    if (locationPermission === "denied") {
      return "Location Required";
    }

    if (!networkStatus.isOnline) {
      return "Checkout (Offline)";
    }

    return "Checkout";
  };

  // Get checkout status message
  const getCheckoutStatusMessage = () => {
    if (locationPermission === "denied") {
      return "Location access required for checkout. Please enable in browser settings.";
    }

    if (!networkStatus.isOnline) {
      return "Working offline - checkout will sync when connected";
    }

    return "Ready to checkout";
  };

  // Get checkout icon based on status
  const getCheckoutIcon = () => {
    if (!networkStatus.isOnline) {
      return "wifi-off";
    }

    if (locationPermission === "denied") {
      return "map-pin-off";
    }

    return "check-circle";
  };

  // Request location permission
  const requestLocationPermission = async () => {
    try {
      const coordinates = await offlineCheckoutService.getCurrentLocation();
      setLocationPermission("granted");
      return true;
    } catch (error) {
      if (error.message.includes("denied")) {
        setLocationPermission("denied");
      }
      return false;
    }
  };

  return {
    // State
    checkingOut,
    error,
    networkStatus,
    pendingCheckoutCount,
    userCheckouts,
    locationPermission,

    // Actions
    checkout,
    handleSyncCheckouts,
    requestLocationPermission,

    // Utilities
    canCheckout,
    getCheckoutButtonText,
    getCheckoutStatusMessage,
    getCheckoutIcon,

    // Data
    employeeId,
  };
};
