// services/backgroundSyncService.js
import offlineFormService from "./formSubmissionService";
import { NetworkUtils } from "../utils/dataSchemas";
import toast from "react-hot-toast";

class BackgroundSyncService {
  constructor() {
    this.isRunning = false;
    this.syncInterval = null;
    this.syncIntervalTime = 5 * 60 * 1000; // 5 minutes
    this.retryInterval = 30 * 1000; // 30 seconds for retries
    this.listeners = [];
    this.lastSyncAttempt = null;
    this.consecutiveFailures = 0;
    this.maxConsecutiveFailures = 5;
  }

  // Start background sync service
  start() {
    if (this.isRunning) {
      console.log("Background sync service already running");
      return;
    }

    console.log("Starting background sync service...");
    this.isRunning = true;

    // Initial sync check
    this.performSyncCheck();

    // Set up periodic sync
    this.syncInterval = setInterval(() => {
      this.performSyncCheck();
    }, this.syncIntervalTime);

    // Listen for network changes
    this.setupNetworkListeners();

    // Listen for visibility changes (when app comes back to foreground)
    this.setupVisibilityListeners();

    console.log("Background sync service started");
  }

  // Stop background sync service
  stop() {
    if (!this.isRunning) {
      return;
    }

    console.log("Stopping background sync service...");
    this.isRunning = false;

    if (this.syncInterval) {
      clearInterval(this.syncInterval);
      this.syncInterval = null;
    }

    // Clean up listeners
    this.cleanupListeners();

    console.log("Background sync service stopped");
  }

  // Perform sync check
  async performSyncCheck() {
    if (!this.isRunning) {
      return;
    }

    try {
      const { isOnline } = await NetworkUtils.checkConnectivity();

      if (!isOnline) {
        console.log("Background sync: Device offline, skipping sync");
        return;
      }

      // Check if there are pending items to sync
      const pendingCount = await offlineFormService.getPendingSyncCount();

      if (pendingCount.total === 0) {
        console.log("Background sync: No items to sync");
        this.consecutiveFailures = 0; // Reset failure count
        return;
      }

      console.log(`Background sync: Found ${pendingCount.total} items to sync`);

      // Notify listeners about sync start
      this.notifyListeners("syncStarted", { pendingCount });

      // Attempt sync
      await this.attemptSync();
    } catch (error) {
      console.error("Background sync check failed:", error);
      this.handleSyncFailure(error);
    }
  }

  // Attempt to sync data
  async attemptSync() {
    const startTime = Date.now();
    this.lastSyncAttempt = new Date().toISOString();

    try {
      // Sync forms
      await offlineFormService.syncPendingForms();

      // Get updated count
      const updatedCount = await offlineFormService.getPendingSyncCount();
      const syncDuration = Date.now() - startTime;

      console.log(
        `Background sync completed in ${syncDuration}ms. Remaining items: ${updatedCount.total}`
      );

      // Reset consecutive failures on success
      this.consecutiveFailures = 0;

      // Notify listeners about successful sync
      this.notifyListeners("syncCompleted", {
        duration: syncDuration,
        remainingCount: updatedCount,
        success: true,
      });

      // Show success toast if items were synced
      if (updatedCount.total === 0) {
        this.showSyncNotification("All data synced successfully", "success");
      }
    } catch (error) {
      this.handleSyncFailure(error);
      throw error;
    }
  }

  // Handle sync failure
  handleSyncFailure(error) {
    this.consecutiveFailures++;
    console.error(
      `Background sync failed (attempt ${this.consecutiveFailures}):`,
      error
    );

    // Notify listeners about sync failure
    this.notifyListeners("syncFailed", {
      error: error.message,
      consecutiveFailures: this.consecutiveFailures,
      maxFailures: this.maxConsecutiveFailures,
    });

    // If too many consecutive failures, increase sync interval
    if (this.consecutiveFailures >= this.maxConsecutiveFailures) {
      console.log(
        "Too many consecutive sync failures, slowing down sync frequency"
      );
      this.setSyncInterval(this.syncIntervalTime * 2); // Double the interval
    }

    // Show error notification (but not too frequently)
    if (this.consecutiveFailures <= 2) {
      this.showSyncNotification(
        "Sync failed - will retry automatically",
        "error"
      );
    }
  }

