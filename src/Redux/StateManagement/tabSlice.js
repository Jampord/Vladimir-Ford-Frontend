import { createSlice } from "@reduxjs/toolkit";

const tabSlice = createSlice({
  name: "tab",
  initialState: {
    requestApprovalTabValue: "1",
    requestSingleApprovalTabValue: "1",
  },
  reducers: {
    setRequestApprovalTabValue: (state, action) => {
      state.requestApprovalTabValue = action.payload;
    },
    setRequestSingleApprovalTabValue: (state, action) => {
      state.requestSingleApprovalTabValue = action.payload;
    },
  },
});

export const { setRequestApprovalTabValue, setRequestSingleApprovalTabValue } = tabSlice.actions;
export default tabSlice.reducer;
