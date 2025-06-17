import { createSlice } from "@reduxjs/toolkit";
// import { fetchSessionStatus } from "../thunks/sessionThunks";
const initialState = {
  sessionStatus: null,
  locationDetails: null,
  farmDetails: null,
  formStatus: null,
};

const sessionSlice = createSlice({
  name: "session",
  initialState,
  reducers: {
    setSessionStatus(state, action) {
      state.sessionStatus = action.payload;
    },
    setFormStatus(state, action) {
      state.formStatus = action.payload;
    },
    setLocation: (state, action) => {
      state.locationDetails = action.payload;
    },
    setFarm: (state, action) => {
      state.farmDetails = action.payload;
    },
    resetSession: () => initialState,
  },
  // extraReducers: (builder) => {
  //   builder.addCase(fetchSessionStatus.fulfilled, (state, action) => {
  //     state.sessionStatus = action.payload;
  //   });
  // },
});
export const {
  setSessionStatus,
  setLocation,
  setFarm,
  setFormStatus,
  resetSession,
} = sessionSlice.actions;
export default sessionSlice.reducer;
