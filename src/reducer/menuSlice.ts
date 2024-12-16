import {createSlice} from "@reduxjs/toolkit";
import { Menus } from "../models/menus";
import { getMenusMasterfile } from "../store/actions/menus.action";

interface MenuState {
  masterfileMenu: {
    data: Menus[];
    isLoaded: boolean;
  };
  

}

const initialState: MenuState = {
    masterfileMenu: {
        data: [],
        isLoaded: false,
    },
};

const menuSlice = createSlice({
  name: "menu",
  initialState,
  reducers: {
    // setServiceChargeDiscount: (state, action) => {
    //   state.serviceChargeDiscount.data = action.payload;
    // },
    setMasterfileMenu: (state, action) => {
      state.masterfileMenu.data = action.payload;
      state.masterfileMenu.isLoaded = true;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(getMenusMasterfile.fulfilled, (state, action) => {
        console.log("Menu pareh", action.payload);
        state.masterfileMenu.data = action.payload;
        state.masterfileMenu.isLoaded = true;
      })
  },
});

export const {
  setMasterfileMenu,
  // setServiceChargeDiscount,
} = menuSlice.actions;
export default menuSlice.reducer;
