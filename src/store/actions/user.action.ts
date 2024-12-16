import { createAsyncThunk } from "@reduxjs/toolkit";
import { ApiService } from "../../services";

export const login = createAsyncThunk(
  "service/login",
  async (user: {
    swipeCard?: { cardno: string; cardholder: string };
    usrcde?: string;
    usrpwd?: string;
  }) => {
    try {
      const response = await ApiService.post("userfile/login", user);
      return response.data;
    } catch (error) {
      console.error(error);
      throw error;
    }
  }
);

export const getUserAccess = createAsyncThunk(
  "userFile/filter",
  async (params: { [index: string]: any }) => {
    try {
      const response = await ApiService.getAll("useraccess/filter", {
        params: params,
      });
      return response.data;
    } catch (error) {
      console.error(error);
      throw error;
    }
  }
);
