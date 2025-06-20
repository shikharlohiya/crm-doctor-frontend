// // utils/indexedDB.js
// class OfflineDataManager {
//   constructor() {
//     this.dbName = "FarmVisitDB";
//     this.dbVersion = 1;
//     this.db = null;
//   }

//   // Initialize IndexedDB
//   async init() {
//     return new Promise((resolve, reject) => {
//       const request = indexedDB.open(this.dbName, this.dbVersion);

//       request.onerror = () => {
//         console.error("IndexedDB failed to open");
//         reject(request.error);
//       };

//       request.onsuccess = () => {
//         this.db = request.result;
//         console.log("IndexedDB opened successfully");
//         resolve(this.db);
//       };

//       request.onupgradeneeded = (event) => {
//         const db = event.target.result;

//         // Create object stores if they don't exist

//         // 1. Check-in data store
//         if (!db.objectStoreNames.contains("checkins")) {
//           const checkinStore = db.createObjectStore("checkins", {
//             keyPath: "id",
//             autoIncrement: true,
//           });
//           checkinStore.createIndex("employeeId", "employeeId", {
//             unique: false,
//           });
//           checkinStore.createIndex("timestamp", "timestamp", { unique: false });
//           checkinStore.createIndex("syncStatus", "syncStatus", {
//             unique: false,
//           });
//         }

//         // 2. Form submissions store
//         if (!db.objectStoreNames.contains("formSubmissions")) {
//           const formStore = db.createObjectStore("formSubmissions", {
//             keyPath: "id",
//             autoIncrement: true,
//           });
//           formStore.createIndex("employeeId", "employeeId", { unique: false });
//           formStore.createIndex("checkinId", "checkinId", { unique: false });
//           formStore.createIndex("syncStatus", "syncStatus", { unique: false });
//         }

//         // 3. Checkout data store
//         if (!db.objectStoreNames.contains("checkouts")) {
//           const checkoutStore = db.createObjectStore("checkouts", {
//             keyPath: "id",
//             autoIncrement: true,
//           });
//           checkoutStore.createIndex("employeeId", "employeeId", {
//             unique: false,
//           });
//           checkoutStore.createIndex("checkinId", "checkinId", {
//             unique: false,
//           });
//           checkoutStore.createIndex("syncStatus", "syncStatus", {
//             unique: false,
//           });
//         }

//         // 4. Images store for offline image handling
//         if (!db.objectStoreNames.contains("images")) {
//           const imageStore = db.createObjectStore("images", {
//             keyPath: "id",
//             autoIncrement: true,
//           });
//           imageStore.createIndex("formSubmissionId", "formSubmissionId", {
//             unique: false,
//           });
//           imageStore.createIndex("syncStatus", "syncStatus", { unique: false });
//         }

//         // 5. Sync queue for tracking sync operations
//         if (!db.objectStoreNames.contains("syncQueue")) {
//           const syncStore = db.createObjectStore("syncQueue", {
//             keyPath: "id",
//             autoIncrement: true,
//           });
//           syncStore.createIndex("type", "type", { unique: false });
//           syncStore.createIndex("priority", "priority", { unique: false });
//           syncStore.createIndex("status", "status", { unique: false });
//         }

//         console.log("IndexedDB object stores created");
//       };
//     });
//   }

//   // Generic method to add data to any store
//   async addData(storeName, data) {
//     if (!this.db) {
//       throw new Error("Database not initialized");
//     }

//     return new Promise((resolve, reject) => {
//       const transaction = this.db.transaction([storeName], "readwrite");
//       const store = transaction.objectStore(storeName);

//       const request = store.add({
//         ...data,
//         timestamp: new Date().toISOString(),
//         syncStatus: "pending",
//       });

//       request.onsuccess = () => {
//         console.log(`Data added to ${storeName}:`, request.result);
//         resolve(request.result);
//       };

//       request.onerror = () => {
//         console.error(`Failed to add data to ${storeName}:`, request.error);
//         reject(request.error);
//       };
//     });
//   }

//   // Generic method to get data from any store
//   async getData(storeName, query = null) {
//     if (!this.db) {
//       throw new Error("Database not initialized");
//     }

