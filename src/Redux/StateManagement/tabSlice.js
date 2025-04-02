import { createSlice } from "@reduxjs/toolkit";

const tabSlice = createSlice({
  name: "tab",
  initialState: {
    requestApprovalTabValue: "1",
    requestSingleApprovalTabValue: "1",

    transferApprovalTabValue: "1",
    transferSingleApprovalTabValue: "1",
  },
  reducers: {
    setRequestApprovalTabValue: (state, action) => {
      state.requestApprovalTabValue = action.payload;
    },
    setRequestSingleApprovalTabValue: (state, action) => {
      state.requestSingleApprovalTabValue = action.payload;
    },

    setTransferApprovalTabValue: (state, action) => {
      state.transferApprovalTabValue = action.payload;
    },
    setTransferSingleApprovalTabValue: (state, action) => {
      state.transferSingleApprovalTabValue = action.payload;
    },
  },
});

export const {
  setRequestApprovalTabValue,
  setRequestSingleApprovalTabValue,
  setTransferApprovalTabValue,
  setTransferSingleApprovalTabValue,
} = tabSlice.actions;
export default tabSlice.reducer;
