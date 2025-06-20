// services/formSubmissionService.js
import offlineDataManager from "../utils/indexedDB";
import {
  DataSchemas,
  NetworkUtils,
  SyncUtils,
  StorageUtils,
} from "../utils/dataSchemas";
import axiosInstance from "../library/axios";
import toast from "react-hot-toast";

export class OfflineFormSubmissionService {
  constructor() {
    this.isInitialized = false;
    this.syncInProgress = false;
  }

  async init() {
    if (!this.isInitialized) {
      await offlineDataManager.init();
      this.isInitialized = true;
      console.log("OfflineFormSubmissionService initialized");
    }
  }

  // Main method to handle form submission (online/offline)
  async submitForm(formData, images = {}) {
    await this.init();

    const { isOnline, isSlowNetwork } = await NetworkUtils.checkConnectivity();

    console.log("Form submission - Network status:", {
      isOnline,
      isSlowNetwork,
    });

    if (isOnline && !isSlowNetwork) {
      // Fast network - try direct submission
      try {
        const result = await this.submitFormOnline(formData, images);
        console.log("Direct form submission successful:", result);
        return {
          success: true,
          type: "online",
          data: result,
          message: "Form submitted successfully",
        };
      } catch (error) {
        console.error(
          "Direct form submission failed, falling back to offline:",
          error
        );
        // Fall back to offline storage
        return await this.submitFormOffline(formData, images);
      }
    } else {
      // Slow network or offline - store locally
      console.log("Using offline form submission due to network conditions");
      return await this.submitFormOffline(formData, images);
    }
  }

  // Online form submission
  async submitFormOnline(formData, images) {
    try {
      // Step 1: Submit form data
      const formResult = await this.submitFormDataAPI(formData);

      if (!formResult.success) {
        throw new Error(formResult.message);
      }

      const formDetailId = formResult.data.formDetailId;

      // Step 2: Upload images if any
      const imagesToUpload = Object.entries(images).map(
        ([subcategoryId, imageData]) => {
          const subcategory = formData.supportData?.find(
            (item) => item.id === parseInt(subcategoryId)
          );
          return {
            file: imageData.file,
            categoryId: subcategory?.category?.id,
            subCategoryId: parseInt(subcategoryId),
          };
        }
      );

      if (imagesToUpload.length > 0) {
        // Upload images in background
        this.uploadImagesInBackground(
          formDetailId,
          imagesToUpload,
          formData.EmployeeId
        );
      } else {
        // Complete submission immediately if no images
        await this.completeSubmissionAPI(formDetailId, formData.EmployeeId);
      }

      return formResult;
    } catch (error) {
      console.error("Online form submission failed:", error);
      throw error;
    }
  }

  // Offline form submission
  async submitFormOffline(formData, images) {
    try {
      // Store form data offline
      const offlineFormData = {
        employeeId: formData.EmployeeId,
        locationId: formData.LocationId,
        farmId: formData.FarmId,
        remark: formData.remark,
        categoryDetails: formData.categoryDetails,
        checklistItems: formData.checklistItems,
        syncStatus: "pending",
        retryCount: 0,
        lastError: null,
        serverFormDetailId: null,
      };

      const formSubmissionId = await offlineDataManager.addData(
        "formSubmissions",
        offlineFormData
      );

      // Store images offline if any
      if (Object.keys(images).length > 0) {
        await this.storeImagesOffline(
          formSubmissionId,
          images,
          formData.supportData
        );
      }

      // Add to sync queue
      const syncItem = SyncUtils.createSyncQueueItem(
        "form",
        formSubmissionId,
        1
      ); // High priority
      await offlineDataManager.addData("syncQueue", syncItem);

      console.log("Offline form submission stored:", formSubmissionId);

      return {
        success: true,
        type: "offline",
        data: {
          id: formSubmissionId,
          localId: formSubmissionId,
          message: "Form saved locally. Will sync when online.",
        },
        message: "Form saved locally. Will sync when connection improves.",
      };
    } catch (error) {
      console.error("Offline form submission failed:", error);
      throw new Error("Failed to save form data locally: " + error.message);
    }
  }

