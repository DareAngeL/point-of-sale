import { createSlice } from "@reduxjs/toolkit";
import { Userfile } from "../models/userfile";
import { toast } from "react-toastify";
import { login, getUserAccess } from "../store/actions/user.action";
interface AccountState {
  account: {
    data: Userfile | null;
    isLoaded: boolean;
    isLoggedIn: boolean;
  };
  useraccessfiles: [];
  bypassSecCode: boolean;
  allowAccess: boolean; // this is for the user to access the system; need to check the db structure first before allowing the user to access the system.
}

const initialState: AccountState = {
  account: {
    data: {
      approver: 0,
      email: "",
      prntrange: 0,
      usrcde: "",
      usrname: "",
      usrpwd: "",
      usrtyp: "",
      cardholder: "",
      cardno: "",
      receive_zreading: "",
    },
    isLoaded: false,
    isLoggedIn: false,
  },
  useraccessfiles: [],
  bypassSecCode: true,
  allowAccess: false
};

const orderingSlice = createSlice({
  name: "ordering",
  initialState,
  reducers: {
    setAllowAccess: (state, action) => {
      state.allowAccess = action.payload;
    },
    setAccount: (state, action) => {
      const data = action.payload;
      state.account.data = data.payload;
      state.account.isLoaded = data.isLoaded;
      state.account.isLoggedIn = data.isLoggedIn;
    },
    setBypassSecCode: (state, action) => {
      state.bypassSecCode = action.payload;
    },
    setUserAccess: (state, action) => {
      state.useraccessfiles = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(login.fulfilled, (state, action) => {
        state.account.data = action.payload;
        state.useraccessfiles = action.payload.useraccessfiles;
        state.account.isLoaded = true;
        state.account.isLoggedIn = true;

        const x = { payload: action.payload, isLoaded: true, isLoggedIn: true };

        console.log(x);

        sessionStorage.setItem("account", JSON.stringify(x));
      })
      .addCase(login.rejected, (state, action) => {
        state.account.isLoggedIn = false;
        state.account.isLoaded = false;

        console.log("action: ", action);

        toast.error("Invalid credentials!", {
          toastId: "wrong-usernamepass",
          position: "top-center",
          hideProgressBar: true,
        });
      })
      .addCase(getUserAccess.fulfilled, (state, action) => {
        state.useraccessfiles = action.payload;
      });
  },
});

export const { setAccount, setUserAccess, setAllowAccess } =
  orderingSlice.actions;
export default orderingSlice.reducer;
