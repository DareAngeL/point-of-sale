import { createAsyncThunk } from "@reduxjs/toolkit";
import { ApiService } from "../../services";

export const getVoidReason = createAsyncThunk(
  "service/voidreason",
  async () => {
    try {
      const response = await ApiService.get("voidreason");
      return response.data;
    } catch (error) {
      console.error("Error fetching void reason:", error);
      throw error;
    }
  }
);

export const getFreeReason = createAsyncThunk(
  "service/freereason",
  async () => {
    try {
      const response = await ApiService.get("freereason");
      return response.data;
    } catch (error) {
      console.error("Error fetching free reason:", error);
      throw error;
    }
  }
);

export const getCashIOReason = createAsyncThunk(
  "service/cashioreason",
  async () => {
    try {
      const response = await ApiService.get("cashioreason");
      return response.data;
    } catch (error) {
      console.error("Error fetching cash IO reason:", error);
      throw error;
    }
  }
);