  // Setup network listeners
  setupNetworkListeners() {
    const cleanup = NetworkUtils.addNetworkListeners({
      onOnline: () => {
        console.log("Background sync: Network came online, attempting sync...");
        setTimeout(() => {
          this.performSyncCheck();
        }, 2000); // Wait 2 seconds after coming online
      },
      onOffline: () => {
        console.log("Background sync: Network went offline");
        this.notifyListeners("networkOffline");
      },
    });

    this.listeners.push(cleanup);
  }

  // Setup visibility change listeners
  setupVisibilityListeners() {
    const handleVisibilityChange = () => {
      if (!document.hidden && this.isRunning) {
        console.log(
          "Background sync: App became visible, checking for sync..."
        );
        setTimeout(() => {
          this.performSyncCheck();
        }, 1000);
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);

    this.listeners.push(() => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    });
  }

  // Clean up all listeners
  cleanupListeners() {
    this.listeners.forEach((cleanup) => {
      if (typeof cleanup === "function") {
        cleanup();
      }
    });
    this.listeners = [];
  }

  // Force immediate sync
  async forceSyncNow() {
    console.log("Background sync: Force sync requested");

    try {
      const { isOnline } = await NetworkUtils.checkConnectivity();

      if (!isOnline) {
        throw new Error("Device is offline");
      }

      await this.attemptSync();
      return { success: true };
    } catch (error) {
      console.error("Force sync failed:", error);
      return { success: false, error: error.message };
    }
  }

  // Set sync interval
  setSyncInterval(newInterval) {
    this.syncIntervalTime = newInterval;

    if (this.isRunning && this.syncInterval) {
      clearInterval(this.syncInterval);
      this.syncInterval = setInterval(() => {
        this.performSyncCheck();
      }, this.syncIntervalTime);
    }

    console.log(
      `Background sync interval set to ${newInterval / 1000} seconds`
    );
  }

  // Add event listener
  addEventListener(callback) {
    if (typeof callback === "function") {
      this.listeners.push(callback);
    }
  }

  // Notify all listeners
  notifyListeners(eventType, data = {}) {
    const event = {
      type: eventType,
      timestamp: new Date().toISOString(),
      data,
    };

    // Find and call event listeners (not cleanup functions)
    this.listeners.forEach((listener) => {
      if (typeof listener === "function" && listener.length > 0) {
        try {
          listener(event);
        } catch (error) {
          console.error("Background sync listener error:", error);
        }
      }
    });
  }

  // Show sync notification
  showSyncNotification(message, type = "info") {
    const now = Date.now();
    const lastNotification = this.lastNotificationTime || 0;

    // Throttle notifications - don't show more than once every 10 seconds
    if (now - lastNotification < 10000) {
      return;
    }

    this.lastNotificationTime = now;

    switch (type) {
      case "success":
        toast.success(message, { duration: 3000, position: "bottom-center" });
        break;
      case "error":
        toast.error(message, { duration: 4000, position: "bottom-center" });
        break;
      default:
        toast(message, { duration: 3000, position: "bottom-center" });
    }
  }

  // Get sync status
  getStatus() {
    return {
      isRunning: this.isRunning,
      lastSyncAttempt: this.lastSyncAttempt,
      consecutiveFailures: this.consecutiveFailures,
      syncInterval: this.syncIntervalTime,
    };
  }

  // Schedule retry with exponential backoff
  scheduleRetry(attempt = 1) {
    const backoffTime = Math.min(
      this.retryInterval * Math.pow(2, attempt - 1),
      5 * 60 * 1000
    ); // Max 5 minutes

    console.log(
      `Background sync: Scheduling retry in ${
        backoffTime / 1000
      } seconds (attempt ${attempt})`
    );

    setTimeout(() => {
      if (this.isRunning) {
        this.performSyncCheck();
      }
    }, backoffTime);
  }
}

// Create singleton instance
const backgroundSyncService = new BackgroundSyncService();

// Auto-start on import (you can disable this if needed)
if (typeof window !== "undefined") {
  // Start after a short delay to ensure everything is initialized
  setTimeout(() => {
    backgroundSyncService.start();
  }, 3000);

  // Stop service when page unloads
  window.addEventListener("beforeunload", () => {
    backgroundSyncService.stop();
  });
}

export default backgroundSyncService;
