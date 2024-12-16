import {createSlice} from "@reduxjs/toolkit";
import { putBulkItemClassifications, putItemClassifications } from "../store/actions/itemClassification.action";
interface ItemClassificationState {
    response: {
        data: any
    }
}

const initialState: ItemClassificationState = {
    response: {
        data: null
    }
};

const itemClassificationSlice = createSlice({
  name: "itemClassification",
  initialState,
  reducers: {
    
  },
  extraReducers : (builder) => {
    builder.addCase(putBulkItemClassifications.fulfilled, (state, action) => {
        state.response.data = action.payload;
    })
    .addCase(putItemClassifications.fulfilled, (state, action) => {
        state.response.data = action.payload;
    })
  }
});

export const {
} = itemClassificationSlice.actions;
export default itemClassificationSlice.reducer;
