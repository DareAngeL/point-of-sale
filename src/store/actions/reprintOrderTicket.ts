import { createAsyncThunk } from "@reduxjs/toolkit";
import { ApiService } from "../../services";

export const getPosfileTotalTransaction = createAsyncThunk(
  "posfile/total",
  async (page: { limit: number; offset: number }) => {
    try {
      const response = await ApiService.get(
        `posfile/total-transaction?limit=${page.limit}&offset=${page.offset}`
      );
      console.log("responde", response);
      return response.data;
    } catch (error) {
      console.error("Error fetching total transaction:", error);
      throw error;
    }
  }
);
