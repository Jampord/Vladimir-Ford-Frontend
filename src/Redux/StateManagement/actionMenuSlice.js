import { createSlice } from "@reduxjs/toolkit";

export const actionMenuSlice = createSlice({
  name: "actionMenu",
  initialState: {
    actionData: null,
  },

  reducers: {
    getData: (state, action) => {
      state.actionData = action.payload;
    },
    resetGetData: (state) => {
      state.actionData = null;
    },
  },
});

export const { getData, resetGetData } = actionMenuSlice.actions;
export default actionMenuSlice.reducer;
