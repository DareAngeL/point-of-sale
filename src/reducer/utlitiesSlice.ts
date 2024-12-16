import {createSlice} from "@reduxjs/toolkit";
import { getCorruptedAutoOfSales } from "../store/actions/utilities/automationofsales.action";

interface UtilitiesState {
  data: any;
  corrupted_autoofsales: {
    recid: string;
    docnum: string;
  }[]
}
const initialState: UtilitiesState = {
  data: [],
  corrupted_autoofsales: []
};

const utilitiesSlice = createSlice({
  name: "utlities",
  initialState,
  reducers: {
    setCorruptedAutoOfSales: (state, action) => {
      state.corrupted_autoofsales = action.payload;
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(getCorruptedAutoOfSales.fulfilled, (state, action) => {
        state.corrupted_autoofsales = action.payload;
      })
  },
});

export const { setCorruptedAutoOfSales } = utilitiesSlice.actions;

export default utilitiesSlice.reducer;
