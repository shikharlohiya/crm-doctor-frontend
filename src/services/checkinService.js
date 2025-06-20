// // services/checkinService.js
// import offlineDataManager from "../utils/indexedDB";
// import { DataSchemas, NetworkUtils, SyncUtils } from "../utils/dataSchemas";
// import axiosInstance from "../library/axios";

// export class CheckinService {
//   constructor() {
//     this.isInitialized = false;
//     this.syncInProgress = false;
//     this.setupNetworkListeners();
//   }

//   async init() {
//     if (!this.isInitialized) {
//       await offlineDataManager.init();
//       this.isInitialized = true;
//       console.log("CheckinService initialized");

//       // Start sync process if online
//       if (NetworkUtils.isOnline()) {
//         this.startSyncProcess();
//       }
//     }
//   }

//   setupNetworkListeners() {
//     NetworkUtils.addNetworkListeners({
//       onOnline: () => {
//         console.log("Network back online - starting sync process");
//         this.startSyncProcess();
//       },
//       onOffline: () => {
//         console.log("Network went offline - sync paused");
//         this.syncInProgress = false;
//       },
//     });
//   }

//   async performCheckin(checkinData) {
//     await this.init();

//     const { isOnline, isSlowNetwork } = await NetworkUtils.checkConnectivity();

//     console.log("Network status:", { isOnline, isSlowNetwork });

//     if (isOnline && !isSlowNetwork) {
//       // Fast network - try direct API call
//       try {
//         const result = await this.checkinViaAPI(checkinData);
//         console.log("Direct checkin successful:", result);
//         return {
//           success: true,
//           type: "online",
//           data: result,
//           message: "Check-in completed successfully",
//         };
//       } catch (error) {
//         console.error(
//           "Direct checkin failed, falling back to offline storage:",
//           error
//         );
//         // Fall back to offline storage
//         return await this.checkinOffline(checkinData);
//       }
//     } else {
//       // Slow network or offline - store locally
//       console.log("Using offline checkin due to network conditions");
//       return await this.checkinOffline(checkinData);
//     }
//   }

//   async checkinViaAPI(checkinData) {
//     const apiData = {
//       EmployeeId: parseInt(checkinData.employeeId),
//       checkinLatitude: checkinData.checkinLatitude,
//       checkinLongitude: checkinData.checkinLongitude,
//       checkinTime: checkinData.checkinTime,
//       LocationId: checkinData.locationId,
//       FarmId: checkinData.farmId,
//     };

//     const response = await axiosInstance.post("/doctor/checkin", apiData);
//     const result = response?.data;

//     if (!result.success) {
//       throw new Error(result.message || "Check-in failed");
//     }

//     return result;
//   }

//   async checkinOffline(checkinData) {
//     try {
//       const offlineCheckinData = {
//         ...DataSchemas.checkin,
//         employeeId: checkinData.employeeId,
//         checkinLatitude: checkinData.checkinLatitude,
//         checkinLongitude: checkinData.checkinLongitude,
//         checkinTime: checkinData.checkinTime,
//         locationId: checkinData.locationId,
//         farmId: checkinData.farmId,
//         syncStatus: "pending",
//       };

//       const checkinId = await offlineDataManager.addData(
//         "checkins",
//         offlineCheckinData
//       );

//       // Add to sync queue
//       const syncItem = SyncUtils.createSyncQueueItem("checkin", checkinId, 1); // High priority
//       await offlineDataManager.addData("syncQueue", syncItem);

//       console.log("Offline checkin stored:", checkinId);

//       return {
//         success: true,
//         type: "offline",
//         data: {
//           id: checkinId,
//           localId: checkinId,
//           message: "Check-in saved locally. Will sync when online.",
//         },
//         message: "Check-in saved locally. Will sync when connection improves.",
//       };
//     } catch (error) {
//       console.error("Offline checkin failed:", error);
//       throw new Error("Failed to save check-in data locally");
//     }
//   }

