import {createSlice} from "@reduxjs/toolkit";
import { checkRecall } from "../store/actions/otherTransactionAction";

interface OtherTransactionState {
    checkRecall : {
        data: any;
        isLoaded: boolean 
    };
}

const initialState: OtherTransactionState = {
    checkRecall : {
        data: null,
        isLoaded: false 
    }
};

const otherTransactionSlice = createSlice({
  name: "otherTransaction",
  initialState,
  reducers: {
    
  },
  extraReducers: (builder) => {
    builder
      .addCase(checkRecall.fulfilled, (state, action) => {
        state.checkRecall.data = action.payload;
        state.checkRecall.isLoaded = true;
      })
  },
});

export const {} = otherTransactionSlice.actions;
export default otherTransactionSlice.reducer;
