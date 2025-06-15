import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import axiosInstance from "../../library/axios";

import CheckIn from "./CheckIn";
import TravelHistory from "./TravelHistory";
import { setSessionStatus } from "../../redux/slices/sessionSlice";

const Dashboard = () => {
  const dispatch = useDispatch();
  const [loading, setLoading] = useState(true);
  const user = useSelector((state) => state.user.user);
  const EmployeeId = user.EmployeeId;

  const isCheckedIn = useSelector((state) => state.session.sessionStatus);

  useEffect(() => {
    const fetchSession = async () => {
      try {
        const response = await axiosInstance.get(
          `/doctor/employee/${EmployeeId}/status`
        );
        console.log(response.data);

        const { status } = response.data;

        if (status) dispatch(setSessionStatus(status));
      } catch (error) {
        console.error("Failed to fetch session details:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchSession();
  }, [dispatch]);

  if (loading) {
    return <div className="text-center py-10">Loading session...</div>;
  }

  return (
    <div className="p-4">
      {isCheckedIn === "not_checked_in" ? <CheckIn /> : <TravelHistory />}
    </div>
  );
};

export default Dashboard;
