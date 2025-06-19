// import { useEffect, useState } from "react";
// import { useNavigate } from "react-router-dom";
// import { useDispatch, useSelector } from "react-redux";
// import { setUser } from "../redux/slices/userSlice";
// import axiosInstance from "../library/axios";
// import {
//   Box,
//   Button,
//   TextField,
//   Typography,
//   Paper,
//   Container,
//   Alert,
//   CircularProgress,
// } from "@mui/material";
// import InstallPrompt from "../components/PWAInstallToast";

// const Login = () => {
//   const dispatch = useDispatch();
//   const { user } = useSelector((state) => state.user);
//   const navigate = useNavigate();

//   const [EmployeeId, setUsername] = useState("");
//   const [EmployeePassword, setPassword] = useState("");
//   const [error, setError] = useState("");
//   const [loading, setLoading] = useState(false);

//   useEffect(() => {
//     if (user) {
//       navigate("/dashboard");
//     }
//   }, [user, navigate]);

//   // Check-in API call
//   const fetchSessionStatus = async () => {
//     try {
//       const response = await axiosInstance.get(
//         `/doctor/employee/${EmployeeId}/status`
//       );
//       const result = response?.data;
//       if (result.success) {
//         // dispatch(setSessionStatus("checked_in"));
//         console.log(result.data);
//       } else {
//         throw new Error(result.message || "Check-in failed");
//       }
//     } catch (err) {
//       console.error("failed to get status:", err);
//     }
//   };

//   const handleLogin = async (e) => {
//     e.preventDefault();
//     setLoading(true);
//     setError("");

//     try {
//       const status = fetchSessionStatus();
//       console.log(status);
//       // API integration ready - uncomment when backend is ready
//       const response = await axiosInstance.post("/login", {
//         EmployeeId,
//         EmployeePassword,
//       });
//       dispatch(setUser(response.data.employee));
//     } catch (err) {
//       setError(err.response?.data?.message || "Login failed");
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <Container component="main" maxWidth="xs">
//       <Paper
//         elevation={3}
//         sx={{
//           mt: 8,
//           p: 4,
//           display: "flex",
//           flexDirection: "column",
//           alignItems: "center",
//         }}
//       >
//         <Box
//           sx={{
//             color: "white",
//             p: 2,
//             borderRadius: "50%",
//             mb: 2,
//           }}
//         >
//           <img className="w-28 h-28" src="/pwa-192x192.png" alt="Logo" />
//         </Box>
//         <Typography component="h1" variant="h5" sx={{ mb: 3 }}>
//           ABIS Doctor-CRM
//         </Typography>

//         <Box component="form" onSubmit={handleLogin} sx={{ width: "100%" }}>
//           {error && (
//             <Alert severity="error" sx={{ mb: 2 }}>
//               {error}
//             </Alert>
//           )}

//           <TextField
//             margin="normal"
//             required
//             fullWidth
//             id="username"
//             label="Username"
//             name="username"
//             autoComplete="username"
//             autoFocus
//             value={EmployeeId}
//             onChange={(e) => setUsername(e.target.value)}
//           />

//           <TextField
//             margin="normal"
//             required
//             fullWidth
//             name="password"
//             label="Password"
//             type="password"
//             id="password"
//             autoComplete="current-password"
//             value={EmployeePassword}
//             onChange={(e) => setPassword(e.target.value)}
//           />

//           <Button
//             type="submit"
//             fullWidth
//             variant="contained"
//             sx={{ mt: 3, mb: 2 }}
//             disabled={loading}
//           >
//             {loading ? <CircularProgress size={24} /> : "Login"}
//           </Button>
//         </Box>
//       </Paper>
//       <InstallPrompt />
//     </Container>
//   );
// };

// export default Login;

import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { setUser } from "../redux/slices/userSlice";
import { setSessionStatus } from "../redux/slices/sessionSlice";
import axiosInstance from "../library/axios";
import {
  Box,
  Button,
  TextField,
  Typography,
  Paper,
  Container,
  Alert,
  CircularProgress,
} from "@mui/material";
import InstallPrompt from "../components/PWAInstallToast";

const Login = () => {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.user);
  const navigate = useNavigate();

  const [EmployeeId, setUsername] = useState("");
  const [EmployeePassword, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) {
      navigate("/dashboard");
    }
  }, [user, navigate]);

  // Fetch session status API call
  const fetchSessionStatus = async (employeeId) => {
    try {
      const response = await axiosInstance.get(
        `/doctor/employee/${employeeId}/status`
      );
      const result = response?.data;
      if (result.success) {
        // Set the session status in Redux store
        dispatch(setSessionStatus(result.status));
        console.log("Session status:", result.status);
        console.log("Session data:", result.data);
        return result;
      } else {
        throw new Error(result.message || "Failed to fetch session status");
      }
    } catch (err) {
      console.error("Failed to get session status:", err);
      // Don't throw error here as it's not critical for login
      return null;
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      // First, perform login
      const response = await axiosInstance.post("/login", {
        EmployeeId,
        EmployeePassword,
      });

      // Set user in Redux store
      dispatch(setUser(response.data.employee));
      console.log(response.data);
      localStorage.setItem("EmployeeId", response.data.employee.EmployeeId);

      // After successful login, fetch session status
      await fetchSessionStatus(EmployeeId);
    } catch (err) {
      setError(err.response?.data?.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container component="main" maxWidth="xs">
      <Paper
        elevation={3}
        sx={{
          mt: 8,
          p: 4,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
        }}
      >
        <Box
          sx={{
            color: "white",
            p: 2,
            borderRadius: "50%",
            mb: 2,
          }}
        >
          <img className="w-28 h-28" src="/pwa-192x192.png" alt="Logo" />
        </Box>
        <Typography component="h1" variant="h5" sx={{ mb: 3 }}>
          ABIS Doctor-CRM
        </Typography>

        <Box component="form" onSubmit={handleLogin} sx={{ width: "100%" }}>
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          <TextField
            margin="normal"
            required
            fullWidth
            id="username"
            label="Username"
            name="username"
            autoComplete="username"
            autoFocus
            value={EmployeeId}
            onChange={(e) => setUsername(e.target.value)}
          />

          <TextField
            margin="normal"
            required
            fullWidth
            name="password"
            label="Password"
            type="password"
            id="password"
            autoComplete="current-password"
            value={EmployeePassword}
            onChange={(e) => setPassword(e.target.value)}
          />

          <Button
            type="submit"
            fullWidth
            variant="contained"
            sx={{ mt: 3, mb: 2 }}
            disabled={loading}
          >
            {loading ? <CircularProgress size={24} /> : "Login"}
          </Button>
        </Box>
      </Paper>
      <InstallPrompt />
    </Container>
  );
};

export default Login;
