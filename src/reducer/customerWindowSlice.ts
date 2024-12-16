import { createSlice } from "@reduxjs/toolkit";

export interface ICustomerWindow {
  welcome_title: string;
  welcome_desc: string;
  txt_banner: string;
  ads_path: string;
  carousel_time_interval: number;
}

interface CustomerWindowState {
  customerwindowsetup: {
    data: ICustomerWindow;
  };
}

const initialState: CustomerWindowState = {
  customerwindowsetup: {
    data: {
      welcome_title: "Welcome back!",
      welcome_desc: "Let\'s make today a great day.",
      txt_banner: "Your banner here",
      ads_path: "",
      carousel_time_interval: 2000,
    },
  },
};

const customerWindowSlice = createSlice({
  name: "customerwindow",
  initialState,
  reducers: {
    setCustomerWindow: (state, action) => {
      state.customerwindowsetup.data = action.payload;
    },
  },
});

export const { setCustomerWindow } = customerWindowSlice.actions;
export default customerWindowSlice.reducer;