import {createSlice} from "@reduxjs/toolkit";

const initialState = {
  isPrinting: false,
};

const printoutSlice = createSlice({
  name: "printout",
  initialState,
  reducers: {
    setPrinting: (state, action) => {
      state.isPrinting = action.payload;
    },
  },
});

export const {setPrinting} = printoutSlice.actions;
export default printoutSlice.reducer;
