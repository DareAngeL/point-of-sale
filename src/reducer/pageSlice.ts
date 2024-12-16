import { createSlice } from "@reduxjs/toolkit";
import { RootState } from "../store/store";
import { ThemeModel } from "../models/theme";
import { getTheme, putTheme } from "../store/actions/utilities/theme.action";


interface PageState {
    isPage : boolean;
    clickPage : boolean;
    theme: ThemeModel
}

const initialState : PageState = {
    isPage : false,
    clickPage : false,
    theme : {
        primarycolor : '#334155', // default
        orderingbtnscolor: '#1d4ed8' // default
    }
}

const pageSlice = createSlice({
    name : 'page',
    initialState,
    reducers : {
        isPage : (state, action) =>{
            const {isPage} = action.payload;
            state.isPage = isPage;
        },
        setClickPage : (state, action) => {
            const {clickPage} = action.payload;
            state.clickPage = clickPage;
        },
        setTheme : (state, action) => {
            const {primaryColor, orderingBtnsColor} = action.payload;
            state.theme.primarycolor = primaryColor;
            state.theme.orderingbtnscolor = orderingBtnsColor;
        }
    },
    extraReducers : (builder) => {
      builder.addCase(getTheme.fulfilled, (state, action) => {
        if (action.payload === null) return;
        if (!action.payload.primarycolor || !action.payload.orderingbtnscolor) return;

        state.theme = action.payload;
      }),
      builder.addCase(putTheme.fulfilled, (state, action) => {
        if (action.payload === null) return;
        if (!action.payload.primarycolor || !action.payload.orderingbtnscolor) return;

        state.theme = action.payload;
      })
    }
})

export const {isPage, setClickPage, setTheme} = pageSlice.actions;
export const selectPage = (state : RootState) => state.page;
export default pageSlice.reducer;