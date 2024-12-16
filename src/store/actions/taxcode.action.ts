import { createAsyncThunk } from "@reduxjs/toolkit";
import { ApiService } from "../../services";

export const getTaxCode = createAsyncThunk("service/taxcode", async () => {
  try {
    const response = await ApiService.get("taxcode");
    return response.data;
  } catch (error) {
    console.error(error);
    throw error;
  }
});