//   async getCheckinStatus(employeeId) {
//     await this.init();

//     // Check for pending offline checkins
//     const pendingCheckins = await offlineDataManager.getDataByIndex(
//       "checkins",
//       "employeeId",
//       employeeId
//     );

//     const pendingOfflineCheckins = pendingCheckins.filter(
//       (checkin) =>
//         checkin.syncStatus === "pending" || checkin.syncStatus === "syncing"
//     );

//     if (pendingOfflineCheckins.length > 0) {
//       return {
//         hasActiveCheckin: true,
//         type: "offline",
//         checkinData: pendingOfflineCheckins[0],
//         pendingSync: true,
//       };
//     }

//     // If online, also check server status
//     const { isOnline } = await NetworkUtils.checkConnectivity();
//     if (isOnline) {
//       try {
//         // Check server for active checkin
//         const response = await axiosInstance.get(
//           `/doctor/daily-travel-info?EmployeeId=${employeeId}`
//         );
//         const result = response.data;

//         if (
//           result.success &&
//           result.data &&
//           Array.isArray(result.data.travels)
//         ) {
//           const activeTravel = result.data.travels.find(
//             (travel) => !travel.checkoutTime
//           );

//           if (activeTravel) {
//             return {
//               hasActiveCheckin: true,
//               type: "online",
//               checkinData: activeTravel,
//               pendingSync: false,
//             };
//           }
//         }
//       } catch (error) {
//         console.error("Failed to check server checkin status:", error);
//       }
//     }

//     return {
//       hasActiveCheckin: false,
//       type: null,
//       checkinData: null,
//       pendingSync: false,
//     };
//   }

//   async startSyncProcess() {
//     if (this.syncInProgress) {
//       console.log("Sync already in progress");
//       return;
//     }

//     const { isOnline } = await NetworkUtils.checkConnectivity();
//     if (!isOnline) {
//       console.log("Cannot sync - offline");
//       return;
//     }

//     this.syncInProgress = true;
//     console.log("Starting sync process...");

//     try {
//       await this.syncPendingCheckins();
//     } catch (error) {
//       console.error("Sync process failed:", error);
//     } finally {
//       this.syncInProgress = false;
//       console.log("Sync process completed");
//     }
//   }

//   async syncPendingCheckins() {
//     await this.init();

//     // Get all pending checkins
//     const pendingCheckins = await offlineDataManager.getDataByIndex(
//       "checkins",
//       "syncStatus",
//       "pending"
//     );

//     console.log(`Found ${pendingCheckins.length} pending checkins to sync`);

//     for (const checkin of pendingCheckins) {
//       if (!SyncUtils.shouldRetry(checkin.retryCount)) {
//         console.log(`Checkin ${checkin.id} exceeded max retries`);
//         continue;
//       }

//       try {
//         // Mark as syncing
//         const syncingCheckin = SyncUtils.markAsSyncing(checkin);
//         await offlineDataManager.updateData("checkins", syncingCheckin);

//         // Attempt sync
//         const apiResult = await this.checkinViaAPI(checkin);

//         // Mark as synced with server data
//         const syncedCheckin = SyncUtils.markAsSynced(checkin, {
//           serverCheckinId: apiResult.data?.id || null,
//         });
//         await offlineDataManager.updateData("checkins", syncedCheckin);

//         console.log(`Checkin ${checkin.id} synced successfully`);

//         // Update sync queue
//         await this.updateSyncQueueStatus(checkin.id, "checkin", "completed");

//         // Optional: Clean up old synced data after a delay
//         setTimeout(() => {
//           this.cleanupSyncedCheckin(checkin.id);
//         }, 24 * 60 * 60 * 1000); // Clean up after 24 hours
//       } catch (error) {
//         console.error(`Failed to sync checkin ${checkin.id}:`, error);

//         // Mark as failed
//         const failedCheckin = SyncUtils.markAsFailed(checkin, error);
//         await offlineDataManager.updateData("checkins", failedCheckin);

