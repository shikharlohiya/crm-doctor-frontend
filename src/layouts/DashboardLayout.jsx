import { useState, useEffect } from "react";
import { Outlet } from "react-router-dom";
import { Box, Drawer, useMediaQuery, useTheme } from "@mui/material";
import DashboardSidebar from "../components/DashboardSidebar";
import DashboardTopbar from "../components/DashboardTopbar";

export default function DashboardLayout() {
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const theme = useTheme();
  const isLargeScreen = useMediaQuery(theme.breakpoints.up("lg"));

  useEffect(() => {
    document.body.style.overflow = isMobileSidebarOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [isMobileSidebarOpen]);

  const closeMobileSidebar = () => setIsMobileSidebarOpen(false);
  const openMobileSidebar = () => setIsMobileSidebarOpen(true);

  return (
    <Box
      sx={{
        minHeight: "100vh",
        bgcolor: "background.default",
        overflow: "hidden",
      }}
    >
      {/* Desktop Layout */}
      {isLargeScreen ? (
        <Box sx={{ display: "flex", height: "100vh" }}>
          {/* Desktop Sidebar */}
          <Box sx={{ flexShrink: 0 }}>
            <DashboardSidebar collapsed={false} />
          </Box>

          {/* Desktop Main Content */}
          <Box
            sx={{
              flexGrow: 1,
              display: "flex",
              flexDirection: "column",
              overflow: "hidden",
            }}
          >
            <DashboardTopbar onMenuClick={openMobileSidebar} />
            <Box
              component="main"
              sx={{
                flexGrow: 1,
                overflow: "auto",
                bgcolor: "grey.50",
              }}
            >
              <Box sx={{ maxWidth: 1200, mx: "auto" }}>
                <Outlet />
              </Box>
            </Box>
          </Box>
        </Box>
      ) : (
        /* Mobile/Tablet Layout */
        <Box
          sx={{ minHeight: "100vh", display: "flex", flexDirection: "column" }}
        >
          {/* Mobile Topbar */}
          <DashboardTopbar onMenuClick={openMobileSidebar} />

          {/* Mobile Main Content */}
          <Box
            component="main"
            sx={{
              flexGrow: 1,
              bgcolor: "grey.50",
              p: { xs: 2, sm: 3 },
              overflow: "auto",
            }}
          >
            <Box sx={{ maxWidth: 768, mx: "auto" }}>
              <Outlet />
            </Box>
          </Box>

          {/* Mobile Sidebar Drawer */}
          <Drawer
            variant="temporary"
            open={isMobileSidebarOpen}
            onClose={closeMobileSidebar}
            ModalProps={{ keepMounted: true }}
            sx={{
              display: { xs: "block", lg: "none" },
              "& .MuiDrawer-paper": {
                boxSizing: "border-box",
                width: { xs: 280, sm: 320 },
              },
            }}
          >
            <DashboardSidebar collapsed={false} close={closeMobileSidebar} />
          </Drawer>
        </Box>
      )}
    </Box>
  );
}
