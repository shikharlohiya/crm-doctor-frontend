import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  session: null,
};

const sessionSlice = createSlice({
  name: "session",
  initialState,
  reducers: {
    setSession(state, action) {
      state.session = action.payload;
    },
    updateSessionField(state, action) {
      if (!state.session) state.session = {};
      const { field, value } = action.payload;
      state.session[field] = value;
    },
    clearSession(state) {
      state.session = null;
    },
  },
});
export const { setSession, updateSessionField, clearSession } =
  sessionSlice.actions;
export default sessionSlice.reducer;