//     return new Promise((resolve, reject) => {
//       const transaction = this.db.transaction([storeName], "readonly");
//       const store = transaction.objectStore(storeName);

//       let request;
//       if (query) {
//         request = store.get(query);
//       } else {
//         request = store.getAll();
//       }

//       request.onsuccess = () => {
//         resolve(request.result);
//       };

//       request.onerror = () => {
//         reject(request.error);
//       };
//     });
//   }

//   // Generic method to update data
//   async updateData(storeName, data) {
//     if (!this.db) {
//       throw new Error("Database not initialized");
//     }

//     return new Promise((resolve, reject) => {
//       const transaction = this.db.transaction([storeName], "readwrite");
//       const store = transaction.objectStore(storeName);

//       const request = store.put(data);

//       request.onsuccess = () => {
//         resolve(request.result);
//       };

//       request.onerror = () => {
//         reject(request.error);
//       };
//     });
//   }

//   // Generic method to delete data
//   async deleteData(storeName, id) {
//     if (!this.db) {
//       throw new Error("Database not initialized");
//     }

//     return new Promise((resolve, reject) => {
//       const transaction = this.db.transaction([storeName], "readwrite");
//       const store = transaction.objectStore(storeName);

//       const request = store.delete(id);

//       request.onsuccess = () => {
//         resolve(request.result);
//       };

//       request.onerror = () => {
//         reject(request.error);
//       };
//     });
//   }

//   // Get data by index
//   async getDataByIndex(storeName, indexName, value) {
//     if (!this.db) {
//       throw new Error("Database not initialized");
//     }

//     return new Promise((resolve, reject) => {
//       const transaction = this.db.transaction([storeName], "readonly");
//       const store = transaction.objectStore(storeName);
//       const index = store.index(indexName);

//       const request = index.getAll(value);

//       request.onsuccess = () => {
//         resolve(request.result);
//       };

//       request.onerror = () => {
//         reject(request.error);
//       };
//     });
//   }

//   // Clear all data from a store
//   async clearStore(storeName) {
//     if (!this.db) {
//       throw new Error("Database not initialized");
//     }

//     return new Promise((resolve, reject) => {
//       const transaction = this.db.transaction([storeName], "readwrite");
//       const store = transaction.objectStore(storeName);

//       const request = store.clear();

//       request.onsuccess = () => {
//         resolve();
//       };

//       request.onerror = () => {
//         reject(request.error);
//       };
//     });
//   }
// }

// // Create singleton instance
// const offlineDataManager = new OfflineDataManager();

// export default offlineDataManager;

// utils/indexedDB.js
class OfflineDataManager {
  constructor() {
    this.dbName = "FarmVisitDB";
    this.dbVersion = 1;
    this.db = null;
  }

  // Initialize IndexedDB
  async init() {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, this.dbVersion);

      request.onerror = () => {
        console.error("IndexedDB failed to open");
        reject(request.error);
      };

      request.onsuccess = () => {
        this.db = request.result;
        console.log("IndexedDB opened successfully");
        resolve(this.db);
      };

