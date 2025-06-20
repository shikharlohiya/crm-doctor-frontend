// utils/offlineInit.js
import offlineDataManager from "./indexedDB";
import checkinService from "../services/checkinService";
import { NetworkUtils } from "./dataSchemas";
import toast from "react-hot-toast";

class OfflineSystemManager {
  constructor() {
    this.isInitialized = false;
    this.syncInterval = null;
  }

  async initialize() {
    if (this.isInitialized) {
      console.log("Offline system already initialized");
      return;
    }

    try {
      console.log("Initializing offline system...");

      // Initialize IndexedDB
      await offlineDataManager.init();
      console.log("✓ IndexedDB initialized");

      // Initialize checkin service
      await checkinService.init();
      console.log("✓ Checkin service initialized");

      // Set up periodic sync (every 2 minutes when online)
      this.setupPeriodicSync();
      console.log("✓ Periodic sync configured");

      // Set up network listeners
      this.setupNetworkListeners();
      console.log("✓ Network listeners configured");

      // Check for pending data and notify user
      await this.checkPendingData();

      this.isInitialized = true;
      console.log("🎉 Offline system fully initialized");

      // Show initialization complete message
      if (NetworkUtils.isOnline()) {
        toast.success("App ready - online mode");
      } else {
        toast.info("App ready - offline mode");
      }
    } catch (error) {
      console.error("Failed to initialize offline system:", error);
      toast.error("Failed to initialize offline features");
      throw error;
    }
  }

  setupPeriodicSync() {
    // Clear existing interval if any
    if (this.syncInterval) {
      clearInterval(this.syncInterval);
    }

    // Set up periodic sync every 2 minutes
    this.syncInterval = setInterval(async () => {
      if (NetworkUtils.isOnline()) {
        try {
          await checkinService.startSyncProcess();
        } catch (error) {
          console.error("Periodic sync failed:", error);
        }
      }
    }, 2 * 60 * 1000); // 2 minutes
  }

  setupNetworkListeners() {
    NetworkUtils.addNetworkListeners({
      onOnline: async () => {
        console.log("Network online - starting sync...");
        toast.success("Back online - syncing data...");

        // Small delay to ensure network is stable
        setTimeout(async () => {
          try {
            await checkinService.startSyncProcess();
          } catch (error) {
            console.error("Auto-sync on network restoration failed:", error);
          }
        }, 1000);
      },
      onOffline: () => {
        console.log("Network offline - pausing sync");
        toast.error("Connection lost - working offline");
      },
    });
  }

  async checkPendingData() {
    try {
      const pendingCheckins = await offlineDataManager.getDataByIndex(
        "checkins",
        "syncStatus",
        "pending"
      );

      const pendingForms = await offlineDataManager.getDataByIndex(
        "formSubmissions",
        "syncStatus",
        "pending"
      );

      const pendingCheckouts = await offlineDataManager.getDataByIndex(
        "checkouts",
        "syncStatus",
        "pending"
      );

      const totalPending =
        pendingCheckins.length + pendingForms.length + pendingCheckouts.length;

      if (totalPending > 0) {
        console.log(`Found ${totalPending} pending items to sync`);

        if (NetworkUtils.isOnline()) {
          toast.success(`Found ${totalPending} items to sync - syncing now...`);
          // Start sync process
          setTimeout(() => {
            checkinService.startSyncProcess();
          }, 2000);
        } else {
          toast.success(`${totalPending} items waiting to sync when online`);
        }
      }
    } catch (error) {
      console.error("Failed to check pending data:", error);
    }
  }

  async getSystemStatus() {
    if (!this.isInitialized) {
      return {
        initialized: false,
        message: "System not initialized",
      };
    }

    try {
      const [pendingCheckins, pendingForms, pendingCheckouts] =
        await Promise.all([
          offlineDataManager.getDataByIndex(
            "checkins",
            "syncStatus",
            "pending"
          ),
          offlineDataManager.getDataByIndex(
            "formSubmissions",
            "syncStatus",
            "pending"
          ),
          offlineDataManager.getDataByIndex(
            "checkouts",
            "syncStatus",
            "pending"
          ),
        ]);

      const totalPending =
        pendingCheckins.length + pendingForms.length + pendingCheckouts.length;
      const isOnline = NetworkUtils.isOnline();

      return {
        initialized: true,
        isOnline,
        pendingSync: {
          total: totalPending,
          checkins: pendingCheckins.length,
          forms: pendingForms.length,
          checkouts: pendingCheckouts.length,
        },
        canSync: isOnline && totalPending > 0,
      };
    } catch (error) {
      return {
        initialized: true,
        error: error.message,
      };
    }
  }

