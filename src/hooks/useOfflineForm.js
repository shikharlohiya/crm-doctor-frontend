// hooks/useOfflineForm.js
import { useState, useEffect, useCallback } from "react";
import { useSelector, useDispatch } from "react-redux";
import { setFormStatus } from "../redux/slices/sessionSlice";
import offlineFormService from "../services/formSubmissionService";
import { NetworkUtils } from "../utils/dataSchemas";
import toast from "react-hot-toast";

export const useOfflineForm = () => {
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [formDetailId, setFormDetailId] = useState(null);
  const [networkStatus, setNetworkStatus] = useState({
    isOnline: navigator.onLine,
    isSlowNetwork: false,
  });
  const [pendingSyncCount, setPendingSyncCount] = useState({
    forms: 0,
    images: 0,
    total: 0,
  });
  const [syncStatus, setSyncStatus] = useState("idle"); // 'idle', 'syncing', 'synced', 'failed'

  const user = useSelector((state) => state.user.user);
  const formStatus = useSelector((state) => state.session.formStatus);
  const sessionStatus = useSelector((state) => state.session.sessionStatus);
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
        toast.success("Connection restored - syncing forms...");
        handleSync();
      },
      onOffline: () => {
        setNetworkStatus({ isOnline: false, isSlowNetwork: false });
        toast.error("Connection lost - working offline");
      },
    });

    return cleanup;
  }, []);

  // Update pending sync count
  const updatePendingSyncCount = useCallback(async () => {
    try {
      const count = await offlineFormService.getPendingSyncCount();
      setPendingSyncCount(count);
    } catch (error) {
      console.error("Failed to get pending form sync count:", error);
    }
  }, []);

  // Periodic sync check
  useEffect(() => {
    if (employeeId) {
      updatePendingSyncCount();
    }
  }, [employeeId, updatePendingSyncCount]);

  useEffect(() => {
    const interval = setInterval(() => {
      if (networkStatus.isOnline) {
        updatePendingSyncCount();
      }
    }, 30000); // Check every 30 seconds

    return () => clearInterval(interval);
  }, [networkStatus.isOnline, updatePendingSyncCount]);

  // Submit form (handles online/offline automatically)
  const submitForm = async (formData, images = {}, supportData = []) => {
    if (!employeeId) {
      setError("Employee ID not found");
      return { success: false, error: "Employee ID not found" };
    }

    try {
      setError(null);
      setSubmitting(true);

      // Prepare complete form data
      const completeFormData = {
        ...formData,
        EmployeeId: employeeId,
        supportData: supportData, // Include for offline processing
      };

      // Submit form (handles online/offline automatically)
      const result = await offlineFormService.submitForm(
        completeFormData,
        images
      );

      if (result.success) {
        // Update form status immediately
        dispatch(setFormStatus("submitted"));

        // Store form detail ID if available
        if (result.data?.formDetailId) {
          setFormDetailId(result.data.formDetailId);
        } else if (result.data?.id) {
          setFormDetailId(result.data.id); // Local ID for offline submissions
        }

        // Show appropriate message based on submission type
        if (result.type === "offline") {
          toast.success("Form saved locally - will sync when online");
        } else {
          toast.success("Form submitted successfully");
        }

        // Update pending sync count
        await updatePendingSyncCount();

        return { success: true, data: result.data, type: result.type };
      } else {
        throw new Error(result.message || "Form submission failed");
      }
    } catch (err) {
      console.error("Form submission error:", err);
      const errorMessage = `Form submission failed: ${err.message}`;
      setError(errorMessage);
      toast.error(errorMessage);
      return { success: false, error: err.message };
    } finally {
      setSubmitting(false);
    }
  };

  // Handle manual sync
  const handleSync = async () => {
    if (!networkStatus.isOnline) {
      toast.error("Cannot sync - device is offline");
      return { success: false, error: "Device is offline" };
    }

    try {
      setSyncStatus("syncing");
      await offlineFormService.forceSyncAll();
      setSyncStatus("synced");
      await updatePendingSyncCount();
      toast.success("All forms synced successfully");
      return { success: true };
    } catch (error) {
      console.error("Form sync failed:", error);
      setSyncStatus("failed");
      toast.error("Form sync failed - will retry automatically");
      return { success: false, error: error.message };
    }
  };

  // Validate form data before submission
  const validateFormData = (formData, images, supportData) => {
    const errors = [];

    // Check required remark
    if (!formData.remark || formData.remark.trim() === "") {
      errors.push("Remark is required");
    }

    // Check if any image is uploaded without an observation
    Object.entries(images).forEach(([subcategoryId, imageData]) => {
      if (imageData && imageData.file) {
        const subcategory = supportData.find(
          (item) => item.id === parseInt(subcategoryId)
        );

        // Check if observation exists in form data
        const hasObservation = formData.categoryDetails?.some(
          (detail) =>
            detail.SubCategoryId === parseInt(subcategoryId) &&
            detail.Observation &&
            detail.Observation.trim() !== ""
        );

        if (!hasObservation) {
          errors.push(
            `Observation is required for ${
              subcategory?.SubCategoryName || "uploaded image"
            }`
          );
        }
      }
    });

    return errors;
  };

  // Get network status display
  const getNetworkStatusDisplay = () => {
    if (!networkStatus.isOnline) {
      return { text: "Offline", color: "text-red-500", icon: "🔴" };
    } else if (networkStatus.isSlowNetwork) {
      return { text: "Slow Connection", color: "text-yellow-500", icon: "🟡" };
    } else {
      return { text: "Online", color: "text-green-500", icon: "🟢" };
    }
  };

  // Get sync status display
  const getSyncStatusDisplay = () => {
    if (pendingSyncCount.total > 0) {
      return {
        text: `${pendingSyncCount.total} pending`,
        color: "text-orange-500",
        showSync: true,
        details: `${pendingSyncCount.forms} forms, ${pendingSyncCount.images} images`,
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

  // Check if form can be submitted
  const canSubmitForm = () => {
    return !submitting && sessionStatus === "checked_in";
  };

  // Get form submission status message
  const getSubmissionStatusMessage = () => {
    if (!networkStatus.isOnline) {
      return "Working offline - form will sync when connected";
    } else if (networkStatus.isSlowNetwork) {
      return "Slow connection detected - form will be saved locally";
    } else {
      return "Ready to submit form";
    }
  };

  return {
    // State
    submitting,
    error,
    formDetailId,
    networkStatus,
    pendingSyncCount,
    syncStatus,
    formStatus,
    sessionStatus,

    // Actions
    submitForm,
    handleSync,
    validateFormData,

    // Utilities
    getNetworkStatusDisplay,
    getSyncStatusDisplay,
    canSubmitForm,
    getSubmissionStatusMessage,

    // Data
    employeeId,
  };
};
