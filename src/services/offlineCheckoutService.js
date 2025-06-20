// services/offlineCheckoutService.js
import offlineDataManager from "../utils/indexedDB";
import { CheckoutUtils, SyncUtils, NetworkUtils } from "../utils/dataSchemas";
import axiosInstance from "../library/axios";
// import toast from "react-hot-toast";

export class OfflineCheckoutService {
  constructor() {
    this.isInitialized = false;
    this.syncInProgress = false;
  }

  async init() {
    if (!this.isInitialized) {
      await offlineDataManager.init();
      this.isInitialized = true;
      console.log("OfflineCheckoutService initialized");
    }
  }

  // Main checkout method - handles online/offline automatically
  async checkout(employeeId, formDetailId, coordinates) {
    await this.init();

    const { isOnline } = await NetworkUtils.checkConnectivity();

    console.log("Checkout attempt - Network status:", { isOnline });

    if (isOnline) {
      // Try online checkout first
      try {
        const result = await this.checkoutOnline(
          employeeId,
          formDetailId,
          coordinates
        );
        console.log("Online checkout successful:", result);
        return {
          success: true,
          type: "online",
          data: result,
          message: "Checkout completed successfully",
        };
      } catch (error) {
        console.error(
          "Online checkout failed, falling back to offline:",
          error
        );
        // Fall back to offline checkout
        return await this.checkoutOffline(
          employeeId,
          formDetailId,
          coordinates
        );
      }
    } else {
      // Store checkout offline
      console.log("Using offline checkout due to network conditions");
      return await this.checkoutOffline(employeeId, formDetailId, coordinates);
    }
  }

  // Online checkout
  async checkoutOnline(employeeId, formDetailId, coordinates) {
    try {
      // Determine if formDetailId is local or server ID
      let serverFormDetailId = formDetailId;

      // If it's a local ID, try to find the corresponding server ID
      if (typeof formDetailId === "number" && formDetailId < 1000000) {
        // This is likely a local ID, try to find server ID
        const localForm = await offlineDataManager.getData(
          "formSubmissions",
          formDetailId
        );
        if (localForm && localForm.serverFormDetailId) {
          serverFormDetailId = localForm.serverFormDetailId;
        }
      }

      const checkoutData = {
        EmployeeId: parseInt(employeeId),
        checkoutLatitude: coordinates.latitude,
        checkoutLongitude: coordinates.longitude,
        checkoutTime: new Date().toISOString(),
        DocFormDetailId: serverFormDetailId,
      };

      const response = await axiosInstance.post(
        "/doctor/checkout",
        checkoutData
      );

      if (response.data?.success) {
        return response.data;
      } else {
        throw new Error(response.data?.message || "Checkout failed");
      }
    } catch (error) {
      console.error("Online checkout failed:", error);
      throw error;
    }
  }

  // Offline checkout
  async checkoutOffline(employeeId, formDetailId, coordinates) {
    try {
      // Create offline checkout data
      const offlineCheckoutData = CheckoutUtils.createOfflineCheckout(
        employeeId,
        formDetailId,
        coordinates
      );

      // Store checkout data offline
      const checkoutId = await offlineDataManager.addData(
        "checkouts",
        offlineCheckoutData
      );

      // Add to sync queue with high priority
      const syncItem = SyncUtils.createSyncQueueItem("checkout", checkoutId, 1);
      await offlineDataManager.addData("syncQueue", syncItem);

      console.log("Offline checkout stored:", checkoutId);

      return {
        success: true,
        type: "offline",
        data: {
          id: checkoutId,
          localId: checkoutId,
          message: "Checkout saved locally. Will sync when online.",
        },
        message:
          "Checkout completed offline. Will sync when connection is available.",
      };
    } catch (error) {
      console.error("Offline checkout failed:", error);
      throw new Error("Failed to save checkout data locally: " + error.message);
    }
  }

