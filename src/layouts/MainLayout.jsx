import { Outlet } from "react-router-dom";

const MainLayout = () => (
  <div className="min-h-screen">
    <main className="p-4">
      <Outlet />
    </main>
  </div>
);

export default MainLayout;