  // Store images offline
  async storeImagesOffline(formSubmissionId, images, supportData) {
    try {
      for (const [subcategoryId, imageData] of Object.entries(images)) {
        const subcategory = supportData?.find(
          (item) => item.id === parseInt(subcategoryId)
        );

        if (subcategory && imageData.file) {
          // Convert image to base64 for storage
          const base64Data = await StorageUtils.convertFileToBase64(
            imageData.file
          );

          const offlineImageData = {
            formSubmissionId: formSubmissionId,
            serverFormDetailId: null,
            categoryId: subcategory.category?.id,
            subCategoryId: parseInt(subcategoryId),
            fileName: imageData.file.name,
            fileData: base64Data,
            fileType: imageData.file.type,
            fileSize: imageData.file.size,
            syncStatus: "pending",
            retryCount: 0,
            lastError: null,
          };

          await offlineDataManager.addData("images", offlineImageData);
        }
      }
    } catch (error) {
      console.error("Failed to store images offline:", error);
      throw error;
    }
  }

  // Upload images in background (for online submissions)
  async uploadImagesInBackground(formDetailId, imagesToUpload, employeeId) {
    try {
      let completedCount = 0;
      let failedCount = 0;

      // Upload images one by one
      for (let i = 0; i < imagesToUpload.length; i++) {
        const image = imagesToUpload[i];

        try {
          await this.uploadImageAPI(
            formDetailId,
            image.categoryId,
            image.subCategoryId,
            image.file
          );
          completedCount++;
          console.log(
            `Background upload: Image ${i + 1} uploaded successfully`
          );
        } catch (error) {
          console.error(
            `Background upload: Failed to upload image ${i + 1}:`,
            error
          );
          failedCount++;
        }
      }

      // Complete submission if any images were uploaded successfully
      if (completedCount > 0) {
        try {
          await this.completeSubmissionAPI(formDetailId, employeeId);
          console.log("Background upload: Form submission completed");
        } catch (error) {
          console.error(
            "Background upload: Failed to complete submission:",
            error
          );
        }
      }

      if (completedCount > 0) {
        toast.success(`${completedCount} images uploaded successfully`);
      }
      if (failedCount > 0) {
        toast.warn(`${failedCount} images failed to upload`);
      }
    } catch (error) {
      console.error("Background image upload failed:", error);
      toast.error("Background upload failed");
    }
  }

  // API Methods
  async submitFormDataAPI(formData) {
    const response = await axiosInstance.post(
      "/doctor/submit-form-data",
      formData,
      {
        headers: { "Content-Type": "application/json" },
      }
    );

    if (response.data?.success) {
      return response.data;
    } else {
      throw new Error(response.data?.message || "Form data submission failed");
    }
  }

  async uploadImageAPI(formDetailId, categoryId, subCategoryId, imageFile) {
    const formData = new FormData();
    formData.append("image", imageFile);
    formData.append("formDetailId", formDetailId);
    formData.append("categoryId", categoryId);
    formData.append("subCategoryId", subCategoryId);

    const response = await axiosInstance.post(
      "/doctor/upload-form-image",
      formData,
      {
        headers: { "Content-Type": "multipart/form-data" },
      }
    );

    if (response.data?.success) {
      return response.data;
    } else {
      throw new Error(response.data?.message || "Image upload failed");
    }
  }

  async completeSubmissionAPI(formDetailId, employeeId) {
    const response = await axiosInstance.post(
      "/doctor/complete-form-submission",
      {
        formDetailId,
        employeeId,
      },
      {
        headers: { "Content-Type": "application/json" },
      }
    );

    if (response.data?.success) {
      return response.data;
    } else {
      throw new Error(response.data?.message || "Form completion failed");
    }
  }