//         // Update sync queue
//         await this.updateSyncQueueStatus(checkin.id, "checkin", "failed");

//         // Schedule retry if allowed
//         if (SyncUtils.shouldRetry(failedCheckin.retryCount)) {
//           const retryDelay = SyncUtils.generateRetryDelay(
//             failedCheckin.retryCount
//           );
//           setTimeout(() => {
//             this.retrySyncCheckin(checkin.id);
//           }, retryDelay);
//         }
//       }
//     }
//   }

//   async updateSyncQueueStatus(dataId, type, status) {
//     const queueItems = await offlineDataManager.getDataByIndex(
//       "syncQueue",
//       "type",
//       type
//     );

//     const item = queueItems.find((qi) => qi.dataId === dataId);
//     if (item) {
//       item.status = status;
//       item.lastAttempt = new Date().toISOString();
//       await offlineDataManager.updateData("syncQueue", item);
//     }
//   }

//   async retrySyncCheckin(checkinId) {
//     const checkin = await offlineDataManager.getData("checkins", checkinId);
//     if (checkin && SyncUtils.isSyncable(checkin)) {
//       console.log(`Retrying sync for checkin ${checkinId}`);
//       await this.syncPendingCheckins();
//     }
//   }

//   async cleanupSyncedCheckin(checkinId) {
//     try {
//       const checkin = await offlineDataManager.getData("checkins", checkinId);
//       if (checkin && checkin.syncStatus === "synced") {
//         console.log(`Cleaning up synced checkin ${checkinId}`);
//         await offlineDataManager.deleteData("checkins", checkinId);

//         // Also clean up related sync queue items
//         const queueItems = await offlineDataManager.getDataByIndex(
//           "syncQueue",
//           "type",
//           "checkin"
//         );

//         for (const item of queueItems) {
//           if (item.dataId === checkinId) {
//             await offlineDataManager.deleteData("syncQueue", item.id);
//           }
//         }
//       }
//     } catch (error) {
//       console.error(`Failed to cleanup checkin ${checkinId}:`, error);
//     }
//   }

//   async getPendingSyncCount() {
//     await this.init();

//     const pendingCheckins = await offlineDataManager.getDataByIndex(
//       "checkins",
//       "syncStatus",
//       "pending"
//     );

//     return pendingCheckins.length;
//   }

//   async forceSyncAll() {
//     console.log("Force syncing all pending data...");
//     await this.startSyncProcess();
//   }
// }

// // Create singleton instance
// const checkinService = new CheckinService();
// export default checkinService;
// services/checkinService.js
import offlineDataManager from "../utils/indexedDB";
import { DataSchemas, NetworkUtils, SyncUtils } from "../utils/dataSchemas";
import axiosInstance from "../library/axios";

export class CheckinService {
  constructor() {
    this.isInitialized = false;
    this.syncInProgress = false;
    this.setupNetworkListeners();
  }

  async init() {
    if (!this.isInitialized) {
      await offlineDataManager.init();
      this.isInitialized = true;
      console.log("CheckinService initialized");

      // Start sync process if online
      if (NetworkUtils.isOnline()) {
        this.startSyncProcess();
      }
    }
  }

  setupNetworkListeners() {
    NetworkUtils.addNetworkListeners({
      onOnline: () => {
        console.log("Network back online - starting sync process");
        this.startSyncProcess();
      },
      onOffline: () => {
        console.log("Network went offline - sync paused");
        this.syncInProgress = false;
      },
    });
  }

  async performCheckin(checkinData) {
    await this.init();

    const { isOnline, isSlowNetwork } = await NetworkUtils.checkConnectivity();

    console.log("Network status:", { isOnline, isSlowNetwork });

    if (isOnline && !isSlowNetwork) {
      // Fast network - try direct API call
      try {
        const result = await this.checkinViaAPI(checkinData);
        console.log("Direct checkin successful:", result);
        return {
          success: true,
          type: "online",
          data: result,
          message: "Check-in completed successfully",
        };
      } catch (error) {
        console.error(
          "Direct checkin failed, falling back to offline storage:",
          error
        );
        // Fall back to offline storage
        return await this.checkinOffline(checkinData);
      }
    } else {
      // Slow network or offline - store locally
      console.log("Using offline checkin due to network conditions");
      return await this.checkinOffline(checkinData);
    }
  }