  // Get current location with proper error handling
  async getCurrentLocation() {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error("Geolocation is not supported by this browser"));
        return;
      }

      // Add timeout and better error handling
      const timeoutId = setTimeout(() => {
        reject(new Error("Location request timed out"));
      }, 15000); // 15 second timeout

      navigator.geolocation.getCurrentPosition(
        (position) => {
          clearTimeout(timeoutId);
          const coords = {
            latitude: position.coords.latitude.toString(),
            longitude: position.coords.longitude.toString(),
          };
          resolve(coords);
        },
        (error) => {
          clearTimeout(timeoutId);
          let errorMessage = "Unable to get location";
          switch (error.code) {
            case error.PERMISSION_DENIED:
              errorMessage =
                "Location access denied. Please enable location permissions.";
              break;
            case error.POSITION_UNAVAILABLE:
              errorMessage =
                "Location information unavailable. Please try again.";
              break;
            case error.TIMEOUT:
              errorMessage = "Location request timed out. Please try again.";
              break;
          }
          reject(new Error(errorMessage));
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 60000,
        }
      );
    });
  }

  // Sync pending checkouts
  async syncPendingCheckouts() {
    await this.init();

    if (this.syncInProgress) {
      console.log("Checkout sync already in progress");
      return;
    }

    const { isOnline } = await NetworkUtils.checkConnectivity();
    if (!isOnline) {
      console.log("Cannot sync checkouts - offline");
      return;
    }

    this.syncInProgress = true;
    console.log("Starting checkout sync process...");

    try {
      // Get all pending checkouts
      const pendingCheckouts = await offlineDataManager.getDataByIndex(
        "checkouts",
        "syncStatus",
        "pending"
      );

      console.log(`Found ${pendingCheckouts.length} pending checkouts to sync`);

      for (const checkout of pendingCheckouts) {
        if (!CheckoutUtils.shouldRetry(checkout.retryCount)) {
          console.log(`Checkout ${checkout.id} exceeded max retries`);
          continue;
        }

        try {
          // Mark as syncing
          const syncingCheckout = CheckoutUtils.markAsSyncing(checkout);
          await offlineDataManager.updateData("checkouts", syncingCheckout);

          // Get the server form detail ID
          let serverFormDetailId = checkout.serverFormDetailId;

          // If we don't have server form ID, try to find it
          if (!serverFormDetailId && checkout.localFormDetailId) {
            const localForm = await offlineDataManager.getData(
              "formSubmissions",
              checkout.localFormDetailId
            );
            if (localForm && localForm.serverFormDetailId) {
              serverFormDetailId = localForm.serverFormDetailId;
            } else if (localForm && localForm.syncStatus === "pending") {
              // Form hasn't been synced yet, skip this checkout for now
              console.log(
                `Checkout ${checkout.id} waiting for form to sync first`
              );

              // Reset to pending status
              const pendingCheckout = { ...checkout, syncStatus: "pending" };
              await offlineDataManager.updateData("checkouts", pendingCheckout);
              continue;
            }
          }

          // Prepare checkout data for API
          const checkoutDataForAPI = {
            EmployeeId: checkout.employeeId,
            checkoutLatitude: checkout.checkoutLatitude,
            checkoutLongitude: checkout.checkoutLongitude,
            checkoutTime: checkout.checkoutTime,
            DocFormDetailId: serverFormDetailId || checkout.localFormDetailId,
          };

          // Submit checkout data
          const apiResult = await this.checkoutAPI(checkoutDataForAPI);

          // Mark as synced
          const syncedCheckout = CheckoutUtils.markAsSynced(
            checkout,
            apiResult
          );
          await offlineDataManager.updateData("checkouts", syncedCheckout);

          console.log(`Checkout ${checkout.id} synced successfully`);

          // Update sync queue
          await this.updateSyncQueueStatus(
            checkout.id,
            "checkout",
            "completed"
          );

          // Schedule cleanup
          setTimeout(() => {
            this.cleanupSyncedCheckout(checkout.id);
          }, 24 * 60 * 60 * 1000); // Clean up after 24 hours
        } catch (error) {
          console.error(`Failed to sync checkout ${checkout.id}:`, error);

          // Mark as failed
          const failedCheckout = CheckoutUtils.markAsFailed(checkout, error);
          await offlineDataManager.updateData("checkouts", failedCheckout);

          // Update sync queue
          await this.updateSyncQueueStatus(checkout.id, "checkout", "failed");
        }
      }
    } catch (error) {
      console.error("Checkout sync process failed:", error);
    } finally {
      this.syncInProgress = false;
      console.log("Checkout sync process completed");
    }
  }

  // API method for checkout
  async checkoutAPI(checkoutData) {
    const response = await axiosInstance.post("/doctor/checkout", checkoutData);

    if (response.data?.success) {
      return response.data;
    } else {
      throw new Error(response.data?.message || "Checkout API failed");
    }
  }

  // Helper methods
  async updateSyncQueueStatus(dataId, type, status) {
    const queueItems = await offlineDataManager.getDataByIndex(
      "syncQueue",
      "type",
      type
    );
    const item = queueItems.find((qi) => qi.dataId === dataId);
    if (item) {
      item.status = status;
      item.lastAttempt = new Date().toISOString();
      await offlineDataManager.updateData("syncQueue", item);
    }
  }

  async cleanupSyncedCheckout(checkoutId) {
    try {
      const checkout = await offlineDataManager.getData(
        "checkouts",
        checkoutId
      );
      if (checkout && checkout.syncStatus === "synced") {
        console.log(`Cleaning up synced checkout ${checkoutId}`);

        // Delete checkout
        await offlineDataManager.deleteData("checkouts", checkoutId);

        // Clean up sync queue items
        const queueItems = await offlineDataManager.getDataByIndex(
          "syncQueue",
          "type",
          "checkout"
        );
        for (const item of queueItems) {
          if (item.dataId === checkoutId) {
            await offlineDataManager.deleteData("syncQueue", item.id);
          }
        }
      }
    } catch (error) {
      console.error(`Failed to cleanup checkout ${checkoutId}:`, error);
    }
  }

  // Get pending checkout count
  async getPendingCheckoutCount() {
    await this.init();

    const pendingCheckouts = await offlineDataManager.getDataByIndex(
      "checkouts",
      "syncStatus",
      "pending"
    );

    return pendingCheckouts.length;
  }

  // Get all checkouts for a user
  async getUserCheckouts(employeeId) {
    await this.init();

    const checkouts = await offlineDataManager.getDataByIndex(
      "checkouts",
      "employeeId",
      employeeId
    );

    // Sort by creation date (newest first)
    return checkouts.sort(
      (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
    );
  }

  // Force sync all pending checkouts
  async forceSyncAll() {
    console.log("Force syncing all pending checkouts...");
    await this.syncPendingCheckouts();
  }
}

// Create singleton instance
const offlineCheckoutService = new OfflineCheckoutService();
export default offlineCheckoutService;
