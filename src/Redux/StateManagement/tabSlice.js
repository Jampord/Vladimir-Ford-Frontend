import { createSlice } from "@reduxjs/toolkit";

const tabSlice = createSlice({
  name: "tab",
  initialState: {
    requestApprovalTabValue: "1",
    requestSingleApprovalTabValue: "1",

    transferApprovalTabValue: "2",
    transferSingleApprovalTabValue: "1",

    releasingOfAssetTabValue: "1",

    requisitionTabValue: "1",

    depreciationPageTabValue: "1",

    requestMonitoringTabValue: "1",
    warehouseMonitoringTabValue: "1",

    evaluationTabValue: "1",
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
    setReleasingOfAssetTabValue: (state, action) => {
      state.releasingOfAssetTabValue = action.payload;
    },
    setRequisitionTabValue: (state, action) => {
      state.requisitionTabValue = action.payload;
    },
    setDepreciationPageTabValue: (state, action) => {
      state.depreciationPageTabValue = action.payload;
    },
    setRequestMonitoringTabValue: (state, action) => {
      state.requestMonitoringTabValue = action.payload;
    },
    setWarehouseMonitoringTabValue: (state, action) => {
      state.warehouseMonitoringTabValue = action.payload;
    },
    setEvaluationTabValue: (state, action) => {
      state.evaluationTabValue = action.payload;
    },
  },
});

export const {
  setRequestApprovalTabValue,
  setRequestSingleApprovalTabValue,
  setTransferApprovalTabValue,
  setTransferSingleApprovalTabValue,
  setReleasingOfAssetTabValue,
  setRequisitionTabValue,
  setDepreciationPageTabValue,
  setRequestMonitoringTabValue,
  setWarehouseMonitoringTabValue,
  setEvaluationTabValue,
} = tabSlice.actions;
export default tabSlice.reducer;
