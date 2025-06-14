import React from "react";
import { useNavigate } from "react-router-dom";
import { Box, Typography, Button, Paper } from "@mui/material";
import LocationOnIcon from "@mui/icons-material/LocationOn";

const CheckIn = () => {
  const navigate = useNavigate();

  const handleSelectLocation = () => {
    navigate("/dashboard/location-selector");
  };

  return (
    <Box sx={{ display: "flex", justifyContent: "center", px: 2 }}>
      <Box sx={{ textAlign: "center" }}>
        <Paper
          elevation={8}
          sx={{
            p: 4,
            maxWidth: "md",
            mx: "auto",
            borderRadius: 4,
          }}
        >
          <Box sx={{ mb: 3 }}>
            <Typography
              variant="h4"
              component="h1"
              fontWeight="bold"
              color="text.primary"
              gutterBottom
            >
              Welcome!
            </Typography>
            <Typography color="text.secondary">
              Please select your location.
            </Typography>
          </Box>

          <Button
            onClick={handleSelectLocation}
            fullWidth
            variant="contained"
            size="large"
            startIcon={<LocationOnIcon />}
            sx={{
              py: 1.5,
              px: 3,
              borderRadius: 3,
              fontSize: "1.1rem",
              fontWeight: 600,
              background: "linear-gradient(to right, #4caf50, #2e7d32)",
              "&:hover": {
                background: "linear-gradient(to right, #43a047, #1b5e20)",
                transform: "scale(1.03)",
                boxShadow: (theme) => theme.shadows[8],
              },
              transition: "all 0.3s",
            }}
          >
            Select Location
          </Button>
        </Paper>
      </Box>
    </Box>
  );
};

export default CheckIn;
