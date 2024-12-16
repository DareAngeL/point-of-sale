import { createAsyncThunk } from "@reduxjs/toolkit";
import { ApiService } from "../../services";

export const getTerminals = createAsyncThunk("service/fetchdata", async () => {
  try {
    const response = await ApiService.get("terminal");
    return response.data;
  } catch (error) {
    console.error(error);
    throw error;
  }
});
