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
  Divider,
  useTheme,
} from "@mui/material";
import {
  Dashboard,
  Menu as MenuIcon,
  Close as CloseIcon,
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
      label: "Travel History",
    },
    // Add more menu items here
  ];

  const isActiveRoute = (path) => location.pathname === path;
  const drawerWidth = isMobile ? 280 : isCollapsed ? 72 : 240;

  return (
    <Paper
      component="aside"
      elevation={3}
      sx={{
        width: drawerWidth,
        height: "100vh",
        transition: theme.transitions.create("width", {
          easing: theme.transitions.easing.sharp,
          duration: theme.transitions.duration.standard,
        }),
        bgcolor: "#ffffff",
        borderRight: `1px solid ${theme.palette.divider}`,
        overflow: "hidden",
        position: "relative",
      }}
    >
      {/* Header */}
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: isCollapsed && !isMobile ? "center" : "space-between",
          p: 2,
        }}
      >
        {!isCollapsed || isMobile ? (
          <Typography
            variant="h6"
            sx={{
              fontWeight: 700,
              textTransform: "uppercase",
              fontSize: 16,
              fontFamily: "'Poppins', sans-serif",
              color: theme.palette.text.primary,
            }}
          >
            ABIS CRM
          </Typography>
        ) : (
          <Box sx={{ width: 24, height: 24 }} />
        )}

        {isMobile && close ? (
          <IconButton onClick={close}>
            <CloseIcon />
          </IconButton>
        ) : (
          !isMobile && (
            <IconButton onClick={toggleCollapse}>
              <MenuIcon />
            </IconButton>
          )
        )}
      </Box>

      <Divider />

      {/* Navigation */}
      <List sx={{ py: 2 }}>
        {menuItems.map((item) => {
          const isActive = isActiveRoute(item.path);
          return (
            <ListItem key={item.path} disablePadding>
              <ListItemButton
                component={Link}
                to={item.path}
                onClick={close}
                selected={isActive}
                sx={{
                  py: 1.5,
                  px: isCollapsed && !isMobile ? 1 : 2.5,
                  borderRadius: 2,
                  mx: 1,
                  mb: 1,
                  justifyContent:
                    isCollapsed && !isMobile ? "center" : "flex-start",
                  bgcolor: isActive ? "rgba(0, 123, 255, 0.1)" : "transparent",
                  "&.Mui-selected": {
                    bgcolor: "rgba(0, 123, 255, 0.1)",
                    "&:hover": {
                      bgcolor: "rgba(0, 123, 255, 0.15)",
                    },
                  },
                  "&:hover": {
                    bgcolor: "rgba(0, 0, 0, 0.03)",
                  },
                }}
              >
                <ListItemIcon
                  sx={{
                    minWidth: 0,
                    mr: !isCollapsed || isMobile ? 2 : 0,
                    color: theme.palette.primary.main,
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
                      color: theme.palette.text.primary,
                    }}
                  />
                )}
              </ListItemButton>
            </ListItem>
          );
        })}
      </List>
    </Paper>
  );
}
