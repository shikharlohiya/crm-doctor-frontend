import { Routes, Route } from "react-router-dom";
import MainLayout from "./layouts/MainLayout";
import DashboardLayout from "./layouts/DashboardLayout";
import Login from "./pages/Login";
import NotFound from "./pages/NotFound";

import Dashboard from "./pages/Dashboard/Dashboard";
import AnalyticsDashboard from "./pages/Analytics/AnalyticsDashboard";
import ProtectedRoute from "./utils/ProtectedRoute";
import LocationSelector from "./pages/Dashboard/LocationSelector";
import CheckInTravel from "./pages/Dashboard/CheckInTravel";
import Form from "./pages/Dashboard/Form";

const App = () => {
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
