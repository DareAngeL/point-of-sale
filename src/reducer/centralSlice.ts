import {createSlice} from "@reduxjs/toolkit";
import { WarehouseModel } from "../models/warehouse";

interface CentralState {
    warehouses: WarehouseModel[]
}

const initialState: CentralState = {
    warehouses: []
};

const centralSlice = createSlice({
  name: "central",
  initialState,
  reducers: {
    setWarehouse: (state, action) => {
        state.warehouses = action.payload
    },
  },
});

export const {
  setWarehouse
} = centralSlice.actions;
export default centralSlice.reducer;