  async forceSync() {
    if (!NetworkUtils.isOnline()) {
      throw new Error("Cannot sync - device is offline");
    }

    console.log("Force syncing all pending data...");
    return await checkinService.forceSyncAll();
  }

  async clearAllData() {
    if (!this.isInitialized) {
      throw new Error("System not initialized");
    }

    console.log("Clearing all offline data...");

    try {
      await Promise.all([
        offlineDataManager.clearStore("checkins"),
        offlineDataManager.clearStore("formSubmissions"),
        offlineDataManager.clearStore("checkouts"),
        offlineDataManager.clearStore("images"),
        offlineDataManager.clearStore("syncQueue"),
      ]);

      toast.success("All offline data cleared");
      console.log("All offline data cleared successfully");
    } catch (error) {
      console.error("Failed to clear offline data:", error);
      throw error;
    }
  }

  async exportOfflineData() {
    if (!this.isInitialized) {
      throw new Error("System not initialized");
    }

    try {
      const [checkins, forms, checkouts, images, syncQueue] = await Promise.all(
        [
          offlineDataManager.getData("checkins"),
          offlineDataManager.getData("formSubmissions"),
          offlineDataManager.getData("checkouts"),
          offlineDataManager.getData("images"),
          offlineDataManager.getData("syncQueue"),
        ]
      );

      const exportData = {
        timestamp: new Date().toISOString(),
        data: {
          checkins,
          formSubmissions: forms,
          checkouts,
          images: images.map((img) => ({
            ...img,
            fileData: img.fileData ? "[BINARY_DATA]" : null, // Don't export actual file data
          })),
          syncQueue,
        },
      };

      return exportData;
    } catch (error) {
      console.error("Failed to export offline data:", error);
      throw error;
    }
  }

  destroy() {
    if (this.syncInterval) {
      clearInterval(this.syncInterval);
      this.syncInterval = null;
    }
    this.isInitialized = false;
    console.log("Offline system destroyed");
  }
}

// Create singleton instance
const offlineSystemManager = new OfflineSystemManager();

export default offlineSystemManager;

// React Hook for using offline system in components
import { useState, useEffect } from "react";

export const useOfflineSystem = () => {
  const [systemStatus, setSystemStatus] = useState({
    initialized: false,
    isOnline: navigator.onLine,
    pendingSync: { total: 0, checkins: 0, forms: 0, checkouts: 0 },
    canSync: false,
  });

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initializeSystem = async () => {
      try {
        await offlineSystemManager.initialize();
        await updateSystemStatus();
      } catch (error) {
        console.error("Failed to initialize offline system:", error);
      } finally {
        setLoading(false);
      }
    };

    const updateSystemStatus = async () => {
      try {
        const status = await offlineSystemManager.getSystemStatus();
        setSystemStatus(status);
      } catch (error) {
        console.error("Failed to get system status:", error);
      }
    };

    initializeSystem();

    // Update status every 30 seconds
    const interval = setInterval(updateSystemStatus, 30000);

    return () => clearInterval(interval);
  }, []);

  const forceSync = async () => {
    try {
      await offlineSystemManager.forceSync();
      // Update status after sync
      const status = await offlineSystemManager.getSystemStatus();
      setSystemStatus(status);
      return { success: true };
    } catch (error) {
      console.error("Force sync failed:", error);
      return { success: false, error: error.message };
    }
  };

  const clearAllData = async () => {
    try {
      await offlineSystemManager.clearAllData();
      // Update status after clearing
      const status = await offlineSystemManager.getSystemStatus();
      setSystemStatus(status);
      return { success: true };
    } catch (error) {
      console.error("Clear data failed:", error);
      return { success: false, error: error.message };
    }
  };

  const exportData = async () => {
    try {
      const data = await offlineSystemManager.exportOfflineData();
      return { success: true, data };
    } catch (error) {
      console.error("Export data failed:", error);
      return { success: false, error: error.message };
    }
  };

  return {
    systemStatus,
    loading,
    forceSync,
    clearAllData,
    exportData,
  };
};
