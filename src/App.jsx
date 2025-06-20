import { Routes, Route } from "react-router-dom";
import MainLayout from "./layouts/MainLayout";
import DashboardLayout from "./layouts/DashboardLayout";
import Login from "./pages/Login";
import NotFound from "./pages/NotFound";

import Dashboard from "./pages/Dashboard/Dashboard";
import AnalyticsDashboard from "./pages/Analytics/AnalyticsDashboard";
import Report from "./pages/Analytics/Report";
import ProtectedRoute from "./utils/ProtectedRoute";
import LocationSelector from "./pages/Dashboard/LocationSelector";
import CheckInTravel from "./pages/Dashboard/CheckInTravel";
import Form from "./pages/Dashboard/Form";
import { useState, useEffect } from "react";

import offlineSystemManager from "./utils/offlineInit";

const App = () => {
  const [isMobile, setIsMobile] = useState(true);

  useEffect(() => {
    // Initialize offline system when app starts
    const initOfflineSystem = async () => {
      try {
        await offlineSystemManager.initialize();
        console.log("Offline system ready");
      } catch (error) {
        console.error("Failed to initialize offline system:", error);
      }
    };

    initOfflineSystem();

    // Cleanup on unmount
    return () => {
      offlineSystemManager.destroy();
    };
  }, []);

  useEffect(() => {
    const checkScreenSize = () => {
      setIsMobile(window.innerWidth < 768); // md = 768px in Tailwind
    };

    checkScreenSize(); // initial check
    window.addEventListener("resize", checkScreenSize); // update on resize

    return () => window.removeEventListener("resize", checkScreenSize);
  }, []);

  if (!isMobile) {
    return (
      <div className="h-screen flex items-center justify-center bg-red-100 text-center p-4">
        <div className="text-xl font-semibold text-red-700">
          ❌ This application is only supported on mobile devices.
          <br />
          Please open it on your phone.
        </div>
      </div>
    );
  }

  return (
    <div>
      <Routes>
        <Route path="/" element={<MainLayout />}>
          <Route index element={<Login />} />
          <Route path="*" element={<NotFound />} />
        </Route>
        {/* Protected admin routes */}
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <DashboardLayout />
            </ProtectedRoute>
          }
        >
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="analytics" element={<AnalyticsDashboard />} />
          <Route path="report" element={<Report />} />
          <Route path="/dashboard/checkin" element={<CheckInTravel />} />
          <Route
            path="/dashboard/location-selector"
            element={<LocationSelector />}
          />
          <Route path="/dashboard/form" element={<Form />} />
          <Route path="*" element={<NotFound />} />
        </Route>
      </Routes>
    </div>
  );
};

export default App;
