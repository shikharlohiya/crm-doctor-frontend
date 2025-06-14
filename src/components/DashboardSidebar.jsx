import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import {
  Box,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Typography,
  IconButton,
  Paper,
  useTheme,
} from "@mui/material";
import {
  Home,
  Menu as MenuIcon,
  Close as CloseIcon,
  Analytics,
  Dashboard,
} from "@mui/icons-material";

export default function DashboardSidebar({ collapsed = false, close }) {
  const [isCollapsed, setIsCollapsed] = useState(collapsed);
  const [isMobile, setIsMobile] = useState(false);
  const location = useLocation();
  const theme = useTheme();

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 1024);
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const toggleCollapse = () => setIsCollapsed(!isCollapsed);

  const menuItems = [
    {
      path: "/dashboard",
      icon: <Dashboard />,
      label: "Dashboard",
    },
    {
      path: "/analytics",
      icon: <Analytics />,
      label: "Analytics",
    },
  ];

  const isActiveRoute = (path) => location.pathname === path;
  const drawerWidth = isMobile ? 280 : isCollapsed ? 80 : 256;

  return (
    <Paper
      component="aside"
      elevation={6}
      square
      sx={{
        width: drawerWidth,
        flexShrink: 0,
        height: "100%",
        zIndex: 10,
        transition: theme.transitions.create("width", {
          easing: theme.transitions.easing.sharp,
          duration: theme.transitions.duration.enteringScreen,
        }),
        background: theme.palette.error.main,
        backgroundImage: `linear-gradient(to bottom, ${theme.palette.error.light}, ${theme.palette.error.main}, ${theme.palette.error.dark})`,
        overflow: "hidden",
      }}
    >
      <Box sx={{ height: "100%", display: "flex", flexDirection: "column" }}>
        {/* Header */}
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            p: 2,
            borderBottom: `1px solid ${theme.palette.error.dark}`,
          }}
        >
          {(!isCollapsed || isMobile) && (
            <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
              <Paper
                elevation={0}
                sx={{
                  width: 56,
                  height: 48,
                  bgcolor: "rgba(255, 255, 255, 0.1)",
                  borderRadius: 2,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              />
              <Typography
                variant="h6"
                sx={{
                  fontWeight: 700,
                  letterSpacing: 1,
                  textTransform: "uppercase",
                  fontFamily: "'Poppins', sans-serif",
                  color: theme.palette.common.white,
                }}
              >
                ABIS DOCTOR-CRM
              </Typography>
            </Box>
          )}

          {isMobile && close ? (
            <IconButton
              onClick={close}
              aria-label="Close sidebar"
              color="inherit"
              size="small"
              sx={{ color: theme.palette.common.white }}
            >
              <CloseIcon />
            </IconButton>
          ) : (
            !isMobile && (
              <IconButton
                onClick={toggleCollapse}
                aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
                color="inherit"
                size="small"
                sx={{ color: theme.palette.common.white }}
              >
                <MenuIcon />
              </IconButton>
            )
          )}
        </Box>

        {/* Navigation */}
        <List sx={{ flexGrow: 1, px: 2, py: 3 }}>
          {menuItems.map((item) => {
            const isActive = isActiveRoute(item.path);

            return (
              <ListItem key={item.path} disablePadding sx={{ mb: 1 }}>
                <ListItemButton
                  component={Link}
                  to={item.path}
                  onClick={close}
                  selected={isActive}
                  sx={{
                    px: 2,
                    py: 1.5,
                    borderRadius: 3,
                    justifyContent:
                      isCollapsed && !isMobile ? "center" : "flex-start",
                    bgcolor: isActive ? "rgba(0, 0, 0, 0.2)" : "transparent",
                    "&.Mui-selected": {
                      bgcolor: "rgba(0, 0, 0, 0.2)",
                      "&:hover": {
                        bgcolor: "rgba(0, 0, 0, 0.3)",
                      },
                    },
                    "&:hover": {
                      bgcolor: "rgba(0, 0, 0, 0.1)",
                    },
                    position: "relative",
                  }}
                >
                  <ListItemIcon
                    sx={{
                      minWidth: 0,
                      mr: !isCollapsed || isMobile ? 2 : 0,
                      color: theme.palette.common.white,
                    }}
                  >
                    {item.icon}
                  </ListItemIcon>

                  {(!isCollapsed || isMobile) && (
                    <ListItemText
                      primary={item.label}
                      primaryTypographyProps={{
                        fontSize: 14,
                        fontWeight: 500,
                        color: theme.palette.common.white,
                      }}
                    />
                  )}

                  {isActive && (
                    <Box
                      sx={{
                        position: "absolute",
                        right: 0,
                        top: "50%",
                        transform: "translateY(-50%)",
                        width: 4,
                        height: 32,
                        bgcolor: theme.palette.common.white,
                        borderTopLeftRadius: 4,
                        borderBottomLeftRadius: 4,
                      }}
                    />
                  )}
                </ListItemButton>
              </ListItem>
            );
          })}
        </List>
      </Box>
    </Paper>
  );
}
