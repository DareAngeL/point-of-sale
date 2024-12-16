import {createSlice} from "@reduxjs/toolkit";
import { Clients } from "../models/clients";

interface PosNetworkState {
    networkModal: boolean,
    posNetworkDetails: Clients | undefined
}

const initialState: PosNetworkState = {
    networkModal: false,
    posNetworkDetails: undefined
};

const posNetworkSlice = createSlice({
  name: "pos network",
  initialState,
  reducers: {
    setNetworkModal: (state, action) => {
      state.networkModal = action.payload;
    },
    setPosNetworkDetails: (state, action) => {
        state.posNetworkDetails = action.payload
    }
  },
});

export const {
    setNetworkModal,
    setPosNetworkDetails
} = posNetworkSlice.actions;
export default posNetworkSlice.reducer;
