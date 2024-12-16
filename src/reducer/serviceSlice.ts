import {createSlice} from "@reduxjs/toolkit";
// import { getLastCashFund, getLastTransaction, hasCashfund, hasNoEOD } from "../store/actions/posfile.action";

interface ServiceState {
    resource: string;
}

const initialState: ServiceState = {
  resource: ""
};

const serviceSlice = createSlice({
  name: "cashiering",
  initialState,
  reducers: {
    // resource : (state) => {
        
    // }
  },
  extraReducers: () => {
    // builder
    //     .addCase()




    
    // builder
    //   .addCase(getLastTransaction.fulfilled, (state, action) => {
    //     state.lastTransaction = action.payload;
    //   })
  },
});

export const {
} = serviceSlice.actions;
export default serviceSlice.reducer;