  async checkinViaAPI(checkinData) {
    const apiData = {
      EmployeeId: parseInt(checkinData.employeeId),
      checkinLatitude: checkinData.checkinLatitude,
      checkinLongitude: checkinData.checkinLongitude,
      checkinTime: checkinData.checkinTime,
      LocationId: checkinData.locationId,
      FarmId: checkinData.farmId,
    };

    const response = await axiosInstance.post("/doctor/checkin", apiData);
    const result = response?.data;

    if (!result.success) {
      throw new Error(result.message || "Check-in failed");
    }

    return result;
  }

  async checkinOffline(checkinData) {
    try {
      // Create offline checkin data without the 'id' field (IndexedDB will auto-generate it)
      const offlineCheckinData = {
        employeeId: checkinData.employeeId,
        checkinLatitude: checkinData.checkinLatitude,
        checkinLongitude: checkinData.checkinLongitude,
        checkinTime: checkinData.checkinTime,
        locationId: checkinData.locationId,
        farmId: checkinData.farmId,
        syncStatus: "pending",
        retryCount: 0,
        lastError: null,
        serverCheckinId: null,
      };

      const checkinId = await offlineDataManager.addData(
        "checkins",
        offlineCheckinData
      );

      // Add to sync queue
      const syncItem = SyncUtils.createSyncQueueItem("checkin", checkinId, 1); // High priority
      await offlineDataManager.addData("syncQueue", syncItem);

      console.log("Offline checkin stored:", checkinId);

      return {
        success: true,
        type: "offline",
        data: {
          id: checkinId,
          localId: checkinId,
          message: "Check-in saved locally. Will sync when online.",
        },
        message: "Check-in saved locally. Will sync when connection improves.",
      };
    } catch (error) {
      console.error("Offline checkin failed:", error);
      throw new Error("Failed to save check-in data locally: " + error.message);
    }
  }

  async getCheckinStatus(employeeId) {
    await this.init();

    // Check for pending offline checkins
    const pendingCheckins = await offlineDataManager.getDataByIndex(
      "checkins",
      "employeeId",
      employeeId
    );

    const pendingOfflineCheckins = pendingCheckins.filter(
      (checkin) =>
        checkin.syncStatus === "pending" || checkin.syncStatus === "syncing"
    );

    if (pendingOfflineCheckins.length > 0) {
      return {
        hasActiveCheckin: true,
        type: "offline",
        checkinData: pendingOfflineCheckins[0],
        pendingSync: true,
      };
    }

    // If online, also check server status
    const { isOnline } = await NetworkUtils.checkConnectivity();
    if (isOnline) {
      try {
        // Check server for active checkin
        const response = await axiosInstance.get(
          `/doctor/daily-travel-info?EmployeeId=${employeeId}`
        );
        const result = response.data;

        if (
          result.success &&
          result.data &&
          Array.isArray(result.data.travels)
        ) {
          const activeTravel = result.data.travels.find(
            (travel) => !travel.checkoutTime
          );

          if (activeTravel) {
            return {
              hasActiveCheckin: true,
              type: "online",
              checkinData: activeTravel,
              pendingSync: false,
            };
          }
        }
      } catch (error) {
        console.error("Failed to check server checkin status:", error);
      }
    }

    return {
      hasActiveCheckin: false,
      type: null,
      checkinData: null,
      pendingSync: false,
    };
  }

