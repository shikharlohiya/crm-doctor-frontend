// components/SyncStatusIndicator.js
import React, { useState, useEffect } from "react";
import {
  Wifi,
  WifiOff,
  CloudOff,
  Sync,
  CheckCircle,
  AlertCircle,
  Clock,
  X,
} from "lucide-react";
import backgroundSyncService from "../services/backgroundSyncService";
import offlineFormService from "../services/formSubmissionService";
import { NetworkUtils } from "../utils/dataSchemas";

const SyncStatusIndicator = ({
  position = "bottom-right",
  showDetails = false,
  onSyncClick = null,
  className = "",
}) => {
  const [networkStatus, setNetworkStatus] = useState({
    isOnline: navigator.onLine,
    isSlowNetwork: false,
  });
  const [syncStatus, setSyncStatus] = useState("idle");
  const [pendingCount, setPendingCount] = useState({
    forms: 0,
    images: 0,
    total: 0,
  });
  const [lastSyncTime, setLastSyncTime] = useState(null);
  const [syncError, setSyncError] = useState(null);
  const [showDetailedStatus, setShowDetailedStatus] = useState(false);
  const [consecutiveFailures, setConsecutiveFailures] = useState(0);

  // Update network status
  useEffect(() => {
    const checkNetworkStatus = async () => {
      const status = await NetworkUtils.checkConnectivity();
      setNetworkStatus(status);
    };

    checkNetworkStatus();

    const cleanup = NetworkUtils.addNetworkListeners({
      onOnline: () => {
        checkNetworkStatus();
      },
      onOffline: () => {
        setNetworkStatus({ isOnline: false, isSlowNetwork: false });
      },
    });

    return cleanup;
  }, []);

  // Update pending count
  const updatePendingCount = async () => {
    try {
      const count = await offlineFormService.getPendingSyncCount();
      setPendingCount(count);
    } catch (error) {
      console.error("Failed to get pending sync count:", error);
    }
  };

  // Listen to background sync events
  useEffect(() => {
    const handleSyncEvent = (event) => {
      switch (event.type) {
        case "syncStarted":
          setSyncStatus("syncing");
          setSyncError(null);
          if (event.data?.pendingCount) {
            setPendingCount(event.data.pendingCount);
          }
          break;

        case "syncCompleted":
          setSyncStatus("completed");
          setLastSyncTime(new Date().toISOString());
          setConsecutiveFailures(0);
          if (event.data?.remainingCount) {
            setPendingCount(event.data.remainingCount);
          }
          // Reset to idle after 3 seconds
          setTimeout(() => setSyncStatus("idle"), 3000);
          break;

        case "syncFailed":
          setSyncStatus("failed");
          setSyncError(event.data?.error || "Sync failed");
          setConsecutiveFailures(event.data?.consecutiveFailures || 0);
          // Reset to idle after 5 seconds
          setTimeout(() => setSyncStatus("idle"), 5000);
          break;

        case "networkOffline":
          setNetworkStatus({ isOnline: false, isSlowNetwork: false });
          break;
      }
    };

    backgroundSyncService.addEventListener(handleSyncEvent);

    // Initial update
    updatePendingCount();

    // Periodic update
    const interval = setInterval(updatePendingCount, 30000);

    return () => {
      clearInterval(interval);
    };
  }, []);

  // Handle manual sync
  const handleSyncClick = async () => {
    if (onSyncClick) {
      onSyncClick();
      return;
    }

    if (!networkStatus.isOnline) {
      return;
    }

    try {
      setSyncStatus("syncing");
      await backgroundSyncService.forceSyncNow();
      await updatePendingCount();
    } catch (error) {
      console.error("Manual sync failed:", error);
    }
  };

  // Get status icon and color
  const getStatusIcon = () => {
    if (!networkStatus.isOnline) {
      return { icon: WifiOff, color: "text-red-500", bg: "bg-red-100" };
    }

    if (syncStatus === "syncing") {
      return {
        icon: Sync,
        color: "text-blue-500",
        bg: "bg-blue-100",
        spin: true,
      };
    }

    if (syncStatus === "failed" || consecutiveFailures > 0) {
      return { icon: AlertCircle, color: "text-red-500", bg: "bg-red-100" };
    }

    if (pendingCount.total > 0) {
      return { icon: CloudOff, color: "text-orange-500", bg: "bg-orange-100" };
    }

    if (syncStatus === "completed") {
      return { icon: CheckCircle, color: "text-green-500", bg: "bg-green-100" };
    }

    return { icon: Wifi, color: "text-green-500", bg: "bg-green-100" };
  };

  // Get status text
  const getStatusText = () => {
    if (!networkStatus.isOnline) {
      return "Offline";
    }

    if (syncStatus === "syncing") {
      return "Syncing...";
    }

    if (syncStatus === "failed") {
      return "Sync failed";
    }

    if (pendingCount.total > 0) {
      return `${pendingCount.total} pending`;
    }

    if (syncStatus === "completed") {
      return "Synced";
    }

    return "Online";
  };

  // Get detailed status
  const getDetailedStatus = () => {
    const details = [];

    if (!networkStatus.isOnline) {
      details.push("Device is offline");
    } else if (networkStatus.isSlowNetwork) {
      details.push("Slow network connection");
    } else {
      details.push("Connected to internet");
    }

    if (pendingCount.total > 0) {
      details.push(
        `${pendingCount.forms} forms, ${pendingCount.images} images pending`
      );
    }

    if (lastSyncTime) {
      const lastSync = new Date(lastSyncTime);
      const now = new Date();
      const diffMinutes = Math.floor((now - lastSync) / 60000);

      if (diffMinutes < 1) {
        details.push("Last sync: Just now");
      } else if (diffMinutes < 60) {
        details.push(`Last sync: ${diffMinutes}m ago`);
      } else {
        const diffHours = Math.floor(diffMinutes / 60);
        details.push(`Last sync: ${diffHours}h ago`);
      }
    }

    if (consecutiveFailures > 0) {
      details.push(`${consecutiveFailures} consecutive failures`);
    }

    if (syncError) {
      details.push(`Error: ${syncError}`);
    }

    return details;
  };

  const { icon: StatusIcon, color, bg, spin } = getStatusIcon();
  const statusText = getStatusText();
  const canSync =
    networkStatus.isOnline &&
    syncStatus !== "syncing" &&
    pendingCount.total > 0;

  // Position classes
  const positionClasses = {
    "top-left": "top-4 left-4",
    "top-right": "top-4 right-4",
    "bottom-left": "bottom-4 left-4",
    "bottom-right": "bottom-4 right-4",
  };

  if (!showDetails) {
    // Compact indicator
    return (
      <div className={`fixed ${positionClasses[position]} z-50 ${className}`}>
        <div
          className={`${bg} ${color} p-2 rounded-full shadow-lg cursor-pointer transition-all hover:scale-110`}
          onClick={() => setShowDetailedStatus(!showDetailedStatus)}
          title={statusText}
        >
          <StatusIcon className={`h-4 w-4 ${spin ? "animate-spin" : ""}`} />
        </div>

        {/* Pending count badge */}
        {pendingCount.total > 0 && (
          <div className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
            {pendingCount.total > 9 ? "9+" : pendingCount.total}
          </div>
        )}

        {/* Detailed status popup */}
        {showDetailedStatus && (
          <div className="absolute bottom-full mb-2 right-0 bg-white border border-gray-200 rounded-lg shadow-lg p-3 min-w-64">
            <div className="flex items-center justify-between mb-2">
              <h4 className="font-medium text-gray-900">Sync Status</h4>
              <button
                onClick={() => setShowDetailedStatus(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="space-y-1 text-sm text-gray-600">
              {getDetailedStatus().map((detail, index) => (
                <div key={index}>{detail}</div>
              ))}
            </div>

            {canSync && (
              <button
                onClick={handleSyncClick}
                className="mt-3 w-full bg-blue-500 text-white text-sm py-1 px-3 rounded hover:bg-blue-600 transition-colors"
              >
                Sync Now
              </button>
            )}
          </div>
        )}
      </div>
    );
  }

  // Detailed indicator (for inline use)
  return (
    <div className={`flex items-center space-x-2 ${className}`}>
      <div className={`${bg} ${color} p-1 rounded-full`}>
        <StatusIcon className={`h-3 w-3 ${spin ? "animate-spin" : ""}`} />
      </div>
      <span className={`text-xs ${color}`}>{statusText}</span>

      {pendingCount.total > 0 && (
        <span className="bg-red-500 text-white text-xs px-1 rounded-full">
          {pendingCount.total}
        </span>
      )}

      {canSync && (
        <button
          onClick={handleSyncClick}
          className="text-blue-500 hover:text-blue-700 text-xs underline"
        >
          Sync
        </button>
      )}
    </div>
  );
};

export default SyncStatusIndicator;
