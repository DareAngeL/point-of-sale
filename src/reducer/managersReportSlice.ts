import {createSlice} from "@reduxjs/toolkit";
interface ManagersReportState {
    width: number;
    height: number;
}

const initialState: ManagersReportState = {
  width:210,
  height: 297
};

const managersReportSlice = createSlice({
  name: "managersReport",
  initialState,
  reducers: {
    setWidth: (state, action) => {
        state.width = action.payload;
    },
    setHeight: (state, action) => {
        state.height = action.payload
    }
  }
});

export const {setWidth, setHeight} = managersReportSlice.actions;
export default managersReportSlice.reducer;
