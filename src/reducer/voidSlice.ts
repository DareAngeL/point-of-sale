import {createSlice} from "@reduxjs/toolkit";
import { getAllPOSVoid } from "../store/actions/posfile.action";

interface VoidState {
  allPOSVoid: {
    data: any;
    isLoaded: boolean;
  };
}
const initialState: VoidState = {
  allPOSVoid: {
    data: {},
    isLoaded: false,
  },
};

const voidSlice = createSlice({
  name: "void",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder.addCase(getAllPOSVoid.fulfilled, (state, action) => {
      console.log("Dadaan ka dapat dito ah");
      state.allPOSVoid.data = action.payload;
      state.allPOSVoid.isLoaded = true;
    });
  },
});

export default voidSlice.reducer;