  async startSyncProcess() {
    if (this.syncInProgress) {
      console.log("Sync already in progress");
      return;
    }

    const { isOnline } = await NetworkUtils.checkConnectivity();
    if (!isOnline) {
      console.log("Cannot sync - offline");
      return;
    }

    this.syncInProgress = true;
    console.log("Starting sync process...");

    try {
      await this.syncPendingCheckins();
    } catch (error) {
      console.error("Sync process failed:", error);
    } finally {
      this.syncInProgress = false;
      console.log("Sync process completed");
    }
  }

  async syncPendingCheckins() {
    await this.init();

    // Get all pending checkins
    const pendingCheckins = await offlineDataManager.getDataByIndex(
      "checkins",
      "syncStatus",
      "pending"
    );

    console.log(`Found ${pendingCheckins.length} pending checkins to sync`);

    for (const checkin of pendingCheckins) {
      if (!SyncUtils.shouldRetry(checkin.retryCount)) {
        console.log(`Checkin ${checkin.id} exceeded max retries`);
        continue;
      }

      try {
        // Mark as syncing
        const syncingCheckin = SyncUtils.markAsSyncing(checkin);
        await offlineDataManager.updateData("checkins", syncingCheckin);

        // Attempt sync
        const apiResult = await this.checkinViaAPI(checkin);

        // Mark as synced with server data
        const syncedCheckin = SyncUtils.markAsSynced(checkin, {
          serverCheckinId: apiResult.data?.id || null,
        });
        await offlineDataManager.updateData("checkins", syncedCheckin);

        console.log(`Checkin ${checkin.id} synced successfully`);

        // Update sync queue
        await this.updateSyncQueueStatus(checkin.id, "checkin", "completed");

        // Optional: Clean up old synced data after a delay
        setTimeout(() => {
          this.cleanupSyncedCheckin(checkin.id);
        }, 24 * 60 * 60 * 1000); // Clean up after 24 hours
      } catch (error) {
        console.error(`Failed to sync checkin ${checkin.id}:`, error);

        // Mark as failed
        const failedCheckin = SyncUtils.markAsFailed(checkin, error);
        await offlineDataManager.updateData("checkins", failedCheckin);

        // Update sync queue
        await this.updateSyncQueueStatus(checkin.id, "checkin", "failed");

        // Schedule retry if allowed
        if (SyncUtils.shouldRetry(failedCheckin.retryCount)) {
          const retryDelay = SyncUtils.generateRetryDelay(
            failedCheckin.retryCount
          );
          setTimeout(() => {
            this.retrySyncCheckin(checkin.id);
          }, retryDelay);
        }
      }
    }
  }

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

  async retrySyncCheckin(checkinId) {
    const checkin = await offlineDataManager.getData("checkins", checkinId);
    if (checkin && SyncUtils.isSyncable(checkin)) {
      console.log(`Retrying sync for checkin ${checkinId}`);
      await this.syncPendingCheckins();
    }
  }

  async cleanupSyncedCheckin(checkinId) {
    try {
      const checkin = await offlineDataManager.getData("checkins", checkinId);
      if (checkin && checkin.syncStatus === "synced") {
        console.log(`Cleaning up synced checkin ${checkinId}`);
        await offlineDataManager.deleteData("checkins", checkinId);

        // Also clean up related sync queue items
        const queueItems = await offlineDataManager.getDataByIndex(
          "syncQueue",
          "type",
          "checkin"
        );

        for (const item of queueItems) {
          if (item.dataId === checkinId) {
            await offlineDataManager.deleteData("syncQueue", item.id);
          }
        }
      }
    } catch (error) {
      console.error(`Failed to cleanup checkin ${checkinId}:`, error);
    }
  }

  async getPendingSyncCount() {
    await this.init();

    const pendingCheckins = await offlineDataManager.getDataByIndex(
      "checkins",
      "syncStatus",
      "pending"
    );

    return pendingCheckins.length;
  }

  async forceSyncAll() {
    console.log("Force syncing all pending data...");
    await this.startSyncProcess();
  }
}

// Create singleton instance
const checkinService = new CheckinService();
export default checkinService;
