import {createSlice} from "@reduxjs/toolkit";
import { getHasTransactions } from "../store/actions/posfile.action";
import { getPosfileTotalTransaction } from "../store/actions/reprintOrderTicket";
interface PosfileState {
    hasTransaction: {
        data: any,
        isLoaded: boolean
    },
    posfileTotalTransaction: {
        data:[],
        isLoaded: boolean;
    }
}

const initialState: PosfileState = {
    hasTransaction: {
        data: null,
        isLoaded: false
    },
    posfileTotalTransaction: {
        data:[],
        isLoaded: false
    }
};

const posfileSlice = createSlice({
  name: "posfile",
  initialState,
  reducers: {
    
  },
  extraReducers : (builder) => {
    builder.addCase(getHasTransactions.fulfilled, (state, action) => {
        state.hasTransaction.data = action.payload;
        state.hasTransaction.isLoaded = true;
    })
    .addCase(getPosfileTotalTransaction.fulfilled, (state, action) => {
        state.posfileTotalTransaction.data = action.payload
        state.posfileTotalTransaction.isLoaded = true;
    });
  }
});

export const {
} = posfileSlice.actions;
export default posfileSlice.reducer;