  // Sync pending forms
  async syncPendingForms() {
    await this.init();

    if (this.syncInProgress) {
      console.log("Form sync already in progress");
      return;
    }

    const { isOnline } = await NetworkUtils.checkConnectivity();
    if (!isOnline) {
      console.log("Cannot sync forms - offline");
      return;
    }

    this.syncInProgress = true;
    console.log("Starting form sync process...");

    try {
      // Get all pending form submissions
      const pendingForms = await offlineDataManager.getDataByIndex(
        "formSubmissions",
        "syncStatus",
        "pending"
      );

      console.log(`Found ${pendingForms.length} pending forms to sync`);

      for (const form of pendingForms) {
        if (!SyncUtils.shouldRetry(form.retryCount)) {
          console.log(`Form ${form.id} exceeded max retries`);
          continue;
        }

        try {
          // Mark as syncing
          const syncingForm = SyncUtils.markAsSyncing(form);
          await offlineDataManager.updateData("formSubmissions", syncingForm);

          // Prepare form data for API
          const formDataForAPI = {
            EmployeeId: form.employeeId,
            LocationId: form.locationId,
            FarmId: form.farmId,
            remark: form.remark,
            categoryDetails: form.categoryDetails,
            checklistItems: form.checklistItems,
          };

          // Submit form data
          const apiResult = await this.submitFormDataAPI(formDataForAPI);
          const serverFormDetailId = apiResult.data?.formDetailId;

          // Get associated images
          const formImages = await offlineDataManager.getDataByIndex(
            "images",
            "formSubmissionId",
            form.id
          );

          // Upload images if any
          if (formImages.length > 0) {
            await this.syncFormImages(serverFormDetailId, formImages);
          }

          // Complete submission
          await this.completeSubmissionAPI(serverFormDetailId, form.employeeId);

          // Mark as synced
          const syncedForm = SyncUtils.markAsSynced(form, {
            serverFormDetailId: serverFormDetailId,
          });
          await offlineDataManager.updateData("formSubmissions", syncedForm);

          console.log(`Form ${form.id} synced successfully`);

          // Update sync queue
          await this.updateSyncQueueStatus(form.id, "form", "completed");

          // Schedule cleanup
          setTimeout(() => {
            this.cleanupSyncedForm(form.id);
          }, 24 * 60 * 60 * 1000); // Clean up after 24 hours
        } catch (error) {
          console.error(`Failed to sync form ${form.id}:`, error);

          // Mark as failed
          const failedForm = SyncUtils.markAsFailed(form, error);
          await offlineDataManager.updateData("formSubmissions", failedForm);

          // Update sync queue
          await this.updateSyncQueueStatus(form.id, "form", "failed");
        }
      }
    } catch (error) {
      console.error("Form sync process failed:", error);
    } finally {
      this.syncInProgress = false;
      console.log("Form sync process completed");
    }
  }

  // Sync form images
  async syncFormImages(serverFormDetailId, formImages) {
    for (const imageData of formImages) {
      try {
        // Convert base64 back to file
        const file = await StorageUtils.convertBase64ToFile(
          imageData.fileData,
          imageData.fileName,
          imageData.fileType
        );

        // Upload image
        await this.uploadImageAPI(
          serverFormDetailId,
          imageData.categoryId,
          imageData.subCategoryId,
          file
        );

        // Mark image as synced
        const syncedImage = SyncUtils.markAsSynced(imageData, {
          serverFormDetailId: serverFormDetailId,
        });
        await offlineDataManager.updateData("images", syncedImage);

        console.log(`Image ${imageData.id} synced successfully`);
      } catch (error) {
        console.error(`Failed to sync image ${imageData.id}:`, error);

        // Mark image as failed
        const failedImage = SyncUtils.markAsFailed(imageData, error);
        await offlineDataManager.updateData("images", failedImage);
      }
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

  async cleanupSyncedForm(formId) {
    try {
      const form = await offlineDataManager.getData("formSubmissions", formId);
      if (form && form.syncStatus === "synced") {
        console.log(`Cleaning up synced form ${formId}`);

        // Delete form
        await offlineDataManager.deleteData("formSubmissions", formId);

        // Delete associated images
        const formImages = await offlineDataManager.getDataByIndex(
          "images",
          "formSubmissionId",
          formId
        );

        for (const image of formImages) {
          if (image.syncStatus === "synced") {
            await offlineDataManager.deleteData("images", image.id);
          }
        }

        // Clean up sync queue items
        const queueItems = await offlineDataManager.getDataByIndex(
          "syncQueue",
          "type",
          "form"
        );
        for (const item of queueItems) {
          if (item.dataId === formId) {
            await offlineDataManager.deleteData("syncQueue", item.id);
          }
        }
      }
    } catch (error) {
      console.error(`Failed to cleanup form ${formId}:`, error);
    }
  }

  async getPendingSyncCount() {
    await this.init();

    const [pendingForms, pendingImages] = await Promise.all([
      offlineDataManager.getDataByIndex(
        "formSubmissions",
        "syncStatus",
        "pending"
      ),
      offlineDataManager.getDataByIndex("images", "syncStatus", "pending"),
    ]);

    return {
      forms: pendingForms.length,
      images: pendingImages.length,
      total: pendingForms.length + pendingImages.length,
    };
  }

  async forceSyncAll() {
    console.log("Force syncing all pending forms...");
    await this.syncPendingForms();
  }
}

// Create singleton instance
const offlineFormService = new OfflineFormSubmissionService();
export default offlineFormService;