      request.onupgradeneeded = (event) => {
        const db = event.target.result;

        // Create object stores if they don't exist

        // 1. Check-in data store
        if (!db.objectStoreNames.contains("checkins")) {
          const checkinStore = db.createObjectStore("checkins", {
            keyPath: "id",
            autoIncrement: true,
          });
          checkinStore.createIndex("employeeId", "employeeId", {
            unique: false,
          });
          checkinStore.createIndex("timestamp", "timestamp", { unique: false });
          checkinStore.createIndex("syncStatus", "syncStatus", {
            unique: false,
          });
        }

        // 2. Form submissions store
        if (!db.objectStoreNames.contains("formSubmissions")) {
          const formStore = db.createObjectStore("formSubmissions", {
            keyPath: "id",
            autoIncrement: true,
          });
          formStore.createIndex("employeeId", "employeeId", { unique: false });
          formStore.createIndex("checkinId", "checkinId", { unique: false });
          formStore.createIndex("syncStatus", "syncStatus", { unique: false });
        }

        // 3. Checkout data store
        if (!db.objectStoreNames.contains("checkouts")) {
          const checkoutStore = db.createObjectStore("checkouts", {
            keyPath: "id",
            autoIncrement: true,
          });
          checkoutStore.createIndex("employeeId", "employeeId", {
            unique: false,
          });
          checkoutStore.createIndex("checkinId", "checkinId", {
            unique: false,
          });
          checkoutStore.createIndex("syncStatus", "syncStatus", {
            unique: false,
          });
        }

        // 4. Images store for offline image handling
        if (!db.objectStoreNames.contains("images")) {
          const imageStore = db.createObjectStore("images", {
            keyPath: "id",
            autoIncrement: true,
          });
          imageStore.createIndex("formSubmissionId", "formSubmissionId", {
            unique: false,
          });
          imageStore.createIndex("syncStatus", "syncStatus", { unique: false });
        }

        // 5. Sync queue for tracking sync operations
        if (!db.objectStoreNames.contains("syncQueue")) {
          const syncStore = db.createObjectStore("syncQueue", {
            keyPath: "id",
            autoIncrement: true,
          });
          syncStore.createIndex("type", "type", { unique: false });
          syncStore.createIndex("priority", "priority", { unique: false });
          syncStore.createIndex("status", "status", { unique: false });
        }

        console.log("IndexedDB object stores created");
      };
    });
  }

  // Generic method to add data to any store
  async addData(storeName, data) {
    if (!this.db) {
      throw new Error("Database not initialized");
    }

    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction([storeName], "readwrite");
      const store = transaction.objectStore(storeName);

      // Prepare data for insertion
      const dataToInsert = {
        ...data,
        timestamp: data.timestamp || new Date().toISOString(),
        syncStatus: data.syncStatus || "pending",
      };

      const request = store.add(dataToInsert);

      request.onsuccess = () => {
        console.log(`Data added to ${storeName}:`, request.result);
        resolve(request.result);
      };

      request.onerror = () => {
        console.error(`Failed to add data to ${storeName}:`, request.error);
        reject(request.error);
      };
    });
  }

  // Generic method to get data from any store
  async getData(storeName, query = null) {
    if (!this.db) {
      throw new Error("Database not initialized");
    }

    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction([storeName], "readonly");
      const store = transaction.objectStore(storeName);

      let request;
      if (query) {
        request = store.get(query);
      } else {
        request = store.getAll();
      }

      request.onsuccess = () => {
        resolve(request.result);
      };

      request.onerror = () => {
        reject(request.error);
      };
    });
  }

  // Generic method to update data
  async updateData(storeName, data) {
    if (!this.db) {
      throw new Error("Database not initialized");
    }

    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction([storeName], "readwrite");
      const store = transaction.objectStore(storeName);

      const request = store.put(data);

      request.onsuccess = () => {
        resolve(request.result);
      };

      request.onerror = () => {
        reject(request.error);
      };
    });
  }

  // Generic method to delete data
  async deleteData(storeName, id) {
    if (!this.db) {
      throw new Error("Database not initialized");
    }

    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction([storeName], "readwrite");
      const store = transaction.objectStore(storeName);

      const request = store.delete(id);

      request.onsuccess = () => {
        resolve(request.result);
      };

      request.onerror = () => {
        reject(request.error);
      };
    });
  }

  // Get data by index
  async getDataByIndex(storeName, indexName, value) {
    if (!this.db) {
      throw new Error("Database not initialized");
    }

    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction([storeName], "readonly");
      const store = transaction.objectStore(storeName);
      const index = store.index(indexName);

      const request = index.getAll(value);

      request.onsuccess = () => {
        resolve(request.result);
      };

      request.onerror = () => {
        reject(request.error);
      };
    });
  }

  // Clear all data from a store
  async clearStore(storeName) {
    if (!this.db) {
      throw new Error("Database not initialized");
    }

    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction([storeName], "readwrite");
      const store = transaction.objectStore(storeName);

      const request = store.clear();

      request.onsuccess = () => {
        resolve();
      };

      request.onerror = () => {
        reject(request.error);
      };
    });
  }
}

// Create singleton instance
const offlineDataManager = new OfflineDataManager();

export default offlineDataManager;
