import { createAsyncThunk } from "@reduxjs/toolkit";
import { ApiService } from "../../services";

export const getWarehouse = createAsyncThunk("service/warehouse", async () => {
  try {
    const response = await ApiService.get("warehouse/join");
    return response.data;
  } catch (error) {
    console.error(error);
    throw error;
  }
});
