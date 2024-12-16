import { createAsyncThunk } from "@reduxjs/toolkit";
import { ApiService } from "../../services";

export const getActiveTransaction = createAsyncThunk(
  "ordering/active",
  async () => {
    try {
      const response = await ApiService.get("transaction/active");
      return response.data;
    } catch (error) {
      console.error(error);
      throw error;
    }
  }
);

export const getTransactions = createAsyncThunk(
  "service/transaction",
  async () => {
    try {
      const response = await ApiService.get("transaction/");
      console.log(response);
      return response.data;
    } catch (error) {
      console.error(error);
      throw error;
    }
  }
);

export const getAllActiveHoldTransactions = createAsyncThunk(
  "service/transaction/all",
  async () => {
    try {
      const response = await ApiService.get("transaction/allActiveHold");
      return response.data;
    } catch (error) {
      console.error(error);
      throw error;
    }
  }
);

export const manualCloseTransaction = createAsyncThunk(
  "service/transaction/manualClose",
  async (tabletrncde: any) => {
    try {
      const response = await ApiService.post(
        `transaction/manual_close/${tabletrncde}`,
        {}
      );
      return response.data;
    } catch (error) {
      console.error(error);
      throw error;
    }
  }
);

export const savePaxTran = createAsyncThunk(
  "service/transaction/savePax",
  async (data: any) => {
    try {
      const response = await ApiService.post("transaction/change_pax", data);
      return response.data;
    } catch (error) {
      console.error(error);
      throw error;
    }
  }
);
